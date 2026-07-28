/**
 * Scraper de Liga Amateur Platense de Fútbol
 * Trae Rueda 1 (zona=1) y Rueda 2 (zona=2) completas, con caché de 30 minutos.
 */

const https = require('https');
const fallback = require('../data/fixture');

const CACHE_TTL = 30 * 60 * 1000;
let cache = null;
let cacheTs = 0;

const BASE = 'https://www.lapf.com.ar';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml',
};

function get(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: HEADERS }, (res) => {
      let data = '';
      if (res.statusCode === 302 && res.headers.location) {
        const loc = res.headers.location.startsWith('http') ? res.headers.location : BASE + res.headers.location;
        return get(loc).then(resolve);
      }
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

// Normaliza nombres LAPF al formato del fallback
const FALLBACK_KEYS = Object.keys(fallback.teams);
function normalizeName(name) {
  const stripped = name.replace(/[^A-Z]/g, '');
  return FALLBACK_KEYS.find(k => k.replace(/[^A-Z]/g, '') === stripped) || name;
}

function parseFechaFromUrl(url) {
  const m = url.match(/datos-torneo\/(\d+)\/(\d+)\/(\d+)\/(\d+)/);
  return m ? { cat: m[1], ed: m[2], fecha: parseInt(m[3]), zona: m[4] } : null;
}

function parseFixture(html, fechaNum) {
  const matches = [];
  const tableMatch = html.match(/id="GVFixtureDesktop"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/);
  if (!tableMatch) return [];

  const rows = tableMatch[1].match(/<tr>([\s\S]*?)<\/tr>/g) || [];
  rows.forEach(row => {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
    if (cells.length < 4) return;

    const getTeam = c => { const a = c.match(/alt="logo ([^"]+)"/); return a ? a[1].trim() : ''; };
    const getScore = c => { const t = c.replace(/<[^>]+>/g, '').trim(); return t === '' || t === '-' ? null : parseInt(t); };

    const local     = normalizeName(getTeam(cells[0]));
    const golL      = cells[1] ? getScore(cells[1]) : null;
    const golV      = cells[3] ? getScore(cells[3]) : null;
    const visitante = cells[4] ? normalizeName(getTeam(cells[4])) : '';

    if (!local || !visitante) return;
    const jugado = golL !== null && golV !== null;
    matches.push({ fecha: fechaNum, local, visitante, jugado, ...(jugado ? { golL, golV } : {}) });
  });
  return matches;
}

function parseStandings(html) {
  const tabla = [];
  const tableMatch = html.match(/id="GVPosicionesDesktop"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/);
  if (!tableMatch) return null;

  const rows = tableMatch[1].match(/<tr>([\s\S]*?)<\/tr>/g) || [];
  rows.forEach(row => {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
    if (cells.length < 9) return;
    const getText = c => c.replace(/<[^>]+>/g, '').trim();
    const imgAlt = cells[1] && cells[1].match(/alt="logo ([^"]+)"/);
    tabla.push({
      pos:    parseInt(getText(cells[0])) || tabla.length + 1,
      equipo: normalizeName(imgAlt ? imgAlt[1].trim() : getText(cells[1])),
      pts:    parseInt(getText(cells[2])) || 0,
      pj:     parseInt(getText(cells[3])) || 0,
      pg:     parseInt(getText(cells[4])) || 0,
      pe:     parseInt(getText(cells[5])) || 0,
      pp:     parseInt(getText(cells[6])) || 0,
      gf:     parseInt(getText(cells[7])) || 0,
      gc:     parseInt(getText(cells[8])) || 0,
    });
  });
  return tabla.length ? tabla : null;
}

function parseTeams(html) {
  const teams = {};
  for (const m of html.matchAll(/src="([^"]+\/logos\/[^"]+)" alt="logo ([^"]+)"/g)) {
    const name = m[2].trim();
    if (!teams[name]) teams[name] = { logo: m[1] };
  }
  return teams;
}

// Fetchea todas las fechas de una zona (F1 a F16), descarta las vacías
async function fetchZona(cat, ed, zona) {
  const RANGE = Array.from({ length: 16 }, (_, i) => i + 1);
  const htmls = await Promise.all(RANGE.map(f => get(`${BASE}/datos-torneo/${cat}/${ed}/${f}/${zona}`)));
  const fixture = RANGE.flatMap((f, i) => parseFixture(htmls[i], f));
  return fixture; // fechas vacías simplemente no tienen partidos
}

