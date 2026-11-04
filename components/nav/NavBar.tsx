"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState, type ComponentType } from "react";

import { NavSearchModal } from "./NavSearchModal";
import { BookmarkIcon } from "../icons/BookmarkIcon";
import { BarChartIcon } from "../icons/BarChartIcon";
import {
  Home,
  MoreHorizontal,
  SearchIcon,
  Settings,
  X,
} from "lucide-react";
import { BurgerMenuIcon } from "../icons/BurgerMenuIcon";
import { GoalsIcon } from "../icons/GoalsIcon";
import { PersonIcon } from "@radix-ui/react-icons";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const HOME: NavItem = { href: "/", label: "Home", icon: Home };
const FIND: NavItem = { href: "/find", label: "Find", icon: SearchIcon };
const TRACK: NavItem = { href: "/track", label: "Track", icon: BookmarkIcon };
const STATS: NavItem = { href: "/stats", label: "Stats", icon: BarChartIcon };
const GOALS: NavItem = { href: "/goals", label: "Goals", icon: GoalsIcon };
const USERS: NavItem = { href: "/users", label: "Users", icon: PersonIcon };
const SETTINGS: NavItem = {
  href: "/settings",
  label: "Settings",
  icon: Settings,
};

/** Mobile bottom bar. Users and Settings live in the "More" sheet. */
const TAB_ITEMS = [HOME, FIND, TRACK, STATS, GOALS];
const MORE_ITEMS = [USERS, SETTINGS];
/** Desktop drawer (lg and up) keeps the full list. */
const DRAWER_ITEMS = [FIND, TRACK, STATS, GOALS, USERS, SETTINGS];

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const closeMore = () => {
    setMoreOpen(false);
  };

  const moreActive = MORE_ITEMS.some((item) => isActive(item.href, pathname));

  return (
    <>
      <header className="sticky top-0 z-30 w-full">
        <div className="bg-navbar/90 backdrop-blur text-white px-4 sm:px-8 lg:px-16 py-4 mb-4 flex gap-4 justify-between items-center">
          <div className="flex gap-4 hover:cursor-pointer items-center">
            <button
              type="button"
              aria-label="Open navigation menu"
              className="hidden lg:block"
              onClick={() => {
                setMenuOpen(true);
              }}
            >
              <BurgerMenuIcon color="white" size={24} />
            </button>
            <Link href="/">Down The Hall</Link>
          </div>

          <div className="flex items-center gap-4 text-white">
            <SignedIn>
              <NavSearchModal />
              <UserButton
                appearance={{
                  elements: {
                    userButtonBox: {
                      color: "white",
                    },
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton />
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <SignedIn>
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          <ul className="grid grid-cols-6">
            {TAB_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href, pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                      active
                        ? "text-primary"
                        : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    {label}
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={moreOpen}
                className={clsx(
                  "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                  moreActive
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-900"
                )}
                onClick={() => {
                  setMoreOpen(true);
                }}
              >
                <MoreHorizontal className="h-6 w-6" />
                More
              </button>
            </li>
          </ul>
        </nav>

        <Transition show={moreOpen}>
          <Dialog
            as="div"
            open={moreOpen}
            onClose={closeMore}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <Transition
              as={Fragment}
              show={moreOpen}
              enter="ease-out duration-200"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <div className="fixed inset-x-0 bottom-0 rounded-t-2xl border-t border-gray-200 bg-gray-50 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <div className="flex items-center justify-between px-3 pb-2">
                  <span className="font-bold text-lg text-primary">More</span>
                  <button
                    type="button"
                    className="flex h-11 items-center gap-1.5 rounded-md px-3 text-base font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    onClick={closeMore}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                    Close
                  </button>
                </div>
                <div className="flex flex-col space-y-1">
                  {MORE_ITEMS.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href, pathname);
                    return (
                      <Link
                        key={href}
                        href={href}
                        aria-current={active ? "page" : undefined}
                        onClick={closeMore}
                        className={clsx(
                          "flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors",
                          active
                            ? "bg-gray-100 text-primary"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Transition>
          </Dialog>
        </Transition>
      </SignedIn>

      {/* Desktop drawer (lg and up) */}
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
                className="absolute top-2 right-2 flex h-11 items-center gap-1.5 rounded-md px-3 text-base font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                onClick={closeMenu}
              >
                <X className="h-5 w-5" aria-hidden="true" />
                Close
              </button>
              <div className="py-4 px-6 font-bold text-lg text-primary">
                Down The Hall
              </div>
              <div className="overflow-y-auto flex-1">
                <SignedIn>
                  <div className="flex flex-col space-y-1 px-4">
                    {DRAWER_ITEMS.map(({ href, label, icon: Icon }) => {
                      const active = isActive(href, pathname);
                      return (
                        <Link
                          key={href}
                          href={href}
                          aria-current={active ? "page" : undefined}
                          onClick={closeMenu}
                          className={clsx(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors",
                            active
                              ? "bg-gray-100 text-primary"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </SignedIn>
                <SignedOut>
                  <div className="flex flex-col space-y-1 px-4">
                    <p>Sign in to start tracking your book</p>
                    <SignInButton>
                      <button
                        className={clsx(
                          "bg-primary flex items-center justify-center p-2 rounded-lg  text-lg/6 gap-2 text-white hover:bg-green-500",
                          "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
                        )}
                      >
                        Sign In
                      </button>
                    </SignInButton>
                  </div>
                </SignedOut>
              </div>
            </div>
          </Transition>
        </Dialog>
      </Transition>
    </>
  );
}