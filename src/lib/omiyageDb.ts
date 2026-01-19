import { supabase } from "@/lib/supabaseClient";

export type OmiyageRow = {
  id: string;
  name: string;
  pref: string;
  authority: number;
  satisfaction: number;
  rarity: number;
  taste: number;
  total: number;
  updated_at: string;
  created_at: string;
};

const TABLE = "omiyage_ratings";

export async function fetchOmiyageList(): Promise<OmiyageRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("total", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as OmiyageRow[];
}

export async function insertOmiyage(input: {
  name: string;
  pref: string;
  authority: number;
  satisfaction: number;
  rarity: number;
  taste: number;
  total: number;
}) {
  const now = new Date().toISOString();

  const { error } = await supabase.from(TABLE).insert([
    {
      ...input,
      updated_at: now,
    },
  ]);

  if (error) throw error;
}

export async function updateOmiyage(
  id: string,
  patch: Partial<Pick<OmiyageRow, "name" | "pref" | "authority" | "satisfaction" | "rarity" | "taste" | "total">>
) {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from(TABLE)
    .update({ ...patch, updated_at: now })
    .eq("id", id);

  if (error) throw error;
}
