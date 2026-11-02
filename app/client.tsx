'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { X, Loader2 } from 'lucide-react';
import { demoState, demoRecord } from '../lib/demo';
import { seriesOccurrences, futureSeriesPayload, defaults, validate, validateTransition, uid, type State, type Entry, type Kind } from '../lib/domain';
interface AppContext {
    state: State;
    loading: boolean;
    demo: boolean;
    online: boolean;
    busy: boolean;
    error: string;
    toast: (s: string) => void;
    mutate: (path: string, data?: any, method?: string) => Promise<any>;
    refresh: () => Promise<void>;
    startDemo: (setup?: boolean) => void;
    leaveDemo: () => void;
}
const empty: State = { profile: null, circles: [], recipients: [], members: [], records: [], doses: [], files: [], notifications: [], invitations: [], now: new Date().toISOString() };
const Context = createContext<AppContext>(null!);
export const useApp = () => useContext(Context);
export function Provider({ children }: {
    children: ReactNode;
}) {
    const [state, setStateRaw] = useState<State>(empty), [loading, setLoading] = useState(true), [demo, setDemo] = useState(false), [online, setOnline] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
    const demoRef = useRef(false);
    const stateRef = useRef<State>(empty);
    const setState = (s: State) => { stateRef.current = s; setStateRaw(s); };
    const toast = useCallback((s: string) => { setMessage(s); setTimeout(() => setMessage(''), 5500); }, []);
    const refresh = useCallback(async () => { if (demoRef.current)
        return; try {
        const res = await fetch('/api/bootstrap', { cache: 'no-store' });
        if (res.status === 401) {
            setState(empty);
            return;
        }
        const data: any = await res.json();
        if (!res.ok)
            throw new Error(data.error);
        setState(data);
        setError('');
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Keine Verbindung.');
    }
    finally {
        setLoading(false);
    } }, []);
    useEffect(() => { let saved; try {
        saved = sessionStorage.getItem('novalis-demo-session');
    }
    catch { } if (saved) {
        try {
            const s = JSON.parse(saved);
            setState(s);
            setDemo(true);
            demoRef.current = true;
            setLoading(false);
        }
        catch {
            void refresh();
        }
    }
    else
        void refresh(); const update = () => setOnline(navigator.onLine); update(); window.addEventListener('online', update); window.addEventListener('offline', update); const timer = setInterval(() => { if (document.visibilityState === 'visible')
        void refresh(); }, 30000); return () => { clearInterval(timer); window.removeEventListener('online', update); window.removeEventListener('offline', update); }; }, [refresh]);
    useEffect(() => { if (demo)
        try {
            sessionStorage.setItem('novalis-demo-session', JSON.stringify(state));
        }
        catch {
            toast('Die Demo kann in diesem Browser nicht zwischengespeichert werden.');
        } }, [state, demo, toast]);
    useEffect(()=>{if('serviceWorker' in navigator && location.protocol==='https:'){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{});}},[]);
    const startDemo = (setup = false) => { demoRef.current = true; setDemo(true); const next = demoState(); if (setup) {
        next.profile!.onboarding = 0;
        next.recipients = [];
        next.records = [];
        next.doses = [];
        next.notifications = [];
        next.files = [];
        next.invitations = [];
        next.circles = [];
        next.members = [];
    } setState(next); setLoading(false); setError(''); };
    const leaveDemo = () => { try {
        sessionStorage.removeItem('novalis-demo-session');
    }
    catch { } demoRef.current = false; setDemo(false); setLoading(true); void refresh(); };
    const mutate = async (path: string, data: any = {}, method = 'POST') => {
        if (busy)
            throw new Error('Bitte warte, bis die laufende Aktion beendet ist.');
        setBusy(true);
        try {
            if (!demoRef.current) {
                if (!navigator.onLine)
                    throw new Error('Du bist offline. Deine Eingaben bleiben im Formular.');
                const isForm = data instanceof FormData;
                const res = await fetch('/api/' + path, { method, headers: isForm ? {} : { 'content-type': 'application/json' }, body: method === 'GET' ? undefined : isForm ? data : JSON.stringify(data) });
                const result: any = await res.json();
                if (!res.ok)
                    throw new Error(result.error || 'Speichern fehlgeschlagen.');
                if (result.state)
                    setState(result.state);
                else if (result.profile)
                    setState(result);
                return result;
            }
            const s = structuredClone(stateRef.current);
            let extra: any = {};
            if (path === 'profile') {
                s.profile = { ...s.profile!, name: data.name || s.profile!.name, onboarding: data.onboarding === undefined ? s.profile!.onboarding : Number(!!data.onboarding), preferences: { ...defaults, ...s.profile!.preferences, ...data.preferences } };
            }
            else if (path === 'records') {
                validate(data.kind, data.payload);
                validateTransition(data.kind, {}, data.payload, s.profile!.id);
                const e = demoRecord(data.kind, data.payload, data.recipientId, s);
                s.records.unshift(...seriesOccurrences(e,data.recurrence));
                extra.id = e.id;
            }
            else if (path.startsWith('records/')) {
                const i = s.records.findIndex(r => r.id === path.split('/')[1]);
                if (i < 0)
                    throw new Error('Eintrag nicht gefunden.');
                const e = s.records[i];
                if (e.version !== data.version)
                    throw new Error('Der Eintrag wurde inzwischen geändert.');
                if (method === 'DELETE')
                    s.records.splice(i, 1);
                else {
                    const next = { ...e.payload, ...data.payload };
                    validate(e.kind, next);
                    validateTransition(e.kind, e.payload, next, s.profile!.id);
                    e.payload = next;
                    e.version++;
                    e.updatedAt = new Date().toISOString();
                }
            }
            else if (path === 'doses') {
                if (!data.correctionOf && s.doses.some(d => d.medicationId === data.medicationId && d.scheduledAt === data.scheduledAt && !d.correctionOf))
                    throw new Error('Diese Gabe wurde bereits dokumentiert.');
                if (data.correctionOf && !data.reason?.trim())
                    throw new Error('Bitte einen Korrekturgrund eingeben.');
                const m = s.records.find(r => r.id === data.medicationId)!;
                s.doses.push({ id: uid(), ...data, circleId: m.circleId, recipientId: m.recipientId, byUser: s.profile!.id, at: new Date().toISOString() });
            }
            else if (path === 'recipients') {
                const circle = data.circleId || uid();
                if (!data.circleId) {
                    s.circles.push({ id: circle, name: data.circleName || 'Unser Pflegekreis' });
                    s.members.push({id:uid(),circleId:circle,userId:s.profile!.id,name:s.profile!.name,role:'owner',permissions:['plan','plan:write','health','health:write','documents','documents:write','manage'],recipientIds:[],active:1});
                }
                const id = uid();
                s.recipients.push({ id, circleId: circle, name: data.name, info: data.info || {} });
                extra.id = id;
            }
            else if (path.startsWith('recipients/')) {
                const r = s.recipients.find(r => r.id === path.split('/')[1])!;
                r.name = data.name;
                r.info = data.info;
            }
            else if (path === 'notifications/read') {
                s.notifications.forEach(n => { if (!data.id || n.id === data.id)
                    n.readAt = new Date().toISOString(); });
            }
            else if (path === 'followup/snooze') {
                s.notifications = s.notifications.filter(n => n.refId !== data.appointmentId);
                toast('Demo: Wiedervorlage vorgemerkt. Hintergrundzustellung wird nur im verbundenen Betrieb ausgeführt.');
            }
            else if (path === 'weekly') {
                s.records.push(demoRecord('weekly', { week: data.week, answered: true }, data.recipientId, s));
            }
            else if (path === 'invitations') {
                extra.token = 'DEMO-' + uid();
                s.invitations.push({ id: uid(), circleId: data.circleId, role: data.role, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() });
                toast('Demo-Einladung: funktioniert nur als Vorschau.');
            }
            else if (path.startsWith('invitations/') && method === 'DELETE') {
                const i = s.invitations.find(i => i.id === path.split('/')[1]);
                if (i)
                    i.revokedAt = new Date().toISOString();
            }
            else if (path.startsWith('members/') && method === 'DELETE')
                s.members = s.members.filter(m => m.id !== path.split('/')[1]);
            else if (path === 'files') {
                const f = data.get('file') as File;
                if (!f || f.size > 10 * 1024 * 1024)
                    throw new Error('Bitte eine Datei bis 10 MB auswählen.');
                if (!['application/pdf', 'image/png', 'image/jpeg'].includes(f.type))
                    throw new Error('Erlaubt sind PDF, PNG und JPEG.');
                const id = uid();
                (window as any).__novalisDemoFiles ??= {};
                (window as any).__novalisDemoFiles[id] = f;
                s.files.unshift({ id, recipientId: data.get('recipientId'), recordId: data.get('recordId') || null, name: f.name, mime: f.type, size: f.size, status: 'demo-session', createdAt: new Date().toISOString() });
            }
            else
                throw new Error('Diese Aktion benötigt eine verbundene Anmeldung.');
            s.now = new Date().toISOString();
            setState(s);
            return { ...extra, state: s };
        }
        catch (e) {
            toast(e instanceof Error ? e.message : 'Die Aktion ist fehlgeschlagen.');
            throw e;
        }
        finally {
            setBusy(false);
        }
    };
    return <Context.Provider value={{ state, loading, demo, online, busy, error, toast, mutate, refresh, startDemo, leaveDemo }}>{children}{message && <div className="toast" role="status">{message}</div>}</Context.Provider>;
}
export function Modal({ title, children, onClose, wide = false }: {
    title: string;
    children: ReactNode;
    onClose: () => void;
    wide?: boolean;
}) { const ref = useRef<HTMLDialogElement>(null), headingId=React.useId(), [dirty, setDirty] = useState(false); const close = () => { if (dirty && !window.confirm('Du hast ungespeicherte Eingaben. Trotzdem schließen?'))
    return; onClose(); }; useEffect(() => { const active = document.activeElement; const d = ref.current; d?.showModal(); return () => { d?.close(); if (active instanceof HTMLElement && active.isConnected)
    active.focus(); }; }, []); return <dialog ref={ref} aria-modal="true" aria-labelledby={headingId} className={'dialog ' + (wide ? 'wide' : '')} onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === ref.current)
    close(); }}><div className="dialog-inner" onInput={() => setDirty(true)}><header><div><span className="eyebrow">NOVALIS</span><h2 id={headingId}>{title}</h2></div><button className="icon-button" aria-label="Schließen" onClick={close}><X size={22}/></button></header>{children}</div></dialog>; }
export function Submit({ children = 'Speichern' }: {
    children?: ReactNode;
}) { const { busy } = useApp(); return <button className="button primary" type="submit" disabled={busy}>{busy ? <Loader2 className="spin" size={18}/> : null}{children}</button>; }
export function downloadFile(name: string, body: Blob | string, mime = 'application/json') { const blob = body instanceof Blob ? body : new Blob([body], { type: mime }); const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 30000); }
