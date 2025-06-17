import mysql from 'mysql2/promise';

// Passe diese Werte ggf. an deine XAMPP-Konfiguration an
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Standard bei XAMPP ist oft leer
  database: 'test', // Passe ggf. an deinen DB-Namen an
});

export default pool;
