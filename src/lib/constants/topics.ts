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
  },
  {
    id: 'computacao-quantica-causalidade',
    title: 'Computação Quântica e Causalidade: Estará a física a desmontar a flecha do tempo e o livre-arbítrio?',
    category: 'Física & Fronteira Científica',
    description: 'Entrelaçamento não-local, computação quântica tolerante a falhas, experiências de escolha retardada de Wheeler e as implicações ontológicas da medição e do determinismo universal.',
    suggestedAgents: ['dra-helena-rostova', 'dr-marcus-vance', 'aura-chen', 'kaelen-voss']
  },
  {
    id: 'biologia-sintetica-vida-artificial',
    title: 'Biologia Sintética e Vida Desenhada: Teremos o direito de criar genomas sem precedentes evolutivos?',
    category: 'Biotecnologia & Ética',
    description: 'A transição de ler e editar ADN para desenhar organismos sintéticos artificiais de raiz, os riscos de biosegurança associados e as fronteiras do que definimos como vida.',
    suggestedAgents: ['dra-helena-rostova', 'sophia-veris', 'kaelen-voss', 'aura-chen']
  },
  {
    id: 'interfaces-cerebro-maquina',
    title: 'Interfaces Cérebro-Máquina: O advento da telepatia tecnológica e o fim da privacidade cognitiva',
    category: 'Neurociência & Futuro',
    description: 'Implantes neurais de alta densidade ligando diretamente o córtex cerebral a nós de rede de IA: simbiose evolutiva indispensável ou a vulnerabilidade definitiva do pensamento humano?',
    suggestedAgents: ['kaelen-voss', 'dr-marcus-vance', 'aura-chen', 'sophia-veris']
  },
  {
    id: 'paradoxo-superinteligencia-alinhamento',
    title: 'O Paradoxo do Controlo: Pode um sistema cognitivamente inferior conter com segurança uma Superinteligência?',
    category: 'IA de Fronteira & Segurança',
    description: 'O problema do alinhamento ortogonal, armadilhas instrumentais de convergência, ' + 
                 'e os limites matemáticos e computacionais da interpretabilidade mecânica de redes neuronais gigantes.',
    suggestedAgents: ['aura-chen', 'dr-marcus-vance', 'dra-helena-rostova', 'kaelen-voss']
  },
  {
    id: 'fusao-nuclear-geopolitica',
    title: 'Energia de Fusão Comercial: Abundância planetária universal ou nova hegemonia geopolítica?',
    category: 'Energia & Geopolítica',
    description: 'Quando os reatores de fusão por confinamento magnético ou inercial atingirem ganho líquido comercial, como se reconfigurarão o comércio internacional e os equilíbrios de poder global?',
    suggestedAgents: ['kaelen-voss', 'sophia-veris', 'dra-helena-rostova', 'dr-marcus-vance']
  }
];
