# MEMORY.md | IA Brain Storming - Diálogo & Debate Multi-Agente IA

## 📌 Contexto Atual do Projeto
- **Nome:** IA Brain Storming
- **Objetivo:** Plataforma web interativa de diálogo, debate e confronto dialético entre agentes de Inteligência Artificial para analisar temas complexos, teorias, dilemas éticos, problemas e soluções globais.
- **Versão:** v0.2.0
- **Data da Última Atualização:** 2026-10-18
- **Nível de Risco:** 1 (Lazer / Exploração criativa)
- **Ritmo:** Desenvolvimento sólido (arquitetura robusta e modular)
- **Ambiente de Execução e Deploy:** Web Browser (Desktop e Telemóvel responsivo) / Vercel
- **Stack:**
  - **Frontend / Fullstack:** Next.js 16 (App Router, Turbopack, TypeScript, React 19) + Tailwind CSS v4.
  - **Camada de Inferência de IA:** OpenRouter API com suporte a múltiplos modelos (Claude 3.5 Sonnet, GPT-4o, DeepSeek V3, Llama 3.3 70B, Gemini 2.0 Flash) e fallback de simulação dialética de alta fidelidade.
  - **Interface / Experiência do Utilizador:** Dark Mode imersivo estilo "Arena de Pensamento / Mesa Redonda", avatares com badges dinâmicos, animação de ondas sonoras no orador ativo, intervenção humana em direto e relatório executivo estruturado.
  - **Idioma de Comunicação e UI:** Português de Portugal (PT-PT).

---

## 🛠️ Decisões Arquiteturais Registadas (ADRs)
- **[2026-10-18] ADR-001:** Escolha do OpenRouter como motor inicial pela flexibilidade de contrastar modelos rivais (OpenAI vs Anthropic vs Meta vs DeepSeek vs Google) com a mesma interface unificada, mantendo a camada de comunicação modular para futuras expansões (Groq/Ollama/Google).
- **[2026-10-18] ADR-002:** Interface desenhada no paradigma "Local-First" e responsiva para browser e telemóvel, com streaming de respostas e persistência da chave de API no LocalStorage do utilizador.
- **[2026-10-18] ADR-003:** Inclusão de motor dialético de simulação de alta qualidade para assegurar que a plataforma é 100% testável e demonstrável de imediato, mesmo antes de o utilizador introduzir a sua chave OpenRouter.

---

## ✅ O Que Já Funciona (v0.2.0)
- [x] Inicialização limpa da arquitetura Next.js 16 com TypeScript, Tailwind CSS e Turbopack.
- [x] Mesa redonda de 5 agentes pré-configurados com personalidades e modelos distintos:
  - *Dr. Marcus Vance* (Filósofo Cético - Claude 3.5 Sonnet)
  - *Dra. Helena Rostova* (Cientista Empírica - DeepSeek V3)
  - *Aura Chen* (Humanista & Bioética - GPT-4o)
  - *Kaelen Voss* (Tecnólogo Aceleracionista - Llama 3.3 70B)
  - *Sophia Veris* (Moderadora & Sintetizadora - Gemini 2.0 Flash)
- [x] Orquestração fluida de turnos e rondas com controlos de Iniciar, Pausar, Retomar e Próximo Turno.
- [x] Indicador visual do orador ativo com animação de ondas sonoras e realce luminoso.
- [x] Intervenção humana no debate em tempo real: o utilizador pode introduzir questões ou contra-argumentos a qualquer momento.
- [x] Catálogo e modal de seleção de dilemas existenciais e filosóficos, além de criação de temas personalizados.
- [x] Modal de configurações de IA para introdução e salvaguarda segura da chave OpenRouter.
- [x] Módulo de síntese executiva (`/api/debate/synthesize`) com geração de Tese Central, Pontos de Consenso, Divergências Críticas, Questões em Aberto e exportação direta em Markdown.
- [x] Validação e teste funcional de integração de ponta a ponta com subagente de navegação no browser.

---

## ⏳ Open Issues / Próximos Passos
- [ ] Adicionar suporte a áudio / Text-to-Speech (TTS) com timbres de voz distintos para cada agente.
- [ ] Persistência de histórico de sessões e debates no LocalStorage ou base de dados Appwrite.
- [ ] Exportação em PDF do relatório analítico e conclusões da arena.
