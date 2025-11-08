import express from "express";
import fs from "fs";
import Fuse from "fuse.js";

const app = express();
const PORT = 3000;

// Chargement du fichier JSON (assure-toi que ton fichier s'appelle bien cadastre.json)
let cadastreData = [];
try {
  const data = fs.readFileSync("cadastre.json", "utf8");
  cadastreData = JSON.parse(data);
  console.log(`✅ Données cadastrales chargées (${cadastreData.length} entrées)`);
} catch (error) {
  console.error("❌ Erreur de lecture du fichier cadastre.json :", error.message);
}

// Configuration de Fuse.js pour la recherche floue
const fuse = new Fuse(cadastreData, {
  keys: ["adresse", "commune"],
  threshold: 0.3,
});

// Route principale pour rechercher une adresse
app.get("/cadastre", (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Veuillez fournir un paramètre ?q=adresse" });
  }

  const resultats = fuse.search(query);
  res.json({
    total: resultats.length,
    results: resultats.slice(0, 5).map((r) => r.item),
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur API démarré sur http://localhost:${PORT}`);
});
