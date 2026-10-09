import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '../../auth/SessionProvider';
import { useRemote } from '../../hooks/useRemote';
import { useDraftExit } from '../../hooks/useDraftExit';
import { api, errorMessage } from '../../services/api';
import { ApiError } from '../../services/api-core';
import { agendaForm, agendaId, agendaPayload, agendaTypes, canLinkProcess, deviceTimezone, type AgendaItem, type AgendaForm } from '../../domain/agenda';
import type { CaseRecord } from '../../domain/cases';
import { SearchSelect } from '../cases/SearchSelect';
import { Button, Card, Choice, ErrorState, Field, Label, Message, Page } from '../ui';

export function AgendaEditor({ item, day, processId, initialType }: { item?: AgendaItem; day?: string; processId?: string; initialType?: string }) {
  const { profile } = useSession(); const role = profile?.role || null;
  const [baseline] = useState(item); const [initial] = useState(() => ({...agendaForm(item, day, canLinkProcess(role) ? processId : undefined),...(!item&&initialType&&agendaTypes.includes(initialType)?{tipo:initialType}:{})}));
  const [form, setForm] = useState(initial); const [zone] = useState(deviceTimezone);
  const [busy, setBusy] = useState(false); const lock = useRef(false); const alive = useRef(true);
  const [message, setMessage] = useState(''); const [errors, setErrors] = useState<Record<string, string>>({});
  const canLink = canLinkProcess(role); const cases = useRemote<CaseRecord[]>(canLink ? '/processo' : null);
  const leave = useDraftExit(JSON.stringify(form) !== JSON.stringify(initial), busy);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const change = (key: keyof AgendaForm, value: string) => { setForm(old => ({ ...old, [key]: value })); setErrors({}); setMessage(''); };
  const back = () => baseline ? router.replace({ pathname: '/agenda/[id]', params: { id: baseline.id } }) : router.replace('/agenda');
  const hearing = form.tipo === 'Audiência' && !!form.processoId && canLink;
  async function save() {
    if (lock.current) return; lock.current = true; setBusy(true); setMessage(''); setErrors({});
    try {
      if (deviceTimezone() !== zone) throw new Error('O fuso do aparelho mudou durante a edição. Volte e reabra o formulário para conferir o horário.');
      const body = agendaPayload(form, baseline, role);
      if (!Object.keys(body).length) { setMessage('Nenhuma alteração para salvar.'); return; }
      const saved = await api<AgendaItem>(baseline ? '/agenda/' + baseline.id : '/agenda', { method: baseline ? 'PUT' : 'POST', body });
      if (!alive.current) return;
      if (agendaId(saved?.id)) router.replace({ pathname: '/agenda/[id]', params: { id: saved.id } }); else router.replace('/agenda');
    } catch (error) {
      if (!alive.current) return;
      if (error instanceof ApiError) setErrors(error.fields);
      setMessage(errorMessage(error) + (error instanceof ApiError && (error.status === 0 || error.status >= 500) ? ' Confira a agenda antes de reenviar: a operação pode ter sido concluída.' : ''));
    } finally { lock.current = false; if (alive.current) setBusy(false); }
  }
  function requestSave() {
    if (lock.current) return;
    if (hearing) Alert.alert('Salvar audiência vinculada?', 'O servidor poderá atualizar o processo para “Aguardando Audiência”, caso ele não esteja encerrado, arquivado ou concluído.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Salvar', onPress: () => void save() }]);
    else void save();
  }
  return <Page onNavigate={leave} disabled={busy}>
    <Label variant="title">{baseline ? 'Editar compromisso' : 'Novo compromisso'}</Label>
    <Card><Field label="Título *" value={form.titulo} editable={!busy} maxLength={160} error={errors.titulo} onChangeText={v => change('titulo', v)} />
      <Choice label="Tipo *" value={form.tipo} options={agendaTypes} disabled={busy} onChange={v => change('tipo', v)} />
      <Field label="Data (DD/MM/AAAA) *" placeholder="08/10/2026" value={form.date} maxLength={10} keyboardType="numbers-and-punctuation" editable={!busy} error={errors.dataHora} onChangeText={v => change('date', v)} />
      <Field label="Horário (HH:MM, 24 horas) *" placeholder="09:00" value={form.time} maxLength={5} keyboardType="numbers-and-punctuation" editable={!busy} onChangeText={v => change('time', v)} />
      <Message text={`O horário será interpretado no fuso ${zone} e enviado como um instante à API.`} />
      {form.tipo === 'Prazo' && <Message text="Informe a data e o horário do vencimento. Este cadastro não calcula dias úteis, feriados ou prazos processuais." />}
    </Card>
    <Card><Label variant="subtitle">Processo vinculado</Label>
      <Label>{form.processoId ? (cases.data?.find(c => c.id === form.processoId)?.titulo || (form.processoId === baseline?.processoId ? baseline.processoTitulo : '') || form.processoId) : 'Sem vínculo'}</Label>
      {canLink ? <>{cases.loading ? <Label>Carregando processos…</Label> : cases.error ? <ErrorState message={cases.error} onRetry={cases.reload} /> : <SearchSelect label="Selecionar processo (opcional)" items={(cases.data || []).map(c => ({ id: c.id, label: c.titulo + (c.numeroProcesso ? ' • ' + c.numeroProcesso : '') }))} selected={[form.processoId]} disabled={busy} onSelect={id => change('processoId', id)} />}</> : <Message text="A secretaria pode manter ou remover o vínculo existente. Novos vínculos são feitos por administrador ou advogado." />}
      {!!form.processoId && <Button title="Remover vínculo com processo" secondary disabled={busy} onPress={() => change('processoId', '')} />}
      <Message text={errors.processoId} />
      {hearing && <Message text="Ao salvar, o backend poderá mudar o processo para Aguardando Audiência. Processos arquivados, encerrados ou concluídos preservam o status." />}
    </Card>
    <Message text={message} /><Button title={busy ? 'Salvando…' : 'Salvar compromisso'} disabled={busy} onPress={requestSave} />
    <Button title="Voltar" secondary disabled={busy} onPress={() => leave(back)} />
  </Page>;
}
