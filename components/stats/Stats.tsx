"use client";

import { useEffect, useState } from "react";
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
import { TabGroup, TabList, Tab, TabPanel } from "@headlessui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";

interface Props {
  currentUserId: string;
}

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

// Helper function to get the absolute URL
const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  // Check if we're in production (Vercel)
  if (process.env.VERCEL_ENV === "production") {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Check if we have a base URL configured
  if (baseUrl) {
    return baseUrl;
  }
  // Fallback to localhost
  return "http://localhost:3000";
};

export default function Stats({ currentUserId }: Props) {
  const [stats, setStats] = useState<BookStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const debug: any = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        vercelUrl: process.env.VERCEL_URL,
        baseApiUrl: process.env.NEXT_PUBLIC_API_URL,
      };

      try {
        setIsLoading(true);
        const baseUrl = getApiUrl();

        console.log(currentUserId);

        // Construct URL ensuring no double slashes
        const apiUrl = `${baseUrl}/api/stats/${currentUserId}`;
        debug.apiUrl = apiUrl;
        debug.userId = currentUserId;

        console.log("Attempting fetch with:", {
          url: apiUrl,
          userId: currentUserId,
          env: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
        });

        const res = await fetch(apiUrl, {
          credentials: "include", // Add credentials
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        debug.statusCode = res.status;
        debug.statusText = res.statusText;

        try {
          debug.headers = Object.fromEntries(res.headers.entries());
        } catch (e) {
          debug.headers = "Could not read headers";
        }

        if (res.status === 404) {
          console.log("404 Not Found for URL:", apiUrl);
          setStats(null);
          setDebugInfo(debug);
          return;
        }

        if (!res.ok) {
          let errorText = "Failed to fetch data";
          try {
            const errorData = await res.text();
            console.error("Error response:", errorData);
            errorText = `Failed to fetch data: ${errorData}`;
            debug.errorResponse = errorData;
          } catch (e) {
            debug.errorResponse = "Could not read error response";
          }
          throw new Error(errorText);
        }

        const data = await res.json();
        debug.dataReceived = !!data;
        debug.dataLength = Array.isArray(data) ? data.length : "not an array";
        setStats(data);
        setDebugInfo(debug);
      } catch (err) {
        debug.error = err instanceof Error ? err.message : "An error occurred";
        debug.errorStack = err instanceof Error ? err.stack : undefined;
        console.error("Full error details:", debug);
        setError(debug.error);
        setDebugInfo(debug);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg">Loading stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Error: {error}</p>
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm overflow-auto max-w-2xl">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg">No stats available</p>
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm overflow-auto max-w-2xl">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  const pagesChartData = stats?.map((stat) => {
    const [year, month] = stat.month.split("-");
    return {
      month: MONTH_NAMES[parseInt(month, 10) - 1],
      pagesRead: parseInt(stat.totalPages, 10),
    };
  });

  const booksChartData = stats?.map((stat) => {
    const [year, month] = stat.month.split("-");
    return {
      month: MONTH_NAMES[parseInt(month, 10) - 1],
      booksRead: parseInt(stat.bookCount, 10),
    };
  });

  const tabItems = [
    { value: "Pages", label: "Pages" },
    { value: "book", label: "Books" },
  ];

  return (
    <>
      <TabGroup>
        <TabList className="flex gap-4 w-full sm:mx-auto overflow-x-auto overflow-y-hidden no-scrollbar ">
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
      </TabGroup>
    </>
  );
}
