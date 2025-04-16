"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PricePoint } from "@/types/grocery";
import { useState, useMemo } from "react";
import { currencyFormat, formatDate } from "@/lib/utils";
import TooltipFormat from "../price-chart/tooltip-formatter";
import TimeFrameSelector from "./time-frame-buttons";
import DateNavigation from "./date-navigation";
import CustomizedDot from "./customized-dot";
import {
  checkCanNavigateNext,
  checkCanNavigatePrev,
  getDateRange,
  getEquivalentDateForTimeFrame,
  getNextDate,
  getPrevDate,
  hasDataInRange,
  prepareChartData,
} from "./price-chart-utils";
import { ChartDataPoint, TimeFrame } from "@/types/price-chart";

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
  const dates = data.map((item) => new Date(formatDate(item.date)));
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  const [currentDate, setCurrentDate] = useState<Date>(maxDate);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("all");

  const handleSetTimeFrame = (newTimeFrame: TimeFrame) => {
    const equivalentDate = getEquivalentDateForTimeFrame(
      currentDate,
      timeFrame,
      newTimeFrame,
      minDate,
      maxDate
    );

    setCurrentDate(equivalentDate);
    setTimeFrame(newTimeFrame);
  };

  const canNavigateNext = checkCanNavigateNext(timeFrame, currentDate, maxDate);
  const canNavigatePrev = checkCanNavigatePrev(timeFrame, currentDate, minDate);

  const navigateNext = () => {
    if (timeFrame === "all") return;

    const newDate = getNextDate(currentDate, timeFrame);

    if (newDate > maxDate) {
      newDate.setTime(maxDate.getTime());
    }

    setCurrentDate(newDate);
  };

  const navigatePrev = () => {
    if (timeFrame === "all") return;

    const newDate = getPrevDate(currentDate, timeFrame);

    if (newDate < minDate) {
      newDate.setTime(minDate.getTime());
    }

    setCurrentDate(newDate);
  };

  const dateRange = getDateRange(minDate, maxDate, timeFrame, currentDate);

  const hasData =
    dateRange.start &&
    dateRange.end &&
    hasDataInRange(data, dateRange.start, dateRange.end);

  const yAxisDomain = useMemo(() => {
    if (!data || data.length === 0) return [0, 10];

    // TODO: evenly spaced yAxis
    const prices = data.map((item) => item.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1; // Add 10% padding

    return [Math.max(0, min - padding), max + padding];
  }, [data]);

  const chartData = useMemo(() => {
    if (!hasData) return [];

    return prepareChartData(timeFrame, dateRange.start, dateRange.end, data);
  }, [data, timeFrame, currentDate, hasData]);

  return (
    <>
      <TimeFrameSelector
        timeFrame={timeFrame}
        handleSetTimeFrame={handleSetTimeFrame}
      />
      <DateNavigation
        timeFrame={timeFrame}
        dateRange={dateRange}
        canNavigateNext={canNavigateNext}
        canNavigatePrev={canNavigatePrev}
        navigateNext={navigateNext}
        navigatePrev={navigatePrev}
      />
      {hasData ? (
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
              interval={timeFrame === "1m" ? 3 : 0}
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
                    const data = payload as unknown as ChartDataPoint;
                    return (
                      <TooltipFormat
                        data={data}
                        timeFrame={timeFrame}
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
      ) : (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No price data for this time period.
        </div>
      )}
    </>
  );
}
