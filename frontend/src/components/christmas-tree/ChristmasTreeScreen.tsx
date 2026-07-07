import { ChristmasTreeCanvas } from "./ChristmasTreeCanvas";
import { useInView } from "@/hooks/useInView";

export function ChristmasTreeScreen() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="relative min-h-screen overflow-hidden bg-black text-amber-100">
      <div className="absolute inset-0">
        <ChristmasTreeCanvas active={inView} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-10 text-center">
        <p className="text-xs tracking-[0.45em] text-amber-200/55">FOR JIAXUE</p>
        <h2 className="mt-3 text-lg font-light tracking-[0.2em] text-amber-50/85">
          万千星光，为你点亮
        </h2>
      </div>
    </div>
  );
}
