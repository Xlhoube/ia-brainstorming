# MEMORY.md | IA Brain Storming - Diálogo & Debate Multi-Agente IA

## 📌 Contexto Atual do Projeto
- **Nome:** IA Brain Storming
- **Objetivo:** Plataforma web interativa de diálogo, debate e confronto dialético entre agentes de Inteligência Artificial para analisar temas complexos, teorias, dilemas éticos, problemas e soluções globais.
- **Versão:** v0.10.3
- **Data da Última Atualização:** 2026-10-18
- **Nível de Risco:** 1 (Lazer / Exploração criativa)
- **Ritmo:** Desenvolvimento sólido (arquitetura robusta e modular)
- **Ambiente de Execução e Deploy:** Web Browser (Desktop, Tablet e Telemóvel com layout responsivo 100dvh) / Vercel
- **Stack:**
  - **Frontend / Fullstack:** Next.js 16 (App Router, Turbopack, TypeScript, React 19) + Tailwind CSS v4.
  - **Backend & Cloud Database:** Appwrite Cloud (Projeto `6ad53e750013ac9f2271`, Endpoint `https://fra.cloud.appwrite.io/v1`) via SDK oficial `appwrite` com arquitetura resiliente híbrida *Local-First + Cloud Sync*.
  - **Sistema de Memória Cognitiva Persistente & Aprendizagem dos Especialistas:** Cada pensador possui memória viva de longo prazo (`AgentMemory`), composta por: (1) Filosofia Nuclear Inegociável; (2) Perceção pessoal e relacional de cada colega de mesa; (3) Arquivo episódico de temas e posições já defendidas; (4) Aprendizagens e lições acumuladas (incluindo ensinamentos transmitidos diretamente pelo utilizador). Esta memória é injetada ativamente nos prompts do OpenRouter e arquivada automaticamente no fim de cada ronda.
  - **Motor de Diálogo Dialético Orgânico & Cascata:** Diálogos ágeis, curtos (50-90 palavras) e reativos. Fim dos monólogos e discursos académicos debitados. Sistema de escuta ativa que cita o orador anterior pelo nome, questiona diretamente os pressupostos e reage como numa conversa humana autêntica de mesa redonda. Cascata resiliente de modelos OpenRouter de alto desempenho gratuitos (`google/gemini-2.0-flash-exp:free`, `meta-llama/llama-3.3-70b-instruct:free`, `qwen/qwen-2.5-72b-instruct:free`, `mistralai/mistral-small-24b-instruct-2501:free`) para contornar restrições orçamentais e erros 402/404.
  - **Perfis Psicológicos & Evolução de Opinião:** Modelo de dados `AgentPersonality` atribuído aos 5 pensadores com temperamento, traços dominantes, gatilhos de reação emocional e dinâmica de amadurecimento ao longo das rondas.
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
- **[2026-10-18] ADR-018:** Higienização de Prefixos Teatrais e Interpelação Direta nas Mensagens: Remoção de tags redundantes de identificação de autor.
- **[2026-10-18] ADR-019:** Remoção de Legendas e Enquadramento Integral do Painel de Especialistas: Remoção da badge sobreposta no topo esquerdo do banner e ajuste de auto-scroll inicial no hook de debate, permitindo a visualização 100% integral dos 5 pensadores e das citações sem cortes e com centralização harmónica.

---

