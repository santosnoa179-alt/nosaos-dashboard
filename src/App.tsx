// @ts-nocheck
import { useState, useEffect, useContext, createContext, useRef } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const SUPABASE_URL = "https://vkbtjeitjkycofybnbyh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYnRqZWl0amt5Y29meWJuYnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjkwMTUsImV4cCI6MjA4OTE0NTAxNX0.ZoduLQz9zJASWIwapUZINOaMGhCCJAjYp1_I9LrPbic";
const APP_PASSWORD = "Santos@";

async function sbGet(id) {
  try {
    var r = await fetch(
      SUPABASE_URL + "/rest/v1/dashboard_data?id=eq." + id + "&select=data",
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY,
        },
      }
    );
    var rows = await r.json();
    return rows && rows[0] ? rows[0].data : null;
  } catch (e) {
    return null;
  }
}
async function sbSet(id, data) {
  try {
    await fetch(SUPABASE_URL + "/rest/v1/dashboard_data", {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ id, data, updated_at: new Date().toISOString() }),
    });
  } catch (e) {}
}
function useSynced(key, def) {
  var [v, setV] = useState(function () {
    try {
      var s = localStorage.getItem(key);
      return s ? JSON.parse(s) : def;
    } catch (e) {
      return def;
    }
  });
  var [loaded, setLoaded] = useState(false);
  useEffect(function () {
    sbGet(key).then(function (r) {
      if (r !== null) {
        setV(r);
        try {
          localStorage.setItem(key, JSON.stringify(r));
        } catch (e) {}
      }
      setLoaded(true);
    });
  }, []);
  useEffect(
    function () {
      if (!loaded) return;
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch (e) {}
      sbSet(key, v);
    },
    [key, v, loaded]
  );
  return [v, setV];
}
function useCountUp(target, dur) {
  var d = dur || 1000;
  var [count, setCount] = useState(0);
  var prev = useRef(0);
  useEffect(
    function () {
      var start = prev.current;
      var t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / d, 1);
        var e = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(start + (target - start) * e));
        if (p < 1) requestAnimationFrame(step);
        else prev.current = target;
      }
      requestAnimationFrame(step);
    },
    [target]
  );
  return count;
}
function useScrollAnim() {
  var ref = useRef(null);
  var [visible, setVisible] = useState(false);
  useEffect(function () {
    var el = ref.current;
    if (!el) return;
    var obs = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return function () {
      obs.disconnect();
    };
  }, []);
  return [ref, visible];
}
function isDark() {
  return new Date().getHours() >= 18 || new Date().getHours() < 8;
}

const LIGHT = {
  headerBg: "#303237",
  cardBg: "#F4F1ED",
  tableBg: "#E5E1DC",
  blue: "#6A7B84",
  green: "#798C80",
  beige: "#BAA082",
  gray: "#959B9E",
  text: "#262626",
  textSec: "#787878",
  white: "#ffffff",
  pageBg: "#FAF8F5",
  red: "#B07070",
};
const DARK = {
  headerBg: "#1A1B1E",
  cardBg: "#24262B",
  tableBg: "#2E3036",
  blue: "#7A9BAA",
  green: "#8AAF91",
  beige: "#C4A882",
  gray: "#8A9098",
  text: "#E8E4DF",
  textSec: "#8A8A8A",
  white: "#ffffff",
  pageBg: "#18191C",
  red: "#C47070",
};
const ThemeCtx = createContext(LIGHT);

const MOIS = [
  "Jan",
  "Fev",
  "Mar",
  "Avr",
  "Mai",
  "Jui",
  "Juil",
  "Aou",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DOMAINE_COLORS = [
  "#798C80",
  "#6A7B84",
  "#BAA082",
  "#959B9E",
  "#A8947E",
  "#7A8C7E",
  "#8A7B94",
  "#9E8C7A",
];
const PRIORITES = ["Urgent", "Important", "Moyen", "Priorite basse"];
const STATUTS_TACHE = ["Pas commence", "En cours", "Termine"];
const STATUTS_PROJET = ["Planifie", "En cours", "Termine"];
const CATEGORIES = [
  "Personnel",
  "Travail",
  "Administratif",
  "Loisirs",
  "Formation",
];
const PRIORITE_STYLE = {
  Urgent: { bg: "#EDE4DA", border: "#BAA082", color: "#7A5C3A" },
  Important: { bg: "#E2E8E5", border: "#798C80", color: "#3D5C46" },
  Moyen: { bg: "#E0E6EA", border: "#6A7B84", color: "#2E4E59" },
  "Priorite basse": { bg: "#EDEBE8", border: "#959B9E", color: "#555" },
};
const STATUT_STYLE = {
  Termine: { bg: "#E2E8E5", color: "#3D5C46" },
  "En cours": { bg: "#E0E6EA", color: "#2E4E59" },
  "Pas commence": { bg: "#EDEBE8", color: "#787878" },
  Planifie: { bg: "#EDE4DA", color: "#7A5C3A" },
};
const DONUT_COLORS = {
  Urgent: "#C4A08A",
  Important: "#798C80",
  Moyen: "#6A7B84",
  "Priorite basse": "#959B9E",
};
const MOOD_EMOJIS = [":(", ":/", ":|", ":)", "=)"];
const MOOD_COLORS = ["#C47070", "#C4A882", "#959B9E", "#798C80", "#6A7B84"];
const VISION_COLORS = [
  "#BAA082",
  "#798C80",
  "#6A7B84",
  "#959B9E",
  "#A8947E",
  "#7A8C7E",
];
const NOTE_CATEGORIES = [
  "Idée",
  "Réflexion",
  "Important",
  "Prière",
  "Objectif",
  "Autre",
];
const NOTE_CAT_COLORS = {
  Idée: "#BAA082",
  Réflexion: "#6A7B84",
  Important: "#C47070",
  Prière: "#798C80",
  Objectif: "#8A7B94",
  Autre: "#959B9E",
};
const AFFIRMATIONS = [
  "Je suis capable d'accomplir tout ce que je decide.",
  "Chaque jour je progresse vers mes objectifs.",
  "Je suis discipline, focalise et determine.",
  "Je cree ma propre chance par mon travail.",
  "Je merite le succes que je construis.",
  "Ma perseverance est plus forte que mes obstacles.",
  "Je suis en pleine maitrise de ma vie.",
  "Je transforme mes defis en opportunites.",
  "Chaque effort me rapproche de mes reves.",
  "Je suis fier du chemin parcouru.",
];
const CITATIONS = [
  {
    t: "Ce que tu fais chaque jour compte plus que ce que tu fais de temps en temps.",
    a: "Gretchen Rubin",
  },
  {
    t: "La discipline c'est choisir entre ce que tu veux maintenant et ce que tu veux le plus.",
    a: "Abraham Lincoln",
  },
  { t: "Le secret du succes est de commencer.", a: "Mark Twain" },
  {
    t: "La motivation te met en marche, l'habitude te fait avancer.",
    a: "Jim Ryun",
  },
  {
    t: "Ne compte pas les jours, fais que les jours comptent.",
    a: "Muhammad Ali",
  },
  {
    t: "Ton futur est cree par ce que tu fais aujourd'hui, pas demain.",
    a: "Robert Kiyosaki",
  },
  {
    t: "Le succes n'est pas final, l'echec n'est pas fatal.",
    a: "Winston Churchill",
  },
  { t: "Sois le changement que tu veux voir dans le monde.", a: "Gandhi" },
  {
    t: "Le genie c'est 1% d'inspiration et 99% de transpiration.",
    a: "Thomas Edison",
  },
  {
    t: "L'avenir appartient a ceux qui croient en la beaute de leurs reves.",
    a: "Eleanor Roosevelt",
  },
  { t: "Fais de chaque jour ton chef-d'oeuvre.", a: "John Wooden" },
  {
    t: "Le succes c'est tomber sept fois et se relever huit.",
    a: "Proverbe japonais",
  },
  {
    t: "La meilleure facon de predire l'avenir c'est de le creer.",
    a: "Peter Drucker",
  },
  { t: "La perseverance est la mere du succes.", a: "Honore de Balzac" },
  {
    t: "Le meilleur moment pour planter un arbre etait il y a 20 ans. Le second c'est maintenant.",
    a: "Proverbe chinois",
  },
  {
    t: "Il n'y a pas de vent favorable pour celui qui ne sait pas ou il va.",
    a: "Seneque",
  },
  {
    t: "La seule facon de faire du bon travail est d'aimer ce que vous faites.",
    a: "Steve Jobs",
  },
  {
    t: "Fais de ta vie un reve, et d'un reve une realite.",
    a: "Antoine de Saint-Exupery",
  },
];
const VERSETS = [
  {
    t: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.",
    r: "Jérémie 29:11",
  },
  { t: "Je puis tout par celui qui me fortifie.", r: "Philippiens 4:13" },
  {
    t: "L'Éternel est mon berger : je ne manquerai de rien.",
    r: "Psaume 23:1",
  },
  {
    t: "Cherchez premièrement le royaume et la justice de Dieu ; et toutes ces choses vous seront données par-dessus.",
    r: "Matthieu 6:33",
  },
  {
    t: "Remets ton sort à l'Éternel, mets en lui ta confiance, et il agira.",
    r: "Psaume 37:5",
  },
  {
    t: "Ne t'ai-je pas donné cet ordre : Sois fort et courageux ? Ne te laisse pas abattre, car l'Éternel, ton Dieu, est avec toi.",
    r: "Josué 1:9",
  },
  {
    t: "Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles.",
    r: "Ésaïe 40:31",
  },
  {
    t: "Que la paix de Dieu, qui surpasse toute intelligence, garde vos cœurs et vos pensées en Jésus-Christ.",
    r: "Philippiens 4:7",
  },
  {
    t: "Dieu est notre refuge et notre force, un secours qui ne manque jamais dans la détresse.",
    r: "Psaume 46:2",
  },
  {
    t: "En toutes choses nous sommes plus que vainqueurs par celui qui nous a aimés.",
    r: "Romains 8:37",
  },
  {
    t: "Confiez-vous en l'Éternel de tout votre cœur, et ne vous appuyez pas sur votre intelligence.",
    r: "Proverbes 3:5",
  },
  {
    t: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.",
    r: "Matthieu 11:28",
  },
  {
    t: "Car Dieu n'a pas donné un esprit de timidité, mais un esprit de force, d'amour et de sagesse.",
    r: "2 Timothée 1:7",
  },
  {
    t: "Demandez, et l'on vous donnera ; cherchez, et vous trouverez ; frappez, et l'on vous ouvrira.",
    r: "Matthieu 7:7",
  },
  {
    t: "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes.",
    r: "Colossiens 3:23",
  },
  {
    t: "Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières.",
    r: "Philippiens 4:6",
  },
  {
    t: "Et nous savons que toutes choses concourent au bien de ceux qui aiment Dieu.",
    r: "Romains 8:28",
  },
  {
    t: "Réjouissez-vous toujours dans le Seigneur ; je le répète, réjouissez-vous.",
    r: "Philippiens 4:4",
  },
  {
    t: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.",
    r: "Psaume 119:105",
  },
  {
    t: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant.",
    r: "Psaume 91:1",
  },
  {
    t: "Mets ta joie dans l'Éternel, et il te donnera ce que ton cœur désire.",
    r: "Psaume 37:4",
  },
  {
    t: "L'amour est patient, il est plein de bonté ; il ne jalouse pas.",
    r: "1 Corinthiens 13:4",
  },
  {
    t: "L'Éternel est près de ceux qui ont le cœur brisé, et il sauve ceux qui ont l'esprit dans l'abattement.",
    r: "Psaume 34:19",
  },
  {
    t: "Car c'est par la grâce que vous êtes sauvés, par le moyen de la foi.",
    r: "Éphésiens 2:8",
  },
  {
    t: "Voici, je me tiens à la porte, et je frappe. Si quelqu'un entend ma voix et ouvre la porte, j'entrerai chez lui.",
    r: "Apocalypse 3:20",
  },
];

function getCitationDuJour() {
  var n = new Date();
  var d = Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 86400000);
  return CITATIONS[d % CITATIONS.length];
}
function getVersetDuJour(offset) {
  var n = new Date();
  var d = Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 86400000);
  return VERSETS[(d + (offset || 0)) % VERSETS.length];
}

const DEF_TACHES = [
  {
    id: "t1",
    nom: "Preparer le rapport mensuel",
    priorite: "Urgent",
    categorie: "Travail",
    statut: "En cours",
    echeance: "2026-03-15",
  },
  {
    id: "t2",
    nom: "Appeler le medecin",
    priorite: "Important",
    categorie: "Personnel",
    statut: "Pas commence",
    echeance: "2026-03-20",
  },
  {
    id: "t3",
    nom: "Lire 1 chapitre d'un livre",
    priorite: "Priorite basse",
    categorie: "Loisirs",
    statut: "Pas commence",
    echeance: "2026-03-30",
  },
  {
    id: "t4",
    nom: "Envoyer ma newsletter",
    priorite: "Important",
    categorie: "Travail",
    statut: "Termine",
    echeance: "2026-03-18",
  },
];
const DEF_HABITUDES = [
  { id: "h1", nom: "Boire un verre d'eau au reveil", obj: 31 },
  { id: "h2", nom: "Planifier les taches de la journee", obj: 31 },
  { id: "h3", nom: "Faire 30 min de meditation", obj: 20 },
  { id: "h4", nom: "Preparer un petit-dejeuner equilibre", obj: 25 },
  { id: "h5", nom: "Lire 10 pages d'un livre", obj: 20 },
  { id: "h6", nom: "Ecrire 3 choses positives", obj: 31 },
  { id: "h7", nom: "Faire du sport", obj: 15 },
  { id: "h8", nom: "Limiter les ecrans 1h avant de dormir", obj: 20 },
];
const DEF_PROJETS = [
  {
    id: "p1",
    nom: "Site web personnel",
    desc: "Creation du portfolio",
    debut: "2026-01-01",
    fin: "2026-06-30",
    statut: "En cours",
    prog: 40,
  },
  {
    id: "p2",
    nom: "Cours de photographie",
    desc: "Formation en ligne",
    debut: "2026-02-01",
    fin: "2026-05-31",
    statut: "En cours",
    prog: 25,
  },
  {
    id: "p3",
    nom: "Renovation bureau",
    desc: "Amenagement espace travail",
    debut: "2026-03-01",
    fin: "2026-04-30",
    statut: "Planifie",
    prog: 0,
  },
];
const DEF_DOMAINES = [
  { id: "d1", nom: "Sante", color: "#798C80" },
  { id: "d2", nom: "Lecture", color: "#6A7B84" },
  { id: "d3", nom: "Formation", color: "#BAA082" },
  { id: "d4", nom: "Finances", color: "#7A8C7E" },
];
const DEF_OBJECTIFS = [
  {
    id: "o1",
    domaineId: "d1",
    obj: "Faire du sport 4x/semaine",
    action: "Reserver creneaux cette semaine",
    score: 0,
    terme: "court",
  },
  {
    id: "o2",
    domaineId: "d2",
    obj: "Lire 12 livres en 2026",
    action: "Choisir livre de Mars",
    score: 0,
    terme: "moyen",
  },
  {
    id: "o3",
    domaineId: "d3",
    obj: "Terminer 2 formations en ligne",
    action: "Choisir formation 1",
    score: 0,
    terme: "long",
  },
  {
    id: "o4",
    domaineId: "d4",
    obj: "Epargner X% de mes revenus",
    action: "Mettre en place virement automatique",
    score: 0,
    terme: "long",
  },
];
const DEF_BUDGET = {
  revenus: [
    { id: "br1", cat: "Salaire", prevu: 1322, reel: 0 },
    { id: "br2", cat: "Aides / allocations", prevu: 450, reel: 0 },
  ],
  fixes: [
    { id: "bf1", cat: "Loyer", prevu: 700, reel: 0 },
    { id: "bf2", cat: "Internet", prevu: 0, reel: 0 },
  ],
  variables: [
    { id: "bv1", cat: "Courses", prevu: 0, reel: 0 },
    { id: "bv2", cat: "Restaurants", prevu: 0, reel: 0 },
  ],
};
const DEF_ROUTINES = {
  matin: {
    nom: "Routine Matin",
    etapes: [
      { id: "rm1", nom: "Boire un grand verre d'eau", duree: 2 },
      { id: "rm2", nom: "Meditation / respiration", duree: 10 },
      { id: "rm3", nom: "Journaling / gratitude", duree: 5 },
      { id: "rm4", nom: "Exercice physique", duree: 20 },
      { id: "rm5", nom: "Douche froide", duree: 5 },
      { id: "rm6", nom: "Planifier la journee", duree: 10 },
    ],
  },
  soir: {
    nom: "Routine Soir",
    etapes: [
      { id: "rs1", nom: "Revue de la journee", duree: 5 },
      { id: "rs2", nom: "Lecture", duree: 20 },
      { id: "rs3", nom: "Pas d'ecrans", duree: 30 },
      { id: "rs4", nom: "Preparer le lendemain", duree: 5 },
      { id: "rs5", nom: "Etirements / relaxation", duree: 10 },
    ],
  },
};

