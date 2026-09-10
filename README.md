# Vinicar OS V7

Alterações:
- Corrigido o botão do WhatsApp ao colocar uma OS como Pronto: agora abre o WhatsApp na mesma aba, evitando bloqueio de pop-up do iPhone/iPad.
- Pagamentos Pendentes agora têm campo WhatsApp.
- Botão Cobrar ao lado de Receber.
- A cobrança abre o WhatsApp com mensagem pronta, valor, vencimento e PIX.
- No dia do vencimento, ao abrir o sistema, aparece um aviso automático informando quantas cobranças vencem naquele dia.
- Pagamentos vencidos ficam sinalizados como Cobrar.
- Mantém Firestore, PIX, Entregues e impressão compacta.

Observação: navegadores não podem enviar uma mensagem de WhatsApp automaticamente sem ação do usuário. Para envio 100% automático em horário programado é necessária integração oficial com a WhatsApp Business Platform/API e um backend.
