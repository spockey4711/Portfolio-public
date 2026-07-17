"use client";

import { useId, useMemo, useState } from "react";

import { MonoLabel } from "@/components/ui/MonoLabel";
import { getCopy } from "@/content/copy";
import {
  DEFAULT_PROOF_INPUT,
  DURATION_MAX_HOURS,
  DURATION_MIN_HOURS,
  DURATION_STEP_HOURS,
  PROOF_TARGET_MAX,
  computeFuelivoProof,
  type Heat,
  type Intensity,
  type ProofInput,
  type ProofTarget,
  type Sport,
  type TraceStep,
} from "@/lib/fuelivo/proof";
import { type Locale, localeTag } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";

/**
 * The interactive fuelivo proof (S4-5): a self-contained calculator on the fuelivo
 * detail page that turns fuelivo's strongest claim - deterministic, explainable
 * output - into something the visitor can touch. It reruns the same deterministic
 * engine (lib/fuelivo/proof.ts) on every input change and renders each target with
 * the reasoning trace behind its number, so "same inputs -> same output, and here
 * is exactly why" is visible rather than asserted.
 *
 * Its initial state is DEFAULT_PROOF_INPUT, so the server render and the first
 * client render compute the identical result (no hydration mismatch, reserved
 * height, no layout shift). It is pure client math with no dependencies, no data
 * fetching and no secrets, so its code-split chunk hydrates below the fold without
 * moving the fuelivo page's Lighthouse score.
 *
 * The only motion is the bars easing to their new length, gated behind Tailwind's
 * `motion-safe:` variant; under `prefers-reduced-motion` the bars snap and the
 * widget stays fully usable - the static equivalent. Every value is real text, so
 * the proof reads without color or animation.
 */

const LIVE_CALCULATOR_URL = "https://fuelivo.de";

const INTENSITY_ORDER: readonly Intensity[] = ["easy", "moderate", "hard"];
const SPORT_ORDER: readonly Sport[] = ["run", "bike", "swim"];
const HEAT_ORDER: readonly Heat[] = ["cool", "warm", "hot"];

type ProofCopy = ReturnType<typeof getCopy>["projects"]["proof"];

/**
 * A segmented single-choice control. Rendered as a labelled radiogroup so a
 * keyboard or screen-reader user gets real radio semantics while it looks like a
 * row of pills. Options are compared by their `value`, so the active pill is driven
 * by state, never by color alone (the checked one also carries `aria-checked`).
 */
function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span id={`${label}-label`} className="font-mono text-[11px] tracking-[0.5px] text-ink-soft">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={`${label}-label`} className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-pill border px-3 py-1.5 font-sans text-sm transition-colors motion-reduce:transition-none",
                active
                  ? "border-pine bg-pine/10 text-ink"
                  : "border-line bg-bg text-ink-soft hover:border-line-strong hover:text-ink",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Render a target's reasoning trace as one plain-text line, e.g.
 * "Basis 60 · +15 Intensität · +10 Sportart · gedeckelt bei 90". */
function TraceLine({
  steps,
  cappedAt,
  copy,
  locale,
}: {
  steps: readonly TraceStep[];
  cappedAt: number | undefined;
  copy: ProofCopy;
  locale: Locale;
}) {
  const tag = localeTag[locale];
  const parts = steps.map((step) => {
    if (step.kind === "base") {
      return `${copy.trace.base} ${step.delta.toLocaleString(tag)}`;
    }
    if (step.kind === "cap") {
      return `${copy.trace.capped} ${(cappedAt ?? 0).toLocaleString(tag)}`;
    }
    const label = copy.trace[step.kind];
    const sign = step.delta > 0 ? "+" : "";
    return `${sign}${step.delta.toLocaleString(tag)} ${label}`;
  });

  return <p className="font-mono text-[11px] leading-relaxed text-muted">{parts.join(" · ")}</p>;
}

/** One target row: label, value + unit, a proportional bar and the reasoning trace. */
function TargetRow({
  label,
  unit,
  max,
  target,
  copy,
  locale,
}: {
  label: string;
  unit: string;
  max: number;
  target: ProofTarget;
  copy: ProofCopy;
  locale: Locale;
}) {
  const percent = Math.max(0, Math.min(100, Math.round((target.value / max) * 100)));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-sans text-sm text-ink-soft">{label}</span>
        <span className="font-display text-ink tabular-nums">
          <span className="text-[1.35rem] leading-none">
            {target.value.toLocaleString(localeTag[locale])}
          </span>{" "}
          <span className="font-mono text-[11px] text-ink-soft">{unit}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-pill bg-line/60" role="presentation">
        <div
          className="h-full rounded-pill bg-pine motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <TraceLine steps={target.steps} cappedAt={target.cappedAt} copy={copy} locale={locale} />
    </div>
  );
}

