import * as XLSX from "xlsx";

// Função para abrir a UI do plugin
figma.showUI(__html__, { width: 450, height: 650 });

// Mensagem para a UI quando o plugin iniciar
figma.ui.postMessage({ type: 'init' });

// Função para carregar uma imagem a partir de uma URL
async function carregarImagemDaURL(url: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    figma.ui.postMessage({ 
      type: 'carregar-imagem', 
      url: url 
    });

    // Listener temporário para receber os dados da imagem da UI
    const messageHandler = (event) => {
      const message = event.data.pluginMessage;
      if (message && message.type === 'imagem-carregada' && message.url === url) {
        // Convertendo a string base64 para Uint8Array
        const base64 = message.data.split(',')[1];
        const bytes = atob(base64);
        const buffer = new Uint8Array(bytes.length);
        
        for (let i = 0; i < bytes.length; i++) {
          buffer[i] = bytes.charCodeAt(i);
        }
        
        // Remover o listener para evitar duplicação
        figma.ui.onmessage = originalMessageHandler;
        resolve(buffer);
      } else if (message && message.type === 'erro-carregar-imagem' && message.url === url) {
        // Remover o listener para evitar duplicação
        figma.ui.onmessage = originalMessageHandler;
        reject(new Error(`Falha ao carregar imagem: ${message.erro}`));
      }
    };
    
    // Guardar o handler original
    const originalMessageHandler = figma.ui.onmessage;
    
    // Definir temporariamente o novo handler
    figma.ui.onmessage = messageHandler;
  });
}

// Salvar o handler de mensagem original
const originalMessageHandler = figma.ui.onmessage;

