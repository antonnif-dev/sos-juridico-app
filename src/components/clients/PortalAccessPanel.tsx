import React,{useRef,useState} from 'react';
import {Alert} from 'react-native';
import {useSession} from '../../auth/SessionProvider';
import {useRemote} from '../../hooks/useRemote';
import {canManagePortal,type PortalAccess} from '../../domain/clients';
import {passwordError} from '../../domain/profile';
import {api,errorMessage} from '../../services/api';
import {Button,Card,ErrorState,Field,Label,Message} from '../ui';
export function PortalAccessPanel({clientId}:{clientId:string}){
 const {profile}=useSession();const allowed=canManagePortal(profile?.role||null);const path=`/portal/clients/${encodeURIComponent(clientId)}/access`;
 const remote=useRemote<PortalAccess>(allowed?path:null);const [saved,setSaved]=useState<{base:PortalAccess|null;value:PortalAccess}|null>(null);const [password,setPassword]=useState('');const [confirmation,setConfirmation]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const lock=useRef(false);
 const access=saved?.base===remote.data?saved.value:remote.data;
 async function mutate(status?:'ativo'|'suspenso'){
  if(lock.current||!allowed||!access)return;
  if(!status){const problem=passwordError(password,confirmation);if(problem){setMessage(problem);return;}}
  lock.current=true;setBusy(true);setMessage('');
  try{const result=await api<PortalAccess>(status?path+'/status':path,{method:status?'PATCH':'POST',body:status?{status}:{password}});setSaved({base:remote.data,value:result});setMessage(status==='suspenso'?'Acesso suspenso.':status==='ativo'?'Acesso reativado. O cliente deverá entrar novamente.':'Acesso criado. Entregue a senha ao cliente pelo canal que você utiliza.');}
  catch(e){setMessage(errorMessage(e)+' Consulte o acesso novamente antes de repetir a operação.');}
  finally{setPassword('');setConfirmation('');lock.current=false;setBusy(false);}
 }
 if(!allowed)return null;
 return <Card><Label variant="subtitle">Acesso ao portal</Label>{remote.loading?<Label>Consultando acesso…</Label>:remote.error?<ErrorState message={remote.error} onRetry={remote.reload}/>:access?<><Label>{access.email}</Label><Label>Conta: {access.enabled?'criada':'não criada'} · Status: {access.status||'inativo'}</Label>{access.enabled?<Button secondary disabled={busy} title={access.status==='ativo'?'Suspender acesso':'Reativar acesso'} onPress={()=>{const status=access.status==='ativo'?'suspenso':'ativo';Alert.alert(status==='suspenso'?'Suspender acesso?':'Reativar acesso?',status==='suspenso'?'O cliente deixará de acessar o portal.':'O cliente precisará entrar novamente.',[{text:'Cancelar',style:'cancel'},{text:'Confirmar',onPress:()=>void mutate(status)}]);}}/>:<><Field label="Senha inicial do cliente" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} maxLength={128} editable={!busy}/><Field label="Confirmar senha inicial" value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" autoCorrect={false} maxLength={128} editable={!busy}/><Message text="Use 8 a 128 caracteres com maiúscula, minúscula, número e símbolo."/><Button title="Criar acesso ao portal" disabled={busy||!password||!confirmation} onPress={()=>Alert.alert('Criar acesso?',`A conta será criada para ${access.email}.`,[{text:'Cancelar',style:'cancel'},{text:'Criar',onPress:()=>void mutate()}])}/></>}</>:<Label>Consulta de acesso indisponível.</Label>}<Message text={message}/><Button title="Consultar acesso novamente" secondary disabled={busy||remote.loading} onPress={()=>{setSaved(null);remote.reload();}}/></Card>;
}
