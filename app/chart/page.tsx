import ScreenHeader from "@/components/ui/ScreenHeader";
import ChartScreen from "@/components/charts/ChartScreen";

export default function ChartPage({ searchParams }: { searchParams: { symbol?: string } }) {
  const symbol = (searchParams.symbol ?? "BTCUSDT").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20) || "BTCUSDT";
  return (
    <>
      <ScreenHeader title={symbol} sub="Chart" />
      <ChartScreen key={symbol} symbol={symbol} />
    </>
  );
}
