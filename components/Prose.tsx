import { Fragment } from "react";

/**
 * Renders *emphasis*, used for Qur'anic quotations inside prose.
 * Deliberately minimal: no HTML is ever interpreted from the data files.
 */
export default function Prose({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(/\*([^*]+)\*/g);
  return (
    <p className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <em key={i} className="text-[var(--green)] not-italic">
            {part}
          </em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </p>
  );
}