async function fetchLapfData() {
  try {
    // Obtenemos cat y ed del torneo activo vía redirect
    const redirectUrl = await new Promise((resolve) => {
      https.get(`${BASE}/datos-torneo/A/1`, { headers: HEADERS }, (res) => {
        if (res.statusCode === 302 && res.headers.location) {
          const loc = res.headers.location.startsWith('http') ? res.headers.location : BASE + res.headers.location;
          resolve(loc);
        } else resolve(null);
        res.resume();
      }).on('error', () => resolve(null));
    });

    if (!redirectUrl) throw new Error('No redirect URL');
    const { cat, ed, fecha } = parseFechaFromUrl(redirectUrl);

    // Fetcheamos Rueda 1 y Rueda 2 en paralelo (32 requests totales, caché 30min)
    const [r1Fixture, r2Fixture] = await Promise.all([
      fetchZona(cat, ed, 1),
      fetchZona(cat, ed, 2),
    ]);

    // Tabla y teams del HTML de la fecha actual
    const htmlActual = await get(`${BASE}/datos-torneo/${cat}/${ed}/${fecha}/1`);
    const tabla = parseStandings(htmlActual) || fallback.tabla;
    const rawTeams = parseTeams(htmlActual);
    const mergedTeams = { ...fallback.teams };
    for (const [name, data] of Object.entries(rawTeams)) {
      const key = FALLBACK_KEYS.find(k => k.replace(/[^A-Z]/g, '') === name.replace(/[^A-Z]/g, ''));
      if (key) mergedTeams[key] = { ...mergedTeams[key], logo: data.logo };
    }

    // Fechas únicas por rueda (solo las que tienen partidos)
    const fechasOf = (fix) => [...new Set(fix.map(m => m.fecha))].sort((a, b) => a - b);
    const r1Fechas = fechasOf(r1Fixture);
    const r2Fechas = fechasOf(r2Fixture);

    // Primer fecha sin resultados en cada rueda
    const firstPending = (fix, fechas) => fechas.find(f => fix.some(m => m.fecha === f && !m.jugado)) || fechas[fechas.length - 1];
    const r1Default = firstPending(r1Fixture, r1Fechas);
    const r2Default = firstPending(r2Fixture, r2Fechas);

    // Rueda activa: la que tenga partidos pendientes más próximos
    const activeRueda = r2Fechas.length > 0 && r2Fixture.some(m => !m.jugado) ? 2 : 1;

    // Próximo de SAN LORENZO
    const isSlvc = t => t.includes('SAN LORENZO');
    const activeFixture = activeRueda === 2 ? r2Fixture : r1Fixture;
    const proximoMatch = activeFixture.find(m => !m.jugado && (isSlvc(m.local) || isSlvc(m.visitante)));
    const proximoPartido = proximoMatch ? {
      fecha:     proximoMatch.fecha,
      local:     proximoMatch.local,
      visitante: proximoMatch.visitante,
      torneo:    `Primera "A" · Rueda ${activeRueda} · Fecha ${proximoMatch.fecha}`,
      lugar:     'El Nido · Calle 7 y 485, Villa Castells',
    } : fallback.proximoPartido;

    return {
      r1Fixture, r2Fixture,
      r1Fechas,  r2Fechas,
      r1Default, r2Default,
      activeRueda,
      fixture: activeFixture,   // compat con otras partes del template
      fechas:  activeRueda === 2 ? r2Fechas : r1Fechas,
      tabla, teams: mergedTeams, proximoPartido,
    };

  } catch (err) {
    console.warn('[LAPF] Error fetching live data, using fallback:', err.message);
    return { ...fallback, r1Fixture: fallback.fixture, r2Fixture: [], r1Fechas: [12,13,14,15], r2Fechas: [], r1Default: 15, r2Default: null, activeRueda: 1, fechas: [12,13,14,15] };
  }
}

async function getLapfData() {
  const now = Date.now();
  if (cache && now - cacheTs < CACHE_TTL) return cache;
  const data = await fetchLapfData();
  cache = data;
  cacheTs = now;
  return data;
}

module.exports = { getLapfData };
