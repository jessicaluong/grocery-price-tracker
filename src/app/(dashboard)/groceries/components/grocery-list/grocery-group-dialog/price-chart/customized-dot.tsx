import React from "react";
import { Dot } from "recharts";

type CustomizedDotProps = {
  cx: number;
  cy: number;
  value: number;
  index: number;
  payload: any; // TODO: use proper type instead of any
  stroke?: string;
  fill?: string;
  r?: number;
};

type HybridDotProps = {
  cx: number;
  cy: number;
  r: number;
  salePercentage: number;
};

const HybridDot = ({ cx, cy, r, salePercentage }: HybridDotProps) => (
  <g>
    <path
      d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${
        salePercentage > 0.5 ? 1 : 0
      } 1
        ${cx + r * Math.sin(2 * Math.PI * salePercentage)}
        ${cy - r * Math.cos(2 * Math.PI * salePercentage)} Z`}
      fill={"var(--color-sale)"}
    />
    <path
      d={`M ${cx} ${cy} L
        ${cx + r * Math.sin(2 * Math.PI * salePercentage)}
        ${cy - r * Math.cos(2 * Math.PI * salePercentage)}
        A ${r} ${r} 0 ${salePercentage > 0.5 ? 0 : 1} 1 ${cx} ${cy - r} Z`}
      fill={"var(--color-price)"}
    />
  </g>
);

export default function CustomizedDot(props: CustomizedDotProps) {
  const { cx, cy, stroke, payload, value } = props;

  if (payload.price === null) return <g />;

  const regCount = payload.count - payload.saleCount;
  const salePercentage = payload.saleCount / payload.count;

  if (payload.saleCount === 0) {
    return (
      <Dot
        r={4}
        cx={cx}
        cy={cy}
        fill={"var(--color-price)"}
        stroke={"var(--color-price)"}
      />
    );
  } else if (regCount === 0) {
    return (
      <Dot
        r={4}
        cx={cx}
        cy={cy}
        fill={"var(--color-sale)"}
        stroke={"var(--color-sale)"}
      />
    );
  } else {
    return <HybridDot r={4} cx={cx} cy={cy} salePercentage={salePercentage} />;
  }
}
