import type {Role} from './types';
export type ClientAddress={zipCode:string;street:string;number:string;complement:string;district:string;city:string;state:string};
export type Client={id:string;name:string;email:string;phone:string;type:string;cpfCnpj:string;status:string;dataNascimento?:string;estadoCivil?:string;address:Partial<ClientAddress>|null};
export type PortalAccess={clientId:string;email:string;enabled:boolean;status:string};
export type Dashboard={totalClientesCount:number;processosAtivosCount:number;proximosCompromissos:{id:string;titulo:string;tipo:string;dataHora:string;processoId:string|null}[]};
export const canReadClients=(role:Role|null)=>!!role&&['administrador','advogado','secretaria'].includes(role);
export const canReadDashboard=(role:Role|null)=>role==='administrador'||role==='advogado';
export const canManagePortal=(role:Role|null)=>role==='administrador';
export const validClientId=(id:unknown):id is string=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(id);
export const emptyClient=()=>({name:'',email:'',phone:'',type:'PF',cpfCnpj:'',dataNascimento:'',estadoCivil:'',address:{zipCode:'',street:'',number:'',complement:'',district:'',city:'',state:''}});
export type ClientForm=ReturnType<typeof emptyClient>;
export function clientPayload(form:ClientForm,birthDate:string){
 return {name:form.name.trim(),email:form.email.trim().toLowerCase(),phone:form.phone.replace(/\D/g,''),type:form.type,cpfCnpj:form.cpfCnpj.replace(/\D/g,''),dataNascimento:birthDate,estadoCivil:form.estadoCivil.trim(),address:{zipCode:form.address.zipCode.replace(/\D/g,''),street:form.address.street.trim(),number:form.address.number.trim(),complement:form.address.complement.trim(),district:form.address.district.trim(),city:form.address.city.trim(),state:form.address.state.trim().toUpperCase()}};
}
const normalized=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function filterClients(items:Client[],query:string,type:string){
 const q=normalized(query.trim());const digits=q.replace(/\D/g,'');
 return items.filter(item=>(type==='Todos'||item.type===type)&&(!q||normalized([item.name,item.email,item.phone,item.cpfCnpj].join(' ')).includes(q)||(digits.length>=3&&[item.phone,item.cpfCnpj].some(value=>(value||'').replace(/\D/g,'').includes(digits)))));
}
