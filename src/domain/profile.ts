import type {Address,Profile} from './types';
export const emptyAddress:Address={cep:'',rua:'',numero:'',complemento:'',bairro:'',cidade:'',estado:''};
export function formFor(profile:Profile){return {name:profile.name||'',phone:profile.phone||'',cpfCnpj:profile.cpfCnpj||'',oab:profile.oab||'',dataNascimento:profile.dataNascimento?profile.dataNascimento.slice(0,10).split('-').reverse().join('/'):'',estadoCivil:profile.estadoCivil||'',tipoPessoa:profile.tipoPessoa||'',endereco:{...emptyAddress,...profile.endereco}};}
export type ProfileForm=ReturnType<typeof formFor>;
export function isoBirthDate(value:string){
 if(!value.trim())return '';
 const match=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
 if(!match)throw new Error('Use DD/MM/AAAA na data de nascimento.');
 const [,day,month,year]=match;const iso=`${year}-${month}-${day}`;const date=new Date(iso+'T12:00:00Z');
 const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==iso||iso>today)throw new Error('Informe uma data de nascimento válida, que não esteja no futuro.');
 return iso;
}
export function profilePayload(form:ProfileForm,original:ProfileForm){
 const payload:Record<string,unknown>={};
 for(const key of Object.keys(form) as (keyof ProfileForm)[]){
  if(JSON.stringify(form[key])===JSON.stringify(original[key]))continue;
  if(key==='dataNascimento')payload[key]=isoBirthDate(form[key]);
  else if(key==='phone'||key==='cpfCnpj')payload[key]=form[key].replace(/\D/g,'');
  else if(key==='endereco')payload[key]=Object.fromEntries(Object.entries(form.endereco).map(([k,v])=>[k,k==='cep'?v.replace(/\D/g,''):k==='estado'?v.trim().toUpperCase():v.trim()]));
  else payload[key]=form[key].trim();
 }
 return payload;
}
export function passwordError(password:string,confirmation:string){
 if(password!==confirmation)return 'A confirmação não corresponde à nova senha.';
 if(password.length<8||password.length>128||!/[A-Z]/.test(password)||!/[a-z]/.test(password)||!/[0-9]/.test(password)||! /[^A-Za-z0-9]/.test(password))return 'Use 8 a 128 caracteres com maiúscula, minúscula, número e símbolo.';
 return '';
}
