import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { buildJobLines, handleBinding } from './binding.ts';
import { createOfferSnapshot, buildCompleteOfferLines } from '../_shared/binding-offer.ts';
const assignment = { id:'TEST-A', job_id:'TEST-J', driver_id:'TEST-D', status:'assigned', rate_type:'daily', rate_value:349, start_date:'2099-11-05T00:00:00Z', end_date:'2099-11-06T00:00:00Z', commission_pct:20 };
for (const version of [1,2]) {
  Deno.test(`Persönliche Seite v${version} behält ihre Angebotsdaten trotz geänderter Stammdaten`, async () => {
    const job = { company:'TEST ursprüngliche Firma', customer_name:'TEST Kontakt', nachricht:'TEST ursprünglicher Auftrag', einsatzort:'TEST Ort' };
    const snapshot = version === 1 ? { version:1,job,assignment } : { version:2,job,assignment,job_lines:buildCompleteOfferLines(job,assignment) };
    const invite = { purpose:'binding',assignment_id:assignment.id,driver_id:assignment.driver_id,status:'pending',created_at:'2099-01-01T00:00:00Z',token_expires_at:'2099-11-01T00:00:00Z',offer_snapshot:snapshot,job:{ company:'GEÄNDERT', nachricht:'GEÄNDERT' } };
    const q = { select(){return q;},eq(){return q;},maybeSingle(){return Promise.resolve({data:assignment});} };
    const response = await handleBinding({supabase:{from(){return q;}},invite,intent:'load',action:null,consentConfirmed:false,checkboxText:null,ip:'',userAgent:'',json:(data:any)=>new Response(JSON.stringify(data))});
    const data = await response.json();
    assertEquals(data.status,'ready');
    assertEquals(data.job_lines, version === 1 ? buildJobLines(job,assignment) : (snapshot as any).job_lines);
  });
}
Deno.test('Eventauftrag ohne vollständige Vergütung: Laden und Annahme gesperrt, kein Statuswechsel', async () => {
  const a = { ...assignment, rate_value: null, commission_pct: 25 };
  const job = { tarif_type: 'event', tarif_netto: 489, zeitraum: 'offen', kosten_uebersicht: null, einsatzort: 'TEST' };
  const invite = { purpose:'binding',assignment_id:a.id,driver_id:a.driver_id,status:'pending',created_at:'2099-01-01T00:00:00Z',token_expires_at:'2099-11-01T00:00:00Z',offer_snapshot:createOfferSnapshot(job,a),job };
  let updates = 0;
  const q: any = { select(){return q;},eq(){return q;},update(){updates++;return q;},maybeSingle(){return Promise.resolve({data:a});} };
  for (const [intent, action] of [['load', null], [null, 'accept']] as const) {
    const r = await handleBinding({supabase:{from(){return q;}},invite,intent,action,consentConfirmed:true,checkboxText:'x',ip:'',userAgent:'',json:(d:any)=>new Response(JSON.stringify(d))});
    assertEquals((await r.json()).status, 'remuneration_incomplete');
  }
  assertEquals(updates, 0);
});
Deno.test('v3: vollständige Konditionen laden mit Provision nach Tarif und gespeicherten Zeilen', async () => {
  const job = { tarif_type:'baumaschine', fahrzeugtyp:'TEST Betonpumpe', einsatzort:'TEST' };
  const snapshot = createOfferSnapshot(job, assignment);
  const invite = { purpose:'binding',assignment_id:assignment.id,driver_id:assignment.driver_id,status:'pending',created_at:'2099-01-01T00:00:00Z',token_expires_at:'2099-11-01T00:00:00Z',offer_snapshot:snapshot,job };
  const q = { select(){return q;},eq(){return q;},maybeSingle(){return Promise.resolve({data:assignment});} };
  const data = await (await handleBinding({supabase:{from(){return q;}},invite,intent:'load',action:null,consentConfirmed:false,checkboxText:null,ip:'',userAgent:'',json:(d:any)=>new Response(JSON.stringify(d))})).json();
  assertEquals([data.status, data.commission_pct], ['ready', 25]);
  assertEquals(data.job_lines, snapshot.job_lines);
});
Deno.test('v3: unvollständige Konditionen zeigen Zeilen, aber keine Annahme', async () => {
  const job = { tarif_type:'pruefung', einsatzort:'TEST' };
  const snapshot = createOfferSnapshot(job, assignment);
  const invite = { purpose:'binding',assignment_id:assignment.id,driver_id:assignment.driver_id,status:'pending',created_at:'2099-01-01T00:00:00Z',token_expires_at:'2099-11-01T00:00:00Z',offer_snapshot:snapshot,job };
  let updates = 0;
  const q: any = { select(){return q;},eq(){return q;},update(){updates++;return q;},maybeSingle(){return Promise.resolve({data:assignment});} };
  const load = await (await handleBinding({supabase:{from(){return q;}},invite,intent:'load',action:null,consentConfirmed:false,checkboxText:null,ip:'',userAgent:'',json:(d:any)=>new Response(JSON.stringify(d))})).json();
  assertEquals(load.status, 'remuneration_incomplete'); assertEquals(load.job_lines, snapshot.job_lines);
  const acc = await (await handleBinding({supabase:{from(){return q;}},invite,intent:null,action:'accept',consentConfirmed:true,checkboxText:'x',ip:'',userAgent:'',json:(d:any)=>new Response(JSON.stringify(d))})).json();
  assertEquals(acc.status, 'remuneration_incomplete'); assertEquals(updates, 0);
});
