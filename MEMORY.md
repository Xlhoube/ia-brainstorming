# MEMORY.md | IA Brain Storming - Diálogo & Debate Multi-Agente IA

## 📌 Contexto Atual do Projeto
- **Nome:** IA Brain Storming
- **Objetivo:** Plataforma web interativa de diálogo, debate e confronto dialético entre agentes de Inteligência Artificial para analisar temas complexos, teorias, dilemas éticos, problemas e soluções globais.
- **Versão:** v0.4.1
- **Data da Última Atualização:** 2026-10-18
- **Nível de Risco:** 1 (Lazer / Exploração criativa)
- **Ritmo:** Desenvolvimento sólido (arquitetura robusta e modular)
- **Ambiente de Execução e Deploy:** Web Browser (Desktop e Telemóvel responsivo) / Vercel
- **Stack:**
  - **Frontend / Fullstack:** Next.js 16 (App Router, Turbopack, TypeScript, React 19) + Tailwind CSS v4.
  - **Camada de Inferência de IA:** OpenRouter API com suporte a múltiplos modelos (Claude 3.5 Sonnet, GPT-4o, DeepSeek V3, Llama 3.3 70B, Gemini 2.0 Flash) e motor dialético dinâmico sem repetições.
  - **Motor Anti-Repetição por Fases:** Progressão estruturada de argumentos (Abertura -> Confronto Direto -> Casos Práticos -> Convergência e Síntese) que elimina qualquer duplicação de frases ou ideias nas rondas subsequentes.
  - **Controlo de Linguagem & Tom:** Alternador dinâmico entre **Linguagem Simples & Acessível** (sem jargão técnico, com analogias do dia a dia) e **Linguagem Académica** (formal, rigorosa e filosófica).
  - **Exportação Editorial em PDF:** Módulo `EditorialReport` com design *white paper* / *think-tank*, otimizado para gravação em PDF e impressão A4 (`@media print`).
  - **Síntese de Voz (TTS):** Web Speech Synthesis nativo do browser com perfis acústicos e timbres individualizados por agente.
  - **Persistência / Base de Dados:** Base de dados local (*Local-First* via `LocalDatabase`), com gravação automática de debates, contagem de rondas, intervenções e recuperação instantânea.
  - **Idioma de Comunicação e UI:** Português de Portugal (PT-PT).

---

## 🛠️ Decisões Arquiteturais Registadas (ADRs)
- **[2026-10-18] ADR-001:** Escolha do OpenRouter como motor inicial pela flexibilidade de contrastar modelos rivais com a mesma interface unificada.
- **[2026-10-18] ADR-002:** Interface desenhada no paradigma "Local-First" e responsiva para browser e telemóvel.
- **[2026-10-18] ADR-003:** Inclusão de motor dialético de simulação de alta qualidade para assegurar funcionamento imediato.
- **[2026-10-18] ADR-004:** Adoção de Web Speech Synthesis nativa para TTS com perfis auditivos individuais por agente.
- **[2026-10-18] ADR-005:** Implementação de base de dados local (`LocalDatabase`) para arquivo automático das sessões.
- **[2026-10-18] ADR-006:** Síntese Dinâmica e Evolutiva que recalcula e atualiza com cada nova intervenção.
- **[2026-10-18] ADR-007:** Seletor de Linguagem Simples vs. Académica na Navbar para democratizar o acesso e compreensão das discussões por qualquer pessoa.
- **[2026-10-18] ADR-008:** Layout editorial white-paper (`EditorialReport`) acoplado a `@media print` para exportação nativa em PDF com tipografia serifada, duas colunas e transcrição integral.
- **[2026-10-18] ADR-009:** Motor Dialético Multi-Fase: Introdução de controlo de turnos passados por agente (`previousTurnsByAgent`) com argumentos distintos para cada fase do debate, eliminando duplicações entre rondas.

---

## ✅ O Que Já Funciona (v0.4.1)
- [x] Resolução completa do diálogo repetido: cada especialista agora progride através de 4 fases argumentativas distintas com exemplos novos em cada ronda.
- [x] Reação imediata e contextual a intervenções humanas: se o utilizador intervir, o orador seguinte reage diretamente ao que o utilizador escreveu.
- [x] Seletor de tom na Navbar: "Linguagem Simples" (comum, direta, analógica) vs "Linguagem Académica" (técnica e filosófica).
- [x] Motor de geração ajustado ao tom: agentes explicam ideias sem termos difíceis no modo simples.
- [x] Síntese adaptada ao tom: títulos claros ("A Ideia Principal", "Em Que Pontos Todos Concordam?", "Onde É Que Eles Discordam?").
- [x] Botão "Exportar PDF" no modal de síntese acoplado ao layout editorial `EditorialReport`.
- [x] Síntese evolutiva com recálculo automático e botão manual de atualização.
- [x] Síntese de voz TTS com perfis distintos por agente e controlo de mudo.
- [x] Base de dados local com histórico de debates gravados.
- [x] Validação automática com gravação em browser subagent (`no_repetition_demo`).

---

## ⏳ Open Issues / Próximos Passos
- [ ] Conector opcional com Appwrite Cloud para sincronização em múltiplos dispositivos.
- [ ] Criação e edição personalizada de novos avatares e personalidades de agentes pelo utilizador.
