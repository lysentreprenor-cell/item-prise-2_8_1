export interface TransportContractData {
  title: string;
  deadline: string;
  executorSearch: string;
  fromAddress: string;
  toAddress: string;
  distanceKm: number;
  cargoDescription: string;
  cargoWeightKg: number;
  specialRequirements: string[];
  pricingMethod: 'fixed' | 'per_km' | '';
  fixedPrice: number;
  pricePerKm: number;
  paymentSplit: 'full_deposit' | 'upfront' | '';
  depositPercent: number;
  hasInsurance: boolean;
  conditions: string[];
}

export const INITIAL_TRANSPORT_DATA: TransportContractData = {
  title: '', deadline: '', executorSearch: '',
  fromAddress: '', toAddress: '', distanceKm: 0,
  cargoDescription: '', cargoWeightKg: 0,
  specialRequirements: [],
  pricingMethod: '', fixedPrice: 0, pricePerKm: 0,
  paymentSplit: '', depositPercent: 100,
  hasInsurance: false, conditions: [],
};
