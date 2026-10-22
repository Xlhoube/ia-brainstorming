import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando teste da funcionalidade de Adicionar Novos Especialistas...');

const localDbFile = path.resolve('src/lib/db/localDatabase.ts');
const addModalFile = path.resolve('src/components/AddSpecialistModal.tsx');
const rosterFile = path.resolve('src/components/AgentRoster.tsx');
const useDebateFile = path.resolve('src/hooks/useDebate.ts');

let passed = true;

// 1. Verificar ficheiros
for (const [name, file] of [
  ['localDatabase.ts', localDbFile],
  ['AgentRoster.tsx', rosterFile],
  ['useDebate.ts', useDebateFile]
]) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Ficheiro ${name} não encontrado em ${file}`);
    passed = false;
  }
}

if (!passed) process.exit(1);

const localDbContent = fs.readFileSync(localDbFile, 'utf-8');
const rosterContent = fs.readFileSync(rosterFile, 'utf-8');
const useDebateContent = fs.readFileSync(useDebateFile, 'utf-8');

// 2. Verificar métodos no LocalDatabase
const hasGetCustom = localDbContent.includes('getCustomAgents');
const hasSaveCustom = localDbContent.includes('saveCustomAgent');
const hasDeleteCustom = localDbContent.includes('deleteCustomAgent');

console.log(`[localDatabase.ts] Método getCustomAgents: ${hasGetCustom ? '✅' : '❌'}`);
console.log(`[localDatabase.ts] Método saveCustomAgent: ${hasSaveCustom ? '✅' : '❌'}`);
console.log(`[localDatabase.ts] Método deleteCustomAgent: ${hasDeleteCustom ? '✅' : '❌'}`);

if (!hasGetCustom || !hasSaveCustom || !hasDeleteCustom) {
  passed = false;
}

// 3. Verificar AddSpecialistModal.tsx
if (!fs.existsSync(addModalFile)) {
  console.log('[AddSpecialistModal.tsx] Ficheiro do modal: ❌ (Ainda não criado)');
  passed = false;
} else {
  const modalContent = fs.readFileSync(addModalFile, 'utf-8');
  const hasForm = modalContent.includes('<form') || modalContent.includes('onSubmit');
  const hasPresets = modalContent.includes('template') || modalContent.includes('preset') || modalContent.includes('Predefiniç');
  console.log(`[AddSpecialistModal.tsx] Formulário de criação estruturado: ${hasForm ? '✅' : '❌'}`);
  console.log(`[AddSpecialistModal.tsx] Modelos rápidos/predefinições: ${hasPresets ? '✅' : '❌'}`);
  if (!hasForm || !hasPresets) passed = false;
}

// 4. Verificar useDebate.ts
const hasAddHook = useDebateContent.includes('addCustomAgent');
const hasDeleteHook = useDebateContent.includes('deleteCustomAgent');
console.log(`[useDebate.ts] Função addCustomAgent: ${hasAddHook ? '✅' : '❌'}`);
console.log(`[useDebate.ts] Função deleteCustomAgent: ${hasDeleteHook ? '✅' : '❌'}`);

if (!hasAddHook || !hasDeleteHook) passed = false;

// 5. Verificar gatilho em AgentRoster.tsx
const hasTrigger = rosterContent.includes('onOpenAddSpecialist') || rosterContent.includes('AddSpecialist') || rosterContent.includes('Novo Especialista') || rosterContent.includes('setShowAddModal');
console.log(`[AgentRoster.tsx] Gatilho para adicionar novo especialista: ${hasTrigger ? '✅' : '❌'}`);

if (!hasTrigger) passed = false;

if (passed) {
  console.log('✅ Todos os testes de suporte a Novos Especialistas passaram!');
  process.exit(0);
} else {
  console.log('❌ O teste falhou. Corrige os pontos assinalados.');
  process.exit(1);
}
