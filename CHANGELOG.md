# Changelog

Todas as alterações relevantes a este projeto serão documentadas neste ficheiro.

## [0.17.0] - 2026-10-22

### Adicionado / Alterado
- **Criação e Gestão de Novos Especialistas Personalizados no Conselho:**
  - **Componente AddSpecialistModal (`AddSpecialistModal.tsx`):** Novo modal com formulário completo para criar especialistas de raiz: nome, cargo/especialidade, arquétipo dialético (cientista, filósofo, humanista, tecnólogo, economista, psicólogo, moderador ou personalizado), seletor visual de avatares/emojis, paleta de cores de destaque, traço psicológico dominante, filosofia nuclear inegociável e modelo OpenRouter (com foco em `:free`).
  - **Predefinições Rápidas (1 Clique):** Inclusão de 4 modelos pré-formatados prontos a adicionar instantaneamente: Dra. Clara Silveira (Neurociência Cognitiva), Prof. Vasco Pinto (Economia Comportamental), Dra. Matilde Fontes (Jurista & Bioeticista) e Dr. Tiago Lins (Astrofísica Teórica).
  - **Persistência Local-First:** Novos métodos em `LocalDatabase.ts` (`getCustomAgents`, `saveCustomAgent`, `deleteCustomAgent`) armazenando os novos especialistas localmente no browser (`ia_brainstorming_custom_agents_v1`), preservados entre sessões e recarregamentos.
  - **Integração no Hook `useDebate.ts`:** Métodos `addCustomAgent` e `deleteCustomAgent` que registam o especialista, geram o prompt cognitivo e o integram diretamente na mesa redonda ativa.
  - **Gatilhos Visuais em `AgentRoster.tsx`:** Botões dedicados `+ Especialista` no cabeçalho da barra lateral, botão pontilhado no fim da lista desktop, botão deslizante na faixa mobile e opção de remoção com confirmação para pensadores personalizados (protegendo os 5 canónicos contra remoção acidental).
  - **Validação Automatizada:** Novo teste automatizado em `scripts/test-add-specialist.mjs` validando 100% dos métodos de persistência, componentes, formulários e integração.

## [0.16.0] - 2026-10-22

### Adicionado / Alterado
- **Novo Layout Dividido da Interface (Split UI: Especialistas de um Lado e Diálogo do Outro):**
  - **Separação Semântica e Estrutural em `page.tsx`:** Substituída a organização vertical monolítica por um contentor dividido flexível e responsivo (`flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative`), alocando a barra lateral de especialistas na tag semântica `<aside>` e a área de diálogo e linha do tempo na tag semântica `<main>`.
  - **Barra Lateral de Especialistas no Desktop (`<aside>`):** `AgentRoster.tsx` adaptado para exibir os cinco pensadores verticalmente em cartões ricos e interativos (com fotografia/avatar em alta definição, indicador pulsante de fala, checkbox de presença na mesa, etiquetas de temperamento psicológico e contador de memórias arquivadas).
  - **Faixa Compacta Responsiva em Ecrãs Móveis:** Em dispositivos móveis (`< md`), os especialistas mantêm-se acessíveis numa faixa horizontal deslizante de reduzida altura, preservando todo o espaço vertical para leitura confortável do diálogo e mensagens.
  - **Rodapé Estratégico do Conselho:** Adicionado componente de apoio na barra lateral com resumo da dialética dos The Five (Pragmática, Disruptiva, Cética, Estratégica e Ética).
  - **Validação Automatizada:** Novo conjunto de testes em `scripts/test-split-ui-layout.mjs` certificando a presença das tags semânticas `<aside>` e `<main>`, a flexibilidade responsiva `md:flex-row`, a colocação correta dos componentes e a compilação rigorosa em TypeScript sem erros.

## [0.15.4] - 2026-10-22

### Corrigido / Alterado
- **Desbloqueio Total do Modal de Síntese Pós-Conclusão de Debate:**
  - **Eliminação do Bloqueio de Ecrã em `page.tsx`:** Removida a expressão `isOpen={isSynthesisModalOpen || Boolean(synthesisResult && !isSynthesizing && status === 'concluded')}` que forçava o modal de síntese a reabrir infinitamente após o término do debate, impedindo o utilizador de o fechar ou de interagir com a aplicação sem recarregar a página.
  - **Auto-Abertura Não Bloqueante (`autoOpenedSynthesisSessionRef`):** O modal de síntese é despoletado automaticamente uma única vez por sessão quando a conclusão do debate é atingida, permitindo ao utilizador fechar livremente a janela a qualquer momento e continuar a explorar a interface.
  - **Múltiplas Formas de Fechar o Modal:** Em `SynthesisModal.tsx`, adicionado fecho por clique no fundo exterior (backdrop) com `e.stopPropagation()` no contentor do diálogo, suporte nativo à tecla `Escape` via `useEffect`, e botão proeminente de fecho no cabeçalho e rodapé.
  - **Barra de Ações no Rodapé do Modal:** Adicionada barra fixa inferior com atalhos de navegação direta: `✕ Fechar e Ver Diálogo`, `Reiniciar Debate` e `Novo Tema`, além de acesso rápido ao estúdio de podcast e exportação em PDF.
  - **Gestão do Estado `concluded` na `ControlsBar.tsx`:** Quando o debate atinge a sua conclusão, a barra inferior apresenta opções dedicadas de reinício (`Reiniciar Debate`) e de seleção de um novo tópico (`Novo Tema`), eliminando botões ambíguos de retoma de sessões finalizadas.
