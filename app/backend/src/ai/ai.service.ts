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
      // Fallback silencioso
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

  async predictResolutionTime(newTicket: any, history: any[]) {
    if (!this.genAI) return null;

    const historyPrompt = history.map(t => {
      const duration = t.resolvedAt ? Math.round((new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()) / 60000) : 0;
      return `Ticket: "${t.title}" | Descripción: "${t.description}" | Duración: ${duration} mins`;
    }).join('\n');

    const prompt = `
      Eres un motor de Predicción de Machine Learning para un sistema de soporte técnico.
      Tu tarea es predecir cuánto tiempo (en MINUTOS) tomará resolver el siguiente ticket basándote en el historial proporcionado.

      HISTORIAL DE TICKETS SIMILARES:
      ${historyPrompt || 'No hay historial disponible todavía.'}

      NUEVO TICKET A PREDECIR:
      Título: "${newTicket.title}"
      Descripción: "${newTicket.description}"
      Prioridad: "${newTicket.priority}"
      Área: "${newTicket.area?.name || 'No asignada'}"

      Responde ÚNICAMENTE con un objeto JSON:
      {
        "estimatedMinutes": número entero,
        "confidence": número entre 0 y 1,
        "reasoning": "Breve explicación de por qué estimaste ese tiempo"
      }
    `;

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      return null;
    }
  }
}
