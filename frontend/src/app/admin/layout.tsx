"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import * as React from "react";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Zap, 
  Send, 
  Users, 
  BarChart3,
  UserCircle,
  Code2,
  MessageCircle,
  ChevronDown,
  Moon,
  Sun,
  LogOut,
  Terminal,
  Globe
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { AnimatedIconButton } from "@/components/ui/animated-button";
import { ParallaxBackground } from "@/components/parallax-background";
import { SpaceBackground } from "@/components/space-background";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainNav = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
];

const contentNav = [
  { title: "Profile", icon: UserCircle, href: "/admin/profile" },
  { title: "Projects", icon: FolderKanban, href: "/admin/projects" },
  { title: "Skills", icon: Code2, href: "/admin/skills" },
  { title: "Experience", icon: Zap, href: "/admin/experience" },
  { title: "Contact Info", icon: Send, href: "/admin/contact" },
];

const apiManagementNav = [
  { title: "Dashboard", href: "/admin/api-dashboard" },
  { title: "API Data", href: "/admin/api-data" },
  { title: "Create API", href: "/admin/api-create" },
  { title: "Submit Script", href: "/admin/api-submit" },
  { title: "Review Queue", href: "/admin/api-review" },
  { title: "Global Headers", href: "/admin/global-headers" },
  { title: "Monitoring", href: "/admin/api-monitoring" },
  { title: "API Logs", href: "/admin/api-logs" },
  { title: "Settings", href: "/admin/api-settings" },
];

const otherNav = [
  { title: "Messages", icon: MessageCircle, href: "/admin/messages" },
  { title: "Users", icon: Users, href: "/admin/users" },
  { title: "Analytics", icon: BarChart3, href: "/admin/analytics" },
];

function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [contentOpen, setContentOpen] = React.useState(true);
  const [apiManagementOpen, setApiManagementOpen] = React.useState(true);

  const handleNavigation = (href: string) => {
    router.push(href);
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-5 pb-4">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleNavigation("/admin")}
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0d47c4] to-[#3b82f6] shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold bg-gradient-to-r from-[#0d47c4] to-[#3b82f6] bg-clip-text text-transparent">
              Admin Panel
            </span>
            <span className="text-[11px] text-muted-foreground/70 font-medium tracking-wide uppercase">
              Portfolio CMS
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-1">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {mainNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.href)}
                      className={isActive ? "bg-gradient-to-r from-[#0d47c4]/10 to-[#3b82f6]/10 text-[#136bfe] font-medium" : ""}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-1">
            Content
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <FolderKanban className="h-4 w-4" />
                      <span>Manage Content</span>
                      <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${contentOpen ? "rotate-180" : ""}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {contentNav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              onClick={() => handleNavigation(item.href)}
                              className={isActive ? "bg-muted text-foreground font-medium" : ""}
                            >
                              <item.icon className="h-3.5 w-3.5" />
                              <span>{item.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-1">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              <Collapsible open={apiManagementOpen} onOpenChange={setApiManagementOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Terminal className="h-4 w-4" />
                      <span>API Management</span>
                      <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${apiManagementOpen ? "rotate-180" : ""}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {apiManagementNav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              onClick={() => handleNavigation(item.href)}
                              className={isActive ? "bg-muted text-foreground font-medium" : ""}
                            >
                              <span>{item.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              
              {otherNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.href)}
                      className={isActive ? "bg-gradient-to-r from-[#0d47c4]/10 to-[#3b82f6]/10 text-[#136bfe] font-medium" : ""}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 pb-4">
        <div className="rounded-xl bg-gradient-to-br from-[#0d47c4]/5 to-[#3b82f6]/5 p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-medium text-muted-foreground">Admin Mode</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SpaceBackground />
        <ParallaxBackground />
        <AdminSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <div className="sticky top-0 z-50 border-b border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-background/30 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-background/20">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold bg-gradient-to-r from-[#0d47c4] to-[#3b82f6] bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  {session?.user && (
                    <p className="text-xs text-muted-foreground">
                      {session.user.name || session.user.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {mounted && (
                  <AnimatedIconButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    hoverScale={1.1}
                    rotateOnHover={true}
                  >
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </AnimatedIconButton>
                )}
                {session ? (
                  <AnimatedIconButton
                    variant="ghost"
                    size="icon"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    hoverScale={1.1}
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </AnimatedIconButton>
                ) : (
                  <AnimatedIconButton
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/login")}
                    hoverScale={1.1}
                    title="Login"
                  >
                    <LogOut className="h-5 w-5" />
                  </AnimatedIconButton>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 md:p-6 w-full max-w-full overflow-x-auto">
            {children}
          </div>
          <footer className="w-full border-t border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-background/30 backdrop-blur-xl mt-auto">
            <div className="w-full px-6 py-4 flex items-center justify-center">
              <div className="text-xs text-muted-foreground font-medium text-center">
                © {new Date().getFullYear()} — Crafted by{" "}
                <span className="font-bold bg-gradient-to-r from-[#0d47c4] to-[#3b82f6] bg-clip-text text-transparent">
                  YrizzzDev
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}
