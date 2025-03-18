# CSV Import - Plugin para Figma

Plugin para importar dados de times de futebol de arquivos Excel/CSV para o Figma, criando cards automáticos.

## Sobre o projeto

Este plugin permite importar dados de planilhas Excel/XLSX contendo informações sobre times de futebol e automaticamente criar cards visuais no Figma para cada time.

## Funcionalidades

- Importação de dados de planilhas Excel/XLSX
- Interface amigável para seleção de arquivos
- Geração automática de cards no Figma
- Suporte a diferentes campos de dados (Nome, Cidade, Fundação, Títulos)

## Estrutura esperada da planilha

O plugin espera que a planilha contenha as seguintes colunas:
- Nome: Nome do time de futebol
- Cidade: Cidade do time
- Fundacao: Ano de fundação do time
- Titulos: Número de títulos conquistados

## Como usar

1. Instale o plugin no Figma
2. Abra o plugin no Figma através do menu "Plugins" > "CSV Import - Times de Futebol"
3. Selecione seu arquivo Excel/XLSX usando o botão de seleção de arquivo
4. Clique em "Importar Dados" para criar os cards no seu documento do Figma
5. Os cards serão criados dentro de um frame principal

## Desenvolvimento

### Requisitos

- Node.js
- npm
- Figma Desktop

### Instalação para desenvolvimento

1. Clone o repositório:
   ```
   git clone https://github.com/caiorcastro/Figma-CSV-Import.git
   cd Figma-CSV-Import
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Compile o plugin:
   ```
   npm run build
   ```

4. Para desenvolvimento contínuo com hot-reload:
   ```
   npm run dev
   ```

### Carregando o plugin no Figma

1. Abra o Figma Desktop
2. Vá para "Plugins" > "Development" > "Import plugin from manifest..."
3. Selecione o arquivo `manifest.json` deste projeto
4. O plugin agora está disponível no menu "Plugins" > "Development"

## Tecnologias utilizadas

- TypeScript
- Figma Plugin API
- SheetJS (xlsx) para manipulação de arquivos Excel
- Rollup para bundle
