"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { fetchOmiyageList, OmiyageRow } from "@/lib/omiyageDb";

export default function RankingPage() {
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

  const avg = useMemo(() => {
    if (rows.length === 0) return 0;
    const sum = rows.reduce((a, r) => a + Number(r.total ?? 0), 0);
    return sum / rows.length;
  }, [rows]);

  const maxScore = useMemo(() => {
    if (rows.length === 0) return 0;
    return Math.max(...rows.map((r) => Number(r.total ?? 0)));
  }, [rows]);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Header active="ranking" />

      <main style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: 16 }}>
          <div>
            <h1 style={h1}>全国おみやげ総合ランキング</h1>
            <div style={{ color: "#666", fontSize: 12 }}>
              ※総合点は「権威性・満足度・希少性・味」の合計です（最大20点）
            </div>
          </div>

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
            <table style={table}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={th}>順位</th>
                  <th style={th}>商品名</th>
                  <th style={th}>都道府県</th>
                  <th style={th}>総合点</th>
                  <th style={th}>権威性</th>
                  <th style={th}>満足度</th>
                  <th style={th}>希少性</th>
                  <th style={th}>味</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td style={td}>
                      <span style={rankBadge(i + 1)}>{i + 1}</span>
                    </td>
                    <td style={td}>{r.name}</td>
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
                {rows.length === 0 && (
                  <tr>
                    <td style={td} colSpan={8}>
                      まだデータがない。/register から登録して。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ padding: 12, fontSize: 12, color: "#666" }}>
              ※本ランキングは個人的な評価に基づくものです。
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
  position: "relative",
};

const h1: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 1000,
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

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

const btn: React.CSSProperties = {
  height: 36,
  border: "1px solid #ddd",
  background: "#fff",
  padding: "0 12px",
  fontWeight: 900,
  cursor: "pointer",
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


