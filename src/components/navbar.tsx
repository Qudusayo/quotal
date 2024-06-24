"use client";

import Blockies from "react-blockies";
import Link from "next/link";
import { Button } from "@nextui-org/react";
import { Notification } from "iconsax-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-end gap-6 p-4 h-16">
      <Button
        color="primary"
        size="md"
        as={Link}
        href="/create-invoice"
        className={cn(pathname === "/create-invoice" && "hidden")}
      >
        Create Invoice
      </Button>
      <Notification />
      <div className="flex items-center gap-2">
        <span>0x8...2b9f</span>
        <Blockies
          seed="Jeremy"
          size={9}
          color="#dfe"
          bgColor="#267cf4"
          spotColor="#073768"
          className="rounded-full border-2 border-primary w-40 h-40"
        />
      </div>
    </div>
  );
};

export default Navbar;
