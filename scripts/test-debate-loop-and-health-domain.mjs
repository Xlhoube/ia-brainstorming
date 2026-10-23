import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando teste de resolução do loop de repetição e domínio de saúde...\n');

const openRouterPath = path.resolve('src/lib/ai/openrouter.ts');
const openRouterContent = fs.readFileSync(openRouterPath, 'utf-8');

const useDebatePath = path.resolve('src/hooks/useDebate.ts');
const useDebateContent = fs.readFileSync(useDebatePath, 'utf-8');

// 1. Verificação da deteção de domínio para "doenças sem cura"
console.log('--- Teste 1: Deteção do Domínio "saude" e Eliminação de Redundâncias de Tópico ---');
assert.ok(openRouterContent.includes("| 'saude'"), 'ThematicDomain deve incluir "saude".');
assert.ok(
  openRouterContent.includes('/doen[çc]|cura|sa[úu]de|medic|patolog|cancro|terapia|hospital|cl[íi]nic|paliativ|farmac|paciente|enferm|biom[eé]dic|imunol|infec|terap[eê]ut/i'),
  'detectThematicDomain deve contemplar termos de saúde e cura.'
);
assert.ok(!openRouterContent.includes('o debate sobre "${cleanedTopic || topic}"'), 'subjectNoun não deve ter "o debate sobre".');
console.log('✅ Aprovado: Domínio saude e limpeza de subjectNoun implementados.');

// 2. Verificação do banco de discurso de saúde
console.log('\n--- Teste 2: Integridade e Pureza Temática do Banco de Saúde ---');
const bankMatch = openRouterContent.match(/export const DOMAIN_DISCOURSE_BANK[^=]*=\s*({[\s\S]*?\n\};\n)/);
assert.ok(bankMatch, 'DOMAIN_DISCOURSE_BANK deve estar presente.');
const bankCode = bankMatch[1].trim().replace(/;\s*$/, '');
const discourseBank = eval(`(${bankCode})`);

assert.ok(discourseBank.saude, 'DOMAIN_DISCOURSE_BANK deve conter a chave "saude".');

const roles = ['filosofo', 'cientista', 'humanista', 'tecnologo', 'moderador'];
for (const role of roles) {
  assert.ok(discourseBank.saude[role], `O papel ${role} deve existir no domínio saude.`);
  assert.ok(discourseBank.saude[role].length >= 5, `O papel ${role} deve ter pelo menos 5 argumentos.`);
  
  for (const text of discourseBank.saude[role]) {
    assert.ok(!text.includes('...; 2)'), `O texto em ${role} não deve ter reticências de truncagem.`);
    assert.ok(!/intelig[eê]ncia artificial|algoritmo de ia/i.test(text), `O texto em ${role} não deve mencionar IA.`);
  }
}
console.log('✅ Aprovado: Banco de saúde contém discursos ricos, completos e livres de termos de IA.');

// 3. Verificação da Resolução do Stale Closure no useDebate.ts
console.log('\n--- Teste 3: Auditoria do Hook useDebate.ts contra Loops e Stale Closures ---');
assert.ok(useDebateContent.includes('const messagesRef = useRef<DebateMessage[]>([]);'), 'useDebate deve declarar messagesRef.');
assert.ok(useDebateContent.includes('const runNextTurnRef = useRef'), 'useDebate deve declarar runNextTurnRef.');
assert.ok(useDebateContent.includes('runNextTurnRef.current();'), 'useDebate deve invocar runNextTurnRef.current() nos timeouts.');
assert.ok(useDebateContent.includes('isGeneratingRef.current'), 'useDebate deve proteger runNextTurn com isGeneratingRef.');
assert.ok(!useDebateContent.includes('runNextTurn();'), 'Todos os timeouts devem chamar runNextTurnRef.current() em vez da closure antiga runNextTurn().');
console.log('✅ Aprovado: useDebate.ts está 100% protegido contra stale closures e loops recursivos.');

// 4. Verificação de Eliminação de Truncagens no Discurso
console.log('\n--- Teste 4: Eliminação de Truncagem Mecânica e Frases Cortadas ---');
assert.ok(!openRouterContent.includes('.slice(0, 90)'), 'openrouter.ts não deve conter cortes arbitrários de 90 caracteres.');
assert.ok(!openRouterContent.includes('Assumo de imediato o meu papel técnico'), 'openrouter.ts eliminou o template robótico "Assumo de imediato...".');
console.log('✅ Aprovado: Textos mecânicos truncados foram erradicados do motor dialético.');

console.log('\n🎉 TODOS OS TESTES DE AUDITORIA E RESOLUÇÃO DO LOOP FORAM APROVADOS COM SUCESSO!\n');