var uid = function () {
  return "id_" + Date.now() + "_" + Math.floor(Math.random() * 9999);
};
var fmt = function (v) {
  return (
    (+v || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " EUR"
  );
};

// ── Wellbeing ─────────────────────────────────────────────
function calcWellbeing(
  todayKey,
  habitData,
  habitudes,
  moodData,
  sommeilData,
  sportData
) {
  var td = habitData[todayKey] || {};
  var hs =
    habitudes.length > 0
      ? (habitudes.filter(function (h) {
          return td[h.id];
        }).length /
          habitudes.length) *
        30
      : 0;
  var m = moodData[todayKey] || 0;
  var ms = m ? (m / 5) * 25 : 0;
  var s = parseFloat(sommeilData[todayKey]) || 0;
  var ss = s >= 8 ? 25 : s >= 6 ? 18 : s >= 4 ? 10 : s > 0 ? 5 : 0;
  var ws = new Date(todayKey);
  var dw = ws.getDay();
  ws.setDate(ws.getDate() + (dw === 0 ? -6 : 1 - dw));
  var sp = sportData.filter(function (x) {
    return x.date && new Date(x.date) >= ws;
  }).length;
  var sps = sp >= 4 ? 20 : sp >= 3 ? 16 : sp >= 2 ? 12 : sp >= 1 ? 6 : 0;
  return Math.round(hs + ms + ss + sps);
}
function wbColor(s) {
  return s >= 80
    ? "#798C80"
    : s >= 60
    ? "#BAA082"
    : s >= 40
    ? "#C4A882"
    : "#C47070";
}
function wbLabel(s) {
  return s >= 80 ? "Excellent" : s >= 60 ? "Bon" : s >= 40 ? "Moyen" : "Faible";
}

// ── SVG Icons (always inside components) ─────────────────
function IconSun({ size, color }) {
  var s = size || 14;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function IconMoon({ size, color }) {
  var s = size || 14;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function IconCross({ size, color }) {
  var s = size || 18;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect
        x="10"
        y="2"
        width="4"
        height="20"
        rx="2"
        fill={color || "currentColor"}
      />
      <rect
        x="2"
        y="8"
        width="20"
        height="4"
        rx="2"
        fill={color || "currentColor"}
      />
    </svg>
  );
}
function IconPin({ size, color, filled }) {
  var s = size || 13;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill={filled ? color || "currentColor" : "none"}
      stroke={color || "currentColor"}
      strokeWidth="2"
    >
      <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
    </svg>
  );
}
function IconTrash({ size, color }) {
  var s = size || 13;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}
function IconSearch({ size, color }) {
  var s = size || 14;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconNote({ size, color }) {
  var s = size || 40;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="1.5"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function NoteCatIcon({ cat, size }) {
  var s = size || 12;
  if (cat === "Idée")
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M12 2a7 7 0 0 1 4 12.9V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.1A7 7 0 0 1 12 2z" />
        <path d="M9 21h6" />
      </svg>
    );
  if (cat === "Réflexion")
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  if (cat === "Important")
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  if (cat === "Prière")
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <rect x="10" y="2" width="4" height="18" rx="2" />
        <rect x="2" y="8" width="20" height="4" rx="2" />
      </svg>
    );
  if (cat === "Objectif")
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

// ── UI Primitives ─────────────────────────────────────────
function Anim({ children, delay, style }) {
  var [ref, visible] = useScrollAnim();
  var d = (delay || 0) * 0.1;
  return (
    <div
      ref={ref}
      style={Object.assign(
        {
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition:
            "opacity .5s ease " + d + "s, transform .5s ease " + d + "s",
        },
        style || {}
      )}
    >
      {children}
    </div>
  );
}
function Confetti({ active, onDone }) {
  var C = useContext(ThemeCtx);
  var canvasRef = useRef(null);
  useEffect(
    function () {
      if (!active) return;
      var canvas = canvasRef.current;
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      var colors = [C.beige, C.green, C.blue, "#C4A882", "#8AAF91"];
      var pieces = Array.from({ length: 80 }, function () {
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          w: 8 + Math.random() * 6,
          h: 6 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * 5)],
          vx: (Math.random() - 0.5) * 4,
          vy: 2 + Math.random() * 4,
          angle: Math.random() * 360,
          va: (Math.random() - 0.5) * 8,
          opacity: 1,
        };
      });
      var frame = 0;
      var anim;
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(function (p) {
          p.x += p.vx;
          p.y += p.vy;
          p.angle += p.va;
          if (frame > 60) p.opacity -= 0.02;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
          ctx.rotate((p.angle * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        frame++;
        if (frame < 120) anim = requestAnimationFrame(draw);
        else if (onDone) onDone();
      }
      anim = requestAnimationFrame(draw);
      return function () {
        cancelAnimationFrame(anim);
      };
    },
    [active]
  );
  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    />
  );
}
function APBar({ pct, color, h, delay }) {
  var C = useContext(ThemeCtx);
  var [w, setW] = useState(0);
  useEffect(
    function () {
      var t = setTimeout(function () {
        setW(Math.min(100, pct || 0));
      }, delay || 0);
      return function () {
        clearTimeout(t);
      };
    },
    [pct]
  );
  return (
    <div
      style={{
        background: C.tableBg,
        borderRadius: 99,
        height: h || 6,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          width: w + "%",
          height: h || 6,
          background: color || C.beige,
          borderRadius: 99,
          transition: "width .8s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}
function PageTransition({ tabKey, children }) {
  var [visible, setVisible] = useState(true);
  var prevKey = useRef(tabKey);
  useEffect(
    function () {
      if (tabKey !== prevKey.current) {
        prevKey.current = tabKey;
        setVisible(false);
        var t = setTimeout(function () {
          setVisible(true);
        }, 150);
        return function () {
          clearTimeout(t);
        };
      }
    },
    [tabKey]
  );
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity .25s ease, transform .25s ease",
      }}
    >
      {children}
    </div>
  );
}
function HCard({ children, style }) {
  var C = useContext(ThemeCtx);
  var [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={function () {
        setHov(true);
      }}
      onMouseLeave={function () {
        setHov(false);
      }}
      style={Object.assign(
        {
          background: C.cardBg,
          borderRadius: 14,
          padding: "16px 18px",
          border: "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
          transition: "transform .2s, box-shadow .2s",
          transform: hov ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hov
            ? "0 8px 24px rgba(0,0,0,.1)"
            : "0 1px 3px rgba(0,0,0,.04)",
        },
        style || {}
      )}
    >
      {children}
    </div>
  );
}
function Card({ children, style }) {
  var C = useContext(ThemeCtx);
  return (
    <div
      style={Object.assign(
        {
          background: C.cardBg,
          borderRadius: 14,
          padding: "16px 18px",
          border: "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
          transition: "background .4s",
        },
        style || {}
      )}
    >
      {children}
    </div>
  );
}
function SecTitle({ children }) {
  var C = useContext(ThemeCtx);
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: C.textSec,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}
function Tag({ label, s }) {
  var st = s || { bg: "#eee", color: "#555" };
  return (
    <span
      style={{
        background: st.bg,
        border: "1px solid " + (st.border || "transparent"),
        color: st.color,
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 99,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
function Btn({ children, onClick, bg, style }) {
  var C = useContext(ThemeCtx);
  return (
    <button
      onClick={onClick}
      style={Object.assign(
        {
          background: bg || C.beige,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        },
        style || {}
      )}
    >
      {children}
    </button>
  );
}
function Del({ onClick }) {
  var C = useContext(ThemeCtx);
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: C.gray,
        fontSize: 20,
        lineHeight: 1,
        padding: "4px 6px",
      }}
    >
      x
    </button>
  );
}
function Edit({ onClick }) {
  var C = useContext(ThemeCtx);
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: C.textSec,
        fontSize: 14,
        padding: "4px 6px",
      }}
    >
      edit
    </button>
  );
}
function MI(props) {
  var C = useContext(ThemeCtx);
  return (
    <input
      style={{
        background: C.tableBg,
        border: "1px solid #D5D0CA",
        borderRadius: 8,
        padding: "7px 12px",
        fontSize: 13,
        color: C.text,
        outline: "none",
        flex: 1,
        width: "100%",
      }}
      {...props}
    />
  );
}
function MS({ children, ...rest }) {
  var C = useContext(ThemeCtx);
  return (
    <select
      style={{
        background: C.tableBg,
        border: "1px solid #D5D0CA",
        borderRadius: 8,
        padding: "7px 12px",
        fontSize: 13,
        color: C.text,
        outline: "none",
        flex: 1,
        width: "100%",
      }}
      {...rest}
    >
      {children}
    </select>
  );
}
function Row({ children }) {
  return (
    <div
      style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}
    >
      {children}
    </div>
  );
}
function Modal({ title, onClose, children }) {
  var C = useContext(ThemeCtx);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.5)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: C.cardBg,
          borderRadius: "16px 16px 0 0",
          padding: "24px 20px 32px",
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 99,
            background: C.tableBg,
            margin: "0 auto 20px",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: C.textSec,
              lineHeight: 1,
            }}
          >
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function MF({ onClose, onSave }) {
  var C = useContext(ThemeCtx);
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <Btn onClick={onClose} bg={C.gray} style={{ flex: 1 }}>
        Annuler
      </Btn>
      <Btn onClick={onSave} style={{ flex: 1 }}>
        Enregistrer
      </Btn>
    </div>
  );
}

