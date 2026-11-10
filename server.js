const express = require("express");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// GET: Leer inscripciones
app.get("/api/inscripciones", (req, res) => {
  db.all(
    "SELECT id, nombre, correo, telefono, taller, horario, modalidad, nivel_experiencia, fecha_registro FROM inscripciones ORDER BY id DESC",
    [],
    (err, filas) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(filas);
    }
  );
});

// POST: Guardar inscripción
app.post("/api/inscripciones", (req, res) => {
  const cuerpo = req.body ?? {};
  const texto = (valor) => (typeof valor === "string" ? valor.trim() : "");

  const datos = {
    nombre: texto(cuerpo.nombre),
    correo: texto(cuerpo.correo),
    telefono: texto(cuerpo.telefono),
    taller: texto(cuerpo.taller),
    horario: texto(cuerpo.horario),
    modalidad: texto(cuerpo.modalidad),
    nivel_experiencia: texto(cuerpo.nivel_experiencia)
  };

  if (Object.values(datos).some((valor) => !valor)) {
    return res.status(400).json({ error: "Completa todos los campos." });
  }

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo);
  if (!correoValido) {
    return res.status(400).json({ error: "Escribe un correo válido." });
  }

  const query = `INSERT INTO inscripciones (nombre, correo, telefono, taller, horario, modalidad, nivel_experiencia) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [datos.nombre, datos.correo, datos.telefono, datos.taller, datos.horario, datos.modalidad, datos.nivel_experiencia];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      mensaje: "Inscripción guardada correctamente.",
      id: this.lastID
    });
  });
});

// PUT: Actualizar inscripción
app.put("/api/inscripciones/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Id inválido." });
  }

  const cuerpo = req.body ?? {};
  const texto = (valor) => (typeof valor === "string" ? valor.trim() : "");

  const datos = {
    nombre: texto(cuerpo.nombre),
    correo: texto(cuerpo.correo),
    telefono: texto(cuerpo.telefono),
    taller: texto(cuerpo.taller),
    horario: texto(cuerpo.horario),
    modalidad: texto(cuerpo.modalidad),
    nivel_experiencia: texto(cuerpo.nivel_experiencia)
  };

  if (Object.values(datos).some((valor) => !valor)) {
    return res.status(400).json({ error: "Completa los campos." });
  }

  const query = `UPDATE inscripciones SET nombre=?, correo=?, telefono=?, taller=?, horario=?, modalidad=?, nivel_experiencia=? WHERE id=?`;
  const params = [datos.nombre, datos.correo, datos.telefono, datos.taller, datos.horario, datos.modalidad, datos.nivel_experiencia, id];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "No se encontró la inscripción." });
    }
    res.json({ mensaje: "Inscripción actualizada." });
  });
});

// DELETE: Eliminar inscripción
app.delete("/api/inscripciones/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Id inválido." });
  }

  db.run("DELETE FROM inscripciones WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "No se encontró la inscripción." });
    }
    res.json({ mensaje: "Inscripción eliminada." });
  });
});

// GET: Reportes
app.get("/api/reportes/resumen", (req, res) => {
  db.get("SELECT COUNT(*) AS total FROM inscripciones", [], (err, totalRes) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all("SELECT taller, COUNT(*) AS cantidad FROM inscripciones GROUP BY taller ORDER BY cantidad DESC", [], (err, porTaller) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all("SELECT horario, COUNT(*) AS cantidad FROM inscripciones GROUP BY horario ORDER BY horario", [], (err, porHorario) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all("SELECT modalidad, COUNT(*) AS cantidad FROM inscripciones GROUP BY modalidad ORDER BY cantidad DESC", [], (err, porModalidad) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            total: totalRes ? totalRes.total : 0,
            porTaller,
            porHorario,
            porModalidad
          });
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de Angel Trujillo corriendo en http://localhost:${PORT}`);
});