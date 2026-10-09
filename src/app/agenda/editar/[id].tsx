import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useRemote } from '../../../hooks/useRemote';
import { AgendaEditor } from '../../../components/agenda/AgendaEditor';
import { agendaId, type AgendaItem } from '../../../domain/agenda';
import { Button, ErrorState, Label, Page } from '../../../components/ui';
export default function EditAgenda() {
  const { id } = useLocalSearchParams(); const remote = useRemote<AgendaItem>(agendaId(id) ? '/agenda/' + id : null, true);
  if (!agendaId(id)) return <Page><Label>Identificador inválido.</Label><Button title="Voltar à agenda" onPress={() => router.replace('/agenda')} /></Page>;
  if (remote.error) return <Page><ErrorState message={remote.error} onRetry={remote.reload} /><Button title="Voltar à agenda" onPress={() => router.replace('/agenda')} /></Page>;
  if (!remote.data || remote.data.id !== id) return <Page><Label>Carregando compromisso…</Label></Page>;
  return <AgendaEditor key={id} item={remote.data} />;
}
