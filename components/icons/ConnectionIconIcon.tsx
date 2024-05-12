import { SVGProps } from 'react';

export function ConnectionIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'>
      <path d='M21 10c0-4.418-4.03-8-9-8s-9 3.582-9 8c0 2.042.81 3.942 2.262 5.364A7.88 7.88 0 0 0 3 18.582v1.827l3.243-1.622A7.98 7.98 0 0 0 12 20c4.97 0 9-3.582 9-8z' />
    </svg>
  );
}
