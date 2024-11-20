"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BookStatsResponse } from "@/types/stats/monthlyBooksStats";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";

interface Props {
  stats: BookStatsResponse;
}

export const description = "How many pages read by month";

const chartConfig = {
  pagesRead: {
    label: "Pages Read",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Stats({ stats }: Props) {
  const chartData = stats.map((stat) => {
    const [year, month] = stat.month.split("-");
    return {
      month: MONTH_NAMES[parseInt(month, 10) - 1],
      pagesRead: parseInt(stat.totalPages, 10),
    };
  });

  return (
    <div className="h-screen p-4 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Pages Read</CardTitle>
            <CardDescription>
              {chartData[0]?.month} - {chartData[chartData.length - 1]?.month}{" "}
              2024
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ChartContainer config={chartConfig} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                    dataKey="pagesRead"
                    fill="var(--color-pagesRead)"
                    radius={4}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {chartData.reduce((sum, data) => sum + data.pagesRead, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Pages per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {Math.round(
                chartData.reduce((sum, data) => sum + data.pagesRead, 0) /
                  chartData.length
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Most Productive Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {
                chartData.reduce((max, data) =>
                  data.pagesRead > max.pagesRead ? data : max
                ).month
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
