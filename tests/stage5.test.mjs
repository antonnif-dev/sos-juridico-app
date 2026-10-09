import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
const code = await fs.readFile(new URL('../src/domain/agenda.ts', import.meta.url), 'utf8');
const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString('base64');
const a = await import(moduleUrl);
const base = { id: 'event_1', titulo: 'Reunião', dataHora: '2026-10-09T01:30:45.123Z', tipo: 'Reunião', processoId: 'case_1', processoTitulo: 'Ação cível', numeroProcesso: '123', clienteNome: 'João', concluido: false, responsavelUid: 'owner', assignedUserIds: [], createdByUid: 'creator' };
function inZone(zone, script) {
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', `import assert from 'node:assert/strict'; const a=await import(${JSON.stringify(moduleUrl)}); ${script}`], { env: { ...process.env, TZ: zone }, encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr);
}
test('agenda access and process linking have different role scopes', () => {
  const roles = ['administrador', 'advogado', 'secretaria', 'financeiro', 'estagiario', 'cliente'];
  assert.deepEqual(roles.filter(a.canUseAgenda), ['administrador', 'advogado', 'secretaria']);
  assert.deepEqual(roles.filter(a.canLinkProcess), ['administrador', 'advogado']);
});
test('local Brazilian clock is converted to correct instant across UTC day boundary', () => {
  inZone('America/Sao_Paulo', `assert.equal(a.localToIso('08/10/2026','22:30'),'2026-10-09T01:30:00.000Z'); assert.equal(a.agendaForm({dataHora:'2026-10-09T01:30:00Z'}).date,'08/10/2026');`);
});
test('different device timezones represent same instant', () => {
  inZone('UTC', `assert.equal(a.localToIso('09/10/2026','01:30'),'2026-10-09T01:30:00.000Z');`);
  inZone('Asia/Tokyo', `assert.equal(a.localToIso('09/10/2026','10:30'),'2026-10-09T01:30:00.000Z');`);
});
test('impossible dates, unsupported years and invalid clocks are rejected', () => {
  for (const [date, time] of [['31/02/2026', '09:00'], ['29/02/2025', '09:00'], ['01/01/1999', '09:00'], ['01/01/2101', '09:00'], ['01/01/2026', '24:00'], ['01/01/2026', '12:60'], ['2026-01-01', '09:00']]) assert.throws(() => a.localToIso(date, time));
  assert.match(a.localToIso('29/02/2024', '12:00'), /^2024-02-29T/);
});
test('DST gaps and repeated clocks are rejected instead of silently moving appointments', () => {
  inZone('America/New_York', `assert.throws(()=>a.localToIso('08/03/2026','02:30'));assert.throws(()=>a.localToIso('01/11/2026','01:30'));`);
});
test('edit title does not truncate seconds or resend unchanged date/link/type', () => {
  const form = a.agendaForm(base); form.titulo = 'Título novo';
  assert.deepEqual(a.agendaPayload(form, base, 'advogado'), { titulo: 'Título novo' });
  assert.deepEqual(a.agendaPayload(a.agendaForm(base), base, 'advogado'), {});
});
test('secretary preserves or removes existing link but cannot create or change one', () => {
  const form = a.agendaForm(base); form.titulo = 'Novo título';
  assert.deepEqual(a.agendaPayload(form, base, 'secretaria'), { titulo: 'Novo título' });
  form.processoId = ''; assert.equal(a.agendaPayload(form, base, 'secretaria').processoId, null);
  form.processoId = 'other'; assert.throws(() => a.agendaPayload(form, base, 'secretaria'));
  assert.throws(() => a.agendaPayload(form, undefined, 'secretaria'));
});
test('creation uses whitelist and cannot send ownership, tenant or completion', () => {
  const form = { ...a.agendaForm(), titulo: '  Nova   reunião  ', date: '08/10/2026', time: '09:00', tenantId: 'x', responsavelUid: 'x', concluido: true };
  const body = a.agendaPayload(form, undefined, 'administrador');
  assert.deepEqual(Object.keys(body).sort(), ['dataHora', 'processoId', 'tipo', 'titulo']);
  assert.equal(body.titulo, 'Nova reunião'); assert.equal(body.processoId, null);
  assert.throws(() => a.agendaPayload(form, undefined, 'cliente'));
});
test('day filters use device local dates and status excludes completed overdue events', () => {
  inZone('America/Sao_Paulo', `const item=${JSON.stringify(base)};const f={query:'joao',type:'Todos',status:'Atrasados',day:'2026-10-08'};assert.equal(a.filterAgenda([item],f,Date.parse('2026-10-10T00:00:00Z')).length,1);assert.equal(a.filterAgenda([{...item,concluido:true}],f,Date.parse('2026-10-10T00:00:00Z')).length,0);`);
  const f = { query: '', type: 'Prazo', status: 'Todos', day: '' }; assert.equal(a.filterAgenda([base], f).length, 0);
});
test('calendar covers leap month with no rollover or missing dates', () => {
  const cells = a.monthCells(2024, 1); assert.equal(cells.length, 42); assert.equal(cells.filter(Boolean).length, 29);
  assert.equal(cells[4].getDate(), 1); assert.equal(cells[32].getDate(), 29); assert.equal(cells[33], null);
});
test('invalid IDs cannot become agenda routes', () => {
  for (const id of ['../x', 'a/b', 'a?b', ['x'], '', null]) assert.equal(a.agendaId(id), false);
  assert.equal(a.agendaId('event_1-abc'), true);
});
