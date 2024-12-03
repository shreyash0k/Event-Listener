"use client"

import * as React from "react"
import {
  PencilLine,
  History,
  CreditCard,
  HelpCircle,
  LogOut,
  Download,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Updated sample data
const data = {
  user: {
    name: "Gurbaz",
    email: "gurbazd@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Manage Trackers",
      url: "/dashboard",
      icon: PencilLine,
    },
    {
      title: "History",
      url: "/dashboard/history",
      icon: History,
    },
    {
      title: "Chrome Extension",
      url: "https://chromewebstore.google.com/",
      icon: Download,
    },
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      title: "Support",
      url: "/dashboard/support",
      icon: HelpCircle,
    },
    {
      title: "Logout",
      url: "/logout",
      icon: LogOut,
    }
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    (<Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>)
  );
}
