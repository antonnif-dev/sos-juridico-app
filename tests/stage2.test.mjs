import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
async function load(file){const source=await fs.readFile(new URL('../src/domain/'+file,import.meta.url),'utf8');return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));}
const nav=await load('navigation.ts'), theme=await load('theme.ts'), profile=await load('profile.ts');
test('six role menus mirror web scopes',()=>{
 const ids=role=>nav.modulesForRole(role).map(m=>m.id).sort();
 assert.deepEqual(ids('financeiro'),['financeiro','notificacoes']);
 assert.deepEqual(ids('secretaria'),['agenda','clientes','notificacoes']);
 assert.deepEqual(ids('estagiario'),['datajud','notificacoes','processos']);
 assert.deepEqual(ids('cliente'),['portal-atendimentos','portal-documentos','portal-mensagens','portal-notificacoes','portal-pagamentos','portal-painel','portal-processos']);
 assert.deepEqual(ids('advogado'),['agenda','atendimento','clientes','datajud','financeiro','ia','mensagens','notificacoes','painel','pos-atendimento','processos','relatorios','triagem']);
 assert.deepEqual(ids('administrador'),[...ids('advogado'),'equipe','site','tema'].sort());
});
test('unknown and unauthorized deep link cannot resolve module',()=>{
 assert.equal(nav.accessibleModule('financeiro','cliente'),undefined);
 assert.equal(nav.accessibleModule('portal-processos','advogado'),undefined);
 assert.equal(nav.accessibleModule('equipe','secretaria'),undefined);
 assert.equal(nav.accessibleModule(['equipe'],'administrador'),undefined);
 assert.equal(nav.accessibleModule('superadmin','administrador'),undefined);
 assert.equal(nav.modulesForRole(null).length,0);
});
test('theme ignores invalid colors and unsafe logo scheme',()=>{
 const result=theme.normalizeTheme({corPrimaria:'red',logoUrl:'javascript:alert(1)',corFundo:'#123456'});
 assert.equal(result.corPrimaria,theme.defaultTheme.corPrimaria);assert.equal(result.logoUrl,'');assert.equal(result.corFundo,'#123456');
});
test('text color remains readable on light and dark surfaces',()=>{
 for(const background of ['#ffffff','#000000','#4299e1','#666666'])assert.ok(theme.contrast(theme.readableColor('#777777',background),background)>=4.5);
 assert.equal(theme.size('1.5rem',14,32),24);assert.equal(theme.size('12px',14,18),14);
});
test('valid local birth date maps without timezone shift',()=>{
 assert.equal(profile.isoBirthDate('29/02/2024'),'2024-02-29');assert.equal(profile.isoBirthDate(''),'');
 assert.throws(()=>profile.isoBirthDate('31/02/2024'));assert.throws(()=>profile.isoBirthDate('01/01/2999'));
});
test('only edited profile fields leave app; no uid email role or tenant',()=>{
 const original=profile.formFor({uid:'u',name:'Pessoa Teste',email:'p@example.test',role:'cliente',status:'ativo',endereco:{cep:'01001000',numero:'10'}});
 const edited={...original,name:' Novo Nome ',phone:'(11) 99999-0000'};
 assert.deepEqual(profile.profilePayload(edited,original),{name:'Novo Nome',phone:'11999990000'});
 assert.deepEqual(profile.profilePayload(original,original),{});
});
test('address update preserves unchanged address fields and permits clearing',()=>{
 const original=profile.formFor({uid:'u',name:'Teste',endereco:{...profile.emptyAddress,rua:'Rua A',numero:'10',estado:'SP'}});
 const edited={...original,endereco:{...original.endereco,numero:'',estado:'rj'}};
 const payload=profile.profilePayload(edited,original);assert.equal(payload.endereco.rua,'Rua A');assert.equal(payload.endereco.numero,'');assert.equal(payload.endereco.estado,'RJ');
});
test('password confirmation and strength validated separately',()=>{
 assert.ok(profile.passwordError('weak','weak'));assert.ok(profile.passwordError('Senha#123','Senha#124'));assert.equal(profile.passwordError('Senha#123','Senha#123'),'');
});
