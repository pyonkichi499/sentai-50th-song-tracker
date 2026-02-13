export function ProgressBar({ total, sung }) {
  const rate = total === 0 ? 0 : Math.round((sung / total) * 100)

  return (
    <section className="panel progress-panel">
      <div className="progress-head">
        <h2>全体進捗</h2>
        <strong>
          {sung} / {total} ({rate}%)
        </strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${rate}%` }} />
      </div>
      <p className="subtext">※ チェックを入れると進捗が即時反映されます。</p>
    </section>
  )
}
