import { NextResponse } from "next/server";
import { getGeminiClient, MODEL, SYSTEM_PROMPT, TOOLS } from "../../promt";

export async function POST(req: Request) {
  try {
    const { promptUsuario, videoUrl } = await req.json();

    if (!promptUsuario) {
      return NextResponse.json(
        { ok: false, error: "Falta el prompt del usuario" },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    const promptCompleto = videoUrl
      ? `URL del video cargado en Supabase: ${videoUrl}\n\nInstrucción de edición: ${promptUsuario}`
      : promptUsuario;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [promptCompleto],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: TOOLS,
      },
    });

    console.log("==========================================");
    console.log("📩 PROMPT RECIBIDO:", promptUsuario);
    console.log("📹 VIDEO URL:", videoUrl || "No especificado");

    if (response.functionCalls && response.functionCalls.length > 0) {
      console.log("🛠️ DECISIONES TOMADAS POR GEMINI (Function Calls):");
      console.dir(response.functionCalls, { depth: null, colors: true });
    } else {
      console.log("💬 RESPUESTA DE TEXTO DIRECTA (Sin herramientas):");
      console.log(response.text);
    }
    console.log("==========================================");

    return NextResponse.json({
      ok: true,
      decisiones: response.functionCalls || [],
      texto: response.text || "",
    });
  } catch (error: any) {
    console.error("❌ Error en la API Route /api/editar:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Error interno al consultar a Gemini" },
      { status: 500 }
    );
  }
}