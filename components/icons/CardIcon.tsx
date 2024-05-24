import { SVGProps } from 'react';

export function CardIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width='1em'
            height='1em'
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className='icon-lg w-5 h-5  inline'
        >
            <path d="M6 2H14L20 8V22H6z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    );
}