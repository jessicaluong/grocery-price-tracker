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

export default function CustomizedDot(props: CustomizedDotProps) {
  const { cx, cy, stroke, payload, value } = props;

  if (payload.price === null) return <g />;

  const regCount = payload.count - payload.saleCount;

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
    return (
      <Dot
        r={4}
        cx={cx}
        cy={cy}
        fill={"var(--color-hybrid)"}
        stroke={"var(--color-hybrid)"}
      />
    );
  }
}
