"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PricePoint } from "@/types/grocery";
import React from "react";
import { currencyFormat, formatDate, formatMonthYear } from "@/lib/utils";
import TooltipFormat from "../price-chart/tooltip-formatter";
import TimeFrameSelector from "./time-frame-buttons";
import DateNavigation from "./date-navigation";
import CustomizedDot from "./customized-dot";
import {
  aggregateDataByMonth,
  generateIntervals,
  getKey,
} from "./price-chart-utils";
import { usePriceChart } from "@/hooks/use-price-chart";

type PriceChartProps = {
  data: PricePoint[];
};

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--themed-primary))",
  },
  sale: {
    label: "Sale",
    color: "hsl(var(--sale))",
  },
} satisfies ChartConfig;

export function PriceChart({ data }: PriceChartProps) {
  const { handleSetDateRange } = usePriceChart();

  const yAxisDomain = React.useMemo(() => {
    if (!data || data.length === 0) return [0, 10];

    const prices = data.map((item) => item.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1; // Add 10% padding

    return [Math.max(0, min - padding), max + padding];
  }, [data]);

  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // should already be sorted but defensive programming
    // double check
    // if sorted, min is first and max is last
    const dates = data.map((item) => new Date(formatDate(item.date)));
    // const minDate = dates[0];
    // const maxDate = dates.at(-1);
    // if (maxDate) {
    //   generateIntervals(minDate, maxDate);
    // }

    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    handleSetDateRange({ start: minDate, end: maxDate });

    const { intervals, hasJanuary } = generateIntervals(minDate, maxDate);

    const aggregateData = aggregateDataByMonth(data);

    const res = intervals.map((interval: Date, index: number) => {
      const xAxisLabel = hasJanuary
        ? interval.getMonth() === 0
          ? interval.getFullYear().toString()
          : ""
        : index === 0
        ? interval.getFullYear().toString()
        : "";

      const monthData = aggregateData.get(getKey(interval));

      return {
        xAxisLabel,
        date: formatMonthYear(interval),
        ...(monthData
          ? {
              price: monthData.avgPrice,
              saleCount: monthData.saleCount,
              count: monthData.count,
              avgSalePrice: monthData.avgSalePrice,
              avgRegPrice: monthData.avgRegPrice,
            }
          : {
              price: null,
              saleCount: null,
              count: null,
              avgSalePrice: null,
              avgRegPrice: null,
            }),
      };
    });
    return res;
  }, [data]);

  return (
    <>
      <TimeFrameSelector />
      <DateNavigation />
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="xAxisLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            // tickFormatter={(timestamp) => {
            //   return new Date(timestamp).toLocaleDateString("en-US", {
            //     month: "short",
            //     day: "numeric",
            //     year: "2-digit",
            //   });
            // }}
          />
          <YAxis
            domain={yAxisDomain}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => currencyFormat(value)}
            tick={{ fontSize: 12 }}
            width={65}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideIndicator
                hideLabel
                formatter={(value, name, entry, index, payload) => {
                  const data = payload as unknown as {
                    date: string;
                    price: number;
                    saleCount: number;
                    count: number;
                    avgSalePrice: number;
                    avgRegPrice: number;
                  };

                  if (data.price === null) return null;

                  return (
                    <TooltipFormat
                      date={data.date}
                      price={data.price}
                      count={data.count}
                      saleCount={data.saleCount}
                      avgSalePrice={data.avgSalePrice}
                      avgRegPrice={data.avgRegPrice}
                    ></TooltipFormat>
                  );
                }}
              />
            }
          />
          <Line
            dataKey="price"
            type="monotone"
            stroke="var(--color-price)"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            connectNulls
            dot={(props) => {
              const { key, ...restProps } = props;
              return <CustomizedDot key={key} {...restProps} />;
            }}
          ></Line>
        </LineChart>
      </ChartContainer>
    </>
  );
}
