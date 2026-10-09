import type { Role } from './types';
export type Module = { id: string; title: string; description: string; stage: number; group: string; href?: '/equipe'|'/tema'|'/site'|'/painel'|'/clientes'|'/processos'|'/agenda'|'/triagem'|'/atendimento'|'/pos-atendimento'|'/financeiro'|'/relatorios'|'/mensagens'|'/notificacoes'|'/portal'|'/portal/processos'|'/portal/documentos'|'/portal/atendimentos'|'/portal/pagamentos'|'/ia'|'/datajud'; roles: Role[] };
const legal: Role[] = ['administrador','advogado'];
const staff: Role[] = [...legal,'financeiro','secretaria','estagiario'];
export const modules: Module[] = [
  { id:'painel',href:'/painel',title:'Painel',description:'Resumo do escritório e próximos compromissos.',stage:3,group:'Escritório',roles:legal },
  { id:'clientes',href:'/clientes',title:'Clientes',description:'Cadastro e informações dos clientes.',stage:3,group:'Escritório',roles:[...legal,'secretaria'] },
  { id:'processos',href:'/processos',title:'Processos',description:'Processos, responsáveis e movimentações.',stage:4,group:'Escritório',roles:[...legal,'estagiario'] },
  { id:'agenda',href:'/agenda',title:'Agenda e prazos',description:'Compromissos, audiências e prazos.',stage:5,group:'Escritório',roles:[...legal,'secretaria'] },
  { id:'triagem',href:'/triagem',title:'Pré-atendimento',description:'Triagem e negociação de propostas.',stage:6,group:'Atendimento',roles:legal },
  { id:'atendimento',href:'/atendimento',title:'Atendimento',description:'Acompanhamento dos atendimentos ativos.',stage:6,group:'Atendimento',roles:legal },
  { id:'pos-atendimento',href:'/pos-atendimento',title:'Pós-atendimento',description:'Acompanhamento e encerramento dos casos.',stage:6,group:'Atendimento',roles:legal },
  { id:'financeiro',href:'/financeiro',title:'Financeiro',description:'Receitas, despesas e parcelas.',stage:8,group:'Gestão',roles:[...legal,'financeiro'] },
  { id:'relatorios',href:'/relatorios',title:'Relatórios',description:'Relatórios finais e exportações.',stage:8,group:'Gestão',roles:legal },
  { id:'mensagens',href:'/mensagens',title:'Mensagens',description:'Conversas autorizadas do escritório.',stage:9,group:'Comunicação',roles:legal },
  { id:'notificacoes',href:'/notificacoes',title:'Notificações',description:'Central de avisos da sua conta.',stage:9,group:'Comunicação',roles:staff },
  { id:'ia',href:'/ia',title:'IA jurídica',description:'Assistente, análises e histórico.',stage:11,group:'Ferramentas',roles:legal },
  { id:'datajud',href:'/datajud',title:'DataJud',description:'Monitoramento dos processos permitidos.',stage:11,group:'Ferramentas',roles:[...legal,'estagiario'] },
  { id:'equipe',href:'/equipe',title:'Equipe',description:'Profissionais e acessos do escritório.',stage:12,group:'Administração',roles:['administrador'] },
  { id:'tema',href:'/tema',title:'Aparência',description:'Configurações visuais do escritório.',stage:12,group:'Administração',roles:['administrador'] },
  { id:'site',href:'/site',title:'Site institucional',description:'Conteúdo, imagens e publicação.',stage:12,group:'Administração',roles:['administrador'] },
  ...[
    ['portal-painel','Meu painel','Resumo dos seus atendimentos.'],
    ['portal-processos','Meus processos','Seus processos e movimentações.'],
    ['portal-documentos','Meus documentos','Documentos e contratos compartilhados.'],
    ['portal-atendimentos','Meus atendimentos','Atendimentos e propostas.'],
    ['portal-pagamentos','Meus pagamentos','Consulta dos seus pagamentos.'],
    ['portal-mensagens','Minhas mensagens','Converse com o escritório.'],
    ['portal-notificacoes','Minhas notificações','Avisos destinados a você.'],
  ].map(([id,title,description]): Module => ({ id,title,description,href:({'portal-painel':'/portal','portal-processos':'/portal/processos','portal-documentos':'/portal/documentos','portal-atendimentos':'/portal/atendimentos','portal-pagamentos':'/portal/pagamentos','portal-mensagens':'/mensagens','portal-notificacoes':'/notificacoes'} as Record<string,Module['href']>)[id],stage:10,group:'Meu portal',roles:['cliente'] })),
];
export function modulesForRole(role: Role | null) { return role ? modules.filter(item => item.roles.includes(role)) : []; }
export function accessibleModule(id: unknown, role: Role | null) { return typeof id === 'string' ? modulesForRole(role).find(item => item.id === id) : undefined; }
