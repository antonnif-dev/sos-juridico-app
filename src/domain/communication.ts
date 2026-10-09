import type {Role} from './types';
export type Participant={uid:string;clientId?:string;name:string;role:string;photoUrl?:string|null;oab?:string};
export type Conversation={id:string;participant:Participant;lastMessage:string;updatedAt:string|null;unreadCount:number;unread:boolean};
export type ChatMessage={id:string;senderId:string;content:string;createdAt:string|null};
export type Notice={id:string;type:string;title:string;description:string;priority:string;link:string;resource:{type:string;id:string};createdAt:string|null;readAt:string|null;unread:boolean};
export type NoticeSummary={unreadNotifications:number;latest:Notice[]};
export const canMessages=(role:Role|null)=>role==='administrador'||role==='advogado'||role==='cliente';
export const canNotifications=(role:Role|null)=>!!role&&['administrador','advogado','financeiro','secretaria','estagiario','cliente'].includes(role);
export const messageId=(v:unknown):v is string=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(v);
export const noticeId=(v:unknown):v is string=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,180}$/.test(v);
export function conversationPayload(candidate:Participant,role:Role|null){
 if(role==='cliente'){if(!['administrador','advogado'].includes(candidate.role)||!messageId(candidate.uid))throw new Error('Selecione um profissional autorizado.');return {participantId:candidate.uid};}
 if(!['administrador','advogado'].includes(role||'')||candidate.role!=='cliente'||!messageId(candidate.clientId))throw new Error('Selecione um cliente autorizado com portal ativo.');return {participantId:candidate.clientId};
}
export function messagePayload(value:string){const content=value.replace(/\r\n/g,'\n').trim();if(!content||content.length>2000)throw new Error('Informe uma mensagem de 1 a 2000 caracteres.');return {content};}
export const countLabel=(count:unknown)=>typeof count==='number'&&Number.isSafeInteger(count)&&count>=0?(count>99?'99+':String(count)):'—';
const categoryByType:Record<string,string>={lead:'Atendimento',proposal:'Atendimento',process:'Processo',movement:'Processo',datajud:'Processo',agenda:'Agenda',document:'Documento',financial:'Financeiro',message:'Mensagem'};
export const noticeCategory=(type:string)=>categoryByType[type]||'Sistema';
export const noticeCategories=['Todas','Atendimento','Processo','Agenda','Documento','Financeiro','Mensagem','Sistema'];
export function filterNotices(items:Notice[],status:string,category:string,query:string){const term=query.trim().toLocaleLowerCase('pt-BR');return items.filter(n=>(status==='Todas'||(status==='Não lidas'?n.unread!==false:n.unread===false))&&(category==='Todas'||noticeCategory(n.type)===category)&&[n.title,n.description].join(' ').toLocaleLowerCase('pt-BR').includes(term));}
export function noticePeriod(at:string|null,now=new Date()){if(!at||!Number.isFinite(Date.parse(at)))return 'Anteriores';const d=new Date(at);const day=(v:Date)=>`${v.getFullYear()}-${v.getMonth()}-${v.getDate()}`;const yesterday=new Date(now);yesterday.setDate(now.getDate()-1);return day(d)===day(now)?'Hoje':day(d)===day(yesterday)?'Ontem':'Anteriores';}
export type NoticeTarget={pathname:'/'|'/triagem'|'/financeiro'|'/processos/[id]'|'/agenda/[id]'|'/clientes/[id]'|'/portal'|'/portal/documentos'|'/portal/pagamentos'|'/portal/processos/[id]'|'/portal/atendimentos/[id]';params?:{id:string}};
// Never hand arbitrary backend links or unknown future destinations to the router/browser.
export function noticeTarget(n:Notice,role:Role|null):NoticeTarget|null{
 if(!canNotifications(role)||typeof n.link!=='string')return null;const path=n.link;
 if(role==='cliente'){
  if(path==='/')return {pathname:'/portal'};
  if(path==='/portal/documentos'||path==='/portal/pagamentos')return {pathname:path};
  const match=path.match(/^\/portal\/(processos|negociacao)\/([A-Za-z0-9_-]{1,128})$/);
  if(match)return {pathname:match[1]==='processos'?'/portal/processos/[id]':'/portal/atendimentos/[id]',params:{id:match[2]}};
  return null;
 }

 if(path==='/')return {pathname:'/'};
 if(path==='/triagem'&&canMessages(role))return {pathname:'/triagem'};
 if(path==='/transacoes'&&!!role&&['administrador','advogado','financeiro'].includes(role))return {pathname:'/financeiro'};
 const match=path.match(/^\/(processos|agenda|clientes)\/([A-Za-z0-9_-]{1,128})$/);if(!match)return null;const [,kind,id]=match;
 if(kind==='processos'&&!!role&&['administrador','advogado','estagiario'].includes(role))return {pathname:'/processos/[id]',params:{id}};
 if(kind==='agenda'&&!!role&&['administrador','advogado','secretaria'].includes(role))return {pathname:'/agenda/[id]',params:{id}};
 if(kind==='clientes'&&!!role&&['administrador','advogado','secretaria'].includes(role))return {pathname:'/clientes/[id]',params:{id}};
 return null;
}
