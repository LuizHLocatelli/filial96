const fs = require('fs');
const path = './supabase/functions/gemini-assistant-chat/index.ts';
let code = fs.readFileSync(path, 'utf8');

const targetStr = 'let finalSystemMessage = systemMessage + "\\n\\n" + imageInstruction;';
const newStr = `
    const now = new Date();
    const brazilDateStr = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }).format(now);

    const systemContext = \`
[CONTEXTO DO SISTEMA]
A data e hora atual no Brasil (fuso horário de Brasília) é: \${brazilDateStr}.
Use esta data como referência para qualquer pergunta temporal ou sobre eventos recentes/notícias.
\`;

    let finalSystemMessage = systemMessage + "\\n\\n" + imageInstruction + "\\n" + systemContext;
`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync(path, code);
    console.log("Patch applied.");
} else {
    console.log("Target string not found.");
}
