# MEMORY.md | IA Brain Storming - Diálogo & Debate Multi-Agente IA

## 📌 Contexto Atual do Projeto
- **Nome:** IA Brain Storming
- **Objetivo:** Plataforma web interativa de diálogo, debate e confronto dialético entre agentes de Inteligência Artificial para analisar temas complexos, teorias, dilemas éticos, problemas e - **Versão:** v0.13.0
- **Data da Última Atualização:** 2026-10-20
- **Nível de Risco:** 1 (Lazer / Exploração criativa)
- **Ritmo:** Desenvolvimento sólido (arquitetura robusta e modular)
- **Ambiente de Execução e Deploy:** Web Browser (Desktop, Tablet e Telemóvel com layout responsivo 100dvh) / Vercel
- **Stack:**
  - **Frontend / Fullstack:** Next.js 16 (App Router, Turbopack, TypeScript, React 19) + Tailwind CSS v4.
  - **Backend & Cloud Database:** Appwrite Cloud (Projeto `6ad53e750013ac9f2271`, Endpoint `https://fra.cloud.appwrite.io/v1`) via SDK oficial `appwrite` com arquitetura resiliente híbrida *Local-First + Cloud Sync*.
  - **Bíblia Canónica de Personagens & Loader Tipado:** Fonte de verdade única em `the_five_biblia_personagens_v1.json`, consumida por `src/lib/agents/bibliaLoader.ts`. Disponibiliza os cinco pensadores (`dr-marcus-vance`, `dra-helena-rostova`, `aura-chen`, `kaelen-voss`, `sophia-veris`) com tipagem TypeScript estrita, eliminando duplicações estáticas de código em `src/lib/constants/agents.ts`.
  - **Injeção de Prompts Cognitivamente Distintos (Fase C):** Cada agente recebe instruções individuais baseadas na sua psicologia, critérios de análise, primeiras perguntas, regra de decisão inegociável, pontos cegos, estilo verbal e normas epistemológicas partilhadas (proibição absoluta de inventar factos ou estudos; distinção entre facto, hipótese e valor; proibição de consenso forçado).
  - **Orquestração Canónica em 5 Etapas (Fase D):** O debate decorre em 5 etapas canónicas (1. Compreender ➔ 2. Análise independente ➔ 3. Confronto de argumentos ➔ 4. Verificação ➔ 5. Síntese) em `src/hooks/useDebate.ts`, com Sophia Veris a enquadrar o problema e a formular a síntese final com autonomia de conclusão.
  - **Dialética Livre Sem Limite de Turnos & Conclusão Emergente dos Especialistas:** Fim da limitação artificial por número de rondas. O debate decorre com total autonomia enquanto existirem contradições, teses e paradoxos vivos. Os próprios pensadores avaliam a maturidade dialética da discussão e declaram autonomamente o encerramento da mesa através de três desfechos epistemológicos: (1) Síntese Dialética; (2) Consenso Emergente; ou (3) Aporia / Divergência Irreconciliável.
  - **Sistema de Memória Cognitiva Persistente & Aprendizagem dos Especialistas:** Cada pensador possui memória viva de longo prazo (`AgentMemory`), composta por: (1) Filosofia Nuclear Inegociável; (2) Perceção pessoal e relacional de cada colega de mesa; (3) Arquivo episódico de temas e posições já defendidas; (4) Aprendizagens e lições acumuladas (incluindo ensinamentos transmitidos diretamente pelo utilizador). Esta memória é injetada ativamente nos prompts do OpenRouter e arquivada automaticamente no fim de cada debate.
  - **Motor de Diálogo Dialético Orgânico & Cascata:** Diálogos ágeis, curtos (50-90 palavras) e reativos. Fim dos monólogos e discursos académicos debitados. Sistema de escuta ativa que cita o orador anterior pelo nome, questiona diretamente os pressupostos e reage como numa conversa humana autêntica de mesa redonda. Cascata resiliente de modelos OpenRouter de alto desempenho gratuitos (`google/gemini-2.0-flash-exp:free`, `meta-llama/llama-3.3-70b-instruct:free`, `qwen/qwen-2.5-72b-instruct:free`, `mistralai/mistral-small-24b-instruct-2501:free`).
  - **Perfis Psicológicos & Evolução de Opinião:** Modelo de dados `AgentPersonality` atribuído aos 5 pensadores com temperamento, traços dominantes, gatilhos de reação emocional e dinâmica de amadurecimento.
  - **Avatares Fotográficos com Enquadramento Facial Perfeito & Painel Panorâmico:** Recorte e centralização biométrica dos 5 especialistas (`*_face.png`) garantindo que as faces ficam sempre visíveis em qualquer ecrã ou proporção sem corte de cabeças ou queixos. Banner panorâmico cinemático (`painel_especialistas_banner.png`) calibrado na proporção 16:6 com todos os pensadores visíveis simultaneamente.
  - **Higienização de Prefixos Teatrais:** Eliminação automática de etiquetas redundantes do tipo `[Nome do Especialista - Cargo]:` geradas por modelos de IA, assegurando que o texto começa imediatamente e de forma limpa na interpelação direta ao colega de debate.
  - **Painel de Especialistas Integral & Limpo:** Exibição completa da imagem cinemática do Conselho (1536x1024) com todas as 5 figuras, ícones, cargos e citações centrais, sem legendas ou caixas sobrepostas no topo esquerdo.
  - **Entrada & Diálogo Direto com a Sala:** O utilizador pode falar diretamente para a sala em qualquer momento (ex.: dizer *"Boa noite a todos"* ou colocar uma questão imediata), despoletando a resposta audível e acolhedora em tempo real dos especialistas presentes.
  - **Motor Anti-Repetição por Fases:** Progressão estruturada de argumentos (Abertura -> Confronto Direto -> Casos Práticos -> Convergência e Síntese) que elimina qualquer duplicação de frases ou ideias nas rondas subsequentes.
  - **Controlo de Linguagem & Tom:** Alternador dinâmico entre **Linguagem Simples & Acessível** (sem jargão técnico, com analogias do dia a dia) e **Linguagem Académica** (formal, rigorosa e filosófica).
  - **Exportação Editorial em PDF:** Módulo `EditorialReport` com design *white paper* / *think-tank*, otimizado para gravação em PDF e impressão A4 (`@media print`).
  - **Síntese de Voz (TTS):** Web Speech Synthesis nativo do browser com perfis acústicos e timbres individualizados por agente.
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
- **[2026-10-18] ADR-011:** Avatares Fotográficos Realistas e Painel Cinemático com layout de ecrã fixo.
- **[2026-10-18] ADR-012:** Psiques e Personalidades Dialéticas: Atribuição de temperamento, traços dominantes e gatilhos emocionais aos especialistas.
- **[2026-10-18] ADR-013:** Integração Appwrite Cloud (Project ID: `6ad53e750013ac9f2271`): Arquitetura híbrida de persistência onde cada intervenção e debate é guardado instantaneamente no cliente e sincronizado com o Appwrite Cloud.
- **[2026-10-18] ADR-014:** Motor Dialético Orgânico e Cascata Resiliente de Modelos Livres: Fim do débito de textos mecânicos e teses académicas. Intervenções limitadas a réplicas afiadas de 50-90 palavras com interpelação direta pelo nome e confronto das premissas precedentes.
- **[2026-10-18] ADR-015:** Adaptação Responsiva Multi-Ecrã e Otimização para Dispositivos Móveis: Viewport dinâmico com `100dvh` prevenindo corte por barras de navegação em browsers mobile; transição do painel de agentes para carrossel horizontal suave com snap em ecrãs móveis (preservando o espaço vertical da conversa); botões compactos e interações táteis nativas.
- **[2026-10-18] ADR-016:** Sistema de Memória Cognitiva Persistente dos Pensadores (`AgentMemory`): Cada especialista mantém filosofia inegociável, perceção dos colegas, arquivo de debates passados e aprendizagens acumuladas.
- **[2026-10-18] ADR-017:** Centralização e Enquadramento Facial dos Avatares: Recorte biométrico 1:1 e novo banner panorâmico 16:6.
- **[2026-10-18] ADR-019:** Remoção de Legendas e Enquadramento Integral do Painel de Especialistas: Remoção da badge sobreposta no topo esquerdo do banner e ajuste de auto-scroll inicial no hook de debate, permitindo a visualização 100% integral dos 5 pensadores e das citações sem cortes e com centralização harmónica.
- **[2026-10-19] ADR-020:** Dialética Livre Sem Limites de Turnos & Conclusão Emergente Autonoma pelo Conselho de Especialistas: Remoção de qualquer teto rígido ou forçado de rondas (como "Ronda 1/4"). O debate progride livremente pelo tempo necessário com contador de ciclos dinâmico (`Dialética Livre • Ciclo X`). Os especialistas têm autoridade para avaliar a maturidade da discussão e declarar autonomamente a conclusão da mesa por Síntese, Consenso ou Aporia, despoletando instantaneamente o distintivo editorial na mensagem, o arquivo de memória e a síntese final do Conselho.
- **[2026-10-19] ADR-021:** Integração da Bíblia Canónica (The Five) e Injeção Cognitiva de Prompts (Fases B e C): Integração de `the_five_biblia_personagens_v1.json` como fonte canónica única e `bibliaLoader.ts` para validação tipada e construção de prompts individuais sem duplicação de definições. Remoção cirúrgica do círculo verde com visto em `AgentRoster.tsx`. Os agentes recebem instruções cognitivas profundas (critérios de raciocínio, primeiras perguntas, regra de decisão inabalável, pontos cegos e regras epistemológicas da Bíblia) com extensão controlada (~700 tokens), preservando a compatibilidade total com os IDs operacionais, avatares e sessões do Appwrite.
- **[2026-10-20] ADR-022:** Orquestração do Debate em 5 Etapas Canónicas (Fase D): Implementação da máquina de estados com a progressão canónica de 5 etapas da Bíblia (1. Compreender ➔ 2. Análise independente ➔ 3. Confronto de argumentos ➔ 4. Verificação ➔ 5. Síntese) em `src/hooks/useDebate.ts`, carregadas a partir de `the_five_biblia_personagens_v1.json` via `bibliaLoader.ts`. Sophia Veris assume a abertura da mesa redonda e o encerramento com a síntese final sem consenso forçado. Bateria de testes automatizados (`scripts/test-phase-d.mjs`) criada e aprovada a 100%.
- **[2026-10-20] ADR-023:** Memória Estruturada Canónica (Fase E): Implementação do armazenamento de memória estruturada conforme as diretrizes canónicas da Bíblia (`the_five_biblia_personagens_v1.json` e Secção 8 de `agents_the_five.md`). Distinção estrita e tipada entre 6 categorias cognitivas (`confirmed_facts`, `explicit_preferences`, `decisions`, `open_hypotheses`, `lessons_learned`, `conversation_summaries`). Injeção contextual das memórias estruturadas ativas nos prompts de sistema OpenRouter e motor dialético simulado. Persistência local reativa em `localDatabase.ts` e interface de gestão visual no modal de pensadores (`AgentRoster.tsx`) com filtros por categoria, badges temáticas, remoção com um clique e formulário direto para ensinar novos factos ou preferências a qualquer pensador.
- **[2026-10-20] ADR-024:** The Five Podcast Studio & Masterização de Áudio WAV Local: Criação do serviço `podcastService.ts` e do componente `PodcastModal.tsx` para produção e broadcast de episódios dos debates. Geração automática de guiões completos de estúdio em formato Markdown, cálculo de capítulos com marcadores de tempo por etapa e intervenção, síntese local em PCM 16-bit 44.1kHz estéreo de áudio WAV (jingle dialético harmónico aditivo com modulação binaural), e exportação de ficheiros `.wav` e `.md` no navegador. Expansão de tópicos dialéticos de ponta para 10 cenários de fronteira científica (Computação Quântica, Biologia Sintética, Interfaces Cérebro-Máquina, Paradoxo do Controlo de Superinteligência e Fusão Nuclear). Bateria de testes automatizados (`scripts/test-phase-e.ts`) executada com 100% de sucesso.

