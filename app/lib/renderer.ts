import { spawn } from "node:child_process";
import path from "node:path";
import { keyframesToExpr } from "./ffmpegExpr";
import type { EditPlan } from "./editPlan";

// ---------- 1. Low-level: run ffmpeg and wait for it to finish ----------

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", ["-y", ...args]);
    let stderr = "";
    proc.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg salió con código ${code}:\n${stderr.slice(-2000)}`));
    });
    proc.on("error", reject);
  });
}

// ---------- 2. Per-clip filters: trim, speed, color grade ----------

function buildClipVideoFilter(clip: EditPlan["clips"][number], index: number): string {
  const { inicio, fin, velocidad, colorGrade } = clip;
  const parts: string[] = [];

  parts.push(`trim=start=${inicio}:end=${fin}`);
  parts.push(`setpts=(PTS-STARTPTS)/${velocidad}`);

  if (colorGrade) {
    const { brillo, contraste, saturacion } = colorGrade;
    parts.push(`eq=brightness=${brillo}:contrast=${contraste}:saturation=${saturacion}`);
  }

  return `[0:v]${parts.join(",")}[v${index}]`;
}

// Audio speed (atempo) only accepts 0.5–2.0 per instance — chain if outside that range.
function atempoChain(velocidad: number): string {
  if (velocidad >= 0.5 && velocidad <= 2.0) return `atempo=${velocidad}`;
  const filters: string[] = [];
  let remaining = velocidad;
  while (remaining > 2.0) {
    filters.push("atempo=2.0");
    remaining /= 2.0;
  }
  while (remaining < 0.5) {
    filters.push("atempo=0.5");
    remaining /= 0.5;
  }
  filters.push(`atempo=${remaining}`);
  return filters.join(",");
}

function buildClipAudioFilter(clip: EditPlan["clips"][number], index: number): string {
  const { inicio, fin, velocidad } = clip;
  return `[0:a]atrim=start=${inicio}:end=${fin},asetpts=PTS-STARTPTS,${atempoChain(velocidad)}[a${index}]`;
}

// ---------- 3. Chain clips together with transitions (xfade / acrossfade) ----------

function buildTransitionChain(plan: EditPlan): {
  filters: string[];
  finalVideoLabel: string;
  finalAudioLabel: string;
  clipTimeline: { startInOutput: number; duration: number }[]; // for text offsets
} {
  const filters: string[] = [];
  const clipTimeline: { startInOutput: number; duration: number }[] = [];

  plan.clips.forEach((clip, i) => {
    filters.push(buildClipVideoFilter(clip, i));
    filters.push(buildClipAudioFilter(clip, i));
    const duration = (clip.fin - clip.inicio) / clip.velocidad;
    clipTimeline.push({ startInOutput: 0, duration }); // fixed below
  });

  if (plan.clips.length === 1) {
    return {
      filters,
      finalVideoLabel: "v0",
      finalAudioLabel: "a0",
      clipTimeline: [{ startInOutput: 0, duration: clipTimeline[0].duration }],
    };
  }

  let prevVideoLabel = "v0";
  let prevAudioLabel = "a0";
  let cumulativeTime = clipTimeline[0].duration;
  clipTimeline[0].startInOutput = 0;

  for (let i = 1; i < plan.clips.length; i++) {
    const prevClip = plan.clips[i - 1];
    const transition = prevClip.transicionSalida ?? { tipo: "fade" as const, duracion: 0.3 };
    const offset = cumulativeTime - transition.duracion;

    const vOut = `vx${i}`;
    const aOut = `ax${i}`;

    filters.push(
      `[${prevVideoLabel}][v${i}]xfade=transition=${transition.tipo}:duration=${transition.duracion}:offset=${offset}[${vOut}]`
    );
    filters.push(
      `[${prevAudioLabel}][a${i}]acrossfade=d=${transition.duracion}[${aOut}]`
    );

    clipTimeline[i].startInOutput = offset;
    cumulativeTime = offset + clipTimeline[i].duration;

    prevVideoLabel = vOut;
    prevAudioLabel = aOut;
  }

  return { filters, finalVideoLabel: prevVideoLabel, finalAudioLabel: prevAudioLabel, clipTimeline };
}

// ---------- 4. Text overlays (drawtext with keyframed animation) ----------

function buildDrawtextFilter(
  texto: EditPlan["textos"][number],
  inputLabel: string,
  outputLabel: string
): string {
  const xExpr = keyframesToExpr(texto.posicionX, texto.inicio);
  const yExpr = keyframesToExpr(texto.posicionY, texto.inicio);
  const alphaExpr = keyframesToExpr(texto.opacidad, texto.inicio);
  const fontsizeExpr = texto.escala
    ? keyframesToExpr(texto.escala, texto.inicio)
    : `${texto.tamano}`;

  const escapedText = texto.contenido.replace(/:/g, "\\:").replace(/'/g, "\\'");

  const drawtext = [
    `text='${escapedText}'`,
    `fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`, // ajustar a tu entorno
    `fontcolor=${texto.color}`,
    `fontsize=${fontsizeExpr}`,
    `x=${xExpr}`,
    `y=${yExpr}`,
    `alpha=${alphaExpr}`,
    `enable=between(t\\,${texto.inicio}\\,${texto.fin})`,
  ].join(":");

  return `[${inputLabel}]drawtext=${drawtext}[${outputLabel}]`;
}

// ---------- 5. Audio mixing (added tracks, ducking) ----------

function buildAudioMixFilter(plan: EditPlan, baseAudioLabel: string): { filters: string[]; finalLabel: string } {
  const filters: string[] = [];
  let currentLabel = baseAudioLabel;

  plan.audio.forEach((pista, i) => {
    if (pista.tipo !== "musica_original") return; // musica_agregada needs a real input file — see caveats
    const out = `aproc${i}`;
    filters.push(
      `[${currentLabel}]volume=${pista.volumen},afade=t=in:d=${pista.fadeIn},afade=t=out:st=0:d=${pista.fadeOut}[${out}]`
    );
    currentLabel = out;
  });

  return { filters, finalLabel: currentLabel };
}

// ---------- 6. Main entry point ----------

export async function compilarYRenderizar(
  inputPath: string,
  plan: EditPlan,
  workDir: string
): Promise<string> {
  const { filters: clipFilters, finalVideoLabel, finalAudioLabel } = buildTransitionChain(plan);

  const allFilters = [...clipFilters];
  let currentVideoLabel = finalVideoLabel;

  plan.textos.forEach((texto, i) => {
    const outLabel = `vt${i}`;
    allFilters.push(buildDrawtextFilter(texto, currentVideoLabel, outLabel));
    currentVideoLabel = outLabel;
  });

  const { filters: audioFilters, finalLabel: finalAudioOut } = buildAudioMixFilter(plan, finalAudioLabel);
  allFilters.push(...audioFilters);

  const filterComplex = allFilters.join(";");
  const outputPath = path.join(workDir, "output.mp4");

  await runFfmpeg([
    "-i", inputPath,
    "-filter_complex", filterComplex,
    "-map", `[${currentVideoLabel}]`,
    "-map", `[${finalAudioOut}]`,
    "-c:v", "libx264",
    "-c:a", "aac",
    outputPath,
  ]);

  return outputPath;
}