export function FuelivoProof({ locale }: { locale: Locale }) {
  const copy = getCopy(locale).projects.proof;
  const [input, setInput] = useState<ProofInput>(DEFAULT_PROOF_INPUT);
  const result = useMemo(() => computeFuelivoProof(input), [input]);
  const durationLabelId = useId();

  const durationDisplay = `${input.durationHours.toLocaleString(localeTag[locale])} ${copy.controls.durationUnit}`;

  return (
    <section
      aria-label={copy.title}
      className="rounded-card border border-line bg-surface p-6 shadow-widget sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-2">
        <MonoLabel tone="pine">{copy.eyebrow}</MonoLabel>
        <h3 className="font-display text-xl leading-tight tracking-[-0.01em] text-ink">
          {copy.title}
        </h3>
        <p className="max-w-[56ch] text-sm leading-relaxed text-muted">{copy.intro}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Controls: the session the visitor drives. */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              id={durationLabelId}
              htmlFor={`${durationLabelId}-input`}
              className="flex items-baseline justify-between font-mono text-[11px] tracking-[0.5px] text-ink-soft"
            >
              <span>{copy.controls.duration}</span>
              <span className="text-ink tabular-nums">{durationDisplay}</span>
            </label>
            <input
              id={`${durationLabelId}-input`}
              type="range"
              min={DURATION_MIN_HOURS}
              max={DURATION_MAX_HOURS}
              step={DURATION_STEP_HOURS}
              value={input.durationHours}
              onChange={(event) =>
                setInput((prev) => ({ ...prev, durationHours: Number(event.target.value) }))
              }
              className="w-full accent-pine"
            />
          </div>

          <SegmentedControl
            label={copy.controls.intensity}
            value={input.intensity}
            options={INTENSITY_ORDER.map((value) => ({
              value,
              label: copy.controls.intensityOptions[value],
            }))}
            onChange={(intensity) => setInput((prev) => ({ ...prev, intensity }))}
          />

          <SegmentedControl
            label={copy.controls.sport}
            value={input.sport}
            options={SPORT_ORDER.map((value) => ({
              value,
              label: copy.controls.sportOptions[value],
            }))}
            onChange={(sport) => setInput((prev) => ({ ...prev, sport }))}
          />

          <SegmentedControl
            label={copy.controls.heat}
            value={input.heat}
            options={HEAT_ORDER.map((value) => ({
              value,
              label: copy.controls.heatOptions[value],
            }))}
            onChange={(heat) => setInput((prev) => ({ ...prev, heat }))}
          />
        </div>

        {/* Output: the deterministic targets and their reasoning, per hour. */}
        <div className="flex flex-col gap-5">
          <MonoLabel tone="muted" className="tracking-[1.5px]">
            {copy.outputs.perHour}
          </MonoLabel>
          <TargetRow
            label={copy.outputs.carbs.label}
            unit={copy.outputs.carbs.unit}
            max={PROOF_TARGET_MAX.carbs}
            target={result.carbs}
            copy={copy}
            locale={locale}
          />
          <TargetRow
            label={copy.outputs.fluid.label}
            unit={copy.outputs.fluid.unit}
            max={PROOF_TARGET_MAX.fluid}
            target={result.fluid}
            copy={copy}
            locale={locale}
          />
          <TargetRow
            label={copy.outputs.sodium.label}
            unit={copy.outputs.sodium.unit}
            max={PROOF_TARGET_MAX.sodium}
            target={result.sodium}
            copy={copy}
            locale={locale}
          />
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 border-t border-line/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[52ch] font-mono text-[11px] leading-relaxed text-muted">
          {copy.disclaimer}
        </p>
        <a
          href={LIVE_CALCULATOR_URL}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 font-mono text-xs tracking-[0.5px] text-pine uppercase transition-colors hover:text-signal motion-reduce:transition-none"
        >
          {copy.viewLive} ↗
        </a>
      </div>
    </section>
  );
}
