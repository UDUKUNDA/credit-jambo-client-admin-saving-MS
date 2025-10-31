// client-app/backend/src/models/Device.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config';
import User from './User';

interface DeviceAttributes {
  id: string;
  userId: string;
  deviceId: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DeviceCreationAttributes extends Optional<DeviceAttributes, 'id' | 'isVerified' | 'createdAt' | 'updatedAt'> {}

class Device extends Model<DeviceAttributes, DeviceCreationAttributes> implements DeviceAttributes {
  public id!: string;
  public userId!: string;
  public deviceId!: string;
  public isVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Device.init(
  {
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
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Device',
    tableName: 'devices',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'deviceId'],
      },
    ],
  }
);

// Associations
User.hasMany(Device, { foreignKey: 'userId', as: 'devices' });
Device.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Device;