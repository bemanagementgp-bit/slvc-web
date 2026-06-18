const BASE = 'https://www.lapf.com.ar/Recursos/img/logos';

const teams = {
  'SAN LORENZO V.C.':    { logo: `${BASE}/18.png`,                  short: 'SLVC' },
  'A.D.I.P.':            { logo: `${BASE}/39.png`,                  short: 'ADIP' },
  'UNIDOS DE OLMOS':     { logo: `${BASE}/unidos-de-olmos.png`,     short: 'UDO'  },
  'ASOC. BRANDSEN':      { logo: `${BASE}/asoc-brandsen.png`,       short: 'BRAN' },
  'EVERTON':             { logo: `${BASE}/everton.png`,             short: 'EVE'  },
  'C.F. LOS HORNOS':     { logo: `${BASE}/c-f-los-hornos.png`,      short: 'LH'   },
  'ASOC. N. ALIANZA':    { logo: `${BASE}/asoc-n-alianza.png`,      short: 'NA'   },
  'C.R.I.B.A':           { logo: `${BASE}/35.png`,                  short: 'CRIB' },
  'ESTRELLA BERISSO':    { logo: `${BASE}/estrella-berisso.png`,    short: 'EB'   },
  'PEÑAROL':             { logo: `${BASE}/penarol.png`,             short: 'PEN'  },
  'POLIDEPORTIVO GONNET':{ logo: `${BASE}/polideportivo-gonnet.png`,short: 'PGON' },
  'C.R.I.S.F.A.':        { logo: `${BASE}/10.png`,                  short: 'CRIS' },
  'C.C. TOLOSANO':       { logo: `${BASE}/c-c-tolosano.png`,        short: 'CCT'  },
  'LAS MALVINAS':        { logo: `${BASE}/11.png`,                  short: 'MAL'  },
  'ALUMNI':              { logo: `${BASE}/alumni.png`,              short: 'ALU'  },
  'FOR EVER':            { logo: `${BASE}/for-ever.png`,            short: 'FEV'  },
};

const tabla = [
  { pos: 1,  equipo: 'A.D.I.P.',             pj: 12, pg: 10, pe: 1, pp: 1, gf: 25, gc: 9,  pts: 31 },
  { pos: 2,  equipo: 'UNIDOS DE OLMOS',       pj: 12, pg: 8,  pe: 2, pp: 2, gf: 21, gc: 8,  pts: 26 },
  { pos: 3,  equipo: 'ASOC. BRANDSEN',        pj: 12, pg: 8,  pe: 2, pp: 2, gf: 19, gc: 9,  pts: 26 },
  { pos: 4,  equipo: 'EVERTON',               pj: 12, pg: 6,  pe: 4, pp: 2, gf: 18, gc: 12, pts: 22 },
  { pos: 5,  equipo: 'SAN LORENZO V.C.',      pj: 12, pg: 5,  pe: 4, pp: 3, gf: 19, gc: 11, pts: 19 },
  { pos: 6,  equipo: 'C.F. LOS HORNOS',       pj: 12, pg: 5,  pe: 3, pp: 4, gf: 21, gc: 18, pts: 18 },
  { pos: 7,  equipo: 'ASOC. N. ALIANZA',      pj: 12, pg: 4,  pe: 6, pp: 2, gf: 13, gc: 11, pts: 18 },
  { pos: 8,  equipo: 'C.R.I.B.A',             pj: 12, pg: 4,  pe: 4, pp: 4, gf: 12, gc: 12, pts: 16 },
  { pos: 9,  equipo: 'ESTRELLA BERISSO',      pj: 12, pg: 4,  pe: 3, pp: 5, gf: 17, gc: 19, pts: 15 },
  { pos: 10, equipo: 'PEÑAROL',               pj: 12, pg: 3,  pe: 3, pp: 6, gf: 11, gc: 17, pts: 12 },
  { pos: 11, equipo: 'POLIDEPORTIVO GONNET',  pj: 12, pg: 3,  pe: 3, pp: 6, gf: 16, gc: 22, pts: 12 },
  { pos: 12, equipo: 'C.R.I.S.F.A.',          pj: 12, pg: 2,  pe: 5, pp: 5, gf: 12, gc: 17, pts: 11 },
  { pos: 13, equipo: 'C.C. TOLOSANO',         pj: 12, pg: 2,  pe: 5, pp: 5, gf: 17, gc: 25, pts: 11 },
  { pos: 14, equipo: 'LAS MALVINAS',          pj: 12, pg: 3,  pe: 2, pp: 7, gf: 10, gc: 21, pts: 11 },
  { pos: 15, equipo: 'ALUMNI',                pj: 12, pg: 2,  pe: 2, pp: 8, gf: 12, gc: 23, pts: 8  },
  { pos: 16, equipo: 'FOR EVER',              pj: 12, pg: 1,  pe: 3, pp: 8, gf: 11, gc: 20, pts: 6  },
];

