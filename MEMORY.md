# MEMORY.md | IA Brain Storming - Diálogo & Debate Multi-Agente IA

## 📌 Contexto Atual do Projeto
- **Nome:** IA Brain Storming
- **Objetivo:** Plataforma web interativa de diálogo, debate e confronto dialético entre agentes de Inteligência Artificial para analisar temas complexos, teorias, dilemas éticos, problemas e soluções globais.
- **Versão:** v0.6.0
- **Data da Última Atualização:** 2026-10-18
- **Nível de Risco:** 1 (Lazer / Exploração criativa)
- **Ritmo:** Desenvolvimento sólido (arquitetura robusta e modular)
- **Ambiente de Execução e Deploy:** Web Browser (Desktop e Telemóvel responsivo) / Vercel
- **Stack:**
  - **Frontend / Fullstack:** Next.js 16 (App Router, Turbopack, TypeScript, React 19) + Tailwind CSS v4.
  - **Avatares Fotográficos & Painel Cinemático:** Integração completa dos 5 retratos fotográficos em alta definição dos especialistas (`/avatars/01_Dr_Marcus_Vance.png`, `02_Dra_Helena_Rostova.png`, `03_Aura_Chen.png`, `04_Kaelen_Voss.png`, `05_Sophia_Veris.png`) na barra fixa superior, nas mensagens da timeline e no relatório editorial. Inclui ainda o banner cinemático de equipa (`/avatars/painel_especialistas.png`) tanto no ecrã de boas-vindas como num modal dedicado de alta resolução.
  - **Camada de Inferência de IA:** OpenRouter API com suporte a múltiplos modelos (Claude 3.5 Sonnet, GPT-4o, DeepSeek V3, Llama 3.3 70B, Gemini 2.0 Flash) e motor dialético dinâmico sem repetições.
  - **Entrada & Diálogo Direto com a Sala:** O utilizador pode falar diretamente para a sala em qualquer momento (ex.: dizer *"Boa noite a todos"* ou colocar uma questão imediata), despoletando a resposta audível e acolhedora em tempo real dos especialistas presentes.
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
- **[2026-10-18] ADR-009:** Motor Dialético Multi-Fase sem repetições.
- **[2026-10-18] ADR-010:** Interação Direta Humana na Sala: Qualquer fala humana (incluindo cumprimentos como "Boa noite") ativa a sala e gera reação imediata e falada por parte dos agentes.
- **[2026-10-18] ADR-011:** Avatares Fotográficos Realistas e Painel Cinemático: Otimização e carregamento dos retratos dos agentes e do retrato de equipa a partir de `public/avatars/`, com layout de ecrã fixo (`h-screen overflow-hidden`) para manter os rostos dos especialistas sempre em foco.

---

## ✅ O Que Já Funciona (v0.6.0)
- [x] Avatares fotográficos em alta definição integrados na barra superior de seleção de agentes.
- [x] Modal cinemático expansível com a fotografia do Conselho de Especialistas e mini-perfis detalhados.
- [x] Banner cinemático convocatório no ecrã de acolhimento inicial da sala.
- [x] Retratos reais dos oradores nos cartões de cada mensagem do debate dialético.
- [x] Inclusão das fotos dos intervenientes na secção de oradores do relatório editorial para PDF.
- [x] Layout de ecrã fixo com scroll independente na timeline de mensagens.
- [x] Diálogo direto na sala: dizer "Boa noite" ou colocar qualquer questão ativa de imediato a resposta falada da Moderadora e dos especialistas.
- [x] Botões de arranque e saudação rápida na sala vazia ("Boa noite a todos!", "O que acham da IA?", etc.).
- [x] Eliminação total de diálogo repetido com progressão de 4 fases por ronda.
- [x] Seletor de tom na Navbar: "Linguagem Simples" (comum, direta, analógica) vs "Linguagem Académica" (técnica e filosófica).
- [x] Botão "Exportar PDF" no modal de síntese acoplado ao layout editorial `EditorialReport`.
- [x] Síntese evolutiva com recálculo automático e botão manual de atualização.
- [x] Síntese de voz TTS com perfis distintos por agente e controlo de mudo.
- [x] Base de dados local com histórico de debates gravados.

---

## ⏳ Open Issues / Próximos Passos
- [ ] Conectar ao repositório remoto do GitHub quando o utilizador criar o repositório em https://github.com/new.
- [ ] Conector opcional com Appwrite Cloud para sincronização em múltiplos dispositivos.
