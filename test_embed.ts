const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || process.env.GEMINI_API_KEY;

async function testEmbedding() {
  if (!GEMINI_API_KEY) {
    console.log("No API key available to test.");
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
  const url2 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${GEMINI_API_KEY}`;
  
  const res = await fetch(url2, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-2-preview",
      content: { parts: [{ text: "Hello world" }] },
      taskType: "RETRIEVAL_DOCUMENT",
    })
  });
  const data = await res.json();
  if (data.embedding?.values) {
    console.log("Dimension size:", data.embedding.values.length);
  } else {
    console.log("Error:", data);
  }
}
testEmbedding();
