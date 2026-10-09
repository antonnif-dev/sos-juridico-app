import React,{useState} from 'react';
import {router} from 'expo-router';
import {useSession} from '../../auth/SessionProvider';
import {Button,Card,Choice,EmptyState,ErrorState,Field,Label,Page} from '../../components/ui';
import {canReadClients,filterClients,type Client} from '../../domain/clients';
import {useRemote} from '../../hooks/useRemote';
export default function Clients(){
 const {profile}=useSession();const permitted=canReadClients(profile?.role||null);const remote=useRemote<Client[]>(permitted?'/clients':null);
 const [query,setQuery]=useState('');const [type,setType]=useState('Todos');const [count,setCount]=useState(25);
 const items=filterClients(Array.isArray(remote.data)?remote.data:[],query,type);
 if(!permitted)return <Page><EmptyState title="Acesso não permitido" description="Seu perfil não permite consultar clientes."/></Page>;
 return <Page onRefresh={remote.reload} refreshing={remote.loading}><Label variant="title">Clientes</Label><Button title="Cadastrar cliente" onPress={()=>router.push('/clientes/novo')}/><Field label="Buscar nesta lista" placeholder="Nome, e-mail, telefone ou CPF/CNPJ" value={query} onChangeText={v=>{setQuery(v);setCount(25);}}/><Choice label="Tipo de pessoa" value={type} options={['Todos','PF','PJ']} onChange={v=>{setType(v);setCount(25);}}/>
 {remote.loading?<Label>Carregando clientes…</Label>:remote.error?<ErrorState message={remote.error} onRetry={remote.reload}/>:<><Label variant="muted">{items.length} encontrados · {remote.data?.length||0} carregados</Label>{!items.length&&<EmptyState title={query||type!=='Todos'?'Nenhum resultado':'Nenhum cliente nesta lista'} description={query||type!=='Todos'?'Altere a busca ou o filtro.':'Cadastre um cliente ou atualize a lista.'}/>}{items.slice(0,count).map(item=><Card key={item.id}><Label variant="subtitle">{item.name}</Label><Label variant="muted">{item.type} · {item.status}</Label><Label>{item.email||'Sem e-mail'}</Label>{!!item.cpfCnpj&&<Label>CPF/CNPJ: {item.cpfCnpj}</Label>}<Button secondary title="Ver detalhes" onPress={()=>router.push({pathname:'/clientes/[id]',params:{id:item.id}})}/></Card>)}{items.length>count&&<Button title="Mostrar mais clientes" secondary onPress={()=>setCount(v=>v+25)}/>}</>}
 <Button title="Atualizar lista" secondary disabled={remote.loading} onPress={remote.reload}/></Page>;
}
