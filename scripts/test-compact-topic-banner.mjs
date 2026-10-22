import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando teste de compactação do banner do tema ativo...');

const timelineFile = path.resolve('src/components/DebateTimeline.tsx');
if (!fs.existsSync(timelineFile)) {
  console.error('❌ Ficheiro DebateTimeline.tsx não encontrado');
  process.exit(1);
}

const content = fs.readFileSync(timelineFile, 'utf-8');

// Verificar que o título do tema usa classes compactas e não os tamanhos gigantes anteriores
const hasCompactHeading = content.includes('text-xs sm:text-sm') || content.includes('text-sm');
const hasOversizedHeading = content.includes('text-base sm:text-lg lg:text-xl');
const hasCompactPadding = content.includes('py-2') || content.includes('py-2.5');

console.log(`[DebateTimeline.tsx] Título do tema compactado: ${hasCompactHeading ? '✅' : '❌'}`);
console.log(`[DebateTimeline.tsx] Ausência de títulos gigantescos: ${!hasOversizedHeading ? '✅' : '❌'}`);
console.log(`[DebateTimeline.tsx] Espaçamento vertical reduzido (py-2 / py-2.5): ${hasCompactPadding ? '✅' : '❌'}`);

if (hasCompactHeading && !hasOversizedHeading && hasCompactPadding) {
  console.log('✅ Banner do tema devidamente compactado!');
  process.exit(0);
} else {
  console.error('❌ Banner ainda não cumpre os requisitos de compactação.');
  process.exit(1);
}
