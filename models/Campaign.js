import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Campaign = sequelize.define("Campaign", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("DRAFT", "ACTIVE", "PAUSED", "COMPLETED"),
      defaultValue: "DRAFT",
    },
    rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    maxPayout: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalViews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalLikes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    serverUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    discordGuildId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  // Define associations in the model
  Campaign.associate = (models) => {
    Campaign.hasMany(models.Clip, {
      foreignKey: "campaignId",
      as: "clips",
    });
  };

  return Campaign;
};
