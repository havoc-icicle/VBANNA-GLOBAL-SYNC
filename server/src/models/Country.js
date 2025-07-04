import { supabase } from '../config/database.js';

export class Country {
  constructor(data) {
    Object.assign(this, data);
  }

  static async findByPk(id) {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? new Country(data) : null;
  }

  static async findOne(options) {
    let query = supabase.from('countries').select('*');

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

    return data ? new Country(data) : null;
  }

  static async findAll(options = {}) {
    let query = supabase.from('countries').select('*');

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options.order) {
      options.order.forEach(([field, direction]) => {
        query = query.order(field, { ascending: direction === 'ASC' });
      });
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(country => new Country(country));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      taxRate: parseFloat(this.tax_rate),
      taxName: this.tax_name,
      currency: this.currency,
      timezone: this.timezone,
      complianceRequirements: this.compliance_requirements,
      regulatoryBodies: this.regulatory_bodies,
      isActive: this.is_active,
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };
  }
}

export default Country;