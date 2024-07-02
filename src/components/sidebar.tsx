"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import {
  Home2,
  TableDocument,
  LogoutCurve,
  People,
  Receipt1,
} from "iconsax-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Sidebar = ({}: // isSidebarOpen,
// setIsSidebarOpen,
{
  // isSidebarOpen: boolean;
  // setIsSidebarOpen: (open: boolean) => void;
}) => {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed -left-64 z-50 flex h-dvh w-64 flex-col bg-[#F5f5f5] p-6 transition-left md:relative md:left-0 border-r"
        // isSidebarOpen ? "left-0" : "-left-64"
      )}
    >
      <div className="w-full flex items-center gap-2 p-3 py-4 pb-12">
        <Image
          src="/quotal.svg"
          alt="logo"
          width={30}
          height={30}
          className="block rounded-lg"
        />
        <h1 className="text-black text-2xl font-normal">Quotal</h1>
      </div>
      <ul>
        <Navlink
          // onClick={() => setIsSidebarOpen(false)}
          title="Dashboard"
          href="/dashboard"
          icon={Home2}
          active={pathname === "/dashboard"}
        />
        <Navlink
          // onClick={() => setIsSidebarOpen(false)}
          title="Create Invoice"
          href="/create-invoice"
          icon={TableDocument}
          active={pathname === "/create-invoice"}
        />
        <Navlink
          // onClick={() => setIsSidebarOpen(false)}
          title="Sent Invoices"
          href="/sent-invoices"
          icon={Receipt1}
          active={pathname === "/sent-invoices"}
        />
        <Navlink
          // onClick={() => setIsSidebarOpen(false)}
          title="Clients"
          href="/clients"
          icon={People}
          active={pathname === "/clients"}
        />
      </ul>
    </div>
  );
};

function Navlink({
  href,
  title,
  active,
  icon: IconComponent,
}: // onClick,
{
  href: string;
  title: string;
  active: boolean;
  icon: typeof LogoutCurve;
  // onClick: () => void;
}) {
  return (
    <li
    // onClick={onClick}
    >
      <Link
        href={href}
        className={
          "m-auto mt-4 flex w-full items-center gap-2 rounded-xl p-3 transition-all duration-200 ease-in-out"
        }
      >
        <IconComponent
          size={25}
          color={active ? "#00bf63" : "#000000"}
          variant={active ? "Bold" : "Linear"}
        />
        <span className="text-black">{title}</span>
      </Link>
    </li>
  );
}

export default Sidebar;
