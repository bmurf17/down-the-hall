interface Props {
  label: string;
  type: string;
  defaultValue: string | number;
}

export default function Input({ label, type, defaultValue }: Props) {
  return (
    <div className='flex items-center'>
      <label className='block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4'>
        {label}
      </label>
      <input
        className='appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500'
        type={type}
        defaultValue={defaultValue}
      />
    </div>
  );
}
