import React,{useEffect,useRef,useState} from 'react';
import { Alert,BackHandler,Image } from 'react-native';
import { router,useFocusEffect } from 'expo-router';
import { EmailAuthProvider,reauthenticateWithCredential,updatePassword } from 'firebase/auth';
import { useSession } from '../auth/SessionProvider';
import { Button,Card,Choice,Field,Label,Message,Page } from '../components/ui';
import { api,errorMessage } from '../services/api';
import { ApiError } from '../services/api-core';
import { lookupCep } from '../services/cep';
import { formFor,passwordError,profilePayload,type ProfileForm } from '../domain/profile';
import { roleLabels,type Address,type Profile } from '../domain/types';
export default function ProfileScreen(){
 const {profile,user,acceptProfile}=useSession();
 const [original,setOriginal]=useState(()=>formFor(profile!));const [form,setForm]=useState<ProfileForm>(()=>formFor(profile!));
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [errors,setErrors]=useState<Record<string,string>>({});
 const [currentPassword,setCurrentPassword]=useState('');const [newPassword,setNewPassword]=useState('');const [confirmation,setConfirmation]=useState('');const [passwordNotice,setPasswordNotice]=useState('');
 const pending=useRef<AbortController|null>(null);
 useEffect(()=>()=>pending.current?.abort(),[]);
 const dirty=JSON.stringify(form)!==JSON.stringify(original)||!!currentPassword||!!newPassword||!!confirmation;
 const leave=React.useCallback((go:()=>void)=>{if(busy)return;if(!dirty){go();return;}Alert.alert('Descartar alterações?','Há informações que ainda não foram salvas.',[{text:'Continuar editando',style:'cancel'},{text:'Descartar',style:'destructive',onPress:go}]);},[busy,dirty]);
 useFocusEffect(React.useCallback(()=>{const sub=BackHandler.addEventListener('hardwareBackPress',()=>{leave(()=>router.replace('/'));return true;});return ()=>sub.remove();},[leave]));
 const set=(key:Exclude<keyof ProfileForm,'endereco'>,value:string)=>{setForm(old=>({...old,[key]:value}));setErrors(old=>({...old,[key]:''}));setMessage('');};
 const address=(key:keyof Address,value:string)=>{setForm(old=>({...old,endereco:{...old.endereco,[key]:value}}));setErrors(old=>({...old,[`endereco.${key}`]:''}));setMessage('');};
 async function save(){
  setBusy(true);setMessage('');setErrors({});
  try{
   const payload=profilePayload(form,original);if(!Object.keys(payload).length){setMessage('Não há alterações no perfil para salvar.');return;}
   const saved=await api<Profile>('/users/me',{method:'PUT',body:payload});
   acceptProfile(saved);const next=formFor(saved);setOriginal(next);setForm(next);setMessage('Perfil salvo. Os dados também foram atualizados no site.');
  }catch(e){if(e instanceof ApiError)setErrors(e.fields);setMessage(errorMessage(e));}finally{setBusy(false);}
 }
 async function searchCep(){
  setBusy(true);setMessage('');const controller=new AbortController();pending.current=controller;const timer=setTimeout(()=>controller.abort(),10000);
  try{const result=await lookupCep(form.endereco.cep,controller.signal);setForm(old=>({...old,endereco:{...old.endereco,...result}}));setMessage('Endereço encontrado. Confira o número e salve o perfil.');}
  catch(e){setMessage(controller.signal.aborted?'A consulta demorou demais. Preencha o endereço manualmente ou tente novamente.':errorMessage(e));}
  finally{clearTimeout(timer);pending.current=null;setBusy(false);}
 }
 async function changePassword(){
  setPasswordNotice('');const problem=passwordError(newPassword,confirmation);if(problem){setPasswordNotice(problem);return;}
  setBusy(true);
  try{
   await reauthenticateWithCredential(user!,EmailAuthProvider.credential(user!.email!,currentPassword));
   await updatePassword(user!,newPassword);await user!.getIdToken(true).catch(()=>{});
   setCurrentPassword('');setNewPassword('');setConfirmation('');setPasswordNotice('Senha alterada. Use a nova senha também no próximo login no site.');
  }catch(e){setPasswordNotice(errorMessage(e));setCurrentPassword('');}finally{setBusy(false);}
 }
 if(!profile)return null;
 return <Page disabled={busy} onNavigate={leave}><Label variant="title">Meu perfil</Label>
 <Card>{profile.photoUrl?.startsWith('https://')&&<Image source={{uri:profile.photoUrl}} accessibilityLabel="Foto do perfil" style={{width:72,height:72,borderRadius:36}}/>}<Label variant="subtitle">{profile.name}</Label><Label variant="muted">{roleLabels[profile.role]}</Label><Field label="E-mail de acesso" value={profile.email} editable={false}/><Message text="O e-mail de acesso é somente para consulta nesta tela."/></Card>
 <Card><Label variant="subtitle">Dados pessoais</Label>
 <Field label="Nome completo" value={form.name} onChangeText={v=>set('name',v)} maxLength={120} error={errors.name} editable={!busy}/>
 <Choice label="Tipo de pessoa" value={form.tipoPessoa} options={['','Física','Jurídica']} onChange={v=>set('tipoPessoa',v)} disabled={busy}/>
 <Field label="CPF/CNPJ" value={form.cpfCnpj} onChangeText={v=>set('cpfCnpj',v)} keyboardType="number-pad" maxLength={18} error={errors.cpfCnpj} editable={!busy}/>
 <Field label="OAB" value={form.oab} onChangeText={v=>set('oab',v)} autoCapitalize="characters" maxLength={30} error={errors.oab} editable={!busy}/>
 <Field label="Telefone/WhatsApp" value={form.phone} onChangeText={v=>set('phone',v)} keyboardType="phone-pad" maxLength={25} error={errors.phone} editable={!busy}/>
 <Field label="Nascimento (DD/MM/AAAA)" placeholder="31/12/1990" value={form.dataNascimento} onChangeText={v=>set('dataNascimento',v)} keyboardType="numbers-and-punctuation" maxLength={10} error={errors.dataNascimento} editable={!busy}/>
 <Choice label="Estado civil" value={form.estadoCivil} options={['','Solteiro(a)','Casado(a)','Divorciado(a)','Viúvo(a)','União Estável']} onChange={v=>set('estadoCivil',v)} disabled={busy}/>
 </Card>
 <Card><Label variant="subtitle">Endereço</Label><Field label="CEP" value={form.endereco.cep} onChangeText={v=>address('cep',v)} keyboardType="number-pad" maxLength={9} error={errors['endereco.cep']} editable={!busy}/><Button title="Buscar endereço pelo CEP" secondary disabled={busy} onPress={()=>void searchCep()}/>
 {([{key:'rua',label:'Rua',max:160},{key:'numero',label:'Número',max:20},{key:'complemento',label:'Complemento',max:120},{key:'bairro',label:'Bairro',max:100},{key:'cidade',label:'Cidade',max:100},{key:'estado',label:'UF',max:2}] as const).map(item=><Field key={item.key} label={item.label} value={form.endereco[item.key]} onChangeText={v=>address(item.key,v)} maxLength={item.max} autoCapitalize={item.key==='estado'?'characters':'words'} error={errors[`endereco.${item.key}`]} editable={!busy}/>)}
 </Card><Button title={busy?'Aguarde…':'Salvar perfil'} disabled={busy} onPress={()=>void save()}/><Message text={message}/>
 <Card><Label variant="subtitle">Alterar senha</Label><Message text="Use 8 a 128 caracteres com maiúscula, minúscula, número e símbolo. A alteração de senha tem seu próprio botão."/><Field label="Senha atual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} editable={!busy}/><Field label="Nova senha" value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} maxLength={128} editable={!busy}/><Field label="Confirmar nova senha" value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" autoCorrect={false} maxLength={128} editable={!busy}/><Button title="Alterar senha" disabled={busy||!currentPassword||!newPassword||!confirmation} onPress={()=>void changePassword()}/><Message text={passwordNotice}/></Card>
 <Button title="Voltar ao início" secondary disabled={busy} onPress={()=>leave(()=>router.replace('/'))}/></Page>;
}
