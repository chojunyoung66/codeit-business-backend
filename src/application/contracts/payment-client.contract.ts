export interface IPaymentClient {
  confirm: (params: {
    paymentKey: string;
    orderId: string;
    amount: number;
  }) => Promise<{ status: string }>;
}
