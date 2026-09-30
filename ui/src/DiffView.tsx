import { useEffect, useRef } from "react";
import type { DiffRow, Hunk, ReviewDiff } from "../../src/diff";
import { changeLabel } from "../../src/report-display";

export function DiffViewer({ diff, focusLine }: { diff: ReviewDiff; focusLine: number | null }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusLine === null) return;
    box.current?.querySelector(`[data-line="${focusLine}"]`)?.scrollIntoView({ block: "center" });
  }, [focusLine, diff]);
  const from = diff.old_file ? changeLabel(diff.old_file) : "Earlier text";
  const to = changeLabel(diff.new_file);
  return (
    <div className="diff full" ref={box}>
      <p className="diff-caption">{from} → {to}</p>
      {diff.hunks.map((hunk) => (
        <HunkBlock key={hunk.id} hunk={hunk} />
      ))}
    </div>
  );
}

export function DiffExcerpt({ rows }: { rows: DiffRow[] }) {
  return (
    <div className="diff inline">
      {rows.map((row, index) => (
        <DiffLine key={index} row={row} />
      ))}
    </div>
  );
}

function HunkBlock({ hunk }: { hunk: Hunk }) {
  const end = hunk.newCount > 0 ? hunk.newStart + hunk.newCount - 1 : hunk.newStart;
  return (
    <div className="hunk" id={`hunk-${hunk.id}`}>
      <p className="hunk-label">{hunk.newCount > 0 ? `Lines ${hunk.newStart}–${end}` : "Removed"}</p>
      {hunk.rows.map((row, index) => (
        <DiffLine key={index} row={row} />
      ))}
    </div>
  );
}

function DiffLine({ row }: { row: DiffRow }) {
  const tone = row.mark === "-" ? "del" : row.mark === "+" ? "ins" : "ctx";
  const label = row.mark === "-" ? "Removed" : row.mark === "+" ? "Added" : undefined;
  return (
    <div className={`dline ${tone}`} data-line={row.newLine ?? undefined} aria-label={label}>
      <span className="gutter" aria-hidden="true">{row.mark === " " ? " " : row.mark}</span>
      <span className="dtext">
        {row.spans.map((span, index) =>
          span.kind === "same" ? <span key={index}>{span.text}</span> : <span key={index} className={span.kind}>{span.text}</span>,
        )}
        {row.spans.every((span) => span.text === "") ? " " : null}
      </span>
    </div>
  );
}
