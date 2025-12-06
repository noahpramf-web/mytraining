import { GoogleGenAI, Type } from "@google/genai";
import { WeeklyPlan, Exercise } from "../types";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API Key not found in environment variables");
}
const ai = new GoogleGenAI({ apiKey });

export const generateWorkoutPlan = async (): Promise<WeeklyPlan> => {
  const prompt = `
    Crie um guia de treinamento físico semanal completo (Segunda a Sexta-feira) para um praticante nível INTERMEDIÁRIO com foco em HIPERTROFIA.
    
    REGRAS ESTRITAS DE DISTRIBUIÇÃO (Siga exatamente):
    
    1.  **REGRA DE OURO (DIÁRIA):** Todo santo dia (Segunda a Sexta) deve conter **1 exercício de Panturrilha** E **1 exercício de Abdômen** no final do treino.
    
    2.  **Segunda-feira (Peito, Tríceps, Lombar):**
        *   3 exercícios de Peito.
        *   3 exercícios de Tríceps.
        *   1 exercício de Lombar.
        *   (+ 1 Panturrilha obrigatória).
        *   (+ 1 Abdômen obrigatório).
    
    3.  **Terça-feira (Costas, Bíceps):**
        *   3 exercícios de Costas.
        *   3 exercícios de Bíceps.
        *   (+ 1 Panturrilha obrigatória).
        *   (+ 1 Abdômen obrigatório).
    
    4.  **Quarta-feira (Pernas Completo - Volume Aumentado e Completo):**
        *   2 exercícios focados em Quadríceps.
        *   2 exercícios focados em Posterior de Coxa.
        *   2 exercícios focados em Glúteos.
        *   **1 exercício de Adutores** (parte interna da coxa - músculo complementar).
        *   **1 exercício de Abdutores** (parte externa/lateral - músculo complementar).
        *   (+ 1 Panturrilha obrigatória).
        *   (+ 1 Abdômen obrigatório).
    
    5.  **Quinta-feira (Ombros e Antebraço):**
        *   Exercícios completos para Ombros (Foco em Deltóide Lateral, Anterior e Posterior).
        *   Exercícios para Antebraço.
        *   (+ 1 Panturrilha obrigatória).
        *   (+ 1 Abdômen obrigatório).
    
    6.  **Sexta-feira (Full Body Superior - Sem Perna):**
        *   Treino de corpo inteiro, MAS EXCLUINDO as pernas (exceto a panturrilha).
        *   Pelo menos 1 exercício para cada: Peito, Costas, Ombro, Bíceps, Tríceps.
        *   **1 exercício de Trapézio** (Obrigatório).
        *   (+ 1 Panturrilha obrigatória).
        *   (+ 1 Abdômen obrigatório).

    Requisitos de Formatação:
    *   **IMPORTANTE - CAMPO 'focus':** Liste APENAS os músculos principais do dia em CAIXA ALTA separados por " • ". **NÃO** inclua "Panturrilha" ou "Abdômen" neste título, pois eles já estão implícitos todos os dias. Exemplo: "PEITO • TRÍCEPS".
    *   Para cada exercício, forneça: Nome Técnico, Séries (ex: "3-4 séries"), Repetições (ex: "8-12 reps" ou "Falha") e Termo de busca YouTube.
    *   Mantenha a linguagem técnica em Português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayName: { type: Type.STRING, description: "Dia da semana (ex: Segunda-feira)" },
                  focus: { type: Type.STRING, description: "LISTA APENAS DOS MÚSCULOS PRINCIPAIS (Sem Panturrilha/Abdômen)" },
                  description: { type: Type.STRING, description: "Breve frase de efeito (opcional)" },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        videoSearchTerm: { type: Type.STRING, description: "Termo para busca no YouTube" }
                      },
                      required: ["name", "sets", "reps", "videoSearchTerm"]
                    }
                  }
                },
                required: ["dayName", "focus", "exercises", "description"]
              }
            }
          },
          required: ["days"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as WeeklyPlan;

  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw error;
  }
};

export const getReplacementExercise = async (currentExerciseName: string, dayFocus: string): Promise<Exercise> => {
  const prompt = `
    O usuário quer substituir o exercício "${currentExerciseName}" de um treino com foco em "${dayFocus}".
    
    Forneça UM (1) único exercício alternativo que:
    1. Trabalhe EXATAMENTE o mesmo grupo muscular principal e função biomecânica do exercício original.
    2. Seja adequado para nível INTERMEDIÁRIO (Hipertrofia).
    3. Seja DIFERENTE do exercício original ("${currentExerciseName}").
    
    Retorne APENAS um objeto JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            sets: { type: Type.STRING },
            reps: { type: Type.STRING },
            videoSearchTerm: { type: Type.STRING, description: "Termo para busca no YouTube" }
          },
          required: ["name", "sets", "reps", "videoSearchTerm"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as Exercise;
  } catch (error) {
    console.error("Error generating replacement exercise:", error);
    throw error;
  }
};
