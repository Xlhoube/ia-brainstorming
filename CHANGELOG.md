# Changelog

Todas as alterações relevantes a este projeto serão documentadas neste ficheiro.

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
