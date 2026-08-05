/** Soft workshop dust, lamp, blueprint grid, unfinished frame marks */
export function WorkshopAtmosphere() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 9) % 97}%`,
    top: `${(i * 23 + 11) % 90}%`,
    size: 1.5 + (i % 4) * 0.7,
    delay: (i % 7) * 0.8,
    duration: 7 + (i % 5) * 1.4,
  }))

  return (
    <div className="workshop-atmosphere" aria-hidden>
      <div className="workshop-atmosphere__grid" />
      <div className="workshop-atmosphere__lamp" />
      <div className="workshop-atmosphere__bench" />
      <div className="workshop-atmosphere__vignette" />
      <div className="workshop-atmosphere__frame">
        <span className="workshop-atmosphere__corner workshop-atmosphere__corner--tl" />
        <span className="workshop-atmosphere__corner workshop-atmosphere__corner--tr" />
        <span className="workshop-atmosphere__corner workshop-atmosphere__corner--bl" />
        <span className="workshop-atmosphere__corner workshop-atmosphere__corner--br" />
      </div>
      {particles.map((p) => (
        <span
          key={p.id}
          className="workshop-atmosphere__particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
