import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const code = await fs.readFile(new URL('../src/services/api-core.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { createApi, endpoint, ApiError } = await import('data:text/javascript;base64,'+Buffer.from(output).toString('base64'));
test('token never goes to an absolute URL or outside /api', () => {
 for (const path of ['https://other.test/x','//other.test/x','/../private','/x\\y']) assert.throws(() => endpoint('https://office.test/api', path));
});
test('authenticated request uses existing /api/users/me and exact partial payload', async () => {
 const calls = [];
 const request = createApi({ baseUrl:'https://office.test/api', token:async ()=>'test-token', fetcher:async (url, options) => { calls.push({url,options}); return new Response(JSON.stringify({name:'Teste'}),{status:200}); } });
 await request('/users/me',{method:'PUT',body:{name:'Teste',phone:'11999999999'}});
 assert.equal(calls[0].url,'https://office.test/api/users/me');
 assert.equal(calls[0].options.headers.Authorization,'Bearer test-token');
 assert.deepEqual(JSON.parse(calls[0].options.body),{name:'Teste',phone:'11999999999'});
});
test('App Check refusal propagates; mutating request is not replayed', async () => {
 let calls=0, failure;
 const request=createApi({baseUrl:'https://office.test/api',token:async()=>'x',onFailure:e=>failure=e,fetcher:async()=>{calls++;return new Response(JSON.stringify({code:'APP_CHECK_REQUIRED',error:'Blocked'}),{status:403});}});
 await assert.rejects(request('/users/me',{method:'PUT',body:{name:'Teste'}}),e=>e instanceof ApiError&&e.code==='APP_CHECK_REQUIRED');
 assert.equal(calls,1); assert.equal(failure.status,403);
});
test('HTML from a frontend URL is rejected', async()=>{
 const request=createApi({baseUrl:'https://office.test/api',token:async()=>'x',fetcher:async()=>new Response('<html>website</html>')});
 await assert.rejects(request('/users/me'), /não retornou JSON/);
});
test('aborted calls do not send the token', async()=>{
 let calls=0; const controller=new AbortController();controller.abort();
 const request=createApi({baseUrl:'https://office.test/api',token:async()=>'x',fetcher:async()=>{calls++;return new Response('{}');}});
 await assert.rejects(request('/users/me',{signal:controller.signal})); assert.equal(calls,0);
});
test('validation field errors remain available', async()=>{
 const request=createApi({baseUrl:'https://office.test/api',token:async()=>'x',fetcher:async()=>new Response(JSON.stringify({error:'Dados inválidos',fields:{name:'Nome obrigatório'}}),{status:400})});
 await assert.rejects(request('/users/me'),e=>e.fields.name==='Nome obrigatório');
});
