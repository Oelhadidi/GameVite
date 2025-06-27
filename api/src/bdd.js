import { Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql"; // MySQL pour WAMP Server
import mysql2 from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Configuration des variables d'environnement
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = parseInt(process.env.DB_PORT);

/**
 * Connexion à la base de données MySQL
 */
export const sequelize = new Sequelize({
  dialect: 'mysql',
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
});

// Test de connexion
sequelize.authenticate()
  .then(() => console.log("Connecté à MySQL avec Sequelize."))
  .catch((err) => console.error("Erreur de connexion MySQL :", err));
