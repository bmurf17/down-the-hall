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
import { TabGroup, TabList, Tab, TabPanel } from "@headlessui/react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import D3BarChart from "./_BarChart";
import { DatePicker } from "../shared/DatePicker";
import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const chartConfig = {
  pagesRead: {
    label: "Pages Read",
    color: "hsl(var(--chart-1))",
  },
  booksRead: {
    label: "Books Read",
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

const COLORS = [
  "fill-green-400",
  "fill-amber-400",
  "fill-teal-400",
  "fill-fuchsia-400",
  "fill-fuchsia-400",
  "fill-fuchsia-400",
  "fill-fuchsia-400",
  "fill-fuchsia-400",
  "fill-fuchsia-400",
  "fill-fuchsia-400",
  "fill-fuchsia-400",
  "fill-fuchsia-400",
];


function addMonths(date: Date, months: number) {
  date.setMonth(date.getMonth() + months);
  date.setDate(1)
  return date;
}

export default function Stats({ stats }: { stats: any[] }) {
  const [startDate, setStartDate] = useState<Date>(addMonths(new Date(), -6));
  const [endDate, setEndDate] = useState<Date>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const updateMultipleParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const pagesChartData = stats.map((stat) => {
    const [year, month] = stat.month.split("-");
    return {
      month: MONTH_NAMES[parseInt(month, 10) - 1],
      pagesRead: parseInt(stat.totalPages, 10),
    };
  });

  const booksChartData = stats.map((stat) => {
    const [year, month] = stat.month.split("-");
    return {
      month: MONTH_NAMES[parseInt(month, 10) - 1],
      booksRead: parseInt(stat.bookCount, 10),
    };
  });

  const tabItems = [
    { value: "Pages", label: "Pages" },
    { value: "book", label: "Books" },
    { value: "D3", label: "D3" },
  ];

  const bookData = stats.map((x) => {
    return {
      label: MONTH_NAMES[parseInt(x.month.split("-")[1], 10) - 1],
      value: +x.totalPages,
      fill: COLORS[parseInt(x.month.split("-")[1], 10) - 1],
    };
  });

  const handleDateChange = (
  dateType: "start" | "end",
  date: Date | undefined
) => {
  if (dateType === "start") {
    setStartDate(date || new Date());
  } else {
    setEndDate(date);
  }

  const updatedStartDate = dateType === "start" ? date : startDate;
  const updatedEndDate = dateType === "end" ? date : endDate;

  const newUrl =
    pathname +
    "?" +
    updateMultipleParams({
      start: updatedStartDate?.toISOString().split("T")[0] || "",
      end: updatedEndDate?.toISOString().split("T")[0] || "",
    });

  router.push(newUrl);
};

  return (
    <>
      <TabGroup>
        <TabList className="flex gap-4 w-full sm:mx-auto overflow-x-auto overflow-y-hidden no-scrollbar p-4 pb-0">
          {tabItems?.map((tab) => {
            return (
              <Tab
                key={tab.value}
                className="data-[selected]:border-b-4 data-[selected]:border-primary data-[hover]:border-b-4  data-[hover]:border-primary  text-lg  text-primary  p-2  data-[focus]:outline-1 data-[focus]:outline-white  "
              >
                {tab.label}
              </Tab>
            );
          })}
        </TabList>
        <div className="p-4 pb-0">
          <div className="bg-card gap-4 p-2 rounded-xl">
            Start Date:{" "}
            <DatePicker
              date={startDate}
              onDateSelect={(date) => handleDateChange("start", date)}
            />{" "}
            End Date:
            <DatePicker
              date={endDate}
              onDateSelect={(date) => handleDateChange("end", date)}
            />
          </div>
        </div>

        <TabPanel>
          <div className="min-h-screen p-4 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Pages Read</CardTitle>
                  <CardDescription>
                    {pagesChartData[0]?.month} -{" "}
                    {pagesChartData[pagesChartData.length - 1]?.month} 2024
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[400px] relative">
                  <ChartContainer
                    config={chartConfig}
                    className="h-full w-full"
                  >
                    <BarChart data={pagesChartData}>
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
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {pagesChartData.reduce(
                      (sum, data) => sum + data.pagesRead,
                      0
                    )}
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
                      pagesChartData.reduce(
                        (sum, data) => sum + data.pagesRead,
                        0
                      ) / pagesChartData.length
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
                      pagesChartData.reduce((max, data) =>
                        data.pagesRead > max.pagesRead ? data : max
                      ).month
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="min-h-screen p-4 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Books Read</CardTitle>
                  <CardDescription>
                    {booksChartData[0]?.month} -{" "}
                    {booksChartData[booksChartData.length - 1]?.month} 2024
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[400px] relative">
                  <ChartContainer
                    config={chartConfig}
                    className="h-full w-full"
                  >
                    <BarChart data={booksChartData}>
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
              <Card>
                <CardHeader>
                  <CardTitle>Total Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {booksChartData.reduce(
                      (sum, data) => sum + data.booksRead,
                      0
                    )}
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
                      booksChartData.reduce(
                        (sum, data) => sum + data.booksRead,
                        0
                      ) / pagesChartData.length
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
                      booksChartData.reduce((max, data) =>
                        data.booksRead > max.booksRead ? data : max
                      ).month
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="min-h-screen p-4 overflow-auto">
            <D3BarChart data={bookData} />
          </div>
        </TabPanel>
      </TabGroup>
    </>
  );
}
