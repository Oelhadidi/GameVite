import { Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres"; // Changer MySQL pour PostgreSQL
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Configuration des variables d'environnement
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = parseInt(process.env.DB_PORT);

/**
 * Connexion à la base de données PostgreSQL
 */
export const sequelize = new Sequelize({
  dialect: PostgresDialect,
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
});

// Test de connexion
sequelize.authenticate()
  .then(() => console.log("Connecté à PostgreSQL avec Sequelize."))
  .catch((err) => console.error("Erreur de connexion PostgreSQL :", err));
