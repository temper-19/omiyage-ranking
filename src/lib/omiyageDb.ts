import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLE = "omiyage";

export type OmiyageRow = {
  id: string;
  name: string;
  pref: string;
  authority: number;
  satisfaction: number;
  rarity: number;
  taste: number;
  total: number;
  created_at?: string;
  updated_at?: string | null;
};

export type OmiyageInsert = Omit<OmiyageRow, "id" | "created_at" | "updated_at">;

export async function fetchOmiyageList(): Promise<OmiyageRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("total", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as OmiyageRow[];
}

export async function fetchOmiyageById(id: string): Promise<OmiyageRow | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as OmiyageRow | null;
}

export async function insertOmiyage(payload: OmiyageInsert) {
  const { error } = await supabase.from(TABLE).insert({
    ...payload,
  });
  if (error) throw error;
}

export async function updateOmiyage(
  id: string,
  payload: OmiyageInsert
) {
  const { error } = await supabase
    .from(TABLE)
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}
