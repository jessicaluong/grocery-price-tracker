import { Button } from "@/components/ui/button";
import { usePriceChart } from "@/hooks/use-price-chart";
import { TIME_FRAMES } from "@/types/price-chart";

export default function TimeFrameSelector() {
  const { timeFrame, handleSetTimeFrame } = usePriceChart();

  return (
    <div className="flex justify-center">
      <div className="flex border rounded-md">
        {TIME_FRAMES.map((frame, index) => (
          <div key={frame.value} className="flex items-center">
            {index > 0 && (
              <div className="h-6 w-px bg-border self-center"></div>
            )}
            <Button
              key={frame.value}
              size="sm"
              variant={timeFrame === frame.value ? "default" : "ghost"}
              onClick={() => handleSetTimeFrame(frame.value)}
              className="min-w-16 sm:min-w-20"
            >
              {frame.label}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
