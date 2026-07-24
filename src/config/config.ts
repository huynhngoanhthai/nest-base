import 'dotenv/config';

export const CONFIG = {
  NODE_ENV: process.env.NODE_ENV,
  VERSION: process.env.VERSION || '',
  PORT: +process.env.PORT!,
  API_PREFIX: process.env.API_PREFIX,

  //JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,

  // Bcrypt
  BCRYPT_SALT_ROUNDS: +process.env.BCRYPT_SALT_ROUNDS!,

  // DATABASE
  DATABASE: {
    TYPE: (process.env.DB_TYPE || 'mysql') as 'mysql',
    HOST: process.env.DB_HOST,
    PORT: +(process.env.DB_PORT || 3306),
    USERNAME: process.env.DB_USERNAME,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE: process.env.DB_DATABASE,
    SYNCHRONIZE: process.env.DB_SYNCHRONIZE == 'true',
    LOGGING: process.env.DB_LOGGING == 'true',
  },
};
