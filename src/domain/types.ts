export type Role = 'administrador' | 'advogado' | 'financeiro' | 'secretaria' | 'estagiario' | 'cliente';
export type Address = { cep: string; rua: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string };
export type Profile = { uid: string; name: string; email: string; phone?: string; role: Role; status: string; cpfCnpj?: string; oab?: string; dataNascimento?: string; estadoCivil?: string; tipoPessoa?: string; endereco?: Address | null; photoUrl?: string | null };
export type Theme = Partial<Record<'headerTitle'|'corPrimaria'|'corFundo'|'corFundoCard'|'corBorda'|'corFooterAtivo'|'corTextoPrimario'|'corTextoSecundario'|'corNavbarFundo'|'corNavbarTexto'|'corFooterFundo'|'corFooterTexto'|'fontFamilia'|'fontSizeBase'|'fontSizeH1'|'fontSizeH2'|'fontSizeH3'|'headerType'|'headerLogoShape'|'headerLogoSize'|'logoUrl', string>>;
export type SessionResponse = { requiredAction: string | null; emailVerified: boolean };
const aliases: Record<string, Role> = { admin: 'administrador', administrator: 'administrador', lawyer: 'advogado', financial: 'financeiro', secretary: 'secretaria', 'secretária': 'secretaria', intern: 'estagiario', 'estagiário': 'estagiario', client: 'cliente' };
export function normalizeRole(value: unknown): Role | null {
  if (typeof value !== 'string') return null;
  const text = value.normalize('NFKC').trim().toLowerCase(); const role = aliases[text] || text;
  return ['administrador','advogado','financeiro','secretaria','estagiario','cliente'].includes(role) ? role as Role : null;
}
export const roleLabels: Record<Role, string> = { administrador: 'Administrador', advogado: 'Advogado', financeiro: 'Financeiro', secretaria: 'Secretaria', estagiario: 'Estagiário', cliente: 'Cliente' };
