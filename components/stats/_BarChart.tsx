import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { Card } from "../ui/card";

export interface Bar {
  label: string;
  value: number;
  fill: string;
}

interface Props {
  data: Bar[];
}

export default function ResponsiveD3BarChart({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 175 });

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const parentWidth = svgRef.current.parentElement?.clientWidth || 400;
        setDimensions({
          width: parentWidth,
          height: parentWidth * 0.44,
        });
      }
    };

    // Initial resize
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = {
      top: width * 0.05,
      right: width * 0.05,
      bottom: width * 0.075,
      left: width * 0.1,
    };

    const chart = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 5])
      .range([chartHeight, 0]);

    // X-axis
    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0))
      .selectAll("text")
      .style("font-size", `${width * 0.02}px`);

    // Y-axis
    chart
      .append("g")
      .call(d3.axisLeft(yScale).tickSizeOuter(0))
      .selectAll("text")
      .style("font-size", `${width * 0.015}px`); // Reduced font size

    // Tooltip logic
    const tooltip = d3.select(tooltipRef.current);

    // Bars
    chart
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.label) || 0)
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => chartHeight - yScale(d.value))
      .attr("class", (d) => d.fill)
      .attr("rx", width * 0.01)
      .attr("ry", width * 0.01)
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`${d.label}: ${d.value}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });
  }, [data, dimensions]);

  return (
    <Card className="p-4 relative">
      <h2 className="text-xl font-bold mb-4">Pages Read By Month</h2>
      <svg ref={svgRef} className="w-full"></svg>
      <div
        ref={tooltipRef}
        className="absolute bg-black text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 transition-opacity duration-200"
        style={{
          position: "fixed",
          zIndex: 10,
        }}
      ></div>
    </Card>
  );
}
