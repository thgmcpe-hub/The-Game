# THE GAME — Capítulo 00 (versão web)

Projeto React + TypeScript + Vite, preparado para publicação via Netlify.

## Publicar e compartilhar um link de testes (Netlify)

1. Crie um repositório GitHub e envie **o conteúdo desta pasta** (não o ZIP inteiro como um único arquivo).
2. No Netlify, escolha **Add new project > Import an existing project > GitHub** e selecione o repositório.
3. Build command: `npm run build` ; Publish directory: `dist` (já configurados em `netlify.toml`).
4. Publique. O Netlify fornecerá uma URL HTTPS para compartilhar com a equipe.
5. Em atualizações posteriores, envie as mudanças para o repositório; o Netlify fará o deploy novamente.

## Rodar localmente

Requer Node.js 22 ou superior, conexão para instalar pacotes:

```sh
npm install
npm run lint
npm run build
npm run dev
```

Acesse `http://localhost:3000` no computador.

## Observações importantes para homologação

- A tela de bateria/USB **não é simulada automaticamente**. O jogo valida WebUSB ou informação de bateria do navegador conforme implementação atual.
- WebUSB requer HTTPS (ou localhost), navegador compatível e, para dispositivos USB, hardware que corresponda à whitelist em `src/game/canonConfig.ts`. Conectar um cabo de alimentação comum não garante que o browser enxergue um dispositivo USB autorizado.
- Em iOS/Safari e outros navegadores sem WebUSB, o desbloqueio pelo hardware físico pode não funcionar. Teste o caminho principal no Chrome/Edge desktop em HTTPS com dispositivo autorizado.
- O painel de homologação já faz parte do código-fonte; utilize-o apenas conforme os controles previstos no próprio jogo.
- Não há dependência de API Gemini nem necessidade de configurar chave de API.

## Arquitetura

- `src/game/`: regras de senha, USB, máquina de estados, persistência, áudio e testes.
- `src/components/`: prólogo, bateria, boot, tela bloqueada, sistema e painel de homologação.
- `src/assets/images/`: recursos utilizados na interface.
- `netlify.toml` + `public/_redirects`: hospedagem e fallback SPA.
