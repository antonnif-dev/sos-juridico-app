import type {Role} from './types';
export const canPortal=(role:Role|null)=>role==='cliente';
export const portalId=(id:unknown):id is string=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(id);
export type PortalCase={id:string;titulo:string;numeroProcesso:string;area:string;assuntoEspecifico:string;comarca:string;instancia:string;valorAcordado:number;urgencia:string;status:string;responsavelNome:string;descricao:string;resultadoSentenca:string;convertedFromPreatendimentoId:string;createdAt:string|null;updatedAt:string|null;dataEncerramento:string|null};
export type PortalMovement={id:string;descricao:string;origem:string;data:string|null};
export type PortalIntake={id:string;categoria:string;status:string;resumoProblema:string;objetivo:string;informacaoExtra:string;adminNotes:string;proposalStatus:string;proposalValue:number|null;signature:string;signedAt:string|null;relatedProcessoId:string;triagem:Record<string,string|number|boolean|null>;createdAt:string|null;updatedAt:string|null};
export type PortalSummary={clientName:string;activeCasesCount:number;pendingPaymentsTotal:number;upcomingAppointmentsCount:number;atendimentosCount:number};
export type PortalMe={id:string;name:string;email:string;phone:string;portal:{enabled:boolean;status:string}};
export function portalDetail(kind:'processos'|'atendimentos',id:unknown){if(!portalId(id))throw new Error('Identificador inválido.');return `/portal/${kind}/${id}`;}
export function portalDocumentBase(scope:unknown,id?:unknown){if(scope==='client')return '/portal/meus-documentos';if(scope!=='case'&&scope!=='preatendimento')throw new Error('Recurso inválido.');return portalDetail(scope==='case'?'processos':'atendimentos',id)+'/documentos';}
export function portalProposalPayload(current:PortalIntake,action:'accepted'|'rejected'|'signature',name=''){
 if(action==='signature'){if(current.proposalStatus!=='accepted'||current.signature)throw new Error('Atualize a proposta: o aceite não está disponível.');const signature=name.trim().replace(/\s+/g,' ');if(signature.length<3||signature.length>160)throw new Error('Informe o nome de aceite com 3 a 160 caracteres.');return {signature};}
 if(!['accepted','rejected'].includes(action)||current.proposalStatus!=='sent')throw new Error('Atualize a proposta: ela não está aguardando resposta.');return {proposalStatus:action};
}
export function portalMovementPayload(value:string){const descricao=value.trim().replace(/\s+/g,' ');if(descricao.length<2||descricao.length>2000)throw new Error('Informe uma mensagem de 2 a 2000 caracteres.');return {descricao};}
export function portalContractUpload(c:{id:string;state:string;revision:number}){if(!portalId(c.id)||c.state!=='client_pending'||!Number.isSafeInteger(c.revision)||c.revision<1)throw new Error('Atualize o contrato: a devolução não está disponível.');return {path:`/portal/meus-contratos/${c.id}/files/client`,revision:c.revision};}
export function portalSearch<T>(items:T[],query:string,fields:(item:T)=>unknown[]){const term=query.trim().toLocaleLowerCase('pt-BR');return items.filter(item=>fields(item).join(' ').toLocaleLowerCase('pt-BR').includes(term));}
export const proposalLabels:Record<string,string>={pending:'Em preparação',sent:'Aguardando sua resposta',accepted:'Aceita',rejected:'Recusada'};
