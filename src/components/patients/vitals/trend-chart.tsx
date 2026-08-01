"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface TrendPoint {
  label: string;
  value: number;
}

const CHART_WIDTH = 520;
const CHART_HEIGHT = 180;
const PAD_X = 52;
const PAD_TOP = 18;
const PAD_BOTTOM = 30;

function formatTick(value: number): string {
  if (Number.isInteger(value)) return String(value);

  return value.toFixed(1);
}

function TrendChartSvg({ points }: { points: TrendPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-[12px] text-[#888888]">
        No recorded values available for this parameter.
      </div>
    );
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const plotWidth = CHART_WIDTH - PAD_X * 2;
  const plotHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (index: number) =>
    PAD_X +
    (points.length === 1
      ? plotWidth / 2
      : (index / (points.length - 1)) * plotWidth);

  const y = (value: number) =>
    PAD_TOP + (1 - (value - min) / spread) * plotHeight;

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point.value)}`)
    .join(" ");

  const areaPath = `${linePath} L${x(points.length - 1)},${CHART_HEIGHT - PAD_BOTTOM} L${x(0)},${CHART_HEIGHT - PAD_BOTTOM} Z`;

  const mid = (min + max) / 2;

  const timeLabel = (index: number) => {
    const label = points[index]?.label ?? "";

    return label.length >= 16 ? label.slice(11, 16) : label;
  };

  const gridline = (value: number) => (
    <line
      x1={PAD_X}
      y1={y(value)}
      x2={CHART_WIDTH - PAD_X}
      y2={y(value)}
      stroke="#e5e5e5"
      strokeWidth={1}
      strokeDasharray="3 3"
    />
  );

  const yLabel = (value: number) => (
    <text
      x={PAD_X - 6}
      y={y(value) + 3}
      textAnchor="end"
      fontSize={9}
      fill="#777777"
    >
      {formatTick(value)}
    </text>
  );

  return (
    <svg
      width={CHART_WIDTH}
      height={CHART_HEIGHT}
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      role="img"
      aria-label="Historical trend chart"
    >
      {gridline(min)}
      {gridline(mid)}
      {gridline(max)}
      {yLabel(max)}
      {yLabel(mid)}
      {yLabel(min)}

      <path d={areaPath} fill="#d9534f" opacity={0.08} />
      <path
        d={linePath}
        fill="none"
        stroke="#d9534f"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {points.map((point, index) => (
        <circle
          key={`${index}-${point.value}`}
          cx={x(index)}
          cy={y(point.value)}
          r={3}
          fill="#ffffff"
          stroke="#d9534f"
          strokeWidth={1.5}
        />
      ))}

      <text
        x={x(0)}
        y={CHART_HEIGHT - 12}
        textAnchor="start"
        fontSize={9}
        fill="#777777"
      >
        {timeLabel(0)}
      </text>

      {points.length > 2 && (
        <text
          x={x(Math.floor((points.length - 1) / 2))}
          y={CHART_HEIGHT - 12}
          textAnchor="middle"
          fontSize={9}
          fill="#777777"
        >
          {timeLabel(Math.floor((points.length - 1) / 2))}
        </text>
      )}

      <text
        x={x(points.length - 1)}
        y={CHART_HEIGHT - 12}
        textAnchor="end"
        fontSize={9}
        fill="#777777"
      >
        {timeLabel(points.length - 1)}
      </text>
    </svg>
  );
}

export function TrendDialog({
  open,
  onOpenChange,
  title,
  reference,
  points,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  reference?: string;
  points: TrendPoint[];
}) {
  const sorted = [...points].sort(
    (a, b) => new Date(a.label).getTime() - new Date(b.label).getTime(),
  );

  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{title} — Trend</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="overflow-x-auto rounded-[6px] border border-[#eeeeee] bg-white p-2">
            <TrendChartSvg points={sorted} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#777777]">
            {reference && (
              <span>
                Reference range: <span className="font-semibold text-[#555555]">{reference}</span>
              </span>
            )}

            {latest && (
              <span>
                Latest:{" "}
                <span className="font-semibold text-[#d9534f]">
                  {latest.value} @ {latest.label}
                </span>
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
