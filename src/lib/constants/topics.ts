import { PresetTopic } from '@/types/debate';

export const PRESET_TOPICS: PresetTopic[] = [
  {
    id: 'consciencia-digital',
    title: 'A consciência humana pode ser transferida ou replicada por máquinas?',
    category: 'Filosofia & Consciência',
    description: 'Debate sobre o problema difícil da consciência, funcionalismo computacional, o quarto chinês de Searle e a continuidade da identidade subjetiva.',
    suggestedAgents: ['dr-marcus-vance', 'dra-helena-rostova', 'aura-chen', 'kaelen-voss']
  },
  {
    id: 'crise-sentido-trabalho',
    title: 'O fim do trabalho como pilar da identidade e sobrevivência humana',
    category: 'Sociedade & Futuro',
    description: 'Quando a automatização e a inteligência artificial assumirem a maioria das tarefas produtivas e cognitivas, como se redefinirá o propósito, a riqueza e a dignidade humana?',
    suggestedAgents: ['aura-chen', 'kaelen-voss', 'dr-marcus-vance', 'sophia-veris']
  },
  {
    id: 'colonizacao-espacial',
    title: 'Colonizar outros mundos ou curar a Terra: dilema ético ou falso conflito?',
    category: 'Ciência & Espaço',
    description: 'A expansão multiplanetária é uma obrigação moral para mitigar riscos de extinção ou uma desculpa dispendiosa para adiar a sustentabilidade do nosso planeta berço?',
    suggestedAgents: ['dra-helena-rostova', 'kaelen-voss', 'aura-chen', 'sophia-veris']
  },
  {
    id: 'desinformacao-liberdade',
    title: 'Como erradicar a desinformação em massa sem destruir a liberdade de expressão?',
    category: 'Ética & Humanidade',
    description: 'Num mundo de conteúdos gerados por IA hiper-realistas, quem define a verdade e até onde podem ir os filtros sem cair em censura algorítmica totalitária?',
    suggestedAgents: ['dr-marcus-vance', 'sophia-veris', 'aura-chen', 'kaelen-voss']
  },
  {
    id: 'transumanismo-biologico',
    title: 'Edição genética humana e a criação de duas espécies desiguais',
    category: 'Tecnologia & IA',
    description: 'A possibilidade de erradicar doenças versus o risco de criar uma clivagem genética e social intransponível entre os aumentados e os naturais.',
    suggestedAgents: ['aura-chen', 'dra-helena-rostova', 'kaelen-voss', 'dr-marcus-vance']
  }
];
