"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchOmiyageList, OmiyageRow } from "@/lib/omiyageDb";

export default function PrefRankingPage() {
  const params = useParams<{ pref: string }>();
  const pref = decodeURIComponent(params.pref);

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

  const filtered = useMemo(() => {
    return rows.filter((r) => r.pref === pref);
  }, [rows, pref]);

  const top = filtered[0];

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Header active="prefectures" />

      <main style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: 16 }}>
          <div>
            <h1 style={h1}>{pref} のランキング</h1>
            <div style={{ color: "#666", fontSize: 12 }}>※総合点の高い順に表示</div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={btn} onClick={load} type="button">
              最新に更新
            </button>
            <Link href="/prefectures" style={{ ...btn, display: "inline-flex", alignItems: "center" }}>
              都道府県一覧へ
            </Link>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}>読み込み中…</div>
        ) : err ? (
          <div style={{ padding: 16, color: "#b30000", fontWeight: 900 }}>{err}</div>
        ) : (
          <>
            <section style={hero}>
              <div style={{ fontWeight: 1000, marginBottom: 6 }}>県代表（暫定）</div>
              {top ? (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                  <div style={{ fontSize: 20, fontWeight: 1000 }}>{top.name}</div>
                  <div style={{ fontSize: 26, fontWeight: 1000, color: "#b30000" }}>
                    {Number(top.total).toFixed(1)}
                  </div>
                </div>
              ) : (
                <div style={{ color: "#666", fontSize: 14 }}>まだデータがない。/register から登録して。</div>
              )}
            </section>

            <table style={table}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={th}>順位</th>
                  <th style={th}>商品名</th>
                  <th style={th}>総合点</th>
                  <th style={th}>権威性</th>
                  <th style={th}>満足度</th>
                  <th style={th}>希少性</th>
                  <th style={th}>味</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td style={td}>
                      <span style={rankBadge(i + 1)}>{i + 1}</span>
                    </td>
                    <td style={td}>{r.name}</td>
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
                    <td style={td} colSpan={7}>
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
};

const h1: React.CSSProperties = {
  margin: 0,
  paddingLeft: 10,
  borderLeft: "6px solid #b30000",
  fontSize: 28,
  fontWeight: 1000,
};

const hero: React.CSSProperties = {
  margin: "0 16px 16px",
  padding: "12px 14px",
  border: "1px solid #ddd",
  background: "#fffdf7",
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
  textDecoration: "none",
  color: "#111",
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
