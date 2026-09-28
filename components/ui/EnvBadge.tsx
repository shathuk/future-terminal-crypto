// Server component: reads a non-secret flag. Defaults to TESTNET when unset.
export default function EnvBadge() {
  const live = process.env.BINANCE_TESTNET === "false";
  return (
    <span className={`rounded px-2 py-1 text-[11px] font-medium ${live ? "bg-down/20 text-down" : "bg-warn/20 text-warn"}`}>
      {live ? "LIVE" : "TESTNET"}
    </span>
  );
}
