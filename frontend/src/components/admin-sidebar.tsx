"use client";

import * as React from "react";
import { 
  LayoutDashboard, 
  FolderGit2, 
  FileText, 
  Wrench, 
  Briefcase,
  Mail,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { title: "Projects", icon: FolderGit2, href: "/admin/projects" },
  { title: "Articles", icon: FileText, href: "/admin/articles" },
  { title: "Tools", icon: Wrench, href: "/admin/tools" },
  { title: "Experience", icon: Briefcase, href: "/admin/experience" },
  { title: "Messages", icon: Mail, href: "/admin/messages" },
  { title: "Settings", icon: Settings, href: "/admin/settings" },
];

export function AdminSidebar() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-lg font-bold text-white">Y</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              YrizzzDev
            </span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => router.push(item.href)}
                    className="group relative overflow-hidden rounded-lg transition-all hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-purple-600/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-10" />
                    <item.icon className="h-4 w-4 transition-colors group-hover:text-blue-600" />
                    <span className="transition-colors group-hover:text-foreground">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Admin</span>
              <span className="text-xs text-muted-foreground">admin@yrizzzdev.com</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
