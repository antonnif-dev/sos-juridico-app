import type { Role } from './types';

export type AgendaItem = {
  id: string; titulo: string; dataHora: string | null; tipo: string;
  processoId: string | null; processoTitulo: string; numeroProcesso: string;
  clientId: string | null; clienteNome: string; responsavelUid: string;
  assignedUserIds: string[]; createdByUid: string; concluido: boolean;
  createdAt: string | null; updatedAt: string | null;
};
export type AgendaForm = { titulo: string; date: string; time: string; tipo: string; processoId: string };
export const agendaTypes = ['Prazo', 'Audiência', 'Reunião', 'Outro'];
export const canUseAgenda = (role: Role | null) => !!role && ['administrador', 'advogado', 'secretaria'].includes(role);
export const canLinkProcess = (role: Role | null) => role === 'administrador' || role === 'advogado';
export const agendaId = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
const pad = (n: number) => String(n).padStart(2, '0');
export function dayKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
export function inputDate(d: Date) { return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; }
export function validDate(value: string | null) { const d = value ? new Date(value) : null; return d && Number.isFinite(d.getTime()) ? d : null; }
export function agendaForm(item?: AgendaItem, selectedDay?: string, processId?: string): AgendaForm {
  const d = validDate(item?.dataHora || null);
  const candidate = selectedDay && /^\d{4}-\d{2}-\d{2}$/.test(selectedDay) ? validDate(selectedDay + 'T12:00:00') : null;
  const selected = candidate && dayKey(candidate) === selectedDay ? candidate : new Date();
  return { titulo: item?.titulo || '', date: inputDate(d || selected), time: d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : '09:00', tipo: item?.tipo || 'Reunião', processoId: item?.processoId || (agendaId(processId) ? processId : '') };
}
export function localToIso(date: string, time: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date.trim());
  const hours = /^(\d{2}):(\d{2})$/.exec(time.trim());
  if (!match || !hours) throw new Error('Use data DD/MM/AAAA e horário HH:MM.');
  const [, ds, ms, ys] = match; const [, hs, mins] = hours;
  const [day, month, year, hour, minute] = [ds, ms, ys, hs, mins].map(Number);
  const result = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (year < 2000 || year > 2100 || result.getFullYear() !== year || result.getMonth() !== month - 1 || result.getDate() !== day || result.getHours() !== hour || result.getMinutes() !== minute || result.getUTCFullYear() < 2000 || result.getUTCFullYear() > 2100) {
    throw new Error('Data ou horário inválido. Confira o calendário e o fuso do aparelho (anos 2000 a 2100).');
  }
  // A repeated local clock time can refer to two instants during a DST fallback.
  for (let delta = 15; delta <= 180; delta += 15) {
    const other = new Date(result.getTime() + delta * 60000);
    if (dayKey(other) === dayKey(result) && other.getHours() === hour && other.getMinutes() === minute) throw new Error('Este horário ocorre duas vezes na mudança de fuso. Escolha um horário fora dessa transição.');
  }
  return result.toISOString();
}
export function agendaPayload(form: AgendaForm, original?: AgendaItem, role: Role | null = null) {
  if (!canUseAgenda(role)) throw new Error('Seu perfil não pode gerenciar a agenda.');
  const titulo = form.titulo.normalize('NFKC').trim().replace(/\s+/g, ' ');
  if (titulo.length < 2 || titulo.length > 160) throw new Error('O título deve ter entre 2 e 160 caracteres.');
  if (!agendaTypes.includes(form.tipo)) throw new Error('Selecione um tipo válido.');
  const processoId = form.processoId || null;
  if (processoId && !agendaId(processoId)) throw new Error('Selecione um processo válido.');
  if (!canLinkProcess(role) && processoId && processoId !== original?.processoId) throw new Error('Seu perfil não pode vincular um processo.');
  const before = original ? agendaForm(original) : null;
  const unchangedTime = !!before && before.date === form.date && before.time === form.time;
  const dataHora = unchangedTime ? original!.dataHora : localToIso(form.date, form.time);
  const body: Record<string, unknown> = { titulo, dataHora, tipo: form.tipo, processoId };
  if (original) for (const key of Object.keys(body) as (keyof AgendaItem)[]) if (body[key] === original[key]) delete body[key];
  return body;
}
export type AgendaFilters = { query: string; type: string; status: string; day: string };
const normalized = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function filterAgenda(items: AgendaItem[], filters: AgendaFilters, now = Date.now()) {
  return items.filter(item => {
    const date = validDate(item.dataHora);
    return date && (!filters.day || dayKey(date) === filters.day) && (filters.type === 'Todos' || item.tipo === filters.type) &&
      (filters.status === 'Todos' || (filters.status === 'Concluídos' ? item.concluido : !item.concluido && (filters.status !== 'Atrasados' || date.getTime() < now))) &&
      normalized([item.titulo, item.processoTitulo, item.numeroProcesso, item.clienteNome].join(' ')).includes(normalized(filters.query));
  }).sort((a, b) => Date.parse(a.dataHora!) - Date.parse(b.dataHora!));
}
export function monthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1, 12); const count = new Date(year, month + 1, 0, 12).getDate();
  return Array.from({ length: 42 }, (_, i) => { const day = i - first.getDay() + 1; return day < 1 || day > count ? null : new Date(year, month, day, 12); });
}
export function agendaDateText(value: string | null) { const d = validDate(value); return d ? d.toLocaleString('pt-BR') : 'Data não informada'; }
export function deviceTimezone() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'fuso local do aparelho'; } catch { return 'fuso local do aparelho'; } }
