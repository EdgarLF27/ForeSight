import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')?.replace(/['"]/g, '').trim();
    if (apiKey) {
      // Forzamos el uso de la versión estable v1
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async onModuleInit() {
    if (!this.genAI) {
      console.warn('AiService: GEMINI_API_KEY no configurada.');
    }
  }

  async analyzeTicket(description: string) {
    if (!this.genAI) return null;

    const prompt = `
      Eres un Analista de Soporte Técnico Senior. 
      Analiza esta descripción y responde ÚNICAMENTE con un JSON:
      "${description}"

      {
        "sentiment": "calm" | "frustrated" | "angry",
        "suggestedPriority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        "suggestedArea": "Sistemas" | "Mantenimiento" | "Limpieza" | "Seguridad" | "Otros",
        "summary": "Resumen de 10 palabras",
        "ai_reasoning": "Razonamiento corto"
      }
    `;

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (error) {
      // Fallback silencioso a gemini-pro-latest si el primero falla
      if (error.message.includes('429') || error.message.includes('404')) {
        try {
          const fallbackModel = this.genAI.getGenerativeModel({ model: "gemini-pro-latest" });
          const result = await fallbackModel.generateContent(prompt);
          const text = (await result.response).text();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
          return null;
        }
      }
      return null;
    }
  }
}