// Manipula as mensagens da UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'importar-dados') {
    try {
      // Os dados vêm da UI depois que o usuário carrega o arquivo
      const dados = msg.dados;
      const baseURL = msg.baseURL || ''; // URL base para as imagens
      
      if (!dados || dados.length === 0) {
        throw new Error("Não foram encontrados dados válidos na planilha.");
      }
      
      // Notificar a UI sobre o progresso
      figma.ui.postMessage({ 
        type: 'progresso', 
        mensagem: `Processando ${dados.length} jogos...` 
      });
      
      // Verificar se há pelo menos um frame selecionado para usar como template
      if (figma.currentPage.selection.length === 0) {
        throw new Error("Por favor, selecione um frame para usar como template.");
      }
      
      // Obter o frame selecionado como template
      const frameTemplate = figma.currentPage.selection[0];
      if (frameTemplate.type !== "FRAME") {
        throw new Error("A seleção não é um frame. Por favor, selecione um frame.");
      }
      
      // Carregar fontes
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      
      // Criar um frame principal para conter os posts
      const containerFrame = figma.createFrame();
      containerFrame.name = "Posts de Jogos de Futebol";
      containerFrame.layoutMode = "VERTICAL";
      containerFrame.primaryAxisSizingMode = "AUTO";
      containerFrame.counterAxisSizingMode = "AUTO";
      containerFrame.itemSpacing = 20;
      containerFrame.paddingTop = 20;
      containerFrame.paddingRight = 20;
      containerFrame.paddingBottom = 20;
      containerFrame.paddingLeft = 20;
      containerFrame.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
      
      // Processar cada linha de dados da planilha
      for (let i = 0; i < dados.length; i++) {
        const jogo = dados[i];
        
        // Notificar progresso
        figma.ui.postMessage({ 
          type: 'progresso', 
          mensagem: `Processando jogo ${i+1} de ${dados.length}...` 
        });
        
        // Clonar o frame template
        const gameFrame = frameTemplate.clone();
        gameFrame.name = `${jogo["Nome do Campeonato"]} - ${jogo["Time A"]} vs ${jogo["Time B"]}`;
        
        // Função recursiva para encontrar e substituir nós com base no nome
        async function processarNos(node) {
          // Se o nó tem filhos, processar recursivamente
          if ("children" in node) {
            for (const child of node.children) {
              await processarNos(child);
            }
          }
          
          // Verificar o nome do nó e substituir conforme necessário
          if (node.name === "Time A" && "characters" in node) {
            await figma.loadFontAsync(node.fontName);
            node.characters = jogo["Time A"] || "";
          }
          else if (node.name === "Time B" && "characters" in node) {
            await figma.loadFontAsync(node.fontName);
            node.characters = jogo["Time B"] || "";
          }
          else if (node.name === "Odd A" && "characters" in node) {
            await figma.loadFontAsync(node.fontName);
            node.characters = jogo["Odd A"]?.toString() || "";
          }
          else if (node.name === "Odd B" && "characters" in node) {
            await figma.loadFontAsync(node.fontName);
            node.characters = jogo["Odd B"]?.toString() || "";
          }
          else if (node.name === "Odd Empate" && "characters" in node) {
            await figma.loadFontAsync(node.fontName);
            node.characters = jogo["Odd Empate"]?.toString() || "";
          }
          else if (node.name === "Campeonato" && "characters" in node) {
            await figma.loadFontAsync(node.fontName);
            node.characters = jogo["Nome do Campeonato"] || "";
          }
          else if (node.name === "Data" && "characters" in node) {
            await figma.loadFontAsync(node.fontName);
            // Formatar a data (assumindo formato ISO)
            const dataOriginal = jogo["Data"] || "";
            if (dataOriginal) {
              try {
                const data = new Date(dataOriginal);
                const dia = data.getDate().toString().padStart(2, '0');
                const mes = (data.getMonth() + 1).toString().padStart(2, '0');
                node.characters = `${dia}/${mes}`;
              } catch (e) {
                node.characters = dataOriginal;
              }
            }
          }
          else if (node.name === "Hora" && "characters" in node) {
            await figma.loadFontAsync(node.fontName);
            // Pegar apenas a parte da hora se for um datetime
            const horaOriginal = jogo["Hora"] || "";
            if (horaOriginal && horaOriginal.includes(":")) {
              const partes = horaOriginal.split(":");
              node.characters = `${partes[0]}:${partes[1]}`;
            } else {
              node.characters = horaOriginal;
            }
          }
          // Se for um "placeholder" de imagem que deve ser substituído por uma imagem real
          else if (node.name === "Imagem Time A" && node.type === "RECTANGLE") {
            try {
              const caminhoImagem = jogo["A 300x300"] || "";
              if (caminhoImagem && baseURL) {
                // Combinar URL base com o caminho da imagem
                const imageUrl = `${baseURL}${caminhoImagem}`;
                
                // Notificar progresso
                figma.ui.postMessage({ 
                  type: 'progresso', 
                  mensagem: `Carregando imagem ${imageUrl}...` 
                });
                
                // Carregar imagem da URL
                try {
                  const imageData = await carregarImagemDaURL(imageUrl);
                  
                  // Criar imagem no Figma
                  const imagem = figma.createImage(imageData);
                  
                  // Substituir o preenchimento do retângulo pela imagem
                  node.fills = [
                    {
                      type: 'IMAGE',
                      scaleMode: 'FILL',
                      imageHash: imagem.hash
                    }
                  ];
                  
                  // Manter o nome do nó para rastreabilidade
                  node.name = `Imagem Time A - ${caminhoImagem}`;
                } catch (error) {
                  console.error(`Erro ao carregar imagem ${imageUrl}:`, error);
                  // Manter o retângulo, mas marcar com erro
                  node.name = `Imagem Time A - ERRO: ${caminhoImagem}`;
                }
              } else {
                // Se não tiver URL base ou caminho da imagem, apenas renomear
                node.name = `Imagem Time A - ${caminhoImagem}`;
              }
            } catch (error) {
              console.error("Erro ao processar imagem do Time A:", error);
            }
          }
          else if (node.name === "Imagem Time B" && node.type === "RECTANGLE") {
            try {
              const caminhoImagem = jogo["B 300x300"] || "";
              if (caminhoImagem && baseURL) {
                // Combinar URL base com o caminho da imagem
                const imageUrl = `${baseURL}${caminhoImagem}`;
                
                // Notificar progresso
                figma.ui.postMessage({ 
                  type: 'progresso', 
                  mensagem: `Carregando imagem ${imageUrl}...` 
                });
                
                // Carregar imagem da URL
                try {
                  const imageData = await carregarImagemDaURL(imageUrl);
                  
                  // Criar imagem no Figma
                  const imagem = figma.createImage(imageData);
                  
                  // Substituir o preenchimento do retângulo pela imagem
                  node.fills = [
                    {
                      type: 'IMAGE',
                      scaleMode: 'FILL',
                      imageHash: imagem.hash
                    }
                  ];
                  
                  // Manter o nome do nó para rastreabilidade
                  node.name = `Imagem Time B - ${caminhoImagem}`;
                } catch (error) {
                  console.error(`Erro ao carregar imagem ${imageUrl}:`, error);
                  // Manter o retângulo, mas marcar com erro
                  node.name = `Imagem Time B - ERRO: ${caminhoImagem}`;
                }
              } else {
                // Se não tiver URL base ou caminho da imagem, apenas renomear
                node.name = `Imagem Time B - ${caminhoImagem}`;
              }
            } catch (error) {
              console.error("Erro ao processar imagem do Time B:", error);
            }
          }
        }
        
        // Processar os nós do frame clonado
        await processarNos(gameFrame);
        
        // Adicionar o frame ao container
        containerFrame.appendChild(gameFrame);
      }
      
      // Ajustar o container
      containerFrame.resize(
        frameTemplate.width + 40,  // Adicionar margem
        (frameTemplate.height * dados.length) + (20 * (dados.length + 1))  // Altura + espaçamento
      );
      
      // Colocar o container em uma posição visível
      containerFrame.x = frameTemplate.x + frameTemplate.width + 100;
      containerFrame.y = frameTemplate.y;
      
      // Selecionar o container
      figma.currentPage.selection = [containerFrame];
      figma.viewport.scrollAndZoomIntoView([containerFrame]);
      
      // Notificar a UI que a importação foi concluída
      figma.ui.postMessage({ 
        type: 'importacao-concluida', 
        mensagem: `Foram importados ${dados.length} jogos de futebol com sucesso!` 
      });
      
    } catch (error) {
      // Notificar a UI se houver algum erro
      figma.ui.postMessage({ 
        type: 'erro', 
        mensagem: `Erro ao importar dados: ${error.message}` 
      });
    }
  } else if (msg.type === 'fechar') {
    figma.closePlugin();
  }
};