- **Validação Automatizada:** Novo script de testes em `scripts/test-synthesis-modal-unlock.mjs` com 5 testes de verificação de desbloqueio, fecho via backdrop e tecla Escape, e opções de navegação pós-conclusão.

## [0.15.3] - 2026-10-22

### Corrigido / Alterado
- **Foco Temático Rigoroso & Prevenção Total de Desvio para IA (Anti-Drift):**
  - **Neutralização de Memórias de Base:** Reformuladas as memórias estruturadas iniciais dos cinco especialistas em `src/lib/agents/bibliaLoader.ts` (Dr. Marcus Vance, Dra. Helena Rostova, Aura Chen, Kaelen Voss, Sophia Veris) para operarem com princípios universais de epistemologia, termodinâmica, justiça cívica e engenharia, eliminando expressões indutoras de desvio para IA (ex.: "inteligência sintética", "alinhamento de IA", "cálculo algorítmico").
  - **Filtro de Relevância em `memoryEcho` e Prompts:** Em `src/lib/ai/openrouter.ts`, o motor avalia se o debate incide sobre tecnologia/IA antes de passar ou evocar memórias relacionadas; em debates de espaço, fusão, genética, física ou ecologia, memórias sobre IA são estritamente filtradas.
  - **Diretriz Mandatória Anti-Desvio nos Prompts Remotos:** Inserida regra formal de foco temático no System Prompt do OpenRouter proibindo os modelos de desviarem a discussão para inteligência artificial, computadores ou robôs quando o tema em debate for de outra natureza.
  - **Depuração de Ambiguidade nos Domínios Físicos:** Substituídas expressões potencialmente indutoras de IA no banco de discurso de `quantica` e `geral` ("serviços secretos estatais" em vez de "agências de inteligência"; "engenho humano" em vez de "inteligência").
  - **Síntese Fiel ao Tópico (`synthesize/route.ts`):** Eliminados todos os textos rígidos de fallback que pressupunham que qualquer debate era sobre IA e robôs; o resumo executivo adapta-se com fidelidade ao tema real proposto.
  - **Sugestões Rápidas Dinâmicas (`DebateTimeline.tsx`):** Os botões rápidos de intervenção humana no ecrã adaptam-se dinamicamente ao tópico ativo em vez de sugerirem perguntas pré-formatadas sobre o futuro da IA ou robôs com sentimentos.
- **Validação Automatizada:** Novo script de testes em `scripts/test-thematic-relevance.mjs` com 5 testes de pureza temática e verificação estrita de ausência de desvio para IA em temas não-IA.

## [0.15.2] - 2026-10-22

### Corrigido / Alterado
- **Eliminação Total de Repetições no Mesmo Debate (Motor Dialético Local):**
  - **Fim do Ciclo de Módulo Rígido:** Substituído o seletor cíclico `turnsCount % 2` que repetia as falas a cada 2 turnos por um banco progressivo multi-estágio (`DOMAIN_DISCOURSE_BANK`) com mais de 250 argumentos únicos (mínimo de 6 teses progressivas por pensador em cada um dos 10 domínios).
  - **Guarda Anti-Repetição no Histórico (`isAlreadySpoken`):** O motor valida todas as frases candidatas contra o histórico completo do debate em curso, garantindo matematicamente que nenhuma fala substancial é repetida pelo mesmo pensador ou na mesma sala.
  - **Escuta Ativa com Reflexão Semântica:** O orador analisa as palavras reais proferidas pelo interlocutor anterior (ex.: dados empíricos, custos humanos, aceleração técnica ou pressupostos lógicos) e formula o prefácio conversacional em resposta direta a esse conceito.
  - **Gerador Procedimental Dialético:** Para debates longos (15 a 50+ intervenções), um gerador combinatório sintetiza novas teses entrelaçando a psicologia da personagem, a tensão do tema e um desafio epistemológico ao último orador, sem nunca reciclar textos passados.
- **Validação Automatizada:** Novo script de testes em `scripts/test-no-in-debate-repetition.mjs` que comprovou 0 repetições ao longo de 15 turnos consecutivos.

## [0.15.1] - 2026-10-22

