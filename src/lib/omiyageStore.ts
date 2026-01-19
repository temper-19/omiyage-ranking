export type Omiyage = {
  id: string;
  name: string;
  pref: string;
  authority: number;
  satisfaction: number;
  rarity: number;
  taste: number;
  total: number; // 4項目の合計
  updatedAt: string;
};

const KEY = "omiyage-ranking:v1";

export function loadOmiyageList(): Omiyage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Omiyage[];
  } catch {
    return [];
  }
}

export function saveOmiyageList(list: Omiyage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function upsertOmiyage(item: Omiyage) {
  const list = loadOmiyageList();
  const idx = list.findIndex((x) => x.id === item.id);

  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.push(item);
  }

  saveOmiyageList(list);
}

export function deleteOmiyage(id: string) {
  const list = loadOmiyageList().filter((x) => x.id !== id);
  saveOmiyageList(list);
}

export function createId() {
  // 簡易ID（今はこれでOK）
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
