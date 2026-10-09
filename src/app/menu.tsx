import {CommunicationCounts} from '../components/communication/CommunicationCounts';
import React,{useState} from 'react';
import { router } from 'expo-router';
import { useSession } from '../auth/SessionProvider';
import { modulesForRole } from '../domain/navigation';
import { roleLabels } from '../domain/types';
import { Button,Card,EmptyState,Field,Label,Page } from '../components/ui';
export default function Menu(){
 const {profile}=useSession();const [search,setSearch]=useState('');if(!profile)return null;
 const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const items=modulesForRole(profile.role).filter(item=>normalize(item.title).includes(normalize(search.trim())));
 return <Page><Label variant="title">Menu</Label><Label variant="muted">{roleLabels[profile.role]} · Áreas do seu acesso</Label><CommunicationCounts/><Field label="Buscar no menu" placeholder="Nome da área" value={search} onChangeText={setSearch}/>
 {!items.length&&<EmptyState title="Nenhuma área encontrada" description="Tente outro nome para a busca."/>}
 {items.map(item=><Card key={item.id}><Label variant="small">{item.group}</Label><Label variant="subtitle">{item.title}</Label><Label variant="muted">{item.description}</Label><Button secondary title={item.href?'Abrir':`Previsto para a etapa ${item.stage}`} onPress={()=>item.href?router.push(item.href):router.push({pathname:'/modulo/[id]',params:{id:item.id}})}/></Card>)}
 </Page>;
}
