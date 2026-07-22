# 🎣 PescaBrasil - Interface (UI)

> **Procurando o motor por trás desta interface? [Acesse o repositório da API aqui](https://github.com/patrickpriebe/pesca-brasil-api)**

O PescaBrasil é um sistema full-stack, com arquitetura em camadas e infraestrutura na nuvem. Este repositório contém a **Interface de Usuário**, construída do zero com uma identidade visual focada no Neo-brutalismo para fugir do padrão corporativo.

O projeto nasceu para centralizar a gestão de pescarias (diário de capturas, catálogos de espécies, controle de equipamentos e mapeamento de rios). Ele combina mapas interativos e APIs de clima em uma experiência fluida e imersiva.

**[Acesse o sistema rodando em Produção aqui](https://pescabrasil.vercel.app/)**

---

## 🎨 Arquitetura Front-end e UI/UX

A interface adota o **Neo-brutalismo**: alto contraste, sombras, tipografia marcante e interações responsivas reais.

*   **Angular 18+:** Arquitetura limpa utilizando *Standalone Components* e Reactive Forms.
*   **Tailwind CSS v4:** Estilização moderna com classes utilitárias e CSS global customizado para quebrar os estilos padrões do navegador (como selects e inputs nativos).
*   **Leaflet.js:** Integração profunda com mapas para marcação de pontos de pesca via coordenadas exatas (Lat/Lng) e polígonos geográficos.
*   **Vercel (DevOps):** Hospedagem do Front-end com pipeline de CI/CD configurado para deploys automáticos.

---

## 🎣 Principais Funcionalidades da Interface

1.  **Smart Map:** Interação com o mapa para registrar pontos de pesca, incluindo detecção de localização via GPS do navegador.
2.  **Widget Climático:** Previsão do tempo em tempo real via satélite (`Open-Meteo API`) com ícones customizados, atrelada à coordenada exata do mapa.
3.  **Diário de Troféus:** Formulários reativos para cadastro de capturas com registro de peso, tamanho, isca, equipamento utilizado, condições do local e upload de foto da captura.
4.  **Catálogos Relacionais:** Gestão completa de Peixes, Iscas e Equipamentos com associações dinâmicas.

---

Desenvolvido por: **Patrick**

Desenvolvedor de Software, apaixonado por código limpo, arquitetura backend e interfaces que fogem do comum.

🔗 [LinkedIn](https://www.linkedin.com/in/patrickpriebe/) | 💻 [GitHub](https://github.com/patrickpriebe)
