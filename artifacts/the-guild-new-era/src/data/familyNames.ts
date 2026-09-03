export const SPOUSE_NAMES = [
  'Йохан Брандт',
  'Грета Хольм',
  'Эрик Свенсон',
  'Ингрид Форс',
  'Лукас Реннер',
  'Хельга Аск',
];

export const CHILD_NAMES = [
  'Анна',
  'Йоран',
  'Сельма',
  'Виктор',
  'Тея',
  'Магнус',
  'Ирма',
  'Освальд',
];

export function pickRandom(pool: string[], exclude: string[] = []): string {
  const options = pool.filter((name) => !exclude.includes(name));
  const source = options.length > 0 ? options : pool;
  return source[Math.floor(Math.random() * source.length)];
}
