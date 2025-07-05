import { supabase } from '../config/database.js';

export class TradeLead {
  constructor(data) {
    Object.assign(this, data);
  }

  static async findByPk(id) {
    const { data, error } = await supabase
      .from('trade_leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? new TradeLead(data) : null;
  }

  static async findAll(options = {}) {
    let query = supabase.from('trade_leads').select('*');

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (key === 'orderId') {
          query = query.eq('order_id', value);
        } else {
          query = query.eq(key, value);
        }
      });
    }

    if (options.order) {
      options.order.forEach(([field, direction]) => {
        query = query.order(field, { ascending: direction === 'ASC' });
      });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(lead => new TradeLead(lead));
  }

  static async create(leadData) {
    const { data, error } = await supabase
      .from('trade_leads')
      .insert({
        order_id: leadData.orderId,
        hsn_code: leadData.hsnCode,
        product_name: leadData.productName,
        lead_type: leadData.leadType,
        company_name: leadData.companyName,
        contact_person: leadData.contactPerson,
        email: leadData.email,
        phone: leadData.phone,
        country: leadData.country,
        address: leadData.address,
        trade_history: leadData.tradeHistory || {},
        compliance_status: leadData.complianceStatus || {},
        outreach_templates: leadData.outreachTemplates || [],
        status: leadData.status || 'pending',
        vetted: leadData.vetted || false,
        vetted_by: leadData.vettedBy,
        vetted_at: leadData.vettedAt,
        market_data: leadData.marketData || {},
        priority: leadData.priority || 1,
        refinement_count: leadData.refinementCount || 0,
        max_refinements: leadData.maxRefinements || 1,
      })
      .select()
      .single();

    if (error) throw error;

    return new TradeLead(data);
  }

  async update(updateData) {
    const updates = {};
    if (updateData.hsnCode) updates.hsn_code = updateData.hsnCode;
    if (updateData.productName) updates.product_name = updateData.productName;
    if (updateData.leadType) updates.lead_type = updateData.leadType;
    if (updateData.companyName) updates.company_name = updateData.companyName;
    if (updateData.contactPerson) updates.contact_person = updateData.contactPerson;
    if (updateData.email) updates.email = updateData.email;
    if (updateData.phone !== undefined) updates.phone = updateData.phone;
    if (updateData.country) updates.country = updateData.country;
    if (updateData.address !== undefined) updates.address = updateData.address;
    if (updateData.tradeHistory) updates.trade_history = updateData.tradeHistory;
    if (updateData.complianceStatus) updates.compliance_status = updateData.complianceStatus;
    if (updateData.outreachTemplates) updates.outreach_templates = updateData.outreachTemplates;
    if (updateData.status) updates.status = updateData.status;
    if (updateData.vetted !== undefined) updates.vetted = updateData.vetted;
    if (updateData.vettedBy !== undefined) updates.vetted_by = updateData.vettedBy;
    if (updateData.vettedAt !== undefined) updates.vetted_at = updateData.vettedAt;
    if (updateData.marketData) updates.market_data = updateData.marketData;
    if (updateData.priority !== undefined) updates.priority = updateData.priority;
    if (updateData.refinementCount !== undefined) updates.refinement_count = updateData.refinementCount;
    if (updateData.maxRefinements !== undefined) updates.max_refinements = updateData.maxRefinements;

    const { data, error } = await supabase
      .from('trade_leads')
      .update(updates)
      .eq('id', this.id)
      .select()
      .single();

    if (error) throw error;

    Object.assign(this, data);
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.order_id,
      hsnCode: this.hsn_code,
      productName: this.product_name,
      leadType: this.lead_type,
      companyName: this.company_name,
      contactPerson: this.contact_person,
      email: this.email,
      phone: this.phone,
      country: this.country,
      address: this.address,
      tradeHistory: this.trade_history,
      complianceStatus: this.compliance_status,
      outreachTemplates: this.outreach_templates,
      status: this.status,
      vetted: this.vetted,
      vettedBy: this.vetted_by,
      vettedAt: this.vetted_at,
      marketData: this.market_data,
      priority: this.priority,
      refinementCount: this.refinement_count,
      maxRevisions: this.max_refinements,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    };
  }
}