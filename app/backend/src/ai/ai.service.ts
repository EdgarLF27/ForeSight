import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

@Injectable()
export class AiService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService
      .get<string>("GEMINI_API_KEY")
      ?.replace(/['"]/g, "")
      .trim();
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async onModuleInit() {
    if (!this.genAI) {
      console.warn("AiService: El servicio de IA no se inició por falta de API Key.");
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
      console.log('AiService: Iniciando análisis con gemini-1.5-flash');
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log('AiService: Respuesta recibida:', text);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (error) {
      console.warn('AiService Flash Error, intentando con gemini-1.5-pro:', error.message);
      try {
        const fallbackModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await fallbackModel.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch (e) {
        console.error('AiService Error Fatal:', e.message);
        return null;
      }
    }
  }

  async predictResolutionTime(newTicket: any, history: any[]) {
    if (!this.genAI) return null;

    // ... (resto del código igual pero con modelo actualizado)
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error('AiService Prediction Error:', e.message);
      return null;
    }
  }
}
