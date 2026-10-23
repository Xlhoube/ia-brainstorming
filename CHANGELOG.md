# Changelog

Todas as alterações relevantes a este projeto serão documentadas neste ficheiro.

## [0.20.1] - 2026-10-23

### Corrigido / Resolução de Stale Closure no `useDebate`, Anti-Loop e Domínio de Saúde
- **Resolução de Stale Closure no Hook `useDebate.ts`:**
  - Introdução de `messagesRef` e `runNextTurnRef` sincronizados para que as invocações assíncronas do debate via `setTimeout` consumam sempre o histórico real e não um estado `messages: []` congelado na closure inicial.
  - Eliminação do loop de repetição do Dr. Marcus Vance na Etapa 1 (Análise independente), garantindo que todos os pensadores falam sequencialmente na ordem devida.
  - Salvaguarda anti-repetição consecutiva nas Etapas 2 e 3 (`lastMsg.agentId === nextAgent.id`).
- **Eliminação de Truncagem Mecânica e Frases Cortadas (`openrouter.ts`):**
  - Remoção do corte arbitrário `${baseDiscourse.slice(0, 90)}...` que amputava palavras a meio (ex: `"os pre..."`).
  - Erradicação de prefixos mecânicos e repetitivos (`Assumo de imediato o meu papel técnico...`).
  - Limpeza de redundâncias sintáticas em `detectThematicDomain` (evitando expressões do tipo `"sobre o debate sobre"`).
- **Expansão do Domínio Semântico de Saúde & Medicina (`saude`):**
  - Adição do domínio temático `saude` para debates sobre doenças sem cura, cancro, patologias crónicas, terapias experimentais e cuidados paliativos.
  - Banco de 30 argumentos especializados (6 por especialista) com pureza temática absoluta (0 contaminação por termos de IA) e fundamentação biomédica e ética sólida.
- **Bateria de Testes Automatizados:**
  - Criação do script `scripts/test-debate-loop-and-health-domain.mjs` com validação a 100%.

## [0.20.0] - 2026-10-22

### Adicionado / Arquitetura de Memória Híbrida & State Tracking
- **Sumarização Incremental em Background (`debateMemoryService.ts`):**
  - **Gatilho de Compressão:** Monitorização automática do histórico com limiar de 6 intervenções (`COMPRESSION_TRIGGER_THRESHOLD = 6` / 3000 tokens), comprimindo blocos antigos fora da janela ativa.
  - **Prompt de Resumo Impiedosamente Sintético:** Extração assíncrona focada em 4 pilares: 1) Teses centrais defendidas, 2) Dados factuais e métricas numéricas apresentadas, 3) Argumentos refutados, e 4) Concessões feitas, eliminando qualquer retórica vazia.
- **Estrutura da Janela Deslizante Híbrida (`debateMemoryService.ts`, `openrouter.ts`):**
  - Payload estruturado em 3 camadas hierárquicas de prioridade cognitiva:
    1. *Camada 1 (System Prompt):* Persona do especialista, regras do debate canónico e Mapeamento de Estado (JSON) injetado no topo.
    2. *Camada 2 (Memória de Longo Prazo):* Texto sumarizado incremental contínuo enriquecido com argumentos históricos recuperados via RAG semântico.
    3. *Camada 3 (Memória de Curto Prazo):* Janela deslizante com as últimas 2 a 4 interações brutas (`DEFAULT_SLIDING_WINDOW_SIZE = 3`), garantindo réplicas imediatas e fluidas ao último orador.
- **Mapeamento de Estado (State Tracking em JSON):**
  - Injeção dinâmica do objeto `estado_do_debate: { pontos_consensuais: [...], argumentos_esgotados: { ... } }` no topo do prompt.
  - O LLM consome este objeto como mapa de bloqueio absoluto do que já foi dito e esgotado, poupando milhares de tokens por turno e eliminando loops retóricos.
- **Base Vetorial e RAG Semântico (`debateMemoryService.ts`):**
  - Indexação semântica e de palavras-chave de cada intervenção do debate (`indexArgumentsForRAG`).
  - Recuperação por similaridade semântica (Jaccard / Cosine com exclusão da janela deslizante) dos 3 a 4 argumentos passados mais relevantes para o contexto do minuto em curso.
- **Tipagem Estruturada (`src/types/debate.ts`):**
  - Definição formal das interfaces `DebateStateTracking`, `CompressedDebateMemory` e `VectorArgumentEntry`.
- **Bateria de Testes Automatizados:**
  - Novo script `scripts/test-hybrid-memory-architecture.mjs` com 100% de aprovação.

## [0.19.1] - 2026-10-22

