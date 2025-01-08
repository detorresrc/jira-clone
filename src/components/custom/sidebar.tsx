import Image from "next/image";
import Link from "next/link";
import { DottedSeparator } from "./dotted-separator";
import { Navigation } from "./navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Projects } from "./projects";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isMobile?: boolean;
}

export const Sidebar = ({
  isMobile = false
} : SidebarProps) => {
  return (
    <aside className='h-full bg-neutral-100 p-4 w-full'>
      <div className={cn(
        "sticky z-10 bg-neutral-100",
        isMobile ? "top-10" : "top-0"
      )}>
        <Link href='/'>
          <Image src="/logo.svg" alt="Jira Clone" width={164} height={48}/>
        </Link>
        <DottedSeparator className="my-4"/>
        <WorkspaceSwitcher />
        <DottedSeparator className="my-4"/>
      </div>
      <Navigation/>
      <DottedSeparator className="my-4"/>
      <Projects/>
    </aside>
  );
};
