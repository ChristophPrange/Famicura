export type Kind = 'task' | 'appointment' | 'followup' | 'observation' | 'medication' | 'availability' | 'weekly' | 'absence' | 'program' | 'check' | 'message' | 'emergency' | 'refill';
export type Payload = Record<string, any>;
export interface Entry {
    id: string;
    circleId: string;
    recipientId: string;
    kind: Kind;
    ownerId: string;
    visibility: 'shared' | 'private';
    payload: Payload;
    version: number;
    createdAt: string;
    updatedAt: string;
}
export interface Recipient {
    id: string;
    circleId: string;
    name: string;
    info: Payload;
}
export interface Member {
    id: string;
    circleId: string;
    userId: string;
    name: string;
    role: string;
    permissions: string[];
    recipientIds: string[];
    active: number;
}
export interface Profile {
    id: string;
    email: string;
    name: string;
    preferences: Payload;
    onboarding: number;
}
export interface State {
    profile: Profile | null;
    circles: {
        id: string;
        name: string;
    }[];
    recipients: Recipient[];
    members: Member[];
    records: Entry[];
    doses: any[];
    notifications: any[];
    files: any[];
    invitations: any[];
    now: string;
    mode?: string;
}
export const defaults = { font: 'normal', contrast: false, simple: false, reduceMotion: false, weeklyReminders: true, appointmentReminders: true, role: 'carer', startPage: 'today', weeklyDay: 4 };
export const uid = () => { if (typeof crypto.randomUUID === 'function')
    return crypto.randomUUID(); const bytes = crypto.getRandomValues(new Uint8Array(16)); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128; const h = [...bytes].map(b => b.toString(16).padStart(2, '0')).join(''); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`; };
export const localDay = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
export const dateAdd = (day: string, n: number) => { const d = new Date(day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const monday = (day = localDay()) => { const d = new Date(day + 'T12:00:00Z'); return dateAdd(day, -((d.getUTCDay() + 6) % 7)); };
export const formatDate = (s: string, long = false) => new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: long ? 'long' : 'short', day: 'numeric', month: long ? 'long' : 'short' }).format(new Date(s.length === 10 ? s + 'T12:00:00Z' : s));
export const formatTime = (s: string) => s ? new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }).format(new Date(s)) : '';
export function zonedISO(day: string, time: string): string { if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    throw new Error('Datum oder Uhrzeit ist ungültig.'); const wall = new Date(day + 'T' + time + ':00Z'); if (wall.toISOString().slice(0, 10) !== day)
    throw new Error('Dieses Datum gibt es nicht.'); let utc = wall.getTime(); for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(utc));
    utc += wall.getTime() - new Date(parts.replace(' ', 'T') + ':00Z').getTime();
} const result = new Date(utc).toISOString(); const chk = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(result)); if (chk !== day + ' ' + time)
    throw new Error('Diese Uhrzeit existiert wegen der Zeitumstellung nicht.'); return result; }
export function overlaps(a: string, b: string, c: string, d: string) { return Date.parse(a) < Date.parse(d) && Date.parse(c) < Date.parse(b); }
export function unionMinutes(windows: {
    start: string;
    end: string;
}[]) { const list = windows.map(w => [Date.parse(w.start), Date.parse(w.end)]).filter(([a, b]) => Number.isFinite(a) && b > a).sort((a, b) => a[0] - b[0]); let total = 0, start = 0, end = 0; for (const [a, b] of list) {
    if (a > end) {
        total += end - start;
        start = a;
        end = b;
    }
    else
        end = Math.max(end, b);
} return Math.round((total + end - start) / 60000); }
export const requiredPermission = (kind: Kind) => ['medication', 'observation', 'appointment', 'followup', 'emergency', 'refill'].includes(kind) ? 'health' : kind === 'check' ? 'private' : 'plan';
export function canRead(member: Member | undefined, entry: Entry, user: string) { if (!member?.active || member.recipientIds.length && !member.recipientIds.includes(entry.recipientId))
    return false; if (entry.visibility === 'private' || entry.kind === 'check')
    return entry.ownerId === user && (requiredPermission(entry.kind)==='private'||member.permissions.includes(requiredPermission(entry.kind))); return member.permissions.includes(requiredPermission(entry.kind)); }
export function canWrite(member: Member | undefined, entry: Entry, user: string) { if (!canRead(member, entry, user))
    return false; if (entry.visibility === 'private')
    return entry.ownerId === user && (['check','program','availability','absence','weekly'].includes(entry.kind)||member!.permissions.includes(requiredPermission(entry.kind)+':write')||member!.permissions.includes('manage')); if (['availability', 'weekly', 'absence', 'program'].includes(entry.kind))
    return entry.ownerId === user; return member!.permissions.includes('manage') || member!.permissions.includes(requiredPermission(entry.kind) + ':write') || entry.kind === 'task' && member!.permissions.includes('plan:write'); }
export function validate(kind: Kind, p: Payload) { if (['task', 'appointment', 'medication', 'program', 'refill'].includes(kind) && (!p.title || String(p.title).trim().length > 200))
    throw new Error('Bitte einen Titel mit höchstens 200 Zeichen eingeben.'); if (p.text && String(p.text).length > 12000)
    throw new Error('Der Text ist zu lang.'); if (p.start && Number.isNaN(Date.parse(p.start)))
    throw new Error('Ungültiger Beginn.'); if(p.date&&(!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||dateAdd(p.date,0)!==p.date))throw new Error('Ungültiges Datum.'); if (p.end && (Number.isNaN(Date.parse(p.end))||!p.start || Date.parse(p.end) <= Date.parse(p.start)))
    throw new Error('Das Ende muss nach dem Beginn liegen.'); if(['observation','message'].includes(kind)&&!String(p.text||'').trim())throw new Error('Bitte einen Text eingeben.'); if (['task','appointment'].includes(kind) && !p.start && !p.date)
    throw new Error('Bitte ein Datum eingeben.'); if (kind === 'availability' && (!p.start || !p.end))
    throw new Error('Bitte Beginn und Ende der Verfügbarkeit angeben.'); if (kind === 'medication') {
    if (!['Tablette', 'ml', 'Tropfen', 'Hub', 'Stück'].includes(p.unit))
        throw new Error('Bitte eine gültige Einheit auswählen.');
    if (!Number.isFinite(Number(p.amount)) || Number(p.amount) <= 0)
        throw new Error('Bitte die verordnete Menge eingeben.');
    if (p.stock !== null && p.stock !== '' && (!Number.isFinite(Number(p.stock)) || Number(p.stock) < 0))
        throw new Error('Der Bestand darf nicht negativ sein.');
    if (!Array.isArray(p.times) || p.times.some((t: string) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(t)))
        throw new Error('Bitte gültige Einnahmezeiten eintragen.');
} return p; }
export function nextFollowupAt(p: Payload) { if (p.status === 'cancelled' || !p.companion || !p.companionAccepted)
    return null; const end = p.actualEnd || p.end; return end ? new Date(Date.parse(end) + (p.actualEnd ? 0 : 15 * 60000)).toISOString() : null; }
export function validateTransition(kind: Kind, old: Payload, next: Payload, user: string) { if (kind === 'task' && next.status === 'done' && next.status !== old.status && (old.status!=='accepted'||old.assignee!==user||next.assignee!==user))
    throw new Error('Nur die verantwortliche Person kann diese Aufgabe abschließen.'); if (kind === 'task' && next.status === 'accepted' && (old.status !== 'accepted' || old.assignee !== next.assignee) && next.assignee !== user)
    throw new Error('Eine Zusage kann nur die betreffende Person geben.'); if (kind === 'appointment' && next.companionAccepted && (!old.companionAccepted || old.companion !== next.companion) && next.companion !== user)
    throw new Error('Die Begleitung muss selbst zusagen.'); }
export function availableFor(records: Entry[], user: string, start: string, end: string, exclude?: string) { const own = records.filter(r => r.ownerId === user); const windows = own.filter(r => r.kind === 'availability' && r.payload.status === 'available'); const absent = own.some(r => r.kind === 'absence' && overlaps(start, end, r.payload.start, r.payload.end)); const busy = records.some(r => r.id !== exclude && ((r.kind === 'task' && r.payload.assignee === user && r.payload.status === 'accepted') || (r.kind === 'appointment' && r.payload.companion === user && r.payload.companionAccepted)) && r.payload.start && r.payload.end && overlaps(start, end, r.payload.start, r.payload.end)); return !absent && !busy && windows.some(r => r.payload.start <= start && r.payload.end >= end); }
export function medicationRemaining(m: Entry, doses: any[]) { const stock = m.payload.stock; if (stock === null || stock === '' || stock === undefined || m.payload.asNeeded)
    return null; const spent = doses.filter(d => d.medicationId === m.id && !d.correctionOf && (!m.payload.stockBaselineAt || d.at >= m.payload.stockBaselineAt)).reduce((n, d) => { const latest = doses.filter(x => x.id === d.id || x.correctionOf === d.id).sort((a, b) => a.at.localeCompare(b.at)).at(-1); return n + (['taken', 'given'].includes(latest?.status) ? Number(latest?.amount ?? d.amount ?? m.payload.amount) : 0); }, 0); return Math.max(0, Number(stock) - spent); }
export function fhirBundle(s: State, recipientId: string) { const patient = s.recipients.find(p => p.id === recipientId); if (!patient)
    throw new Error('Pflegeprofil nicht gefunden.'); const ref = 'Patient/' + patient.id; return { resourceType: 'Bundle', type: 'collection', timestamp: new Date().toISOString(), entry: [{ resource: { resourceType: 'Patient', id: patient.id, name: [{ text: patient.name }] } }, ...s.records.filter(r => r.recipientId === recipientId && r.visibility !== 'private' && ['medication', 'observation'].includes(r.kind)).map(r => ({ resource: r.kind === 'medication' ? { resourceType: 'MedicationStatement', id: r.id, status: r.payload.active === false ? 'stopped' : 'active', subject: { reference: ref }, medicationCodeableConcept: { text: r.payload.title }, note: [{ text: [r.payload.strength, r.payload.amount, r.payload.unit, (r.payload.times || []).join(', ')].join(' ') }] } : { resourceType: 'Observation', id: r.id, status: 'final', subject: { reference: ref }, code: { text: r.payload.category || 'Pflegebeobachtung' }, effectiveDateTime: r.payload.at || r.createdAt, valueString: r.payload.text || '' } }))] }; }

/** Materialized finite series: every occurrence keeps its own identity and history. */
export function seriesOccurrences(e: Entry, repeat: string | undefined): Entry[] {
    if (!repeat || repeat === 'none') return [e];
    if (!['task','availability'].includes(e.kind) || !['daily7','weekly4'].includes(repeat)) throw new Error('Diese Wiederholung wird nicht unterstützt.');
    const count = repeat === 'daily7' ? 7 : 4, step = repeat === 'daily7' ? 1 : 7;
    const first = e.payload.date || (e.payload.start && localDay(new Date(e.payload.start)));
    if (!first) throw new Error('Für Wiederholungen ist ein Datum erforderlich.');
    const seriesId = uid();
    return Array.from({length:count}, (_,i) => {
        const date = dateAdd(first,i*step), payload: Payload = {...e.payload,date,seriesId,repeat};
        if(e.payload.start) payload.start=zonedISO(date,formatTime(e.payload.start));
        if(e.payload.end) payload.end=zonedISO(dateAdd(date,Math.round((Date.parse(localDay(new Date(e.payload.end))+'T12:00Z')-Date.parse(first+'T12:00Z'))/86400000)),formatTime(e.payload.end));
        return {...e,id:i===0?e.id:uid(),payload};
    });
}
export function futureSeriesPayload(original: Payload, edited: Payload): Payload {
    const result = {...original};
    for (const k of ['title','text','note','category','duration','status','capacity']) if (k in edited) result[k]=edited[k];
    return result;
}