### Otimizado / Parâmetros de API & Anti-Loop
- **Ajuste Matemático de Parâmetros na Chamada à API (`openrouter.ts`):**
  - **Penalização de Presença (`presence_penalty = 0.45`):** Configurada penalização entre 0.3 e 0.6 para forçar o abandono de tópicos e eixos já debatidos, estimulando a introdução de novos subtemas e ângulos de análise.
  - **Penalização de Frequência (`frequency_penalty = 0.35`):** Configurada penalização entre 0.2 e 0.5 para penalizar a reciclagem de tokens repetidos, reduzindo a repetição de frases, fórmulas e estruturas sintáticas.
  - **Temperatura Equilibrada (`temperature = 0.75`):** Calibrada entre 0.6 e 0.8 para assegurar a criatividade necessária para novos ângulos de ataque analítico sem descurar a coerência técnica e lógica.
- **Cláusulas de Bloqueio Anti-Loop nos Prompts (`bibliaLoader.ts`, `openrouter.ts`, `AddSpecialistModal.tsx`):**
  - **Regra de Novidade Absoluta:** Obrigatoriedade de analisar o histórico e proibição expressa de repetir premissas, argumentos ou exemplos anteriores (do próprio agente ou do oponente), exigindo um novo dado empírico em cada intervenção.
  - **Mecanismo de Desistência (Impasse Técnico):** Declaração explícita de impasse técnico quando não houver consenso após uma troca direta (réplica e tréplica), forçando o avanço obrigatório para um novo ponto lógico da discussão.
  - **Bateria de Testes Automatizados:** Novo script de validação `scripts/test-anti-loop-parameters-and-clauses.mjs` aprovado com 100% de sucesso.

## [0.19.0] - 2026-10-22

### Adicionado / Protocolo Dialético
- **Protocolo de Argumentação Sequencial em Três Fases Lógicas (`bibliaLoader.ts`, `openrouter.ts`, `AddSpecialistModal.tsx`):**
  - **Injeção Cognitiva Estruturada:** Cada especialista (tanto os 5 canónicos como os especialistas personalizados) passa a ter no seu *system prompt* o dever obrigatório de seguir uma progressão sequencial em 3 fases lógicas:
    1. **Fase 1: Inicialização e Posicionamento:**
       - *Definição da Persona:* Assunção imediata do papel técnico (ex: Engenheiro, Economista, Filósofo, Cientista) e foco analítico.
       - *Abertura Direta:* Proibição estrita de introduções genéricas ou saudações. Declaração imediata da tese central e dos três pilares empíricos ou lógicos que a sustentam.
       - *Mapeamento de Limites:* Definição clara dos parâmetros da análise, declarando expressamente o que está fora do âmbito para evitar desvios ou alucinações.
    2. **Fase 2: Avaliação e Refutação Contínua:**
       - *Dissecação Lógica:* Extração da premissa base do último argumento do oponente para ataque direto, eliminando monólogos paralelos.
       - *Ancoragem em Factos e Casos:* Validação obrigatória de asserções teóricas com métricas concretas, frameworks estabelecidos ou cenários práticos (latência, custos operacionais, escalabilidade local ou limites físicos).
       - *Deteção de Falácias:* Sinalização explícita de falhas de raciocínio (falsas dicotomias, correlações sem causalidade) no discurso anterior antes de contra-argumentar.
    3. **Fase 3: Síntese e Conclusão:**
       - *Mapeamento de Concessões:* Reconhecimento explícito de pelo menos um argumento válido levantado pelo oponente, evidenciando evolução no raciocínio.
       - *Isolamento da Fricção:* Enumeração dos pontos exatos onde o consenso provou ser impossível e explicação do motivo técnico da divergência irredutível.
       - *Veredito Condicional:* Conclusão sem absolutismos, assumindo formato condicional ponderado ("A tese X mantém-se superior, mas apenas se os requisitos Y e Z forem estritamente garantidos").
  - **Orquestração Dinâmica de Turnos (`openrouter.ts`):** O prompt de turno injeta ativamente no modelo remoto a fase lógica correspondente à etapa do debate, orientando a IA em tempo real para cumprir a diretriz da fase ativa.
  - **Motor Dialético Local Dinâmico Atualizado:** A geração local e offline de réplicas reflete agora a abertura com tese e 3 pilares na Fase 1, prefixos conversacionais com dissecação lógica e deteção de falácias na Fase 2, e mapeamento de concessões com veredito condicional na Fase 3.
  - **Bateria de Testes Automatizados:** Novo script de verificação `scripts/test-three-phase-argumentation.mjs` aprovado com 100% de sucesso.

## [0.18.1] - 2026-10-22

### Removido / Limpeza de UI
- **Remoção do Botão de Configuração de API da Barra de Navegação (`Navbar.tsx`):**
  - **Eliminação do Indicador Suérfluo:** Removido o botão e indicador `🔑 API Conectada` / `Ligar OpenRouter` da barra de navegação superior, uma vez que a plataforma opera nativamente em modelos 100% gratuitos (`:free`) ou via motor dialético dinâmico local.
  - **Despoluição Visual do Cabeçalho:** O espaço no topo do ecrã fica dedicado exclusivamente às funções essenciais (Voz, Histórico, Temas e Reiniciar Debate), eliminando ruído desnecessário.
  - **Limpeza de Imports:** Removido o ícone `Key` e tornadas opcionais as propriedades `onOpenSettings` e `apiKey` em `NavbarProps`.

