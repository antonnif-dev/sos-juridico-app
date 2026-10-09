import React,{useEffect,useRef,useState} from 'react';
import {Alert,BackHandler} from 'react-native';
import {router,useFocusEffect} from 'expo-router';
import {Button,Card,Choice,Field,Label,Message,Page} from '../../components/ui';
import {api,errorMessage} from '../../services/api';
import {ApiError} from '../../services/api-core';
import {lookupCep} from '../../services/cep';
import {isoBirthDate} from '../../domain/profile';
import {canReadClients,clientPayload,emptyClient,validClientId,type Client,type ClientForm,type ClientAddress} from '../../domain/clients';
import {useSession} from '../../auth/SessionProvider';
export default function NewClient(){
 const {profile}=useSession();const [form,setForm]=useState(emptyClient);const [busy,setBusy]=useState(false);const lock=useRef(false);const [message,setMessage]=useState('');const [errors,setErrors]=useState<Record<string,string>>({});const pending=useRef<AbortController|null>(null);
 const dirty=JSON.stringify(form)!==JSON.stringify(emptyClient());
 useEffect(()=>()=>pending.current?.abort(),[]);
 const leave=React.useCallback((go:()=>void)=>{if(lock.current)return;if(!dirty){go();return;}Alert.alert('Descartar cadastro?','Este cliente ainda não foi salvo.',[{text:'Continuar editando',style:'cancel'},{text:'Descartar',style:'destructive',onPress:go}]);},[dirty]);
 useFocusEffect(React.useCallback(()=>{const sub=BackHandler.addEventListener('hardwareBackPress',()=>{leave(()=>router.replace('/clientes'));return true;});return ()=>sub.remove();},[leave]));
 const field=(key:Exclude<keyof ClientForm,'address'>,value:string)=>{setForm(old=>({...old,[key]:value}));setErrors(old=>({...old,[key]:''}));setMessage('');};
 const address=(key:keyof ClientAddress,value:string)=>{setForm(old=>({...old,address:{...old.address,[key]:value}}));setErrors(old=>({...old,[`address.${key}`]:''}));};
 async function save(){
  if(lock.current)return;lock.current=true;setBusy(true);setMessage('');setErrors({});
  try{
   const data=clientPayload(form,isoBirthDate(form.dataNascimento));
   const saved=await api<Client>('/clients',{method:'POST',body:data});
   if(validClientId(saved?.id))router.replace({pathname:'/clientes/[id]',params:{id:saved.id}});
   else{setForm(emptyClient());setMessage('Cadastro concluído. Consulte a lista para localizar o cliente.');}
  }catch(e){if(e instanceof ApiError)setErrors(e.fields);setMessage(errorMessage(e)+(e instanceof ApiError&&(e.status===0||e.status>=500)?' Confira a lista antes de reenviar: o servidor pode ter concluído o cadastro.':''));}
  finally{lock.current=false;setBusy(false);}
 }
 async function cep(){
  if(lock.current)return;lock.current=true;setBusy(true);setMessage('');const controller=new AbortController();pending.current=controller;const timer=setTimeout(()=>controller.abort(),10000);
  try{const data=await lookupCep(form.address.zipCode,controller.signal);setForm(old=>({...old,address:{...old.address,zipCode:data.cep||'',street:data.rua||'',district:data.bairro||'',city:data.cidade||'',state:data.estado||''}}));setMessage('Confira o número e o complemento antes de cadastrar.');}
  catch(e){setMessage(controller.signal.aborted?'Consulta interrompida. Preencha o endereço manualmente.':errorMessage(e));}
  finally{clearTimeout(timer);pending.current=null;lock.current=false;setBusy(false);}
 }
 if(!canReadClients(profile?.role||null))return <Page><Label>Acesso não permitido.</Label></Page>;
 return <Page disabled={busy} onNavigate={leave}><Label variant="title">Cadastrar cliente</Label><Message text="Nome, e-mail e tipo de pessoa são obrigatórios. O cadastro não cria automaticamente uma conta de acesso ao portal."/>
 <Card><Field label="Nome completo / razão social *" value={form.name} onChangeText={v=>field('name',v)} error={errors.name} maxLength={120} editable={!busy}/><Field label="E-mail *" value={form.email} onChangeText={v=>field('email',v)} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={254} editable={!busy}/><Choice label="Tipo de pessoa *" value={form.type} options={['PF','PJ']} onChange={v=>field('type',v)} disabled={busy}/><Field label="CPF/CNPJ" value={form.cpfCnpj} onChangeText={v=>field('cpfCnpj',v)} error={errors.cpfCnpj} keyboardType="number-pad" maxLength={18} editable={!busy}/><Field label="Telefone" value={form.phone} onChangeText={v=>field('phone',v)} error={errors.phone} keyboardType="phone-pad" maxLength={25} editable={!busy}/><Field label="Nascimento (DD/MM/AAAA)" placeholder="31/12/1990" value={form.dataNascimento} onChangeText={v=>field('dataNascimento',v)} error={errors.dataNascimento} maxLength={10} keyboardType="numbers-and-punctuation" editable={!busy}/><Choice label="Estado civil" value={form.estadoCivil} options={['','Solteiro(a)','Casado(a)','Divorciado(a)','Viúvo(a)','União Estável']} onChange={v=>field('estadoCivil',v)} disabled={busy}/></Card>
 <Card><Label variant="subtitle">Endereço</Label><Field label="CEP" value={form.address.zipCode} onChangeText={v=>address('zipCode',v)} error={errors['address.zipCode']} keyboardType="number-pad" maxLength={9} editable={!busy}/><Button title="Buscar CEP" secondary disabled={busy} onPress={()=>void cep()}/>{([{key:'street',label:'Rua',max:160},{key:'number',label:'Número',max:20},{key:'complement',label:'Complemento',max:120},{key:'district',label:'Bairro',max:100},{key:'city',label:'Cidade',max:100},{key:'state',label:'UF',max:2}] as const).map(item=><Field key={item.key} label={item.label} value={form.address[item.key]} onChangeText={v=>address(item.key,v)} error={errors[`address.${item.key}`]} maxLength={item.max} autoCapitalize={item.key==='state'?'characters':'words'} editable={!busy}/>)}</Card>
 <Message text={message}/><Button title={busy?'Aguarde…':'Cadastrar cliente'} disabled={busy||!form.name.trim()||!form.email.trim()} onPress={()=>void save()}/><Button title="Voltar à lista" secondary disabled={busy} onPress={()=>leave(()=>router.replace('/clientes'))}/></Page>;
}
