'use client';

interface Prop {
  handleClick: () => {};
  styles: string;
  icon: JSX.Element;
  tooltipText: string
}

export default function IconButton({ handleClick, styles, icon, tooltipText }: Prop) {
  return (
    <div className="group relative flex justify-center">
      <button onClick={handleClick} className='p-2 hover:bg-yellow-500 bg-slate-300 rounded-lg'>
        {icon}
      </button>

      <span className='absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-base text-white group-hover:scale-100 w-auto'>
        {tooltipText}
      </span>
    </div>
  );
}
