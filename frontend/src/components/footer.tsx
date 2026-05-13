"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background/50 backdrop-blur-md mt-auto">
      <div className="w-full px-6 py-4 flex items-center justify-center">
        <div className="text-xs text-muted-foreground font-medium text-center">
          © {currentYear} — Crafted with <span className="text-red-500">❤️</span> by{" "}
          <span className="font-bold bg-gradient-to-r from-[#0d47c4] to-[#3b82f6] bg-clip-text text-transparent">
            YrizzzDev
          </span>
        </div>
      </div>
    </footer>
  );
}
