import { supabase } from '../config/database.js';

export class Order {
  constructor(data) {
    Object.assign(this, data);
  }

  static async findByPk(id, options = {}) {
    let query = supabase.from('orders').select('*');

    if (options.include) {
      const includes = [];
      options.include.forEach(inc => {
        if (inc.model === 'Service' || inc.as === 'service') {
          includes.push('service:services(*)');
        }
        if (inc.model === 'User' || inc.as === 'user') {
          includes.push('user:users(id,first_name,last_name,email,role)');
        }
        if (inc.model === 'Payment' || inc.as === 'payments') {
          includes.push('payments(*)');
        }
        if (inc.model === 'Invoice' || inc.as === 'invoice') {
          includes.push('invoice:invoices(*)');
        }
      });
      if (includes.length > 0) {
        query = query.select(`*, ${includes.join(', ')}`);
      }
    }

    const { data, error } = await query.eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? new Order(data) : null;
  }

  static async findOne(options) {
    let query = supabase.from('orders').select('*');

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (key === 'userId') {
          query = query.eq('user_id', value);
        } else {
          query = query.eq(key, value);
        }
      });
    }

    if (options.include) {
      const includes = [];
      options.include.forEach(inc => {
        if (inc.model === 'Service' || inc.as === 'service') {
          includes.push('service:services(*)');
        }
        if (inc.model === 'User' || inc.as === 'user') {
          includes.push('user:users(id,first_name,last_name,email,role)');
        }
        if (inc.model === 'Payment' || inc.as === 'payments') {
          includes.push('payments(*)');
        }
        if (inc.model === 'Invoice' || inc.as === 'invoice') {
          includes.push('invoice:invoices(*)');
        }
      });
      if (includes.length > 0) {
        query = query.select(`*, ${includes.join(', ')}`);
      }
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? new Order(data) : null;
  }

  static async findAndCountAll(options = {}) {
    let query = supabase.from('orders').select(`
      *,
      service:services(id, name, category, description),
      user:users(id, first_name, last_name, email, role),
      payments(*),
      invoice:invoices(*)
    `, { count: 'exact' });

    // Apply user filtering - this is crucial for security
    if (options.user_id) {
      query = query.eq('user_id', options.user_id);
    }

    // Apply status filtering
    if (options.status) {
      query = query.eq('status', options.status);
    }

    // Apply priority filtering
    if (options.priority) {
      query = query.eq('priority', options.priority);
    }

    // Apply search filtering (search in service name)
    if (options.search) {
      // For search, we need to filter on the service name
      // This requires a more complex query, for now we'll implement basic search
      query = query.or(`order_number.ilike.%${options.search}%`);
    }

    // Default ordering
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    if (options.page && options.limit) {
      const offset = (options.page - 1) * options.limit;
      query = query.range(offset, offset + options.limit - 1);
    } else if (options.limit) {
      query = query.limit(options.limit);
    }

    console.log('Executing order query for user:', options.user_id || 'all users');

    const { data, error, count } = await query;

    if (error) {
      console.error('Order query error:', error);
      throw error;
    }

    console.log(`Query returned ${data?.length || 0} orders out of ${count} total`);

    return {
      rows: data.map(order => new Order(order)),
      count: count || 0
    };
  }

  static async count(options = {}) {
    let query = supabase.from('orders').select('*', { count: 'exact', head: true });

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (key === 'userId') {
          query = query.eq('user_id', value);
        } else {
          query = query.eq(key, value);
        }
      });
    }

    if (options.include) {
      options.include.forEach(inc => {
        if (inc.model === 'Payment' && inc.where) {
          // Handle payment filtering for count
          Object.entries(inc.where).forEach(([paymentKey, paymentValue]) => {
            query = query.not('payments', 'is', null);
          });
        }
      });
    }

    const { count, error } = await query;

    if (error) throw error;

    return count;
  }

  static async create(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderData.orderNumber,
        user_id: orderData.userId,
        service_id: orderData.serviceId,
        status: orderData.status || 'pending',
        priority: orderData.priority || 'standard',
        base_price: orderData.basePrice,
        discount: orderData.discount || 0,
        surcharge: orderData.surcharge || 0,
        tax_amount: orderData.taxAmount || 0,
        total_price: orderData.totalPrice,
        currency: orderData.currency || 'SGD',
        expected_completion_date: orderData.expectedCompletionDate,
        max_revisions: orderData.maxRevisions || 1,
        requirements: orderData.requirements || {},
        is_partial_payment_allowed: orderData.isPartialPaymentAllowed || false,
        payment_schedule: orderData.paymentSchedule || []
      })
      .select()
      .single();

    if (error) throw error;

    return new Order(data);
  }

  async update(updateData) {
    const updates = {};
    
    if (updateData.status) updates.status = updateData.status;
    if (updateData.notes !== undefined) updates.notes = updateData.notes;
    if (updateData.startDate) updates.start_date = updateData.startDate;
    if (updateData.actualCompletionDate) updates.actual_completion_date = updateData.actualCompletionDate;
    if (updateData.revisionCount !== undefined) updates.revision_count = updateData.revisionCount;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', this.id)
      .select()
      .single();

    if (error) throw error;

    Object.assign(this, data);
    return this;
  }

  toJSON() {
    const result = {
      id: this.id,
      orderNumber: this.order_number,
      userId: this.user_id,
      serviceId: this.service_id,
      status: this.status,
      priority: this.priority,
      basePrice: parseFloat(this.base_price),
      discount: parseFloat(this.discount),
      surcharge: parseFloat(this.surcharge),
      taxAmount: parseFloat(this.tax_amount),
      totalPrice: parseFloat(this.total_price),
      currency: this.currency,
      startDate: this.start_date,
      expectedCompletionDate: this.expected_completion_date,
      actualCompletionDate: this.actual_completion_date,
      revisionCount: this.revision_count,
      maxRevisions: this.max_revisions,
      requirements: this.requirements,
      deliverables: this.deliverables,
      notes: this.notes,
      isPartialPaymentAllowed: this.is_partial_payment_allowed,
      paymentSchedule: this.payment_schedule,
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };

    // Include related data if present
    if (this.service) result.service = this.service;
    if (this.user) result.user = this.user;
    if (this.payments) result.payments = this.payments;
    if (this.invoice) result.invoice = this.invoice;

    return result;
  }
}

export default Order;