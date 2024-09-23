import { SVGProps } from "react";

export function BarChartIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h4V12H4v8z" />
      <path d="M10 20h4V8h-4v12z" />
      <path d="M16 20h4V4h-4v16z" />
    </svg>
  );
}
