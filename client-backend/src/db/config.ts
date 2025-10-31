// backend/src/config/database.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    retry: {
      max: 3,
      timeout: 30000,
    },
  }
);

export const connectDB = async (): Promise<void> => {
  try {
    let retries = 5;
    while (retries) {
      try {
        await sequelize.authenticate();
        console.log('Database connected successfully');
        
        if (process.env.NODE_ENV === 'development') {
          await sequelize.sync({ alter: true });
          console.log('Database synced');
        }
        break;
      } catch (error) {
        console.log(`Database connection failed. Retries left: ${retries}`);
        retries -= 1;
        
        if (retries === 0) {
          throw error;
        }
        
        await new Promise(res => setTimeout(res, 5000));
      }
    }
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

export default sequelize;