import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando teste do Protocolo de Retirada por Incompetência Temática...');

// 1. Validar tipos em src/types/debate.ts
const typesPath = path.resolve('src/types/debate.ts');
const typesContent = fs.readFileSync(typesPath, 'utf8');
assert.ok(typesContent.includes('isWithdrawal?: boolean'), 'DebateMessage deve conter isWithdrawal');
assert.ok(typesContent.includes('withdrawalReason?: string'), 'DebateMessage deve conter withdrawalReason');
assert.ok(typesContent.includes('withdrawnAgentIds?: string[]'), 'DebateState deve suportar withdrawnAgentIds');
console.log('[debate.ts] Tipagem de retirada e motivo: ✅');

// 2. Validar Bíblia de Personagens (Regra Epistemológica Compartilhada)
const bibliaPath = path.resolve('the_five_biblia_personagens_v1.json');
const bibliaContent = fs.readFileSync(bibliaPath, 'utf8');
assert.ok(
  bibliaContent.includes('Humildade epistemológica') || bibliaContent.includes('competência temática') || bibliaContent.includes('RETIRO_ME'),
  'Bíblia deve conter regra de humildade epistemológica e retirada'
);
console.log('[the_five_biblia_personagens_v1.json] Regra epistemológica de retirada: ✅');

// 3. Validar openrouter.ts (extração de tag e avaliação de competência)
const openrouterPath = path.resolve('src/lib/ai/openrouter.ts');
const openrouterContent = fs.readFileSync(openrouterPath, 'utf8');
assert.ok(openrouterContent.includes('extractAgentWithdrawal'), 'openrouter.ts deve exportar extractAgentWithdrawal');
assert.ok(openrouterContent.includes('evaluateAgentCompetence'), 'openrouter.ts deve exportar evaluateAgentCompetence');
assert.ok(openrouterContent.includes('RETIRO_ME'), 'openrouter.ts deve conter tag [RETIRO_ME: ...]');
console.log('[openrouter.ts] Funções extractAgentWithdrawal e evaluateAgentCompetence: ✅');

// 4. Validar useDebate.ts
const useDebatePath = path.resolve('src/hooks/useDebate.ts');
const useDebateContent = fs.readFileSync(useDebatePath, 'utf8');
assert.ok(useDebateContent.includes('withdrawnAgentIds'), 'useDebate.ts deve gerir estado de withdrawnAgentIds');
assert.ok(useDebateContent.includes('reinviteAgent'), 'useDebate.ts deve disponibilizar função reinviteAgent');
console.log('[useDebate.ts] Gestão de withdrawnAgentIds e reinviteAgent: ✅');

// 5. Validar DebateTimeline.tsx
const timelinePath = path.resolve('src/components/DebateTimeline.tsx');
const timelineContent = fs.readFileSync(timelinePath, 'utf8');
assert.ok(timelineContent.includes('isWithdrawal'), 'DebateTimeline deve reagir a isWithdrawal');
assert.ok(timelineContent.includes('Retirou-se da Mesa') || timelineContent.includes('Humildade Epistemológica'), 'DebateTimeline deve exibir badge de retirada');
console.log('[DebateTimeline.tsx] Exibição de badge para especialista retirado: ✅');

// 6. Validar AgentRoster.tsx
const rosterPath = path.resolve('src/components/AgentRoster.tsx');
const rosterContent = fs.readFileSync(rosterPath, 'utf8');
assert.ok(rosterContent.includes('withdrawnAgentIds'), 'AgentRoster deve receber withdrawnAgentIds');
console.log('[AgentRoster.tsx] Suporte a visualização de especialistas retirados: ✅');

console.log('✅ Especificação do teste concluída com sucesso!');