## [0.18.0] - 2026-10-22

### Adicionado / Cognitivo & Dialético
- **Protocolo de Retirada por Incompetência Temática (Humildade Epistemológica dos Especialistas):**
  - **Decisão Autónoma de Retirada (`openrouter.ts` & `the_five_biblia_personagens_v1.json`):** Adicionada a regra epistemológica canónica que determina que, se um pensador ou especialista avaliar que não domina ou não tem competência sobre a matéria técnica em apreço, deve retirar-se da mesa com a tag `[RETIRO_ME: motivo]`, abstendo-se de palpites superficiais e deixando a palavra a quem domina a matéria.
  - **Motor de Avaliação Temática (`evaluateAgentCompetence`):** Mapeamento semântico de incompatibilidades estritas (ex.: física teórica relativista ou astrofísica cósmica pura para sociólogos/economistas; cirurgia médica ou farmacologia estrita para engenheiros de sistemas puros; engenharia financeira e mercados de derivados para cientistas naturais sem componente de dados/economia).
  - **Exclusão Ativa de Rondas Subsequentes (`useDebate.ts`):** Rastreio de especialistas retirados (`withdrawnAgentIds`), excluindo-os automaticamente da pool de oradores ativos (`activeAgents`) nas etapas e rondas seguintes do debate ativo.
  - **Função de Re-convite (`reinviteAgent`):** Possibilidade de o utilizador humano re-convidar manualmente para a mesa redonda qualquer especialista que se tenha retirado, caso pretenda a sua perspetiva mesmo fora do domínio primário.
  - **Destaque Visual na Linha do Tempo (`DebateTimeline.tsx`):** Mensagem de despedida do especialista com moldura âmbar e distintivo de prestígio: `🚪 Retirou-se da Mesa · Humildade Epistemológica` com indicação do motivo técnico apresentado.
  - **Estado Visual no Painel de Especialistas (`AgentRoster.tsx`):** Indicador âmbar `🚪 Retirou-se da Mesa (Fora da Especialidade)` tanto na lista vertical de desktop como na faixa deslizante de telemóvel, com ícone interativo para reconvidar.
  - **Persistência de Sessão (`LocalDatabase.ts`):** `SavedDebateSession` preserva os especialistas retirados entre recarregamentos e sessões guardadas.
  - **Bateria de Testes Automatizados:** Novo teste de validação e integridade em `scripts/test-specialist-withdrawal.mjs` aprovado com 100% de sucesso.

## [0.17.2] - 2026-10-22

### Otimizado / Design de UI
- **Compactação da Barra do Tema Central Ativo na Timeline (`DebateTimeline.tsx`):**
  - **Redução Drástica da Altura Vertical:** O banner do tema ativo foi transformado numa barra horizontal compacta e elegante (`py-2 sm:py-2.5`), libertando mais de 65% do espaço vertical anteriormente ocupado.
  - **Tipografia e Elementos Refinados:** Redução do título para dimensões equilibradas (`text-xs sm:text-sm font-semibold text-white truncate`), descrição discreta em linha única truncada (`text-[10px] text-slate-400`), badge simplificado "Tema" e botão minimalista "Mudar Tema" perfeitamente alinhado.
  - **Eliminação de Brilhos e Margens Excessivas:** Removido o brilho radial de fundo e apertado o espaçamento entre o cabeçalho e as mensagens do debate (`space-y-3 sm:space-y-4`), maximizando a área de leitura e foco no diálogo dos especialistas.

## [0.17.1] - 2026-10-22

### Removido / Limpeza de UI
- **Remoção do Banner Visual do Protocolo Canónico em 5 Etapas na Timeline:**
  - **Eliminação de Elemento Redundante em `DebateTimeline.tsx`:** Removido o bloco visual com as 5 caixas horizontais ("01 Compreender", "02 Análise independente", "03 Confronto", etc.) que ocupava espaço vertical valioso no topo do ecrã de diálogo.
  - **Manutenção dos Indicadores Essenciais:** A etapa ativa do debate continua visível de forma elegante e contextual na barra superior de navegação (`🧭 Etapa X/5: Nome · Ciclo Y`) e no distintivo de cada mensagem proferida (`🧭 Nome da Etapa`), preservando toda a lógica interna de orquestração canónica e conferindo máximo destaque e espaço de leitura às mensagens e intervenções dos especialistas.
  - **Limpeza de Dependências:** Removidos imports de ícones não utilizados (`Layers`, `CheckCircle2`) no componente.

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