const fixture = [
  // Fecha 12 — Última jugada
  { fecha: 12, local: 'ALUMNI',              visitante: 'ASOC. N. ALIANZA',    golL: 1, golV: 1, jugado: true },
  { fecha: 12, local: 'C.C. TOLOSANO',       visitante: 'SAN LORENZO V.C.',    golL: 3, golV: 1, jugado: true },
  { fecha: 12, local: 'A.D.I.P.',            visitante: 'C.R.I.B.A',           golL: 1, golV: 0, jugado: true },
  { fecha: 12, local: 'LAS MALVINAS',        visitante: 'C.F. LOS HORNOS',     golL: 2, golV: 1, jugado: true },
  { fecha: 12, local: 'EVERTON',             visitante: 'ESTRELLA BERISSO',    golL: 1, golV: 2, jugado: true },
  { fecha: 12, local: 'UNIDOS DE OLMOS',     visitante: 'ASOC. BRANDSEN',      golL: 1, golV: 2, jugado: true },
  { fecha: 12, local: 'C.R.I.S.F.A.',        visitante: 'FOR EVER',            golL: 2, golV: 1, jugado: true },
  { fecha: 12, local: 'POLIDEPORTIVO GONNET',visitante: 'PEÑAROL',             golL: 1, golV: 2, jugado: true },

  // Fecha 13 — Próxima
  { fecha: 13, local: 'SAN LORENZO V.C.',    visitante: 'A.D.I.P.',            jugado: false },
  { fecha: 13, local: 'ASOC. N. ALIANZA',    visitante: 'C.C. TOLOSANO',       jugado: false },
  { fecha: 13, local: 'FOR EVER',            visitante: 'ALUMNI',              jugado: false },
  { fecha: 13, local: 'PEÑAROL',             visitante: 'C.R.I.S.F.A.',        jugado: false },
  { fecha: 13, local: 'ESTRELLA BERISSO',    visitante: 'UNIDOS DE OLMOS',     jugado: false },
  { fecha: 13, local: 'ASOC. BRANDSEN',      visitante: 'POLIDEPORTIVO GONNET',jugado: false },
  { fecha: 13, local: 'C.F. LOS HORNOS',     visitante: 'EVERTON',             jugado: false },
  { fecha: 13, local: 'C.R.I.B.A',           visitante: 'LAS MALVINAS',        jugado: false },

  // Fecha 14
  { fecha: 14, local: 'UNIDOS DE OLMOS',     visitante: 'C.F. LOS HORNOS',     jugado: false },
  { fecha: 14, local: 'ASOC. BRANDSEN',      visitante: 'ESTRELLA BERISSO',    jugado: false },
  { fecha: 14, local: 'ALUMNI',              visitante: 'PEÑAROL',             jugado: false },
  { fecha: 14, local: 'POLIDEPORTIVO GONNET',visitante: 'C.R.I.S.F.A.',        jugado: false },
  { fecha: 14, local: 'C.C. TOLOSANO',       visitante: 'FOR EVER',            jugado: false },
  { fecha: 14, local: 'A.D.I.P.',            visitante: 'ASOC. N. ALIANZA',    jugado: false },
  { fecha: 14, local: 'LAS MALVINAS',        visitante: 'SAN LORENZO V.C.',    jugado: false },
  { fecha: 14, local: 'EVERTON',             visitante: 'C.R.I.B.A',           jugado: false },

  // Fecha 15
  { fecha: 15, local: 'C.R.I.B.A',           visitante: 'UNIDOS DE OLMOS',     jugado: false },
  { fecha: 15, local: 'SAN LORENZO V.C.',    visitante: 'EVERTON',             jugado: false },
  { fecha: 15, local: 'ASOC. N. ALIANZA',    visitante: 'LAS MALVINAS',        jugado: false },
  { fecha: 15, local: 'FOR EVER',            visitante: 'A.D.I.P.',            jugado: false },
  { fecha: 15, local: 'PEÑAROL',             visitante: 'C.C. TOLOSANO',       jugado: false },
  { fecha: 15, local: 'C.R.I.S.F.A.',        visitante: 'ALUMNI',              jugado: false },
  { fecha: 15, local: 'C.F. LOS HORNOS',     visitante: 'ASOC. BRANDSEN',      jugado: false },
  { fecha: 15, local: 'POLIDEPORTIVO GONNET',visitante: 'ESTRELLA BERISSO',    jugado: false },
];

const proximoPartido = {
  fecha: 13,
  local: 'SAN LORENZO V.C.',
  visitante: 'A.D.I.P.',
  torneo: 'Primera "A" · Rueda 1 · Fecha 13',
  lugar: 'El Nido · Calle 7 y 485, Villa Castells',
};

module.exports = { fixture, tabla, teams, proximoPartido };
