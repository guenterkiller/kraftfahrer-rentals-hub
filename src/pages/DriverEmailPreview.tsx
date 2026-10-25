import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DriverEmailDraft, EMAIL_DRAFT_NAMES, type DriverEmailKind, type OfferReplyMode } from '@/components/admin/DriverEmailDraft';

/** DEV-only Entwurf ohne Supabase, Versand oder echte Fahrer-/Auftragsdaten. */
export default function DriverEmailPreview() {
  const [kind, setKind] = useState<DriverEmailKind>('registration-driver');
  const [mode, setMode] = useState<OfferReplyMode>('availability');
  const [commission, setCommission] = useState<number | undefined>();
  const [special, setSpecial] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [matching, setMatching] = useState(true);
  const [amounts, setAmounts] = useState({ serviceNet: '', overtimeNet: '', surchargesNet: '', travelNet: '' });
  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border"><div className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-3"><Mail className="h-6 w-6 text-primary" /><div className="flex-1"><h1 className="text-2xl font-bold">E-Mail-Entwürfe</h1><p className="text-sm text-muted-foreground">Nur Vorschau · Platzhalter statt echter Daten · kein Versand</p></div><Button asChild variant="outline" size="icon"><Link to="/admin" aria-label="Zurück zur Verwaltung"><ArrowLeft /></Link></Button></div></header>
    <div className="max-w-6xl mx-auto p-4 grid lg:grid-cols-[300px_minmax(0,1fr)] gap-6">
      <aside className="space-y-5"><div className="space-y-2"><Label htmlFor="email-kind">E-Mail</Label><Select value={kind} onValueChange={value => setKind(value as DriverEmailKind)}><SelectTrigger id="email-kind" className="h-auto min-h-10 [&>span]:whitespace-normal text-left"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(EMAIL_DRAFT_NAMES).map(([value, name]) => <SelectItem value={value} key={value}>{name}</SelectItem>)}</SelectContent></Select></div>
        {kind === 'offer' && <>
          <div className="space-y-2"><Label htmlFor="reply-mode">Bestehender Antwortweg</Label><Select value={mode} onValueChange={value => setMode(value as OfferReplyMode)}><SelectTrigger id="reply-mode"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="availability">Verfügbarkeitsprüfung</SelectItem><SelectItem value="broadcast">Bestehendes Broadcast-Angebot</SelectItem><SelectItem value="phone">Telefon / SMS / WhatsApp</SelectItem></SelectContent></Select></div>
          {([['serviceNet', 'Vereinbarte Fahrleistung (€ netto)'], ['overtimeNet', 'Vereinbarte Mehrstunden (€ netto)'], ['surchargesNet', 'Vereinbarte Zuschläge (€ netto)'], ['travelNet', 'Vereinbarte An- und Abfahrt (€ netto)']] as const).map(([key, label]) => <div className="space-y-2" key={key}><Label htmlFor={key}>{label}</Label><Input id={key} inputMode="decimal" value={amounts[key]} onChange={event => setAmounts(old => ({ ...old, [key]: event.target.value }))} /></div>)}
          <div className="space-y-2"><Label htmlFor="commission">Vereinbarte Vermittlungsprovision</Label><Select value={commission?.toString()} onValueChange={value => setCommission(Number(value))}><SelectTrigger id="commission"><SelectValue placeholder="Bitte auswählen" /></SelectTrigger><SelectContent><SelectItem value="20">20 % regulär</SelectItem><SelectItem value="25">25 % Sonderauftrag</SelectItem></SelectContent></Select></div>
          {commission === 25 && <div className="flex items-start gap-2"><Checkbox id="special-order" checked={special} onCheckedChange={value => setSpecial(value === true)} /><Label htmlFor="special-order" className="leading-relaxed">Sonderauftrag mit 25 % ausdrücklich vereinbart</Label></div>}
          <div className="flex items-start gap-2"><Checkbox id="amounts-agreed" checked={agreed} onCheckedChange={value => setAgreed(value === true)} /><Label htmlFor="amounts-agreed" className="leading-relaxed">Alle Beträge vereinbart und bezifferbar (ausschließlich isolierte Beispieldaten)</Label></div>
        </>}
        {kind === 'approval-driver' && <div className="flex items-start gap-2"><Checkbox id="matching-jobs" checked={matching} onCheckedChange={value => setMatching(value === true)} /><Label htmlFor="matching-jobs">Passende Auftragsangebote vorhanden</Label></div>}
      </aside>
      <div className="min-w-0"><DriverEmailDraft kind={kind} mode={mode} matching={matching} input={{ ...amounts, commissionPct: commission, specialOrderAgreed: special, amountsAgreed: agreed }} /></div>
    </div>
  </main>;
}