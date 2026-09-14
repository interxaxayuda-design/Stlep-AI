import { NextResponse } from "next/server";
import { createUserContent, createPartFromUri } from "@google/genai";
import { getGeminiClient, MODEL, SYSTEM_PROMPT_MOTION, EDIT_PLAN_GEMINI_SCHEMA } from "../../promt";
import { EditPlan } from "../../lib/editPlan";
import { compilarYRenderizar } from "../../lib/renderer";
import { writeFile, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export const runtime = "nodejs"; // ffmpeg necesita Node, no Edge

export async function POST(req: Request) {
  try {
    const { promptUsuario, videoUrl } = await req.json();

    if (!promptUsuario) {
      return NextResponse.json({ ok: false, error: "Falta el prompt del usuario" }, { status: 400 });
    }
    if (!videoUrl) {
      return NextResponse.json({ ok: false, error: "Falta la URL del video" }, { status: 400 });
    }

    const ai = getGeminiClient();

    // 1. Descargar el video (lo necesitamos tanto para subirlo a Gemini como para ffmpeg después)
    const workDir = await mkdtemp(path.join(tmpdir(), "stlep-"));
    const inputPath = path.join(workDir, "input.mp4");

    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`No se pudo descargar el video: ${videoResponse.status}`);
    }
    await writeFile(inputPath, Buffer.from(await videoResponse.arrayBuffer()));

    // 2. Subir el video a la Files API de Gemini — esto es lo que le permite "mirarlo"
    let file = await ai.files.upload({
      file: inputPath,
      config: { mimeType: "video/mp4" },
    });

    // 3. Los videos se procesan async del lado de Google — esperamos hasta que esté listo
    while (file.state === "PROCESSING") {
      await new Promise((r) => setTimeout(r, 2000));
      file = await ai.files.get({ name: file.name! });
    }
    if (file.state !== "ACTIVE") {
      throw new Error(`Gemini no pudo procesar el video (estado: ${file.state})`);
    }

    // 4. Gemini mira el video + lee el prompt → devuelve un EditPlan estructurado
    const promptCompleto = `Instrucción de edición del usuario: ${promptUsuario}`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: createUserContent([
        createPartFromUri(file.uri!, file.mimeType!),
        promptCompleto,
      ]),
      config: {
        systemInstruction: SYSTEM_PROMPT_MOTION,
        responseMimeType: "application/json",
        responseSchema: EDIT_PLAN_GEMINI_SCHEMA,
      },
    });

    const raw = JSON.parse(response.text!);
    const plan = EditPlan.parse(raw); // zod revalida — nunca confiar ciegamente en el LLM

    // 5. Compilar el plan en filtros ffmpeg y renderizar el video editado
    const outputPath = await compilarYRenderizar(inputPath, plan, workDir);
    const outputBuffer = await readFile(outputPath);
    const videoEditado = `data:video/mp4;base64,${outputBuffer.toString("base64")}`;

    return NextResponse.json({ ok: true, videoEditado });
  } catch (error: any) {
    console.error("❌ Error en la API Route /api/editar:", error);
    return NextResponse.json({ ok: false, error: error?.message || "Error interno" }, { status: 500 });
  }
}