// ── COACH IA ──────────────────────────────────────────────
function CoachIA({
  taches,
  habitudes,
  habitData,
  moodData,
  sommeilData,
  objectifs,
  budget,
  sportData,
}) {
  var C = useContext(ThemeCtx);
  var [open, setOpen] = useState(false);
  var [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour Noa ! Je suis ton Coach IA. Je connais toutes tes données NoaOS — habitudes, tâches, objectifs, budget, sommeil. Que veux-tu analyser aujourd'hui ?",
    },
  ]);
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var endRef = useRef(null);
  useEffect(
    function () {
      if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
    },
    [messages]
  );
  var today = new Date();
  var todayKey = today.toISOString().split("T")[0];
  var mois = MOIS[today.getMonth()];
  var moisData = habitData[mois] || {};
  var todayData = habitData[todayKey] || {};
  function buildCtx() {
    var terminees = taches.filter(function (t) {
      return t.statut === "Termine";
    }).length;
    var urgentes = taches.filter(function (t) {
      return t.priorite === "Urgent" && t.statut !== "Termine";
    }).length;
    var enRetard = taches.filter(function (t) {
      return (
        t.statut !== "Termine" && t.echeance && new Date(t.echeance) < today
      );
    }).length;
    var totalObj = habitudes.reduce(function (s, h) {
      return s + h.obj;
    }, 0);
    var totalReal = habitudes.reduce(function (s, h) {
      return s + (moisData[h.id] || 0);
    }, 0);
    var tauxHabit = totalObj > 0 ? Math.round((totalReal / totalObj) * 100) : 0;
    var habitAujourd = habitudes.filter(function (h) {
      return todayData[h.id];
    }).length;
    var revReel = budget.revenus.reduce(function (s, r) {
      return s + (+r.reel || 0);
    }, 0);
    var depReel =
      budget.fixes.reduce(function (s, r) {
        return s + (+r.reel || 0);
      }, 0) +
      budget.variables.reduce(function (s, r) {
        return s + (+r.reel || 0);
      }, 0);
    function getStreak(hid) {
      var streak = 0;
      var d = new Date(today);
      while (true) {
        var k = d.toISOString().split("T")[0];
        var dd = habitData[k];
        if (dd && dd[hid]) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else break;
      }
      return streak;
    }
    var streaks = habitudes.map(function (h) {
      return {
        nom: h.nom,
        streak: getStreak(h.id),
        taux: Math.round(((moisData[h.id] || 0) / h.obj) * 100),
      };
    });
    var moodRecent = Object.keys(moodData)
      .sort()
      .slice(-7)
      .map(function (k) {
        return moodData[k];
      });
    var moodMoy =
      moodRecent.length > 0
        ? Math.round(
            (moodRecent.reduce(function (s, v) {
              return s + v;
            }, 0) /
              moodRecent.length) *
              10
          ) / 10
        : null;
    var sommeilRecent = Object.keys(sommeilData)
      .sort()
      .slice(-7)
      .map(function (k) {
        return parseFloat(sommeilData[k]) || 0;
      })
      .filter(function (v) {
        return v > 0;
      });
    var sommeilMoy =
      sommeilRecent.length > 0
        ? Math.round(
            (sommeilRecent.reduce(function (s, v) {
              return s + v;
            }, 0) /
              sommeilRecent.length) *
              10
          ) / 10
        : null;
    var scoreObj =
      objectifs.length > 0
        ? Math.round(
            objectifs.reduce(function (s, o) {
              return s + (o.score || 0);
            }, 0) / objectifs.length
          )
        : 0;
    var wb = calcWellbeing(
      todayKey,
      habitData,
      habitudes,
      moodData,
      sommeilData,
      sportData
    );
    return (
      "Tu es le Coach IA personnel de Noa dans l'app NoaOS. Appelle-le toujours par son prénom : Noa. Réponds toujours en français, de façon bienveillante, précise et actionnable.\n\n" +
      "DATE : " +
      todayKey +
      "\nTÂCHES : " +
      terminees +
      "/" +
      taches.length +
      " terminées, " +
      urgentes +
      " urgentes, " +
      enRetard +
      " en retard\n\n" +
      "HABITUDES (" +
      mois +
      ") :\n" +
      streaks
        .map(function (s) {
          return "- " + s.nom + " : " + s.taux + "%, streak " + s.streak + "j";
        })
        .join("\n") +
      "\nAujourd'hui : " +
      habitAujourd +
      "/" +
      habitudes.length +
      ", Taux : " +
      tauxHabit +
      "%\n\n" +
      "SCORE BIEN-ÊTRE : " +
      wb +
      "/100\nHUMEUR : " +
      (moodMoy !== null ? moodMoy + "/5" : "pas de données") +
      "\nSOMMEIL : " +
      (sommeilMoy !== null ? sommeilMoy + "h" : "pas de données") +
      "\n\n" +
      "BUDGET : Revenus " +
      revReel +
      " EUR, Dépenses " +
      depReel +
      " EUR, Solde " +
      (revReel - depReel) +
      " EUR\n\n" +
      "OBJECTIFS : " +
      scoreObj +
      "%\n" +
      objectifs
        .map(function (o) {
          return "- " + o.obj + " : " + o.score + "%";
        })
        .join("\n") +
      "\n\n" +
      "SPORT : " +
      sportData.length +
      " séances total, " +
      sportData.filter(function (s) {
        return s.date && s.date.startsWith(today.toISOString().substring(0, 7));
      }).length +
      " ce mois"
    );
  }
  function analyseLocale(userMsg) {
    var msg = userMsg.toLowerCase();
    var today = new Date();
    var todayKey = today.toISOString().split("T")[0];
    var moisCur = MOIS[today.getMonth()];
    var moisD = habitData[moisCur] || {};
    var todayD = habitData[todayKey] || {};
    var totalObj2 = habitudes.reduce(function (s, h) {
      return s + h.obj;
    }, 0);
    var totalReal2 = habitudes.reduce(function (s, h) {
      return s + (moisD[h.id] || 0);
    }, 0);
    var taux = totalObj2 > 0 ? Math.round((totalReal2 / totalObj2) * 100) : 0;
    var terminees2 = taches.filter(function (t) {
      return t.statut === "Termine";
    }).length;
    var urgentes2 = taches.filter(function (t) {
      return t.priorite === "Urgent" && t.statut !== "Termine";
    }).length;
    var retard = taches.filter(function (t) {
      return (
        t.statut !== "Termine" && t.echeance && new Date(t.echeance) < today
      );
    }).length;
    var wb = calcWellbeing(
      todayKey,
      habitData,
      habitudes,
      moodData,
      sommeilData,
      sportData
    );
    var habitDoneToday = habitudes.filter(function (h) {
      return todayD[h.id];
    }).length;
    var revReel2 = budget.revenus.reduce(function (s, r) {
      return s + (+r.reel || 0);
    }, 0);
    var depReel2 =
      budget.fixes.reduce(function (s, r) {
        return s + (+r.reel || 0);
      }, 0) +
      budget.variables.reduce(function (s, r) {
        return s + (+r.reel || 0);
      }, 0);
    var solde2 = revReel2 - depReel2;
    function getStreak2(hid) {
      var streak = 0;
      var d = new Date(today);
      while (true) {
        var k = d.toISOString().split("T")[0];
        var dd = habitData[k];
        if (dd && dd[hid]) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else break;
      }
      return streak;
    }
    var bestStreak2 = habitudes.reduce(function (b, h) {
      return Math.max(b, getStreak2(h.id));
    }, 0);
    var bestHabit = habitudes.reduce(
      function (b, h) {
        var s = getStreak2(h.id);
        return s > b.s ? { nom: h.nom, s: s } : b;
      },
      { nom: "", s: 0 }
    );

    // Analyse habitudes
    if (
      msg.includes("habit") ||
      msg.includes("streak") ||
      msg.includes("progres") ||
      msg.includes("progrès")
    ) {
      var top = habitudes.filter(function (h) {
        return getStreak2(h.id) >= 3;
      });
      var faibles = habitudes.filter(function (h) {
        var v = moisD[h.id] || 0;
        return Math.round((v / h.obj) * 100) < 40;
      });
      var r = "Bonjour Noa ! Voici l'analyse de tes habitudes ce mois :\n\n";
      r +=
        "📊 Taux global : " +
        taux +
        "% (" +
        totalReal2 +
        "/" +
        totalObj2 +
        " réalisées)\n";
      r +=
        "✅ Faites aujourd'hui : " +
        habitDoneToday +
        "/" +
        habitudes.length +
        "\n";
      r +=
        "🔥 Meilleur streak : " +
        bestStreak2 +
        "j" +
        (bestHabit.nom ? " (" + bestHabit.nom + ")" : "") +
        "\n\n";
      if (top.length > 0) {
        r += "Points forts :\n";
        top.forEach(function (h) {
          r += "• " + h.nom + " — " + getStreak2(h.id) + "j de streak\n";
        });
      }
      if (faibles.length > 0) {
        r += "\nAxes d'amélioration :\n";
        faibles.forEach(function (h) {
          var v = moisD[h.id] || 0;
          r +=
            "• " +
            h.nom +
            " — seulement " +
            Math.round((v / h.obj) * 100) +
            "%\n";
        });
      }
      if (taux >= 70)
        r += "\nExcellent travail Noa ! Tu es en bonne voie ce mois-ci.";
      else if (taux >= 40) r += "\nBon début Noa, continue sur cette lancée !";
      else
        r +=
          "\nNoa, ce mois peut encore être rattrapé — concentre-toi sur 2-3 habitudes clés d'abord.";
      return r;
    }
    // Motivation
    if (
      msg.includes("motiv") ||
      msg.includes("courage") ||
      msg.includes("encour")
    ) {
      var r2 = "Noa, voici ton bilan motivationnel :\n\n";
      r2 +=
        "Tu as terminé " +
        terminees2 +
        " tâches sur " +
        taches.length +
        " ce mois.\n";
      r2 += "Ton score bien-être est de " + wb + "/100 — ";
      if (wb >= 70) r2 += "excellent, tu prends soin de toi !\n";
      else if (wb >= 40)
        r2 += "correct, quelques ajustements peuvent tout changer.\n";
      else
        r2 +=
          "il y a de la marge, commençons par le sommeil et les habitudes.\n";
      if (bestStreak2 >= 7)
        r2 +=
          "\n🔥 " +
          bestStreak2 +
          " jours de streak consécutifs — c'est de la discipline pure Noa !";
      else if (bestStreak2 >= 3)
        r2 +=
          "\n💪 " +
          bestStreak2 +
          " jours de suite — la régularité se construit !";
      r2 +=
        "\n\nRappelle-toi : chaque jour compte. Ce que tu fais aujourd'hui définit qui tu seras demain.";
      return r2;
    }
    // Tâches / priorités
    if (
      msg.includes("tâche") ||
      msg.includes("tache") ||
      msg.includes("priorit") ||
      msg.includes("plan") ||
      msg.includes("focus")
    ) {
      var r3 = "Noa, voici tes priorités maintenant :\n\n";
      if (urgentes2 > 0)
        r3 +=
          "🔴 " + urgentes2 + " tâche(s) URGENTE(S) à traiter en premier !\n";
      if (retard > 0)
        r3 += "⚠️ " + retard + " tâche(s) en retard à rattraper.\n";
      var enCours = taches.filter(function (t) {
        return t.statut === "En cours";
      });
      if (enCours.length > 0) {
        r3 += "\nEn cours :\n";
        enCours.slice(0, 3).forEach(function (t) {
          r3 +=
            "• " +
            t.nom +
            (t.echeance ? " (échéance : " + t.echeance + ")" : "") +
            "\n";
        });
      }
      var prochaines = taches.filter(function (t) {
        return t.statut === "Pas commence" && t.priorite === "Urgent";
      });
      if (prochaines.length > 0) {
        r3 += "\nÀ démarrer :\n";
        prochaines.slice(0, 3).forEach(function (t) {
          r3 += "• " + t.nom + "\n";
        });
      }
      r3 +=
        "\nConcentre-toi sur une tâche à la fois, Noa. La progression bat la perfection.";
      return r3;
    }
    // Bien-être
    if (
      msg.includes("bien") ||
      msg.includes("santé") ||
      msg.includes("sante") ||
      msg.includes("score") ||
      msg.includes("forme")
    ) {
      var r4 = "Noa, voici ton score bien-être du jour :\n\n";
      r4 += "💚 Score global : " + wb + "/100 — " + wbLabel(wb) + "\n\n";
      var mood = moodData[todayKey] || 0;
      var sommeil = parseFloat(sommeilData[todayKey]) || 0;
      var ws3 = new Date(today);
      var dw3 = ws3.getDay();
      ws3.setDate(ws3.getDate() + (dw3 === 0 ? -6 : 1 - dw3));
      var sportW = sportData.filter(function (s) {
        return s.date && new Date(s.date) >= ws3;
      }).length;
      r4 +=
        "• Habitudes : " +
        habitDoneToday +
        "/" +
        habitudes.length +
        " aujourd'hui\n";
      r4 += "• Humeur : " + (mood ? mood + "/5" : "non renseignée") + "\n";
      r4 += "• Sommeil : " + (sommeil ? sommeil + "h" : "non renseigné") + "\n";
      r4 += "• Sport : " + sportW + " séance(s) cette semaine\n\n";
      if (sommeil > 0 && sommeil < 6)
        r4 +=
          "Ton sommeil est insuffisant — vise 7-8h pour booster ton énergie.\n";
      if (sportW === 0)
        r4 +=
          "Pas de sport cette semaine encore — même 20min de marche compte !\n";
      if (mood > 0 && mood <= 2)
        r4 += "L'humeur est basse — prends soin de toi ce soir, Noa.\n";
      if (wb >= 70) r4 += "\nTu es en grande forme ! Continue comme ça.";
      return r4;
    }
    // Budget
    if (
      msg.includes("budget") ||
      msg.includes("argent") ||
      msg.includes("dépense") ||
      msg.includes("solde")
    ) {
      var r5 = "Noa, voici ton état financier du mois :\n\n";
      r5 += "💰 Revenus : " + fmt(revReel2) + "\n";
      r5 += "💸 Dépenses : " + fmt(depReel2) + "\n";
      r5 +=
        "📊 Solde : " + fmt(solde2) + (solde2 >= 0 ? " ✅" : " ⚠️") + "\n\n";
      if (solde2 < 0)
        r5 +=
          "Attention Noa, tes dépenses dépassent tes revenus ce mois. Regarde l'onglet Budget pour ajuster.";
      else if (solde2 > 0)
        r5 +=
          "Bonne gestion ! Tu as un solde positif de " +
          fmt(solde2) +
          " ce mois.";
      return r5;
    }
    // Bilan semaine
    if (
      msg.includes("bilan") ||
      msg.includes("semaine") ||
      msg.includes("résumé") ||
      msg.includes("resume")
    ) {
      var r6 = "Bilan de la semaine pour Noa :\n\n";
      r6 += "✅ Tâches terminées : " + terminees2 + "/" + taches.length + "\n";
      r6 += "🔄 Habitudes : " + taux + "% ce mois\n";
      r6 += "💚 Bien-être : " + wb + "/100\n";
      r6 += "🔥 Meilleur streak : " + bestStreak2 + " jours\n";
      r6 += "💰 Solde : " + fmt(solde2) + "\n\n";
      if (wb >= 70 && taux >= 60)
        r6 += "Excellente semaine Noa ! Tu es sur la bonne trajectoire.";
      else if (taux >= 40)
        r6 +=
          "Semaine correcte. Quelques habitudes à renforcer la semaine prochaine.";
      else
        r6 +=
          "Semaine difficile — c'est normal. Reprends les bases : sommeil, hydratation, une habitude à la fois.";
      return r6;
    }
    // Défaut
    var r7 = "Bonjour Noa ! Je suis ton Coach. Voici un aperçu rapide :\n\n";
    r7 += "• Habitudes : " + taux + "% ce mois\n";
    r7 += "• Tâches : " + terminees2 + "/" + taches.length + " terminées\n";
    r7 += "• Bien-être : " + wb + "/100\n";
    r7 += "• Streak max : " + bestStreak2 + "j\n\n";
    r7 +=
      "Pose-moi une question sur tes habitudes, ta motivation, tes priorités, ton bien-être ou ton budget !";
    return r7;
  }

  async function sendMessage(userMsg) {
    if (!userMsg.trim() || loading) return;
    var nm = [...messages, { role: "user", content: userMsg }];
    setMessages(nm);
    setInput("");
    setLoading(true);
    // Simulation d'un délai naturel
    await new Promise(function (r) {
      setTimeout(r, 600);
    });
    var reply = analyseLocale(userMsg);
    setMessages(function (p) {
      return [...p, { role: "assistant", content: reply }];
    });
    setLoading(false);
  }
  var QUICK = [
    { label: "Habitudes", msg: "Analyse mes habitudes ce mois." },
    { label: "Motivation", msg: "Motive-moi avec un message personnalisé." },
    { label: "Plan d'action", msg: "Quelles tâches prioriser maintenant ?" },
    {
      label: "Bien-être",
      msg: "Analyse mon score bien-être et conseille-moi.",
    },
  ];
  return (
    <>
      <button
        onClick={function () {
          setOpen(function (v) {
            return !v;
          });
        }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 300,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: open ? "#959B9E" : C.beige,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,.25)",
          transition: "all .3s",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}
      >
        {open ? (
          <span
            style={{
              color: "#fff",
              fontSize: 24,
              lineHeight: 1,
              transform: "rotate(-45deg)",
            }}
          >
            x
          </span>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        )}
      </button>
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 92,
            right: 24,
            zIndex: 299,
            width: 360,
            maxHeight: "70vh",
            background: C.cardBg,
            borderRadius: 18,
            border: "1px solid " + (C === DARK ? "#444" : "#E2DDD7"),
            boxShadow: "0 8px 40px rgba(0,0,0,.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: C.beige,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(255,255,255,.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                Coach IA
              </div>
              <div style={{ color: "rgba(255,255,255,.8)", fontSize: 11 }}>
                Analyse tes données NoaOS
              </div>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.map(function (m, i) {
              var isUser = m.role === "user";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 13px",
                      borderRadius: isUser
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                      background: isUser ? C.beige : C.tableBg,
                      color: isUser ? "#fff" : C.text,
                      fontSize: 13,
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    background: C.tableBg,
                    borderRadius: "14px 14px 14px 4px",
                    padding: "10px 16px",
                    display: "flex",
                    gap: 4,
                  }}
                >
                  {[0, 1, 2].map(function (i) {
                    return (
                      <div
                        key={i}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: C.beige,
                          animation:
                            "pulse 1.2s ease-in-out " + i * 0.2 + "s infinite",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          {messages.length <= 1 && (
            <div
              style={{
                padding: "0 12px 10px",
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                flexShrink: 0,
              }}
            >
              {QUICK.map(function (q, i) {
                return (
                  <button
                    key={i}
                    onClick={function () {
                      sendMessage(q.msg);
                    }}
                    style={{
                      background: C.tableBg,
                      border: "1px solid " + (C === DARK ? "#444" : "#E2DDD7"),
                      borderRadius: 20,
                      padding: "5px 11px",
                      fontSize: 11,
                      color: C.text,
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>
          )}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
              display: "flex",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <input
              value={input}
              onChange={function (e) {
                setInput(e.target.value);
              }}
              onKeyDown={function (e) {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Pose ta question..."
              style={{
                flex: 1,
                background: C.tableBg,
                border: "1px solid " + (C === DARK ? "#444" : "#D5D0CA"),
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 13,
                color: C.text,
                outline: "none",
              }}
            />
            <button
              onClick={function () {
                sendMessage(input);
              }}
              disabled={loading || !input.trim()}
              style={{
                background: C.beige,
                border: "none",
                borderRadius: 10,
                width: 38,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
        </div>
      )}
    </>
  );
}

// ── NOTES ─────────────────────────────────────────────────
function NotesTab({ notes, setNotes }) {
  var C = useContext(ThemeCtx);
  var [search, setSearch] = useState("");
  var [modal, setModal] = useState(false);
  var [editId, setEditId] = useState(null);
  var [form, setForm] = useState({
    titre: "",
    contenu: "",
    categorie: "Idée",
    epingle: false,
  });
  var inp = {
    background: C.tableBg,
    border: "1px solid #D5D0CA",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 13,
    color: C.text,
    outline: "none",
  };

  function openNew() {
    setForm({ titre: "", contenu: "", categorie: "Idée", epingle: false });
    setEditId(null);
    setModal(true);
  }
  function openEdit(note) {
    setForm(Object.assign({}, note));
    setEditId(note.id);
    setModal(true);
  }
  function saveNote() {
    if (!form.contenu || !form.contenu.trim()) return;
    if (editId) {
      setNotes(function (ns) {
        return ns.map(function (n) {
          return n.id === editId ? Object.assign({}, form, { id: editId }) : n;
        });
      });
    } else {
      setNotes(function (ns) {
        return [
          Object.assign({}, form, {
            id: uid(),
            date: new Date().toISOString().split("T")[0],
          }),
          ...ns,
        ];
      });
    }
    setModal(false);
    setEditId(null);
    setForm({ titre: "", contenu: "", categorie: "Idée", epingle: false });
  }
  function delNote(id) {
    setNotes(function (ns) {
      return ns.filter(function (n) {
        return n.id !== id;
      });
    });
  }
  function togglePin(id) {
    setNotes(function (ns) {
      return ns.map(function (n) {
        return n.id === id ? Object.assign({}, n, { epingle: !n.epingle }) : n;
      });
    });
  }

  var filtered = notes.filter(function (n) {
    if (!search.trim()) return true;
    var q = search.toLowerCase();
    return (
      (n.titre || "").toLowerCase().includes(q) ||
      (n.contenu || "").toLowerCase().includes(q) ||
      (n.categorie || "").toLowerCase().includes(q)
    );
  });
  var sorted = filtered
    .filter(function (n) {
      return n.epingle;
    })
    .concat(
      filtered.filter(function (n) {
        return !n.epingle;
      })
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h2
            style={{ fontSize: 20, fontWeight: 700, margin: 0, color: C.text }}
          >
            Notes
          </h2>
          <p style={{ color: C.textSec, fontSize: 13, margin: "4px 0 0" }}>
            {notes.length} note{notes.length > 1 ? "s" : ""}
          </p>
        </div>
        <Btn onClick={openNew}>+ Nouvelle note</Btn>
      </div>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <input
          placeholder="Rechercher dans les notes..."
          value={search}
          onChange={function (e) {
            setSearch(e.target.value);
          }}
          style={Object.assign({}, inp, {
            width: "100%",
            paddingLeft: 38,
            boxSizing: "border-box",
          })}
        />
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: C.textSec,
            display: "flex",
          }}
        >
          <IconSearch color={C.textSec} />
        </span>
      </div>
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}
      >
        {NOTE_CATEGORIES.map(function (cat) {
          var count = notes.filter(function (n) {
            return n.categorie === cat;
          }).length;
          if (count === 0) return null;
          var cc = NOTE_CAT_COLORS[cat];
          return (
            <span
              key={cat}
              style={{
                background: cc + "22",
                border: "1px solid " + cc + "44",
                color: cc,
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 99,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
              onClick={function () {
                setSearch(cat);
              }}
            >
              <span style={{ color: cc }}>
                <NoteCatIcon cat={cat} />
              </span>
              {cat} · {count}
            </span>
          );
        })}
      </div>
      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 12,
              color: C.tableBg,
            }}
          >
            <IconNote color={C.tableBg} />
          </div>
          <div style={{ fontSize: 14, color: C.textSec }}>
            {search
              ? 'Aucun résultat pour "' + search + '"'
              : "Aucune note. Crée ta première note !"}
          </div>
        </div>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {sorted.map(function (note) {
            var cc = NOTE_CAT_COLORS[note.categorie] || C.gray;
            return (
              <div
                key={note.id}
                style={{
                  background: C.cardBg,
                  borderRadius: 14,
                  padding: "16px",
                  border: "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
                  borderTop: "3px solid " + cc,
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={function () {
                  openEdit(note);
                }}
              >
                {note.epingle && (
                  <span
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      color: cc,
                      display: "flex",
                    }}
                  >
                    <IconPin color={cc} filled={true} size={13} />
                  </span>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: cc, display: "flex" }}>
                    <NoteCatIcon cat={note.categorie} />
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: cc,
                      background: cc + "18",
                      padding: "2px 8px",
                      borderRadius: 99,
                    }}
                  >
                    {note.categorie}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: C.textSec,
                      marginLeft: "auto",
                      paddingRight: note.epingle ? 18 : 0,
                    }}
                  >
                    {note.date}
                  </span>
                </div>
                {note.titre && (
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: C.text,
                      marginBottom: 6,
                      lineHeight: 1.3,
                    }}
                  >
                    {note.titre}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 12,
                    color: C.textSec,
                    lineHeight: 1.6,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {note.contenu}
                </div>
                <div
                  style={{ display: "flex", gap: 6, marginTop: 12 }}
                  onClick={function (e) {
                    e.stopPropagation();
                  }}
                >
                  <button
                    onClick={function (e) {
                      e.stopPropagation();
                      togglePin(note.id);
                    }}
                    style={{
                      background: note.epingle ? cc + "22" : C.tableBg,
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: 11,
                      cursor: "pointer",
                      color: note.epingle ? cc : C.textSec,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <IconPin
                      color={note.epingle ? cc : C.textSec}
                      filled={note.epingle}
                      size={11}
                    />
                    {note.epingle ? "Épinglé" : "Épingler"}
                  </button>
                  <button
                    onClick={function (e) {
                      e.stopPropagation();
                      delNote(note.id);
                    }}
                    style={{
                      background: C.tableBg,
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: 11,
                      cursor: "pointer",
                      color: C.red,
                      marginLeft: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <IconTrash color={C.red} size={11} />
                    Suppr.
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: C.cardBg,
              borderRadius: "16px 16px 0 0",
              padding: "24px 20px 32px",
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 99,
                background: C.tableBg,
                margin: "0 auto 20px",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                {editId ? "Modifier la note" : "Nouvelle note"}
              </span>
              <button
                onClick={function () {
                  setModal(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: C.textSec,
                  lineHeight: 1,
                }}
              >
                x
              </button>
            </div>
            <Row>
              <input
                placeholder="Titre (optionnel)"
                value={form.titre || ""}
                onChange={function (e) {
                  setForm(function (p) {
                    return Object.assign({}, p, { titre: e.target.value });
                  });
                }}
                style={Object.assign({}, inp, { flex: 1 })}
              />
            </Row>
            <Row>
              <select
                value={form.categorie || "Idée"}
                onChange={function (e) {
                  setForm(function (p) {
                    return Object.assign({}, p, { categorie: e.target.value });
                  });
                }}
                style={Object.assign({}, inp, { flex: 1 })}
              >
                {NOTE_CATEGORIES.map(function (c) {
                  return <option key={c}>{c}</option>;
                })}
              </select>
            </Row>
            <Row>
              <textarea
                placeholder="Écris ta note ici..."
                value={form.contenu || ""}
                onChange={function (e) {
                  setForm(function (p) {
                    return Object.assign({}, p, { contenu: e.target.value });
                  });
                }}
                style={{
                  background: C.tableBg,
                  border: "1px solid #D5D0CA",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 13,
                  color: C.text,
                  outline: "none",
                  width: "100%",
                  minHeight: 140,
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </Row>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <input
                type="checkbox"
                id="epingle"
                checked={form.epingle || false}
                onChange={function (e) {
                  setForm(function (p) {
                    return Object.assign({}, p, { epingle: e.target.checked });
                  });
                }}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <label
                htmlFor="epingle"
                style={{
                  fontSize: 13,
                  color: C.text,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <IconPin
                  color={form.epingle ? C.beige : C.textSec}
                  filled={form.epingle}
                  size={13}
                />
                Épingler cette note
              </label>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn
                onClick={function () {
                  setModal(false);
                }}
                bg={C.gray}
                style={{ flex: 1 }}
              >
                Annuler
              </Btn>
              <Btn onClick={saveNote} style={{ flex: 1 }}>
                Enregistrer
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROUTINE BUILDER ───────────────────────────────────────
function RoutineTab({ routines, setRoutines, routineLog, setRoutineLog }) {
  var C = useContext(ThemeCtx);
  var today = new Date();
  var todayKey = today.toISOString().split("T")[0];
  var todayLog = routineLog[todayKey] || { matin: {}, soir: {} };
  var [active, setActive] = useState("matin");
  var [modal, setModal] = useState(null);
  var [form, setForm] = useState({});
  var inp = {
    background: C.tableBg,
    border: "1px solid #D5D0CA",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 13,
    color: C.text,
    outline: "none",
  };

  function toggleStep(rk, sid) {
    setRoutineLog(function (d) {
      var nd = Object.assign({}, d);
      nd[todayKey] = Object.assign({}, d[todayKey] || { matin: {}, soir: {} });
      nd[todayKey][rk] = Object.assign({}, nd[todayKey][rk] || {});
      nd[todayKey][rk][sid] = !nd[todayKey][rk][sid];
      return nd;
    });
  }
  function addStep(rk) {
    if (!form.nom || !form.nom.trim()) return;
    var duree = parseInt(form.duree) || 5;
    setRoutines(function (r) {
      var nr = Object.assign({}, r);
      nr[rk] = Object.assign({}, r[rk]);
      nr[rk].etapes = [
        ...r[rk].etapes,
        { id: uid(), nom: form.nom.trim(), duree: duree },
      ];
      return nr;
    });
    setModal(null);
    setForm({});
  }
  function delStep(rk, sid) {
    setRoutines(function (r) {
      var nr = Object.assign({}, r);
      nr[rk] = Object.assign({}, r[rk]);
      nr[rk].etapes = r[rk].etapes.filter(function (e) {
        return e.id !== sid;
      });
      return nr;
    });
  }

  var routine = routines[active];
  var logR = todayLog[active] || {};
  var doneCount = routine.etapes.filter(function (e) {
    return logR[e.id];
  }).length;
  var totalMin = routine.etapes.reduce(function (s, e) {
    return s + (e.duree || 0);
  }, 0);
  var doneMin = routine.etapes
    .filter(function (e) {
      return logR[e.id];
    })
    .reduce(function (s, e) {
      return s + (e.duree || 0);
    }, 0);
  var pct =
    routine.etapes.length > 0
      ? Math.round((doneCount / routine.etapes.length) * 100)
      : 0;

  var histData = Array.from({ length: 7 }, function (_, i) {
    var d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    var k = d.toISOString().split("T")[0];
    var log = routineLog[k] || {};
    var maLog = log.matin || {};
    var soLog = log.soir || {};
    var maE = routines.matin.etapes;
    var soE = routines.soir.etapes;
    var maPct =
      maE.length > 0
        ? Math.round(
            (maE.filter(function (e) {
              return maLog[e.id];
            }).length /
              maE.length) *
              100
          )
        : 0;
    var soPct =
      soE.length > 0
        ? Math.round(
            (soE.filter(function (e) {
              return soLog[e.id];
            }).length /
              soE.length) *
              100
          )
        : 0;
    return {
      jour: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][
        (d.getDay() + 6) % 7
      ],
      matin: maPct,
      soir: soPct,
      isToday: k === todayKey,
    };
  });

  return (
    <div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 4,
          color: C.text,
        }}
      >
        Routines
      </h2>
      <p style={{ color: C.textSec, fontSize: 13, marginBottom: 20 }}>
        Construis et suis tes routines matin et soir
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          ["matin", "Matin"],
          ["soir", "Soir"],
        ].map(function (r) {
          var isMatin = r[0] === "matin";
          var isActive = active === r[0];
          return (
            <button
              key={r[0]}
              onClick={function () {
                setActive(r[0]);
              }}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: isActive ? C.beige : C.tableBg,
                color: isActive ? "#fff" : C.textSec,
                transition: "all .2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isMatin ? (
                <IconSun size={14} color={isActive ? "#fff" : C.textSec} />
              ) : (
                <IconMoon size={14} color={isActive ? "#fff" : C.textSec} />
              )}
              {r[1]}
            </button>
          );
        })}
      </div>
      <Card style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <SecTitle>
            {routine.nom} —{" "}
            {today.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })}
          </SecTitle>
          <span
            style={{
              fontSize: 12,
              color: pct === 100 ? C.green : C.beige,
              fontWeight: 700,
            }}
          >
            {doneCount}/{routine.etapes.length}
          </span>
        </div>
        <APBar pct={pct} color={pct === 100 ? C.green : C.beige} h={8} />
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <span style={{ fontSize: 12, color: C.textSec }}>
            Total : <b style={{ color: C.text }}>{totalMin} min</b>
          </span>
          <span style={{ fontSize: 12, color: C.textSec }}>
            Complété : <b style={{ color: C.green }}>{doneMin} min</b>
          </span>
          <span style={{ fontSize: 12, color: C.textSec }}>
            Score :{" "}
            <b style={{ color: pct === 100 ? C.green : C.beige }}>{pct}%</b>
          </span>
        </div>
      </Card>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {routine.etapes.map(function (e) {
          var checked = logR[e.id] || false;
          return (
            <div
              key={e.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                background: checked
                  ? C === DARK
                    ? "#1E2A1E"
                    : "#EBF2EC"
                  : C.cardBg,
                borderRadius: 10,
                border:
                  "1px solid " +
                  (checked ? C.green : C === DARK ? "#333" : "#E2DDD7"),
                transition: "all .2s",
              }}
            >
              <button
                onClick={function () {
                  toggleStep(active, e.id);
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: "1.5px solid " + (checked ? C.green : C.gray),
                  background: checked ? C.green : "transparent",
                  cursor: "pointer",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all .2s",
                }}
              >
                {checked && (
                  <span
                    style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}
                  >
                    ✓
                  </span>
                )}
              </button>
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: checked ? C.green : C.text,
                    textDecoration: checked ? "line-through" : "none",
                  }}
                >
                  {e.nom}
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: C.textSec,
                  background: C.tableBg,
                  padding: "2px 8px",
                  borderRadius: 99,
                  flexShrink: 0,
                }}
              >
                {e.duree} min
              </span>
              <Del
                onClick={function () {
                  delStep(active, e.id);
                }}
              />
            </div>
          );
        })}
        <button
          onClick={function () {
            setModal(active);
            setForm({ nom: "", duree: 5 });
          }}
          style={{
            border: "2px dashed " + (C === DARK ? "#444" : "#D5D0CA"),
            borderRadius: 10,
            padding: "12px",
            background: "transparent",
            color: C.textSec,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          + Ajouter une étape
        </button>
      </div>
      <Card>
        <SecTitle>Historique 7 jours</SecTitle>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart
            data={histData}
            barSize={14}
            margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
          >
            <XAxis
              dataKey="jour"
              tick={{ fontSize: 10, fill: C.textSec }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: C.textSec }}
              axisLine={false}
              tickLine={false}
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: C.cardBg,
                border: "1px solid " + (C === DARK ? "#444" : "#E2DDD7"),
                borderRadius: 8,
                fontSize: 11,
                color: C.text,
              }}
            />
            <Bar
              dataKey="matin"
              name="Matin"
              fill={C.beige}
              fillOpacity={0.85}
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="soir"
              name="Soir"
              fill={C.blue}
              fillOpacity={0.7}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: C.textSec,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: C.beige,
              }}
            />
            Matin
          </span>
          <span
            style={{
              fontSize: 11,
              color: C.textSec,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: C.blue,
              }}
            />
            Soir
          </span>
        </div>
      </Card>
      {modal && (
        <Modal
          title={"Nouvelle étape — " + (modal === "matin" ? "Matin" : "Soir")}
          onClose={function () {
            setModal(null);
            setForm({});
          }}
        >
          <Row>
            <input
              placeholder="Nom de l'étape"
              value={form.nom || ""}
              onChange={function (e) {
                setForm(function (p) {
                  return Object.assign({}, p, { nom: e.target.value });
                });
              }}
              style={Object.assign({}, inp, { flex: 1 })}
            />
          </Row>
          <Row>
            <input
              type="number"
              min="1"
              max="120"
              placeholder="Durée (min)"
              value={form.duree || ""}
              onChange={function (e) {
                setForm(function (p) {
                  return Object.assign({}, p, { duree: e.target.value });
                });
              }}
              style={Object.assign({}, inp, { flex: 1 })}
            />
          </Row>
          <MF
            onClose={function () {
              setModal(null);
              setForm({});
            }}
            onSave={function () {
              addStep(modal);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

// ── WELLBEING CARD ────────────────────────────────────────
function WellbeingCard({
  score,
  habitData,
  habitudes,
  moodData,
  sommeilData,
  sportData,
}) {
  var C = useContext(ThemeCtx);
  var today = new Date();
  var todayKey = today.toISOString().split("T")[0];
  var color = wbColor(score);
  var label = wbLabel(score);
  var history = Array.from({ length: 7 }, function (_, i) {
    var d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    var k = d.toISOString().split("T")[0];
    return {
      jour: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][
        (d.getDay() + 6) % 7
      ],
      score: calcWellbeing(
        k,
        habitData,
        habitudes,
        moodData,
        sommeilData,
        sportData
      ),
      isToday: k === todayKey,
    };
  });
  var td = habitData[todayKey] || {};
  var hd = habitudes.filter(function (h) {
    return td[h.id];
  }).length;
  var hs = habitudes.length > 0 ? Math.round((hd / habitudes.length) * 30) : 0;
  var m = moodData[todayKey] || 0;
  var ms = m ? Math.round((m / 5) * 25) : 0;
  var s = parseFloat(sommeilData[todayKey]) || 0;
  var ss = s >= 8 ? 25 : s >= 6 ? 18 : s >= 4 ? 10 : s > 0 ? 5 : 0;
  var ws2 = new Date(today);
  var dw = ws2.getDay();
  ws2.setDate(ws2.getDate() + (dw === 0 ? -6 : 1 - dw));
  var sp = sportData.filter(function (x) {
    return x.date && new Date(x.date) >= ws2;
  }).length;
  var sps = sp >= 4 ? 20 : sp >= 3 ? 16 : sp >= 2 ? 12 : sp >= 1 ? 6 : 0;
  var comps = [
    { label: "Habitudes", score: hs, max: 30, color: C.green },
    { label: "Humeur", score: ms, max: 25, color: C.blue },
    { label: "Sommeil", score: ss, max: 25, color: C.beige },
    { label: "Sport", score: sps, max: 20, color: "#8A7B94" },
  ];
  var circ = 2 * Math.PI * 44;
  var dashOffset = circ * (1 - score / 100);
  return (
    <Card>
      <SecTitle>Score Bien-être — Aujourd'hui</SecTitle>
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 100,
            height: 100,
            flexShrink: 0,
          }}
        >
          <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={C.tableBg}
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease, stroke .5s" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, color: color }}>
              {score}
            </span>
            <span
              style={{
                fontSize: 9,
                color: C.textSec,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              /100
            </span>
          </div>
        </div>
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: color,
              marginBottom: 2,
            }}
          >
            {label}
          </div>
          {comps.map(function (comp) {
            return (
              <div key={comp.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ color: C.textSec }}>{comp.label}</span>
                  <span style={{ color: C.text, fontWeight: 600 }}>
                    {comp.score}/{comp.max}
                  </span>
                </div>
                <APBar
                  pct={(comp.score / comp.max) * 100}
                  color={comp.color}
                  h={4}
                />
              </div>
            );
          })}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart
          data={history}
          barSize={18}
          margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
        >
          <XAxis
            dataKey="jour"
            tick={{ fontSize: 9, fill: C.textSec }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: C.textSec }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={function (v) {
              return [v + "/100", "Bien-être"];
            }}
            contentStyle={{
              background: C.cardBg,
              border: "1px solid " + (C === DARK ? "#444" : "#E2DDD7"),
              borderRadius: 8,
              fontSize: 11,
              color: C.text,
            }}
          />
          <Bar dataKey="score" radius={[3, 3, 0, 0]}>
            {history.map(function (d, i) {
              return (
                <Cell
                  key={i}
                  fill={d.isToday ? color : C.blue}
                  fillOpacity={d.isToday ? 1 : 0.5}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ── COMPARATIF ────────────────────────────────────────────
function ComparatifSemaine({
  habitudes,
  habitData,
  taches,
  sportData,
  moodData,
  sommeilData,
}) {
  var C = useContext(ThemeCtx);
  var today = new Date();
  function getWeekKeys(offset) {
    var d = new Date(today);
    var day = d.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff + offset * 7);
    var keys = [];
    for (var i = 0; i < 7; i++) {
      keys.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
    return keys;
  }
  var tw = getWeekKeys(0);
  var lw = getWeekKeys(-1);
  function avgH(keys) {
    if (!habitudes.length) return 0;
    var t = keys.reduce(function (s, k) {
      var d = habitData[k] || {};
      return (
        s +
        habitudes.filter(function (h) {
          return d[h.id];
        }).length
      );
    }, 0);
    return Math.round((t / (keys.length * habitudes.length)) * 100);
  }
  function cntT(keys) {
    return taches.filter(function (t) {
      return (
        t.statut === "Termine" &&
        keys.some(function (k) {
          return t.echeance === k;
        })
      );
    }).length;
  }
  function cntS(keys) {
    return sportData.filter(function (s) {
      return keys.includes(s.date);
    }).length;
  }
  function avgWB(keys) {
    var sc = keys
      .map(function (k) {
        return calcWellbeing(
          k,
          habitData,
          habitudes,
          moodData,
          sommeilData,
          sportData
        );
      })
      .filter(function (v) {
        return v > 0;
      });
    if (!sc.length) return 0;
    return Math.round(
      sc.reduce(function (s, v) {
        return s + v;
      }, 0) / sc.length
    );
  }
  var metrics = [
    { label: "Habitudes", this: avgH(tw), last: avgH(lw), unit: "%" },
    { label: "Tâches finies", this: cntT(tw), last: cntT(lw), unit: "" },
    { label: "Bien-être moy.", this: avgWB(tw), last: avgWB(lw), unit: "/100" },
    { label: "Sport", this: cntS(tw), last: cntS(lw), unit: " séances" },
  ];
  var days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  var chartData = days.map(function (j, i) {
    var tk = tw[i];
    var lk = lw[i];
    var tH =
      habitudes.length > 0
        ? Math.round(
            (habitudes.filter(function (h) {
              return (habitData[tk] || {})[h.id];
            }).length /
              habitudes.length) *
              100
          )
        : 0;
    var lH =
      habitudes.length > 0
        ? Math.round(
            (habitudes.filter(function (h) {
              return (habitData[lk] || {})[h.id];
            }).length /
              habitudes.length) *
              100
          )
        : 0;
    return { jour: j, cette: tH, derniere: lH };
  });
  return (
    <Card>
      <SecTitle>Comparatif — Cette semaine vs Dernière</SecTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {metrics.map(function (m) {
          var diff = m.this - m.last;
          var isPos = diff > 0;
          var isNeg = diff < 0;
          var dc = isPos ? C.green : isNeg ? C.red : C.textSec;
          return (
            <div
              key={m.label}
              style={{
                background: C.tableBg,
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: C.textSec,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {m.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>
                {m.this}
                {m.unit}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <span style={{ fontSize: 11, color: dc, fontWeight: 700 }}>
                  {isPos ? "+" : ""}
                  {diff}
                  {m.unit}
                </span>
                <span style={{ fontSize: 10, color: C.textSec }}>
                  vs sem. passée
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontSize: 11,
          color: C.textSec,
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        Habitudes / jour (%)
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart
          data={chartData}
          barSize={10}
          margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
        >
          <XAxis
            dataKey="jour"
            tick={{ fontSize: 9, fill: C.textSec }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: C.textSec }}
            axisLine={false}
            tickLine={false}
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              background: C.cardBg,
              border: "1px solid " + (C === DARK ? "#444" : "#E2DDD7"),
              borderRadius: 8,
              fontSize: 11,
              color: C.text,
            }}
          />
          <Bar
            dataKey="cette"
            name="Cette semaine"
            fill={C.beige}
            fillOpacity={0.9}
            radius={[3, 3, 0, 0]}
          />
          <Bar
            dataKey="derniere"
            name="Sem. dernière"
            fill={C.blue}
            fillOpacity={0.5}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          marginTop: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: C.textSec,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: C.beige,
            }}
          />
          Cette semaine
        </span>
        <span
          style={{
            fontSize: 11,
            color: C.textSec,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: C.blue,
              opacity: 0.5,
            }}
          />
          Sem. dernière
        </span>
      </div>
    </Card>
  );
}

// ── LOGIN ─────────────────────────────────────────────────
function LoginScreen({ onLogin, C }) {
  var [input, setInput] = useState("");
  var [error, setError] = useState(false);
  var [show, setShow] = useState(false);
  function submit() {
    if (input === APP_PASSWORD) {
      onLogin();
    } else {
      setError(true);
      setTimeout(function () {
        setError(false);
      }, 2000);
    }
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.pageBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: C.cardBg,
          borderRadius: 20,
          padding: "40px 32px",
          width: "100%",
          maxWidth: 380,
          border: "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
          boxShadow: "0 4px 40px rgba(0,0,0,.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: C.beige,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>
                N/S
              </span>
            </div>
            <div>
              <span style={{ fontSize: 28, fontWeight: 900, color: C.text }}>
                Noa
              </span>
              <span style={{ fontSize: 28, fontWeight: 900, color: C.beige }}>
                OS
              </span>
            </div>
          </div>
          <p style={{ color: C.textSec, fontSize: 13 }}>
            Connecte-toi pour acceder a ton espace
          </p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: C.textSec,
              marginBottom: 8,
            }}
          >
            Mot de passe
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={show ? "text" : "password"}
              placeholder="..."
              value={input}
              onChange={function (e) {
                setInput(e.target.value);
                setError(false);
              }}
              onKeyDown={function (e) {
                if (e.key === "Enter") submit();
              }}
              style={{
                background: C.tableBg,
                border: "1px solid " + (error ? "#C4584A" : "#D5D0CA"),
                borderRadius: 10,
                padding: "12px 44px 12px 14px",
                fontSize: 14,
                color: C.text,
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={function () {
                setShow(function (s) {
                  return !s;
                });
              }}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.textSec,
                fontSize: 14,
              }}
            >
              {show ? "hide" : "show"}
            </button>
          </div>
          {error && (
            <div style={{ fontSize: 12, color: "#C4584A", marginTop: 6 }}>
              Mot de passe incorrect
            </div>
          )}
        </div>
        <button
          onClick={submit}
          style={{
            width: "100%",
            background: C.beige,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "13px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Acceder au dashboard
        </button>
      </div>
    </div>
  );
}

// ── POMODORO ──────────────────────────────────────────────
function PomodoroTimer() {
  var C = useContext(ThemeCtx);
  var [mode, setMode] = useState("focus");
  var DUR = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  var [timeLeft, setTimeLeft] = useState(DUR.focus);
  var [running, setRunning] = useState(false);
  var [sessions, setSessions] = useState(0);
  var iv = useRef(null);
  useEffect(
    function () {
      if (running) {
        iv.current = setInterval(function () {
          setTimeLeft(function (t) {
            if (t <= 1) {
              clearInterval(iv.current);
              setRunning(false);
              if (mode === "focus")
                setSessions(function (s) {
                  return s + 1;
                });
              if (
                "Notification" in window &&
                Notification.permission === "granted"
              )
                new Notification("NoaOS", {
                  body:
                    mode === "focus"
                      ? "Session terminee !"
                      : "Pause terminee !",
                });
              return DUR[mode];
            }
            return t - 1;
          });
        }, 1000);
      }
      return function () {
        clearInterval(iv.current);
      };
    },
    [running, mode]
  );
  function changeMode(m) {
    setMode(m);
    setTimeLeft(DUR[m]);
    setRunning(false);
    clearInterval(iv.current);
  }
  var pct = (timeLeft / DUR[mode]) * 100;
  var min = Math.floor(timeLeft / 60);
  var sec = timeLeft % 60;
  var r = 54;
  var circ = 2 * Math.PI * r;
  return (
    <Card>
      <SecTitle>Mode Focus - Pomodoro</SecTitle>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[
          ["focus", "Focus 25min"],
          ["short", "Pause 5min"],
          ["long", "Pause 15min"],
        ].map(function (m) {
          return (
            <button
              key={m[0]}
              onClick={function () {
                changeMode(m[0]);
              }}
              style={{
                flex: 1,
                padding: "6px 4px",
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: mode === m[0] ? C.beige : C.tableBg,
                color: mode === m[0] ? "#fff" : C.textSec,
              }}
            >
              {m[1]}
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ position: "relative", width: 140, height: 140 }}>
          <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={C.tableBg}
              strokeWidth="8"
            />
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={C.beige}
              strokeWidth="8"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset .5s" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 700, color: C.text }}>
              {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 11, color: C.textSec }}>
              {sessions} session{sessions > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={function () {
              setRunning(function (r) {
                return !r;
              });
            }}
            style={{
              background: running ? C.red : C.green,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 28px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={function () {
              setRunning(false);
              setTimeLeft(DUR[mode]);
              clearInterval(iv.current);
            }}
            style={{
              background: C.tableBg,
              color: C.textSec,
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </Card>
  );
}

// ── APP ───────────────────────────────────────────────────
export default function App() {
  useEffect(function () {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflowX = "hidden";
  }, []);
  var [auth, setAuth] = useSynced("auth_v1", false);
  var [darkMode, setDarkMode] = useState(isDark());
  var [manualDark, setManualDark] = useState(null);
  var C =
    manualDark !== null ? (manualDark ? DARK : LIGHT) : darkMode ? DARK : LIGHT;
  useEffect(function () {
    var t = setInterval(function () {
      setDarkMode(isDark());
    }, 60000);
    return function () {
      clearInterval(t);
    };
  }, []);

  var [tab, setTab] = useSynced("tab_v3", "dashboard");
  var [taches, setTaches] = useSynced("taches_v3", DEF_TACHES);
  var [habitudes, setHabitudes] = useSynced("habitudes_v3", DEF_HABITUDES);
  var [projets, setProjets] = useSynced("projets_v3", DEF_PROJETS);
  var [domaines, setDomaines] = useSynced("domaines_v3", DEF_DOMAINES);
  var [objectifs, setObjectifs] = useSynced("objectifs_v3", DEF_OBJECTIFS);
  var [budget, setBudget] = useSynced("budget_v3", DEF_BUDGET);
  var [moisIdx, setMoisIdx] = useSynced("mois_v3", 0);
  var [habitData, setHabitData] = useSynced("habitdata_v3", {});
  var [moodData, setMoodData] = useSynced("mood_v1", {});
  var [livres, setLivres] = useSynced("livres_v1", []);
  var [sommeilData, setSommeilData] = useSynced("sommeil_v1", {});
  var [sportData, setSportData] = useSynced("sport_v1", []);
  var [gratitudeData, setGratitudeData] = useSynced("gratitude_v1", {});
  var [affirmIdx, setAffirmIdx] = useSynced("affirm_v1", 0);
  var [countdowns, setCountdowns] = useSynced("countdowns_v1", []);
  var [retroData, setRetroData] = useSynced("retro_v1", {});
  var [visionBoard, setVisionBoard] = useSynced("visionboard_v1", []);
  var [routines, setRoutines] = useSynced("routines_v1", DEF_ROUTINES);
  var [routineLog, setRoutineLog] = useSynced("routinelog_v1", {});
  var [notes, setNotes] = useSynced("notes_v1", []);
  var [versetOffset, setVersetOffset] = useState(0);
  var [selectedHabitDay, setSelectedHabitDay] = useState(
    new Date().toISOString().split("T")[0]
  );
  var [modal, setModal] = useState(null);
  var [form, setForm] = useState({});
  var [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  var [menuOpen, setMenuOpen] = useState(false);
  var [permission, setPermission] = useState("default");
  var [bannerDismissed, setBannerDismissed] = useSynced("banner_dismissed", "");
  var [confetti, setConfetti] = useState(false);
  var prevHabitDone = useRef(0);

  useEffect(function () {
    var h = function () {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", h);
    return function () {
      window.removeEventListener("resize", h);
    };
  }, []);
  useEffect(function () {
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  var today = new Date();
  var todayKey = today.toISOString().split("T")[0];
  var mois = MOIS[moisIdx];
  var moisData = habitData[mois] || {};
  var todayData = habitData[todayKey] || {};
  function getStreak(hid) {
    var streak = 0;
    var d = new Date(today);
    while (true) {
      var k = d.toISOString().split("T")[0];
      var dd = habitData[k];
      if (dd && dd[hid]) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  }

  // Toutes ces variables sont recalculées à chaque rendu pour rester réactives
  var todayDataLive = habitData[todayKey] || {};
  var terminees = taches.filter(function (t) {
    return t.statut === "Termine";
  }).length;
  var enRetard = taches.filter(function (t) {
    return t.statut !== "Termine" && t.echeance && new Date(t.echeance) < today;
  }).length;
  var totalObj = habitudes.reduce(function (s, h) {
    return s + h.obj;
  }, 0);
  var totalReal = habitudes.reduce(function (s, h) {
    return s + (moisData[h.id] || 0);
  }, 0);
  var tauxHabit = totalObj > 0 ? Math.round((totalReal / totalObj) * 100) : 0;
  var revReel = budget.revenus.reduce(function (s, r) {
    return s + (+r.reel || 0);
  }, 0);
  var depReel =
    budget.fixes.reduce(function (s, r) {
      return s + (+r.reel || 0);
    }, 0) +
    budget.variables.reduce(function (s, r) {
      return s + (+r.reel || 0);
    }, 0);
  var solde = revReel - depReel;
  var habitWeekDone = habitudes.filter(function (h) {
    return todayDataLive[h.id];
  }).length;
  var bestStreak = habitudes.reduce(function (best, h) {
    return Math.max(best, getStreak(h.id));
  }, 0);
  var alertes = taches.filter(function (t) {
    var r =
      t.statut !== "Termine" && t.echeance && new Date(t.echeance) < today;
    var u = t.statut !== "Termine" && t.priorite === "Urgent";
    return r || u;
  });
  var showBanner = alertes.length > 0 && bannerDismissed !== todayKey;
  var todayMood = moodData[todayKey];
  var todayGratitude = gratitudeData[todayKey] || { g1: "", g2: "", g3: "" };
  var todaySommeil = sommeilData[todayKey] || "";
  var affirmation = AFFIRMATIONS[affirmIdx % AFFIRMATIONS.length];
  var wellbeingScore = calcWellbeing(
    todayKey,
    habitData,
    habitudes,
    moodData,
    sommeilData,
    sportData
  );

  useEffect(
    function () {
      if (
        habitWeekDone === habitudes.length &&
        habitudes.length > 0 &&
        prevHabitDone.current < habitudes.length
      ) {
        setConfetti(true);
      }
      prevHabitDone.current = habitWeekDone;
    },
    [habitWeekDone]
  );

  var animTerminees = useCountUp(terminees);
  var animEnRetard = useCountUp(enRetard);
  var animTaux = useCountUp(tauxHabit);
  var animWB = useCountUp(wellbeingScore);

  var weekHabitData = (function () {
    var days = [];
    var now = new Date(today);
    var day = now.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    var mon = new Date(now);
    mon.setDate(now.getDate() + diff);
    for (var i = 0; i < 7; i++) {
      var d = new Date(mon);
      d.setDate(mon.getDate() + i);
      var k = d.toISOString().split("T")[0];
      var dd = habitData[k] || {};
      var done = habitudes.filter(function (h) {
        return dd[h.id];
      }).length;
      days.push({
        jour: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i],
        done: done,
        total: habitudes.length,
        isToday: k === todayKey,
      });
    }
    return days;
  })();
  var livresChartData = MOIS.map(function (m, mi) {
    var count = livres.filter(function (l) {
      return (
        l.statut === "Termine" && l.date && new Date(l.date).getMonth() === mi
      );
    }).length;
    return { mois: m, livres: count };
  });
  var countdownsWithDays = countdowns
    .map(function (c) {
      var diff = Math.ceil((new Date(c.date) - today) / (1000 * 60 * 60 * 24));
      return Object.assign({}, c, { jours: diff });
    })
    .sort(function (a, b) {
      return a.jours - b.jours;
    });
  var retroKey = new Date().toISOString().substring(0, 7);
  var retroMois = retroData[retroKey] || {
    victoires: "",
    ameliorations: "",
    focus: "",
    gratitude: "",
    note: 3,
  };
  var depData = [
    {
      name: "Fixes",
      value: budget.fixes.reduce(function (s, r) {
        return s + (+r.reel || 0);
      }, 0),
      color: C.beige,
    },
    {
      name: "Variables",
      value: budget.variables.reduce(function (s, r) {
        return s + (+r.reel || 0);
      }, 0),
      color: C.blue,
    },
  ].filter(function (d) {
    return d.value > 0;
  });
  var totalDep = depData.reduce(function (s, d) {
    return s + d.value;
  }, 0);
  var habitBarData = MOIS.map(function (m, i) {
    var d = habitData[m] || {};
    var real = habitudes.reduce(function (s, h) {
      return s + (d[h.id] || 0);
    }, 0);
    return {
      mois: m,
      taux:
        totalObj > 0 ? Math.min(100, Math.round((real / totalObj) * 100)) : 0,
      active: i === moisIdx,
    };
  });
  var donutData = PRIORITES.map(function (p) {
    return {
      name: p,
      value: taches.filter(function (t) {
        return t.priorite === p;
      }).length,
      color: DONUT_COLORS[p],
    };
  }).filter(function (d) {
    return d.value > 0;
  });
  var moodChartData = Object.keys(moodData)
    .sort()
    .slice(-30)
    .map(function (k) {
      return { date: k.slice(5), mood: moodData[k] };
    });
  var sommeilChartData = Object.keys(sommeilData)
    .sort()
    .slice(-14)
    .map(function (k) {
      return { date: k.slice(5), h: parseFloat(sommeilData[k]) || 0 };
    });

  function requestPermission() {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then(function (p) {
      setPermission(p);
    });
  }
  function toggleHabit(hid, dayKey) {
    setHabitData(function (d) {
      var nd = Object.assign({}, d);
      nd[dayKey] = Object.assign({}, d[dayKey] || {});
      nd[dayKey][hid] = !nd[dayKey][hid];
      var ym = dayKey.substring(0, 7);
      var mc = 0;
      Object.keys(nd).forEach(function (k) {
        if (k.length === 10 && k.startsWith(ym) && nd[k] && nd[k][hid]) mc++;
      });
      var ms = MOIS[new Date(dayKey).getMonth()];
      nd[ms] = Object.assign({}, nd[ms] || {});
      nd[ms][hid] = mc;
      return nd;
    });
  }

  function openModal(type, data) {
    setModal(type);
    setForm(Object.assign({}, data || {}));
  }
  function close() {
    setModal(null);
    setForm({});
  }
  function f(k, v) {
    setForm(function (p) {
      var n = Object.assign({}, p);
      n[k] = v;
      return n;
    });
  }
  function saveTache() {
    if (!form.nom || !form.nom.trim()) return;
    if (form.id)
      setTaches(function (ts) {
        return ts.map(function (t) {
          return t.id === form.id ? Object.assign({}, form) : t;
        });
      });
    else
      setTaches(function (ts) {
        return ts.concat([
          Object.assign({}, form, { id: uid(), statut: "Pas commence" }),
        ]);
      });
    close();
  }
  function delTache(id) {
    setTaches(function (ts) {
      return ts.filter(function (t) {
        return t.id !== id;
      });
    });
  }
  function toggleT(id) {
    setTaches(function (ts) {
      return ts.map(function (t) {
        return t.id === id
          ? Object.assign({}, t, {
              statut: t.statut === "Termine" ? "En cours" : "Termine",
            })
          : t;
      });
    });
  }
  function saveHabitude() {
    if (!form.nom || !form.nom.trim()) return;
    var obj = Math.max(1, parseInt(form.obj) || 1);
    if (form.id)
      setHabitudes(function (hs) {
        return hs.map(function (h) {
          return h.id === form.id ? Object.assign({}, form, { obj: obj }) : h;
        });
      });
    else
      setHabitudes(function (hs) {
        return hs.concat([{ nom: form.nom.trim(), obj: obj, id: uid() }]);
      });
    close();
  }
  function delHabitude(id) {
    setHabitudes(function (hs) {
      return hs.filter(function (h) {
        return h.id !== id;
      });
    });
    setHabitData(function (d) {
      var nd = Object.assign({}, d);
      MOIS.forEach(function (m) {
        if (nd[m]) {
          var nm = Object.assign({}, nd[m]);
          delete nm[id];
          nd[m] = nm;
        }
      });
      return nd;
    });
  }
  function saveProjet() {
    if (!form.nom || !form.nom.trim()) return;
    var prog = Math.min(100, Math.max(0, parseInt(form.prog) || 0));
    if (form.id)
      setProjets(function (ps) {
        return ps.map(function (p) {
          return p.id === form.id ? Object.assign({}, form, { prog: prog }) : p;
        });
      });
    else
      setProjets(function (ps) {
        return ps.concat([
          Object.assign({}, form, {
            id: uid(),
            prog: prog,
            statut: form.statut || "Planifie",
          }),
        ]);
      });
    close();
  }
  function delProjet(id) {
    setProjets(function (ps) {
      return ps.filter(function (p) {
        return p.id !== id;
      });
    });
  }
  function saveDomaine() {
    if (!form.nom || !form.nom.trim()) return;
    if (form.id)
      setDomaines(function (ds) {
        return ds.map(function (d) {
          return d.id === form.id ? Object.assign({}, form) : d;
        });
      });
    else
      setDomaines(function (ds) {
        return ds.concat([
          Object.assign({}, form, {
            id: uid(),
            color: form.color || DOMAINE_COLORS[0],
          }),
        ]);
      });
    close();
  }
  function delDomaine(id) {
    setDomaines(function (ds) {
      return ds.filter(function (d) {
        return d.id !== id;
      });
    });
    setObjectifs(function (os) {
      return os.filter(function (o) {
        return o.domaineId !== id;
      });
    });
  }
  function saveObjectif() {
    if (!form.obj || !form.obj.trim()) return;
    if (form.id)
      setObjectifs(function (os) {
        return os.map(function (o) {
          return o.id === form.id
            ? Object.assign({}, form, { score: parseInt(form.score) || 0 })
            : o;
        });
      });
    else
      setObjectifs(function (os) {
        return os.concat([
          Object.assign({}, form, {
            id: uid(),
            score: 0,
            domaineId: form.domaineId || (domaines[0] && domaines[0].id),
            terme: form.terme || "moyen",
          }),
        ]);
      });
    close();
  }
  function delObjectif(id) {
    setObjectifs(function (os) {
      return os.filter(function (o) {
        return o.id !== id;
      });
    });
  }
  function saveBudget(sec) {
    if (!form.cat || !form.cat.trim()) return;
    var prevu = parseFloat(form.prevu) || 0,
      reel = parseFloat(form.reel) || 0;
    if (form.id)
      setBudget(function (b) {
        var nb = Object.assign({}, b);
        nb[sec] = b[sec].map(function (r) {
          return r.id === form.id
            ? Object.assign({}, form, { prevu, reel })
            : r;
        });
        return nb;
      });
    else
      setBudget(function (b) {
        var nb = Object.assign({}, b);
        nb[sec] = b[sec].concat([
          { cat: form.cat.trim(), prevu, reel, id: uid() },
        ]);
        return nb;
      });
    close();
  }
  function delBudget(sec, id) {
    setBudget(function (b) {
      var nb = Object.assign({}, b);
      nb[sec] = b[sec].filter(function (r) {
        return r.id !== id;
      });
      return nb;
    });
  }
  function saveLivre() {
    if (!form.titre || !form.titre.trim()) return;
    if (form.id)
      setLivres(function (ls) {
        return ls.map(function (l) {
          return l.id === form.id ? Object.assign({}, form) : l;
        });
      });
    else
      setLivres(function (ls) {
        return ls.concat([
          Object.assign({}, form, {
            id: uid(),
            date: new Date().toISOString().split("T")[0],
          }),
        ]);
      });
    close();
  }
  function delLivre(id) {
    setLivres(function (ls) {
      return ls.filter(function (l) {
        return l.id !== id;
      });
    });
  }
  function saveSport() {
    if (!form.type || !form.type.trim()) return;
    setSportData(function (s) {
      return s.concat([
        Object.assign({}, form, { id: uid(), date: form.date || todayKey }),
      ]);
    });
    close();
  }
  function delSport(id) {
    setSportData(function (s) {
      return s.filter(function (x) {
        return x.id !== id;
      });
    });
  }
  function saveCountdown() {
    if (!form.nom || !form.nom.trim() || !form.date) return;
    if (form.id)
      setCountdowns(function (cs) {
        return cs.map(function (c) {
          return c.id === form.id ? Object.assign({}, form) : c;
        });
      });
    else
      setCountdowns(function (cs) {
        return cs.concat([Object.assign({}, form, { id: uid() })]);
      });
    close();
  }
  function delCountdown(id) {
    setCountdowns(function (cs) {
      return cs.filter(function (c) {
        return c.id !== id;
      });
    });
  }
  function saveVisionCard() {
    if (!form.titre || !form.titre.trim()) return;
    if (form.id)
      setVisionBoard(function (vs) {
        return vs.map(function (v) {
          return v.id === form.id ? Object.assign({}, form) : v;
        });
      });
    else
      setVisionBoard(function (vs) {
        return vs.concat([Object.assign({}, form, { id: uid() })]);
      });
    close();
  }
  function delVisionCard(id) {
    setVisionBoard(function (vs) {
      return vs.filter(function (v) {
        return v.id !== id;
      });
    });
  }

  var TABS = [
    { id: "dashboard", label: "Accueil" },
    { id: "todo", label: "To Do" },
    { id: "habitudes", label: "Habitudes" },
    { id: "routines", label: "Routines" },
    { id: "notes", label: "Notes" },
    { id: "budget", label: "Budget" },
    { id: "vision", label: "Vision" },
    { id: "projets", label: "Projets" },
    { id: "focus", label: "Focus" },
    { id: "lecture", label: "Lecture" },
    { id: "sante", label: "Sante" },
    { id: "countdown", label: "Countdown" },
    { id: "retro", label: "Retro" },
  ];
  var g2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  var g4 = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
    gap: 12,
  };
  var inp = {
    background: C.tableBg,
    border: "1px solid #D5D0CA",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 13,
    color: C.text,
    outline: "none",
  };
  var verset = getVersetDuJour(versetOffset);

  if (auth === false)
    return (
      <LoginScreen
        onLogin={function () {
          setAuth(true);
        }}
        C={C}
      />
    );

  return (
    <ThemeCtx.Provider value={C}>
      <div
        style={{
          minHeight: "100vh",
          background: C.pageBg,
          fontFamily: "'Inter',system-ui,sans-serif",
          color: C.text,
          transition: "background .4s",
          overflowX: "hidden",
        }}
      >
        {!isMobile && (
          <div
            style={{
              background: C.headerBg,
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              position: "sticky",
              top: 0,
              zIndex: 20,
              overflowX: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 0",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: C.beige,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>
                  N/S
                </span>
              </div>
              <span style={{ color: C.white, fontWeight: 900, fontSize: 16 }}>
                Noa<span style={{ color: C.beige }}>OS</span>
              </span>
            </div>
            <div style={{ display: "flex", flex: 1 }}>
              {TABS.map(function (t) {
                return (
                  <button
                    key={t.id}
                    onClick={function () {
                      setTab(t.id);
                    }}
                    style={{
                      padding: "14px 10px",
                      fontSize: 12,
                      fontWeight: 500,
                      border: "none",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      background: "transparent",
                      color: tab === t.id ? C.white : "#A8ABB0",
                      borderBottom:
                        tab === t.id
                          ? "2px solid " + C.beige
                          : "2px solid transparent",
                      transition: "all .2s",
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={function () {
                setManualDark(function (m) {
                  return m === null ? !darkMode : !m;
                });
              }}
              style={{
                background: "rgba(255,255,255,.1)",
                border: "none",
                borderRadius: 20,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 14,
                color: C.white,
                flexShrink: 0,
              }}
            >
              {(manualDark !== null ? manualDark : darkMode) ? "Jour" : "Nuit"}
            </button>
          </div>
        )}

        {isMobile && (
          <div
            style={{
              background: C.headerBg,
              padding: "12px 18px",
              position: "sticky",
              top: 0,
              zIndex: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: C.beige,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>
                  N/S
                </span>
              </div>
              <div>
                <div style={{ color: C.white, fontWeight: 900, fontSize: 16 }}>
                  Noa<span style={{ color: C.beige }}>OS</span>
                </div>
                <div style={{ fontSize: 10, color: "#A8ABB0" }}>
                  {today.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={function () {
                  setManualDark(function (m) {
                    return m === null ? !darkMode : !m;
                  });
                }}
                style={{
                  background: "rgba(255,255,255,.1)",
                  border: "none",
                  borderRadius: 20,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontSize: 12,
                  color: C.white,
                }}
              >
                {(manualDark !== null ? manualDark : darkMode)
                  ? "Jour"
                  : "Nuit"}
              </button>
              <button
                onClick={function () {
                  setMenuOpen(function (v) {
                    return !v;
                  });
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  padding: "4px 6px",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 2,
                    borderRadius: 99,
                    background: menuOpen ? C.beige : "#A8ABB0",
                    transition: "all .2s",
                    transform: menuOpen
                      ? "rotate(45deg) translate(5px,5px)"
                      : "none",
                  }}
                />
                <div
                  style={{
                    width: 22,
                    height: 2,
                    borderRadius: 99,
                    background: menuOpen ? "transparent" : "#A8ABB0",
                    transition: "all .2s",
                  }}
                />
                <div
                  style={{
                    width: 22,
                    height: 2,
                    borderRadius: 99,
                    background: menuOpen ? C.beige : "#A8ABB0",
                    transition: "all .2s",
                    transform: menuOpen
                      ? "rotate(-45deg) translate(5px,-5px)"
                      : "none",
                  }}
                />
              </button>
            </div>
          </div>
        )}

        {isMobile && menuOpen && (
          <div
            style={{
              position: "fixed",
              top: 56,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 15,
            }}
          >
            <div
              onClick={function () {
                setMenuOpen(false);
              }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,.4)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 240,
                height: "100%",
                background: C.headerBg,
                padding: "8px 0",
                overflowY: "auto",
              }}
            >
              {TABS.map(function (t) {
                return (
                  <button
                    key={t.id}
                    onClick={function () {
                      setTab(t.id);
                      setMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 22px",
                      background:
                        tab === t.id ? "rgba(255,255,255,.05)" : "transparent",
                      border: "none",
                      borderLeft:
                        tab === t.id
                          ? "3px solid " + C.beige
                          : "3px solid transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: tab === t.id ? 700 : 500,
                        color: tab === t.id ? C.white : "#A8ABB0",
                      }}
                    >
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showBanner && (
          <div
            style={{
              background: "#C4584A",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>
              {alertes.length} tache{alertes.length > 1 ? "s" : ""} urgente
              {alertes.length > 1 ? "s" : ""} ou en retard
            </span>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {permission !== "granted" && (
                <button
                  onClick={requestPermission}
                  style={{
                    background: "rgba(255,255,255,.2)",
                    border: "1px solid rgba(255,255,255,.4)",
                    color: "#fff",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Activer notifs
                </button>
              )}
              <button
                onClick={function () {
                  setBannerDismissed(todayKey);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,.8)",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                x
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            maxWidth: isMobile ? "100%" : 960,
            margin: "0 auto",
            padding: isMobile ? "16px 14px" : "28px 20px",
          }}
        >
          <PageTransition tabKey={tab}>
            <div>
              {tab === "dashboard" && (
                <div>
                  {!isMobile && (
                    <Anim delay={0}>
                      <div style={{ marginBottom: 16 }}>
                        <h1
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            margin: 0,
                            color: C.text,
                          }}
                        >
                          Tableau de bord
                        </h1>
                        <p
                          style={{
                            color: C.textSec,
                            fontSize: 13,
                            marginTop: 4,
                          }}
                        >
                          {today.toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </Anim>
                  )}
                  {isMobile && (
                    <h2
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        margin: "0 0 14px",
                        color: C.text,
                      }}
                    >
                      Bonjour Noa
                    </h2>
                  )}

                  {/* Affirmation */}
                  <Anim delay={0}>
                    <div
                      style={{
                        background: C === DARK ? "#1E1E28" : "#EAE6F8",
                        borderRadius: 14,
                        padding: "14px 18px",
                        marginBottom: 14,
                        borderLeft: "3px solid " + C.blue,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            color: C.blue,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          Affirmation du jour
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: C.text,
                            fontStyle: "italic",
                          }}
                        >
                          {affirmation}
                        </div>
                      </div>
                      <button
                        onClick={function () {
                          setAffirmIdx(function (i) {
                            return (i + 1) % AFFIRMATIONS.length;
                          });
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: C.blue,
                          fontSize: 18,
                          flexShrink: 0,
                          padding: "0 0 0 12px",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </Anim>

                  {/* Citation */}
                  <Anim delay={1}>
                    <div
                      style={{
                        background: C === DARK ? "#1E2028" : "#F0EBE3",
                        borderRadius: 14,
                        padding: "14px 18px",
                        marginBottom: 14,
                        borderLeft: "3px solid " + C.beige,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: C.textSec,
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}
                      >
                        Citation du jour
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: C.text,
                          fontStyle: "italic",
                          lineHeight: 1.6,
                          marginBottom: 4,
                        }}
                      >
                        {getCitationDuJour().t}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.beige,
                          fontWeight: 600,
                        }}
                      >
                        — {getCitationDuJour().a}
                      </div>
                    </div>
                  </Anim>

                  {/* Verset biblique */}
                  <Anim delay={2}>
                    <div
                      style={{
                        background: C === DARK ? "#1A2020" : "#EAF3EC",
                        borderRadius: 14,
                        padding: "16px 18px",
                        marginBottom: 14,
                        borderLeft: "3px solid " + C.green,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <IconCross size={16} color={C.green} />
                          <div
                            style={{
                              fontSize: 10,
                              color: C.green,
                              fontWeight: 800,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                            }}
                          >
                            Verset du jour
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: C.text,
                            fontStyle: "italic",
                            lineHeight: 1.8,
                            marginBottom: 10,
                          }}
                        >
                          « {verset.t} »
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 24,
                              height: 1,
                              background: C.green,
                              opacity: 0.4,
                            }}
                          />
                          <div
                            style={{
                              fontSize: 12,
                              color: C.green,
                              fontWeight: 700,
                            }}
                          >
                            {verset.r}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={function () {
                          setVersetOffset(function (v) {
                            return v + 1;
                          });
                        }}
                        style={{
                          background: "rgba(0,0,0,.05)",
                          border: "none",
                          cursor: "pointer",
                          color: C.green,
                          fontSize: 16,
                          flexShrink: 0,
                          padding: "6px 10px",
                          borderRadius: 8,
                          marginTop: 2,
                        }}
                      >
                        +
                      </button>
                    </div>
                  </Anim>

                  {/* KPIs */}
                  <Anim delay={3}>
                    <div style={Object.assign({}, g4, { marginBottom: 14 })}>
                      {[
                        {
                          label: "Terminees",
                          val: animTerminees + "/" + taches.length,
                          sub:
                            Math.round(
                              (terminees / (taches.length || 1)) * 100
                            ) + "%",
                          accent: C.green,
                        },
                        {
                          label: "En retard",
                          val: animEnRetard,
                          sub: "taches",
                          accent: C.red,
                        },
                        {
                          label: "Habitudes",
                          val: animTaux + "%",
                          sub: mois,
                          accent: C.blue,
                        },
                        {
                          label: "Bien-être",
                          val: animWB + "/100",
                          sub: wbLabel(wellbeingScore),
                          accent: wbColor(wellbeingScore),
                        },
                      ].map(function (k, i) {
                        return (
                          <HCard key={i} style={{ padding: "14px 16px" }}>
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: C.textSec,
                                marginBottom: 8,
                              }}
                            >
                              {k.label}
                            </div>
                            <div
                              style={{
                                fontSize: isMobile ? 18 : 22,
                                fontWeight: 700,
                                color: k.accent,
                              }}
                            >
                              {k.val}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: C.textSec,
                                marginTop: 3,
                              }}
                            >
                              {k.sub}
                            </div>
                          </HCard>
                        );
                      })}
                    </div>
                  </Anim>

                  {/* Wellbeing + Comparatif */}
                  <Anim delay={4}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <WellbeingCard
                        score={wellbeingScore}
                        habitData={habitData}
                        habitudes={habitudes}
                        moodData={moodData}
                        sommeilData={sommeilData}
                        sportData={sportData}
                      />
                      <ComparatifSemaine
                        habitudes={habitudes}
                        habitData={habitData}
                        taches={taches}
                        sportData={sportData}
                        moodData={moodData}
                        sommeilData={sommeilData}
                      />
                    </div>
                  </Anim>

                  {/* Habitudes charts */}
                  <Anim delay={5}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <Card>
                        <SecTitle>Habitudes cette semaine</SecTitle>
                        <ResponsiveContainer width="100%" height={140}>
                          <BarChart
                            data={weekHabitData}
                            barSize={18}
                            margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                          >
                            <XAxis
                              dataKey="jour"
                              tick={{ fontSize: 10, fill: C.textSec }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 9, fill: C.textSec }}
                              axisLine={false}
                              tickLine={false}
                              domain={[0, habitudes.length || 1]}
                            />
                            <Tooltip
                              formatter={function (v, n, p) {
                                return [
                                  v + "/" + p.payload.total + " habitudes",
                                  "Realisees",
                                ];
                              }}
                              contentStyle={{
                                background: C.cardBg,
                                border:
                                  "1px solid " +
                                  (C === DARK ? "#444" : "#E2DDD7"),
                                borderRadius: 8,
                                fontSize: 11,
                                color: C.text,
                              }}
                              cursor={{ fill: "rgba(128,128,128,.08)" }}
                            />
                            <Bar dataKey="done" radius={[4, 4, 0, 0]}>
                              {weekHabitData.map(function (d, i) {
                                return (
                                  <Cell
                                    key={i}
                                    fill={
                                      d.isToday
                                        ? C.beige
                                        : d.done === habitudes.length &&
                                          habitudes.length > 0
                                        ? C.green
                                        : C.blue
                                    }
                                    fillOpacity={0.8}
                                  />
                                );
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                      <Card
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <SecTitle>Taches par priorite</SecTitle>
                        {donutData.length === 0 ? (
                          <p style={{ color: C.textSec, fontSize: 13 }}>
                            Aucune tache
                          </p>
                        ) : (
                          <div>
                            <ResponsiveContainer width="100%" height={110}>
                              <PieChart>
                                <Pie
                                  data={donutData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={30}
                                  outerRadius={50}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {donutData.map(function (d, i) {
                                    return <Cell key={i} fill={d.color} />;
                                  })}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    background: C.cardBg,
                                    border:
                                      "1px solid " +
                                      (C === DARK ? "#444" : "#E2DDD7"),
                                    borderRadius: 8,
                                    fontSize: 11,
                                    color: C.text,
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                marginTop: 4,
                              }}
                            >
                              {donutData.map(function (d) {
                                return (
                                  <div
                                    key={d.name}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: "50%",
                                        background: d.color,
                                        flexShrink: 0,
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: 11,
                                        color: C.textSec,
                                        flex: 1,
                                      }}
                                    >
                                      {d.name}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: C.text,
                                      }}
                                    >
                                      {d.value}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>
                  </Anim>

                  {/* Recap du jour */}
                  <Anim delay={6}>
                    <Card style={{ marginBottom: 14 }}>
                      <SecTitle>Recap du jour</SecTitle>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile
                            ? "1fr 1fr"
                            : "repeat(4,1fr)",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        {[
                          {
                            label: "Habitudes aujourd'hui",
                            val:
                              habitudes.filter(function (h) {
                                return todayDataLive[h.id];
                              }).length +
                              "/" +
                              habitudes.length,
                            pct:
                              habitudes.length > 0
                                ? (habitudes.filter(function (h) {
                                    return todayDataLive[h.id];
                                  }).length /
                                    habitudes.length) *
                                  100
                                : 0,
                            color: C.green,
                          },
                          {
                            label: "Meilleur streak",
                            val: bestStreak > 0 ? bestStreak + "j" : "--",
                            pct: Math.min(100, (bestStreak / 30) * 100),
                            color: C.beige,
                          },
                          {
                            label: "Humeur du jour",
                            val: todayMood
                              ? MOOD_EMOJIS[todayMood - 1] +
                                " " +
                                todayMood +
                                "/5"
                              : "--",
                            pct: todayMood ? (todayMood / 5) * 100 : 0,
                            color: MOOD_COLORS[todayMood ? todayMood - 1 : 2],
                          },
                          {
                            label: "Score objectifs",
                            val:
                              objectifs.length > 0
                                ? Math.round(
                                    objectifs.reduce(function (s, o) {
                                      return s + (o.score || 0);
                                    }, 0) / objectifs.length
                                  ) + "%"
                                : "--",
                            pct:
                              objectifs.length > 0
                                ? objectifs.reduce(function (s, o) {
                                    return s + (o.score || 0);
                                  }, 0) / objectifs.length
                                : 0,
                            color: C.blue,
                          },
                        ].map(function (k, i) {
                          return (
                            <div
                              key={i}
                              style={{
                                background: C.tableBg,
                                borderRadius: 10,
                                padding: "12px 14px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                  color: C.textSec,
                                  marginBottom: 6,
                                }}
                              >
                                {k.label}
                              </div>
                              <div
                                style={{
                                  fontSize: 18,
                                  fontWeight: 700,
                                  color: k.color,
                                  marginBottom: 6,
                                }}
                              >
                                {k.val}
                              </div>
                              <APBar
                                pct={k.pct}
                                color={k.color}
                                h={4}
                                delay={i * 100}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: C.textSec,
                            marginBottom: 8,
                          }}
                        >
                          Humeur du jour
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {MOOD_EMOJIS.map(function (m, i) {
                            return (
                              <button
                                key={i}
                                onClick={function () {
                                  setMoodData(function (d) {
                                    var nd = Object.assign({}, d);
                                    nd[todayKey] = i + 1;
                                    return nd;
                                  });
                                }}
                                style={{
                                  flex: 1,
                                  padding: "10px 4px",
                                  fontSize: 18,
                                  borderRadius: 10,
                                  border:
                                    "2px solid " +
                                    (todayMood === i + 1
                                      ? MOOD_COLORS[i]
                                      : "transparent"),
                                  background:
                                    todayMood === i + 1
                                      ? C.tableBg
                                      : "transparent",
                                  cursor: "pointer",
                                  transition: "all .2s",
                                }}
                              >
                                {m}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: C.textSec,
                            marginBottom: 8,
                          }}
                        >
                          Habitudes d'aujourd'hui
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          {habitudes.map(function (h) {
                            var checked = todayDataLive[h.id] || false;
                            var streak = getStreak(h.id);
                            return (
                              <div
                                key={h.id}
                                onClick={function () {
                                  toggleHabit(h.id, todayKey);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  padding: "8px 12px",
                                  background: checked
                                    ? C === DARK
                                      ? "#1E2A1E"
                                      : "#EBF2EC"
                                    : C.tableBg,
                                  borderRadius: 8,
                                  cursor: "pointer",
                                  border:
                                    "1px solid " +
                                    (checked ? C.green : "transparent"),
                                  transition: "all .2s",
                                }}
                              >
                                <div
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 5,
                                    border:
                                      "1.5px solid " +
                                      (checked ? C.green : C.gray),
                                    background: checked
                                      ? C.green
                                      : "transparent",
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all .2s",
                                  }}
                                >
                                  {checked && (
                                    <span
                                      style={{ color: "#fff", fontSize: 11 }}
                                    >
                                      v
                                    </span>
                                  )}
                                </div>
                                <span
                                  style={{
                                    fontSize: 13,
                                    color: checked ? C.green : C.text,
                                    textDecoration: checked
                                      ? "line-through"
                                      : "none",
                                    flex: 1,
                                  }}
                                >
                                  {h.nom}
                                </span>
                                {streak > 0 && (
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: streak >= 7 ? C.beige : C.textSec,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {streak >= 7 ? "!" : streak >= 3 ? "^" : ""}{" "}
                                    {streak}j
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: C.textSec,
                            marginBottom: 8,
                          }}
                        >
                          3 choses positives aujourd'hui
                        </div>
                        {["g1", "g2", "g3"].map(function (k, i) {
                          return (
                            <input
                              key={k}
                              placeholder={"Gratitude " + (i + 1) + "..."}
                              value={todayGratitude[k] || ""}
                              onChange={function (e) {
                                setGratitudeData(function (d) {
                                  var nd = Object.assign({}, d);
                                  nd[todayKey] = Object.assign(
                                    {},
                                    d[todayKey] || {}
                                  );
                                  nd[todayKey][k] = e.target.value;
                                  return nd;
                                });
                              }}
                              style={Object.assign({}, inp, {
                                width: "100%",
                                marginBottom: 6,
                                boxSizing: "border-box",
                              })}
                            />
                          );
                        })}
                      </div>
                    </Card>
                  </Anim>

                  <Anim delay={7}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <Card>
                        <SecTitle>Taches urgentes</SecTitle>
                        {taches.filter(function (t) {
                          return (
                            t.priorite === "Urgent" && t.statut !== "Termine"
                          );
                        }).length === 0 ? (
                          <p style={{ color: C.textSec, fontSize: 13 }}>
                            Aucune tache urgente
                          </p>
                        ) : (
                          taches
                            .filter(function (t) {
                              return (
                                t.priorite === "Urgent" &&
                                t.statut !== "Termine"
                              );
                            })
                            .slice(0, 3)
                            .map(function (t) {
                              return (
                                <div
                                  key={t.id}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "8px 0",
                                    borderBottom: "1px solid " + C.tableBg,
                                  }}
                                >
                                  <span style={{ fontSize: 13, color: C.text }}>
                                    {t.nom}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: C.textSec,
                                      flexShrink: 0,
                                      marginLeft: 8,
                                    }}
                                  >
                                    {t.echeance}
                                  </span>
                                </div>
                              );
                            })
                        )}
                      </Card>
                      <Card>
                        <SecTitle>Projets en cours</SecTitle>
                        {projets
                          .filter(function (p) {
                            return p.statut !== "Termine";
                          })
                          .map(function (p) {
                            return (
                              <div key={p.id} style={{ marginBottom: 10 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 13,
                                    marginBottom: 4,
                                  }}
                                >
                                  <span style={{ color: C.text }}>{p.nom}</span>
                                  <span style={{ color: C.textSec }}>
                                    {p.prog}%
                                  </span>
                                </div>
                                <APBar pct={p.prog} color={C.beige} />
                              </div>
                            );
                          })}
                      </Card>
                    </div>
                  </Anim>
                </div>
              )}

              {tab === "notes" && (
                <NotesTab notes={notes} setNotes={setNotes} />
              )}
              {tab === "routines" && (
                <RoutineTab
                  routines={routines}
                  setRoutines={setRoutines}
                  routineLog={routineLog}
                  setRoutineLog={setRoutineLog}
                />
              )}

              {tab === "todo" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: isMobile ? 18 : 20,
                        fontWeight: 700,
                        margin: 0,
                        color: C.text,
                      }}
                    >
                      To Do List
                    </h2>
                    <Btn
                      onClick={function () {
                        openModal("tache", {
                          nom: "",
                          priorite: "Moyen",
                          categorie: "Personnel",
                          echeance: "",
                          statut: "Pas commence",
                        });
                      }}
                    >
                      + Ajouter
                    </Btn>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      { l: "Total", v: taches.length },
                      { l: "Terminees", v: terminees },
                      { l: "En retard", v: enRetard },
                      {
                        l: "En cours",
                        v: taches.filter(function (t) {
                          return t.statut === "En cours";
                        }).length,
                      },
                    ].map(function (s, i) {
                      return (
                        <div
                          key={i}
                          style={{
                            background: C.cardBg,
                            border:
                              "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
                            borderRadius: 10,
                            padding: "8px 14px",
                            textAlign: "center",
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: C.text,
                            }}
                          >
                            {s.v}
                          </div>
                          <div style={{ fontSize: 10, color: C.textSec }}>
                            {s.l}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {taches.map(function (t) {
                      var late =
                        t.statut !== "Termine" &&
                        t.echeance &&
                        new Date(t.echeance) < today;
                      return (
                        <div
                          key={t.id}
                          style={{
                            background: C.cardBg,
                            borderRadius: 12,
                            padding: "12px 14px",
                            border:
                              "1px solid " +
                              (late
                                ? "#C4A08A"
                                : C === DARK
                                ? "#333"
                                : "#E2DDD7"),
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <button
                            onClick={function () {
                              toggleT(t.id);
                            }}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 5,
                              border:
                                "1.5px solid " +
                                (t.statut === "Termine" ? C.green : C.gray),
                              background:
                                t.statut === "Termine"
                                  ? C.green
                                  : "transparent",
                              cursor: "pointer",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: 22,
                            }}
                          >
                            {t.statut === "Termine" && (
                              <span style={{ color: "#fff", fontSize: 12 }}>
                                v
                              </span>
                            )}
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color:
                                  t.statut === "Termine" ? C.textSec : C.text,
                                textDecoration:
                                  t.statut === "Termine"
                                    ? "line-through"
                                    : "none",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t.nom}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: late ? C.red : C.textSec,
                                marginTop: 2,
                              }}
                            >
                              {t.categorie}
                              {t.echeance ? " - " + t.echeance : ""}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            {!isMobile && (
                              <Tag
                                label={t.priorite}
                                s={
                                  PRIORITE_STYLE[t.priorite] || {
                                    bg: C.tableBg,
                                    color: C.textSec,
                                  }
                                }
                              />
                            )}
                            <Edit
                              onClick={function () {
                                openModal("tache", Object.assign({}, t));
                              }}
                            />
                            <Del
                              onClick={function () {
                                delTache(t.id);
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab === "habitudes" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: isMobile ? 18 : 20,
                        fontWeight: 700,
                        margin: 0,
                        color: C.text,
                      }}
                    >
                      Habitudes
                    </h2>
                    <Btn
                      onClick={function () {
                        openModal("habitude", { nom: "", obj: 30 });
                      }}
                    >
                      + Ajouter
                    </Btn>
                  </div>

                  {/* Sélecteur de jours — 7 derniers jours */}
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginBottom: 14,
                      overflowX: "auto",
                      paddingBottom: 4,
                    }}
                  >
                    {Array.from({ length: 7 }, function (_, i) {
                      var d = new Date(today);
                      d.setDate(d.getDate() - (6 - i));
                      var k = d.toISOString().split("T")[0];
                      var isSelected = selectedHabitDay === k;
                      var isToday = k === todayKey;
                      var dayData = habitData[k] || {};
                      var doneCount = habitudes.filter(function (h) {
                        return dayData[h.id];
                      }).length;
                      var hasAll =
                        habitudes.length > 0 && doneCount === habitudes.length;
                      var hasSome = doneCount > 0 && !hasAll;
                      // Parse la date sans décalage timezone
                      var parts = k.split("-");
                      var dy = parseInt(parts[0]);
                      var dm = parseInt(parts[1]) - 1;
                      var dd2 = parseInt(parts[2]);
                      var dLocal = new Date(dy, dm, dd2);
                      return (
                        <button
                          key={k}
                          onClick={function () {
                            setSelectedHabitDay(k);
                          }}
                          style={{
                            flexShrink: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 3,
                            padding: "8px 10px",
                            borderRadius: 10,
                            border:
                              "2px solid " +
                              (isSelected
                                ? C.beige
                                : C === DARK
                                ? "#333"
                                : "#E2DDD7"),
                            background: isSelected ? C.beige : C.cardBg,
                            cursor: "pointer",
                            minWidth: 48,
                            transition: "all .2s",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: isSelected ? "#fff" : C.textSec,
                              textTransform: "uppercase",
                            }}
                          >
                            {
                              ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][
                                (dLocal.getDay() + 6) % 7
                              ]
                            }
                          </span>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: isSelected ? "#fff" : C.text,
                            }}
                          >
                            {dLocal.getDate()}
                          </span>
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: hasAll
                                ? isSelected
                                  ? "#fff"
                                  : C.green
                                : hasSome
                                ? isSelected
                                  ? "#fff"
                                  : C.beige
                                : "transparent",
                              border:
                                "1.5px solid " +
                                (isSelected
                                  ? "rgba(255,255,255,.5)"
                                  : hasAll
                                  ? C.green
                                  : hasSome
                                  ? C.beige
                                  : "transparent"),
                            }}
                          />
                          {isToday && (
                            <span
                              style={{
                                fontSize: 8,
                                color: isSelected
                                  ? "rgba(255,255,255,.8)"
                                  : C.beige,
                                fontWeight: 700,
                              }}
                            >
                              auj.
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <Card style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <SecTitle>
                        {selectedHabitDay === todayKey
                          ? "Aujourd'hui — " +
                            today.toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                            })
                          : (function () {
                              var p = selectedHabitDay.split("-");
                              return new Date(
                                parseInt(p[0]),
                                parseInt(p[1]) - 1,
                                parseInt(p[2])
                              ).toLocaleDateString("fr-FR", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              });
                            })()}
                      </SecTitle>
                      <span
                        style={{
                          fontSize: 12,
                          color: C.green,
                          fontWeight: 600,
                        }}
                      >
                        {
                          habitudes.filter(function (h) {
                            return (habitData[selectedHabitDay] || {})[h.id];
                          }).length
                        }
                        /{habitudes.length}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {habitudes.map(function (h) {
                        var checked =
                          (habitData[selectedHabitDay] || {})[h.id] || false;
                        var streak = getStreak(h.id);
                        return (
                          <div
                            key={h.id}
                            onClick={function () {
                              toggleHabit(h.id, selectedHabitDay);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              background: checked
                                ? C === DARK
                                  ? "#1E2A1E"
                                  : "#EBF2EC"
                                : C.tableBg,
                              borderRadius: 8,
                              cursor: "pointer",
                              border:
                                "1px solid " +
                                (checked ? C.green : "transparent"),
                              transition: "all .2s",
                            }}
                          >
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 5,
                                border:
                                  "1.5px solid " + (checked ? C.green : C.gray),
                                background: checked ? C.green : "transparent",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all .2s",
                              }}
                            >
                              {checked && (
                                <span style={{ color: "#fff", fontSize: 12 }}>
                                  v
                                </span>
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: 13,
                                color: checked ? C.green : C.text,
                                textDecoration: checked
                                  ? "line-through"
                                  : "none",
                                flex: 1,
                              }}
                            >
                              {h.nom}
                            </span>
                            {selectedHabitDay === todayKey && streak > 0 && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: streak >= 7 ? C.beige : C.textSec,
                                  flexShrink: 0,
                                }}
                              >
                                {streak >= 7 ? "!" : streak >= 3 ? "^" : ""}{" "}
                                {streak}j
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginBottom: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    {MOIS.map(function (m, i) {
                      return (
                        <button
                          key={m}
                          onClick={function () {
                            setMoisIdx(i);
                          }}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "none",
                            background: moisIdx === i ? C.beige : C.tableBg,
                            color: moisIdx === i ? "#fff" : C.textSec,
                          }}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                  <div style={Object.assign({}, g2, { marginBottom: 14 })}>
                    {[
                      { l: "Realisees", v: totalReal, c: C.blue },
                      {
                        l: "Taux du mois",
                        v: tauxHabit + "%",
                        c: tauxHabit >= 50 ? C.green : C.red,
                      },
                    ].map(function (k, i) {
                      return (
                        <Card key={i}>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: C.textSec,
                              marginBottom: 6,
                            }}
                          >
                            {k.l}
                          </div>
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 700,
                              color: k.c,
                            }}
                          >
                            {k.v}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  {isMobile ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {habitudes.map(function (h) {
                        var v = moisData[h.id] || 0;
                        var taux = Math.round((v / h.obj) * 100);
                        var streak = getStreak(h.id);
                        return (
                          <Card key={h.id} style={{ padding: "14px 16px" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  flex: 1,
                                  marginRight: 8,
                                  color: C.text,
                                }}
                              >
                                {h.nom}
                              </span>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                {streak > 0 && (
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: streak >= 7 ? C.beige : C.textSec,
                                    }}
                                  >
                                    {streak}j
                                  </span>
                                )}
                                <Edit
                                  onClick={function () {
                                    openModal("habitude", Object.assign({}, h));
                                  }}
                                />
                                <Del
                                  onClick={function () {
                                    delHabitude(h.id);
                                  }}
                                />
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <input
                                type="number"
                                min="0"
                                max={h.obj}
                                value={v}
                                onChange={function (e) {
                                  var nv = Math.min(
                                    h.obj,
                                    Math.max(0, parseInt(e.target.value) || 0)
                                  );
                                  setHabitData(function (d) {
                                    var nd = Object.assign({}, d);
                                    nd[mois] = Object.assign({}, d[mois] || {});
                                    nd[mois][h.id] = nv;
                                    return nd;
                                  });
                                }}
                                style={Object.assign({}, inp, {
                                  width: 52,
                                  textAlign: "center",
                                  padding: "5px 8px",
                                  fontSize: 14,
                                })}
                              />
                              <span style={{ fontSize: 11, color: C.textSec }}>
                                / {h.obj}
                              </span>
                              <div style={{ flex: 1 }}>
                                <APBar
                                  pct={taux}
                                  color={
                                    taux >= 80
                                      ? C.green
                                      : taux >= 40
                                      ? C.beige
                                      : "#C4A08A"
                                  }
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color:
                                    taux >= 80
                                      ? C.green
                                      : taux >= 40
                                      ? C.beige
                                      : C.red,
                                  minWidth: 36,
                                  textAlign: "right",
                                }}
                              >
                                {taux}%
                              </span>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      style={{
                        background: C.cardBg,
                        borderRadius: 14,
                        border:
                          "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
                        overflow: "hidden",
                      }}
                    >
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr style={{ background: C.tableBg }}>
                            {[
                              "Habitude",
                              "Streak",
                              "Obj.",
                              "Realise",
                              "Taux",
                              "Progression",
                              "",
                            ].map(function (h) {
                              return (
                                <th
                                  key={h}
                                  style={{
                                    padding: "10px 14px",
                                    textAlign:
                                      h === "Habitude" || h === ""
                                        ? "left"
                                        : "center",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    color: C.textSec,
                                  }}
                                >
                                  {h}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {habitudes.map(function (h) {
                            var v = moisData[h.id] || 0;
                            var taux = Math.round((v / h.obj) * 100);
                            var streak = getStreak(h.id);
                            return (
                              <tr
                                key={h.id}
                                style={{ borderTop: "1px solid " + C.tableBg }}
                              >
                                <td
                                  style={{
                                    padding: "11px 14px",
                                    fontSize: 13,
                                    color: C.text,
                                  }}
                                >
                                  {h.nom}
                                </td>
                                <td
                                  style={{
                                    padding: "11px 14px",
                                    textAlign: "center",
                                    fontSize: 13,
                                  }}
                                >
                                  {streak > 0 ? (
                                    <span
                                      style={{
                                        color:
                                          streak >= 7 ? C.beige : C.textSec,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {streak}j
                                    </span>
                                  ) : (
                                    <span style={{ color: C.textSec }}>-</span>
                                  )}
                                </td>
                                <td
                                  style={{
                                    padding: "11px 14px",
                                    textAlign: "center",
                                    fontSize: 13,
                                    color: C.textSec,
                                  }}
                                >
                                  {h.obj}
                                </td>
                                <td
                                  style={{
                                    padding: "11px 14px",
                                    textAlign: "center",
                                  }}
                                >
                                  <input
                                    type="number"
                                    min="0"
                                    max={h.obj}
                                    value={v}
                                    onChange={function (e) {
                                      var nv = Math.min(
                                        h.obj,
                                        Math.max(
                                          0,
                                          parseInt(e.target.value) || 0
                                        )
                                      );
                                      setHabitData(function (d) {
                                        var nd = Object.assign({}, d);
                                        nd[mois] = Object.assign(
                                          {},
                                          d[mois] || {}
                                        );
                                        nd[mois][h.id] = nv;
                                        return nd;
                                      });
                                    }}
                                    style={Object.assign({}, inp, {
                                      width: 56,
                                      textAlign: "center",
                                      padding: "5px 8px",
                                    })}
                                  />
                                </td>
                                <td
                                  style={{
                                    padding: "11px 14px",
                                    textAlign: "center",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color:
                                      taux >= 80
                                        ? C.green
                                        : taux >= 40
                                        ? C.beige
                                        : C.red,
                                  }}
                                >
                                  {taux}%
                                </td>
                                <td
                                  style={{ padding: "11px 14px", width: 120 }}
                                >
                                  <APBar
                                    pct={taux}
                                    color={
                                      taux >= 80
                                        ? C.green
                                        : taux >= 40
                                        ? C.beige
                                        : "#C4A08A"
                                    }
                                  />
                                </td>
                                <td
                                  style={{
                                    padding: "11px 12px",
                                    textAlign: "right",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <Edit
                                    onClick={function () {
                                      openModal(
                                        "habitude",
                                        Object.assign({}, h)
                                      );
                                    }}
                                  />
                                  <Del
                                    onClick={function () {
                                      delHabitude(h.id);
                                    }}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <Card style={{ marginTop: 14 }}>
                    <SecTitle>Taux - vue annuelle</SecTitle>
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        alignItems: "flex-end",
                        height: 70,
                      }}
                    >
                      {MOIS.map(function (m, i) {
                        var d = habitData[m] || {};
                        var real = habitudes.reduce(function (s, h) {
                          return s + (d[h.id] || 0);
                        }, 0);
                        var obj2 = habitudes.reduce(function (s, h) {
                          return s + h.obj;
                        }, 0);
                        var pct =
                          obj2 > 0
                            ? Math.min(100, Math.round((real / obj2) * 100))
                            : 0;
                        return (
                          <div
                            key={m}
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            {pct > 0 && (
                              <span style={{ fontSize: 8, color: C.textSec }}>
                                {pct}%
                              </span>
                            )}
                            <div
                              style={{
                                width: "100%",
                                borderRadius: "3px 3px 0 0",
                                background: i === moisIdx ? C.beige : C.blue,
                                opacity: pct === 0 ? 0.2 : 0.8,
                                height: Math.max(3, pct * 0.45),
                              }}
                            />
                            <span style={{ fontSize: 8, color: C.textSec }}>
                              {m}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {tab === "budget" && (
                <div>
                  <h2
                    style={{
                      fontSize: isMobile ? 18 : 20,
                      fontWeight: 700,
                      marginBottom: 16,
                      color: C.text,
                    }}
                  >
                    Budget du Mois
                  </h2>
                  <div style={Object.assign({}, g2, { marginBottom: 14 })}>
                    {[
                      { l: "Revenus reels", v: fmt(revReel), c: C.green },
                      { l: "Depenses reelles", v: fmt(depReel), c: C.red },
                      {
                        l: "Solde net",
                        v: fmt(solde),
                        c: solde >= 0 ? C.green : C.red,
                      },
                      {
                        l: "Revenus prevus",
                        v: fmt(
                          budget.revenus.reduce(function (s, r) {
                            return s + (+r.prevu || 0);
                          }, 0)
                        ),
                        c: C.blue,
                      },
                    ].map(function (k, i) {
                      return (
                        <Card key={i} style={{ padding: "12px 14px" }}>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: C.textSec,
                              marginBottom: 6,
                            }}
                          >
                            {k.l}
                          </div>
                          <div
                            style={{
                              fontSize: isMobile ? 15 : 18,
                              fontWeight: 700,
                              color: k.c,
                            }}
                          >
                            {k.v}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  {totalDep > 0 ? (
                    <Card style={{ marginBottom: 14 }}>
                      <SecTitle>Repartition des depenses</SecTitle>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
                        <ResponsiveContainer
                          width={isMobile ? "100%" : 180}
                          height={160}
                        >
                          <PieChart>
                            <Pie
                              data={depData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={68}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {depData.map(function (d, i) {
                                return <Cell key={i} fill={d.color} />;
                              })}
                            </Pie>
                            <Tooltip
                              formatter={function (v) {
                                return fmt(+v);
                              }}
                              contentStyle={{
                                background: C.cardBg,
                                border:
                                  "1px solid " +
                                  (C === DARK ? "#444" : "#E2DDD7"),
                                borderRadius: 8,
                                fontSize: 12,
                                color: C.text,
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          {depData.map(function (d) {
                            return (
                              <div key={d.name}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 13,
                                    marginBottom: 4,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: d.color,
                                      }}
                                    />
                                    <span style={{ color: C.text }}>
                                      {d.name}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", gap: 10 }}>
                                    <span
                                      style={{ fontWeight: 600, color: C.text }}
                                    >
                                      {fmt(d.value)}
                                    </span>
                                    <span style={{ color: C.textSec }}>
                                      {totalDep > 0
                                        ? Math.round((d.value / totalDep) * 100)
                                        : 0}
                                      %
                                    </span>
                                  </div>
                                </div>
                                <APBar
                                  pct={
                                    totalDep > 0
                                      ? (d.value / totalDep) * 100
                                      : 0
                                  }
                                  color={d.color}
                                  h={4}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card style={{ marginBottom: 14 }}>
                      <SecTitle>Repartition</SecTitle>
                      <p style={{ color: C.textSec, fontSize: 13 }}>
                        Saisis tes depenses reelles pour voir le graphique
                      </p>
                    </Card>
                  )}
                  {[
                    { title: "Revenus", key: "revenus" },
                    { title: "Depenses fixes", key: "fixes" },
                    { title: "Depenses variables", key: "variables" },
                  ].map(function (sec) {
                    return (
                      <div
                        key={sec.key}
                        style={{
                          background: C.cardBg,
                          borderRadius: 14,
                          border:
                            "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
                          overflow: "hidden",
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            background: C.tableBg,
                            padding: "10px 14px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: C.textSec,
                            }}
                          >
                            {sec.title}
                          </span>
                          <Btn
                            onClick={function () {
                              openModal("budget_" + sec.key, {
                                cat: "",
                                prevu: 0,
                                reel: 0,
                              });
                            }}
                            style={{ padding: "4px 10px", fontSize: 11 }}
                          >
                            + Ajouter
                          </Btn>
                        </div>
                        {budget[sec.key].map(function (row) {
                          var ecart = (+row.reel || 0) - (+row.prevu || 0);
                          return (
                            <div
                              key={row.id}
                              style={{
                                padding: "10px 14px",
                                borderTop: "1px solid " + C.tableBg,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{ flex: 1, fontSize: 13, color: C.text }}
                              >
                                {row.cat}
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={row.reel}
                                onChange={function (e) {
                                  var v = parseFloat(e.target.value) || 0;
                                  setBudget(function (b) {
                                    var nb = Object.assign({}, b);
                                    nb[sec.key] = b[sec.key].map(function (r) {
                                      return r.id === row.id
                                        ? Object.assign({}, r, { reel: v })
                                        : r;
                                    });
                                    return nb;
                                  });
                                }}
                                style={Object.assign({}, inp, {
                                  width: isMobile ? 80 : 100,
                                  textAlign: "right",
                                  padding: "5px 8px",
                                })}
                              />
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color:
                                    ecart > 0
                                      ? C.red
                                      : ecart < 0
                                      ? C.green
                                      : C.textSec,
                                  minWidth: 60,
                                  textAlign: "right",
                                }}
                              >
                                {ecart >= 0 ? "+" : ""}
                                {fmt(ecart)}
                              </span>
                              <Edit
                                onClick={function () {
                                  openModal(
                                    "budget_" + sec.key,
                                    Object.assign({}, row)
                                  );
                                }}
                              />
                              <Del
                                onClick={function () {
                                  delBudget(sec.key, row.id);
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === "vision" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: isMobile ? 18 : 20,
                        fontWeight: 700,
                        margin: 0,
                        color: C.text,
                      }}
                    >
                      Vision 2026
                    </h2>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn
                        bg={C.gray}
                        onClick={function () {
                          openModal("domaine", {
                            nom: "",
                            color: DOMAINE_COLORS[0],
                          });
                        }}
                        style={{ padding: "6px 10px", fontSize: 12 }}
                      >
                        + Domaine
                      </Btn>
                      <Btn
                        onClick={function () {
                          openModal("objectif", {
                            obj: "",
                            action: "",
                            domaineId: domaines[0] && domaines[0].id,
                            score: 0,
                            terme: "moyen",
                          });
                        }}
                        style={{ padding: "6px 10px", fontSize: 12 }}
                      >
                        + Objectif
                      </Btn>
                    </div>
                  </div>
                  <Card style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <SecTitle>Vision Board</SecTitle>
                      <Btn
                        onClick={function () {
                          openModal("vision_card", {
                            titre: "",
                            citation: "",
                            color: VISION_COLORS[0],
                          });
                        }}
                        style={{ padding: "5px 12px", fontSize: 11 }}
                      >
                        + Carte
                      </Btn>
                    </div>
                    {visionBoard.length === 0 ? (
                      <p style={{ color: C.textSec, fontSize: 13 }}>
                        Cree tes cartes de vision
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile
                            ? "1fr 1fr"
                            : "repeat(3,1fr)",
                          gap: 10,
                        }}
                      >
                        {visionBoard.map(function (v) {
                          return (
                            <div
                              key={v.id}
                              style={{
                                borderRadius: 12,
                                padding: "16px 14px",
                                background: v.color,
                                position: "relative",
                                minHeight: 100,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: "#fff",
                                  marginBottom: 6,
                                }}
                              >
                                {v.titre}
                              </div>
                              {v.citation && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "rgba(255,255,255,.85)",
                                    fontStyle: "italic",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {v.citation}
                                </div>
                              )}
                              <div
                                style={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  display: "flex",
                                  gap: 4,
                                }}
                              >
                                <button
                                  onClick={function () {
                                    openModal(
                                      "vision_card",
                                      Object.assign({}, v)
                                    );
                                  }}
                                  style={{
                                    background: "rgba(255,255,255,.2)",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "2px 6px",
                                    cursor: "pointer",
                                    color: "#fff",
                                    fontSize: 12,
                                  }}
                                >
                                  e
                                </button>
                                <button
                                  onClick={function () {
                                    delVisionCard(v.id);
                                  }}
                                  style={{
                                    background: "rgba(255,255,255,.2)",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "2px 6px",
                                    cursor: "pointer",
                                    color: "#fff",
                                    fontSize: 14,
                                  }}
                                >
                                  x
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                  {domaines.map(function (d) {
                    var objs = objectifs.filter(function (o) {
                      return o.domaineId === d.id;
                    });
                    return (
                      <div
                        key={d.id}
                        style={{
                          background: C.cardBg,
                          borderRadius: 14,
                          border:
                            "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
                          marginBottom: 12,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 16px",
                            borderBottom: "1px solid " + C.tableBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: d.color,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: d.color,
                              }}
                            >
                              {d.nom}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 2 }}>
                            <Edit
                              onClick={function () {
                                openModal("domaine", Object.assign({}, d));
                              }}
                            />
                            <Del
                              onClick={function () {
                                delDomaine(d.id);
                              }}
                            />
                          </div>
                        </div>
                        {objs.length === 0 && (
                          <div
                            style={{
                              padding: "12px 16px",
                              fontSize: 13,
                              color: C.textSec,
                            }}
                          >
                            Aucun objectif
                          </div>
                        )}
                        {objs.map(function (o, i) {
                          return (
                            <div
                              key={o.id}
                              style={{
                                padding: "12px 16px",
                                borderTop:
                                  i > 0 ? "1px solid " + C.tableBg : "none",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: 8,
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      marginBottom: 3,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 11,
                                        background: C.tableBg,
                                        padding: "2px 8px",
                                        borderRadius: 99,
                                        color: C.textSec,
                                      }}
                                    >
                                      {o.terme === "court"
                                        ? "Court"
                                        : o.terme === "long"
                                        ? "Long"
                                        : "Moyen"}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: C.text,
                                      }}
                                    >
                                      {o.obj}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: 11, color: C.blue }}>
                                    &rarr; {o.action}
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    flexShrink: 0,
                                  }}
                                >
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={o.score}
                                    onChange={function (e) {
                                      setObjectifs(function (os) {
                                        return os.map(function (x) {
                                          return x.id === o.id
                                            ? Object.assign({}, x, {
                                                score: Math.min(
                                                  100,
                                                  Math.max(
                                                    0,
                                                    parseInt(e.target.value) ||
                                                      0
                                                  )
                                                ),
                                              })
                                            : x;
                                        });
                                      });
                                    }}
                                    style={Object.assign({}, inp, {
                                      width: 50,
                                      textAlign: "center",
                                      padding: "4px 6px",
                                    })}
                                  />
                                  <span
                                    style={{ fontSize: 11, color: C.textSec }}
                                  >
                                    %
                                  </span>
                                  <Edit
                                    onClick={function () {
                                      openModal(
                                        "objectif",
                                        Object.assign({}, o)
                                      );
                                    }}
                                  />
                                  <Del
                                    onClick={function () {
                                      delObjectif(o.id);
                                    }}
                                  />
                                </div>
                              </div>
                              <div style={{ marginTop: 6 }}>
                                <APBar
                                  pct={o.score || 0}
                                  color={d.color}
                                  h={4}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === "projets" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: isMobile ? 18 : 20,
                        fontWeight: 700,
                        margin: 0,
                        color: C.text,
                      }}
                    >
                      Projets
                    </h2>
                    <Btn
                      onClick={function () {
                        openModal("projet", {
                          nom: "",
                          desc: "",
                          debut: "",
                          fin: "",
                          statut: "Planifie",
                          prog: 0,
                        });
                      }}
                    >
                      + Ajouter
                    </Btn>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {projets.map(function (p, i) {
                      return (
                        <Card key={p.id}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: 8,
                            }}
                          >
                            <div style={{ flex: 1, marginRight: 8 }}>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  marginBottom: 2,
                                  color: C.text,
                                }}
                              >
                                {p.nom}
                              </div>
                              <div style={{ fontSize: 12, color: C.textSec }}>
                                {p.desc}
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Tag
                                label={p.statut}
                                s={
                                  STATUT_STYLE[p.statut] || {
                                    bg: C.tableBg,
                                    color: C.textSec,
                                    border: "transparent",
                                  }
                                }
                              />
                              <Edit
                                onClick={function () {
                                  openModal("projet", Object.assign({}, p));
                                }}
                              />
                              <Del
                                onClick={function () {
                                  delProjet(p.id);
                                }}
                              />
                            </div>
                          </div>
                          {(p.debut || p.fin) && (
                            <div
                              style={{
                                display: "flex",
                                gap: 12,
                                fontSize: 11,
                                color: C.textSec,
                                marginBottom: 10,
                              }}
                            >
                              {p.debut && <span>Debut : {p.debut}</span>}
                              {p.fin && <span>Fin : {p.fin}</span>}
                            </div>
                          )}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <APBar pct={p.prog} color={C.beige} h={8} />
                            </div>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={p.prog}
                              onChange={function (e) {
                                setProjets(function (ps) {
                                  return ps.map(function (x, j) {
                                    return j === i
                                      ? Object.assign({}, x, {
                                          prog: Math.min(
                                            100,
                                            Math.max(
                                              0,
                                              parseInt(e.target.value) || 0
                                            )
                                          ),
                                        })
                                      : x;
                                  });
                                });
                              }}
                              style={Object.assign({}, inp, {
                                width: 52,
                                textAlign: "center",
                                padding: "5px 8px",
                              })}
                            />
                            <span style={{ fontSize: 12, color: C.textSec }}>
                              %
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab === "focus" && (
                <div>
                  <h2
                    style={{
                      fontSize: isMobile ? 18 : 20,
                      fontWeight: 700,
                      marginBottom: 20,
                      color: C.text,
                    }}
                  >
                    Mode Focus
                  </h2>
                  <PomodoroTimer />
                </div>
              )}

              {tab === "lecture" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: isMobile ? 18 : 20,
                        fontWeight: 700,
                        margin: 0,
                        color: C.text,
                      }}
                    >
                      Suivi de Lecture
                    </h2>
                    <Btn
                      onClick={function () {
                        openModal("livre", {
                          titre: "",
                          auteur: "",
                          statut: "En cours",
                          note: "",
                          avis: "",
                        });
                      }}
                    >
                      + Ajouter
                    </Btn>
                  </div>
                  <div style={Object.assign({}, g2, { marginBottom: 14 })}>
                    {[
                      {
                        l: "Livres lus",
                        v: livres.filter(function (l) {
                          return l.statut === "Termine";
                        }).length,
                        c: C.green,
                      },
                      {
                        l: "En cours",
                        v: livres.filter(function (l) {
                          return l.statut === "En cours";
                        }).length,
                        c: C.blue,
                      },
                    ].map(function (k, i) {
                      return (
                        <Card key={i}>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: C.textSec,
                              marginBottom: 6,
                            }}
                          >
                            {k.l}
                          </div>
                          <div
                            style={{
                              fontSize: 24,
                              fontWeight: 700,
                              color: k.c,
                            }}
                          >
                            {k.v}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  {livres.filter(function (l) {
                    return l.statut === "Termine";
                  }).length > 0 && (
                    <Card style={{ marginBottom: 14 }}>
                      <SecTitle>Livres lus par mois</SecTitle>
                      <ResponsiveContainer width="100%" height={140}>
                        <BarChart
                          data={livresChartData}
                          barSize={16}
                          margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                        >
                          <XAxis
                            dataKey="mois"
                            tick={{ fontSize: 9, fill: C.textSec }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 9, fill: C.textSec }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip
                            formatter={function (v) {
                              return [
                                v + " livre" + (v > 1 ? "s" : ""),
                                "Termines",
                              ];
                            }}
                            contentStyle={{
                              background: C.cardBg,
                              border:
                                "1px solid " +
                                (C === DARK ? "#444" : "#E2DDD7"),
                              borderRadius: 8,
                              fontSize: 11,
                              color: C.text,
                            }}
                            cursor={{ fill: "rgba(128,128,128,.08)" }}
                          />
                          <Bar
                            dataKey="livres"
                            radius={[4, 4, 0, 0]}
                            fill={C.green}
                            fillOpacity={0.8}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  )}
                  {livres.length === 0 ? (
                    <Card>
                      <p
                        style={{
                          color: C.textSec,
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      >
                        Aucun livre ajoute !
                      </p>
                    </Card>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {livres.map(function (l) {
                        return (
                          <Card key={l.id}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 6,
                              }}
                            >
                              <div style={{ flex: 1, marginRight: 8 }}>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: C.text,
                                  }}
                                >
                                  {l.titre}
                                </div>
                                {l.auteur && (
                                  <div
                                    style={{ fontSize: 12, color: C.textSec }}
                                  >
                                    {l.auteur}
                                  </div>
                                )}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <Tag
                                  label={l.statut}
                                  s={
                                    STATUT_STYLE[l.statut] || {
                                      bg: C.tableBg,
                                      color: C.textSec,
                                      border: "transparent",
                                    }
                                  }
                                />
                                <Edit
                                  onClick={function () {
                                    openModal("livre", Object.assign({}, l));
                                  }}
                                />
                                <Del
                                  onClick={function () {
                                    delLivre(l.id);
                                  }}
                                />
                              </div>
                            </div>
                            {l.note && (
                              <div
                                style={{
                                  fontSize: 13,
                                  color: C.textSec,
                                  marginBottom: 4,
                                }}
                              >
                                Note: {l.note}/5
                              </div>
                            )}
                            {l.avis && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: C.text,
                                  fontStyle: "italic",
                                  background: C.tableBg,
                                  borderRadius: 8,
                                  padding: "8px 12px",
                                }}
                              >
                                {l.avis}
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {tab === "sante" && (
                <div>
                  <h2
                    style={{
                      fontSize: isMobile ? 18 : 20,
                      fontWeight: 700,
                      marginBottom: 20,
                      color: C.text,
                    }}
                  >
                    Sante et Bien-etre
                  </h2>
                  <Card style={{ marginBottom: 14 }}>
                    <SecTitle>Suivi du Sommeil</SecTitle>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      <span style={{ fontSize: 13, color: C.text }}>
                        Nuit du{" "}
                        {today.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                        })}{" "}
                        :
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        placeholder="heures"
                        value={todaySommeil}
                        onChange={function (e) {
                          setSommeilData(function (d) {
                            var nd = Object.assign({}, d);
                            nd[todayKey] = e.target.value;
                            return nd;
                          });
                        }}
                        style={Object.assign({}, inp, {
                          width: 80,
                          textAlign: "center",
                        })}
                      />
                      <span style={{ fontSize: 13, color: C.textSec }}>h</span>
                    </div>
                    {sommeilChartData.length > 0 && (
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart
                          data={sommeilChartData}
                          barSize={14}
                          margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                        >
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 9, fill: C.textSec }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 9, fill: C.textSec }}
                            axisLine={false}
                            tickLine={false}
                            unit="h"
                            domain={[0, 10]}
                          />
                          <Tooltip
                            formatter={function (v) {
                              return [v + "h", "Sommeil"];
                            }}
                            contentStyle={{
                              background: C.cardBg,
                              border:
                                "1px solid " +
                                (C === DARK ? "#444" : "#E2DDD7"),
                              borderRadius: 8,
                              fontSize: 11,
                              color: C.text,
                            }}
                            cursor={{ fill: "rgba(128,128,128,.08)" }}
                          />
                          <Bar
                            dataKey="h"
                            radius={[4, 4, 0, 0]}
                            fill={C.blue}
                            fillOpacity={0.8}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Card>
                  <Card style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <SecTitle>Suivi du Sport</SecTitle>
                      <Btn
                        onClick={function () {
                          openModal("sport", {
                            type: "",
                            duree: "",
                            distance: "",
                            calories: "",
                            date: todayKey,
                          });
                        }}
                        style={{ padding: "5px 12px", fontSize: 11 }}
                      >
                        + Seance
                      </Btn>
                    </div>
                    <div style={Object.assign({}, g2, { marginBottom: 12 })}>
                      {[
                        {
                          l: "Seances ce mois",
                          v: sportData.filter(function (s) {
                            return (
                              s.date &&
                              s.date.startsWith(
                                new Date().toISOString().substring(0, 7)
                              )
                            );
                          }).length,
                          c: C.green,
                        },
                        { l: "Total seances", v: sportData.length, c: C.blue },
                      ].map(function (k, i) {
                        return (
                          <div
                            key={i}
                            style={{
                              background: C.tableBg,
                              borderRadius: 10,
                              padding: "10px 14px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: C.textSec,
                                marginBottom: 4,
                              }}
                            >
                              {k.l}
                            </div>
                            <div
                              style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: k.c,
                              }}
                            >
                              {k.v}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {sportData
                      .slice(-5)
                      .reverse()
                      .map(function (s) {
                        return (
                          <div
                            key={s.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 0",
                              borderBottom: "1px solid " + C.tableBg,
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: C.text,
                                }}
                              >
                                {s.type}
                              </span>
                              {s.duree && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: C.textSec,
                                    marginLeft: 8,
                                  }}
                                >
                                  {s.duree}min
                                </span>
                              )}
                              {s.distance && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: C.textSec,
                                    marginLeft: 8,
                                  }}
                                >
                                  {s.distance}km
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <span style={{ fontSize: 11, color: C.textSec }}>
                                {s.date}
                              </span>
                              <Del
                                onClick={function () {
                                  delSport(s.id);
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </Card>
                  <Card>
                    <SecTitle>Humeur - 30 derniers jours</SecTitle>
                    {moodChartData.length === 0 ? (
                      <p style={{ color: C.textSec, fontSize: 13 }}>
                        Commence a noter ton humeur depuis le tableau de bord
                      </p>
                    ) : (
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart
                          data={moodChartData}
                          margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                        >
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 9, fill: C.textSec }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 9, fill: C.textSec }}
                            axisLine={false}
                            tickLine={false}
                            domain={[1, 5]}
                          />
                          <Tooltip
                            formatter={function (v) {
                              return [v + "/5", "Humeur"];
                            }}
                            contentStyle={{
                              background: C.cardBg,
                              border:
                                "1px solid " +
                                (C === DARK ? "#444" : "#E2DDD7"),
                              borderRadius: 8,
                              fontSize: 11,
                              color: C.text,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="mood"
                            stroke={C.beige}
                            strokeWidth={2}
                            dot={{ fill: C.beige, r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </Card>
                </div>
              )}

              {tab === "countdown" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: isMobile ? 18 : 20,
                        fontWeight: 700,
                        margin: 0,
                        color: C.text,
                      }}
                    >
                      Compte a rebours
                    </h2>
                    <Btn
                      onClick={function () {
                        openModal("countdown", {
                          nom: "",
                          date: "",
                          emoji: "*",
                        });
                      }}
                    >
                      + Ajouter
                    </Btn>
                  </div>
                  {countdownsWithDays.length === 0 ? (
                    <Card>
                      <p
                        style={{
                          color: C.textSec,
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      >
                        Ajoute tes echeances importantes
                      </p>
                    </Card>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {countdownsWithDays.map(function (c) {
                        var urgent = c.jours <= 3;
                        var soon = c.jours <= 7;
                        var past = c.jours < 0;
                        return (
                          <Card
                            key={c.id}
                            style={{
                              borderLeft:
                                "4px solid " +
                                (past
                                  ? "#959B9E"
                                  : urgent
                                  ? C.red
                                  : soon
                                  ? C.beige
                                  : C.green),
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <span style={{ fontSize: 24 }}>
                                  {c.emoji || "*"}
                                </span>
                                <div>
                                  <div
                                    style={{
                                      fontSize: 15,
                                      fontWeight: 600,
                                      color: C.text,
                                    }}
                                  >
                                    {c.nom}
                                  </div>
                                  <div
                                    style={{ fontSize: 12, color: C.textSec }}
                                  >
                                    {c.date}
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <div style={{ textAlign: "right" }}>
                                  <div
                                    style={{
                                      fontSize: 28,
                                      fontWeight: 900,
                                      color: past
                                        ? "#959B9E"
                                        : urgent
                                        ? C.red
                                        : soon
                                        ? C.beige
                                        : C.green,
                                    }}
                                  >
                                    {past
                                      ? "Passe"
                                      : c.jours === 0
                                      ? "Auj."
                                      : c.jours + "j"}
                                  </div>
                                  {!past && c.jours > 0 && (
                                    <div
                                      style={{ fontSize: 11, color: C.textSec }}
                                    >
                                      {c.jours === 1
                                        ? "demain"
                                        : urgent
                                        ? "urgent"
                                        : soon
                                        ? "bientot"
                                        : "dans " + c.jours + " jours"}
                                    </div>
                                  )}
                                </div>
                                <Edit
                                  onClick={function () {
                                    openModal(
                                      "countdown",
                                      Object.assign({}, c)
                                    );
                                  }}
                                />
                                <Del
                                  onClick={function () {
                                    delCountdown(c.id);
                                  }}
                                />
                              </div>
                            </div>
                            {!past && c.jours > 0 && c.jours <= 30 && (
                              <div style={{ marginTop: 12 }}>
                                <APBar
                                  pct={100 - (c.jours / 30) * 100}
                                  color={
                                    urgent ? C.red : soon ? C.beige : C.green
                                  }
                                  h={4}
                                />
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {tab === "retro" && (
                <div>
                  <h2
                    style={{
                      fontSize: isMobile ? 18 : 20,
                      fontWeight: 700,
                      marginBottom: 4,
                      color: C.text,
                    }}
                  >
                    Retrospective Mensuelle
                  </h2>
                  <p
                    style={{ color: C.textSec, fontSize: 13, marginBottom: 20 }}
                  >
                    {MOIS[new Date().getMonth()]} {new Date().getFullYear()} -
                    Prends 10 minutes pour faire le bilan
                  </p>
                  <Card style={{ marginBottom: 14 }}>
                    <SecTitle>Note globale du mois</SecTitle>
                    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      {[1, 2, 3, 4, 5].map(function (n) {
                        return (
                          <button
                            key={n}
                            onClick={function () {
                              setRetroData(function (d) {
                                var nd = Object.assign({}, d);
                                nd[retroKey] = Object.assign(
                                  {},
                                  nd[retroKey] || {},
                                  retroMois,
                                  { note: n }
                                );
                                return nd;
                              });
                            }}
                            style={{
                              flex: 1,
                              padding: "12px 4px",
                              fontSize: 20,
                              borderRadius: 10,
                              border:
                                "2px solid " +
                                (retroMois.note >= n ? C.beige : "transparent"),
                              background:
                                retroMois.note >= n ? C.tableBg : "transparent",
                              cursor: "pointer",
                              transition: "all .2s",
                            }}
                          >
                            *
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                  {[
                    {
                      key: "victoires",
                      label: "Mes victoires ce mois",
                      placeholder: "Qu'est-ce que j'ai accompli ?",
                    },
                    {
                      key: "ameliorations",
                      label: "Ce que j'aurais pu mieux faire",
                      placeholder: "Quels obstacles ai-je rencontres ?",
                    },
                    {
                      key: "focus",
                      label: "Mon focus pour le mois prochain",
                      placeholder: "Sur quoi je vais me concentrer ?",
                    },
                    {
                      key: "gratitude",
                      label: "Ma gratitude du mois",
                      placeholder: "Pour quoi suis-je reconnaissant ?",
                    },
                  ].map(function (s) {
                    return (
                      <Card key={s.key} style={{ marginBottom: 12 }}>
                        <SecTitle>{s.label}</SecTitle>
                        <textarea
                          placeholder={s.placeholder}
                          value={retroMois[s.key] || ""}
                          onChange={function (e) {
                            setRetroData(function (d) {
                              var nd = Object.assign({}, d);
                              nd[retroKey] = Object.assign(
                                {},
                                nd[retroKey] || {},
                                retroMois
                              );
                              nd[retroKey][s.key] = e.target.value;
                              return nd;
                            });
                          }}
                          style={{
                            background: C.tableBg,
                            border: "1px solid #D5D0CA",
                            borderRadius: 8,
                            padding: "10px 12px",
                            fontSize: 13,
                            color: C.text,
                            outline: "none",
                            width: "100%",
                            minHeight: 90,
                            resize: "vertical",
                            boxSizing: "border-box",
                          }}
                        />
                      </Card>
                    );
                  })}
                  <Card>
                    <SecTitle>Stats du mois</SecTitle>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile
                          ? "1fr 1fr"
                          : "repeat(4,1fr)",
                        gap: 10,
                      }}
                    >
                      {[
                        { l: "Taches terminees", v: terminees, c: C.green },
                        {
                          l: "Habitudes (taux)",
                          v: tauxHabit + "%",
                          c: tauxHabit >= 50 ? C.green : C.red,
                        },
                        {
                          l: "Bien-être moyen",
                          v: wellbeingScore + "/100",
                          c: wbColor(wellbeingScore),
                        },
                        {
                          l: "Seances sport",
                          v: sportData.filter(function (s) {
                            return (
                              s.date &&
                              s.date.startsWith(
                                new Date().toISOString().substring(0, 7)
                              )
                            );
                          }).length,
                          c: C.beige,
                        },
                      ].map(function (k, i) {
                        return (
                          <div
                            key={i}
                            style={{
                              background: C.tableBg,
                              borderRadius: 10,
                              padding: "12px",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 22,
                                fontWeight: 700,
                                color: k.c,
                              }}
                            >
                              {k.v}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: C.textSec,
                                marginTop: 4,
                              }}
                            >
                              {k.l}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </PageTransition>
        </div>

        <CoachIA
          taches={taches}
          habitudes={habitudes}
          habitData={habitData}
          moodData={moodData}
          sommeilData={sommeilData}
          objectifs={objectifs}
          budget={budget}
          sportData={sportData}
        />

        {modal === "tache" && (
          <Modal
            title={form.id ? "Modifier la tache" : "Nouvelle tache"}
            onClose={close}
          >
            <Row>
              <MI
                placeholder="Nom de la tache"
                value={form.nom || ""}
                onChange={function (e) {
                  f("nom", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MS
                value={form.priorite || "Moyen"}
                onChange={function (e) {
                  f("priorite", e.target.value);
                }}
              >
                {PRIORITES.map(function (p) {
                  return <option key={p}>{p}</option>;
                })}
              </MS>
              <MS
                value={form.statut || "Pas commence"}
                onChange={function (e) {
                  f("statut", e.target.value);
                }}
              >
                {STATUTS_TACHE.map(function (s) {
                  return <option key={s}>{s}</option>;
                })}
              </MS>
            </Row>
            <Row>
              <MS
                value={form.categorie || "Personnel"}
                onChange={function (e) {
                  f("categorie", e.target.value);
                }}
              >
                {CATEGORIES.map(function (c) {
                  return <option key={c}>{c}</option>;
                })}
              </MS>
              <input
                type="date"
                style={Object.assign({}, inp, { flex: 1 })}
                value={form.echeance || ""}
                onChange={function (e) {
                  f("echeance", e.target.value);
                }}
              />
            </Row>
            <MF onClose={close} onSave={saveTache} />
          </Modal>
        )}
        {modal === "habitude" && (
          <Modal
            title={form.id ? "Modifier l'habitude" : "Nouvelle habitude"}
            onClose={close}
          >
            <Row>
              <MI
                placeholder="Nom de l'habitude"
                value={form.nom || ""}
                onChange={function (e) {
                  f("nom", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MI
                type="number"
                min="1"
                max="31"
                placeholder="Objectif jours / mois"
                value={form.obj || ""}
                onChange={function (e) {
                  f("obj", e.target.value);
                }}
              />
            </Row>
            <MF onClose={close} onSave={saveHabitude} />
          </Modal>
        )}
        {modal === "projet" && (
          <Modal
            title={form.id ? "Modifier le projet" : "Nouveau projet"}
            onClose={close}
          >
            <Row>
              <MI
                placeholder="Nom du projet"
                value={form.nom || ""}
                onChange={function (e) {
                  f("nom", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MI
                placeholder="Description"
                value={form.desc || ""}
                onChange={function (e) {
                  f("desc", e.target.value);
                }}
              />
            </Row>
            <Row>
              <input
                type="date"
                style={Object.assign({}, inp, { flex: 1 })}
                value={form.debut || ""}
                onChange={function (e) {
                  f("debut", e.target.value);
                }}
              />
              <input
                type="date"
                style={Object.assign({}, inp, { flex: 1 })}
                value={form.fin || ""}
                onChange={function (e) {
                  f("fin", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MS
                value={form.statut || "Planifie"}
                onChange={function (e) {
                  f("statut", e.target.value);
                }}
              >
                {STATUTS_PROJET.map(function (s) {
                  return <option key={s}>{s}</option>;
                })}
              </MS>
              <MI
                type="number"
                min="0"
                max="100"
                placeholder="Avancement %"
                value={form.prog || 0}
                onChange={function (e) {
                  f("prog", e.target.value);
                }}
              />
            </Row>
            <MF onClose={close} onSave={saveProjet} />
          </Modal>
        )}
        {modal === "domaine" && (
          <Modal
            title={form.id ? "Modifier le domaine" : "Nouveau domaine"}
            onClose={close}
          >
            <Row>
              <MI
                placeholder="Nom du domaine"
                value={form.nom || ""}
                onChange={function (e) {
                  f("nom", e.target.value);
                }}
              />
            </Row>
            <Row>
              <span
                style={{
                  fontSize: 13,
                  color: C.textSec,
                  alignSelf: "center",
                  whiteSpace: "nowrap",
                }}
              >
                Couleur
              </span>
              <input
                type="color"
                value={form.color || "#798C80"}
                onChange={function (e) {
                  f("color", e.target.value);
                }}
                style={{
                  width: 44,
                  height: 36,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {DOMAINE_COLORS.map(function (c) {
                  return (
                    <button
                      key={c}
                      onClick={function () {
                        f("color", c);
                      }}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: c,
                        border:
                          form.color === c
                            ? "2.5px solid #333"
                            : "2px solid transparent",
                        cursor: "pointer",
                      }}
                    />
                  );
                })}
              </div>
            </Row>
            <MF onClose={close} onSave={saveDomaine} />
          </Modal>
        )}
        {modal === "objectif" && (
          <Modal
            title={form.id ? "Modifier l'objectif" : "Nouvel objectif"}
            onClose={close}
          >
            <Row>
              <MS
                value={form.domaineId || (domaines[0] && domaines[0].id) || ""}
                onChange={function (e) {
                  f("domaineId", e.target.value);
                }}
              >
                {domaines.map(function (d) {
                  return (
                    <option key={d.id} value={d.id}>
                      {d.nom}
                    </option>
                  );
                })}
              </MS>
            </Row>
            <Row>
              <MI
                placeholder="Objectif"
                value={form.obj || ""}
                onChange={function (e) {
                  f("obj", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MI
                placeholder="Prochaine action"
                value={form.action || ""}
                onChange={function (e) {
                  f("action", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MS
                value={form.terme || "moyen"}
                onChange={function (e) {
                  f("terme", e.target.value);
                }}
              >
                <option value="court">Court terme</option>
                <option value="moyen">Moyen terme</option>
                <option value="long">Long terme</option>
              </MS>
            </Row>
            <MF onClose={close} onSave={saveObjectif} />
          </Modal>
        )}
        {modal === "livre" && (
          <Modal
            title={form.id ? "Modifier le livre" : "Nouveau livre"}
            onClose={close}
          >
            <Row>
              <MI
                placeholder="Titre"
                value={form.titre || ""}
                onChange={function (e) {
                  f("titre", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MI
                placeholder="Auteur"
                value={form.auteur || ""}
                onChange={function (e) {
                  f("auteur", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MS
                value={form.statut || "En cours"}
                onChange={function (e) {
                  f("statut", e.target.value);
                }}
              >
                {["A lire", "En cours", "Termine"].map(function (s) {
                  return <option key={s}>{s}</option>;
                })}
              </MS>
              <MS
                value={form.note || ""}
                onChange={function (e) {
                  f("note", e.target.value);
                }}
              >
                <option value="">Note...</option>
                {[1, 2, 3, 4, 5].map(function (n) {
                  return (
                    <option key={n} value={n}>
                      {n + "/5"}
                    </option>
                  );
                })}
              </MS>
            </Row>
            <Row>
              <textarea
                placeholder="Mon avis..."
                value={form.avis || ""}
                onChange={function (e) {
                  f("avis", e.target.value);
                }}
                style={{
                  background: C.tableBg,
                  border: "1px solid #D5D0CA",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  color: C.text,
                  outline: "none",
                  width: "100%",
                  minHeight: 80,
                  resize: "vertical",
                }}
              />
            </Row>
            <MF onClose={close} onSave={saveLivre} />
          </Modal>
        )}
        {modal === "sport" && (
          <Modal title="Nouvelle seance" onClose={close}>
            <Row>
              <MI
                placeholder="Type (course, muscu, velo...)"
                value={form.type || ""}
                onChange={function (e) {
                  f("type", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MI
                type="number"
                placeholder="Duree (min)"
                value={form.duree || ""}
                onChange={function (e) {
                  f("duree", e.target.value);
                }}
              />
              <MI
                type="number"
                placeholder="Distance (km)"
                value={form.distance || ""}
                onChange={function (e) {
                  f("distance", e.target.value);
                }}
              />
            </Row>
            <Row>
              <input
                type="date"
                style={Object.assign({}, inp, { flex: 1 })}
                value={form.date || todayKey}
                onChange={function (e) {
                  f("date", e.target.value);
                }}
              />
            </Row>
            <MF onClose={close} onSave={saveSport} />
          </Modal>
        )}
        {modal === "countdown" && (
          <Modal
            title={form.id ? "Modifier" : "Nouveau compte a rebours"}
            onClose={close}
          >
            <Row>
              <MI
                placeholder="Nom (ex: Voyage a Paris)"
                value={form.nom || ""}
                onChange={function (e) {
                  f("nom", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MI
                placeholder="Emoji ou symbole"
                value={form.emoji || "*"}
                onChange={function (e) {
                  f("emoji", e.target.value);
                }}
                style={{ maxWidth: 80 }}
              />
              <input
                type="date"
                style={Object.assign({}, inp, { flex: 1 })}
                value={form.date || ""}
                onChange={function (e) {
                  f("date", e.target.value);
                }}
              />
            </Row>
            <MF onClose={close} onSave={saveCountdown} />
          </Modal>
        )}
        {modal === "vision_card" && (
          <Modal
            title={form.id ? "Modifier la carte" : "Nouvelle carte vision"}
            onClose={close}
          >
            <Row>
              <MI
                placeholder="Titre (ex: Liberte financiere)"
                value={form.titre || ""}
                onChange={function (e) {
                  f("titre", e.target.value);
                }}
              />
            </Row>
            <Row>
              <textarea
                placeholder="Citation ou description..."
                value={form.citation || ""}
                onChange={function (e) {
                  f("citation", e.target.value);
                }}
                style={{
                  background: C.tableBg,
                  border: "1px solid #D5D0CA",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  color: C.text,
                  outline: "none",
                  width: "100%",
                  minHeight: 60,
                  resize: "vertical",
                  flex: 1,
                }}
              />
            </Row>
            <Row>
              <span
                style={{ fontSize: 13, color: C.textSec, alignSelf: "center" }}
              >
                Couleur
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {VISION_COLORS.map(function (c) {
                  return (
                    <button
                      key={c}
                      onClick={function () {
                        f("color", c);
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: c,
                        border:
                          form.color === c
                            ? "3px solid #333"
                            : "2px solid transparent",
                        cursor: "pointer",
                      }}
                    />
                  );
                })}
              </div>
            </Row>
            <MF onClose={close} onSave={saveVisionCard} />
          </Modal>
        )}
        {["budget_revenus", "budget_fixes", "budget_variables"].map(function (
          key
        ) {
          return modal === key ? (
            <Modal
              key={key}
              title={form.id ? "Modifier la ligne" : "Nouvelle ligne"}
              onClose={close}
            >
              <Row>
                <MI
                  placeholder="Categorie"
                  value={form.cat || ""}
                  onChange={function (e) {
                    f("cat", e.target.value);
                  }}
                />
              </Row>
              <Row>
                <MI
                  type="number"
                  min="0"
                  placeholder="Montant prevu"
                  value={form.prevu || 0}
                  onChange={function (e) {
                    f("prevu", e.target.value);
                  }}
                />
              </Row>
              <MF
                onClose={close}
                onSave={function () {
                  saveBudget(key.replace("budget_", ""));
                }}
              />
            </Modal>
          ) : null;
        })}

        <Confetti
          active={confetti}
          onDone={function () {
            setConfetti(false);
          }}
        />
      </div>
    </ThemeCtx.Provider>
  );
}
