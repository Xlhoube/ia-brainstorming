# MEMORY.md | IA Brain Storming - Diálogo & Debate Multi-Agente IA

## 📌 Contexto Atual do Projeto
- **Nome:** IA Brain Storming
- **Objetivo:** Plataforma web interativa de diálogo, debate e confronto dialético entre agentes de Inteligência Artificial para analisar temas complexos, teorias, dilemas éticos, problemas e soluções globais.
- **Versão:** v0.3.0
- **Data da Última Atualização:** 2026-10-18
- **Nível de Risco:** 1 (Lazer / Exploração criativa)
- **Ritmo:** Desenvolvimento sólido (arquitetura robusta e modular)
- **Ambiente de Execução e Deploy:** Web Browser (Desktop e Telemóvel responsivo) / Vercel
- **Stack:**
  - **Frontend / Fullstack:** Next.js 16 (App Router, Turbopack, TypeScript, React 19) + Tailwind CSS v4.
  - **Camada de Inferência de IA:** OpenRouter API com suporte a múltiplos modelos (Claude 3.5 Sonnet, GPT-4o, DeepSeek V3, Llama 3.3 70B, Gemini 2.0 Flash) e fallback de simulação dialética de alta fidelidade.
  - **Síntese de Voz (TTS):** Web Speech Synthesis nativo do browser com perfis acústicos e timbres individualizados por agente (tom, cadência e dicção diferenciados).
  - **Persistência / Base de Dados:** Base de dados local (*Local-First* via `LocalDatabase`), com gravação automática de debates, contagem de rondas, intervenções e recuperação instantânea através de modal dedicado.
  - **Interface / Experiência do Utilizador:** Dark Mode imersivo estilo "Arena de Pensamento / Mesa Redonda", botões de ouvir intervenção individualmente, alternador de áudio global, avatares com badges dinâmicos, animação de ondas sonoras no orador ativo, intervenção humana em direto e relatório executivo estruturado.
  - **Idioma de Comunicação e UI:** Português de Portugal (PT-PT).

---

## 🛠️ Decisões Arquiteturais Registadas (ADRs)
- **[2026-10-18] ADR-001:** Escolha do OpenRouter como motor inicial pela flexibilidade de contrastar modelos rivais (OpenAI vs Anthropic vs Meta vs DeepSeek vs Google) com a mesma interface unificada, mantendo a camada de comunicação modular para futuras expansões (Groq/Ollama/Google).
- **[2026-10-18] ADR-002:** Interface desenhada no paradigma "Local-First" e responsiva para browser e telemóvel, com streaming de respostas e persistência da chave de API no LocalStorage do utilizador.
- **[2026-10-18] ADR-003:** Inclusão de motor dialético de simulação de alta qualidade para assegurar que a plataforma é 100% testável e demonstrável de imediato, mesmo antes de o utilizador introduzir a sua chave OpenRouter.
- **[2026-10-18] ADR-004:** Adoção de Web Speech Synthesis nativa para TTS em vez de servidores Python pesados (como OmniVoice), garantindo latência zero, consumo nulo de GPU e vozes personalizadas com afinação acústica individual para cada um dos 5 agentes.
- **[2026-10-18] ADR-005:** Implementação de base de dados local (`LocalDatabase`) para arquivo automático das sessões de debate, histórico e sínteses com carregamento instantâneo.

---

## ✅ O Que Já Funciona (v0.3.0)
- [x] Síntese de voz TTS nativa com perfis auditivos calibrados para os 5 agentes:
  - *Dr. Marcus Vance:* Tom grave e solene (pitch 0.85, rate 0.92)
  - *Dra. Helena Rostova:* Tom focado e cirúrgico (pitch 1.05, rate 1.05)
  - *Aura Chen:* Tom caloroso e empático (pitch 1.18, rate 0.96)
  - *Kaelen Voss:* Tom rápido e aceleracionista (pitch 0.95, rate 1.15)
  - *Sophia Veris:* Tom claro, equilibrado e neutro (pitch 1.0, rate 1.0)
- [x] Controlo global de áudio na Navbar (alternador Voz Ligada / Mudo com animação de ondas sonoras).
- [x] Botão de altifalante em cada intervenção individual para ouvir novamente o orador.
- [x] Base de dados local (`LocalDatabase`) com persistência automática de todas as mensagens e debates.
- [x] Modal de Histórico de Debates com indicação de data, total de mensagens, presença de síntese e botão para carregar ou apagar sessões passadas.
- [x] Mesa redonda de 5 agentes pré-configurados com modelos de IA de topo.
- [x] Orquestração fluida de turnos e rondas com controlos de Iniciar, Pausar, Retomar e Próximo Turno.
- [x] Intervenção humana no debate em tempo real.
- [x] Catálogo e modal de seleção de temas de debate e criação de tópicos personalizados.
- [x] Modal de configurações de IA para chave OpenRouter.
- [x] Módulo de síntese executiva com relatório estruturado em JSON e exportação em Markdown.
- [x] Testes de integração de ponta a ponta validados pelo subagente `browser`.

---

## ⏳ Open Issues / Próximos Passos
- [ ] Exportação em PDF do relatório analítico e conclusões da arena.
- [ ] Conector opcional com Appwrite Cloud para sincronização em múltiplos dispositivos.
