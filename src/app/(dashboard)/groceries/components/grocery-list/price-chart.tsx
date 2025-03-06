"use client";

import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PricePoint } from "@/lib/types";

type PriceChartProps = {
  priceHistory: PricePoint[];
};

// const chartData = [
//   { month: "January", price: 186 },
//   { month: "February", price: 305 },
//   { month: "March", price: 237 },
//   { month: "April", price: 73 },
//   { month: "May", price: 209 },
//   { month: "June", price: 214 },
// ];

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function PriceChart({ priceHistory }: PriceChartProps) {
  const chartData = priceHistory.map((point) => ({
    // Keep the date as a timestamp for scaling
    id: point.id,
    date: new Date(point.date).getTime(),
    displayDate: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    price: point.price,
    isSale: point.isSale,
  }));

  console.log("Processed chartData:", chartData);

  return (
    <Card>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              scale="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              interval="preserveStartEnd"
              tickFormatter={(timestamp) => {
                return new Date(timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
              // labelFormatter={(timestamp) => {
              //   return new Date(Number(timestamp)).toLocaleDateString("en-US", {
              //     month: "short",
              //     day: "numeric",
              //   });
              // }}
            />
            <Line
              dataKey="price"
              type="natural"
              stroke="var(--color-price)"
              strokeWidth={2}
              dot={({ cx, cy, payload }) => {
                const r = 24;
                return (
                  <circle
                    key={`dot-${payload.id}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={payload.isSale ? "red" : "var(--color-price)"}
                    stroke={payload.isSale ? "red" : "var(--color-price)"}
                  />
                );
              }}
              // activeDot={{
              //   r: 6,
              // }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// export function PriceChart({ priceHistory }: PriceChartProps) {
//   const chartData = priceHistory.map((point) => ({
//     date: new Date(point.date).toLocaleDateString(),
//     price: point.price,
//     isSale: point.isSale,
//   }));

//   return (
//     <Card>
//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <LineChart
//             accessibilityLayer
//             data={chartData}
//             margin={{
//               left: 12,
//               right: 12,
//             }}
//           >
//             <CartesianGrid vertical={false} />
//             <XAxis
//               dataKey="date"
//               tickLine={false}
//               axisLine={false}
//               tickMargin={8}
//               interval="preserveStartEnd"
//               // tickFormatter={(value) => value.slice(0, 3)}
//             />
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent hideIndicator />}
//             />
//             <Line
//               dataKey="price"
//               type="natural"
//               stroke="var(--color-price)"
//               strokeWidth={2}
//               dot={({ cx, cy, payload }) => {
//                 const r = 24;
//                 return (
//                   <circle
//                     key={`dot-${payload.date}`}
//                     cx={cx}
//                     cy={cy}
//                     r={4}
//                     fill={payload.isSale ? "red" : "var(--color-price)"}
//                     stroke={payload.isSale ? "red" : "var(--color-price)"}
//                   />
//                 );
//               }}
//               // activeDot={{
//               //   r: 6,
//               // }}
//             />
//           </LineChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }
