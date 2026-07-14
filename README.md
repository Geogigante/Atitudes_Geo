# AtitudesGeo - Conversor de Atitudes Geológicas

Aplicação web para conversão de atitudes geológicas entre diferentes sistemas de notação utilizados em Geologia Estrutural, Geotecnia, Mineração, Hidrogeologia e Mapeamento Geológico.

A ferramenta permite converter dados estruturais entre:

- **Dip / Dip Direction**
- **Strike / Dip**
- **Quadrante**
- **Azimute**
- **Regra da Mão Direita (Right Hand Rule - RHR)**

Além da conversão, a aplicação permite:

- importar planilhas Excel (`.xlsx` e `.xls`)
- mapear colunas manualmente
- visualizar resultados convertidos
- identificar erros de parsing
- exportar uma nova planilha com os dados convertidos
- consultar explicações conceituais sobre cada sistema de notação

Ideal para geólogos, geotécnicos, hidrogeólogos, profissionais de mineração, estudantes e pesquisadores em Geociências.

---

## English

AtitudesGeo is a web application for converting geological structural measurements between Strike/Dip, Dip Direction, Quadrant Notation and Right Hand Rule (RHR), including Excel spreadsheet import and export capabilities.

---

## 📌 Visão Geral

O projeto foi desenvolvido em **HTML, CSS e JavaScript puro (Vanilla JavaScript)**, com foco em:

- simplicidade de uso
- clareza visual
- separação entre interface, lógica de conversão e processamento de planilhas
- abordagem educacional para entendimento das atitudes geológicas

A leitura e a exportação das planilhas são realizadas utilizando a biblioteca **SheetJS (XLSX)**.

---

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- SheetJS (XLSX)

---

## 🔒 Privacidade dos Dados

Esta aplicação executa **inteiramente no navegador do usuário**.

As planilhas importadas são lidas e processadas localmente na própria máquina, sem envio de informações para servidores externos.

A aplicação:

- não possui backend
- não utiliza banco de dados
- não coleta informações do usuário
- não compartilha arquivos ou registros de uso

Após o carregamento inicial da página, a ferramenta pode ser utilizada inclusive de forma **offline**.

Essa abordagem torna a aplicação adequada para utilização com dados confidenciais de projetos, tais como informações de sondagens, mapeamentos geológicos, levantamentos estruturais e bases de dados geotécnicas.

---

## 🧭 Sistemas Suportados

### 1. Dip / Dip Direction
Representa diretamente:

- **dip** = ângulo de mergulho
- **dip direction** = direção do mergulho em azimute

Exemplo:
45 / 120

### 2. Azimute
Representa:

- **strike em azimute**
- **dip**
Exemplo:
030 / 45

### 3. Regra da Mão Direita (RHR)
Usa o strike orientado segundo a convenção da mão direita.

Exemplo:
030 / 45

Nesta aplicação, RHR e Azimute compartilham a mesma base numérica para strike/dip.
A principal diferença tratada aqui é conceitual.

### 4. Quadrante
Representa:

- **strike em quadrante**
- **dip + quadrante do mergulho**
Exemplo:
N30E / 45SE

## 🖥️ Funcionalidades

- Seleção do sistema de origem
- Seleção do sistema de destino
- Conversão individual de atitudes geológicas
- Importação de planilhas Excel (.xlsx e .xls)
- Identificação automática das colunas disponíveis
- Mapeamento manual das colunas de strike/direção e dip
- Definição da linha inicial dos dados
- Conversão automática de registros em lote
- Exibição dos resultados em painel visual
- Identificação de erros de leitura e formatação
- Exportação dos resultados para arquivo Excel
- Inclusão de colunas adicionais convertidas
- Conteúdo educacional sobre os sistemas de notação suportados

## 🚀 Como usar

1. Abra a aplicação.
2. Selecione o sistema de origem.
3. Selecione o sistema de destino.
4. Importe a planilha Excel (opcional).
5. Associe as colunas de direção e mergulho.
6. Execute a conversão.
7. Revise os resultados.
8. Exporte uma nova planilha com os dados convertidos.

## 🎯 Aplicações

A ferramenta pode ser utilizada em atividades relacionadas a:

- Geologia Estrutural
- Geotecnia
- Mineração
- Hidrogeologia
- Engenharia Geológica
- Mapeamento Geológico
- Levantamentos de Campo
- Processamento de Dados de Sondagens
- Banco de Dados Geológicos
- Controle Tecnológico e Geotécnico

## Keywords

- Geology
- Geological Attitudes
- Structural Geology
- Engineering Geology
- Geotechnical Engineering
- Mining Geology
- Hydrogeology
- Strike and Dip
- Dip Direction
- Right Hand Rule
- Geological Compass
- Brunton Compass
- Structural Measurements
- Geological Mapping
- Rock Discontinuities
- Structural Data
- Geological Database
- Geotechnical Database
- Excel Import
- Excel Export
- XLSX Processing
- Structural Data Processing
- Geological Data Conversion
- Strike Dip Converter
- Dip Direction Converter

## 📄 Licença

Este projeto está licenciado sob a MIT License.

Você pode utilizar, modificar, distribuir e incorporar este código em projetos próprios, desde que seja mantido o aviso de copyright original.

Consulte o arquivo LICENSE para mais detalhes.


## Autor

### Edemar Muller

Geólogo com experiência em:

- Geologia Estrutural
- Geotecnia
- Mineração
- Barragens
- Hidrelétricas
- Modelagem Geológica
- Banco de Dados Geológicos

LinkedIn:
[Geólogo Edemar Muller](https://www.linkedin.com/in/geologo-edemar-muller)

GitHub:
[Geogigante](https://github.com/Geogigante)
