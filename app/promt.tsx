import "server-only";
import { EditPlan } from "./lib/editPlan";

import { GoogleGenAI, Type } from "@google/genai";

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

export const SYSTEM_PROMPT_MOTION = `
Sos un editor de video profesional especializado en motion graphics.
Vas a MIRAR el video que te adjuntan y LEER el pedido del usuario (en español).
Tu trabajo es devolver un EditPlan: un plan de edición estructurado que incluye
cortes, animaciones de texto (con keyframes de posición, opacidad y escala),
transiciones entre clips, y ajustes de audio.

Reglas:
- Analizá el contenido real del video (qué se ve, qué se escucha, ritmo, momentos clave)
  antes de decidir dónde cortar o dónde ubicar textos.
- Usá keyframes para crear animación real: entradas, salidas, "pops" de escala,
  fades. No dejes textos estáticos salvo que tenga sentido narrativo.
- Elegí transiciones y tiempos que se sientan profesionales, no arbitrarios.
- Si el pedido es ambiguo, elegí la interpretación más razonable y resumila
  brevemente en el campo resumenDecision.
- Nunca inventes campos fuera del schema provisto.
`.trim();

// ---------- Keyframe (reutilizado en varios campos) ----------
const KEYFRAME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tiempo: { type: Type.NUMBER, description: "Segundos, relativo al inicio del clip" },
    valor: { type: Type.NUMBER, description: "Valor en ese instante (posición, opacidad 0-1, escala, etc.)" },
    easing: {
      type: Type.STRING,
      enum: ["linear", "easeIn", "easeOut", "easeInOut"],
    },
  },
  required: ["tiempo", "valor", "easing"],
};

const KEYFRAME_ARRAY_SCHEMA = {
  type: Type.ARRAY,
  items: KEYFRAME_SCHEMA,
};

// ---------- TextoAnimado ----------
const TEXTO_ANIMADO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    contenido: { type: Type.STRING },
    inicio: { type: Type.NUMBER, description: "Segundos, cuándo aparece en el timeline final" },
    fin: { type: Type.NUMBER, description: "Segundos, cuándo desaparece" },
    fuente: { type: Type.STRING },
    color: { type: Type.STRING, description: "Nombre o hex, ej '#FFD700'" },
    tamano: { type: Type.NUMBER },
    posicionX: KEYFRAME_ARRAY_SCHEMA,
    posicionY: KEYFRAME_ARRAY_SCHEMA,
    opacidad: KEYFRAME_ARRAY_SCHEMA,
    escala: KEYFRAME_ARRAY_SCHEMA,
  },
  required: ["contenido", "inicio", "fin", "posicionX", "posicionY", "opacidad"],
};

// ---------- Transicion ----------
const TRANSICION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tipo: {
      type: Type.STRING,
      enum: [
        "fade", "wipeleft", "wiperight", "slideup", "slidedown",
        "circleopen", "circleclose", "pixelize", "dissolve", "zoomin",
      ],
    },
    duracion: { type: Type.NUMBER, description: "Segundos, entre 0.1 y 3" },
  },
  required: ["tipo", "duracion"],
};

// ---------- GradoColor ----------
const GRADO_COLOR_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    brillo: { type: Type.NUMBER, description: "-1 a 1" },
    contraste: { type: Type.NUMBER, description: "0 a 2" },
    saturacion: { type: Type.NUMBER, description: "0 a 3" },
  },
  required: ["brillo", "contraste", "saturacion"],
};

// ---------- Clip ----------
const CLIP_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    inicio: { type: Type.NUMBER, description: "Segundos, dentro del video original" },
    fin: { type: Type.NUMBER, description: "Segundos, dentro del video original" },
    velocidad: { type: Type.NUMBER, description: "0.25 a 4, 1 = velocidad normal" },
    colorGrade: GRADO_COLOR_SCHEMA,
    transicionSalida: TRANSICION_SCHEMA,
  },
  required: ["inicio", "fin", "velocidad"],
};

// ---------- PistaAudio ----------
const PISTA_AUDIO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tipo: { type: Type.STRING, enum: ["musica_original", "musica_agregada"] },
    volumen: { type: Type.NUMBER, description: "0 a 2, 1 = volumen original" },
    fadeIn: { type: Type.NUMBER },
    fadeOut: { type: Type.NUMBER },
    duckingConVoz: { type: Type.BOOLEAN },
  },
  required: ["tipo", "volumen", "fadeIn", "fadeOut", "duckingConVoz"],
};

// ---------- EditPlan completo (esto es lo que va en responseSchema) ----------
export const EDIT_PLAN_GEMINI_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    clips: { type: Type.ARRAY, items: CLIP_SCHEMA },
    textos: { type: Type.ARRAY, items: TEXTO_ANIMADO_SCHEMA },
    audio: { type: Type.ARRAY, items: PISTA_AUDIO_SCHEMA },
    resumenDecision: {
      type: Type.STRING,
      description: "Breve explicación en español de qué se decidió y por qué",
    },
  },
  required: ["clips", "textos", "audio", "resumenDecision"],
};