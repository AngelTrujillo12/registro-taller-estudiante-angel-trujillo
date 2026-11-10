const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbFile = path.resolve(__dirname, "registro_taller.db");
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error("Error al abrir la base de datos", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS inscripciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL,
      telefono TEXT NOT NULL,
      taller TEXT NOT NULL,
      horario TEXT NOT NULL,
      modalidad TEXT NOT NULL,
      nivel_experiencia TEXT NOT NULL,
      fecha_registro TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;