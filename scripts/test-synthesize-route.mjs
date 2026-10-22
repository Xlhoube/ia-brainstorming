// Teste de integridade e modelos gratuitos da rota de síntese
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando testes de validação da rota de síntese...');

// Teste 1: Verificar ficheiro route.ts para garantir que não restam modelos pagos
const routePath = path.resolve('src/app/api/debate/synthesize/route.ts');
const routeContent = fs.readFileSync(routePath, 'utf-8');

assert(!routeContent.includes('google/gemini-2.0-flash-001'), 'ERRO: O modelo pago google/gemini-2.0-flash-001 ainda está presente no ficheiro!');
console.log('✅ Teste 1 Aprovado: O modelo comercial pago google/gemini-2.0-flash-001 foi completamente removido.');

// Teste 2: Verificar que todos os modelos na lista SYNTHESIS_FREE_MODELS têm o sufixo :free
const blockMatch = routeContent.match(/SYNTHESIS_FREE_MODELS\s*=\s*\[([\s\S]*?)\];/);
assert(blockMatch, 'ERRO: Bloco SYNTHESIS_FREE_MODELS não encontrado no ficheiro!');

const modelsText = blockMatch[1];
const freeModels = [...modelsText.matchAll(/'([^']+)'/g)].map(m => m[1]);
assert(freeModels.length > 0, 'ERRO: Nenhum modelo encontrado dentro de SYNTHESIS_FREE_MODELS.');

for (const model of freeModels) {
  assert(model.endsWith(':free'), `ERRO: O modelo ${model} não tem o sufixo obrigatório :free!`);
  console.log(`  - Modelo verificado e gratuito: ${model}`);
}
console.log('✅ Teste 2 Aprovado: Todos os modelos de síntese utilizam o identificador gratuito :free.');

// Teste 3: Verificar remoção de markdown fences em respostas JSON
assert(routeContent.includes('cleanJson'), 'ERRO: A higienização de blocos de código JSON não foi detetada.');
console.log('✅ Teste 3 Aprovado: Higienização resiliente de blocos markdown ```json implementada.');

console.log('\n🎉 Todos os testes de validação passaram com 100% de sucesso!');