---

## ✅ O Que Já Funciona (v0.14.0)
- [x] **Memória Estruturada Canónica (Fase E):** Separação cognitiva em 6 categorias (`confirmed_facts`, `explicit_preferences`, `decisions`, `open_hypotheses`, `lessons_learned`, `conversation_summaries`) com persistência, injeção nos prompts de IA e gestão CRUD visual no modal dos agentes.
- [x] **The Five Podcast Studio:** Modal dedicado de estúdio de transmissão com geração de guião broadcast em Markdown, timeline de capítulos por etapa, e sintetizador de áudio WAV PCM 16-bit 44.1kHz para descarregar localmente.
- [x] **Stepper Visual das 5 Etapas Canónicas:** Barra de progresso interativa no topo do debate indicando o avanço pelo protocolo canónico (01 Compreender ➔ 02 Análise ➔ 03 Confronto ➔ 04 Verificação ➔ 05 Síntese).
- [x] **10 Tópicos Dialéticos de Fronteira Científica:** Expansão de temas em `PRESET_TOPICS` abrangendo computação quântica, biologia sintética, BCI, alinhamento de superinteligência e geopolítica da fusão comercial.
- [x] **Orquestração Canónica em 5 Etapas (Fase D):** Implementação completa da progressão dialética em 5 etapas em `src/hooks/useDebate.ts`, carregadas a partir de `the_five_biblia_personagens_v1.json` com tipagem estrita no `bibliaLoader.ts`.
- [x] **Priorização de Sophia Veris para Abertura & Síntese:** Sophia Veris enquadra a discussão na Etapa 0 (Compreender) definindo pergunta, restrições e critérios de sucesso, e encerra o debate na Etapa 4 (Síntese) apresentando convergências e aporias sem forçar consensos falsos.
- [x] **Injeção de Metadados e Diretrizes de Etapa nos Prompts:** OpenRouter e motor dialético simulado recebem o contexto e a instrução canónica da etapa ativa, orientando o raciocínio de cada pensador.
- [x] **Indicadores Visuais de Etapa:** Visualização em tempo real na barra superior (`🧭 Etapa X/5: Nome · Ciclo Y`) e distintivo elegante em cada cartão de intervenção na timeline.
- [x] **Bateria de Testes Automatizados da Fase D e E:** `scripts/test-phase-d.mjs` e `scripts/test-phase-e.ts` com 100% de sucesso.
- [x] **Bíblia Canónica Integrada (Fase B):** Ficheiro `the_five_biblia_personagens_v1.json` ativo na raiz com especificações completas das 5 personagens, sem resumos ou omissões.
- [x] **Carregador e Validador Tipado (`bibliaLoader.ts`):** Validação estrutural de esquema no arranque e mapeamento seguro para identificadores operacionais.
- [x] **Eliminação de Código Duplicado:** `src/lib/constants/agents.ts` agora exporta `DEFAULT_AGENTS` derivado diretamente do `bibliaLoader`.
- [x] **Injeção de Prompts Cognitivamente Distintos (Fase C):** Cada pensador recebe nos seus prompts a missão, valores, primeiras perguntas, critérios de análise, regra de decisão e regras epistemológicas partilhadas.
- [x] Dialética livre sem teto fixo de rondas com conclusão emergente e autónoma pelos pensadores (Síntese, Consenso ou Aporia).
- [x] Avatares individuais fotográficos com enquadramento facial biométrico e banner panorâmico 16:6.
- [x] Motor de diálogo dialético orgânico (réplicas ágeis de 50-90 palavras) e cascata inteligente OpenRouter com fallback automático.
- [x] Integração completa com o Appwrite Cloud (Endpoint: `https://fra.cloud.appwrite.io/v1`, Projeto: `6ad53e750013ac9f2271`).
- [x] Seletor de tom na Navbar: "Linguagem Simples" vs "Linguagem Académica".
- [x] Exportação Editorial em PDF de Alta Fidelidade com design white paper de duas colunas.
- [x] Conectado e sincronizado com o repositório remoto do GitHub: https://github.com/Xlhoube/ia-brainstorming.

---

## ⏳ Open Issues / Próximos Passos
- [x] **Fase D — Orquestração do Debate:** Implementar a progressão em 5 etapas canónicas em `src/hooks/useDebate.ts`.
- [x] **Fase E — Memória Estruturada:** Evolução do armazenamento de memória persistente conforme as diretrizes canónicas da Bíblia.
- [x] Implementar exportação direta de áudio ou podcast dos debates gerados.
- [x] Explorar novos temas dialéticos de fronteira científica.
- [ ] Implementar feed RSS para publicação direta dos episódios de podcast exportados.
- [ ] Explorar geração de áudio multi-voz nativa via Web Audio API em segundo plano com vozes clonadas.

