import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex h-dvh w-screen">
      <Sidebar />
      <div className="flex h-full flex-1 flex-col bg-[#FFFFFF]">
        <Navbar />
        <div>{children}</div>
      </div>
    </section>
  );
};

export default Layout;
