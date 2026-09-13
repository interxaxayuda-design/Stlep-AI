import { createClient } from "@supabase/supabase-js";

// El anon key es seguro de exponer en el navegador — está diseñado para eso,
// a diferencia de la key de Gemini.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function subirVideoAStorage(file: File): Promise<string> {
  const path = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage.from("videos").upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from("videos").getPublicUrl(path);
  return data.publicUrl;
}