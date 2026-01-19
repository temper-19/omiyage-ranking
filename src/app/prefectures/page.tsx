"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { fetchOmiyageList, OmiyageRow } from "@/lib/omiyageDb";

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

export default function PrefecturesPage() {
  const [rows, setRows] = useState<OmiyageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchOmiyageList();
      setRows(data);
    } catch (e) {
      console.error(e);
      setErr("読み込みに失敗した。Supabase設定/RLSを確認して。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of PREFS) map.set(p, 0);
    for (const r of rows) {
      map.set(r.pref, (map.get(r.pref) ?? 0) + 1);
    }
    return map;
  }, [rows]);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Header active="prefectures" />

      <main style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: 16 }}>
          <h1 style={h1}>都道府県別</h1>
          <button style={btn} onClick={load} type="button">
            最新に更新
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}>読み込み中…</div>
        ) : err ? (
          <div style={{ padding: 16, color: "#b30000", fontWeight: 900 }}>{err}</div>
        ) : (
          <>
            <div style={grid}>
              {PREFS.map((p) => {
                const c = counts.get(p) ?? 0;
                return (
                  <Link key={p} href={`/prefectures/${encodeURIComponent(p)}`} style={card}>
                    <div style={{ fontWeight: 1000 }}>{p}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{c}件</div>
                  </Link>
                );
              })}
            </div>

            <div style={{ padding: 12, fontSize: 12, color: "#666" }}>
              ※都道府県を選ぶと、その県のおみやげランキングを表示します。
            </div>
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
  paddingLeft: 10,
  borderLeft: "6px solid #b30000",
  fontSize: 28,
  fontWeight: 1000,
};

const grid: React.CSSProperties = {
  padding: 16,
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 10,
};

const card: React.CSSProperties = {
  border: "1px solid #ddd",
  background: "#fff",
  padding: "12px 10px",
  textDecoration: "none",
  color: "#111",
};

const btn: React.CSSProperties = {
  height: 36,
  border: "1px solid #ddd",
  background: "#fff",
  padding: "0 12px",
  fontWeight: 900,
  cursor: "pointer",
};
