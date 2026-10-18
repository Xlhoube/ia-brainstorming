# MEMORY.md | IA Brain Storming - Diálogo & Debate Multi-Agente IA

## 📌 Contexto Atual do Projeto
- **Nome:** IA Brain Storming
- **Objetivo:** Plataforma web interativa de diálogo, debate e confronto dialético entre agentes de Inteligência Artificial para analisar temas complexos, teorias, dilemas éticos, problemas e soluções globais.
- **Versão:** v0.3.1
- **Data da Última Atualização:** 2026-10-18
- **Nível de Risco:** 1 (Lazer / Exploração criativa)
- **Ritmo:** Desenvolvimento sólido (arquitetura robusta e modular)
- **Ambiente de Execução e Deploy:** Web Browser (Desktop e Telemóvel responsivo) / Vercel
- **Stack:**
  - **Frontend / Fullstack:** Next.js 16 (App Router, Turbopack, TypeScript, React 19) + Tailwind CSS v4.
  - **Camada de Inferência de IA:** OpenRouter API com suporte a múltiplos modelos (Claude 3.5 Sonnet, GPT-4o, DeepSeek V3, Llama 3.3 70B, Gemini 2.0 Flash) e analisador dialético dinâmico.
  - **Síntese de Voz (TTS):** Web Speech Synthesis nativo do browser com perfis acústicos e timbres individualizados por agente (tom, cadência e dicção diferenciados).
  - **Persistência / Base de Dados:** Base de dados local (*Local-First* via `LocalDatabase`), com gravação automática de debates, contagem de rondas, intervenções e recuperação instantânea.
  - **Síntese Evolutiva:** Recálculo contínuo da tese central, consensos e divergências em função de novas opiniões introduzidas ao longo do debate.
  - **Idioma de Comunicação e UI:** Português de Portugal (PT-PT).

---

## 🛠️ Decisões Arquiteturais Registadas (ADRs)
- **[2026-10-18] ADR-001:** Escolha do OpenRouter como motor inicial pela flexibilidade de contrastar modelos rivais (OpenAI vs Anthropic vs Meta vs DeepSeek vs Google) com a mesma interface unificada.
- **[2026-10-18] ADR-002:** Interface desenhada no paradigma "Local-First" e responsiva para browser e telemóvel.
- **[2026-10-18] ADR-003:** Inclusão de motor dialético de simulação de alta qualidade para assegurar que a plataforma é 100% testável e demonstrável de imediato.
- **[2026-10-18] ADR-004:** Adoção de Web Speech Synthesis nativa para TTS em vez de servidores Python pesados (como OmniVoice).
- **[2026-10-18] ADR-005:** Implementação de base de dados local (`LocalDatabase`) para arquivo automático das sessões.
- **[2026-10-18] ADR-006:** Síntese Dinâmica e Evolutiva: A síntese executiva deixa de ser estática, passando a ser recalculada sempre que novas opiniões e intervenções são adicionadas, com banner de aviso e botão manual de "Recalcular".

---

## ✅ O Que Já Funciona (v0.3.1)
- [x] Correcção da síntese estática: agora a síntese recalcula e incorpora todas as novas opiniões adicionadas ao debate após as intervenções iniciais.
- [x] Detetor de novas intervenções no modal de síntese com aviso de divergência face ao relatório anterior.
- [x] Botão "Recalcular" no cabeçalho do modal de síntese para forçar a atualização a qualquer momento.
- [x] Síntese de voz TTS nativa com perfis auditivos calibrados para os 5 agentes.
- [x] Controlo global de áudio na Navbar (alternador Voz Ligada / Mudo com animação de ondas sonoras).
- [x] Botão de altifalante em cada intervenção individual para ouvir novamente o orador.
- [x] Base de dados local (`LocalDatabase`) com persistência automática de todas as mensagens e debates.
- [x] Modal de Histórico de Debates com indicação de data, total de mensagens e carregamento de sessões passadas.
- [x] Mesa redonda de 5 agentes pré-configurados com modelos de IA de topo.
- [x] Intervenção humana no debate em tempo real.
- [x] Validação completa de integração com subagente `browser`.

---

## ⏳ Open Issues / Próximos Passos
- [ ] Exportação em PDF do relatório analítico e conclusões da arena.
- [ ] Conector opcional com Appwrite Cloud para sincronização em múltiplos dispositivos.
