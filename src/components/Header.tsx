import Link from "next/link";

type Active = "ranking" | "register" | "prefectures";

export default function Header({ active }: { active: Active }) {
  const Tab = ({ href, keyName, label }: { href: string; keyName: Active; label: string }) => {
    const isActive = active === keyName;
    return (
      <Link
        href={href}
        style={{
          padding: "12px 14px",
          display: "inline-block",
          borderBottom: isActive ? "3px solid #b30000" : "3px solid transparent",
          color: isActive ? "#222" : "#666",
          textDecoration: "none",
          fontWeight: 800,
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header>
      {/* 上段ヘッダー */}
      <div style={{ background: "#b30000", color: "#fff" }}>
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 20 }}>全国おみやげランキング</div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={badgeStyle}>社内限定</span>
            <span style={badgeStyle}>身内用</span>
          </div>
        </div>
      </div>

      {/* 下段タブ */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ddd" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}>
          <Tab href="/register" keyName="register" label="おみやげ評価登録" />
          <Tab href="/ranking" keyName="ranking" label="総合ランキング" />
          <Tab href="/prefectures" keyName="prefectures" label="都道府県別" />
        </div>
      </div>
    </header>
  );
}

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.35)",
  background: "rgba(255,255,255,0.15)",
  fontSize: 12,
  fontWeight: 800,
};
