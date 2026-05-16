export interface ServiceContractData {
  title: string;
  description: string;
  executorSearch: string;
  deadline: string;
  pricingMethod: 'fixed' | 'hourly' | '';
  fixedPrice: number;
  hourlyRate: number;
  estimatedHours: number;
  paymentSplit: 'full_deposit' | 'upfront' | 'split' | '';
  depositPercent: number;
  requiredProofs: string[];
  hasAcceptanceProtocol: boolean;
  correctionDays: number;
  paymentDeadlineDays: number;
}

export const INITIAL_SERVICE_DATA: ServiceContractData = {
  title: '', description: '', executorSearch: '', deadline: '',
  pricingMethod: '', fixedPrice: 0, hourlyRate: 0, estimatedHours: 0,
  paymentSplit: '', depositPercent: 100,
  requiredProofs: [], hasAcceptanceProtocol: false,
  correctionDays: 7, paymentDeadlineDays: 14,
};
