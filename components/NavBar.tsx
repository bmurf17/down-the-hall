'use client';
import Link from 'next/link';
import DrawerMenu from './DrawerMenu';
import { useState } from 'react';

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <header className='w-full  z-10'>
        <div className='bg-blue-700 text-white px-16 py-4 mb-4 flex gap-4'>
          <div onClick={() => {
            setMenuOpen(true)
          }}>burger menu</div>
          <Link href={'/'}>
            <h2>Down The Hall</h2>
          </Link>
        </div>
      </header>

      {menuOpen ? (
        <div>
          <DrawerMenu />
        </div>
      ) : (
        <> </>
      )}
    </>
  );
}
