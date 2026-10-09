import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button, Card, Label } from '../ui';
import { dayKey, monthCells, validDate, type AgendaItem } from '../../domain/agenda';
import { useTheme } from '../../theme/ThemeProvider';

export function AgendaCalendar({ items, selected, onSelect }: { items: AgendaItem[]; selected: string; onSelect: (day: string) => void }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12));
  const { theme } = useTheme();
  const counts = new Map<string, number>();
  for (const item of items) { const d = validDate(item.dataHora); if (d) counts.set(dayKey(d), (counts.get(dayKey(d)) || 0) + 1); }
  const move = (delta: number) => { setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1, 12)); onSelect(''); };
  return <Card>
    <Label variant="subtitle">{month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</Label>
    <View className="flex-row justify-between gap-2"><Button title="Anterior" secondary onPress={() => move(-1)} /><Button title="Próximo" secondary onPress={() => move(1)} /></View>
    <View className="flex-row">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <View key={day} style={{ width: '14.2857%', alignItems: 'center' }}><Label variant="small">{day}</Label></View>)}</View>
    <View className="flex-row flex-wrap">{monthCells(month.getFullYear(), month.getMonth()).map((d, i) => {
      if (!d) return <View key={i} style={{ width: '14.2857%', minHeight: 52 }} />;
      const key = dayKey(d); const count = counts.get(key) || 0; const active = selected === key;
      return <Pressable key={i} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={`${d.toLocaleDateString('pt-BR')}, ${count} compromisso(s)`} onPress={() => onSelect(active ? '' : key)} style={{ width: '14.2857%', minHeight: 52, alignItems: 'center', justifyContent: 'center', borderWidth: active ? 2 : 0, borderRadius: 8, borderColor: theme.corPrimaria }}><Label>{d.getDate()}</Label><Label variant="small">{count ? String(count) : ' '}</Label></Pressable>;
    })}</View>
    <Label variant="small">Os números abaixo dos dias contam os resultados dos filtros atuais. Toque em um dia para filtrar a lista.</Label>
    <Button title="Hoje" secondary onPress={() => { const today = new Date(); setMonth(new Date(today.getFullYear(), today.getMonth(), 1, 12)); onSelect(dayKey(today)); }} />
    {selected !== '' && <Button title="Mostrar todas as datas" secondary onPress={() => onSelect('')} />}
  </Card>;
}
