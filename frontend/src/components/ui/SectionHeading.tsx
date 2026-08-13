import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <Reveal className={center ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-brand font-bold text-sm mb-3">
          <span className="w-6 h-[2px] bg-brand" />
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-3xl md:text-5xl font-black leading-tight ${
          light ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 leading-8 ${
            light ? "text-white/60" : "text-muted"
          }`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
