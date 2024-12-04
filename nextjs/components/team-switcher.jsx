"use client"

import * as React from "react"
import { Dog } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default hover:bg-transparent">
          <div className="flex items-center justify-center ml-1">
            <Dog className="h-6 w-6" />
          </div>
          <div className="grid flex-1 text-left text-lg leading-tight">
            <span className="truncate font-semibold">
              Scout Pup
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
