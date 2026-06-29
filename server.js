const express = require('express');
const path = require('path');
const news = require('./src/data/news');
const { getLapfData } = require('./src/services/lapf');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  const { fixture, tabla, teams, proximoPartido } = await getLapfData();
  const fechas = [...new Set(fixture.map(m => m.fecha))].sort((a, b) => a - b);
  res.render('index', { fixture, tabla, teams, proximoPartido, news: news.slice(0, 6), fechas });
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
