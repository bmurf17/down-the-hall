"use client";

interface Prop {
  handleClick: () => void;
  styles: string;
  icon: JSX.Element;
  tooltipText: string;
  active: boolean;
}

export default function IconButton({
  handleClick,
  styles,
  icon,
  tooltipText,
  active,
}: Prop) {
  return (
    <div className="group relative flex justify-center">
      <button
        type="button"
        onClick={handleClick}
        aria-label={tooltipText}
        aria-pressed={active}
        className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 transition-colors hover:bg-yellow-500 ${
          active ? "bg-yellow-500" : "bg-slate-300"
        } ${styles}`}
      >
        {icon}
      </button>

      <span className="pointer-events-none absolute top-12 z-20 w-auto scale-0 rounded bg-gray-800 p-2 text-base text-white transition-all group-hover:scale-100">
        {tooltipText}
      </span>
    </div>
  );
}
