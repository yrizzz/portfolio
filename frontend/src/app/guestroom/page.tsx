import { PortfolioLayout } from "@/components/portfolio-layout";
import { CustomGuestroom } from "@/components/custom-guestroom";

export default function GuestroomPage() {
  return (
    <PortfolioLayout>
      <div className="space-y-16 p-6 flex-1 overflow-x-hidden">
        <div id="guestroom" className="max-w-5xl mx-auto w-full">
          <CustomGuestroom />
        </div>
      </div>
    </PortfolioLayout>
  );
}
