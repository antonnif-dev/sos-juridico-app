import React, { useState } from 'react';
import { router } from 'expo-router';
import { useRemote } from '../../hooks/useRemote';
import { Button, Card, Choice, EmptyState, ErrorState, Field, Label, Message, Page } from '../../components/ui';
import { AgendaCalendar } from '../../components/agenda/AgendaCalendar';
import { agendaDateText, agendaTypes, deviceTimezone, filterAgenda, type AgendaItem, type AgendaFilters } from '../../domain/agenda';

export default function AgendaList() {
  const remote = useRemote<AgendaItem[]>('/agenda');
  const [filters, setFilters] = useState<AgendaFilters>({ query: '', type: 'Todos', status: 'Todos', day: '' });
  const [calendar, setCalendar] = useState(true); const [limit, setLimit] = useState(25);
  const change = (key: keyof AgendaFilters, value: string) => { setFilters(old => ({ ...old, [key]: value })); setLimit(25); };
  const filtered = filterAgenda(remote.data || [], filters);
  return <Page refreshing={remote.loading} onRefresh={remote.reload}>
    <Label variant="title">Agenda e prazos</Label><Message text={`Datas e horários: ${deviceTimezone()}.`} />
    <Button title="Novo compromisso" onPress={() => router.push({ pathname: '/agenda/novo', params: { day: filters.day } })} />
    <Field label="Buscar título, processo ou cliente" value={filters.query} onChangeText={v => change('query', v)} />
    <Choice label="Tipo" value={filters.type} options={['Todos', ...agendaTypes]} onChange={v => change('type', v)} />
    <Choice label="Situação" value={filters.status} options={['Todos', 'Pendentes', 'Concluídos', 'Atrasados']} onChange={v => change('status', v)} />
    <Button title={calendar ? 'Ocultar calendário' : 'Mostrar calendário'} secondary onPress={() => setCalendar(v => !v)} />
    {remote.loading ? <Label>Carregando agenda…</Label> : remote.error ? <ErrorState message={remote.error} onRetry={remote.reload} /> : <>
      {calendar && <AgendaCalendar items={filterAgenda(remote.data || [], { ...filters, day: '' })} selected={filters.day} onSelect={v => change('day', v)} />}
      {filters.day !== '' && <><Label>Dia selecionado: {filters.day.split('-').reverse().join('/')}</Label><Button title="Limpar filtro de dia" secondary onPress={() => change('day', '')} /></>}
      <Message text={`${filtered.length} resultado(s) na lista retornada pela API. Busca, filtros e calendário usam somente esses registros.`} />
      {!filtered.length && <EmptyState title="Nenhum compromisso encontrado" description="Altere os filtros ou cadastre um compromisso." />}
      {filtered.slice(0, limit).map(item => <Card key={item.id}><Label variant="subtitle">{item.titulo}</Label><Label>{agendaDateText(item.dataHora)}</Label><Label>{item.tipo} • {item.concluido ? 'Concluído' : 'Pendente'}</Label>{item.processoId && <Label>{item.processoTitulo || item.numeroProcesso || 'Processo vinculado'}</Label>}<Button title="Abrir compromisso" secondary onPress={() => router.push({ pathname: '/agenda/[id]', params: { id: item.id } })} /></Card>)}
      {filtered.length > limit && <Button title="Mostrar mais" secondary onPress={() => setLimit(n => n + 25)} />}
    </>}
    <Button title="Atualizar agenda" secondary disabled={remote.loading} onPress={remote.reload} />
  </Page>;
}
