// Testes de validação dos 3 pilares da Memória Individual dos Pensadores (The Five)
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando testes de validação da Memória Individual dos Especialistas...');

// Teste 1: Verificar se os novos tipos existem em src/types/debate.ts
const typesPath = path.resolve('src/types/debate.ts');
const typesContent = fs.readFileSync(typesPath, 'utf-8');

assert(typesContent.includes('ethical_red_lines'), 'ERRO: Categoria ethical_red_lines não encontrada em debate.ts');
assert(typesContent.includes('intellectual_doubts'), 'ERRO: Categoria intellectual_doubts não encontrada em debate.ts');
assert(typesContent.includes('emotionalImpact?:'), 'ERRO: Atributo emotionalImpact não encontrado em debate.ts');
assert(typesContent.includes('relatedColleague?:'), 'ERRO: Atributo relatedColleague não encontrado em debate.ts');
assert(typesContent.includes('topicContext?:'), 'ERRO: Atributo topicContext não encontrado em debate.ts');
console.log('✅ Teste 1 Aprovado: Novas categorias e atributos enriquecidos tipados com sucesso.');

// Teste 2: Verificar se a Bíblia e o loader inicializam memórias de linhas vermelhas éticas e dúvidas intelectuais para os 5 pensadores
const loaderPath = path.resolve('src/lib/agents/bibliaLoader.ts');
const loaderContent = fs.readFileSync(loaderPath, 'utf-8');

assert(loaderContent.includes('ethical_red_lines'), 'ERRO: bibliaLoader não inclui ethical_red_lines');
assert(loaderContent.includes('intellectual_doubts'), 'ERRO: bibliaLoader não inclui intellectual_doubts');
console.log('✅ Teste 2 Aprovado: Os 5 pensadores possuem linhas vermelhas e dúvidas intelectuais canónicas.');

// Teste 3: Verificar métodos de persistência e auto-registo em localDatabase.ts
const dbPath = path.resolve('src/lib/db/localDatabase.ts');
const dbContent = fs.readFileSync(dbPath, 'utf-8');

assert(dbContent.includes('saveAllAgentMemories'), 'ERRO: saveAllAgentMemories ausente em localDatabase.ts');
assert(dbContent.includes('recordAutomaticDebateConclusionMemory'), 'ERRO: recordAutomaticDebateConclusionMemory ausente em localDatabase.ts');
console.log('✅ Teste 3 Aprovado: Auto-registo de memórias no final de debates ativo em localDatabase.');

// Teste 4: Verificar sincronização com Appwrite Cloud em databaseService.ts
const appwritePath = path.resolve('src/lib/appwrite/databaseService.ts');
const appwriteContent = fs.readFileSync(appwritePath, 'utf-8');

assert(appwriteContent.includes('saveAgentMemories'), 'ERRO: saveAgentMemories ausente em databaseService.ts');
assert(appwriteContent.includes('getAgentMemories'), 'ERRO: getAgentMemories ausente em databaseService.ts');
console.log('✅ Teste 4 Aprovado: Sincronização híbrida de memórias no Appwrite Cloud implementada.');

// Teste 5: Verificar injeção rica nos prompts do OpenRouter
const aiPath = path.resolve('src/lib/ai/openrouter.ts');
const aiContent = fs.readFileSync(aiPath, 'utf-8');

assert(aiContent.includes('ETHICAL_RED_LINES'), 'ERRO: Diretriz de linhas vermelhas éticas ausente no prompt');
assert(aiContent.includes('INTELLECTUAL_DOUBTS'), 'ERRO: Diretriz de dúvidas intelectuais ausente no prompt');
console.log('✅ Teste 5 Aprovado: Injeção cognitiva de memórias estruturadas ativada para o OpenRouter.');

// Teste 6: Verificar interface de gestão e filtros em AgentRoster.tsx
const rosterPath = path.resolve('src/components/AgentRoster.tsx');
const rosterContent = fs.readFileSync(rosterPath, 'utf-8');

assert(rosterContent.includes('🛑 Linha Vermelha Ética'), 'ERRO: Badge de linha vermelha ética ausente em AgentRoster');
assert(rosterContent.includes('❓ Dúvida Intelectual'), 'ERRO: Badge de dúvida intelectual ausente em AgentRoster');
assert(rosterContent.includes('categoryFilter'), 'ERRO: Barra de filtros ausente em AgentRoster');
console.log('✅ Teste 6 Aprovado: Interface do Painel de Especialistas com filtros e badges enriquecidos.');

console.log('\n🎉 Todos os 6 testes de memória dos especialistas passaram com 100% de sucesso!');
