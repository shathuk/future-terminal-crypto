import ScreenHeader from "@/components/ui/ScreenHeader";
import EnvBadge from "@/components/ui/EnvBadge";

const SECTIONS: { title: string; rows: [string, string][] }[] = [
  { title: "Trading defaults", rows: [["Default leverage", "Not set"], ["Default order type", "Market"], ["Default risk %", "Not set"], ["Default SL / TP", "Not set"]] },
  { title: "Risk limits", rows: [["Max risk per trade", "Not set"], ["Max daily loss", "Not set"], ["Max trades per day", "Not set"], ["Max position size", "Not set"], ["Max leverage", "Not set"]] },
  { title: "App", rows: [["Notifications", "Off"], ["Chart settings", "Default"], ["Theme", "Dark"]] },
];

export default function SettingsPage() {
  return (
    <>
      <ScreenHeader title="Settings" />
      <section className="border-b border-line px-4 py-4">
        <h2 className="mb-2 text-sm font-medium">Binance connection</h2>
        <div className="flex items-center justify-between py-2 text-sm"><span className="text-mute">Environment</span><EnvBadge /></div>
        <div className="flex items-center justify-between py-2 text-sm"><span className="text-mute">Status</span><span>Not connected</span></div>
        <p className="pt-1 text-xs text-mute">API credentials are read on the server only and are never shown here.</p>
      </section>
      {SECTIONS.map((s) => (
        <section key={s.title} className="border-b border-line px-4 py-4">
          <h2 className="mb-2 text-sm font-medium">{s.title}</h2>
          {s.rows.map(([k, v]) => (
            <div key={k} className="flex min-h-11 items-center justify-between text-sm"><span className="text-mute">{k}</span><span>{v}</span></div>
          ))}
        </section>
      ))}
      <p className="px-4 py-4 text-xs text-mute">Editing these settings arrives in later phases.</p>
    </>
  );
}
