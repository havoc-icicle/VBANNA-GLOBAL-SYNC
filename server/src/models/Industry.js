import { supabase } from '../config/database.js';

export class Industry {
  constructor(data) {
    Object.assign(this, data);
  }

  static async findByPk(id) {
    const { data, error } = await supabase
      .from('industries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? new Industry(data) : null;
  }

  static async findAll(options = {}) {
    let query = supabase.from('industries').select('*');

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

    return data.map(industry => new Industry(industry));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      specificRequirements: this.specific_requirements,
      questionnaireFields: this.questionnaire_fields,
      complianceRequirements: this.compliance_requirements,
      isActive: this.is_active,
      createdAt: this.created_at,
      updatedAt: this.updated_at
    };
  }
}

export default Industry;