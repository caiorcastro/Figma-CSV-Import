import * as XLSX from "xlsx";

// Função para abrir a UI do plugin
figma.showUI(__html__, { width: 450, height: 450 });

// Mensagem para a UI quando o plugin iniciar
figma.ui.postMessage({ type: 'init' });

// Manipula as mensagens da UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'importar-dados') {
    try {
      // Os dados vêm da UI depois que o usuário carrega o arquivo
      const dados = msg.dados;
      
      if (!dados || dados.length === 0) {
        throw new Error("Não foram encontrados dados válidos na planilha.");
      }
      
      // Criar um frame para conter os cards
      const frame = figma.createFrame();
      frame.name = "Times de Futebol";
      frame.resize(800, 600);
      frame.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
      
      // Carregar uma fonte para usar nos textos
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      
      // Posição inicial para o primeiro card
      let yPosition = 20;
      
      // Criar um card para cada time
      for (const time of dados) {
        // Criar o card
        const card = figma.createFrame();
        card.name = `Time: ${time.Nome || 'Sem nome'}`;
        card.resize(300, 150);
        card.x = 20;
        card.y = yPosition;
        card.cornerRadius = 8;
        card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        
        // Adicionar textos ao card
        const nomeText = figma.createText();
        nomeText.fontName = { family: "Inter", style: "Bold" };
        nomeText.fontSize = 16;
        nomeText.x = 16;
        nomeText.y = 16;
        nomeText.characters = `${time.Nome || 'Sem nome'}`;
        
        const descricaoText = figma.createText();
        descricaoText.fontName = { family: "Inter", style: "Regular" };
        descricaoText.fontSize = 12;
        descricaoText.x = 16;
        descricaoText.y = 44;
        descricaoText.characters = `Cidade: ${time.Cidade || 'N/A'}\nFundação: ${time.Fundacao || 'N/A'}\nTítulos: ${time.Titulos || '0'}`;
        
        // Adicionar os textos ao card
        card.appendChild(nomeText);
        card.appendChild(descricaoText);
        
        // Adicionar o card ao frame principal
        frame.appendChild(card);
        
        // Atualizar a posição Y para o próximo card
        yPosition += 170;
      }
      
      // Ajustar o tamanho do frame principal de acordo com o conteúdo
      frame.resize(800, yPosition);
      
      // Notificar a UI que a importação foi concluída
      figma.ui.postMessage({ 
        type: 'importacao-concluida', 
        mensagem: `Foram importados ${dados.length} times de futebol com sucesso!` 
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
