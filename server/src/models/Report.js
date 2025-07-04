import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reportType: {
    type: DataTypes.ENUM('service_progress', 'trade_lead', 'financial', 'compliance', 'marketing_analytics'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  generatedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  filters: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  format: {
    type: DataTypes.ENUM('pdf', 'excel', 'json'),
    allowNull: false,
    defaultValue: 'pdf',
  },
  status: {
    type: DataTypes.ENUM('generating', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'generating',
  },
  generatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isScheduled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  scheduleConfig: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
}, {
  tableName: 'reports',
});

export default Report;