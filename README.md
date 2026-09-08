# Vinicar Auto Center - V5 Firebase

Esta versão mantém as funções atuais e adiciona:
- login por e-mail e senha;
- sincronização de OS, Caixa e Pagamentos Pendentes;
- fotos e assinatura armazenadas no Firebase Storage;
- migração dos dados já existentes no navegador para a nuvem;
- funcionamento entre Safari, Tela de Início e outros aparelhos com o mesmo login.

## Configuração necessária no Firebase
1. Criar um projeto e registrar um aplicativo Web.
2. Ativar Authentication > Email/Password.
3. Criar Cloud Firestore.
4. Ativar Firebase Storage.
5. Publicar as regras dos arquivos firestore.rules e storage.rules.
6. No sistema Vinicar, abrir Nuvem e colar o bloco firebaseConfig.
7. Criar/entrar com a conta da oficina.
8. No aparelho onde estão as OS antigas, clicar "Enviar dados deste aparelho para a nuvem".

O projeto usa Firebase Web SDK 12.18.0 via CDN.
