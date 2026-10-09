import type { Theme } from './types';
export const defaultTheme = {
 corPrimaria:'#4299e1',corFundo:'#f4f7f9',corFundoCard:'#ffffff',corBorda:'#e2e8f0',corFooterAtivo:'#4299e1',corTextoPrimario:'#1a202c',corTextoSecundario:'#718096',corNavbarFundo:'#ffffff',corNavbarTexto:'#1a202c',corFooterFundo:'#1a202c',corFooterTexto:'#f4f7f9',
 fontFamilia:'Inter, system-ui, sans-serif',fontSizeBase:'14px',fontSizeH1:'1.7rem',fontSizeH2:'1.5rem',fontSizeH3:'1.25rem',headerType:'text',headerLogoShape:'rounded',headerLogoSize:'1.7rem',headerTitle:'SOS Jurídico',logoUrl:''
};
export function normalizeTheme(raw: Theme = {}) {
 const result = { ...defaultTheme };
 for (const key of Object.keys(result) as (keyof typeof result)[]) {
  const value=raw[key]; if (typeof value !== 'string') continue;
  if (key.startsWith('cor')) { if (/^#[0-9a-f]{6}$/i.test(value)) result[key]=value; }
  else if (key==='logoUrl') { if (/^https:\/\//i.test(value)) result[key]=value; }
  else if (key==='headerTitle') result[key]=value.trim().slice(0,100)||defaultTheme.headerTitle;
  else if (key.startsWith('fontSize') || key==='headerLogoSize') { if (/^\d+(\.\d+)?(px|rem)$/.test(value)) result[key]=value; }
  else result[key]=value;
 }
 return result;
}
export function size(value: string, min: number, max: number) { return Math.max(min,Math.min(max,parseFloat(value)*(value.endsWith('rem')?16:1))); }
export function luminance(hex: string) { const rgb=hex.slice(1).match(/.{2}/g)!.map(v=>parseInt(v,16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722; }
export function contrast(a:string,b:string) { const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
export function readableColor(preferred:string,background:string) { if(contrast(preferred,background)>=4.5)return preferred;return contrast('#ffffff',background)>contrast('#111827',background)?'#ffffff':'#111827'; }
