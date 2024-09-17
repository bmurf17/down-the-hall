"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "How many books read by month";
const chartData = [
  { month: "January", booksRead: 186 },
  { month: "February", booksRead: 305 },
  { month: "March", booksRead: 237 },
  { month: "April", booksRead: 73 },
  { month: "May", booksRead: 209 },
  { month: "June", booksRead: 214 },
];
const chartConfig = {
  booksRead: {
    label: "Books Read",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function Stats() {
  return (
    <>
      <div className="flex flex-col h-[90vh]">
        <div className="flex flex-row gap-4 h-full">
          <Card className="h-full w-5/6">
            <CardHeader>
              <CardTitle>Books Read</CardTitle>
              <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar
                    dataKey="booksRead"
                    fill="var(--color-booksRead)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
