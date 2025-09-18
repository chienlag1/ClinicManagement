"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Link } from "@heroui/link";
import { Navbar } from "@/components/navbar";
import dynamic from "next/dynamic";
import { useUserRole } from "./useUserRole";
const StaffLayout = dynamic(() => import("./staff-layout"));
const DoctorLayout = dynamic(() => import("./doctor-layout"));

export function AuthAwareChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth =
    pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
  const role = useUserRole();

  if (isAuth) {
    return (
      <div className="relative flex flex-col h-screen">
        <main className="container mx-auto max-w-7xl pt-8 px-6 flex-grow">
          {children}
        </main>
      </div>
    );
  }

  if (role === "staff") {
    return <StaffLayout>{children}</StaffLayout>;
  }
  if (role === "doctor") {
    return <DoctorLayout>{children}</DoctorLayout>;
  }
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://heroui.com?utm_source=next-app-template"
          title="heroui.com homepage"
        >
          <span className="text-default-600">Powered by</span>
          <p className="text-primary">HeroUI</p>
        </Link>
      </footer>
    </div>
  );
}
