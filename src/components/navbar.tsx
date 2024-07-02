"use client";

import Blockies from "react-blockies";
import Link from "next/link";
import { Avatar, Button } from "@nextui-org/react";
import { Notification } from "iconsax-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ConnectButton from "./connect-button";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-end gap-6 p-4 h-16">
      <Notification />
      <ConnectButton />
    </div>
  );
};

export default Navbar;
