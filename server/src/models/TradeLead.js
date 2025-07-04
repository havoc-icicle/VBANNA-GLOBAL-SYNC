import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const TradeLead = sequelize.define('TradeLead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  hsnCode: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '8-digit HSN code',
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  leadType: {
    type: DataTypes.ENUM('buyer', 'seller'),
    allowNull: false,
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tradeHistory: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  complianceStatus: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  outreachTemplates: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'refined'),
    allowNull: false,
    defaultValue: 'pending',
  },
  vetted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  vettedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  vettedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  marketData: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Priority ranking for this lead',
  },
}, {
  tableName: 'trade_leads',
});

export default TradeLead;