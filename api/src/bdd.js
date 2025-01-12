import { Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Configuration des variables d'environnement
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST ;
const DB_PORT = parseInt(process.env.DB_PORT);

/**
 * Fonction pour vérifier et créer la base de données si elle n'existe pas
 */
async function createDatabaseIfNotExists() {
	try {
		const connection = await mysql.createConnection({
			host: DB_HOST,
			port: DB_PORT,
			user: DB_USER,
			password: DB_PASSWORD,
		});
		await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
		await connection.end();
		console.log(`Base de données "${DB_NAME}" vérifiée et créée si nécessaire.`);
	} catch (error) {
		console.error("Erreur lors de la création de la base de données:", error);
		throw error;
	}
}

/**
 * Connexion à la base de données
 */
await createDatabaseIfNotExists();

export const sequelize = new Sequelize({
	dialect: MySqlDialect,
	database: DB_NAME,
	user: DB_USER,
	password: DB_PASSWORD,
	host: DB_HOST,
	port: DB_PORT,
});
