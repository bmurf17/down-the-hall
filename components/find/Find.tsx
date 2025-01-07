"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";
import Button from "../basicUI/Button";

interface Props {
  children: ReactNode;
}

export default function Find({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("title") || "");

  const debounceDelay = 500;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm && searchTerm.length >= 4) {
        router.push(pathname + "?" + createQueryString("title", searchTerm));
      } else {
        router.push(pathname);
      }
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, router, pathname, createQueryString]);

  const clear = () => {
    setSearchTerm("");
    router.push(pathname);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-5 relative gap-2 lg:gap-4">
      <div className="relative col-span-1">
        <div className="flex gap-2 items-center">
          <div className="font-medium text-lg">Filters</div>
          <Button
            text={"Clear"}
            handleClick={clear}
            styles={
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:primary border rounded-lg active:translate-y-1 transition-all bg-primary border-primary hover:bg-primary text-white py-2 px-2 active:shadow-none gap-2"
            }
          />
        </div>
      </div>
      <div className="lg:col-span-4 relative">
        <div className="flex justify-center gap-2 align-middle">
          <input
            className="flex border-2 border-gray-200 p-4 rounded-xl mb-2 w-full"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
