import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
async function load(path){const code=await fs.readFile(new URL('../src/'+path,import.meta.url),'utf8');return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));}
const c=await load('domain/clients.ts');const n=await load('domain/navigation.ts');const {createApi}=await load('services/api-core.ts');
test('clients, dashboard and portal permissions differ',()=>{
 const roles=['administrador','advogado','financeiro','secretaria','estagiario','cliente'];
 assert.deepEqual(roles.filter(c.canReadClients),['administrador','advogado','secretaria']);
 assert.deepEqual(roles.filter(c.canReadDashboard),['administrador','advogado']);
 assert.deepEqual(roles.filter(c.canManagePortal),['administrador']);
});
test('only implemented menu destinations are activated',()=>{
 assert.deepEqual(n.modules.filter(m=>m.href).map(m=>m.id).sort(),['agenda','atendimento','clientes','datajud','equipe','financeiro','ia','mensagens','notificacoes','painel','portal-atendimentos','portal-documentos','portal-mensagens','portal-notificacoes','portal-pagamentos','portal-painel','portal-processos','pos-atendimento','processos','relatorios','site','tema','triagem']);
 assert.equal(n.accessibleModule('clientes','cliente'),undefined);
});
test('client identifier rejects traversal and multi-value route',()=>{
 for(const value of ['../secret','a/b','a?x=1',['id'],null,''])assert.equal(c.validClientId(value),false);
 assert.equal(c.validClientId('cliente_123-A'),true);
});
test('client body uses address keys from clients API, not profile keys',()=>{
 const input={...c.emptyClient(),name:' Nome Teste ',email:' TESTE@EXAMPLE.COM ',phone:'(11) 99999-0000',cpfCnpj:'529.982.247-25',address:{zipCode:'01001-000',street:'Rua A',number:'10',complement:'',district:'Centro',city:'São Paulo',state:'sp'}};
 const body=c.clientPayload(input,'1990-12-31');
 assert.equal(body.name,'Nome Teste');assert.equal(body.email,'teste@example.com');assert.equal(body.phone,'11999990000');assert.equal(body.cpfCnpj,'52998224725');assert.equal(body.address.zipCode,'01001000');assert.equal(body.address.state,'SP');assert.equal(body.dataNascimento,'1990-12-31');
 assert.deepEqual(Object.keys(body).sort(),['address','cpfCnpj','dataNascimento','email','estadoCivil','name','phone','type']);assert.equal(body.endereco,undefined);
});
test('search matches accents, masked digits and person type without modifying data',()=>{
 const items=[{id:'a',name:'João Silva',email:'joao@example.com',phone:'11999990000',cpfCnpj:'52998224725',type:'PF'},{id:'b',name:'Empresa',email:'empresa@example.com',phone:'',cpfCnpj:'',type:'PJ'}];
 assert.equal(c.filterClients(items,'joao','Todos')[0].id,'a');assert.equal(c.filterClients(items,'529.982','PF')[0].id,'a');assert.equal(c.filterClients(items,'joao','PJ').length,0);assert.equal(c.filterClients(items,'','PJ')[0].id,'b');assert.equal(items.length,2);
});
test('conflict from server is surfaced once, without repeating client creation',async()=>{
 let count=0;const request=createApi({baseUrl:'https://api.example.test/api',token:async()=>'test',fetcher:async(url,options)=>{count++;assert.equal(url,'https://api.example.test/api/clients');assert.equal(options.method,'POST');return new Response(JSON.stringify({error:'Já existe um cliente com este e-mail.'}),{status:409});}});
 await assert.rejects(request('/clients',{method:'POST',body:c.clientPayload({...c.emptyClient(),name:'Pessoa',email:'p@example.com'},'')}),e=>e.status===409);assert.equal(count,1);
});
