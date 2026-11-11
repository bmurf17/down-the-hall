import { SVGProps } from "react";

/** Upright books standing on a shelf, for the realistic spines view. */
export function SpinesIcon(
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
      <path d="M3 20h18" />
      <rect x="4" y="6" width="3" height="11" rx="0.5" />
      <rect x="8" y="4" width="3.5" height="13" rx="0.5" />
      <rect x="12.5" y="7" width="3" height="10" rx="0.5" />
      <path d="M17.5 5.5l2.7 11.4" />
      <path d="M18 8.5l2.2-.6" />
    </svg>
  );
}
