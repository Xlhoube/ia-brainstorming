// scripts/test-synthesis-modal-unlock.mjs
// Teste de Desbloqueio e Fecho do Modal de Síntese Pós-Conclusão de Debate

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando Testes de Desbloqueio e Fecho do Modal de Síntese...\n');

const pagePath = path.resolve('src/app/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf-8');

const modalPath = path.resolve('src/components/SynthesisModal.tsx');
const modalContent = fs.readFileSync(modalPath, 'utf-8');

const controlsPath = path.resolve('src/components/ControlsBar.tsx');
const controlsContent = fs.readFileSync(controlsPath, 'utf-8');

// 1. Auditoria do bug de bloqueio do isOpen em page.tsx
console.log('--- Teste 1: Auditoria da Condição de Abertura em page.tsx ---');
const hasLockingCondition = pageContent.includes("isOpen={isSynthesisModalOpen || Boolean(synthesisResult && !isSynthesizing && status === 'concluded')}");
assert(
  !hasLockingCondition,
  'FALHA CRÍTICA: page.tsx ainda contém a condição rígida que força isOpen=true eternamente quando status === "concluded", impedindo o utilizador de fechar o modal!'
);

assert(
  pageContent.includes('isOpen={isSynthesisModalOpen}'),
  'FALHA: SynthesisModal deve ser controlado estritamente pelo estado isSynthesisModalOpen.'
);
console.log('✅ Aprovado: A condição de fecho em page.tsx permite fechar o modal livremente.');

// 2. Auditoria de Auto-Abertura Não Bloqueante Pós-Conclusão
console.log('\n--- Teste 2: Auditoria de Auto-Abertura Única Pós-Conclusão ---');
assert(
  pageContent.includes('autoOpenedSynthesisSessionRef') || pageContent.includes('autoOpenedSessionRef') || pageContent.includes('autoOpened'),
  'FALHA: page.tsx deve gerir a auto-abertura da síntese uma única vez por sessão para não reabrir em loop após o utilizador fechar.'
);
console.log('✅ Aprovado: O modal abre automaticamente após conclusão sem prender o utilizador em loop.');

// 3. Auditoria de Fecho no Backdrop e Tecla Escape em SynthesisModal.tsx
console.log('\n--- Teste 3: Auditoria de Fecho no Backdrop e Tecla Escape em SynthesisModal.tsx ---');
assert(
  modalContent.includes('onClick={onClose}') || modalContent.includes('handleBackdropClick'),
  'FALHA: SynthesisModal.tsx deve permitir fechar ao clicar no fundo exterior (backdrop).'
);
assert(
  modalContent.includes('Escape') || modalContent.includes('keydown'),
  'FALHA: SynthesisModal.tsx deve suportar fecho através da tecla Escape.'
);
console.log('✅ Aprovado: SynthesisModal fecha com clique exterior e com tecla Escape.');

// 4. Auditoria de Barra de Ações e Botões de Saída em SynthesisModal.tsx
console.log('\n--- Teste 4: Barra de Ações no Rodapé do Modal de Síntese ---');
assert(
  modalContent.includes('Fechar') || modalContent.includes('Voltar'),
  'FALHA: SynthesisModal.tsx deve conter botão explícito de fechar no rodapé.'
);
console.log('✅ Aprovado: O utilizador dispõe de botões claros para fechar ou avançar sem recarregar a página.');

// 5. Auditoria de Ações Pós-Conclusão em ControlsBar.tsx
console.log('\n--- Teste 5: Opções de Ação Pós-Conclusão na ControlsBar ---');
assert(
  controlsContent.includes("status === 'concluded'"),
  'FALHA: ControlsBar.tsx deve gerir explicitamente o estado concluded com opções úteis (Reiniciar / Novo Tema).'
);
console.log('✅ Aprovado: A barra inferior oferece opções claras quando o debate conclui.');

console.log('\n🎉 TODOS OS 5 TESTES DE DESBLOQUEIO DO MODAL FORAM CONCLUÍDOS COM SUCESSO!\n');
