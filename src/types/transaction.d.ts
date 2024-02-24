type Payment = {
  _id?: string;
  ref: string;
  campaign: Campaign;
  user: User;
  amount: number;
  currency: string;
  status: 'paid' | 'pending';
  paystackRef?: string;
  paystackFee?: number;
  paymentMethod: 'mobile_money' | 'card';
  techFee: number;
  paidAt?: Date;
  authorizationCode?: string;
  createdAt: Date;
  updatedAt: Date;
};

type AppTransaction = {
  _id: string;
  amount: number;
  campaign: string | Campaign;
  currency: string;
  type: 'payin' | 'payout';
  raised: number;
  current: number;
  payment?: Payment;
  payout?: Payout;
  createdAt: Date;
  updatedAt: Date;
};

type Payout = {
  _id?: string;
  user: User | string;
  ref: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending';
  paystackRef?: string;
  paystackFee?: number;
  paymentMethod: 'mobile_money' | 'card';
  paidAt?: Date;
  authorizationCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
