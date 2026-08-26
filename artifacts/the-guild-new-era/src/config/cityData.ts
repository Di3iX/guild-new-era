import type { BuildingData } from '@/types/game';

export const BUILDINGS: BuildingData[] = [
  {
    id: 'guild-house',
    type: 'house',
    name: 'Дом Гильдии',
    map: { x: 7, y: 13 },
    approach: { x: 8, y: 13 },
    clickZone: { width: 105, height: 86 },
    description: 'Твоё место в городе',
    detail:
      'Здесь начинается твоя история. В сундуке можно хранить нажитое, а на стене — планы на следующий день.',
  },
  {
    id: 'iron-spark',
    type: 'forge',
    name: 'Кузница «Искра»',
    map: { x: 16, y: 7 },
    approach: { x: 15, y: 8 },
    clickZone: { width: 112, height: 92 },
    description: 'Железо, уголь и ремесло',
    detail:
      'Хозяин кузницы берётся за инструменты и подковы. Хорошая сталь любит терпеливые руки.',
  },
  {
    id: 'north-mine',
    type: 'mine',
    name: 'Старая шахта',
    map: { x: 4, y: 5 },
    approach: { x: 5, y: 6 },
    clickZone: { width: 122, height: 92 },
    description: 'Глубже, чем кажется',
    detail:
      'В заброшенных штольнях всё ещё попадается руда. Спускаться одному — решение с последствиями.',
  },
  {
    id: 'river-market',
    type: 'market',
    name: 'Речной рынок',
    map: { x: 16, y: 16 },
    approach: { x: 15, y: 15 },
    clickZone: { width: 132, height: 88 },
    description: 'Шумный узел торговли',
    detail:
      'Пять рядов лавок, три запаха пряностей и всегда кто-то, кто хочет купить дешевле.',
  },
  {
    id: 'east-cottage',
    type: 'house',
    name: 'Дом кожевника',
    map: { x: 20, y: 11 },
    approach: { x: 19, y: 12 },
    clickZone: { width: 95, height: 78 },
    description: 'Тихий жилой дом',
    detail:
      'Окна выходят на восточную дорогу. Вечерами здесь сушат кожу и рассказывают новости.',
  },
  {
    id: 'west-cottage',
    type: 'house',
    name: 'Дом у ворот',
    map: { x: 4, y: 17 },
    approach: { x: 5, y: 16 },
    clickZone: { width: 98, height: 78 },
    description: 'Жилой дом у заставы',
    detail:
      'Первый дом, который видят путники. Хозяева знают городские слухи лучше стражи.',
  },
  {
    id: 'south-forest',
    type: 'forest',
    name: 'Южный лес',
    map: { x: 10, y: 19 },
    approach: { x: 10, y: 18 },
    clickZone: { width: 120, height: 90 },
    description: 'Густые деревья за городом',
    detail:
      'Здесь рубят лес для строек и мастерских. Следи за топором — и за стражей.',
  },
];