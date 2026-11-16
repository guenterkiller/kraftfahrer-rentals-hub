import type { DriverCompensation } from "@/lib/driverCompensation";

export function DriverCompensationCard({ compensation }: { compensation: DriverCompensation }) {
  const details: [string, string | null][] = [
    ["Abrechnung", compensation.billing],
    ["Einsatzzeitraum", compensation.period],
    ["Führerschein", compensation.license],
    ["Fahrzeugart", compensation.vehicle],
    ["Tätigkeit", compensation.activity],
    ["Einsatzort / Treffpunkt", compensation.place],
  ];

  return (
    <section aria-label="Ihre Vergütung für diesen Auftrag" className="rounded-lg border border-border bg-secondary/60 p-5">
      <h2 className="text-lg font-semibold text-foreground">Ihre Vergütung für diesen Auftrag</h2>
      <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{compensation.totalNet}</p>
      <p className="mt-1 text-sm font-medium text-foreground">netto für den Gesamteinsatz</p>
      {compensation.unitNet && compensation.unitNetLabel && (
        <p className="mt-2 text-sm text-foreground">
          <strong>{compensation.unitNet}</strong> {compensation.unitNetLabel}
        </p>
      )}
      <dl className="mt-4 grid grid-cols-1 gap-y-2 border-t border-border pt-4 text-sm text-foreground md:grid-cols-3 md:gap-x-4">
        {details.filter(([, value]) => value).map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-medium">{label}</dt>
            <dd className="whitespace-pre-line break-words md:col-span-2">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
