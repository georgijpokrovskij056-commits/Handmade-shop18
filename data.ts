export type Category = 'Доски' | 'Утварь' | 'Мебель'

export type Product = {
  id: string
  name: string
  category: Category
  price: number
  image: string
  altImage: string
  imagePosition?: string
  description: string
  material: string
  size: string
  finish: string
}

export const products: Product[] = [
  {
    id: 'board-duo',
    name: 'Набор досок «Два леса»',
    category: 'Доски',
    price: 6900,
    image: '/images/board-set.webp',
    altImage: '/images/board-walnut.webp',
    description: 'Две рабочие доски контрастных пород для ежедневной готовки и спокойной подачи на стол. Ручная шлифовка подчёркивает естественный рисунок массива.',
    material: 'Орех, ясень',
    size: '42 × 26 см и 36 × 22 см',
    finish: 'Пищевое минеральное масло',
  },
  {
    id: 'board-veins',
    name: 'Доска «Камские полосы»',
    category: 'Доски',
    price: 4200,
    image: '/images/board-walnut.webp',
    altImage: '/images/board-set.webp',
    description: 'Торцевая доска с выразительными линиями из разных пород дерева. Подходит для нарезки, сервировки хлеба, сыров и домашних заготовок.',
    material: 'Орех, вишня',
    size: '40 × 25 × 3 см',
    finish: 'Масло и пчелиный воск',
  },
  {
    id: 'utensils-trio',
    name: 'Набор «Три ложки»',
    category: 'Утварь',
    price: 3400,
    image: '/images/utensil-set.webp',
    altImage: '/images/spoons.webp',
    description: 'Поварёшка, ложка и лопатка с разным характером дерева. Каждый предмет выточен и отшлифован вручную, поэтому точно повторить набор невозможно.',
    material: 'Орех, граб, бук',
    size: 'Длина 28–34 см',
    finish: 'Пищевое льняное масло',
  },
  {
    id: 'spoons-daily',
    name: 'Ложки «На каждый день»',
    category: 'Утварь',
    price: 1800,
    image: '/images/spoons.webp',
    altImage: '/images/utensil-set.webp',
    description: 'Пара удобных кухонных ложек с тонкой ручкой и плавной чашей. Лёгкие, тёплые на ощупь и бережные к посуде.',
    material: 'Орех, клён',
    size: 'Длина 30 см',
    finish: 'Пищевое льняное масло',
  },
  {
    id: 'stool-three',
    name: 'Табурет «Три ноги»',
    category: 'Мебель',
    price: 14500,
    image: '/images/stool.webp',
    altImage: '/images/workshop.webp',
    imagePosition: 'center 58%',
    description: 'Небольшой табурет на трёх ногах с традиционными врезными соединениями. Может стать сиденьем, прикроватной тумбой или подставкой у кресла.',
    material: 'Массив ясеня',
    size: '45 × 30 × 43 см',
    finish: 'Масло-воск',
  },
  {
    id: 'bench-live',
    name: 'Скамья «Живой край»',
    category: 'Мебель',
    price: 48000,
    image: '/images/bench.webp',
    altImage: '/images/table.webp',
    description: 'Скамья из цельного массива с сохранённым природным контуром. Проект создаётся вокруг конкретного слэба, поэтому геометрия каждого изделия особая.',
    material: 'Массив вяза',
    size: '160 × 45 × 78 см',
    finish: 'Твёрдое масло-воск',
  },
]

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
