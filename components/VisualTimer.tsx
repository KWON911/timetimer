"use client";

import { useRef } from "react";
import { TIMER_COLOR_HEX, TimerColor } from "@/lib/types";

interface VisualTimerProps {
  remainingSeconds: number;
  color: TimerColor;
  isLocked: boolean;
  isRunning: boolean;
  onMinutesChanged: (minutes: number) => void;
}

const SIZE = 300;
const VIEW_SIZE = 300; // 캔버스를 숫자가 겨우 들어갈 만큼만 여유를 둬 빈 여백을 최소화
const CENTER = VIEW_SIZE / 2;
const CIRCLE_RADIUS = SIZE * 0.37; // circleSize(0.74) / 2
// 흰색 도형(경과 표시)을 빨간 원과 정확히 같은 반지름으로 겹치면
// 안티앨리어싱 때문에 테두리에 빨간 이음새가 얇게 비친다.
// 흰색 쪽만 살짝 더 크게 그려서 그 이음새를 가린다.
const COVER_RADIUS = CIRCLE_RADIUS + 1;
const MAJOR_TICK_LENGTH = SIZE * 0.0325; // 큰 눈금 길이 (기존의 절반)
const MINOR_TICK_LENGTH = SIZE * 0.019; // 작은 눈금 길이 (기존의 절반)
const TICK_OUTER_RADIUS = CIRCLE_RADIUS + MAJOR_TICK_LENGTH; // 큰 눈금 바깥쪽 끝 (원과 눈금 사이 간격 없음)
const NUMBER_RADIUS = TICK_OUTER_RADIUS + SIZE * 0.035; // 숫자는 눈금보다 더 바깥

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function elapsedPiePath(progress: number): string {
  const safeProgress = Math.min(Math.max(progress, 0), 1);
  if (safeProgress <= 0) return "";

  if (safeProgress >= 0.999999) {
    return `M ${CENTER} ${CENTER - COVER_RADIUS}
            A ${COVER_RADIUS} ${COVER_RADIUS} 0 1 1 ${CENTER - 0.01} ${CENTER - COVER_RADIUS}
            Z`;
  }

  const startDeg = -90;
  const endDeg = -90 + 360 * safeProgress;
  const largeArc = safeProgress > 0.5 ? 1 : 0;

  const toXY = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [
      round(CENTER + Math.cos(rad) * COVER_RADIUS),
      round(CENTER + Math.sin(rad) * COVER_RADIUS),
    ];
  };

  const [sx, sy] = toXY(startDeg);
  const [ex, ey] = toXY(endDeg);

  return `M ${CENTER} ${CENTER} L ${sx} ${sy} A ${COVER_RADIUS} ${COVER_RADIUS} 0 ${largeArc} 1 ${ex} ${ey} Z`;
}

export function VisualTimer({
  remainingSeconds,
  color,
  isLocked,
  isRunning,
  onMinutesChanged,
}: VisualTimerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const total = 60 * 60;
  const safeRemaining = Math.min(Math.max(remainingSeconds, 0), total);
  const progress = 1 - safeRemaining / total;

  const handlePointer = (clientX: number, clientY: number) => {
    if (isLocked || isRunning || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scale = VIEW_SIZE / rect.width;
    const x = (clientX - rect.left) * scale;
    const y = (clientY - rect.top) * scale;

    const dx = x - CENTER;
    const dy = y - CENTER;

    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    angle += 90;
    if (angle < 0) angle += 360;

    let minutes = 60 - Math.round(angle / 6);
    if (minutes <= 0) minutes = 1;
    minutes = Math.min(Math.max(minutes, 1), 60);

    onMinutesChanged(minutes);
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    handlePointer(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    handlePointer(e.clientX, e.clientY);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const ticks = Array.from({ length: 60 }, (_, minute) => {
    const isMajor = minute % 5 === 0;
    const angle = minute * 6;
    const length = isMajor ? MAJOR_TICK_LENGTH : MINOR_TICK_LENGTH;
    const width = isMajor ? 2.8 : 1.15;

    return (
      <rect
        key={minute}
        x={CENTER - width / 2}
        y={CENTER - CIRCLE_RADIUS - length}
        width={width}
        height={length}
        fill={isMajor ? "rgba(0,0,0,0.95)" : "rgba(107,114,128,0.7)"}
        transform={`rotate(${angle} ${CENTER} ${CENTER})`}
      />
    );
  });

  const numbers = Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
    const value = minute === 0 ? 0 : 60 - minute;
    const degrees = minute * 6 - 90;
    const radians = (degrees * Math.PI) / 180;

    const x = round(CENTER + Math.cos(radians) * NUMBER_RADIUS);
    const y = round(CENTER + Math.sin(radians) * NUMBER_RADIUS);

    return (
      <text
        key={minute}
        x={x}
        y={y}
        fontSize={SIZE * 0.095 * 0.5}
        fontWeight="bold"
        fill="black"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </text>
    );
  });

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      className="h-full w-full touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <defs>
        <radialGradient
          id="whiteAreaShadow"
          cx={CENTER}
          cy={CENTER}
          r={COVER_RADIUS}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="88%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eeeeee" />
        </radialGradient>
      </defs>

      <circle cx={CENTER} cy={CENTER} r={COVER_RADIUS} fill="white" />

      <circle cx={CENTER} cy={CENTER} r={CIRCLE_RADIUS} fill={TIMER_COLOR_HEX[color]} />

      {progress > 0 && (
        <path d={elapsedPiePath(progress)} fill="url(#whiteAreaShadow)" />
      )}

      {ticks}
      {numbers}

      <circle cx={CENTER} cy={CENTER} r={CIRCLE_RADIUS * 0.075} fill="#1F1F1F" />
    </svg>
  );
}
