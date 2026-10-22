# Changelog

Todas as alterações relevantes a este projeto serão documentadas neste ficheiro.

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
