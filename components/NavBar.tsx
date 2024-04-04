import Link from "next/link";

export default function NavBar() {
  return (
    <header className="w-full  z-10">
      <Link href={"/"}>
        <div className="bg-blue-700 text-white px-16 py-4 mb-4">Down The Hall</div>
      </Link>
    </header>
  );
}