"use client";

import { useEffect, useState } from "react";
import { useSidebar } from "./sidebar-context";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { sidebarWidth } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen transition-[padding-left] duration-200 ease-in-out"
      style={{ paddingLeft: isDesktop ? sidebarWidth : 0 }}
    >
      {children}
    </div>
  );
}
