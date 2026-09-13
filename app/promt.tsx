/**
 * promt.tsx
 * ----------
 * Configuración central de la IA editora: prompt, tools (funciones que
 * Gemini puede invocar) y la creación del cliente de Gemini.
 *
 * "server-only" hace que Next.js falle el build si algún componente de
 * cliente ("use client") importa este archivo, directa o indirectamente.
 * Es tu red de seguridad para que la key nunca termine en el navegador.
 */
import "server-only";

import { GoogleGenAI } from "@google/genai";

// Modelo a usar. Poné acá el string exacto que tenés habilitado.
export const MODEL = "gemini-3.1-flash";

// "low" = más barato. Solo subir a "high" si necesitás leer texto chico
// dentro del video.
export const MEDIA_RESOLUTION = "low";

// Crea el cliente de Gemini usando la key desde variables de entorno.
// NUNCA hardcodees la key acá adentro.
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

// Las funciones ("tools") que Gemini puede invocar.
// Cada nueva capacidad (subtítulos, color, fondo, motion graphics) se
// suma acá como una entrada más de function_declarations.
export const TOOLS = [
  {
    function_declarations: [
      {
        name: "cortar_clip",
        description:
          "Recorta el video, quedándose solo con el segmento entre 'inicio' y 'fin'.",
        parameters: {
          type: "object",
          properties: {
            inicio: {
              type: "string",
              description: "Tiempo de inicio, formato HH:MM:SS, ej: '00:00:05'",
            },
            fin: {
              type: "string",
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
          type: "object",
          properties: {
            texto: { type: "string", description: "El texto a mostrar" },
            posicion: {
              type: "string",
              enum: ["arriba", "centro", "abajo"],
              description: "Dónde ubicar el texto en el frame",
            },
            color: {
              type: "string",
              description: "Color del texto, nombre o hex, ej: 'yellow' o '#FFD700'",
            },
          },
          required: ["texto"],
        },
      },
      // TODO próximos: agregar_subtitulos, cambiar_fondo, aplicar_color_grading, generar_animacion
    ],
  },
];