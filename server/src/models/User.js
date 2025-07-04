import { supabase } from '../config/database.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

export class User {
  constructor(data) {
    Object.assign(this, data);
  }

  static async findByPk(id) {
    try {
      logger.info('Finding user by ID:', id);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data ? new User(data) : null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findOne(options) {
    try {
      let query = supabase.from('users').select('*');

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (key === '$or') {
            // Handle OR conditions - for now, just use the first condition
            // This is a simplified implementation
            const firstCondition = value[0];
            const [field, val] = Object.entries(firstCondition)[0];
            logger.info('Searching user by field:', field, val);
            query = query.eq(field, val);
          } else {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data ? new User(data) : null;
    } catch (error) {
      logger.error('Error finding user:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      let query = supabase.from('users').select('*');

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (options.attributes?.exclude) {
        const allFields = ['id', 'username', 'email', 'password', 'role', 'first_name', 'last_name', 'phone', 'country', 'timezone', 'language', 'is_active', 'last_login', 'two_factor_enabled', 'two_factor_secret', 'created_at', 'updated_at', 'referred_by_partner_id', 'partner_specific_metadata', 'referral_code', 'partner_type'];
        const fieldsToSelect = allFields.filter(field => !options.attributes.exclude.includes(field));
        query = supabase.from('users').select(fieldsToSelect.join(','));
      }

      if (options.order) {
        const [field, direction] = options.order[0];
        query = query.order(field, { ascending: direction === 'ASC' });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(user => new User(user));
    } catch (error) {
      logger.error('Error finding users:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      logger.info('Creating user:', userData.email);
      
      // Hash password with a lower cost for development (faster)
      const saltRounds = process.env.NODE_ENV === 'development' ? 10 : 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          role: userData.role || 'End User',
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          country: userData.country,
          timezone: userData.timezone || 'UTC',
          language: userData.language || 'en',
          referred_by_partner_id: userData.referredByPartnerId,
          partner_specific_metadata: userData.partnerSpecificMetadata || {},
          referral_code: userData.referralCode,
          partner_type: userData.partnerType
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('User created successfully:', userData.email);
      return new User(data);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  static async count(options = {}) {
    try {
      let query = supabase.from('users').select('*', { count: 'exact', head: true });

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { count, error } = await query;

      if (error) throw error;

      return count;
    } catch (error) {
      logger.error('Error counting users:', error);
      throw error;
    }
  }

  async update(updateData) {
    try {
      const updates = {};
      
      if (updateData.username) updates.username = updateData.username;
      if (updateData.firstName) updates.first_name = updateData.firstName;
      if (updateData.lastName) updates.last_name = updateData.lastName;
      if (updateData.phone !== undefined) updates.phone = updateData.phone;
      if (updateData.country !== undefined) updates.country = updateData.country;
      if (updateData.timezone) updates.timezone = updateData.timezone;
      if (updateData.language) updates.language = updateData.language;
      if (updateData.lastLogin) updates.last_login = updateData.lastLogin;
      if (updateData.partnerSpecificMetadata !== undefined) updates.partner_specific_metadata = updateData.partnerSpecificMetadata;
      if (updateData.password) {
        const saltRounds = process.env.NODE_ENV === 'development' ? 10 : 12;
        updates.password = await bcrypt.hash(updateData.password, saltRounds);
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', this.id)
        .select()
        .single();

      if (error) throw error;

      Object.assign(this, data);
      return this;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async validatePassword(password) {
    try {
      logger.info('Validating password for user:', this.email);
      const isValid = await bcrypt.compare(password, this.password);
      logger.info('Password validation result:', isValid);
      return isValid;
    } catch (error) {
      logger.error('Error validating password:', error);
      return false;
    }
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      firstName: this.first_name,
      lastName: this.last_name,
      phone: this.phone,
      country: this.country,
      timezone: this.timezone,
      language: this.language,
      isActive: this.is_active,
      lastLogin: this.last_login,
      twoFactorEnabled: this.two_factor_enabled,
      referredByPartnerId: this.referred_by_partner_id,
      partnerSpecificMetadata: this.partner_specific_metadata,
      referralCode: this.referral_code,
      partnerType: this.partner_type,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
      onboarding_status: this.onboarding_status
    };
  }
}

export default User;