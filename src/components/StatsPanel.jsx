function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function StatsPanel({ total, sung, opTotal, opSung, edTotal, edSung, seriesCount }) {
  return (
    <section className="panel">
      <p className="search-label">全体統計</p>
      <div className="stats-grid">
        <StatCard label="対象戦隊" value={`${seriesCount}作`} />
        <StatCard label="全曲" value={`${sung}/${total}`} />
        <StatCard label="OP" value={`${opSung}/${opTotal}`} />
        <StatCard label="ED" value={`${edSung}/${edTotal}`} />
      </div>
    </section>
  )
}
