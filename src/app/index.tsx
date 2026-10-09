import {PortalDashboard} from '../components/portal/PortalDashboard';
import React,{useState} from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useSession } from '../auth/SessionProvider';
import { canReadClients,canReadDashboard } from '../domain/clients';
import { roleLabels } from '../domain/types';
import { Button,Card,Label,Message,Page } from '../components/ui';
import { errorMessage } from '../services/api';
export default function Home(){
 const {profile,refresh,logout}=useSession();const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);if(!profile)return null;
 async function run(task:()=>Promise<void>){setBusy(true);try{await task();}catch(e){setMessage(errorMessage(e));}finally{setBusy(false);}}
 if(profile.role==='cliente')return <PortalDashboard/>;
 return <Page disabled={busy} onRefresh={()=>void run(refresh)} refreshing={busy}><Label variant="title">Olá, {profile.name||'bem-vindo'}.</Label><Label variant="muted">{roleLabels[profile.role]}</Label><Card><Label variant="subtitle">Meu espaço</Label><Label>Escolha uma área no menu ou mantenha seus dados atualizados.</Label><>{canReadDashboard(profile.role)&&<Button title="Painel do escritório" onPress={()=>router.push('/painel')}/>}{canReadClients(profile.role)&&<Button title="Clientes" onPress={()=>router.push('/clientes')}/>}</><Button title="Abrir menu" onPress={()=>router.push('/menu')}/><Button title="Meu perfil" secondary onPress={()=>router.push('/perfil')}/></Card><Message text={profile.email}/><Button title="Atualizar dados e aparência" secondary disabled={busy} onPress={()=>void run(refresh)}/><Button title="Sair da conta" secondary disabled={busy} onPress={()=>Alert.alert('Sair da conta?','Você precisará entrar novamente neste aplicativo.',[{text:'Cancelar',style:'cancel'},{text:'Sair',onPress:()=>void run(logout)}])}/><Message text={message}/></Page>;
}
