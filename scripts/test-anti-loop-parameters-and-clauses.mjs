import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 A iniciar teste do Ajuste de Parâmetros da API e Cláusulas Anti-Loop...');

// 1. Validar Parâmetros da API em openrouter.ts
const openrouterPath = path.resolve('src/lib/ai/openrouter.ts');
const openrouterContent = fs.readFileSync(openrouterPath, 'utf8');

// Presence penalty check
const presenceMatch = openrouterContent.match(/presence_penalty:\s*([0-9.]+)/);
assert.ok(presenceMatch, 'openrouter.ts deve configurar presence_penalty na chamada à API');
const presenceVal = parseFloat(presenceMatch[1]);
assert.ok(presenceVal >= 0.3 && presenceVal <= 0.6, `presence_penalty (${presenceVal}) deve estar entre 0.3 e 0.6`);
console.log(`[openrouter.ts] presence_penalty: ${presenceVal} (entre 0.3 e 0.6) ✅`);

// Frequency penalty check
const frequencyMatch = openrouterContent.match(/frequency_penalty:\s*([0-9.]+)/);
assert.ok(frequencyMatch, 'openrouter.ts deve configurar frequency_penalty na chamada à API');
const frequencyVal = parseFloat(frequencyMatch[1]);
assert.ok(frequencyVal >= 0.2 && frequencyVal <= 0.5, `frequency_penalty (${frequencyVal}) deve estar entre 0.2 e 0.5`);
console.log(`[openrouter.ts] frequency_penalty: ${frequencyVal} (entre 0.2 e 0.5) ✅`);

// Temperature check
const tempMatch = openrouterContent.match(/temperature:\s*([0-9.]+)/);
assert.ok(tempMatch, 'openrouter.ts deve configurar temperature');
const tempVal = parseFloat(tempMatch[1]);
assert.ok(tempVal >= 0.6 && tempVal <= 0.8, `temperature (${tempVal}) deve estar entre 0.6 e 0.8`);
console.log(`[openrouter.ts] temperature: ${tempVal} (entre 0.6 e 0.8) ✅`);

// 2. Validar Cláusulas de Bloqueio no System Prompt em openrouter.ts
assert.ok(
  openrouterContent.includes('Regra de Novidade Absoluta') &&
  openrouterContent.includes('É expressamente proibido repetir uma premissa, argumento ou exemplo'),
  'openrouter.ts deve incluir a Regra de Novidade Absoluta'
);
assert.ok(
  openrouterContent.includes('Mecanismo de Desistência') &&
  openrouterContent.includes('impasse técnico'),
  'openrouter.ts deve incluir o Mecanismo de Desistência (Impasse Técnico)'
);
console.log('[openrouter.ts] Cláusulas de bloqueio (Novidade Absoluta e Impasse Técnico): ✅');

// 3. Validar bibliaLoader.ts
const bibliaLoaderPath = path.resolve('src/lib/agents/bibliaLoader.ts');
const bibliaLoaderContent = fs.readFileSync(bibliaLoaderPath, 'utf8');

assert.ok(
  bibliaLoaderContent.includes('Regra de Novidade Absoluta') &&
  bibliaLoaderContent.includes('Mecanismo de Desistência'),
  'bibliaLoader.ts deve conter as cláusulas de bloqueio anti-loop'
);
console.log('[bibliaLoader.ts] Cláusulas anti-loop no system prompt canónico: ✅');

// 4. Validar AddSpecialistModal.tsx
const addSpecialistPath = path.resolve('src/components/AddSpecialistModal.tsx');
const addSpecialistContent = fs.readFileSync(addSpecialistPath, 'utf8');

assert.ok(
  addSpecialistContent.includes('Regra de Novidade Absoluta') ||
  addSpecialistContent.includes('Novidade Absoluta'),
  'AddSpecialistModal.tsx deve incluir Regra de Novidade Absoluta nos novos especialistas'
);
assert.ok(
  addSpecialistContent.includes('Mecanismo de Desistência') ||
  addSpecialistContent.includes('impasse técnico'),
  'AddSpecialistModal.tsx deve incluir Mecanismo de Desistência (Impasse) nos novos especialistas'
);
console.log('[AddSpecialistModal.tsx] Cláusulas anti-loop no criador de especialistas: ✅');

console.log('🎉 Todos os testes de parâmetros de API e cláusulas anti-loop foram validados!');
