export type ItemCondition = 'new' | 'used' | 'refurbished';
export type DeliveryMethod = 'pickup' | 'shipping' | 'none';
export type SalePaymentMethod = 'bank_transfer' | 'cash' | 'deposit';

export interface SaleContractData {
  itemName: string;
  itemDescription: string;
  itemCondition: ItemCondition | '';
  quantity: number;
  price: number;
  includesVAT: boolean;
  deliveryMethod: DeliveryMethod | '';
  deliveryPrice: number;
  paymentMethod: SalePaymentMethod | '';
  warrantyDays: number;
  hasReturnPolicy: boolean;
  returnDays: number;
  conditions: string[];
}

export const INITIAL_SALE_DATA: SaleContractData = {
  itemName: '', itemDescription: '', itemCondition: '',
  quantity: 1, price: 0, includesVAT: false,
  deliveryMethod: '', deliveryPrice: 0,
  paymentMethod: '', warrantyDays: 0,
  hasReturnPolicy: false, returnDays: 14, conditions: [],
};
