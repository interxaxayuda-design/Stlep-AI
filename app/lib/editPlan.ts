import { z } from "zod";

const Easing = z.enum(["linear", "easeIn", "easeOut", "easeInOut"]);

// Animatable value — this is what makes it "motion graphics" instead of static overlays
const Keyframe = z.object({
  tiempo: z.number(),        // segundos, relativo al clip
  valor: z.number(),
  easing: Easing.default("linear"),
});

const TextoAnimado = z.object({
  contenido: z.string(),
  inicio: z.number(),
  fin: z.number(),
  fuente: z.string().default("Arial Bold"),
  color: z.string().default("#FFFFFF"),
  tamano: z.number().default(48),
  posicionX: z.array(Keyframe).min(1),  // animar entrada/salida en X
  posicionY: z.array(Keyframe).min(1),
  opacidad: z.array(Keyframe).min(1),   // fade in/out
  escala: z.array(Keyframe).optional(), // "pop" / zoom-in effects
});

const Transicion = z.object({
  tipo: z.enum([
    "fade", "wipeleft", "wiperight", "slideup", "slidedown",
    "circleopen", "circleclose", "pixelize", "dissolve", "zoomin",
  ]),
  duracion: z.number().min(0.1).max(3).default(0.5),
});

const GradoColor = z.object({
  brillo: z.number().min(-1).max(1).default(0),
  contraste: z.number().min(0).max(2).default(1),
  saturacion: z.number().min(0).max(3).default(1),
});

const Clip = z.object({
  inicio: z.number(),
  fin: z.number(),
  velocidad: z.number().min(0.25).max(4).default(1),
  colorGrade: GradoColor.optional(),
  transicionSalida: Transicion.optional(),
});

const PistaAudio = z.object({
  tipo: z.enum(["musica_original", "musica_agregada"]),
  volumen: z.number().min(0).max(2).default(1),
  fadeIn: z.number().default(0),
  fadeOut: z.number().default(0),
  duckingConVoz: z.boolean().default(false),
});

export const EditPlan = z.object({
  clips: z.array(Clip).min(1),
  textos: z.array(TextoAnimado).default([]),
  audio: z.array(PistaAudio).default([]),
  resumenDecision: z.string(),
});
export type EditPlan = z.infer<typeof EditPlan>;