import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 A iniciar teste do Protocolo de Argumentação Sequencial em 3 Fases...');

// 1. Validar bibliaLoader.ts
const bibliaLoaderPath = path.resolve('src/lib/agents/bibliaLoader.ts');
const bibliaLoaderContent = fs.readFileSync(bibliaLoaderPath, 'utf8');

assert.ok(
  bibliaLoaderContent.includes('Fase 1: Inicialização e Posicionamento'),
  'bibliaLoader.ts deve conter Fase 1: Inicialização e Posicionamento'
);
assert.ok(
  bibliaLoaderContent.includes('Definição da Persona') &&
  bibliaLoaderContent.includes('Abertura Direta') &&
  bibliaLoaderContent.includes('Mapeamento de Limites'),
  'bibliaLoader.ts deve conter os requisitos da Fase 1 (Definição da Persona, Abertura Direta, Mapeamento de Limites)'
);

assert.ok(
  bibliaLoaderContent.includes('Fase 2: Avaliação e Refutação Contínua'),
  'bibliaLoader.ts deve conter Fase 2: Avaliação e Refutação Contínua'
);
assert.ok(
  bibliaLoaderContent.includes('Dissecação Lógica') &&
  bibliaLoaderContent.includes('Ancoragem em Factos e Casos') &&
  bibliaLoaderContent.includes('Deteção de Falácias'),
  'bibliaLoader.ts deve conter os requisitos da Fase 2 (Dissecação Lógica, Ancoragem em Factos e Casos, Deteção de Falácias)'
);

assert.ok(
  bibliaLoaderContent.includes('Fase 3: Síntese e Conclusão'),
  'bibliaLoader.ts deve conter Fase 3: Síntese e Conclusão'
);
assert.ok(
  bibliaLoaderContent.includes('Mapeamento de Concessões') &&
  bibliaLoaderContent.includes('Isolamento da Fricção') &&
  bibliaLoaderContent.includes('Veredito Condicional'),
  'bibliaLoader.ts deve conter os requisitos da Fase 3 (Mapeamento de Concessões, Isolamento da Fricção, Veredito Condicional)'
);
console.log('[bibliaLoader.ts] Injeção das 3 Fases e 9 sub-regras no System Prompt: ✅');

// 2. Validar openrouter.ts
const openrouterPath = path.resolve('src/lib/ai/openrouter.ts');
const openrouterContent = fs.readFileSync(openrouterPath, 'utf8');

assert.ok(
  openrouterContent.includes('Fase 1: Inicialização e Posicionamento') &&
  openrouterContent.includes('Fase 2: Avaliação e Refutação Contínua') &&
  openrouterContent.includes('Fase 3: Síntese e Conclusão'),
  'openrouter.ts deve estruturar o system prompt com as 3 fases de argumentação'
);

assert.ok(
  openrouterContent.includes('Dissecação Lógica') &&
  openrouterContent.includes('Mapeamento de Concessões') &&
  openrouterContent.includes('Veredito Condicional'),
  'openrouter.ts deve incorporar as diretrizes específicas de dissecação lógica, concessões e veredito condicional'
);

console.log('[openrouter.ts] Estrutura das 3 Fases no prompt de sistema e turnos: ✅');

// 3. Validar AddSpecialistModal.tsx
const addSpecialistPath = path.resolve('src/components/AddSpecialistModal.tsx');
const addSpecialistContent = fs.readFileSync(addSpecialistPath, 'utf8');

assert.ok(
  addSpecialistContent.includes('Fase 1: Inicialização e Posicionamento') ||
  addSpecialistContent.includes('Três Fases Lógicas de Argumentação'),
  'AddSpecialistModal.tsx deve incorporar o protocolo das 3 fases no systemPrompt dos novos especialistas'
);
console.log('[AddSpecialistModal.tsx] Protocolo das 3 Fases no criador de especialistas: ✅');

console.log('🎉 Todos os testes de especificação do protocolo de 3 fases foram validados!');
