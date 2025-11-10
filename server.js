import express from 'express';
import fs from 'fs';
import Fuse from 'fuse.js';

const app = express();
const PORT = 3000;

// Charger les données cadastrales
let cadastreData = [];
try {
  const data = fs.readFileSync("cadastre.json", "utf8");
  cadastreData = JSON.parse(data);
  console.log(`✅ Données cadastrales chargées (${cadastreData.length} entrées)`);
} catch (error) {
  console.error("❌ Erreur de lecture du fichier cadastre.json :", error.message);
}

// Configurer Fuse.js pour les données réelles
const fuse = new Fuse(cadastreData, {
  keys: ["adresse", "commune", "numero_parcelle", "section"],
  threshold: 0.3,
});

// Route principale pour rechercher dans le cadastre
app.get("/cadastre", (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Paramètre ?q= requis" });

  const results = fuse.search(query);
  res.json({
    total: results.length,
    results: results.slice(0, 10).map(r => r.item),
  });
});

// Route de test avec des données fictives
const exempleCadastres = [
  { id: 1, parcelle: 'A123', propriétaire: 'Dupont' },
  { id: 2, parcelle: 'B456', propriétaire: 'Martin' }
];
const fuseExemple = new Fuse(exempleCadastres, { keys: ['parcelle', 'propriétaire'], threshold: 0.3 });

app.get('/recherche', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Paramètre q manquant' });

  const résultats = fuseExemple.search(q).map(r => r.item);
  res.json(résultats);
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur cadastre-agent en ligne sur http://localhost:${PORT}`);
});
