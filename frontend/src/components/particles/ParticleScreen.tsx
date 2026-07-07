import { ParticleCanvas } from "./ParticleCanvas";
import { useInView } from "@/hooks/useInView";

export function ParticleScreen() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="relative min-h-screen overflow-hidden bg-slate-950 text-rose-100">
      <div className="absolute inset-0">
        <ParticleCanvas active={inView} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-10 text-center">
        <p className="text-xs tracking-[0.45em] text-rose-100/55">FOR JIAXUE</p>
        <h2 className="mt-3 text-lg font-light tracking-[0.2em] text-rose-50/85">
          万千光点，只为靠近你
        </h2>
      </div>
    </div>
  );
}
