import type { Role } from './types';
export type Intake = {id:string;clientId:string|null;nome:string;email:string;categoria:string;status:string;relatedProcessoId:string|null;proposalValue:number|null;proposalStatus:string;adminNotes:string;signature:string;endereco:Record<string,string>;triagem:Record<string,string|number|boolean>;documentos:string[];[key:string]:unknown};
export type IntakeForm = {text:Record<string,string>;address:Record<string,string>;triage:Record<string,string|number|boolean>;documents:string;continuous:boolean;lgpd:boolean;registration:boolean;whatsapp:boolean;clientId:string};
export const canManageIntake=(role:Role|null)=>role==='administrador'||role==='advogado';
export const intakeId=(id:unknown):id is string=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(id);
export const intakeStatuses=['Pendente','Em Análise','Em Negociacao','Convertido'];
export const statusLabel=(value:string)=>value==='Em Negociacao'?'Em negociação':value;
export const proposalLabels:Record<string,string>={'':'Não informada',pending:'Pendente',sent:'Enviada',accepted:'Aceita',rejected:'Recusada'};
export const textFields=[['nome','Nome / razão social *',160],['cpfCnpj','CPF/CNPJ *',20],['email','E-mail *',254],['telefone','Telefone *',20],['dataNascimento','Nascimento (AAAA-MM-DD)',10],['estadoCivil','Estado civil',60],['profissao','Profissão',120],['nomeMae','Nome da mãe',160],['resumoProblema','Resumo do problema *',6000],['dataProblema','Data do problema (AAAA-MM-DD)',10],['parteContrariaNome','Parte contrária',200],['tipoRelacao','Tipo de relação',200],['objetivo','Objetivo',2000],['informacaoExtra','Informações extras',6000],['mensagem','Mensagem',6000]] as const;
export const addressFields=[['cep','CEP',9],['rua','Rua',160],['numero','Número',20],['complemento','Complemento',120],['bairro','Bairro',100],['cidade','Cidade',100],['estado','UF',2]] as const;
export function intakeForm(item?:Intake):IntakeForm {
 const text:Record<string,string>={tipoPessoa:'Física',categoria:'Cível',urgencia:'Média'};
 for(const [key] of textFields)text[key]='';
 for(const key of Object.keys(text))if(typeof item?.[key]==='string')text[key]=item[key] as string;
 return {text,address:Object.fromEntries(addressFields.map(([key])=>[key,String(item?.endereco?.[key]||'')])),triage:{...item?.triagem},documents:(item?.documentos||[]).join('\n'),continuous:item?.problemaContinuo===true,lgpd:item?.consentimentoLGPD===true,registration:item?.consentimentoCadastro===true,whatsapp:item?.consentimentoWhatsapp===true,clientId:item?.clientId||''};
}
const digits=(s:string)=>s.replace(/\D/g,'');
function date(value:string){if(!value)return '';if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw new Error('Data inválida. Use AAAA-MM-DD.');return value;}
export function intakePayload(f:IntakeForm,original?:Intake){
 const result:Record<string,unknown>={};
 for(const [key,,max] of [...textFields,['tipoPessoa','',20],['categoria','',160],['urgencia','',20]] as readonly (readonly [string,string,number])[]){const v=f.text[key].normalize('NFKC').trim();if(v.length>max)throw new Error('Campo excede o limite: '+key);result[key]=v;}
 for(const key of ['nome','categoria','resumoProblema'])if(String(result[key]).length<2)throw new Error('Preencha nome, categoria e resumo do problema.');
 result.email=String(result.email).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(result.email)))throw new Error('E-mail inválido.');
 result.cpfCnpj=digits(f.text.cpfCnpj);result.telefone=digits(f.text.telefone);
 if(![11,14].includes(String(result.cpfCnpj).length))throw new Error('Informe CPF/CNPJ com 11 ou 14 dígitos.');
 if(String(result.telefone).length<8||String(result.telefone).length>15)throw new Error('Telefone inválido.');
 result.dataNascimento=date(f.text.dataNascimento.trim());result.dataProblema=date(f.text.dataProblema.trim());
 if(!['Física','Jurídica'].includes(f.text.tipoPessoa)||!['Baixa','Média','Alta','Urgente'].includes(f.text.urgencia))throw new Error('Tipo de pessoa ou urgência inválido.');
 const address:Record<string,string>={};for(const [key,,max]of addressFields){address[key]=(f.address[key]||'').trim();if(address[key].length>max)throw new Error('Endereço excede o limite: '+key);}
 address.cep=digits(address.cep);address.estado=address.estado.toUpperCase();if(address.cep&&address.cep.length!==8)throw new Error('CEP inválido.');if(address.estado&&!/^[A-Z]{2}$/.test(address.estado))throw new Error('UF inválida.');
 result.endereco=address;result.problemaContinuo=f.continuous;result.consentimentoWhatsapp=f.whatsapp;
 const docs=[...new Set(f.documents.split('\n').map(v=>v.trim()).filter(Boolean))];if(docs.length>50||docs.some(v=>v.length>160))throw new Error('Informe até 50 documentos, com até 160 caracteres por linha.');result.documentos=docs;
 if(Object.keys(f.triage).length>80)throw new Error('Triagem excede 80 respostas.');const triage:Record<string,string|number|boolean>={};for(const [k,v]of Object.entries(f.triage)){if(!/^[A-Za-z0-9_-]{1,64}$/.test(k)||!['string','number','boolean'].includes(typeof v)||(typeof v==='number'&&!Number.isFinite(v))||(typeof v==='string'&&v.length>2000))throw new Error('Resposta de triagem inválida: '+k);triage[k]=typeof v==='string'?v.trim():v;}result.triagem=triage;
 if(!original){if(!f.lgpd||!f.registration)throw new Error('Registre os consentimentos obrigatórios efetivamente obtidos.');result.consentimentoLGPD=f.lgpd;result.consentimentoCadastro=f.registration;if(f.clientId){if(!intakeId(f.clientId))throw new Error('Cliente inválido.');result.clientId=f.clientId;}}
 else for(const key of Object.keys(result))if(JSON.stringify(result[key])===JSON.stringify(original[key]))delete result[key];
 return result;
}
export function proposalPayload(value:string,status:string,notes:string,signature:string,original:Intake){
 const raw=value.trim();if(raw&&!/^\d+(?:[.,]\d{1,2})?$/.test(raw))throw new Error('Informe o valor sem separador de milhar, como 1500,50.');const amount=raw?Math.round(Number(raw.replace(',','.'))*100)/100:null;
 if(amount!==null&&amount>1e9)throw new Error('Valor da proposta excede o limite.');if(!Object.hasOwn(proposalLabels,status)||notes.length>6000||signature.length>200)throw new Error('Dados da proposta inválidos.');
 const body:Record<string,unknown>={proposalValue:amount,proposalStatus:status,adminNotes:notes.trim(),signature:signature.trim()};for(const k of Object.keys(body))if(body[k]===original[k])delete body[k];return body;
}
export const converted=(item:Intake)=>item.status==='Convertido'||!!item.relatedProcessoId;
export const canConvert=(item:Intake)=>!converted(item)&&item.status==='Em Negociacao'&&intakeId(item.clientId);
export function statusPayload(item:Intake,status:string){if(converted(item)||!intakeStatuses.slice(0,3).includes(status))throw new Error('Use a ação de conversão; registros convertidos não podem voltar de status.');return {status};}
export function filterIntakes(items:Intake[],query:string,status:string){const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();return items.filter(i=>(status==='Todos'||(status==='Ativos'?!converted(i):i.status===status))&&normalize([i.nome,i.email,i.categoria,i.cpfCnpj].join(' ')).includes(normalize(query)));}
export const postStages=['Sentença','Em Recurso','Trânsito em Julgado','Em Execução','Arquivado'];
export const decisions=['Procedente','Improcedente','Parcial','Acordo'];
export function protocolPayload(number:string){const n=number.trim();if(!n||n.length>80)throw new Error('Informe o número do processo, com até 80 caracteres.');return {status:'Protocolado',numeroProcesso:n};}
export function decisionPayload(result:string){if(!decisions.includes(result))throw new Error('Selecione o resultado da decisão.');return {status:'Sentença',resultadoSentenca:result};}
