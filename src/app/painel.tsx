import React from 'react';
import {router} from 'expo-router';
import {useSession} from '../auth/SessionProvider';
import {useRemote} from '../hooks/useRemote';
import {canReadDashboard,type Dashboard} from '../domain/clients';
import {Button,Card,EmptyState,ErrorState,Label,Page} from '../components/ui';
export default function DashboardScreen(){
 const {profile}=useSession();const allowed=canReadDashboard(profile?.role||null);const remote=useRemote<Dashboard>(allowed?'/dashboard/summary':null);
 if(!allowed)return <Page><EmptyState title="Acesso não permitido" description="O painel está disponível para administradores e advogados."/></Page>;
 const data=remote.data;
 return <Page onRefresh={remote.reload} refreshing={remote.loading}><Label variant="title">Painel do escritório</Label>{remote.loading?<Label>Carregando painel…</Label>:remote.error?<ErrorState message={remote.error} onRetry={remote.reload}/>:data?<><Card><Label variant="muted">Clientes</Label><Label variant="title">{data.totalClientesCount}</Label><Button secondary title="Ver clientes" onPress={()=>router.push('/clientes')}/></Card><Card><Label variant="muted">Processos ativos</Label><Label variant="title">{data.processosAtivosCount}</Label></Card><Label variant="subtitle">Próximos compromissos</Label>{data.proximosCompromissos.length?data.proximosCompromissos.map(item=><Card key={item.id}><Label variant="subtitle">{item.titulo}</Label><Label>{item.tipo}</Label><Label>{new Date(item.dataHora).toLocaleString('pt-BR')}</Label><Button title="Abrir compromisso" secondary onPress={()=>router.push({pathname:'/agenda/[id]',params:{id:item.id}})}/></Card>):<EmptyState title="Nenhum próximo compromisso" description="Não há compromissos retornados para o seu acesso."/>}<Label variant="muted">Horários exibidos no fuso do aparelho.</Label></>:<EmptyState title="Painel indisponível" description="Atualize para tentar novamente."/>}<Button title="Atualizar painel" secondary disabled={remote.loading} onPress={remote.reload}/></Page>;
}
