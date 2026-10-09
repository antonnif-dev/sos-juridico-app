import React from 'react';
import {useSession} from '../../auth/SessionProvider';
import {canMessages,canNotifications,countLabel,type NoticeSummary} from '../../domain/communication';
import {usePolling} from '../../hooks/usePolling';
import {Label} from '../ui';
export function CommunicationCounts(){const {profile}=useSession();const role=profile?.role||null;const messages=usePolling<{unreadMessages:number}>(canMessages(role)?'/mensagens/resumo':null,30000);const notices=usePolling<NoticeSummary>(canNotifications(role)?'/notifications/summary':null,30000);return <>{canMessages(role)&&<Label variant="muted">Mensagens não lidas: {messages.error?'indisponível':countLabel(messages.data?.unreadMessages)}</Label>}{canNotifications(role)&&<Label variant="muted">Notificações não lidas: {notices.error?'indisponível':countLabel(notices.data?.unreadNotifications)}</Label>}</>;}
