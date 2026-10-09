import type {Role} from './types';
export type CaseRecord={id:string;titulo:string;numeroProcesso:string;clientId:string;clienteNome:string;responsavelUid:string;responsavelNome:string;createdByUid:string;assignedUserIds:string[];area:string;status:string;urgencia:string;valorCausa:number;problemaContinuo:boolean;createdAt:string|null;updatedAt:string|null;[key:string]:unknown};
export type Movement={id:string;descricao:string;origem:string;criadoPorUid:string;data:string|null;updatedAt:string|null};
export type Member={uid:string;name:string;email:string;role:string;status:string};
export const areas=['Cível','Trabalhista','Previdenciário','Família','Criminal','Empresarial','Tributário','Consumidor','Outros'];
export const statuses=['Em Elaboração','Em andamento','Protocolado','Aguardando Audiência','Aguardando Sentença','Sentença','Em Recurso','Trânsito em Julgado','Em Execução','Suspenso','Arquivado','Encerrado','Concluído'];
export const levels=['Baixa','Média','Alta'];
export const canReadCases=(role:Role|null)=>!!role&&['administrador','advogado','estagiario'].includes(role);
export const canCreateCases=(role:Role|null)=>role==='administrador'||role==='advogado';
export const canWriteCase=(c:CaseRecord,role:Role|null,uid:string)=>role==='administrador'||(role==='advogado'&&[c.responsavelUid,c.createdByUid,...(c.assignedUserIds||[])].includes(uid));
export const validId=(id:unknown):id is string=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(id);
export const activeMember=(m:Member)=>validId(m.uid)&&!['inativo','suspenso','bloqueado'].includes((m.status||'ativo').toLowerCase());
export const responsibleMember=(m:Member)=>activeMember(m)&&['administrador','advogado'].includes(m.role);
export const assignableMember=(m:Member)=>activeMember(m)&&['advogado','estagiario'].includes(m.role);
export const normalized=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export const filterCases=(items:CaseRecord[],query:string,status:string)=>items.filter(c=>(!status||c.status===status)&&normalized([c.titulo,c.numeroProcesso,c.clienteNome,c.responsavelNome].join(' ')).includes(normalized(query)));
export const commonFields=[['titulo','Título *',160],['numeroProcesso','Número do processo',80],['comarca','Comarca',160],['instancia','Instância',120]] as const;
export const createFields=[['partesEnvolvidas','Partes envolvidas',2000],['assuntoEspecifico','Assunto específico',200],['localidade','Localidade',160]] as const;
export const editFields=[['categoria','Categoria',160],['resumoProblema','Resumo do problema',6000],['dataProblema','Data do problema (AAAA-MM-DD)',10],['parteContrariaNome','Parte contrária',200],['tipoRelacao','Tipo de relação',200],['objetivo','Objetivo',1000],['informacaoExtra','Informações extras',6000],['resultadoSentenca','Resultado da sentença',200]] as const;
export type CaseForm=Record<string,string>;
export function caseForm(c?:CaseRecord):CaseForm{
 const f:CaseForm={clientId:'',area:'Cível',status:'Em andamento',urgencia:'Média',complexidade:'Média',probabilidade:'Média',etapaTriagem:'Pronto para aceite',origem:'',tipoCliente:'Pessoa Física',valorCausa:'0',problemaContinuo:'Não'};
 for(const [key] of [...commonFields,...createFields,...editFields])f[key]='';
 if(c){for(const key of Object.keys(f))if(typeof c[key]==='string')f[key]=c[key] as string;f.problemaContinuo=c.problemaContinuo?'Sim':'Não';f.valorCausa=String(c.valorCausa);}
 return f;
}
export function money(value:string){const s=value.trim();if(!s)return 0;if(!/^\d+(?:[.,]\d{1,2})?$/.test(s))throw new Error('Informe o valor sem separador de milhar, por exemplo: 1500,50.');const n=Number(s.replace(',','.'));if(n>1e12)throw new Error('Valor da causa muito alto.');return Math.round(n*100)/100;}
export function casePayload(f:CaseForm,editing:boolean,original?:CaseRecord){
 if(f.titulo.trim().length<2)throw new Error('Informe um título com pelo menos 2 caracteres.');
 const result:Record<string,unknown>={};
 for(const [k,,max] of [...commonFields,...(editing?editFields:createFields)]){const v=f[k].trim();if(v.length>max)throw new Error('Campo excede o tamanho permitido: '+k);result[k]=v;}
 for(const [k,options] of [['area',areas],['status',statuses],['urgencia',[...levels,'Urgente']]] as const){if(!options.includes(f[k]))throw new Error('Selecione uma opção válida para '+k);result[k]=f[k];}
 if(editing){result.problemaContinuo=f.problemaContinuo==='Sim';const d=String(result.dataProblema);if(d&&(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d))throw new Error('Data do problema inválida. Use AAAA-MM-DD.');if(original)for(const k of Object.keys(result))if(result[k]===original[k]||(result[k]===''&&original[k]==null))delete result[k];}
 else{if(!validId(f.clientId))throw new Error('Selecione um cliente.');result.clientId=f.clientId;result.valorCausa=money(f.valorCausa);for(const k of ['complexidade','probabilidade','etapaTriagem','origem','tipoCliente'])result[k]=f[k];}
 return result;
}
export function movementPayload(description:string){const descricao=description.trim();if(descricao.length<2||descricao.length>4000)throw new Error('A movimentação deve ter entre 2 e 4000 caracteres.');return {descricao};}
export function dateText(value:unknown){if(typeof value!=='string'||!value)return 'Não informado';const d=new Date(value);return Number.isNaN(d.getTime())?value:d.toLocaleString('pt-BR');}
