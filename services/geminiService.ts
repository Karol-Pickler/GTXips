
import { GoogleGenAI } from "@google/genai";
import { FinancialRecord } from "../types";

/**
 * Creates a fresh instance of the Google GenAI client using the environment's API key.
 */
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Searches for the best product price using Google Search grounding.
 */
export const searchBestPrice = async (productName: string, maxGtx: number, currentQuote: number) => {
  const ai = getAIClient();
  const maxBrl = maxGtx * currentQuote;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Encontre o melhor preço e link de compra para o produto: "${productName}". 
               O orçamento máximo é de R$ ${maxBrl.toFixed(2)} (equivalente a ${maxGtx} GTXips). 
               Retorne o nome da loja, o preço em Reais e o link direto. 
               Seja breve e direto.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text;
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  return {
    text,
    sources: sources || []
  };
};

/**
 * Analyzes financial records to provide strategic insights using Gemini 3 Pro.
 */
export const analyzeFinancialData = async (financial: FinancialRecord[]) => {
  const ai = getAIClient();
  const dataStr = JSON.stringify(financial);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Você é um analista financeiro sênior. Analise os seguintes dados históricos da empresa GTXips e forneça insights sobre a tendência de geração de caixa e valorização da moeda interna: ${dataStr}. 
               Seja direto e use tópicos em Markdown.`,
  });

  return response.text;
};

/**
 * Generates a high-quality icon for rules using Gemini 3 Pro Image.
 */
export const generateRuleIcon = async (prompt: string, imageSize: '1K' | '2K' | '4K' = '1K') => {
  const ai = getAIClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: `Crie um ícone moderno e futurista em estilo neon para um sistema de recompensas corporativo. 
                 Tema do ícone: ${prompt}. 
                 Cores: Verde neon (#39ff14) e detalhes metálicos. 
                 Fundo escuro e limpo.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: imageSize
      }
    }
  });

  // Iterate through parts to find the generated image
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("Nenhuma imagem foi retornada pelo modelo.");
};
