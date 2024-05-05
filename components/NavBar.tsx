'use client';
import Link from 'next/link';
import { useState } from 'react';
import { DrawerMenu } from './DrawerMenu';

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className='w-full  z-10'>
        <div className='bg-blue-700 text-white px-16 py-4 mb-4 flex gap-4'>
          <div
            onClick={() => {
              setMenuOpen(true);
            }}>
            <BurgerMenuIcon color="white" size={24} />
          </div>
          <Link href={'/'}>
            <h2>Down The Hall</h2>
          </Link>
        </div>
      </header>

      {menuOpen ? (
        <div>
          <DrawerMenu close={close} open={menuOpen} />
        </div>
      ) : (
        <> </>
      )}
    </>
  );
}

const BurgerMenuIcon = ({ color, size }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
  >
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);