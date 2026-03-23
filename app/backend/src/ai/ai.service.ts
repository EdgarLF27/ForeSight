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
      console.warn(
        "AiService: El servicio de IA no se inició por falta de API Key.",
      );
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
      console.log("AiService: Iniciando análisis con gemini-1.5-flash");
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log("AiService: Respuesta recibida:", text);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (error) {
      console.warn(
        "AiService Flash Error, intentando con gemini-1.5-pro:",
        error.message,
      );
      try {
        const fallbackModel = this.genAI.getGenerativeModel({
          model: "gemini-1.5-pro",
        });
        const result = await fallbackModel.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch (e) {
        console.error("AiService Error Fatal:", e.message);
        return null;
      }
    }
  }

  async predictResolutionTime(newTicket: any, history: any[]) {
    if (!this.genAI) return null;

    // Formatear el historial para que la IA aprenda
    const historyText =
      history.length > 0
        ? history
            .map((t) => {
              const start = new Date(t.createdAt).getTime();
              const end = new Date(t.resolvedAt).getTime();
              const mins = Math.round((end - start) / (1000 * 60));
              return `- Desc: "${t.description.substring(0, 100)}" | Tiempo: ${mins} min | Prioridad: ${t.priority}`;
            })
            .join("\n")
        : "No hay historial previo para esta empresa.";

    const aiPrompt = `
      Eres un experto en estimación de tiempos de soporte técnico.
      Basándote en este historial de casos resueltos:
      ${historyText}

      Predice cuánto tardará el siguiente caso NUEVO:
      Título: "${newTicket.title}"
      Descripción: "${newTicket.description}"
      Prioridad: "${newTicket.priority}"

      Responde ÚNICAMENTE un objeto JSON:
      {
        "estimatedMinutes": número entero,
        "confidence": número 0 a 1,
        "reasoning": "Explicación breve de 15 palabras"
      }
    `;

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-flash-latest",
      });
      const result = await model.generateContent(aiPrompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("AiService Prediction Error:", e.message);
      return null;
    }
  }
}
