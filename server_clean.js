import express from "express";
import fs from "fs";
import Fuse from "fuse.js";

const app = express();
const PORT = 3000;

// Charger le fichier GeoJSON
let cadastreData = [];
try {
  const data = JSON.parse(fs.readFileSync("cadastre-33440-parcelles.json", "utf8"));
  // Extraire les propriétés utiles
  cadastreData = data.features.map(f => ({
    id: f.properties.id,
    commune: f.properties.commune,
    section: f.properties.section,
    numero: f.properties.numero,
    code: `${f.properties.section}_${f.properties.numero}`
  }));
  console.log(`✅ Données cadastrales chargées (${cadastreData.length} parcelles)`);
} catch (error) {
  console.error("❌ Erreur de lecture du fichier :", error.message);
}

// Configurer Fuse.js pour la recherche floue
const fuse = new Fuse(cadastreData, {
  keys: ["code", "id", "section", "numero"],
  threshold: 0.3,
});

// Route principale pour la recherche
app.get("/cadastre", (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Veuillez fournir un paramètre ?q=" });
  }

  const resultats = fuse.search(query);
  res.json({
    total: resultats.length,
    results: resultats.slice(0, 5).map(r => r.item),
  });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur cadastre-agent en ligne sur http://localhost:${PORT}`);
});
