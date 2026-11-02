import { seriesOccurrences, futureSeriesPayload, canRead, canWrite, validate as validatePayload, validateTransition as validateChange, nextFollowupAt, uid, defaults, localDay, monday, dateAdd, zonedISO, formatTime, availableFor, type Entry, type Member, type Kind, type State } from './domain';
interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
}
const kinds: Kind[] = ['task', 'appointment', 'followup', 'observation', 'medication', 'availability', 'weekly', 'absence', 'program', 'check', 'message', 'emergency', 'refill'];
const full = ['plan', 'plan:write', 'health', 'health:write', 'documents', 'documents:write', 'manage'];
const parse = (v: any) => { try {
    return JSON.parse(v || '{}');
}
catch {
    return {};
} };
const camel = (r: any) => r && Object.fromEntries(Object.entries(r).map(([k, v]) => [k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), v]));
const record = (r: any): Entry => ({ ...camel(r), payload: parse(r.payload) });
const member = (r: any): Member => ({ ...camel(r), permissions: parse(r.permissions), recipientIds: parse(r.recipient_ids) });
const response = (data: any, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
class ApiError extends Error {
    constructor(public status: number, message: string) { super(message); }
}
function fail(status: number, message: string): never { throw new ApiError(status, message); }
function validate(kind: Kind, p: any) { try {
    return validatePayload(kind, p);
}
catch (e) {
    return fail(400, (e as Error).message);
} }
function validateTransition(kind: Kind, old: any, p: any, user: string) { try {
    return validateChange(kind, old, p, user);
}
catch (e) {
    return fail(400, (e as Error).message);
} }
async function digest(s: string) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(x => x.toString(16).padStart(2, '0')).join(''); }
function displayName(req: Request) { const raw = req.headers.get('oai-authenticated-user-full-name'); try {
    return raw ? (req.headers.get('oai-authenticated-user-full-name-encoding') === 'percent-encoded-utf-8' ? decodeURIComponent(raw) : raw) : req.headers.get('oai-authenticated-user-email')?.split('@')[0] || 'Mein Profil';
}
catch {
    return 'Mein Profil';
} }
async function ensureWeeklyJobs(db: D1Database, now: string) {
    const day = localDay(new Date(now)), week = monday(dateAdd(day, 7));
    const rows = (await db.prepare('SELECT m.*,a.preferences FROM members m JOIN accounts a ON a.id=m.user_id WHERE m.active=1').all()).results as any[];
    for (const r of rows) {
        const prefs = parse(r.preferences);
        if (prefs.weeklyReminders === false)
            continue;
        const ids = parse(r.recipient_ids);
        const patients = (await db.prepare('SELECT id FROM recipients WHERE circle_id=?').bind(r.circle_id).all()).results as any[];
        const first = patients.find(p => !ids.length || ids.includes(p.id));
        if (!first)
            continue;
        const due = zonedISO(dateAdd(week, -4), '18:00');
        await db.prepare('INSERT OR IGNORE INTO jobs (id,kind,circle_id,recipient_id,ref_id,user_id,due_at,state,ref_version,dedupe) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(uid(), 'weekly', r.circle_id, first.id, week, r.user_id, due, 'pending', 1, `weekly:${r.user_id}:${r.circle_id}:${week}`).run();
    }
}
export async function runDueJobs(db: D1Database, now = new Date().toISOString()) {
    await ensureWeeklyJobs(db, now);
    const rows = (await db.prepare("SELECT * FROM jobs WHERE state='pending' AND due_at<=? ORDER BY due_at LIMIT 200").bind(now).all()).results as any[];
    let processed = 0;
    for (const j of rows) {
        const account = await db.prepare('SELECT preferences FROM accounts WHERE id=?').bind(j.user_id).first() as any;
        const prefs = parse(account?.preferences);
        if (j.kind === 'weekly' && prefs.weeklyReminders === false || j.kind === 'followup' && prefs.appointmentReminders === false) {
            await db.prepare("UPDATE jobs SET state='cancelled' WHERE id=?").bind(j.id).run();
            continue;
        }
        const m = await db.prepare('SELECT * FROM members WHERE circle_id=? AND user_id=? AND active=1').bind(j.circle_id, j.user_id).first();
        if (!m || parse((m as any).recipient_ids).length && !parse((m as any).recipient_ids).includes(j.recipient_id) || j.kind === 'followup' && !parse((m as any).permissions).includes('health')) {
            await db.prepare("UPDATE jobs SET state='cancelled' WHERE id=?").bind(j.id).run();
            continue;
        }
        if (j.kind === 'followup') {
            const raw = await db.prepare('SELECT * FROM records WHERE id=? AND deleted=0').bind(j.ref_id).first() as any;
            const p = raw && parse(raw.payload);
            if (!raw || raw.version !== j.ref_version || p.status === 'cancelled' || p.companion !== j.user_id || !p.companionAccepted) {
                await db.prepare("UPDATE jobs SET state='cancelled' WHERE id=?").bind(j.id).run();
                continue;
            }
            const completed = await db.prepare("SELECT id FROM records WHERE kind='followup' AND deleted=0 AND json_extract(payload,'$.appointmentId')=? AND json_extract(payload,'$.status')='published'").bind(j.ref_id).first();
            if (completed) {
                await db.prepare("UPDATE jobs SET state='done' WHERE id=?").bind(j.id).run();
                continue;
            }
        }
        await db.batch([db.prepare('INSERT OR IGNORE INTO notifications (id,user_id,circle_id,recipient_id,kind,ref_id,title,created_at,dedupe) VALUES (?,?,?,?,?,?,?,?,?)').bind(uid(), j.user_id, j.circle_id, j.recipient_id, j.kind, j.ref_id, j.kind === 'followup' ? 'Wie war der Arzttermin? Ergebnisse festhalten.' : 'Deine Zeitfenster für die nächste Woche', now, j.dedupe), db.prepare("UPDATE jobs SET state='done' WHERE id=? AND state='pending'").bind(j.id)]);
        processed++;
    }
    return { processed };
}
async function scheduleAppointment(db: D1Database, e: Entry) { await db.prepare("DELETE FROM notifications WHERE ref_id=? AND kind='followup'").bind(e.id).run(); await db.prepare("UPDATE jobs SET state='cancelled' WHERE ref_id=? AND kind='followup' AND state='pending'").bind(e.id).run(); const due = nextFollowupAt(e.payload); if (!due)
    return; await db.prepare('INSERT OR IGNORE INTO jobs (id,kind,circle_id,recipient_id,ref_id,user_id,due_at,state,ref_version,dedupe) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(uid(), 'followup', e.circleId, e.recipientId, e.id, e.payload.companion, due, 'pending', e.version, `followup:${e.id}:${e.version}`).run(); }
export async function handleApi(req: Request, env: Env): Promise<Response> {
    try {
        const db = env.DB;
        if (!db)
            return response({ error: 'Die Datenbank ist noch nicht verbunden. Die Demo bleibt nutzbar.' }, 503);
        const path = new URL(req.url).pathname.replace(/^\/api\/?/, '');
        // This endpoint is intentionally protected by Sites' owner-private dispatch boundary.
        // Never make this deployment public without adding a separate service credential.
        if (path === 'jobs/run' && req.method === 'POST' && !req.headers.get('origin'))
            return response(await runDueJobs(db));
        if (!['GET', 'HEAD'].includes(req.method)) {
            const origin = req.headers.get('origin');
            if (origin && origin !== new URL(req.url).origin)
                fail(403, 'Diese Anfrage stammt nicht aus der App.');
            if (req.headers.get('sec-fetch-site') === 'cross-site')
                fail(403, 'Die Anfrage wurde blockiert.');
        }
        const user = req.headers.get('oai-authenticated-user-id') || '';
        if (!user)
            return response({ error: 'Bitte anmelden.', authenticationRequired: true }, 401);
        const now = new Date().toISOString();
        await db.prepare('INSERT OR IGNORE INTO accounts (id,email,name,preferences,onboarding,created_at) VALUES (?,?,?,?,0,?)').bind(user, req.headers.get('oai-authenticated-user-email') || '', displayName(req), JSON.stringify(defaults), now).run();
        const q = (sql: string, ...args: any[]) => db.prepare(sql).bind(...args);
        const audit = async (action: string, id: string, circle = '') => q('INSERT INTO audits (id,user_id,circle_id,action,entity_id,at) VALUES (?,?,?,?,?,?)', uid(), user, circle, action, id, now).run();
        const membership = async (circle: string, recipient?: string) => { const r = await q('SELECT * FROM members WHERE circle_id=? AND user_id=? AND active=1', circle, user).first(); if (!r)
            fail(403, 'Du hast keinen Zugriff auf diesen Pflegekreis.'); const m = member(r); if (recipient && m.recipientIds.length && !m.recipientIds.includes(recipient))
            fail(403, 'Dieses Pflegeprofil ist nicht für dich freigegeben.'); return m; };
        const caseAccess = async (id: string, perm?: string) => { const c = await q('SELECT * FROM recipients WHERE id=?', id).first() as any; if (!c)
            fail(404, 'Pflegeprofil nicht gefunden.'); const m = await membership(c.circle_id, id); if (perm && !m.permissions.includes(perm))
            fail(403, 'Für diese Aktion fehlt dir die Freigabe.'); return { c, m }; };
        const checkAssignment = async (e: Entry) => { for (const key of ['assignee', 'pendingAssignee', 'companion']) {
            const id = e.payload[key];
            if (!id)
                continue;
            const raw = await q('SELECT * FROM members WHERE circle_id=? AND user_id=? AND active=1', e.circleId, id).first() as any;
            if (!raw)
                fail(400, 'Die ausgewählte Person gehört nicht zu diesem Pflegekreis.');
            const mm = member(raw);
            if (mm.recipientIds.length && !mm.recipientIds.includes(e.recipientId))
                fail(400, 'Die ausgewählte Person ist nicht für dieses Pflegeprofil freigegeben.');
            if (key === 'companion' && !mm.permissions.includes('health'))
                fail(400, 'Die Begleitung benötigt eine passende Freigabe für diesen Arzttermin.');
        } const p = e.payload; const assigned = e.kind === 'task' && p.status === 'accepted' ? p.assignee : e.kind === 'appointment' && p.companionAccepted ? p.companion : null; if (assigned && p.start && p.end) {
            const others = (await q("SELECT id,payload,kind FROM records WHERE deleted=0 AND kind IN ('task','appointment') AND id<>?", e.id).all()).results as any[];
            if (others.some(r => { const v = parse(r.payload); return v.start && v.end && ((r.kind === 'task' && v.assignee === assigned && v.status === 'accepted') || (r.kind === 'appointment' && v.companion === assigned && v.companionAccepted && v.status !== 'cancelled')) && Date.parse(p.start) < Date.parse(v.end) && Date.parse(v.start) < Date.parse(p.end); }))
                fail(409, 'Diese Person ist in diesem Zeitraum bereits eingeplant. Bitte einen anderen Zeitraum wählen.');
        } };
        const getRecord = async (id: string, write = false) => { const r = await q('SELECT * FROM records WHERE id=? AND deleted=0', id).first() as any; if (!r)
            fail(404, 'Eintrag nicht gefunden.'); const e = record(r), m = await membership(e.circleId, e.recipientId); if (!(write ? canWrite : canRead)(m, e, user))
            fail(403, 'Dieser Eintrag ist nicht für dich freigegeben.'); if (e.kind === 'followup' && e.payload.status !== 'published' && e.ownerId !== user)
            fail(403, 'Dieser Entwurf ist privat.'); return { e, m }; };
        async function bootstrap() {
            await runDueJobs(db!);
            const a = await q('SELECT * FROM accounts WHERE id=?', user).first() as any;
            const ms = (await q('SELECT * FROM members WHERE user_id=? AND active=1', user).all()).results.map(member);
            let rs: any[] = [], cs: any[] = [], mem: any[] = [], rec: Entry[] = [], doses: any[] = [], files: any[] = [], invs: any[] = [];
            for (const m of ms) {
                const circle = await q('SELECT id,name FROM circles WHERE id=?', m.circleId).first();
                if (circle)
                    cs.push(circle);
                const patients = (await q('SELECT * FROM recipients WHERE circle_id=?', m.circleId).all()).results as any[];
                for (const p of patients) {
                    if (m.recipientIds.length && !m.recipientIds.includes(p.id))
                        continue;
                    rs.push({ ...camel(p), info: m.permissions.includes('health') ? parse(p.info) : {} });
                }
                const entries = (await q('SELECT * FROM records WHERE circle_id=? AND deleted=0 ORDER BY updated_at DESC', m.circleId).all()).results.map(record);
                rec.push(...entries.filter(e => canRead(m, e, user) && !(e.kind === 'followup' && e.payload.status !== 'published' && e.ownerId !== user)).map(e => e.kind === 'availability' && e.ownerId !== user ? { ...e, payload: { start: e.payload.start, end: e.payload.end, status: e.payload.status, repeat: e.payload.repeat } } : e));
                mem.push(...(await q('SELECT id,circle_id,user_id,name,role,permissions,recipient_ids,active FROM members WHERE circle_id=? AND active=1', m.circleId).all()).results.map(member));
                if (m.permissions.includes('health')) {
                    doses.push(...(await q('SELECT * FROM dose_events WHERE circle_id=? ORDER BY at', m.circleId).all()).results.map(camel).filter(d => (!m.recipientIds.length || m.recipientIds.includes(d.recipientId))&&entries.some(e=>e.id===d.medicationId&&canRead(m,e,user))));
                }
                if (m.permissions.includes('documents')) {
                    files.push(...(await q('SELECT * FROM files WHERE circle_id=?', m.circleId).all()).results.map(camel).filter(f => !m.recipientIds.length || m.recipientIds.includes(f.recipientId)).filter(f => !f.recordId || entries.some(e => e.id === f.recordId && canRead(m, e, user) && (e.kind !== 'followup' || e.payload.status === 'published' || e.ownerId === user))).map(({ objectKey, ...f }) => f));
                }
                if (m.permissions.includes('manage'))
                    invs.push(...(await q('SELECT id,circle_id,role,recipient_ids,expires_at,used_by,revoked_at FROM invitations WHERE circle_id=?', m.circleId).all()).results.map(camel));
            }
            const notes = (await q('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100', user).all()).results.map(camel).filter(n => ms.some(m => m.circleId === n.circleId && (!m.recipientIds.length || m.recipientIds.includes(n.recipientId))));
            return { profile: { ...camel(a), preferences: { ...defaults, ...parse(a.preferences) } }, circles: cs, recipients: rs, members: mem, records: rec, doses, files, invitations: invs, notifications: notes, now };
        }
        if (path === 'bootstrap' && req.method === 'GET')
            return response(await bootstrap());
        const body = async () => { if (Number(req.headers.get('content-length') || 0) > 150000)
            fail(413, 'Zu viele Daten.'); const raw = await req.text(); if (raw.length > 150000)
            fail(413, 'Zu viele Daten.'); try {
            return JSON.parse(raw);
        }
        catch {
            fail(400, 'Die Eingabe konnte nicht gelesen werden.');
        } };
        if (path === 'profile' && req.method === 'PATCH') {
            const b = await body();
            const old = await q('SELECT * FROM accounts WHERE id=?', user).first() as any;
            const preferences = { ...parse(old.preferences), ...b.preferences };
            delete preferences.auth;
            await q('UPDATE accounts SET name=?,preferences=?,onboarding=? WHERE id=?', String(b.name || old.name).slice(0, 100), JSON.stringify(preferences), b.onboarding === undefined ? old.onboarding : Number(!!b.onboarding), user).run();
            if (b.consent !== undefined)
                await q('INSERT INTO consents (id,user_id,purpose,accepted,version,at) VALUES (?,?,?,?,?,?)', uid(), user, 'app', Number(!!b.consent), '2026-10-v1', now).run();
            return response(await bootstrap());
        }
        if (path === 'recipients' && req.method === 'POST') {
            const b = await body();
            if (!b.name?.trim())
                fail(400, 'Bitte einen Namen eingeben.');
            let circle = b.circleId;
            if (circle) {
                const m = await membership(circle);
                if (!m.permissions.includes('manage'))
                    fail(403, 'Du darfst kein Pflegeprofil hinzufügen.');
            }
            else {
                circle = uid();
                await db.batch([q('INSERT INTO circles (id,name,created_by,created_at) VALUES (?,?,?,?)', circle, b.circleName?.slice(0, 100) || 'Unser Pflegekreis', user, now), q('INSERT INTO members (id,circle_id,user_id,name,role,permissions,recipient_ids,active) VALUES (?,?,?,?,?,?,?,1)', uid(), circle, user, displayName(req), 'owner', JSON.stringify(full), '[]')]);
            }
            const id = uid();
            await q('INSERT INTO recipients (id,circle_id,name,info,created_at) VALUES (?,?,?,?,?)', id, circle, b.name.trim().slice(0, 100), JSON.stringify(b.info || {}), now).run();
            await audit('recipient.created', id, circle);
            return response({ id, state: await bootstrap() });
        }
        if (path.startsWith('recipients/') && req.method === 'PATCH') {
            const id = path.split('/')[1];
            const { m } = await caseAccess(id, 'health:write');
            const b = await body();
            if (!m.permissions.includes('manage'))
                fail(403, 'Nur die fallbezogene Verwaltung kann Stammdaten ändern.');
            await q('UPDATE recipients SET name=?,info=? WHERE id=?', String(b.name).slice(0, 100), JSON.stringify(b.info || {}), id).run();
            await audit('recipient.updated', id, m.circleId);
            return response(await bootstrap());
        }
        if (path === 'records' && req.method === 'POST') {
            const b = await body();
            if (!kinds.includes(b.kind))
                fail(400, 'Unbekannte Art von Eintrag.');
            const { c, m } = await caseAccess(b.recipientId);
            const visibility = b.kind === 'check' || b.kind === 'program' ? 'private' : b.visibility === 'private' ? 'private' : 'shared';
            const e: Entry = { id: uid(), circleId: c.circle_id, recipientId: c.id, kind: b.kind, ownerId: user, visibility, payload: validate(b.kind, b.payload || {}), version: 1, createdAt: now, updatedAt: now };
            if (!canWrite(m, e, user))
                fail(403, 'Du darfst diesen Eintrag nicht erstellen.');
            validateTransition(e.kind, {}, e.payload, user);
            await checkAssignment(e);
            if (e.kind === 'followup') {
                const { e: a } = await getRecord(e.payload.appointmentId);
                if (a.kind !== 'appointment' || a.recipientId !== e.recipientId)
                    fail(400, 'Die Zuordnung zum Arzttermin stimmt nicht.');
                if (a.payload.companion !== user && !m.permissions.includes('manage'))
                    fail(403, 'Die Nachbereitung ist einer anderen Begleitung zugeordnet.');
                if (e.payload.status === 'published' && !String(e.payload.text || '').trim() && !e.payload.nothingToAdd)
                    fail(400, 'Bitte kurz zusammenfassen oder ausdrücklich ohne Ergänzung abschließen.');
            }
            let occurrences: Entry[];
            try { occurrences = seriesOccurrences(e,b.recurrence); } catch(err) { fail(400,(err as Error).message); }
            for(const item of occurrences!) { validate(item.kind,item.payload); await checkAssignment(item); }
            await db.batch(occurrences!.map(item=>q('INSERT INTO records (id,circle_id,recipient_id,kind,owner_id,visibility,payload,version,deleted,created_at,updated_at) VALUES (?,?,?,?,?,?,?,1,0,?,?)', item.id,item.circleId,item.recipientId,item.kind,user,item.visibility,JSON.stringify(item.payload),now,now)));
            await assignmentNotice(e);
            if (e.kind === 'appointment')
                await scheduleAppointment(db, e);
            await audit('record.created', e.id, e.circleId);
            if (e.kind === 'followup' && e.payload.status === 'published')
                await publishNotice(e);
            return response({ id: e.id, state: await bootstrap() });
        }
        async function assignmentNotice(e: Entry) {
            const target=e.kind==='task'?(e.payload.pendingAssignee || (e.payload.status==='requested'?e.payload.assignee:null)):e.kind==='appointment'&&!e.payload.companionAccepted?e.payload.companion:null;
            if(!target || target===user) return;
            await q('INSERT OR IGNORE INTO notifications (id,user_id,circle_id,recipient_id,kind,ref_id,title,created_at,dedupe) VALUES (?,?,?,?,?,?,?,?,?)',uid(),target,e.circleId,e.recipientId,'assignment',e.id,e.kind==='appointment'?'Du wurdest als Begleitung angefragt. Bitte selbst zusagen.':'Eine Aufgabe braucht deine Zusage.',now,`assignment:${e.id}:${e.version}:${target}`).run();
        }
        async function publishNotice(e: Entry) { const group = (await q('SELECT * FROM members WHERE circle_id=? AND active=1', e.circleId).all()).results.map(member); for (const m of group) {
            if (m.userId !== user && canRead(m, e, m.userId))
                await q('INSERT OR IGNORE INTO notifications (id,user_id,circle_id,recipient_id,kind,ref_id,title,created_at,dedupe) VALUES (?,?,?,?,?,?,?,?,?)', uid(), m.userId, e.circleId, e.recipientId, 'published', e.id, 'Eine Termin-Nachbereitung ist verfügbar.', now, `published:${e.id}:${e.version}:${m.userId}`).run();
        } }
        if (path.startsWith('records/') && ['PATCH', 'DELETE'].includes(req.method)) {
            const id = path.split('/')[1], { e, m } = await getRecord(id, true);
            const b = await body();
            if (Number(b.version) !== e.version)
                fail(409, 'Dieser Eintrag wurde inzwischen geändert. Bitte aktualisieren.');
            if(req.method==='PATCH' && b.scope==='future') {
                if(!e.payload.seriesId || !['task','availability'].includes(e.kind)) fail(400,'Dieser Eintrag gehört zu keiner bearbeitbaren Serie.');
                if(b.payload.date!==e.payload.date || b.payload.start!==e.payload.start || b.payload.end!==e.payload.end || b.payload.assignee!==e.payload.assignee) fail(400,'Datum, Uhrzeit und Zuständigkeit bitte pro Einzeltermin ändern.');
                const series=(await q("SELECT * FROM records WHERE deleted=0 AND recipient_id=? AND kind=? AND json_extract(payload,'$.seriesId')=?",e.recipientId,e.kind,e.payload.seriesId).all()).results.map(record).filter(x=>x.payload.date>=localDay() && x.payload.date>=e.payload.date && x.payload.status!=='done');
                if(!series.length) fail(400,'Es gibt keine offenen zukünftigen Termine in dieser Auswahl.');
                const nexts=series.map(x=>({entry:x,payload:futureSeriesPayload(x.payload,b.payload)}));
                for(const n of nexts) { if(!canWrite(m,n.entry,user))fail(403,'Eine Serienänderung ist für diese Einträge nicht erlaubt.'); validate(n.entry.kind,n.payload);validateTransition(n.entry.kind,n.entry.payload,n.payload,user); }
                // One SQL statement changes the whole selection only while every observed version matches.
                const ids=series.map(x=>x.id), placeholders=ids.map(()=>'?').join(',');
                const cases=nexts.map(()=> 'WHEN id=? THEN ?').join(' ');
                const conditions=series.map(()=>'(id=? AND version<>?)').join(' OR ');
                const args=nexts.flatMap(n=>[n.entry.id,JSON.stringify(n.payload)]);
                const changed=await q(`UPDATE records SET payload=CASE ${cases} ELSE payload END,version=version+1,updated_at=? WHERE id IN (${placeholders}) AND NOT EXISTS (SELECT 1 FROM records WHERE ${conditions})`,...args,now,...ids,...series.flatMap(x=>[x.id,x.version])).run();
                if(changed.meta.changes!==series.length)fail(409,'Die Serie wurde gleichzeitig geändert. Bitte neu laden.');
                await audit('series.updated',e.payload.seriesId,e.circleId);return response(await bootstrap());
            }
            if (req.method === 'DELETE') {
                if (e.kind === 'medication')
                    fail(400, 'Bitte das Medikament mit einem Enddatum deaktivieren. Die Historie bleibt erhalten.');
                await q('UPDATE records SET deleted=1,version=version+1,updated_at=? WHERE id=? AND version=?', now, id, e.version).run();
                if (e.kind === 'appointment')
                    await q("UPDATE jobs SET state='cancelled' WHERE ref_id=? AND state='pending'", id).run();
            }
            else {
                const next = { ...e.payload, ...b.payload };
                if (e.kind === 'medication' && next.stock !== e.payload.stock)
                    next.stockBaselineAt = now;
                validate(e.kind, next);
                validateTransition(e.kind, e.payload, next, user);
                await checkAssignment({ ...e, payload: next });
                if (e.kind === 'task' && next.start && next.end && next.assignee && next.status === 'accepted') {
                    const others = (await q("SELECT * FROM records WHERE deleted=0 AND kind IN ('task','appointment') AND id<>?", id).all()).results.map(record);
                    if (others.some(x => (x.payload.assignee === next.assignee && x.payload.status === 'accepted' || x.payload.companion === next.assignee && x.payload.companionAccepted) && x.payload.start && x.payload.end && Date.parse(next.start) < Date.parse(x.payload.end) && Date.parse(x.payload.start) < Date.parse(next.end)))
                        fail(409, 'Diese Person ist in diesem Zeitraum bereits eingeplant. Bitte einen anderen Zeitraum wählen.');
                }
                const changed = await q('UPDATE records SET payload=?,version=version+1,updated_at=? WHERE id=? AND version=?', JSON.stringify(next), now, id, e.version).run();
                if (changed.meta.changes !== 1)
                    fail(409, 'Der Eintrag wurde gleichzeitig geändert. Bitte neu laden.');
                if (e.kind === 'medication')
                    await q('INSERT OR IGNORE INTO medication_revisions (id,medication_id,version,payload,by_user,at) VALUES (?,?,?,?,?,?)', uid(), e.id, e.version, JSON.stringify(e.payload), user, now).run();
                e.payload = next;
                e.version++;
                await assignmentNotice(e);
                if (e.kind === 'appointment')
                    await scheduleAppointment(db, e);
                if (e.kind === 'followup' && next.status === 'published')
                    await publishNotice(e);
            }
            await audit(req.method === 'DELETE' ? 'record.deleted' : 'record.updated', id, e.circleId);
            return response(await bootstrap());
        }
        if (path === 'doses' && req.method === 'POST') {
            const b = await body();
            const { e } = await getRecord(b.medicationId, true);
            if (e.kind !== 'medication')
                fail(400, 'Kein Medikament.');
            if (!['taken', 'given', 'declined', 'unclear', 'omitted'].includes(b.status))
                fail(400, 'Ungültiger Status.');
            if (!b.scheduledAt || Number.isNaN(Date.parse(b.scheduledAt)))
                fail(400, 'Ungültiger Gabenzeitpunkt.');
            if (Date.parse(b.scheduledAt) > Date.now() + 5 * 60000)
                fail(400, 'Eine zukünftige Gabe kann noch nicht als erfolgt dokumentiert werden.');
            let correction: string | null = null;
            let amount = String(e.payload.amount), unit = e.payload.unit, planVersion = e.version;
            if (!b.correctionOf && (e.payload.active === false || e.payload.validFrom && b.scheduledAt.slice(0, 10) < e.payload.validFrom || !e.payload.times.includes(formatTime(b.scheduledAt))))
                fail(400, 'Dieser Zeitpunkt gehört nicht zum aktuellen dokumentierten Plan.');
            if (b.correctionOf) {
                const old = await q('SELECT * FROM dose_events WHERE id=? AND medication_id=?', b.correctionOf, e.id).first() as any;
                if (!old || old.correction_of || old.scheduled_at !== b.scheduledAt)
                    fail(400, 'Ungültiger Korrekturbezug.');
                if (!b.reason?.trim())
                    fail(400, 'Bitte den Grund der Korrektur angeben.');
                correction = old.id;
                amount = old.amount;
                unit = old.unit;
                planVersion = old.plan_version;
            }
            try {
                await q('INSERT INTO dose_events (id,circle_id,recipient_id,medication_id,scheduled_at,status,by_user,at,reason,correction_of,dedupe,amount,unit,plan_version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', uid(), e.circleId, e.recipientId, e.id, b.scheduledAt, b.status, user, now, b.reason?.slice(0, 500) || null, correction, correction ? null : `${e.id}:${b.scheduledAt}`, amount, unit, planVersion).run();
            }
            catch (err) {
                if (String(err).includes('UNIQUE'))
                    fail(409, 'Diese Gabe wurde bereits dokumentiert. Bitte den aktuellen Stand ansehen.');
                throw err;
            }
            await audit('dose.documented', e.id, e.circleId);
            return response(await bootstrap());
        }
        if (path === 'followup/snooze' && req.method === 'POST') {
            const b = await body();
            const { e } = await getRecord(b.appointmentId);
            if (e.kind !== 'appointment' || e.payload.companion !== user)
                fail(403, 'Diese Erinnerung gehört zur Begleitperson.');
            const due = new Date(Date.now() + Math.max(15, Math.min(10080, Number(b.minutes) || 60)) * 60000).toISOString();
            await q('INSERT INTO jobs (id,kind,circle_id,recipient_id,ref_id,user_id,due_at,state,ref_version,dedupe) VALUES (?,?,?,?,?,?,?,?,?,?)', uid(), 'followup', e.circleId, e.recipientId, e.id, user, due, 'pending', e.version, `snooze:${e.id}:${due}`).run();
            await q('UPDATE notifications SET read_at=? WHERE ref_id=? AND user_id=?', now, e.id, user).run();
            return response(await bootstrap());
        }
        if (path === 'weekly' && req.method === 'POST') {
            const b = await body();
            const { c } = await caseAccess(b.recipientId, 'plan');
            const week = monday(b.week || dateAdd(localDay(), 7));
            const id = `weekly:${user}:${c.id}:${week}`;
            await q('INSERT OR IGNORE INTO records (id,circle_id,recipient_id,kind,owner_id,visibility,payload,version,deleted,created_at,updated_at) VALUES (?,?,?,?,?,?,?,1,0,?,?)', id, c.circle_id, c.id, 'weekly', user, 'shared', JSON.stringify({ week, answered: true }), now, now).run();
            await audit('weekly.answered', id, c.circle_id);
            return response(await bootstrap());
        }
        if (path === 'notifications/read' && req.method === 'POST') {
            const b = await body();
            await q('UPDATE notifications SET read_at=? WHERE user_id=? AND (? IS NULL OR id=?)', now, user, b.id || null, b.id || null).run();
            return response(await bootstrap());
        }
        if (path === 'invitations' && req.method === 'POST') {
            const b = await body();
            const m = await membership(b.circleId);
            if (!m.permissions.includes('manage'))
                fail(403, 'Nur die Pflegekreisverwaltung kann einladen.');
            const scopes = Array.isArray(b.recipientIds) ? b.recipientIds : [];
            if (!scopes.length)
                fail(400, 'Bitte mindestens ein Pflegeprofil auswählen.');
            for (const r of scopes) {
                const { c } = await caseAccess(r);
                if (c.circle_id !== b.circleId)
                    fail(400, 'Ungültiges Pflegeprofil.');
            }
            const perms = b.role === 'helper' ? ['plan', 'plan:write'] : b.role === 'professional' ? ['plan', 'health', 'documents'] : ['plan', 'plan:write', 'health', 'health:write', 'documents', 'documents:write'];
            const token = uid() + uid(), id = uid();
            await q('INSERT INTO invitations (id,token_hash,circle_id,created_by,role,permissions,recipient_ids,expires_at) VALUES (?,?,?,?,?,?,?,?)', id, await digest(token), b.circleId, user, b.role === 'helper' ? 'helper' : b.role === 'professional' ? 'professional' : 'family', JSON.stringify(perms), JSON.stringify(scopes), new Date(Date.now() + 7 * 86400000).toISOString()).run();
            await audit('invitation.created', id, b.circleId);
            return response({ token, id, state: await bootstrap() });
        }
        if (path === 'invitations/accept' && req.method === 'POST') {
            const b = await body();
            const i = await q('SELECT * FROM invitations WHERE token_hash=?', await digest(String(b.token || ''))).first() as any;
            if (!i || i.revoked_at || i.used_by || i.expires_at < now)
                fail(400, 'Diese Einladung ist ungültig, abgelaufen oder bereits verwendet.');
            const a = await q('SELECT name FROM accounts WHERE id=?', user).first() as any;
            const taken = await q('UPDATE invitations SET used_by=? WHERE id=? AND used_by IS NULL AND revoked_at IS NULL', user, i.id).run();
            if (taken.meta.changes !== 1)
                fail(409, 'Diese Einladung wurde inzwischen verwendet.');
            await q('INSERT INTO members (id,circle_id,user_id,name,role,permissions,recipient_ids,active) VALUES (?,?,?,?,?,?,?,1) ON CONFLICT(circle_id,user_id) DO UPDATE SET active=1,permissions=excluded.permissions,recipient_ids=excluded.recipient_ids,role=excluded.role', uid(), i.circle_id, user, a.name, i.role, i.permissions, i.recipient_ids).run();
            await audit('invitation.accepted', i.id, i.circle_id);
            return response(await bootstrap());
        }
        if (path.startsWith('invitations/') && req.method === 'DELETE') {
            const id = path.split('/')[1];
            const i = await q('SELECT * FROM invitations WHERE id=?', id).first() as any;
            if (!i)
                fail(404, 'Einladung nicht gefunden.');
            const m = await membership(i.circle_id);
            if (!m.permissions.includes('manage'))
                fail(403, 'Keine Berechtigung.');
            await q('UPDATE invitations SET revoked_at=? WHERE id=?', now, id).run();
            return response(await bootstrap());
        }
        if (path.startsWith('members/') && req.method === 'DELETE') {
            const id = path.split('/')[1];
            const target = await q('SELECT * FROM members WHERE id=?', id).first() as any;
            if (!target)
                fail(404, 'Mitglied nicht gefunden.');
            const m = await membership(target.circle_id);
            if (!m.permissions.includes('manage') || target.role === 'owner')
                fail(403, 'Dieses Mitglied kann so nicht entfernt werden.');
            await q('UPDATE members SET active=0 WHERE id=?', id).run();
            await audit('membership.revoked', id, target.circle_id);
            return response(await bootstrap());
        }
        if (path === 'files' && req.method === 'POST') {
            if (Number(req.headers.get('content-length') || 0) > 12 * 1024 * 1024)
                fail(413, 'Die Datei ist zu groß.');
            const form = await req.formData();
            const rid = String(form.get('recipientId') || '');
            const { c } = await caseAccess(rid, 'documents:write');
            const file = form.get('file');
            if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024)
                fail(400, 'Bitte eine Datei bis 10 MB auswählen.');
            if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type))
                fail(400, 'Erlaubt sind PDF, PNG und JPEG.');
            const bytes = new Uint8Array(await file.arrayBuffer());
            const valid = file.type === 'application/pdf' ? new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-' : file.type === 'image/png' ? bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71 : bytes[0] === 255 && bytes[1] === 216;
            if (!valid)
                fail(400, 'Der Dateiinhalt passt nicht zum angegebenen Format.');
            const ref = String(form.get('recordId') || '');
            if (ref) {
                const { e } = await getRecord(ref, true);
                if (e.recipientId !== rid)
                    fail(400, 'Die Datei gehört zu einem anderen Pflegeprofil.');
            }
            if (!env.BUCKET)
                fail(503, 'Die Dateiablage ist noch nicht verbunden.');
            const id = uid(), key = `documents/${c.circle_id}/${rid}/${id}`;
            await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: file.type } });
            try {
                await q('INSERT INTO files (id,circle_id,recipient_id,record_id,owner_id,name,mime,size,object_key,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)', id, c.circle_id, rid, ref || null, user, file.name.replace(/[\r\n\\/<>]/g, '').slice(0, 150), file.type, file.size, key, 'unverified', now).run();
            }
            catch (e) {
                await env.BUCKET.delete(key);
                throw e;
            }
            await audit('file.uploaded', id, c.circle_id);
            return response(await bootstrap());
        }
        if (path.startsWith('files/') && req.method === 'GET') {
            const f = await q('SELECT * FROM files WHERE id=?', path.split('/')[1]).first() as any;
            if (!f)
                fail(404, 'Datei nicht gefunden.');
            await caseAccess(f.recipient_id, 'documents');
            if (f.record_id)
                await getRecord(f.record_id);
            const obj = await env.BUCKET?.get(f.object_key);
            if (!obj)
                fail(404, 'Datei nicht verfügbar.');
            await audit('file.downloaded', f.id, f.circle_id);
            return new Response(obj.body, { headers: { 'content-type': f.mime, 'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(f.name)}`, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'content-security-policy': "sandbox; default-src 'none'" } });
        }
        if (path === 'emergency-shares' && req.method === 'GET') {
            const rid = new URL(req.url).searchParams.get('recipientId') || '';
            const { m } = await caseAccess(rid, 'health');
            if (!m.permissions.includes('manage'))
                fail(403, 'Keine Berechtigung.');
            return response((await q('SELECT id,expires_at,revoked_at FROM emergency_shares WHERE recipient_id=? ORDER BY expires_at DESC', rid).all()).results.map(camel));
        }
        if (path === 'emergency-shares' && req.method === 'POST') {
            const b = await body();
            const { m } = await caseAccess(b.recipientId, 'health');
            if (!m.permissions.includes('manage') || b.confirmed !== true)
                fail(403, 'Bitte die eingeschränkte Freigabe bewusst bestätigen.');
            const token = uid() + uid(), id = uid();
            await q('INSERT INTO emergency_shares (id,token_hash,recipient_id,created_by,expires_at) VALUES (?,?,?,?,?)', id, await digest(token), b.recipientId, user, new Date(Date.now() + 24 * 3600000).toISOString()).run();
            await audit('emergency.shared', id, m.circleId);
            return response({ id, token, expiresAt: new Date(Date.now() + 24 * 3600000).toISOString() });
        }
        if (path.startsWith('emergency-shares/') && req.method === 'DELETE') {
            const id = path.split('/')[1], share = await q('SELECT * FROM emergency_shares WHERE id=?', id).first() as any;
            if (!share)
                fail(404, 'Freigabe nicht gefunden.');
            const { m } = await caseAccess(share.recipient_id, 'health');
            if (!m.permissions.includes('manage'))
                fail(403, 'Keine Berechtigung.');
            await q('UPDATE emergency_shares SET revoked_at=? WHERE id=?', now, id).run();
            return response({ revoked: true });
        }
        if (path.startsWith('emergency/') && req.method === 'GET') {
            const share = await q('SELECT * FROM emergency_shares WHERE token_hash=?', await digest(path.split('/')[1])).first() as any;
            if (!share || share.revoked_at || share.expires_at < now)
                fail(404, 'Diese Freigabe ist abgelaufen oder wurde widerrufen.');
            const patient = await q('SELECT * FROM recipients WHERE id=?', share.recipient_id).first() as any;
            const info = parse(patient.info);
            const meds = (await q("SELECT payload FROM records WHERE recipient_id=? AND kind='medication' AND visibility='shared' AND deleted=0", patient.id).all()).results.map((r: any) => parse(r.payload)).filter(m => m.active !== false).map(m => ({ title: m.title, strength: m.strength, amount: m.amount, unit: m.unit, times: m.times }));
            await audit('emergency.accessed', share.id, patient.circle_id);
            return response({ name: patient.name, birthDate: info.birthDate || null, allergies: info.allergies || 'Nicht erfasst', phone: info.phone || null, medications: meds, generatedAt: now, expiresAt: share.expires_at });
        }
        if (path === 'export' && req.method === 'GET') {
            const state = await bootstrap();
            const rid = new URL(req.url).searchParams.get('recipientId');
            await caseAccess(rid || '', 'health');
            return response({ ...state, recipients: state.recipients.filter(r=>r.id===rid), circles: state.circles.filter(c=>state.recipients.some(r=>r.id===rid&&r.circleId===c.id)), records: state.records.filter(e => e.recipientId === rid && e.visibility !== 'private'), doses: state.doses.filter(d => d.recipientId === rid&&state.records.some(e=>e.id===d.medicationId&&e.visibility==='shared')), files: state.files.filter(f => f.recipientId === rid), notifications: [], invitations: [], members: [], profile: null });
        }
        if (path === 'account/erase' && req.method === 'POST') {
            const b = await body();
            if (b.confirm !== 'MEIN KONTO LÖSCHEN')
                fail(400, 'Bitte die Löschung ausdrücklich bestätigen.');
            const owned = (await q("SELECT circle_id FROM members WHERE user_id=? AND role='owner' AND active=1", user).all()).results as any[];
            if (owned.length)
                fail(409, 'Du verwaltest noch einen Pflegekreis. Übertrage oder lösche ihn vor einer Kontolöschung.');
            await db.batch([q("UPDATE records SET deleted=1,payload='{}' WHERE owner_id=? AND visibility='private'", user), q('UPDATE members SET active=0 WHERE user_id=?', user), q('DELETE FROM notifications WHERE user_id=?', user), q('DELETE FROM accounts WHERE id=?', user)]);
            return response({ erased: true });
        }
        return response({ error: 'Diese Aktion wurde nicht gefunden.' }, 404);
    }
    catch (error) {
        if (error instanceof ApiError)
            return response({ error: error.message }, error.status);
        console.error('NOVALIS request failed', error instanceof Error ? error.name : 'unknown');
        return response({ error: 'Die Aktion konnte nicht gespeichert werden. Bitte erneut versuchen.' }, 500);
    }
}
