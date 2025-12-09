import { GoogleGenAI, Type } from "@google/genai";
import { WeeklyPlan, Exercise } from "../types";

// Helper to safely get the AI client only when needed
const getAiClient = () => {
  let apiKey = "";

  // 1. Tenta obter a chave do ambiente Vite (Padrão moderno)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      apiKey = import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    console.warn("Erro ao tentar ler import.meta.env", e);
  }

  // 2. Fallback para process.env (caso o build faça replacement de variáveis)
  if (!apiKey && typeof process !== 'undefined' && process.env) {
    apiKey = process.env.VITE_API_KEY || process.env.API_KEY || "";
  }
  
  if (!apiKey) {
    throw new Error(
      "Chave de API não encontrada.\n\n" +
      "Verificamos 'import.meta.env.VITE_API_KEY' e 'process.env.API_KEY', mas ambos estão vazios.\n\n" +
      "1. Certifique-se de que a variável no Vercel se chama EXATAMENTE 'VITE_API_KEY'.\n" +
      "2. Após adicionar a variável, você DEVE fazer um REDEPLOY (Vá em Deployments > Redeploy) para que a chave entre em vigor."
    );
  }

  return new GoogleGenAI({ apiKey });
};

export const generateWorkoutPlan = async (): Promise<WeeklyPlan> => {
  const ai = getAiClient();

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
    
    4.  **Quarta-feira (PERNAS):**
        *   **IMPORTANTE:** Defina o campo 'focus' deste dia exatamente como "PERNAS".
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
    
    6.  **Sexta-feira (SUPERIORES):**
        *   **IMPORTANTE:** Defina o campo 'focus' deste dia exatamente como "SUPERIORES".
        *   Treino de corpo inteiro, MAS EXCLUINDO as pernas (exceto a panturrilha).
        *   Pelo menos 1 exercício para cada: Peito, Costas, Ombro, Bíceps, Tríceps.
        *   **1 exercício de Trapézio** (Obrigatório).
        *   (+ 1 Panturrilha obrigatória).
        *   (+ 1 Abdômen obrigatório).

    Requisitos de Formatação:
    *   **IMPORTANTE - CAMPO 'focus':** Liste APENAS os músculos principais do dia em CAIXA ALTA separados por " • " (Exceto quarta-feira que deve ser "PERNAS" e sexta-feira que deve ser "SUPERIORES").
    *   **TIKTOK (CRÍTICO):** Para o campo 'tiktokSearchTerm', gere um termo CURTO e TÉCNICO para busca, focado na execução. Exemplo: "Execução Supino Reto", "Técnica Agachamento Livre", "Execução Rosca Direta". NÃO use frases longas como "como fazer...".
    *   **DESCANSO:** Para cada exercício, inclua um 'restTime' sugerido (ex: "60s", "90s", "45s") baseando-se na intensidade do movimento.
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
                  focus: { type: Type.STRING, description: "Título do foco do dia (ex: Costas • Bíceps, ou PERNAS)" },
                  description: { type: Type.STRING, description: "Breve frase de efeito (opcional)" },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        restTime: { type: Type.STRING, description: "Tempo de descanso sugerido (ex: 60s)" },
                        tiktokSearchTerm: { type: Type.STRING, description: "Termo de busca curto (ex: 'Execução Supino Reto')" }
                      },
                      required: ["name", "sets", "reps", "restTime", "tiktokSearchTerm"]
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
  const ai = getAiClient();
  
  const prompt = `
    O usuário quer substituir o exercício "${currentExerciseName}" de um treino com foco em "${dayFocus}".
    
    Forneça UM (1) único exercício alternativo que:
    1. Trabalhe EXATAMENTE o mesmo grupo muscular principal e função biomecânica.
    2. Seja adequado para nível INTERMEDIÁRIO.
    3. Inclua um 'tiktokSearchTerm' curto (ex: "Execução [Nome do Exercicio]").
    4. Inclua um 'restTime' sugerido.
    
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
            restTime: { type: Type.STRING },
            tiktokSearchTerm: { type: Type.STRING }
          },
          required: ["name", "sets", "reps", "restTime", "tiktokSearchTerm"]
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