## ✅ O Que Já Funciona (v0.10.3)
- [x] Painel de especialistas integral e limpo: exibição dos 5 pensadores com cabeças, torsos, nomes e citações sem legendas sobrepostas no canto superior esquerdo.
- [x] Prevenção de auto-scroll no arranque: a área principal abre fixada no topo (`scrollTop = 0`), garantindo visibilidade total do tema central e do painel.
- [x] Higienização de prefixos redundantes de auto-identificação: o texto das mensagens surge sem etiquetas de guião de teatro e entra logo na conversa direta com o colega.
- [x] Avatares individuais com rostos perfeitamente centralizados em todos os cartões, barras de navegação, timeline de mensagens e modais.
- [x] Banner do Conselho de Especialistas panorâmico com enquadramento integral das cabeças dos 5 pensadores no acolhimento e no modal cinemático.
- [x] Memória Cognitiva dos Pensadores: Arquitetura completa de memória de longo prazo com persistência local e na cloud.
- [x] Injeção de memória episódica no prompt de sistema OpenRouter: os agentes invocam posições passadas, mantêm consistência ideológica e usam a sua perceção pessoal dos colegas durante as réplicas.
- [x] Arquivo automático de memórias de debate: no final de cada ronda, os resumos dos tópicos e posições são registados na memória dos agentes ativos.
- [x] Modal de Especialistas com aba dedicada `🧠 Memória Cognitiva`: inspeção visual da Filosofia Nuclear, Perceção dos Colegas, Histórico de Debates e Aprendizagens Acumuladas.
- [x] Ferramenta de Ensino Interativo: o utilizador pode ensinar diretamente novas lições a qualquer pensador, que passam a orientar o seu raciocínio futuro.
- [x] Badges de Memória `🧠 X` na barra superior com contador em tempo real do volume de memórias e lições de cada especialista.
- [x] Adaptação de ecrã integral: suporte perfeito a Mobile (375px+), Tablet (768px+) e Desktop/Ultra-wide (1536px+).
- [x] Painel de especialistas móvel em carrossel horizontal com snap e ocupação vertical reduzida.
- [x] Navbar e Controlos inferiores responsivos com ícones e textos adaptativos para evitar quebras ou sobreposições.
- [x] Visibilidade tátil dos botões de áudio e cópia nos cartões de debate (visíveis por defeito em ecrãs móveis e via hover em desktop).
- [x] Suporte a `100dvh` para prevenir corte das barras de controlo por menus de navegadores de telemóvel.
- [x] Modais responsivos (`SynthesisModal`, `TopicModal`, `HistoryModal`, `SettingsModal`, `EditorialReport`) com scroll vertical independente e cabeçalhos flexíveis.
- [x] Motor de diálogo dialético orgânico: intervenções ágeis (50-90 palavras) em formato de réplica viva, sem palestras ou discursos estáticos.
- [x] Escuta ativa nos agentes: cada orador responde especificamente ao que o orador anterior acabou de defender, citando o nome e desmontando o argumento.
- [x] Cascata inteligente de modelos OpenRouter com fallback automático para modelos topo de gama gratuitos quando há restrição de saldo ou erro 402/404.
- [x] Motor de simulação contextual orgânico renovado para garantir ritmo humano e debates fluidos mesmo em modo offline.
- [x] Integração completa com o Appwrite Cloud (Endpoint: `https://fra.cloud.appwrite.io/v1`, Projeto: `6ad53e750013ac9f2271`).
- [x] Serviço `AppwriteDatabaseService` híbrido: gravação automática em tempo real e sincronização transparente de debates.
- [x] Modal de Histórico com selo ativo `Appwrite Cloud Sync` e recuperação de sessões passadas.
- [x] Perfis psicológicos e traços dominantes com visualização em badges `🎭` na barra superior e no cabeçalho das mensagens.
- [x] Modal cinemático expansível com cartões detalhados de personalidade, temperamento e dinâmica de evolução da opinião.
- [x] Avatares fotográficos em alta definição integrados na barra superior de seleção de agentes e na timeline.
- [x] Modal cinemático expansível com a fotografia do Conselho de Especialistas e mini-perfis detalhados.
- [x] Banner cinemático convocatório no ecrã de acolhimento inicial da sala.
- [x] Retratos reais dos oradores nos cartões de cada mensagem do debate dialético.
- [x] Inclusão das fotos dos intervenientes na secção de oradores do relatório editorial para PDF.
- [x] Layout de ecrã fixo com scroll independente na timeline de mensagens.
- [x] Diálogo direto na sala: dizer "Boa noite" ou colocar qualquer questão ativa de imediato a resposta falada da Moderadora e dos especialistas.
- [x] Eliminação total de diálogo repetido com progressão de 4 fases por ronda.
- [x] Seletor de tom na Navbar: "Linguagem Simples" (comum, direta, analógica) vs "Linguagem Académica" (técnica e filosófica).
- [x] Botão "Exportar PDF" no modal de síntese acoplado ao layout editorial `EditorialReport`.
- [x] Síntese evolutiva com recálculo automático e botão manual de atualização.
- [x] Síntese de voz TTS com perfis distintos por agente e controlo de mudo.
- [x] Base de dados local com histórico de debates gravados.

- [x] Conectado e sincronizado com o repositório remoto do GitHub: https://github.com/Xlhoube/ia-brainstorming.

---

## ⏳ Open Issues / Próximos Passos
- [ ] Implementar exportação direta de áudio ou podcast dos debates gerados.
- [ ] Explorar novos temas dialéticos de fronteira científica.
