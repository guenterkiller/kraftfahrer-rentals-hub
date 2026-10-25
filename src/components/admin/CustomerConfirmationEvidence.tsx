import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { hasCustomerConfirmation, type CustomerConfirmationEvidence as Evidence } from '@/lib/customerConfirmation';

export function CustomerConfirmationEvidence({ job }: { job: Partial<Evidence> }) {
  const complete = hasCustomerConfirmation(job);
  return (
    <section className="border-t border-border pt-4 text-sm text-foreground">
      <h3 className="font-semibold mb-2">Kundenbestätigung</h3>
      {complete && job.customer_confirmation_at ? <>
        <p>Pflichtbestätigung erteilt</p>
        <p>Bestätigungseingang: {new Date(job.customer_confirmation_at).toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'medium', timeStyle: 'medium' })} (Europe/Berlin)</p>
        <p className="break-all">Fassung: {job.customer_terms_version}</p>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="mt-2"><ChevronDown className="h-4 w-4 mr-2" />Gespeicherten Nachweis anzeigen</Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <p className="whitespace-pre-wrap break-words">{job.customer_confirmation_text}</p>
            <p className="whitespace-pre-wrap break-words">{job.customer_terms_text}</p>
          </CollapsibleContent>
        </Collapsible>
      </> : <p className="text-muted-foreground">Kein gespeicherter Bestätigungsnachweis vorhanden.</p>}
    </section>
  );
}