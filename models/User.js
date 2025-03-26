import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    discordId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    totalViews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    currentBalance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    }
  });

  return User;
}; 