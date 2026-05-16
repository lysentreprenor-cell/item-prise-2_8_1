export type Unit =
  | 'm'    // metr bieżący
  | 'm2'   // metr kwadratowy
  | 'm3'   // metr sześcienny
  | 'szt'  // sztuka
  | 'h'    // godzina
  | 'kg'   // kilogram
  | 't'    // tona
  | 'km'   // kilometr
  | 'dzien'// dzień
  | 'kurs' // kurs/przyjazd
  | 'tydz' // tydzień
  | 'mc'   // miesiąc
  | 'kpl'  // komplet

export const UNIT_LABELS: Record<Unit, string> = {
  m: 'mb',
  m2: 'm²',
  m3: 'm³',
  szt: 'szt.',
  h: 'godz.',
  kg: 'kg',
  t: 'tona',
  km: 'km',
  dzien: 'dzień',
  kurs: 'kurs',
  tydz: 'tydzień',
  mc: 'miesiąc',
  kpl: 'kpl',
};

export const ALL_UNITS: Unit[] = ['m', 'm2', 'm3', 'szt', 'h', 'kg', 't', 'km', 'dzien', 'kurs', 'tydz', 'mc', 'kpl'];

export interface LineItem {
  id: string;
  category: string;
  name: string;
  unit: Unit;
  quantity: number;
  unitPrice: number;
}

export interface CustomContractData {
  title: string;
  description: string;
  executorSearch: string;
  deadline: string;
  items: LineItem[];
  paymentSplit: 'full_deposit' | 'upfront' | 'split' | 'custom' | '';
  depositPercent: number;
  upfrontPercent: number;
  afterPercent: number;
  requiredProofs: string[];
  hasAcceptanceProtocol: boolean;
  correctionDays: number;
  paymentDeadlineDays: number;
}

export const INITIAL_CUSTOM_DATA: CustomContractData = {
  title: '',
  description: '',
  executorSearch: '',
  deadline: '',
  items: [],
  paymentSplit: '',
  depositPercent: 100,
  upfrontPercent: 0,
  afterPercent: 0,
  requiredProofs: [],
  hasAcceptanceProtocol: false,
  correctionDays: 7,
  paymentDeadlineDays: 14,
};

export function lineTotal(item: LineItem): number {
  return item.quantity * item.unitPrice;
}

export function contractTotal(items: LineItem[]): number {
  return items.reduce((s, i) => s + lineTotal(i), 0);
}
