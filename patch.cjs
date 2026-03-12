const fs = require('fs');
const path = './supabase/functions/gemini-assistant-chat/index.ts';
let code = fs.readFileSync(path, 'utf8');

// Remove the unconditional push
code = code.replace(`
    // Track web search
    if (webSearchEnabled) {
      activatedTools.push("web_search");
    }`, `
    // Web search is tracked dynamically when grounding chunks appear`);

// Add to non-streaming mode
code = code.replace(`
      if (groundingMetadata?.groundingChunks?.length > 0) {
        generatedText += "\\n\\n---\\n**Fontes:**\\n";`, `
      if (groundingMetadata?.groundingChunks?.length > 0) {
        activatedTools.push("web_search");
        generatedText += "\\n\\n---\\n**Fontes:**\\n";`);

// Add to streaming mode
code = code.replace(`
                const gm = parsed.candidates?.[0]?.groundingMetadata;
                if (gm?.groundingChunks) {
                  for (const chunk of gm.groundingChunks) {`, `
                const gm = parsed.candidates?.[0]?.groundingMetadata;
                if (gm?.groundingChunks) {
                  if (!activatedTools.includes("web_search")) {
                    activatedTools.push("web_search");
                    controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ tool: "web_search", status: "active" })}\\n\\n\`));
                  }
                  for (const chunk of gm.groundingChunks) {`);

fs.writeFileSync(path, code);
