const PETALS = Array.from({ length: 14 }, (_, index) => ({
  left: `${(index * 37 + 11) % 96}%`,
  delay: `${-((index * 1.7) % 12)}s`,
  duration: `${12 + (index % 5) * 2.3}s`,
  size: `${18 + (index % 4) * 7}px`,
  drift: `${-35 + (index % 7) * 12}px`,
}));

export function PetalField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="entry-aurora absolute inset-0" />
      {PETALS.map((petal, index) => (
        <span
          key={index}
          className="entry-petal absolute -top-16 block bg-[url('/assets/petal.svg')] bg-contain bg-center bg-no-repeat opacity-0"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            "--petal-drift": petal.drift,
          } as React.CSSProperties}
        />
      ))}
      <div className="entry-grain absolute inset-0 opacity-[0.035]" />
    </div>
  );
}
