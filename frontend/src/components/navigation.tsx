"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href) as HTMLElement;
    if (element) {
      const navHeight = 100; // Increased offset for better spacing
      // Use offsetTop to ignore CSS transforms (AOS bug fix)
      let offsetPosition = 0;
      let currentElement: HTMLElement | null = element;
      while (currentElement) {
        offsetPosition += currentElement.offsetTop;
        currentElement = currentElement.offsetParent as HTMLElement;
      }
      offsetPosition -= navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: window.innerWidth >= 768 ? "smooth" : "auto"
      });
      setIsMobileMenuOpen(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all ${
          isScrolled
            ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            : "bg-transparent"
        }`}
      >
        <div className="container flex h-16 items-center justify-between">
          <button
            onClick={() => scrollToSection("#home")}
            className="text-xl font-bold"
          >
            Portfolio
          </button>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-16 right-0 left-0 border-b bg-background p-6">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
