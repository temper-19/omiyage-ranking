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
  const [selected, setSelected] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchOmiyageList();
      setRows(data);
      const countMap = new Map<string, number>();
      for (const r of data) countMap.set(r.pref, (countMap.get(r.pref) ?? 0) + 1);
      const first = PREFS.find((p) => (countMap.get(p) ?? 0) > 0);
      if (first && !selected) setSelected(first);
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
    for (const r of rows) map.set(r.pref, (map.get(r.pref) ?? 0) + 1);
    return map;
  }, [rows]);

  const prefsWithData = useMemo(
    () => PREFS.filter((p) => (counts.get(p) ?? 0) > 0),
    [counts]
  );

  const filtered = useMemo(
    () => (selected ? rows.filter((r) => r.pref === selected) : []),
    [rows, selected]
  );

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Header active="prefectures" />

      <main
        style={{
          maxWidth: 1000,
          margin: "16px auto",
          display: "flex",
          background: "#fff",
          border: "1px solid #ddd",
          minHeight: 400,
        }}
      >
        {/* サイドバー */}
        <div
          style={{
            width: 160,
            flexShrink: 0,
            borderRight: "1px solid #ddd",
          }}
        >
          <div
            style={{
              padding: "14px 12px 10px",
              fontWeight: 900,
              fontSize: 13,
              borderBottom: "1px solid #ddd",
              color: "#333",
            }}
          >
            都道府県選択
          </div>
          {loading ? (
            <div style={{ padding: 12, fontSize: 13, color: "#666" }}>読み込み中…</div>
          ) : (
            prefsWithData.map((p) => {
              const isActive = p === selected;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelected(p)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    padding: "11px 12px",
                    background: isActive ? "#b30000" : "#fff",
                    color: isActive ? "#fff" : "#222",
                    border: "none",
                    borderBottom: "1px solid #eee",
                    fontWeight: isActive ? 900 : 700,
                    fontSize: 14,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span>{p}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: isActive ? "rgba(255,255,255,0.25)" : "#f0f0f0",
                      color: isActive ? "#fff" : "#666",
                      borderRadius: 10,
                      padding: "1px 7px",
                    }}
                  >
                    {counts.get(p) ?? 0}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* メインコンテンツ */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ padding: 32, color: "#666" }}>読み込み中…</div>
          ) : err ? (
            <div style={{ padding: 32, color: "#b30000", fontWeight: 900 }}>{err}</div>
          ) : !selected ? (
            <div style={{ padding: 32, color: "#666" }}>都道府県を選んでください。</div>
          ) : (
            <>
              <div style={{ padding: "20px 24px 12px" }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 1000 }}>
                  {selected} おみやげランキング
                </h1>
                <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                  {selected}で評価されたおみやげを総合点の高い順に掲載しています。
                </div>
              </div>

              <div
                style={{
                  margin: "0 24px 16px",
                  padding: "9px 14px",
                  background: "#f8f8f8",
                  border: "1px solid #e8e8e8",
                  borderRadius: 4,
                  fontSize: 13,
                  color: "#444",
                }}
              >
                {filtered.length}件のおみやげが登録されています
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f0f0f0" }}>
                    {["順位","商品名","都道府県","総合点","権威性","満足度","希少性","味"].map((label) => (
                      <th key={label} style={th}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id}>
                      <td style={td}>
                        <span style={rankBadge(i + 1)}>{i + 1}</span>
                      </td>
                      <td style={td}>
                        <Link href={`/edit/${r.id}`} style={nameLink}>
                          {r.name}
                        </Link>
                      </td>
                      <td style={td}>{r.pref}</td>
                      <td style={{ ...td, color: "#b30000", fontWeight: 1000 }}>
                        {Number(r.total).toFixed(1)}
                      </td>
                      <td style={td}>{Number(r.authority).toFixed(1)}</td>
                      <td style={td}>{Number(r.satisfaction).toFixed(1)}</td>
                      <td style={td}>{Number(r.rarity).toFixed(1)}</td>
                      <td style={td}>{Number(r.taste).toFixed(1)}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td style={td} colSpan={8}>
                        まだデータがない。/register から登録して。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ padding: "12px 24px", fontSize: 12, color: "#666" }}>
                ※本ランキングは個人的な評価に基づくものです。
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const th: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px 8px",
  textAlign: "left",
  fontWeight: 900,
};

const td: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px 8px",
};

const nameLink: React.CSSProperties = {
  color: "#0066cc",
  textDecoration: "underline",
  fontWeight: 900,
};

const rankBadge = (n: number): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 26,
  borderRadius: 8,
  border: "1px solid #b30000",
  fontWeight: 1000,
  background: n <= 3 ? "#ffd36b" : "#fff",
});