### Corrigido / Alterado
- **Motor Dialético Local Dinâmico & Independência Temática:**
  - **Eliminação de Clichés Estáticos:** Removidos todos os textos e analogias fixas que estavam associados exclusivamente ao tema inicial ("cérebros de 20 watts", "chips", "gravadores de voz" e "IA como prótese").
  - **Deteção Semântica Multidomínio:** Implementado motor de deteção semântica em `src/lib/ai/openrouter.ts` cobrindo 9 domínios canónicos (`espaco`, `fusao`, `trabalho`, `quantica`, `genetica`, `desinformacao`, `interfaces`, `superinteligencia`, `consciencia`) e tópicos personalizados gerais.
  - **Discurso Profundo e Argumentação Especializada:** Cada um dos cinco pensadores possui teses, limites materiais, imperativos éticos e propostas de ação rigorosamente afinadas para cada domínio.
  - **Escuta Ativa & Interpelação Direta:** Cada réplica menciona o interlocutor anterior diretamente pelo nome e contrapõe a sua premissa central.
  - **Integração de Memórias do Pensador:** O motor dialético local evoca e respeita dinamicamente as linhas vermelhas éticas (`ethical_red_lines`) e dúvidas intelectuais (`intellectual_doubts`) dos agentes.
  - **Prioridade de Modelos Gratuitos:** Reordenada a lista de contingência do OpenRouter (`FALLBACK_MODELS` e `SYNTHESIS_FREE_MODELS`) para priorizar modelos de alta disponibilidade (`meta-llama/llama-3.3-70b-instruct:free` e `qwen/qwen-2.5-72b-instruct:free`).
- **Transparência na Interface (UI):**
  - **Distintivo Visual de Origem:** Adicionado distintivo no cabeçalho das mensagens em `DebateTimeline.tsx` informando com clareza se a fala foi formulada pelo `⚙️ Motor Dialético Local` ou pela `⚡ IA Remota: [modelo]`.
- **Validação Automatizada:** Novo script de testes de diversidade dialética e independência temática em `scripts/test-thematic-responses.mjs`.

## [0.15.0] - 2026-10-22

### Adicionado
- **Memória Individual dos Especialistas (Pilares 2, 3 e 4):**
  - **Auto-Registo de Memórias:** No encerramento autónomo ou manual de cada debate, cada pensador participante extrai e arquiva automaticamente a sua aprendizagem estruturada individual com categoria dinâmica (`lessons_learned`, `decisions` ou `open_hypotheses`) e registo de interlocutor e tema.
  - **Sincronização Híbrida Appwrite Cloud:** Métodos `saveAgentMemories` e `getAgentMemories` em `AppwriteDatabaseService`, permitindo sincronização na nuvem e persistência cruzada com salvaguarda local-first.
  - **Novas Categorias Canónicas & Atributos Ricos:**
    - `ethical_red_lines`: Linhas vermelhas éticas inegociáveis para cada pensador.
    - `intellectual_doubts`: Dúvidas intelectuais e dilemas em aberto transportados para futuros debates.
    - Metadados de `emotionalImpact` (`decisivo`, `revelador`, `inquietante`), `relatedColleague` e `topicContext`.
  - **Interface & Filtros no Painel de Especialistas:** Nova barra de filtros horizontais por categoria em `AgentRoster.tsx`, badges contextuais e formulário alargado para introdução manual.
  - **Injeção Cognitiva no OpenRouter:** Os prompts de IA recebem as linhas vermelhas e dúvidas intelectuais individuais com diretrizes estritas de respeito epistemológico.
- **Validação Automatizada:** Bateria de testes `scripts/test-memory-enhancements.mjs` com 100% de sucesso.

## [0.14.1] - 2026-10-22

### Corrigido / Alterado
- **Síntese 100% Gratuita no OpenRouter:** Substituição do modelo comercial pago `google/gemini-2.0-flash-001` pela cascata resiliente de modelos gratuitos (`google/gemini-2.0-flash-exp:free`, `meta-llama/llama-3.3-70b-instruct:free`, `qwen/qwen-2.5-72b-instruct:free`, `mistralai/mistral-small-24b-instruct-2501:free`) em `src/app/api/debate/synthesize/route.ts`.
- **Higienização de JSON Markdown:** Implementação de suporte e tratamento de markdown code blocks (```json ... ```) no retorno dos modelos para prevenir falhas de análise de sintaxe.
- **Validação Automatizada:** Novo script de testes em `scripts/test-synthesize-route.mjs`.

## [0.14.0] - 2026-10-20

### Adicionado
- **Memória Estruturada Canónica (Fase E):** 6 categorias cognitivas (`confirmed_facts`, `explicit_preferences`, `decisions`, `open_hypotheses`, `lessons_learned`, `conversation_summaries`).
- **The Five Podcast Studio:** Masterização e síntese de áudio local WAV estéreo e geração de guião de transmissão.
- **10 Novos Cenários Dialéticos de Fronteira Científica.**
