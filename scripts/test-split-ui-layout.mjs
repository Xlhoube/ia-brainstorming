import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando teste do layout dividido (Split UI: Especialistas de um lado e Diálogo do outro)...');

const pageFile = path.resolve('src/app/page.tsx');
const rosterFile = path.resolve('src/components/AgentRoster.tsx');
const timelineFile = path.resolve('src/components/DebateTimeline.tsx');

let passed = true;

// 1. Verificar ficheiros existem
for (const [name, file] of [['page.tsx', pageFile], ['AgentRoster.tsx', rosterFile], ['DebateTimeline.tsx', timelineFile]]) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Ficheiro ${name} não encontrado em ${file}`);
    passed = false;
  }
}

if (!passed) process.exit(1);

const pageContent = fs.readFileSync(pageFile, 'utf-8');
const rosterContent = fs.readFileSync(rosterFile, 'utf-8');

// 2. Verificar estrutura de split em page.tsx
const hasAside = pageContent.includes('<aside') && pageContent.includes('</aside>');
const hasMain = pageContent.includes('<main') && pageContent.includes('</main>');
const hasFlexSplit = pageContent.includes('md:flex-row') || pageContent.includes('lg:flex-row');

console.log(`[page.tsx] Contém tag semântica <aside> para especialistas: ${hasAside ? '✅' : '❌'}`);
console.log(`[page.tsx] Contém tag semântica <main> para diálogo: ${hasMain ? '✅' : '❌'}`);
console.log(`[page.tsx] Contém classe flexível responsiva (md:flex-row): ${hasFlexSplit ? '✅' : '❌'}`);

if (!hasAside || !hasMain || !hasFlexSplit) {
  console.error('❌ Falha na estrutura do layout dividido em page.tsx');
  passed = false;
}

// 3. Verificar que AgentRoster está no aside e DebateTimeline no main
const asideRegex = /<aside[\s\S]*?>([\s\S]*?)<\/aside>/;
const mainRegex = /<main[\s\S]*?>([\s\S]*?)<\/main>/;

const asideMatch = pageContent.match(asideRegex);
const mainMatch = pageContent.match(mainRegex);

const rosterInAside = asideMatch && asideMatch[1].includes('<AgentRoster');
const timelineInMain = mainMatch && mainMatch[1].includes('<DebateTimeline');

console.log(`[page.tsx] AgentRoster está dentro de <aside>: ${rosterInAside ? '✅' : '❌'}`);
console.log(`[page.tsx] DebateTimeline está dentro de <main>: ${timelineInMain ? '✅' : '❌'}`);

if (!rosterInAside || !timelineInMain) {
  console.error('❌ AgentRoster deve estar em <aside> e DebateTimeline em <main>');
  passed = false;
}

// 4. Verificar suporte vertical em AgentRoster no desktop
const hasVerticalSupport = rosterContent.includes('md:flex-col') || rosterContent.includes('flex flex-col');
console.log(`[AgentRoster.tsx] Suporte a disposição vertical na barra lateral: ${hasVerticalSupport ? '✅' : '❌'}`);

if (!hasVerticalSupport) {
  console.error('❌ AgentRoster deve suportar disposição vertical para modo lateral');
  passed = false;
}

if (passed) {
  console.log('✅ Todos os critérios do layout dividido (Split UI) validados com sucesso!');
  process.exit(0);
} else {
  console.log('❌ O teste falhou. Corrige os pontos assinalados.');
  process.exit(1);
}
