# MEMORY.md | IA Brain Storming - Diálogo & Debate Multi-Agente IA

## 📌 Contexto Atual do Projeto
- **Nome:** IA Brain Storming
- **Objetivo:** Plataforma web interativa de diálogo, debate e confronto de perspetivas entre agentes de Inteligência Artificial para analisar temas complexos, teorias, dilemas éticos, problemas e soluções globais.
- **Versão:** v0.1.0
- **Data de Inicialização:** 2026-10-18
- **Nível de Risco:** 1 (Lazer / Exploração criativa)
- **Ritmo:** Desenvolvimento sólido (arquitetura robusta e modular)
- **Ambiente de Execução e Deploy:** Web Browser (Desktop e Telemóvel responsivo) / Vercel
- **Stack Escolhida e Justificação:**
  - **Frontend / Fullstack:** Next.js (App Router, TypeScript, React 19) + Tailwind CSS — garante alta performance, fluidez visual, componentes modulares e compatibilidade com streaming de respostas em tempo real.
  - **Motor de Inteligência Artificial:** OpenRouter API como camada principal de inferência — uma única integração concede acesso a múltiplos modelos de vanguarda (Claude 3.5 Sonnet, GPT-4o, DeepSeek, Llama 3.3, Gemini 1.5 Pro), viabilizando debates autênticos entre modelos de fornecedores distintos.
  - **Arquitetura Multi-Fornecedor Extensível:** Sistema de adaptadores desacoplados para permitir plugar novos motores de inferência no futuro sem alterar a interface (ex: Groq para ultra-velocidade, Google AI Studio nativo, ou modelos locais via Ollama).
  - **Interface / Experiência do Utilizador:** Dark Mode imersivo estilo "Arena de Pensamento / Mesa Redonda", avatares dinâmicos para cada agente, streaming visual de texto, intervenção humana no debate e síntese automática de conclusões.
  - **Idioma de Comunicação e UI:** Português de Portugal (PT-PT).

---

## 🛠️ Decisões Arquiteturais Registadas (ADRs)
- **[2026-10-18] ADR-001:** Escolha do OpenRouter como motor inicial pela flexibilidade de contrastar modelos rivais (OpenAI vs Anthropic vs Meta) com a mesma interface unificada, mantendo a camada de comunicação modular para futuras expansões (Groq/Ollama/Google).
- **[2026-10-18] ADR-002:** Interface desenhada no paradigma "Local-First" e responsiva para browser e telemóvel, com streaming de respostas via Server-Sent Events / ReadableStream.

---

## ⏳ Open Issues / Próximos Passos
- [ ] Inicializar estrutura do projeto Next.js com Tailwind CSS e TypeScript.
- [ ] Desenvolver o motor de debate multi-agente (`lib/engine/debateOrchestrator.ts`).
- [ ] Criar adaptador do OpenRouter com suporte a chaves personalizadas e streaming.
- [ ] Construir a interface visual da "Arena de Debate" com controlo de rondas, avatares e intervenção humana.
- [ ] Implementar exportação e síntese de teses/conclusões finais do debate.
