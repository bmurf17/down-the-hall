"use client";
import { classNames } from "@/utilities/className";
import { Dialog, Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { BookmarkIcon } from "./icons/BookmarkIcon";
import { BurgerMenuIcon } from "./icons/BurgerMenuIcon";
import { ConnectionIcon } from "./icons/ConnectionIconIcon";
import { ExploreIcon } from "./icons/ExploreIcon";
import { SearchIcon } from "./icons/SearchIcon";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    closeMenu();
  };

  return (
    <>
      <header className="w-full  z-10">
        <div className="bg-navbar text-white px-16 py-4 mb-4 flex gap-4 justify-between">
          <div className="flex gap-4 hover:cursor-pointer">
            <div
              onClick={() => {
                setMenuOpen(true);
              }}
            >
              <BurgerMenuIcon color="white" size={24} />
            </div>
            <Link href="/">Down The Hall</Link>
          </div>

          <div className=" inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 text-white">
            {/* Profile dropdown */}
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    userButtonBox: {
                      color: "white",
                    },
                  },
                }}
                showName={true}
              />
            </SignedIn>
          </div>
        </div>
      </header>

      <Transition show={menuOpen}>
        <Dialog
          as="div"
          open={menuOpen}
          onClose={closeMenu}
          className="fixed inset-0 z-40"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <Transition
            as={Fragment}
            show={menuOpen}
            enter="ease-in-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="flex flex-col w-64 relative z-10 h-full bg-gray-50 border-r border-gray-200">
              <button
                type="button"
                className="absolute top-2 right-2 flex items-center justify-center w-10 h-10"
                onClick={closeMenu}
              >
                X
              </button>
              <div className="py-4 px-6 font-bold text-blue-600">
                Down The Hall
              </div>
              <div className="overflow-y-auto flex-1">
                <div className="flex flex-col space-y-1 px-4">
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => {
                      navigateTo("/find");
                    }}
                  >
                    <SearchIcon className="h-5 w-5" />
                    Find
                  </button>
                  <div>
                    <button
                      type="button"
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => {
                        navigateTo("/track");
                      }}
                    >
                      <BookmarkIcon className="h-5 w-5" />
                      <div>Track</div>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => {
                      navigateTo("/");
                    }}
                  >
                    <ConnectionIcon className="h-5 w-5" />
                    <div>Connection</div>
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => {
                      navigateTo("/");
                    }}
                  >
                    <ExploreIcon className="h-5 w-5" />
                    Explore
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </Dialog>
      </Transition>
    </>
  );
}
