import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { DatabaseSync, backup } from 'node:sqlite';
import ts from 'typescript';
const out = path.resolve('.sites-runtime/qa');
fs.mkdirSync(out, { recursive: true });
for (const name of ['domain', 'server']) {
    let code = ts.transpileModule(fs.readFileSync(`lib/${name}.ts`, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
    code = code.replaceAll("'./domain'", "'./domain.mjs'");
    fs.writeFileSync(`${out}/${name}.mjs`, code);
}
const { handleApi, runDueJobs } = await import(`${out}/server.mjs?${Date.now()}`);
const domain = await import(`${out}/domain.mjs`);
class D1 {
    constructor(sql) { this.sql = sql; }
    prepare(query) { const sql = this.sql; return { args: [], bind(...args) { this.args = args; return this; }, async first() { return sql.prepare(query).get(...this.args) || null; }, async all() { return { results: sql.prepare(query).all(...this.args) }; }, async run() { const result = sql.prepare(query).run(...this.args); return { success: true, meta: { changes: Number(result.changes) } }; } }; }
    async batch(list) { this.sql.exec('BEGIN'); try {
        const r = [];
        for (const s of list)
            r.push(await s.run());
        this.sql.exec('COMMIT');
        return r;
    }
    catch (e) {
        this.sql.exec('ROLLBACK');
        throw e;
    } }
}
const sql = new DatabaseSync(':memory:');
for (const f of fs.readdirSync('drizzle').filter(x => x.endsWith('.sql')).sort())
    sql.exec(fs.readFileSync('drizzle/' + f, 'utf8'));
const storage = new Map(), env = { DB: new D1(sql), BUCKET: { async put(k, bytes, options) { storage.set(k, { bytes: new Uint8Array(bytes), options }); }, async delete(k) { storage.delete(k); }, async get(k) { const o = storage.get(k); return o ? { body: new Blob([o.bytes]).stream() } : null; } } };
let checks = [];
async function test(name, fn) { try {
    await fn();
    checks.push({ name, status: 'PASS' });
    console.log('PASS', name);
}
catch (error) {
    checks.push({ name, status: 'FAIL', error: error.message });
    console.error('FAIL', name, error);
    throw error;
} }
async function call(user, url, body, method = 'POST') { const headers = new Headers(); if (user) {
    headers.set('oai-authenticated-user-id', user);
    headers.set('oai-authenticated-user-email', `${user}@example.test`);
    headers.set('oai-authenticated-user-full-name', user);
} headers.set('origin', 'https://novalis.test'); if (!(body instanceof FormData))
    headers.set('content-type', 'application/json'); const req = new Request('https://novalis.test/api/' + url, { method, headers, body: ['GET', 'HEAD'].includes(method) ? undefined : body instanceof FormData ? body : JSON.stringify(body || {}) }); const res = await handleApi(req, env); let data; try {
    data = await res.json();
}
catch { } return { status: res.status, data }; }
const get = u => call(u, 'bootstrap', undefined, 'GET');
const create = async (u, kind, payload, rid) => call(u, 'records', { kind, payload, recipientId: rid });
let anna, paul, circle, betaToken, helperToken, task, med, doseId, appointment, followup, fileId, share;
try {
    await test('Missing account identity returns 401', async () => assert.equal((await get('')).status, 401));
    await test('First account has no fabricated people or health data', async () => { const r = await get('alpha'); assert.equal(r.status, 200); assert.equal(r.data.recipients.length, 0); assert.equal(r.data.profile.onboarding, 0); });
    await test('Personal display preferences persist across requests', async () => { await call('alpha', 'profile', { preferences: { font: 'large', contrast: true } }, 'PATCH'); assert.equal((await get('alpha')).data.profile.preferences.font, 'large'); });
    await test('Two care recipients remain explicitly assigned', async () => { const a = await call('alpha', 'recipients', { name: 'Anna QA', circleName: 'QA Kreis' }); assert.equal(a.status, 200); anna = a.data.id; circle = a.data.state.recipients[0].circleId; const p = await call('alpha', 'recipients', { name: 'Paul QA', circleId: circle }); paul = p.data.id; assert.notEqual(anna, paul); });
    await test('Role-specific invitations are issued as opaque tokens', async () => { const b = await call('alpha', 'invitations', { circleId: circle, recipientIds: [anna], role: 'family' }); betaToken = b.data.token; assert(!betaToken.includes('Anna')); const h = await call('alpha', 'invitations', { circleId: circle, recipientIds: [anna], role: 'helper' }); helperToken = h.data.token; assert.equal(h.status, 200); });
    await test('Invitations attach an independent second account', async () => { assert.equal((await call('beta', 'invitations/accept', { token: betaToken })).status, 200); assert.equal((await call('gamma', 'invitations/accept', { token: helperToken })).status, 200); });
    await test('An invitation cannot be reused', async () => assert.equal((await call('delta', 'invitations/accept', { token: betaToken })).status, 400));
    await test('Recipient scopes prevent access to a second patient', async () => { const r = await get('beta'); assert(r.data.recipients.some(x => x.id === anna)); assert(!r.data.recipients.some(x => x.id === paul)); assert.equal((await create('beta', 'task', { title: 'Forbidden', date: domain.localDay(), status: 'open' }, paul)).status, 403); });
    await test('Private self-assessments do not appear to other members', async () => { const r = await create('alpha', 'check', { feeling: 3, text: 'Private QA' }, anna); assert.equal(r.status, 200); const s = (await get('beta')).data; assert(!s.records.some(e => e.kind === 'check')); });
    await test('Unassigned task can be created without an assumed acceptance', async () => { const r = await create('alpha', 'task', { title: 'QA Einkauf', date: domain.localDay(), status: 'open', assignee: null }, anna); assert.equal(r.status, 200); task = r.data.state.records.find(e => e.id === r.data.id); });
    await test('Two competing task takeovers produce only one success', async () => { const results = await Promise.all([call('beta', 'records/' + task.id, { version: 1, payload: { assignee: 'beta', status: 'accepted' } }, 'PATCH'), call('gamma', 'records/' + task.id, { version: 1, payload: { assignee: 'gamma', status: 'accepted' } }, 'PATCH')]); assert.equal(results.filter(r => r.status === 200).length, 1); assert.equal(results.filter(r => r.status === 409).length, 1); });
    await test('One person cannot accept on behalf of another', async () => assert.equal((await create('alpha', 'task', { title: 'Falsche Zusage', date: domain.localDay(), assignee: 'beta', status: 'accepted' }, anna)).status, 400));
    await test('Substitution request retains existing responsibility', async () => { const r = await create('alpha', 'task', { title: 'Vertretung QA', date: domain.localDay(), assignee: 'alpha', status: 'accepted' }, anna); const e = r.data.state.records.find(x => x.id === r.data.id); const p = await call('alpha', 'records/' + e.id, { version: e.version, payload: { pendingAssignee: 'beta', coverageNeeded: true } }, 'PATCH'); assert.equal(p.status, 200); const saved = p.data.records.find(x => x.id === e.id); assert.equal(saved.payload.assignee, 'alpha'); assert.equal(saved.payload.pendingAssignee, 'beta'); });
    await test('Medication plan uses structured amounts and units', async () => { const r = await create('alpha', 'medication', { title: 'QA Medikament', strength: '5 mg', amount: 1, unit: 'Tablette', times: ['08:00'], stock: 10, active: true, validFrom: domain.dateAdd(domain.localDay(), -1) }, anna); assert.equal(r.status, 200); med = r.data.state.records.find(x => x.id === r.data.id); });
    await test('Everyday helper cannot read or mutate medication data', async () => { assert(!(await get('gamma')).data.records.some(x => x.id === med.id)); assert.equal((await call('gamma', 'records/' + med.id, { version: 1, payload: { amount: 2 } }, 'PATCH')).status, 403); });
    const scheduled = domain.zonedISO(domain.dateAdd(domain.localDay(), -1), '08:00');
    await test('Concurrent duplicate dose confirmations produce exactly one event',async()=>{const responses=await Promise.all([call('alpha','doses',{medicationId:med.id,scheduledAt:scheduled,status:'given'}),call('beta','doses',{medicationId:med.id,scheduledAt:scheduled,status:'given'})]);assert.equal(responses.filter(r=>r.status===200).length,1);assert.equal(responses.filter(r=>r.status===409).length,1);doseId=responses.find(r=>r.status===200).data.doses.find(x=>x.medicationId===med.id).id;});
    await test('Dose correction requires a reason', async () => assert.equal((await call('alpha', 'doses', { medicationId: med.id, scheduledAt: scheduled, status: 'unclear', correctionOf: doseId })).status, 400));
    await test('Dose correction is append-only and preserves the original', async () => { const r = await call('alpha', 'doses', { medicationId: med.id, scheduledAt: scheduled, status: 'unclear', correctionOf: doseId, reason: 'QA Korrektur' }); assert.equal(r.status, 200); assert.equal(r.data.doses.filter(d => d.medicationId === med.id).length, 2); assert(r.data.doses.some(d => d.id === doseId && d.status === 'given')); });
    await test('Plan changes retain a historical revision', async () => { const r = await call('alpha', 'records/' + med.id, { version: med.version, payload: { amount: 2 } }, 'PATCH'); assert.equal(r.status, 200); assert.equal(sql.prepare('SELECT COUNT(*) n FROM medication_revisions WHERE medication_id=?').get(med.id).n, 1); assert.equal(sql.prepare('SELECT amount FROM dose_events WHERE id=?').get(doseId).amount, '1'); });
    await test('A dose outside the recorded schedule is rejected', async () => assert.equal((await call('alpha', 'doses', { medicationId: med.id, scheduledAt: domain.zonedISO(domain.dateAdd(domain.localDay(), -1), '09:00'), status: 'given' })).status, 400));
    await test('Appointment completion produces a personal follow-up event', async () => { const d = domain.dateAdd(domain.localDay(), -1); const r = await create('alpha', 'appointment', { title: 'QA Arzttermin', date: d, start: domain.zonedISO(d, '10:00'), end: domain.zonedISO(d, '11:00'), companion: 'alpha', companionAccepted: true, status: 'planned' }, anna); assert.equal(r.status, 200); appointment = r.data.state.records.find(x => x.id === r.data.id); assert(r.data.state.notifications.some(n => n.refId === appointment.id && n.userId === 'alpha')); assert(!(await get('beta')).data.notifications.some(n => n.refId === appointment.id)); });
    await test('Repeated job processing does not duplicate notices', async () => { await runDueJobs(env.DB); await runDueJobs(env.DB); assert.equal(sql.prepare("SELECT COUNT(*) n FROM notifications WHERE ref_id=? AND kind='followup'").get(appointment.id).n, 1); });
    await test('Snooze persists as a future server-side job', async () => { const r = await call('alpha', 'followup/snooze', { appointmentId: appointment.id, minutes: 60 }); assert.equal(r.status, 200); assert(sql.prepare("SELECT id FROM jobs WHERE ref_id=? AND state='pending' AND due_at>?").get(appointment.id, new Date().toISOString())); });
    await test('A draft follow-up remains private', async () => { const r = await create('alpha', 'followup', { appointmentId: appointment.id, text: 'QA Entwurf', medsChanged: 'unknown', status: 'draft' }, anna); assert.equal(r.status, 200); followup = r.data.state.records.find(x => x.id === r.data.id); assert(!(await get('beta')).data.records.some(x => x.id === followup.id)); });
    await test('A valid file is attached to the correct draft', async () => { const data = new FormData(); data.set('recipientId', anna); data.set('recordId', followup.id); data.set('file', new File(['%PDF-1.4\nQA fake PDF'], 'qa.pdf', { type: 'application/pdf' })); const r = await call('alpha', 'files', data); assert.equal(r.status, 200); fileId = r.data.files[0].id; assert.equal(r.data.files[0].status, 'unverified'); assert(!(await get('beta')).data.files.some(f => f.id === fileId)); });
    await test('Publishing makes result and attachment available to authorized users only', async () => { const r = await call('alpha', 'records/' + followup.id, { version: followup.version, payload: { status: 'published' } }, 'PATCH'); assert.equal(r.status, 200); const b = (await get('beta')).data; assert(b.records.some(x => x.id === followup.id)); assert(b.files.some(x => x.id === fileId)); assert(!(await get('gamma')).data.files.some(x => x.id === fileId)); });
    await test('Unsafe file signatures are rejected', async () => { const data = new FormData(); data.set('recipientId', anna); data.set('file', new File(['<script>bad</script>'], 'false.pdf', { type: 'application/pdf' })); assert.equal((await call('alpha', 'files', data)).status, 400); });
    await test('General export excludes private answers', async () => { const r = await call('alpha', 'export?recipientId=' + anna, undefined, 'GET'); assert.equal(r.status, 200); assert(!r.data.records.some(e => e.visibility === 'private' || e.kind === 'check')); });
    await test('QR share requires explicit consent and uses no health payload in token', async () => { assert.equal((await call('alpha', 'emergency-shares', { recipientId: anna, confirmed: false })).status, 403); const r = await call('alpha', 'emergency-shares', { recipientId: anna, confirmed: true }); assert.equal(r.status, 200); share = r.data; assert(!share.token.includes('Anna')); const read = await call('delta', 'emergency/' + share.token, undefined, 'GET'); assert.equal(read.status, 200); assert.equal(read.data.name, 'Anna QA'); assert(!read.data.records); });
    await test('Revoked QR share cannot be used again', async () => { await call('alpha', 'emergency-shares/' + share.id, {}, 'DELETE'); assert.equal((await call('delta', 'emergency/' + share.token, undefined, 'GET')).status, 404); });
    await test('Membership revocation blocks existing file access', async () => { const b = (await get('alpha')).data.members.find(m => m.userId === 'beta'); await call('alpha', 'members/' + b.id, {}, 'DELETE'); const headers = { 'oai-authenticated-user-id': 'beta' }; const r = await handleApi(new Request('https://novalis.test/api/files/' + fileId, { headers }), env); assert.equal(r.status, 403); });
    await test('Personal availability requires an actual time window', async () => assert.equal((await create('alpha', 'availability', { status: 'available' }, anna)).status, 400));
    await test('Overlapping windows are merged in the time balance', async () => assert.equal(domain.unionMinutes([{ start: '2026-10-29T10:00:00Z', end: '2026-10-29T11:00:00Z' }, { start: '2026-10-29T10:30:00Z', end: '2026-10-29T11:30:00Z' }]), 90));
    await test('Nonexistent daylight-saving local time is rejected', async () => assert.throws(() => domain.zonedISO('2026-03-29', '02:30')));
    await test('Summer and winter dates retain the same local clock time', async () => { assert.equal(domain.zonedISO('2026-07-01', '08:00'), '2026-07-01T06:00:00.000Z'); assert.equal(domain.zonedISO('2026-12-01', '08:00'), '2026-12-01T07:00:00.000Z'); });
    await test('Unknown inventory is not converted into a fictional range', async () => assert.equal(domain.medicationRemaining({ ...med, payload: { ...med.payload, stock: null } }, []), null));
    await test('Structured FHIR export excludes personal questionnaires', async () => { const s = (await get('alpha')).data; const bundle = domain.fhirBundle(s, anna); assert.equal(bundle.resourceType, 'Bundle'); assert(!bundle.entry.some(e => e.resource.resourceType === 'QuestionnaireResponse')); assert(bundle.entry.some(e => e.resource.resourceType === 'MedicationStatement')); });
    await test('Logos are actual SVG vectors without embedded raster data', async () => { for (const f of ['novalis-symbol.svg', 'novalis-wordmark.svg', 'novalis-symbol-mono.svg']) {
        const s = fs.readFileSync('public/brand/' + f, 'utf8');
        assert(s.includes('<path'));
        assert(!s.includes('<image'));
        assert(!s.includes('base64,'));
    } });
    await test('Full SQLite backup and restore preserve tables and history', async () => {
        const file=path.join(out,'restore-qa.sqlite');try{fs.unlinkSync(file)}catch{}
        await backup(sql,file);const restored=new DatabaseSync(file);
        for(const table of ['accounts','members','records','dose_events','medication_revisions','jobs','notifications','files','audits'])assert.deepEqual(restored.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all(),sql.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all());
        restored.close();fs.unlinkSync(file);
    });
    await test('Server export contains exactly the selected recipient',async()=>{const r=await call('alpha','export?recipientId='+anna,undefined,'GET');assert.equal(r.status,200);assert.deepEqual(r.data.recipients.map(x=>x.id),[anna]);assert(!JSON.stringify(r.data).includes('Paul QA'));});
    await test('Requested task creates a targeted in-app notice',async()=>{const r=await create('alpha','task',{title:'Gezielte Anfrage',date:domain.dateAdd(domain.localDay(),3),assignee:'gamma',status:'requested'},anna);assert.equal(r.status,200);assert((await get('gamma')).data.notifications.some(n=>n.refId===r.data.id&&n.kind==='assignment'));});
    await test('Finite weekly series preserves local time across DST',async()=>{const base={id:'test',circleId:circle,recipientId:anna,kind:'availability',ownerId:'alpha',visibility:'shared',payload:{date:'2026-10-18',start:domain.zonedISO('2026-10-18','08:00'),end:domain.zonedISO('2026-10-18','09:00'),status:'available'},version:1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};const rows=domain.seriesOccurrences(base,'weekly4');assert.equal(rows.length,4);assert.equal(new Set(rows.map(x=>x.id)).size,4);for(const x of rows)assert.equal(domain.formatTime(x.payload.start),'08:00');assert(rows[0].payload.start.endsWith('06:00:00.000Z'));assert(rows[2].payload.start.endsWith('07:00:00.000Z'));});
    await test('Future series edits leave past and completed entries unchanged',async()=>{const first=domain.dateAdd(domain.localDay(),-1);const r=await call('alpha','records',{kind:'task',recipientId:anna,recurrence:'daily7',payload:{title:'Serienprüfung',date:first,status:'open',assignee:null,start:null,end:null}});assert.equal(r.status,200);const row=r.data.state.records.find(x=>x.id===r.data.id);const series=r.data.state.records.filter(x=>x.payload.seriesId===row.payload.seriesId).sort((a,b)=>a.payload.date.localeCompare(b.payload.date));assert.equal(series.length,7);const selected=series[1];await call('alpha','records/'+series[2].id,{version:1,payload:{assignee:'alpha',status:'accepted'}},'PATCH');await call('alpha','records/'+series[2].id,{version:2,payload:{status:'done'}},'PATCH');const edited=await call('alpha','records/'+selected.id,{version:1,scope:'future',payload:{...selected.payload,title:'Neuer Serientitel'}},'PATCH');assert.equal(edited.status,200);assert.equal(edited.data.records.find(x=>x.id===row.id).payload.title,'Serienprüfung');assert.equal(edited.data.records.find(x=>x.id===series[6].id).payload.title,'Neuer Serientitel');assert.equal(edited.data.records.find(x=>x.id===row.id).version,1);assert.equal(edited.data.records.find(x=>x.id===series[2].id).payload.title,'Serienprüfung');assert.equal(edited.data.records.find(x=>x.id===series[2].id).version,3);});
    await test('Series edits reject moving instances to a different date',async()=>{const own=(await get('alpha')).data.records.find(x=>x.payload.title==='Neuer Serientitel');assert.equal((await call('gamma','records/'+own.id,{version:own.version,scope:'future',payload:{...own.payload,recipientId:paul,date:'1999-01-01'}},'PATCH')).status,400);});

    await test('Expired and revoked invitations are both rejected',async()=>{
        for(const expired of [true,false]){const r=await call('alpha','invitations',{circleId:circle,recipientIds:[anna],role:'family'});if(expired)sql.prepare("UPDATE invitations SET expires_at='2000-01-01T00:00:00.000Z' WHERE id=?").run(r.data.id);else await call('alpha','invitations/'+r.data.id,{},'DELETE');assert.equal((await call('epsilon','invitations/accept',{token:r.data.token})).status,400);}
    });
    await test('Rescheduling removes stale notices and replaces the pending reminder',async()=>{
        const current=(await get('alpha')).data.records.find(x=>x.id===appointment.id),d=domain.dateAdd(domain.localDay(),2);
        const r=await call('alpha','records/'+appointment.id,{version:current.version,payload:{date:d,start:domain.zonedISO(d,'12:00'),end:domain.zonedISO(d,'13:00')}},'PATCH');assert.equal(r.status,200);assert(!r.data.notifications.some(n=>n.kind==='followup'&&n.refId===appointment.id));assert.equal(sql.prepare("SELECT COUNT(*) n FROM jobs WHERE ref_id=? AND state='pending'").get(appointment.id).n,1);
    });
    await test('A cancelled appointment never generates a follow-up prompt',async()=>{const d=domain.dateAdd(domain.localDay(),-1);const r=await create('alpha','appointment',{title:'Abgesagt QA',date:d,start:domain.zonedISO(d,'14:00'),end:domain.zonedISO(d,'15:00'),companion:'alpha',companionAccepted:true,status:'cancelled'},anna);assert.equal(r.status,200);assert(!r.data.state.notifications.some(n=>n.refId===r.data.id));assert.equal(sql.prepare('SELECT COUNT(*) n FROM jobs WHERE ref_id=?').get(r.data.id).n,0);});
    await test('Cross-case double booking reports a conflict without case details',async()=>{const d=domain.dateAdd(domain.localDay(),10),payload={title:'Privater Falltitel QA',date:d,start:domain.zonedISO(d,'10:00'),end:domain.zonedISO(d,'11:00'),assignee:'alpha',status:'accepted'};assert.equal((await create('alpha','task',payload,paul)).status,200);const r=await create('alpha','task',{...payload,title:'Andere Aufgabe'},anna);assert.equal(r.status,409);assert(!r.data.error.includes('Privater Falltitel'));assert(!r.data.error.includes('Paul'));});
    await test('Availability suggestions respect windows, absences and confirmed tasks',async()=>{const d=domain.dateAdd(domain.localDay(),5),start=domain.zonedISO(d,'10:00'),end=domain.zonedISO(d,'11:00');const row={id:'window',circleId:circle,recipientId:anna,kind:'availability',ownerId:'alpha',visibility:'shared',payload:{start,end,status:'available'},version:1,createdAt:start,updatedAt:start};assert(domain.availableFor([row],'alpha',start,end));assert(!domain.availableFor([row],'alpha',domain.zonedISO(d,'09:00'),end));assert(!domain.availableFor([row,{...row,id:'absence',kind:'absence'}],'alpha',start,end));assert(!domain.availableFor([row,{...row,id:'busy',kind:'task',payload:{start,end,status:'accepted',assignee:'alpha'}}],'alpha',start,end));});
    await test('Declining a substitution keeps the coverage gap visible',async()=>{const r=await create('alpha','task',{title:'Vertretung ablehnen',date:domain.localDay(),assignee:'alpha',status:'accepted',pendingAssignee:'gamma',coverageNeeded:true},anna);const e=r.data.state.records.find(x=>x.id===r.data.id);const declined=await call('gamma','records/'+e.id,{version:1,payload:{pendingAssignee:null,coverageNeeded:true,declinedBy:'gamma'}},'PATCH');assert.equal(declined.status,200);const saved=declined.data.records.find(x=>x.id===e.id);assert.equal(saved.payload.assignee,'alpha');assert.equal(saved.payload.coverageNeeded,true);assert.equal(saved.payload.pendingAssignee,null);});
    await test('Weekly jobs are unique per recipient circle and account',async()=>{await runDueJobs(env.DB);await runDueJobs(env.DB);assert.equal(sql.prepare("SELECT COUNT(*) n FROM (SELECT dedupe FROM jobs WHERE kind='weekly' GROUP BY dedupe HAVING COUNT(*)>1)").get().n,0);});
    await test('No unauthenticated medical AI endpoint is exposed',async()=>{assert.equal((await call('','ai',{prompt:'QA'})).status,401);assert.equal((await call('alpha','ai',{prompt:'QA'})).status,404);});

    await test('Date-only appointment has no invented clock time or reminder',async()=>{const r=await create('alpha','appointment',{title:'Datum ohne Uhrzeit',date:domain.dateAdd(domain.localDay(),4),start:null,end:null,companion:null,status:'planned'},anna);assert.equal(r.status,200);assert.equal(r.data.state.records.find(x=>x.id===r.data.id).payload.start,null);assert.equal(sql.prepare('SELECT COUNT(*) n FROM jobs WHERE ref_id=?').get(r.data.id).n,0);});
    await test('A second independent circle preserves existing data and personal preferences',async()=>{const before=(await get('alpha')).data;const r=await call('alpha','recipients',{name:'Weiterer QA Fall',circleName:'Zweiter QA Kreis'});assert.equal(r.status,200);assert.equal(r.data.state.circles.length,before.circles.length+1);assert.equal(r.data.state.profile.preferences.font,'large');assert(r.data.state.records.some(x=>x.id===med.id));});

    await test('Private medication events stay private and are excluded from export',async()=>{const d=domain.dateAdd(domain.localDay(),-1);const created=await call('alpha','records',{kind:'medication',recipientId:anna,visibility:'private',payload:{title:'Privater QA Plan',strength:'5 mg',amount:1,unit:'Tablette',times:['07:00'],stock:null,active:true,validFrom:d}});assert.equal(created.status,200);const id=created.data.id;assert.equal((await call('alpha','doses',{medicationId:id,scheduledAt:domain.zonedISO(d,'07:00'),status:'given'})).status,200);const own=(await get('alpha')).data;assert(own.doses.some(x=>x.medicationId===id));const exp=await call('alpha','export?recipientId='+anna,undefined,'GET');assert(!exp.data.doses.some(x=>x.medicationId===id));const invite=await call('alpha','invitations',{circleId:circle,recipientIds:[anna],role:'family'});await call('zeta','invitations/accept',{token:invite.data.token});const other=(await get('zeta')).data;assert(!other.records.some(x=>x.id===id));assert(!other.doses.some(x=>x.medicationId===id));});
    await test('A private flag cannot bypass a helper health permission',async()=>{const r=await call('gamma','records',{kind:'medication',recipientId:anna,visibility:'private',payload:{title:'Unerlaubter privater Plan',amount:1,unit:'Tablette',times:['08:00'],stock:null,active:true}});assert.equal(r.status,403);});

    await test('Read-only health permission cannot be escalated through a private record',async()=>{const invite=await call('alpha','invitations',{circleId:circle,recipientIds:[anna],role:'professional'});await call('eta','invitations/accept',{token:invite.data.token});assert.equal((await call('eta','records',{kind:'medication',recipientId:anna,visibility:'private',payload:{title:'Read-only QA',amount:1,unit:'Tablette',times:['08:00'],stock:null}})).status,403);});
    await test('Completed care work cannot be forged for someone else',async()=>{assert.equal((await create('alpha','task',{title:'Fremde Erledigung',date:domain.localDay(),assignee:'gamma',status:'done'},anna)).status,400);});
    await test('Invalid ending timestamps are rejected at the API boundary',async()=>{assert.equal((await create('alpha','availability',{start:domain.zonedISO(domain.localDay(),'10:00'),end:'invalid',status:'available'},anna)).status,400);});

}
finally {
    const report = { executedAt: new Date().toISOString(), environment: 'Node 24 + SQLite / in-process D1 adapter and private R2 test adapter; not a hosted identity penetration test', passed: checks.filter(c => c.status === 'PASS').length, failed: checks.filter(c => c.status === 'FAIL').length, checks };
    fs.mkdirSync('docs', { recursive: true });
    fs.writeFileSync('docs/TEST_RESULTS.json', JSON.stringify(report, null, 2));
    sql.close();
    console.log(JSON.stringify({ passed: report.passed, failed: report.failed }));
}
