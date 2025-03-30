"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PricePoint } from "@/types/grocery";
import React, { useEffect } from "react";
import { currencyFormat, formatDate, formatMonthYear } from "@/lib/utils";
import TooltipFormat from "../price-chart/tooltip-formatter";
import TimeFrameSelector from "./time-frame-buttons";
import DateNavigation from "./date-navigation";
import CustomizedDot from "./customized-dot";
import {
  aggregateDataByMonth,
  calculateDateRange,
  generateMonthlyIntervals,
  getMonthKey,
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
  hybrid: {
    label: "Sale",
    color: "hsl(var(--chart-hybrid))",
  },
} satisfies ChartConfig;

export function PriceChart({ data }: PriceChartProps) {
  const { timeFrame } = usePriceChart();
  const [dateRange, setDateRange] = React.useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  const yAxisDomain = React.useMemo(() => {
    if (!data || data.length === 0) return [0, 10];

    // TODO: evenly spaced yAxis
    const prices = data.map((item) => item.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1; // Add 10% padding

    return [Math.max(0, min - padding), max + padding];
  }, [data]);

  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    // should already be sorted but defensive programming
    // if sorted, min is first and max is last
    const dates = data.map((item) => new Date(formatDate(item.date)));
    // const minDate = dates[0];
    // const maxDate = dates.at(-1);
    // if (maxDate) {
    //   generateIntervals(minDate, maxDate);
    // }
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const { start, end } = calculateDateRange(minDate, maxDate, timeFrame);
    setDateRange({ start, end });

    switch (timeFrame) {
      case "all":
      case "y": {
        const { intervals, hasJanuary } = generateMonthlyIntervals(start, end);
        const aggregateData = aggregateDataByMonth(data);

        const processedData = intervals.map((interval: Date, index: number) => {
          let xAxisLabel = "";
          if (timeFrame === "all") {
            xAxisLabel = hasJanuary
              ? interval.getMonth() === 0
                ? interval.getFullYear().toString()
                : ""
              : index === 0
              ? interval.getFullYear().toString()
              : "";
          } else if (timeFrame === "y") {
            xAxisLabel = interval
              .toLocaleDateString("en-US", { month: "short" })
              .charAt(0);
          }

          const monthData = aggregateData.get(getMonthKey(interval));
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
        return processedData;
      }
      case "3m": // jan-mar, apr-jun, jul-sep, oct-dec (weekly averages)
        break;
      case "1m": // 1-31 (daily averages)
        break;
    }
  }, [data, timeFrame]);

  return (
    <>
      <TimeFrameSelector />
      <DateNavigation dateRange={dateRange} />
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="xAxisLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            // tick={{ fontSize: 12 }}
            // minTickGap={5}
            interval={0}

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
