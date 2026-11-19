import "dotenv/config";
import { get } from "env-var";

export const envs = {
  PORT: get("PORT").required().asPortNumber(),

  DB_HOST: get("DB_HOST").required().asString(),
  DB_PORT: get("DB_PORT").required().asPortNumber(),
  DB_USER: get("DB_USER").required().asString(),
  DB_PASSWORD: get("DB_PASSWORD").required().asString(),
  DB_NAME: get("DB_NAME").required().asString(),

  JWT_SECRET_KEY: get("JWT_SECRET_KEY").required().asString(),
  RRHH_API_URL: get("RRHH_API_URL").required().asString(),

  MAIL_USER: get("MAIL_USER").required().asString(),
  MAIL_PASSWORD: get("MAIL_PASSWORD").required().asString(),
};
