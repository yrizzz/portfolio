"use client";

import * as React from "react";
import { LayoutGrid, Layers, UserCircle, Send, FolderKanban, Zap, BookOpen, Moon, Sun, ExternalLink, LogIn, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { AnimatedIconButton } from "@/components/ui/animated-button";
import { ParallaxBackground } from "@/components/parallax-background";
import { SpaceBackground } from "@/components/space-background";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { LoginModal } from "@/components/login-modal";

const mainNav = [
  { title: "Home", icon: LayoutGrid, href: "/#home" },
  { title: "Projects", icon: FolderKanban, href: "/#projects" },
  { title: "Skills", icon: Layers, href: "/#about" },
  { title: "Experience", icon: Zap, href: "/#experience" },
  { title: "Contact", icon: Send, href: "/#contact" },
];

const pageNav = [
  { title: "Activity", icon: Zap, href: "/activity" },
  { title: "Guestbook", icon: BookOpen, href: "/guestbook" },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [activeSection, setActiveSection] = React.useState("/#home");

  // Track active section based on pathname
  React.useEffect(() => {
    if (pathname === "/activity") setActiveSection("/activity");
    else if (pathname === "/guestbook") setActiveSection("/guestbook");
    else if (pathname === "/") setActiveSection("/#home");
  }, [pathname]);

  // Scroll spy - track active section on scroll
  React.useEffect(() => {
    if (pathname !== "/") return;

    const handleScroll = () => {
      const sections = ["#home", "#projects", "#about", "#experience", "#contact"];
      const scrollPosition = window.scrollY + 150; // Offset for header
      
      // Check if scrolled to bottom
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      
      if (isBottom) {
        setActiveSection("/#contact");
        return;
      }

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.querySelector(sections[i]);
        if (section) {
          const sectionTop = (section as HTMLElement).offsetTop;
          if (scrollPosition >= sectionTop) {
            setActiveSection(`/${sections[i]}`);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleNavigation = (href: string) => {
    if (href.startsWith("/#")) {
      const targetId = href.substring(1);
      
      if (pathname === "/") {
        setOpenMobile(false);
        setTimeout(() => {
          const element = document.querySelector(targetId);
          if (element) {
            const headerOffset = 70;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
          }
        }, 350);
        setActiveSection(href);
      } else {
        router.push(href);
        setOpenMobile(false);
      }
    } else {
      router.push(href);
      setActiveSection(href);
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-5 pb-4">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleNavigation("/#home")}
        >
          {/* Logo */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0d47c4] to-[#3b82f6] shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105">
            <span className="text-lg font-bold text-white">Y</span>
            {/* Subtle glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#0d47c4] to-[#3b82f6] opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300 -z-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold bg-gradient-to-r from-[#0d47c4] to-[#3b82f6] bg-clip-text text-transparent">
              YrizzzDev
            </span>
            <span className="text-[11px] text-muted-foreground/70 font-medium tracking-wide uppercase">
              Portfolio
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {mainNav.map((item) => {
                const isActive = activeSection === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.href)}
                      className={`
                        h-9 rounded-lg px-3 transition-all duration-200
                        ${isActive
                          ? "bg-gradient-to-r from-[#0d47c4]/10 to-[#3b82f6]/10 text-[#136bfe] dark:from-[#0d47c4]/20 dark:to-[#3b82f6]/20 font-medium shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }
                      `}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? "text-[#136bfe]" : ""}`} />
                      <span>{item.title}</span>
                      {isActive && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#136bfe] animate-pulse" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pages */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-1">
            Pages
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {pageNav.map((item) => {
                const isActive = activeSection === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.href)}
                      className={`
                        h-9 rounded-lg px-3 transition-all duration-200
                        ${isActive
                          ? "bg-gradient-to-r from-[#0d47c4]/10 to-[#3b82f6]/10 text-[#136bfe] dark:from-[#0d47c4]/20 dark:to-[#3b82f6]/20 font-medium shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }
                      `}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? "text-[#136bfe]" : ""}`} />
                      <span>{item.title}</span>
                      <ExternalLink className="ml-auto h-3 w-3 opacity-40" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar footer with social + status */}
      <SidebarFooter className="px-4 pb-4">
        <div className="rounded-xl bg-gradient-to-br from-[#0d47c4]/5 to-[#3b82f6]/5 dark:from-[#0d47c4]/10 dark:to-[#3b82f6]/10 p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-medium text-muted-foreground">Available to be partner</span>
          </div>
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
            Open to freelance projects and collaborations.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function PortfolioLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const { data: session, status } = useSession();
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Sync user to database after login
  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetch("/api/auth/sync-user", { method: "POST" })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log("✅ User synced to database:", data.user);
          }
        })
        .catch(err => console.error("Failed to sync user:", err));
    }
  }, [status, session]);

  const handleAuthAction = () => {
    if (session) {
      signOut();
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ParallaxBackground />
        <SpaceBackground />
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="sticky top-0 z-50 border-b border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-background/30 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-background/20">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold bg-gradient-to-r from-[#0d47c4] to-[#3b82f6] bg-clip-text text-transparent">
                  Portfolio
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {status === "authenticated" && session?.user?.role === "ADMIN" && (
                  <AnimatedIconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/admin")}
                    className="rounded-lg"
                    hoverScale={1.05}
                  >
                    <span className="text-sm font-medium">Admin</span>
                  </AnimatedIconButton>
                )}
                {mounted && (
                  <AnimatedIconButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-lg"
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
                    onClick={() => signOut()}
                    className="rounded-lg"
                    hoverScale={1.1}
                  >
                    <LogOut className="h-5 w-5" />
                  </AnimatedIconButton>
                ) : (
                  <AnimatedIconButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setLoginModalOpen(true)}
                    className="rounded-lg"
                    hoverScale={1.1}
                  >
                    <LogIn className="h-5 w-5" />
                  </AnimatedIconButton>
                )}
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1">
            {children}
          </div>

          {/* Global Footer */}
          <Footer />
          <ScrollToTop />
        </main>
      </div>
      
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </SidebarProvider>
  );
}
