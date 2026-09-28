import ConnectionBadge from "./ConnectionBadge";
import EnvBadge from "./EnvBadge";

export default function ScreenHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/95 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold leading-tight">{title}</h1>
        {sub && <p className="text-xs text-mute">{sub}</p>}
      </div>
      <div className="flex items-center gap-3"><ConnectionBadge /><EnvBadge /></div>
    </header>
  );
}
