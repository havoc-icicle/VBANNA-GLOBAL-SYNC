import { supabase } from '../config/database.js';

export class Service {
  constructor(data) {
    Object.assign(this, data);
  }

  static async findByPk(id) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? new Service(data) : null;
  }

  static async findAll(options = {}) {
    let query = supabase.from('services').select('*');

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (key === 'isActive') {
          query = query.eq('is_active', value);
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

    const { data, error } = await query;

    if (error) throw error;

    return data.map(service => new Service(service));
  }

  static async findOne(options) {
    let query = supabase.from('services').select('*');

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? new Service(data) : null;
  }

  static async create(serviceData) {
    const { data, error } = await supabase
      .from('services')
      .insert({
        name: serviceData.name,
        category: serviceData.category,
        description: serviceData.description,
        deliverables: serviceData.deliverables || [],
        revision_policy: serviceData.revisionPolicy || 1,
        standard_turnaround_days: serviceData.standardTurnaroundDays,
        rush_turnaround_days: serviceData.rushTurnaroundDays,
        price_min: serviceData.priceMin,
        price_max: serviceData.priceMax,
        currency: serviceData.currency || 'SGD',
        rush_surcharge_percent: serviceData.rushSurchargePercent,
        features: serviceData.features || [],
        additional_notes: serviceData.additionalNotes
      })
      .select()
      .single();

    if (error) throw error;

    return new Service(data);
  }

  async update(updateData) {
    const updates = {};
    
    if (updateData.name) updates.name = updateData.name;
    if (updateData.category) updates.category = updateData.category;
    if (updateData.description !== undefined) updates.description = updateData.description;
    if (updateData.deliverables) updates.deliverables = updateData.deliverables;
    if (updateData.revisionPolicy !== undefined) updates.revision_policy = updateData.revisionPolicy;
    if (updateData.standardTurnaroundDays) updates.standard_turnaround_days = updateData.standardTurnaroundDays;
    if (updateData.rushTurnaroundDays !== undefined) updates.rush_turnaround_days = updateData.rushTurnaroundDays;
    if (updateData.priceMin !== undefined) updates.price_min = updateData.priceMin;
    if (updateData.priceMax !== undefined) updates.price_max = updateData.priceMax;
    if (updateData.currency) updates.currency = updateData.currency;
    if (updateData.rushSurchargePercent !== undefined) updates.rush_surcharge_percent = updateData.rushSurchargePercent;
    if (updateData.features) updates.features = updateData.features;
    if (updateData.additionalNotes !== undefined) updates.additional_notes = updateData.additionalNotes;
    if (updateData.isActive !== undefined) updates.is_active = updateData.isActive;

    const { data, error } = await supabase
      .from('services')
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
      name: this.name,
      category: this.category,
      description: this.description,
      deliverables: this.deliverables,
      revisionPolicy: this.revision_policy,
      standardTurnaroundDays: this.standard_turnaround_days,
      rushTurnaroundDays: this.rush_turnaround_days,
      priceMin: parseFloat(this.price_min),
      priceMax: parseFloat(this.price_max),
      currency: this.currency,
      rushSurchargePercent: this.rush_surcharge_percent ? parseFloat(this.rush_surcharge_percent) : null,
      isActive: this.is_active,
      features: this.features,
      additionalNotes: this.additional_notes,
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };
  }
}

export default Service;