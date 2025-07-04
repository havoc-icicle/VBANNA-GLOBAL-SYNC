import { supabase } from '../config/database.js';

export class Invoice {
  constructor(data) {
    Object.assign(this, data);
  }

  static async findByPk(id) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? new Invoice(data) : null;
  }

  static async create(invoiceData) {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceData.invoiceNumber,
        order_id: invoiceData.orderId,
        base_amount: invoiceData.baseAmount,
        discount_amount: invoiceData.discountAmount || 0,
        surcharge_amount: invoiceData.surchargeAmount || 0,
        tax_amount: invoiceData.taxAmount || 0,
        total_amount: invoiceData.totalAmount,
        currency: invoiceData.currency,
        status: invoiceData.status || 'draft',
        line_items: invoiceData.lineItems || [],
        billing_address: invoiceData.billingAddress || {},
        company_details: invoiceData.companyDetails || {}
      })
      .select()
      .single();

    if (error) throw error;

    return new Invoice(data);
  }

  toJSON() {
    return {
      id: this.id,
      invoiceNumber: this.invoice_number,
      orderId: this.order_id,
      baseAmount: parseFloat(this.base_amount),
      discountAmount: parseFloat(this.discount_amount),
      surchargeAmount: parseFloat(this.surcharge_amount),
      taxAmount: parseFloat(this.tax_amount),
      totalAmount: parseFloat(this.total_amount),
      currency: this.currency,
      status: this.status,
      issuedAt: this.issued_at,
      dueDate: this.due_date,
      paidAt: this.paid_at,
      paidAmount: parseFloat(this.paid_amount),
      remainingAmount: parseFloat(this.remaining_amount),
      notes: this.notes,
      lineItems: this.line_items,
      billingAddress: this.billing_address,
      companyDetails: this.company_details,
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };
  }
}

export default Invoice;