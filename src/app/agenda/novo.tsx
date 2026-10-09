import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useSession } from '../../auth/SessionProvider';
import { AgendaEditor } from '../../components/agenda/AgendaEditor';
import { canUseAgenda } from '../../domain/agenda';
import { Page, Label } from '../../components/ui';
export default function NewAgenda() {
  const { profile } = useSession(); const { day, processoId, tipo } = useLocalSearchParams();
  if (!canUseAgenda(profile?.role || null)) return <Page><Label>Acesso não permitido.</Label></Page>;
  return <AgendaEditor initialType={typeof tipo === 'string' ? tipo : undefined} day={typeof day === 'string' ? day : undefined} processId={typeof processoId === 'string' ? processoId : undefined} />;
}
