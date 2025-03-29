import { Button } from "@/components/ui/button";
import { usePriceChart } from "@/hooks/use-price-chart";
import { TIME_FRAMES } from "@/types/price-chart";

export default function TimeFrameSelector() {
  const { timeFrame, handleSetTimeFrame } = usePriceChart();

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {TIME_FRAMES.map((frame) => (
        <Button
          key={frame.value}
          size="sm"
          variant={timeFrame === frame.value ? "default" : "outline"}
          onClick={() => handleSetTimeFrame(frame.value)}
        >
          {frame.label}
        </Button>
      ))}
    </div>
  );
}
