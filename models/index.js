import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import UserModel from './User.js';
import SocialMediaAccountModel from './SocialMediaAccount.js';
import ClipModel from './Clip.js';
import PaymentModel from './Payment.js';
import CampaignModel from './Campaign.js';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: isProduction ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {} // No SSL for local development
});

// Initialize models
const db = {
  sequelize,
  Sequelize,
  User: UserModel(sequelize),
  SocialMediaAccount: SocialMediaAccountModel(sequelize),
  Clip: ClipModel(sequelize),
  Payment: PaymentModel(sequelize),
  Campaign: CampaignModel(sequelize)
};

// Setup associations
db.User.hasMany(db.SocialMediaAccount);
db.SocialMediaAccount.belongsTo(db.User);

db.SocialMediaAccount.hasMany(db.Clip);
db.Clip.belongsTo(db.SocialMediaAccount);

db.User.hasMany(db.Payment);
db.Payment.belongsTo(db.User);

// Test connection and sync models
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch((err) => {
    console.error('Error:', err);
  });

export default db; 