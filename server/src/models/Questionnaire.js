import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Questionnaire = sequelize.define('Questionnaire', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id',
    },
  },
  industryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'industries',
      key: 'id',
    },
  },
  countryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'countries',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  questions: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
  conditionalLogic: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'questionnaires',
});

export default Questionnaire;