import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSession } from '../../auth/SessionProvider';
import { useRemote } from '../../hooks/useRemote';
import { useDraftExit } from '../../hooks/useDraftExit';
import { api, errorMessage } from '../../services/api';
import { agendaDateText, agendaId, canLinkProcess, deviceTimezone, type AgendaItem } from '../../domain/agenda';
import { Button, Card, ErrorState, Label, Message, Page } from '../../components/ui';

function Detail({ item, reload }: { item: AgendaItem; reload: () => void }) {
  const { profile } = useSession(); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const lock = useRef(false); const alive = useRef(true); const leave = useDraftExit(false, busy);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const hearing = item.tipo === 'Audiência' && !!item.processoId && canLinkProcess(profile?.role || null);
  async function mutate(remove: boolean) {
    if (lock.current) return; lock.current = true; setBusy(true); setMessage('');
    try {
      await api('/agenda/' + item.id, { method: remove ? 'DELETE' : 'PUT', ...(remove ? {} : { body: { concluido: !item.concluido } }) });
      if (!alive.current) return;
      if (remove) router.replace('/agenda'); else reload();
    } catch (e) { if (alive.current) setMessage(errorMessage(e) + ' Atualize a agenda antes de repetir a operação.'); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }
  return <Page disabled={busy} onNavigate={leave}>
    <Label variant="title">{item.titulo}</Label><Card><Label>{item.tipo} • {item.concluido ? 'Concluído' : 'Pendente'}</Label><Label>{agendaDateText(item.dataHora)}</Label><Message text={`Fuso: ${deviceTimezone()}.`} />
      {item.processoId ? <><Label>Processo: {item.processoTitulo || 'Vinculado'}</Label><Label>Número: {item.numeroProcesso || 'Não informado'}</Label><Label>Cliente: {item.clienteNome || 'Não informado'}</Label>{canLinkProcess(profile?.role || null) && <Button title="Abrir processo" secondary disabled={busy} onPress={() => router.push({ pathname: '/processos/[id]', params: { id: item.processoId! } })} />}</> : <Label>Sem processo vinculado.</Label>}
      <Label variant="small">Criado: {agendaDateText(item.createdAt)}</Label><Label variant="small">Atualizado: {agendaDateText(item.updatedAt)}</Label>
    </Card>
    <Button title="Editar compromisso" disabled={busy} onPress={() => router.push({ pathname: '/agenda/editar/[id]', params: { id: item.id } })} />
    <Button title={item.concluido ? 'Reabrir compromisso' : 'Marcar como concluído'} disabled={busy} onPress={() => Alert.alert(item.concluido ? 'Reabrir compromisso?' : 'Concluir compromisso?', 'A situação será atualizada também no site.' + (hearing ? ' Pela regra atual do backend, salvar uma audiência vinculada também pode atualizar o processo para Aguardando Audiência, inclusive ao concluir ou reabrir.' : ''), [{ text: 'Cancelar', style: 'cancel' }, { text: 'Confirmar', onPress: () => void mutate(false) }])} />
    <Button title="Excluir compromisso" secondary disabled={busy} onPress={() => Alert.alert('Excluir compromisso?', 'O compromisso será removido da agenda no app e no site.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: () => void mutate(true) }])} />
    <Message text={message} /><Button title="Atualizar compromisso" secondary disabled={busy} onPress={reload} /><Button title="Voltar à agenda" secondary disabled={busy} onPress={() => router.replace('/agenda')} />
  </Page>;
}
export default function AgendaDetail() {
  const { id } = useLocalSearchParams(); const remote = useRemote<AgendaItem>(agendaId(id) ? '/agenda/' + id : null);
  if (!agendaId(id)) return <Page><Label>Identificador inválido.</Label><Button title="Voltar à agenda" onPress={() => router.replace('/agenda')} /></Page>;
  if (remote.loading) return <Page><Label>Carregando compromisso…</Label></Page>;
  if (remote.error) return <Page><ErrorState message={remote.error} onRetry={remote.reload} /><Button title="Voltar à agenda" onPress={() => router.replace('/agenda')} /></Page>;
  if (!remote.data || remote.data.id !== id) return <Page><Label>Compromisso indisponível.</Label><Button title="Voltar à agenda" onPress={() => router.replace('/agenda')} /></Page>;
  return <Detail key={id} item={remote.data} reload={remote.reload} />;
}
