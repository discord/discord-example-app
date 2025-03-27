import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Clip = sequelize.define('Clip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    platform: {
      type: DataTypes.ENUM('INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'X'),
      allowNull: false
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    socialMediaAccountId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'SocialMediaAccounts',
        key: 'id'
      }
    },
    lastMetadataUpdate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  });

  return Clip;
}; 