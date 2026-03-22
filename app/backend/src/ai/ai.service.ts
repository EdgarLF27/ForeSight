import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')?.replace(/['"]/g, '').trim();
    if (apiKey) {
      console.log('AiService: Inicializando con API Key detectada.');
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      console.error('AiService: GEMINI_API_KEY no encontrada en el entorno.');
    }
  }

  async onModuleInit() {
    if (!this.genAI) {
      console.warn('AiService: El servicio de IA no se inició correctamente por falta de API Key.');
    }
  }

  async analyzeTicket(description: string) {
    if (!this.genAI) return null;

    const prompt = `
      Eres un Analista de Soporte Técnico Senior. 
      Analiza la descripción de este ticket y responde ÚNICAMENTE con un objeto JSON válido.
      
      DESCRIPCIÓN: "${description}"

      JSON:
      {
        "sentiment": "calm" | "frustrated" | "angry",
        "suggestedPriority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        "suggestedArea": "Sistemas" | "Mantenimiento" | "Limpieza" | "Seguridad" | "Otros",
        "summary": "Resumen corto",
        "ai_reasoning": "Razonamiento corto"
      }
    `;

    // Lista de modelos a probar en orden de preferencia
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

    for (const modelName of modelsToTry) {
      try {
        console.log(`AiService: Intentando análisis con modelo ${modelName}...`);
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log(`AiService: Éxito con modelo ${modelName}`);
          return {
            sentiment: parsed.sentiment || 'calm',
            suggestedPriority: parsed.suggestedPriority || 'MEDIUM',
            suggestedArea: parsed.suggestedArea || 'Otros',
            summary: parsed.summary || 'Procesado',
            ai_reasoning: parsed.ai_reasoning || 'Análisis automático'
          };
        }
      } catch (error) {
        console.warn(`AiService: Error con modelo ${modelName}:`, error.message);
        // Continuamos al siguiente modelo
      }
    }

    console.error('AiService: Todos los modelos fallaron.');
    return null;
  }

  async predictResolutionTime(newTicket: any, history: any[]) {
    if (!this.genAI) return null;

    const prompt = `Predice el tiempo de resolución en minutos para este ticket: ${newTicket.description}. Responde solo JSON: {"estimatedMinutes": 30, "confidence": 0.8, "reasoning": "..."}`;

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      return null;
    }
  }
}
