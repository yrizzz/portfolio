import { PortfolioLayout } from "@/components/portfolio-layout";
import { ActivitySection } from "@/components/activity-section";

export default function ActivityPage() {
  return (
    <PortfolioLayout>
      <div className="space-y-16 p-6 flex-1">
        <div id="activity" className="max-w-5xl mx-auto w-full">
          <ActivitySection />
        </div>
      </div>
    </PortfolioLayout>
  );
}
