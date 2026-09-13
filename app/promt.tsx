import "server-only";

import { GoogleGenAI, Type, Tool } from "@google/genai";

export const MODEL = "gemini-3.5-flash";
export const MEDIA_RESOLUTION = "low";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta GEMINI_API_KEY en las variables de entorno (revisá .env.local)"
    );
  }
  return new GoogleGenAI({ apiKey });
}

export const SYSTEM_PROMPT = `
Sos el motor de decisiones de un editor de video con IA.
Tu trabajo es interpretar el pedido del usuario (en español) y llamar a
las funciones necesarias, en el orden correcto, para lograr el resultado
que pide. No inventes funciones que no existan en la lista disponible.
Si el pedido es ambiguo, elegí la interpretación más razonable y avisá
brevemente qué decidiste.
`.trim();

export const TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "cortar_clip",
        description:
          "Recorta el video, quedándose solo con el segmento entre 'inicio' y 'fin'.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            inicio: {
              type: Type.STRING,
              description: "Tiempo de inicio, formato HH:MM:SS, ej: '00:00:05'",
            },
            fin: {
              type: Type.STRING,
              description: "Tiempo de fin, mismo formato que inicio",
            },
          },
          required: ["inicio", "fin"],
        },
      },
      {
        name: "agregar_texto",
        description: "Agrega un overlay de texto sobre el video.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            texto: { type: Type.STRING, description: "El texto a mostrar" },
            posicion: {
              type: Type.STRING,
              enum: ["arriba", "centro", "abajo"],
              description: "Dónde ubicar el texto en el frame",
            },
            color: {
              type: Type.STRING,
              description: "Color del texto, nombre o hex, ej: 'yellow' o '#FFD700'",
            },
          },
          required: ["texto"],
        },
      },
    ],
  },
];