import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando teste de remoção do botão de API Conectada...');

const navbarPath = path.resolve('src/components/Navbar.tsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');

assert.ok(!navbarContent.includes('API Conectada'), 'Navbar não deve conter o texto "API Conectada"');
assert.ok(!navbarContent.includes('Ligar OpenRouter'), 'Navbar não deve conter o texto "Ligar OpenRouter"');
assert.ok(!navbarContent.includes('Configuração de Motores & OpenRouter'), 'Navbar não deve conter tooltip de configuração de API');

console.log('[Navbar.tsx] Botão de API Conectada devidamente removido: ✅');
console.log('✅ Teste de remoção concluído com sucesso!');
