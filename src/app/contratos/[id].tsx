import React,{useState} from 'react';
import {router,useLocalSearchParams} from 'expo-router';
import {useSession} from '../../auth/SessionProvider';
import {Button,Card,ErrorState,Label,Page} from '../../components/ui';
import {ContractEditor} from '../../components/files/ContractEditor';
import {canUseContracts,contractBase,contractStates,validFileId,type Contract} from '../../domain/files';
import {useRemote} from '../../hooks/useRemote';
function Contracts({base}:{base:string}){
 const {profile}=useSession();const allowed=canUseContracts(profile?.role||null);const remote=useRemote<Contract[]>(allowed?base:null,true);const [editing,setEditing]=useState<Contract|null|undefined>(undefined);
 if(!allowed)return <Page><Label>Contratos disponíveis apenas ao administrador e advogado.</Label></Page>;
 if(editing!==undefined)return <ContractEditor key={editing?editing.id+':'+editing.revision:'new'} base={base} contract={editing} onSaved={setEditing} onBack={()=>{setEditing(undefined);remote.reload();}}/>;
 return <Page refreshing={remote.loading} onRefresh={remote.reload}><Label variant="title">Contratos do cliente</Label><Button title="Criar contrato" disabled={remote.loading||!!remote.error} onPress={()=>setEditing(null)}/>{remote.loading&&<Label>Carregando contratos…</Label>}{remote.error?<ErrorState message={remote.error} onRetry={remote.reload}/>:remote.data?.map(c=><Card key={c.id}><Label variant="subtitle">{c.title}</Label><Label>{contractStates[c.state]||c.state} • Revisão {c.revision}</Label><Button title="Abrir contrato" secondary disabled={remote.loading||!validFileId(c.id)} onPress={()=>setEditing(c)}/></Card>)}{!remote.loading&&!remote.error&&!remote.data?.length&&<Label>Nenhum contrato cadastrado.</Label>}<Label variant="small">O backend retorna até os 100 contratos mais recentes deste cliente.</Label><Button title="Atualizar contratos" secondary disabled={remote.loading} onPress={remote.reload}/><Button title="Voltar ao cliente" secondary onPress={()=>router.back()}/></Page>;
}
export default function ContractRoute(){const {id}=useLocalSearchParams<{id:string}>();return validFileId(id)?<Contracts key={id} base={contractBase(id)}/>:<Page><Label>Cliente inválido.</Label></Page>;}
