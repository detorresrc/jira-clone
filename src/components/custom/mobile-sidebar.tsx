"use client";

import { MenuIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Sidebar } from "./sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const MobileSidebar = () => {
  const [isOpen, setisOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setisOpen(false);
  }, [pathname]);

  return (
    <Sheet modal={false} open={isOpen} onOpenChange={setisOpen}>
      <SheetTrigger asChild>
        <Button size={"icon"} variant={"secondary"} className='lg:hidden size-8'><MenuIcon className="size-4 text-neutral-500"/></Button>
      </SheetTrigger>
      <SheetContent side={"left"} className="p-0">
        <SheetTitle></SheetTitle>
        <Sidebar/>
      </SheetContent>
    </Sheet>
  );
};
