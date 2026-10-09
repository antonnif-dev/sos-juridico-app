import React from 'react';
import { router,useLocalSearchParams,Redirect } from 'expo-router';
import { useSession } from '../../auth/SessionProvider';
import { accessibleModule } from '../../domain/navigation';
import { Button,EmptyState,Label,Page } from '../../components/ui';
export default function ModuleInfo(){
 const {id}=useLocalSearchParams<{id:string}>();const {profile}=useSession();const item=accessibleModule(id,profile?.role||null);
 if(item?.href)return <Redirect href={item.href}/>;
 return <Page>{item?<><Label variant="title">{item.title}</Label><EmptyState title="Ainda não disponível no aplicativo" description={`Esta área está prevista para a etapa ${item.stage}. ${item.description} As operações continuam disponíveis no site conforme suas permissões.`}/></>:<EmptyState title="Área indisponível" description="Esta área não existe ou não está disponível para o seu perfil."/>}<Button title="Voltar ao menu" onPress={()=>router.replace('/menu')}/></Page>;
}
