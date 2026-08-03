const express = require('express');
const path = require('path');
const fs = require('fs');
const news = require('./src/data/news');
const { getLapfData, getLapfNews } = require('./src/services/lapf');

const RIFAS_PATH = path.join(__dirname, 'src/data/rifas.json');
function getRifas() {
  try { return JSON.parse(fs.readFileSync(RIFAS_PATH, 'utf8')); }
  catch { return { vendidas: [] }; }
}
function saveRifas(data) {
  fs.writeFileSync(RIFAS_PATH, JSON.stringify(data, null, 2));
}

const app = express();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API rifas
app.get('/api/rifas', (req, res) => {
  res.json(getRifas());
});

// Admin: marcar números como vendidos — /api/rifas/marcar?token=SLVC2025&numeros=8001,8045
const ADMIN_TOKEN = process.env.RIFAS_TOKEN || 'SLVC2025';
app.post('/api/rifas/marcar', (req, res) => {
  if (req.query.token !== ADMIN_TOKEN) return res.status(401).json({ error: 'No autorizado' });
  const nuevos = (req.body.numeros || []).map(Number).filter(n => n >= 8000 && n <= 9000);
  const data = getRifas();
  data.vendidas = [...new Set([...data.vendidas, ...nuevos])].sort((a,b)=>a-b);
  saveRifas(data);
  res.json({ ok: true, vendidas: data.vendidas.length });
});

app.post('/api/rifas/liberar', (req, res) => {
  if (req.query.token !== ADMIN_TOKEN) return res.status(401).json({ error: 'No autorizado' });
  const liberar = (req.body.numeros || []).map(Number);
  const data = getRifas();
  data.vendidas = data.vendidas.filter(n => !liberar.includes(n));
  saveRifas(data);
  res.json({ ok: true, vendidas: data.vendidas.length });
});

app.get('/', async (req, res) => {
  const [d, lapfNews] = await Promise.all([getLapfData(), getLapfNews()]);
  res.render('index', {
    fixture: d.fixture, tabla: d.tabla, teams: d.teams, proximoPartido: d.proximoPartido,
    news: news.slice(0, 6),
    r1Fixture: d.r1Fixture, r2Fixture: d.r2Fixture,
    r1Fechas: d.r1Fechas,   r2Fechas: d.r2Fechas,
    r1Default: d.r1Default, r2Default: d.r2Default,
    activeRueda: d.activeRueda,
    // compat legacy
    fechas: d.fechas, rueda: d.activeRueda,
    lapfNews,
  });
});

app.get('/admin', (req, res) => {
  res.render('admin');
});

app.get('/noticias', (req, res) => {
  res.render('noticias', { news });
});

app.get('/noticias/:slug', (req, res) => {
  const idx = news.findIndex(n => n.slug === req.params.slug);
  if (idx === -1) return res.status(404).send('Noticia no encontrada');
  res.render('noticia', {
    noticia: news[idx],
    prev: idx > 0 ? news[idx - 1] : null,
    next: idx < news.length - 1 ? news[idx + 1] : null,
  });
});

app.listen(PORT, () => {
  console.log(`SLVC running at http://localhost:${PORT}`);
});
