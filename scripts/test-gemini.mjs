import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const candidateModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];

async function testModels() {
  for (const model of candidateModels) {
    try {
      console.log(`Testing model: ${model}...`);
      const res = await ai.models.generateContent({
        model,
        contents: 'Respond with {"status": "ok", "model": "' + model + '"}',
        config: { responseMimeType: 'application/json' }
      });
      console.log(`SUCCESS for ${model}! Response:`, res.text);
      return model;
    } catch (err) {
      console.log(`Failed for ${model}:`, err.message || err);
    }
  }
}

testModels();
