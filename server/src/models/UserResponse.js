import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const UserResponse = sequelize.define('UserResponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  questionnaireId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'questionnaires',
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
  answers: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  isComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Completion percentage',
  },
}, {
  tableName: 'user_responses',
});

export default UserResponse;