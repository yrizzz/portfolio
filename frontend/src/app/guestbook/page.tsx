import { PortfolioLayout } from "@/components/portfolio-layout";
import { WalineGuestbook } from "@/components/waline-guestbook";

export default function GuestbookPage() {
  return (
    <PortfolioLayout>
      <div className="space-y-16 p-6 flex-1">
        <div id="guestbook" className="max-w-5xl mx-auto w-full">
          <WalineGuestbook />
        </div>
      </div>
    </PortfolioLayout>
  );
}
