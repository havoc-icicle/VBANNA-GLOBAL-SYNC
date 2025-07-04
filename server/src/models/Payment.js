import { supabase } from '../config/database.js';

export class Payment {
  constructor(data) {
    Object.assign(this, data);
  }

  static async findByPk(id) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? new Payment(data) : null;
  }

  static async create(paymentData) {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: paymentData.orderId,
        payment_intent_id: paymentData.paymentIntentId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method: paymentData.paymentMethod,
        status: paymentData.status || 'pending',
        transaction_id: paymentData.transactionId,
        paid_at: paymentData.paidAt,
        failure_reason: paymentData.failureReason,
        refund_reason: paymentData.refundReason,
        refund_amount: paymentData.refundAmount,
        metadata: paymentData.metadata || {},
        is_partial_payment: paymentData.isPartialPayment || false,
        payment_schedule_index: paymentData.paymentScheduleIndex
      })
      .select()
      .single();

    if (error) throw error;

    return new Payment(data);
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.order_id,
      paymentIntentId: this.payment_intent_id,
      amount: parseFloat(this.amount),
      currency: this.currency,
      paymentMethod: this.payment_method,
      status: this.status,
      transactionId: this.transaction_id,
      paidAt: this.paid_at,
      failureReason: this.failure_reason,
      refundReason: this.refund_reason,
      refundAmount: this.refund_amount ? parseFloat(this.refund_amount) : null,
      metadata: this.metadata,
      isPartialPayment: this.is_partial_payment,
      paymentScheduleIndex: this.payment_schedule_index,
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };
  }
}

export default Payment;