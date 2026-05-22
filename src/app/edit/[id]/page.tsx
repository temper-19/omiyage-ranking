"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { fetchOmiyageById, updateOmiyage, OmiyageRow } from "@/lib/omiyageDb";

type RatingKey = "authority" | "satisfaction" | "rarity" | "taste";

const LABELS: Record<RatingKey, string> = {
  authority: "権威性",
  satisfaction: "満足度",
  rarity: "希少性",
  taste: "味",
};

const PREFS = [
  "北海道","青森","岩手","宮城","秋田","山形","福島",
  "茨城","栃木","群馬","埼玉","千葉","東京","神奈川",
  "新潟","富山","石川","福井","山梨","長野",
  "岐阜","静岡","愛知","三重",
  "滋賀","京都","大阪","兵庫","奈良","和歌山",
  "鳥取","島根","岡山","広島","山口",
  "徳島","香川","愛媛","高知",
  "福岡","佐賀","長崎","熊本","大分","宮崎","鹿児島","沖縄",
];

function clampHalf(v: number) {
  const n = Math.round(v * 2) / 2;
  return Math.min(5, Math.max(0, n));
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const render = (v: number) => {
    const full = Math.floor(v);
    const half = v - full >= 0.5;
    return "★".repeat(full) + (half ? "☆" : "") + "☆".repeat(5 - full - (half ? 1 : 0));
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ minWidth: 120, color: "#b30000", fontWeight: 900 }}>
        {render(value)}
      </div>
      <input
        type="range"
        min={0}
        max={5}
        step={0.5}
        value={value}
        onChange={(e) => onChange(clampHalf(Number(e.target.value)))}
        style={{ flex: 1 }}
      />
      <div style={{ width: 40, textAlign: "right", fontWeight: 900 }}>
        {value.toFixed(1)}
      </div>
    </div>
  );
}

export default function EditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [pref, setPref] = useState("東京");
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    authority: 0,
    satisfaction: 0,
    rarity: 0,
    taste: 0,
  });

  const total = useMemo(
    () => ratings.authority + ratings.satisfaction + ratings.rarity + ratings.taste,
    [ratings]
  );

  const setRating = (k: RatingKey, v: number) =>
    setRatings((r) => ({ ...r, [k]: v }));

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        const row = await fetchOmiyageById(id);
        if (!row) {
          alert("対象データが見つからない");
          router.push("/ranking");
          return;
        }
        setName(row.name);
        setPref(row.pref);
        setRatings({
          authority: row.authority,
          satisfaction: row.satisfaction,
          rarity: row.rarity,
          taste: row.taste,
        });
      } catch (e) {
        console.error(e);
        alert("読み込みに失敗した");
        router.push("/ranking");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const canSubmit = name.trim().length > 0 && !saving && !loading;

  const onSave = async () => {
    if (!id || !canSubmit) return;

    setSaving(true);
    try {
      await updateOmiyage(id, {
        name: name.trim(),
        pref,
        authority: ratings.authority,
        satisfaction: ratings.satisfaction,
        rarity: ratings.rarity,
        taste: ratings.taste,
        total,
      });

      alert("更新した！");
      router.push("/ranking");
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("更新に失敗した（Supabase/RLS/カラム名を確認）");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Header active="ranking" />

      <main style={panel}>
        <h1 style={h1}>おみやげ編集</h1>

        {loading ? (
          <div style={{ padding: 16, color: "#666" }}>読み込み中…</div>
        ) : (
          <>
            <section style={section}>
              <div style={title}>基本情報</div>

              <div style={grid}>
                <div style={label}>商品名</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={input}
                />

                <div style={label}>都道府県</div>
                <select value={pref} onChange={(e) => setPref(e.target.value)} style={select}>
                  {PREFS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </section>

            <section style={section}>
              <div style={title}>評価（0.5刻み）</div>

              <div style={{ display: "grid", gap: 12 }}>
                {(Object.keys(LABELS) as RatingKey[]).map((k) => (
                  <div key={k} style={row}>
                    <div style={{ width: 120, fontWeight: 900 }}>{LABELS[k]}</div>
                    <StarRating value={ratings[k]} onChange={(v) => setRating(k, v)} />
                  </div>
                ))}
              </div>

              <div style={totalBox}>
                <span>総合点（合計）</span>
                <strong style={{ fontSize: 28, color: "#b30000" }}>
                  {total.toFixed(1)}
                </strong>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button
                  style={{ ...btnGhost }}
                  onClick={() => router.push("/ranking")}
                >
                  戻る
                </button>

                <button
                  style={{ ...btnPrimary, opacity: canSubmit ? 1 : 0.5 }}
                  disabled={!canSubmit}
                  onClick={onSave}
                >
                  {saving ? "保存中…" : "更新する"}
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

/* styles */
const panel: React.CSSProperties = {
  maxWidth: 1000,
  margin: "16px auto",
  background: "#fff",
  border: "1px solid #ddd",
};

const h1: React.CSSProperties = {
  margin: 0,
  padding: 16,
  borderLeft: "6px solid #b30000",
};

const section: React.CSSProperties = {
  padding: 16,
  borderTop: "1px solid #eee",
};

const title: React.CSSProperties = {
  fontWeight: 1000,
  borderLeft: "4px solid #b30000",
  paddingLeft: 10,
  marginBottom: 12,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  gap: 12,
  alignItems: "center",
};

const label: React.CSSProperties = { fontWeight: 900, fontSize: 13 };

const input: React.CSSProperties = {
  height: 36,
  border: "1px solid #ddd",
  padding: "0 10px",
};

const select: React.CSSProperties = {
  height: 36,
  border: "1px solid #ddd",
  padding: "0 10px",
};

const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 12px",
  border: "1px solid #eee",
  background: "#fafafa",
};

const totalBox: React.CSSProperties = {
  marginTop: 16,
  padding: "12px 14px",
  display: "flex",
  justifyContent: "space-between",
  border: "1px solid #ddd",
  background: "#fffdf7",
  fontWeight: 900,
};

const btnPrimary: React.CSSProperties = {
  height: 40,
  padding: "0 14px",
  border: "1px solid #b30000",
  background: "#b30000",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
  height: 40,
  padding: "0 14px",
  border: "1px solid #ddd",
  background: "#fff",
  color: "#111",
  fontWeight: 900,
  cursor: "pointer",
};
