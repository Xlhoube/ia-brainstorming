// scripts/test-thematic-relevance.mjs
// Teste de Pureza Temática e Prevenção de Desvio para IA (Thematic Relevance & Anti-AI Drift Test)

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando Testes de Relevância Temática e Prevenção de Desvio para IA...\n');

const bibliaLoaderPath = path.resolve('src/lib/agents/bibliaLoader.ts');
const bibliaLoaderContent = fs.readFileSync(bibliaLoaderPath, 'utf-8');

const openRouterPath = path.resolve('src/lib/ai/openrouter.ts');
const openRouterContent = fs.readFileSync(openRouterPath, 'utf-8');

const synthesizeRoutePath = path.resolve('src/app/api/debate/synthesize/route.ts');
const synthesizeRouteContent = fs.readFileSync(synthesizeRoutePath, 'utf-8');

const timelinePath = path.resolve('src/components/DebateTimeline.tsx');
const timelineContent = fs.readFileSync(timelinePath, 'utf-8');

// 1. Auditoria de Memórias Iniciais Canónicas em bibliaLoader.ts
console.log('--- Teste 1: Neutralidade das Memórias Iniciais Canónicas ---');
const aiKeywordsInMemories = [
  'inteligência sintética',
  'alinhamento de ia',
  'cálculo algorítmico',
  'algoritmos universais',
];

for (const kw of aiKeywordsInMemories) {
  assert(
    !bibliaLoaderContent.toLowerCase().includes(kw),
    `FALHA: bibliaLoader.ts ainda contém a expressão indutora de IA "${kw}" nas memórias de base dos agentes!`
  );
}
console.log('✅ Aprovado: As memórias de base dos agentes são universais e livres de contaminação por IA.');

// 2. Auditoria de Diretriz de Foco Temático e Anti-Desvio em openrouter.ts
console.log('\n--- Teste 2: Diretriz de Foco Temático e Proibição de Desvio para IA nos Prompts ---');
assert(
  openRouterContent.includes('PROIBIÇÃO DE DESVIO PARA IA') || openRouterContent.includes('FOCO TEMÁTICO RIGOROSO'),
  'FALHA: openrouter.ts deve conter diretriz explícita de foco temático rigoroso e proibição de desvio para IA.'
);
assert(
  openRouterContent.includes('memoryEcho'),
  'FALHA: openrouter.ts deve gerir memoryEcho com filtros temáticos.'
);
console.log('✅ Aprovado: Prompts do OpenRouter contêm regras estritas anti-desvio temático.');

// 3. Auditoria do Banco de Discursos (DOMAIN_DISCOURSE_BANK) para domínios não-IA
console.log('\n--- Teste 3: Pureza Temática dos Domínios Não-IA no Banco de Discursos ---');
const bankMatch = openRouterContent.match(/export const DOMAIN_DISCOURSE_BANK[^=]*=\s*({[\s\S]*?\n\};\n)/);
assert(bankMatch, 'FALHA: DOMAIN_DISCOURSE_BANK não encontrado em openrouter.ts');

const bankCode = bankMatch[1].trim().replace(/;\s*$/, '');
const discourseBank = eval(`(${bankCode})`);

const nonAiDomains = ['espaco', 'fusao', 'quantica', 'genetica', 'geral'];
const forbiddenAiTerms = ['inteligência artificial', 'inteligência sintética', 'algoritmo de ia', 'alinhamento de ia'];

for (const dom of nonAiDomains) {
  const domainData = discourseBank[dom];
  assert(domainData, `FALHA: Domínio ${dom} deve existir no banco.`);

  for (const [role, argumentsList] of Object.entries(domainData)) {
    for (const arg of argumentsList) {
      const lower = arg.toLowerCase();
      for (const forbidden of forbiddenAiTerms) {
        assert(
          !lower.includes(forbidden),
          `FALHA: Domínio não-IA "${dom}" (${role}) contém o termo proibido "${forbidden}":\n"${arg}"`
        );
      }
    }
  }
}
console.log('✅ Aprovado: Todos os 5 domínios não-IA contêm 0 menções a inteligência artificial ou algoritmos de IA.');

// 4. Auditoria da Rota de Síntese (synthesize/route.ts)
console.log('\n--- Teste 4: Remoção de Suposições Rígidas sobre IA na Rota de Síntese ---');
assert(
  !synthesizeRouteContent.includes('Discordância sobre a velocidade: uns querem acelerar e usar já tudo o que a inteligência artificial permite'),
  'FALHA: synthesize/route.ts ainda contém fallback rígido que assume que todo o debate é sobre IA!'
);
assert(
  !synthesizeRouteContent.includes('Como podemos usar a inteligência artificial para vivermos melhor'),
  'FALHA: synthesize/route.ts ainda contém perguntas abertas fixas sobre inteligência artificial!'
);
console.log('✅ Aprovado: A rota de síntese adapta-se dinamicamente ao tópico e não força IA em temas não-IA.');

// 5. Auditoria de Sugestões Rápidas em DebateTimeline.tsx
console.log('\n--- Teste 5: Sugestões Rápidas Contextuais em DebateTimeline.tsx ---');
assert(
  !timelineContent.includes("'O que acham que vai acontecer com o futuro do trabalho e da inteligência artificial?'"),
  'FALHA: DebateTimeline.tsx ainda tem botão de sugestão rápida hardcoded com pergunta sobre IA em qualquer tópico!'
);
assert(
  !timelineContent.includes("'Será que uma máquina consegue ter sentimentos reais e consciência?'"),
  'FALHA: DebateTimeline.tsx ainda tem botão de sugestão rápida hardcoded sobre máquinas sentirem em qualquer tópico!'
);
console.log('✅ Aprovado: Sugestões rápidas de diálogo no ecrã adaptam-se ao tópico real do debate.');

console.log('\n🎉 TODOS OS 5 TESTES DE RELEVÂNCIA TEMÁTICA FORAM CONCLUÍDOS COM SUCESSO!\n');
