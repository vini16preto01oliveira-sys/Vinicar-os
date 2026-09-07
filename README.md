# Vinicar Auto Center - Sistema de OS

Primeira versão funcional em React + Vite.

## O que já funciona
- Login simples local
- Dashboard
- Cadastro de clientes
- Cadastro de veículos
- Entrada de veículo abrindo OS automaticamente
- Controle de status da OS
- Peças e mão de obra com cálculo automático
- Saída/entrega de veículo
- Pesquisa
- Impressão / salvar como PDF pelo navegador
- Botão de WhatsApp
- Dados salvos no navegador com localStorage
- Layout responsivo para celular e computador

## Rodar no computador
```bash
npm install
npm run dev
```

## Publicar no Netlify
O projeto já inclui `netlify.toml`.
Ao conectar o repositório GitHub, o Netlify executará:
- Build command: `npm run build`
- Publish directory: `dist`

## Próxima etapa recomendada
Adicionar Firebase Authentication + Firestore para login real, dados na nuvem e uso em vários aparelhos.
