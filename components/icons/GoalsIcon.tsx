import { SVGProps } from "react";

export function GoalsIcon(
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
      {/* Outer circle */}
      <circle cx="12" cy="12" r="9" />
      {/* Middle circle */}
      <circle cx="12" cy="12" r="6" />
      {/* Inner circle */}
      <circle cx="12" cy="12" r="3" />
      {/* Arrow (optional, pointing to the bullseye) */}
      <line x1="20" y1="4" x2="12" y2="12" />
      <line x1="20" y1="4" x2="18" y2="7" />
      <line x1="20" y1="4" x2="17" y2="5" />
    </svg>
  );
}
