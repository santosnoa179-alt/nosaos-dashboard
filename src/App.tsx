// @ts-nocheck
import {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
  useCallback,
} from "react";
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

// ── Animated Counter ──
function useCountUp(target, duration = 1000) {
  var [count, setCount] = useState(0);
  var prev = useRef(0);
  useEffect(
    function () {
      var start = prev.current;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var ease = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(start + (target - start) * ease));
        if (progress < 1) requestAnimationFrame(step);
        else prev.current = target;
      }
      requestAnimationFrame(step);
    },
    [target]
  );
  return count;
}

// ── Confetti ──
function Confetti({ active, onDone }) {
  var C = useContext(ThemeCtx);
  var canvasRef = useRef(null);
  useEffect(
    function () {
      if (!active) return;
      var canvas = canvasRef.current;
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      var pieces = Array.from({ length: 80 }, function () {
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          w: 8 + Math.random() * 6,
          h: 6 + Math.random() * 4,
          color: [C.beige, C.green, C.blue, "#C4A882", "#8AAF91"][
            Math.floor(Math.random() * 5)
          ],
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
        else {
          if (onDone) onDone();
        }
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

// ── Animated PBar ──
function APBar({ pct, color, h = 6, delay = 0 }) {
  var C = useContext(ThemeCtx);
  var [width, setWidth] = useState(0);
  useEffect(
    function () {
      var t = setTimeout(function () {
        setWidth(Math.min(100, pct || 0));
      }, delay);
      return function () {
        clearTimeout(t);
      };
    },
    [pct, delay]
  );
  return (
    <div
      style={{
        background: C.tableBg,
        borderRadius: 99,
        height: h,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          width: width + "%",
          height: h,
          background: color || C.beige,
          borderRadius: 99,
          transition: "width .8s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

// ── Page transition ──
function PageTransition({ children, tabKey }) {
  var [visible, setVisible] = useState(false);
  var [content, setContent] = useState(children);
  var [key, setKey] = useState(tabKey);
  useEffect(
    function () {
      if (tabKey !== key) {
        setVisible(false);
        var t = setTimeout(function () {
          setContent(children);
          setKey(tabKey);
          setVisible(true);
        }, 150);
        return function () {
          clearTimeout(t);
        };
      } else {
        setVisible(true);
      }
    },
    [tabKey, children]
  );
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity .25s ease, transform .25s ease",
      }}
    >
      {content}
    </div>
  );
}

// ── Hover Card ──
function HCard({ children, style = {} }) {
  var C = useContext(ThemeCtx);
  var [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={function () {
        setHovered(true);
      }}
      onMouseLeave={function () {
        setHovered(false);
      }}
      style={Object.assign(
        {
          background: C.cardBg,
          borderRadius: 14,
          padding: "16px 18px",
          border: "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
          transition: "transform .2s ease, box-shadow .2s ease, background .4s",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hovered
            ? "0 8px 24px rgba(0,0,0,.1)"
            : "0 1px 3px rgba(0,0,0,.04)",
        },
        style
      )}
    >
      {children}
    </div>
  );
}

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

function isDark() {
  var h = new Date().getHours();
  return h >= 18 || h < 8;
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
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Jui",
  "Juil",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
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
const PRIORITES = ["Urgent", "Important", "Moyen", "Priorité basse"];
const STATUTS_TACHE = ["Pas commencé", "En cours", "Terminé"];
const STATUTS_PROJET = ["Planifié", "En cours", "Terminé"];
const CATEGORIES = [
  "Personnel",
  "Travail",
  "Administratif",
  "Loisirs",
  "Formation",
];
const ICONS = {
  dashboard: "⊞",
  todo: "✓",
  habitudes: "↺",
  budget: "€",
  vision: "◎",
  projets: "▣",
  focus: "◉",
  lecture: "📖",
  sante: "💪",
  countdown: "⏳",
  retro: "📋",
};
const PRIORITE_STYLE = {
  Urgent: { bg: "#EDE4DA", border: "#BAA082", color: "#7A5C3A" },
  Important: { bg: "#E2E8E5", border: "#798C80", color: "#3D5C46" },
  Moyen: { bg: "#E0E6EA", border: "#6A7B84", color: "#2E4E59" },
  "Priorité basse": { bg: "#EDEBE8", border: "#959B9E", color: "#555" },
};
const STATUT_STYLE = {
  Terminé: { bg: "#E2E8E5", color: "#3D5C46" },
  "En cours": { bg: "#E0E6EA", color: "#2E4E59" },
  "Pas commencé": { bg: "#EDEBE8", color: "#787878" },
  Planifié: { bg: "#EDE4DA", color: "#7A5C3A" },
};
const DONUT_COLORS = {
  Urgent: "#C4A08A",
  Important: "#798C80",
  Moyen: "#6A7B84",
  "Priorité basse": "#959B9E",
};
const MOOD_LABELS = ["😞", "😕", "😐", "🙂", "😄"];
const MOOD_COLORS = ["#C47070", "#C4A882", "#959B9E", "#798C80", "#6A7B84"];
const AFFIRMATIONS = [
  "Je suis capable d'accomplir tout ce que je décide.",
  "Chaque jour je progresse vers mes objectifs.",
  "Je suis discipliné, focalisé et déterminé.",
  "Je crée ma propre chance par mon travail.",
  "Je mérite le succès que je construis.",
  "Ma persévérance est plus forte que mes obstacles.",
  "Je suis en pleine maîtrise de ma vie.",
  "Je transforme mes défis en opportunités.",
  "Chaque effort me rapproche de mes rêves.",
  "Je suis fier du chemin parcouru.",
];
const VISION_COLORS = [
  "#BAA082",
  "#798C80",
  "#6A7B84",
  "#959B9E",
  "#A8947E",
  "#7A8C7E",
];
const CITATIONS = [
  {
    texte:
      "Ce que tu fais chaque jour compte plus que ce que tu fais de temps en temps.",
    auteur: "Gretchen Rubin",
  },
  {
    texte:
      "La discipline, c'est choisir entre ce que tu veux maintenant et ce que tu veux le plus.",
    auteur: "Abraham Lincoln",
  },
  { texte: "Le secret du succès est de commencer.", auteur: "Mark Twain" },
  {
    texte:
      "Chaque matin tu as deux choix : continuer à dormir avec tes rêves, ou te lever et les réaliser.",
    auteur: "Anonyme",
  },
  {
    texte: "La motivation te met en marche, l'habitude te fait avancer.",
    auteur: "Jim Ryun",
  },
  {
    texte: "Ne compte pas les jours, fais que les jours comptent.",
    auteur: "Muhammad Ali",
  },
  {
    texte: "Ton futur est créé par ce que tu fais aujourd'hui, pas demain.",
    auteur: "Robert Kiyosaki",
  },
  {
    texte: "Le succès n'est pas final, l'échec n'est pas fatal.",
    auteur: "Winston Churchill",
  },
  {
    texte: "La vie commence là où ta zone de confort se termine.",
    auteur: "Neale Donald Walsch",
  },
  {
    texte: "Sois le changement que tu veux voir dans le monde.",
    auteur: "Gandhi",
  },
  {
    texte: "Le génie, c'est 1% d'inspiration et 99% de transpiration.",
    auteur: "Thomas Edison",
  },
  {
    texte:
      "L'avenir appartient à ceux qui croient en la beauté de leurs rêves.",
    auteur: "Eleanor Roosevelt",
  },
  { texte: "Fais de chaque jour ton chef-d'œuvre.", auteur: "John Wooden" },
  {
    texte: "Le succès c'est tomber sept fois et se relever huit.",
    auteur: "Proverbe japonais",
  },
  {
    texte: "La meilleure façon de prédire l'avenir, c'est de le créer.",
    auteur: "Peter Drucker",
  },
  {
    texte: "La persévérance est la mère du succès.",
    auteur: "Honoré de Balzac",
  },
  {
    texte:
      "Le meilleur moment pour planter un arbre était il y a 20 ans. Le second, c'est maintenant.",
    auteur: "Proverbe chinois",
  },
  {
    texte:
      "Il n'y a pas de vent favorable pour celui qui ne sait pas où il va.",
    auteur: "Sénèque",
  },
  {
    texte:
      "La seule façon de faire du bon travail est d'aimer ce que vous faites.",
    auteur: "Steve Jobs",
  },
  {
    texte: "Fais de ta vie un rêve, et d'un rêve une réalité.",
    auteur: "Antoine de Saint-Exupéry",
  },
];
function getCitationDuJour() {
  var now = new Date();
  var d = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return CITATIONS[d % CITATIONS.length];
}

const DEF_TACHES = [
  {
    id: "t1",
    nom: "Préparer le rapport mensuel",
    priorite: "Urgent",
    categorie: "Travail",
    statut: "En cours",
    echeance: "2026-03-15",
  },
  {
    id: "t2",
    nom: "Appeler le médecin",
    priorite: "Important",
    categorie: "Personnel",
    statut: "Pas commencé",
    echeance: "2026-03-20",
  },
  {
    id: "t3",
    nom: "Lire 1 chapitre d'un livre",
    priorite: "Priorité basse",
    categorie: "Loisirs",
    statut: "Pas commencé",
    echeance: "2026-03-30",
  },
  {
    id: "t4",
    nom: "Envoyer ma newsletter",
    priorite: "Important",
    categorie: "Travail",
    statut: "Terminé",
    echeance: "2026-03-18",
  },
];
const DEF_HABITUDES = [
  { id: "h1", nom: "Boire un verre d'eau au réveil", obj: 31 },
  { id: "h2", nom: "Planifier les tâches de la journée", obj: 31 },
  { id: "h3", nom: "Faire 30 min de méditation", obj: 20 },
  { id: "h4", nom: "Préparer un petit-déjeuner équilibré", obj: 25 },
  { id: "h5", nom: "Lire 10 pages d'un livre", obj: 20 },
  { id: "h6", nom: "Écrire 3 choses positives", obj: 31 },
  { id: "h7", nom: "Faire du sport", obj: 15 },
  { id: "h8", nom: "Limiter les écrans 1h avant de dormir", obj: 20 },
];
const DEF_PROJETS = [
  {
    id: "p1",
    nom: "Site web personnel",
    desc: "Création du portfolio",
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
    nom: "Rénovation bureau",
    desc: "Aménagement espace travail",
    debut: "2026-03-01",
    fin: "2026-04-30",
    statut: "Planifié",
    prog: 0,
  },
];
const DEF_DOMAINES = [
  { id: "d1", nom: "Santé", color: "#798C80" },
  { id: "d2", nom: "Lecture", color: "#6A7B84" },
  { id: "d3", nom: "Formation", color: "#BAA082" },
  { id: "d4", nom: "Finances", color: "#7A8C7E" },
];
const DEF_OBJECTIFS = [
  {
    id: "o1",
    domaineId: "d1",
    obj: "Faire du sport 4x/semaine",
    action: "Réserver créneaux cette semaine",
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
    action: "Choisir formation 1 cette semaine",
    score: 0,
    terme: "long",
  },
  {
    id: "o4",
    domaineId: "d4",
    obj: "Épargner X% de mes revenus",
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

var uid = function () {
  return "id_" + Date.now() + "_" + Math.floor(Math.random() * 9999);
};
var fmt = function (v) {
  return (+v || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €";
};

function Card(p) {
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
        p.style || {}
      )}
    >
      {p.children}
    </div>
  );
}
function SecTitle(p) {
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
      {p.children}
    </div>
  );
}
function PBar(p) {
  var C = useContext(ThemeCtx);
  return (
    <div
      style={{
        background: C.tableBg,
        borderRadius: 99,
        height: p.h || 6,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          width: Math.min(100, p.pct || 0) + "%",
          height: p.h || 6,
          background: p.color || C.beige,
          borderRadius: 99,
          transition: "width .4s",
        }}
      />
    </div>
  );
}
function Tag(p) {
  var s = p.s;
  return (
    <span
      style={{
        background: s.bg,
        border: "1px solid " + (s.border || "transparent"),
        color: s.color,
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 99,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {p.label}
    </span>
  );
}
function Btn(p) {
  var C = useContext(ThemeCtx);
  return (
    <button
      onClick={p.onClick}
      style={Object.assign(
        {
          background: p.bg || C.beige,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        },
        p.style || {}
      )}
    >
      {p.children}
    </button>
  );
}
function Del(p) {
  var C = useContext(ThemeCtx);
  return (
    <button
      onClick={p.onClick}
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
      ×
    </button>
  );
}
function Edit(p) {
  var C = useContext(ThemeCtx);
  return (
    <button
      onClick={p.onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: C.textSec,
        fontSize: 14,
        padding: "4px 6px",
      }}
    >
      ✎
    </button>
  );
}
function MI(p) {
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
      {...p}
    />
  );
}
function MS(p) {
  var C = useContext(ThemeCtx);
  var ch = p.children;
  var rest = Object.assign({}, p);
  delete rest.children;
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
      {ch}
    </select>
  );
}
function Row(p) {
  return (
    <div
      style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}
    >
      {p.children}
    </div>
  );
}
function Modal(p) {
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
            {p.title}
          </span>
          <button
            onClick={p.onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: C.textSec,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {p.children}
      </div>
    </div>
  );
}
function ModalFooter(p) {
  var C = useContext(ThemeCtx);
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <Btn onClick={p.onClose} bg={C.gray} style={{ flex: 1 }}>
        Annuler
      </Btn>
      <Btn onClick={p.onSave} style={{ flex: 1 }}>
        Enregistrer
      </Btn>
    </div>
  );
}

function LoginScreen(p) {
  var C = p.C;
  var [input, setInput] = useState("");
  var [error, setError] = useState(false);
  var [show, setShow] = useState(false);
  function handleSubmit() {
    if (input === APP_PASSWORD) {
      p.onLogin();
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
            <div style={{ textAlign: "left" }}>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: C.text,
                }}
              >
                Noa
              </span>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: C.beige,
                }}
              >
                OS
              </span>
            </div>
          </div>
          <p style={{ color: C.textSec, fontSize: 13, marginTop: 0 }}>
            Connecte-toi pour accéder à ton espace
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
              placeholder="••••••••"
              value={input}
              onChange={function (e) {
                setInput(e.target.value);
                setError(false);
              }}
              onKeyDown={function (e) {
                if (e.key === "Enter") handleSubmit();
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
                fontSize: 16,
              }}
            >
              {show ? "🙈" : "👁"}
            </button>
          </div>
          {error && (
            <div style={{ fontSize: 12, color: "#C4584A", marginTop: 6 }}>
              Mot de passe incorrect
            </div>
          )}
        </div>
        <button
          onClick={handleSubmit}
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
          Accéder au dashboard
        </button>
      </div>
    </div>
  );
}

function PomodoroTimer() {
  var C = useContext(ThemeCtx);
  var [mode, setMode] = useState("focus");
  var DURATIONS = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  var [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
  var [running, setRunning] = useState(false);
  var [sessions, setSessions] = useState(0);
  var intervalRef = useRef(null);
  useEffect(
    function () {
      if (running) {
        intervalRef.current = setInterval(function () {
          setTimeLeft(function (t) {
            if (t <= 1) {
              clearInterval(intervalRef.current);
              setRunning(false);
              if (mode === "focus")
                setSessions(function (s) {
                  return s + 1;
                });
              if (
                "Notification" in window &&
                Notification.permission === "granted"
              )
                new Notification("NosaOS", {
                  body:
                    mode === "focus"
                      ? "Session terminée ! Pause bien méritée."
                      : "Pause terminée ! Au travail.",
                });
              return DURATIONS[mode];
            }
            return t - 1;
          });
        }, 1000);
      }
      return function () {
        clearInterval(intervalRef.current);
      };
    },
    [running, mode]
  );
  function changeMode(m) {
    setMode(m);
    setTimeLeft(DURATIONS[m]);
    setRunning(false);
    clearInterval(intervalRef.current);
  }
  var pct = (timeLeft / DURATIONS[mode]) * 100;
  var min = Math.floor(timeLeft / 60);
  var sec = timeLeft % 60;
  var r = 54;
  var circ = 2 * Math.PI * r;
  return (
    <Card>
      <SecTitle>Mode Focus — Pomodoro</SecTitle>
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
            {running ? "Pause" : "Démarrer"}
          </button>
          <button
            onClick={function () {
              setRunning(false);
              setTimeLeft(DURATIONS[mode]);
              clearInterval(intervalRef.current);
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
            ↺
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function App() {
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
  var [modal, setModal] = useState(null);
  var [form, setForm] = useState({});
  var [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  var [menuOpen, setMenuOpen] = useState(false);
  var [permission, setPermission] = useState("default");
  var [bannerDismissed, setBannerDismissed] = useSynced("banner_dismissed", "");

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

  var terminees = taches.filter(function (t) {
    return t.statut === "Terminé";
  }).length;
  var enRetard = taches.filter(function (t) {
    return t.statut !== "Terminé" && t.echeance && new Date(t.echeance) < today;
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
    return todayData[h.id];
  }).length;
  var bestStreak = habitudes.reduce(function (best, h) {
    return Math.max(best, getStreak(h.id));
  }, 0);
  var alertes = taches.filter(function (t) {
    var r =
      t.statut !== "Terminé" && t.echeance && new Date(t.echeance) < today;
    var u = t.statut !== "Terminé" && t.priorite === "Urgent";
    return r || u;
  });
  var showBanner = alertes.length > 0 && bannerDismissed !== todayKey;
  var todayMood = moodData[todayKey];
  var todayGratitude = gratitudeData[todayKey] || { g1: "", g2: "", g3: "" };
  var todaySommeil = sommeilData[todayKey] || "";
  var affirmation = AFFIRMATIONS[affirmIdx % AFFIRMATIONS.length];
  var citation = getCitationDuJour();

  // Graphique habitudes semaine
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

  // Graphique livres par mois
  var livresChartData = MOIS.map(function (m, mi) {
    var count = livres.filter(function (l) {
      return (
        l.statut === "Terminé" && l.date && new Date(l.date).getMonth() === mi
      );
    }).length;
    return { mois: m, livres: count };
  });

  // Countdowns
  var countdownsWithDays = countdowns
    .map(function (c) {
      var diff = Math.ceil((new Date(c.date) - today) / (1000 * 60 * 60 * 24));
      return Object.assign({}, c, { jours: diff });
    })
    .sort(function (a, b) {
      return a.jours - b.jours;
    });

  // Rétrospective
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
      var yearMonth = dayKey.substring(0, 7);
      var monthCount = 0;
      Object.keys(nd).forEach(function (k) {
        if (k.length === 10 && k.startsWith(yearMonth) && nd[k] && nd[k][hid])
          monthCount++;
      });
      var moisStr = MOIS[new Date(dayKey).getMonth()];
      nd[moisStr] = Object.assign({}, nd[moisStr] || {});
      nd[moisStr][hid] = monthCount;
      return nd;
    });
  }

  function open(type, data) {
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
          Object.assign({}, form, { id: uid(), statut: "Pas commencé" }),
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
              statut: t.statut === "Terminé" ? "En cours" : "Terminé",
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
            statut: form.statut || "Planifié",
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
    { id: "budget", label: "Budget" },
    { id: "vision", label: "Vision" },
    { id: "projets", label: "Projets" },
    { id: "focus", label: "Focus" },
    { id: "lecture", label: "Lecture" },
    { id: "sante", label: "Santé" },
    { id: "countdown", label: "Countdown" },
    { id: "retro", label: "Rétrospective" },
  ];
  var g2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  var g4 = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
    gap: 12,
  };

  var TABS = [
    { id: "dashboard", label: "Accueil" },
    { id: "todo", label: "To Do" },
    { id: "habitudes", label: "Habitudes" },
    { id: "budget", label: "Budget" },
    { id: "vision", label: "Vision" },
    { id: "projets", label: "Projets" },
    { id: "focus", label: "Focus" },
    { id: "lecture", label: "Lecture" },
    { id: "sante", label: "Santé" },
    { id: "countdown", label: "Countdown" },
    { id: "retro", label: "Rétrospective" },
  ];
  var g2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  var g4 = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
    gap: 12,
  };
  var inpStyle = {
    background: C.tableBg,
    border: "1px solid #D5D0CA",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 13,
    color: C.text,
    outline: "none",
  };

  var [confetti, setConfetti] = useState(false);
  var prevHabitDone = useRef(0);
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

  if (!auth)
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
        }}
      >
        {/* HEADER desktop */}
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
              <span
                style={{
                  color: C.white,
                  fontWeight: 900,
                  fontSize: 16,
                  letterSpacing: "-0.02em",
                }}
              >
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
                      padding: "14px 12px",
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
              {(manualDark !== null ? manualDark : darkMode) ? "☀" : "☾"}
            </button>
          </div>
        )}

        {/* HEADER mobile */}
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
                <div
                  style={{
                    color: C.white,
                    fontWeight: 900,
                    fontSize: 16,
                    letterSpacing: "-0.02em",
                  }}
                >
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
                  fontSize: 14,
                  color: C.white,
                }}
              >
                {(manualDark !== null ? manualDark : darkMode) ? "☀" : "☾"}
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
                    <span style={{ fontSize: 16 }}>{ICONS[t.id] || "·"}</span>
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
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>
              <span style={{ fontWeight: 700 }}>
                ⚠ {alertes.length} tâche{alertes.length > 1 ? "s" : ""} urgente
                {alertes.length > 1 ? "s" : ""} ou en retard
              </span>
              <span style={{ opacity: 0.85, marginLeft: 8 }}>
                {alertes
                  .slice(0, 2)
                  .map(function (t) {
                    return t.nom;
                  })
                  .join(", ")}
                {alertes.length > 2 ? " +" + (alertes.length - 2) : ""}
              </span>
            </div>
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
                  Activer les notifs
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
                ×
              </button>
            </div>
          </div>
        )}
        {!showBanner && permission === "default" && (
          <div
            style={{
              background: C === DARK ? "#2A2218" : "#EDE4DA",
              padding: "8px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 12, color: C.beige, fontWeight: 500 }}>
              Reçois tes alertes tâches chaque matin à 8h30
            </span>
            <button
              onClick={requestPermission}
              style={{
                background: C.beige,
                border: "none",
                color: "#fff",
                borderRadius: 6,
                padding: "4px 12px",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Activer
            </button>
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
                        style={{ color: C.textSec, fontSize: 13, marginTop: 4 }}
                      >
                        {today.toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
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
                      Bonjour 👋
                    </h2>
                  )}

                  {/* Affirmation */}
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
                      ↻
                    </button>
                  </div>

                  {/* Citation */}
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
                      « {citation.texte} »
                    </div>
                    <div
                      style={{ fontSize: 11, color: C.beige, fontWeight: 600 }}
                    >
                      — {citation.auteur}
                    </div>
                  </div>

                  {/* Countdown rapide */}
                  {countdownsWithDays.filter(function (c) {
                    return c.jours >= 0 && c.jours <= 30;
                  }).length > 0 && (
                    <div
                      style={{
                        background: C === DARK ? "#1E281E" : "#E8F2EA",
                        borderRadius: 14,
                        padding: "12px 18px",
                        marginBottom: 14,
                        borderLeft: "3px solid " + C.green,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: C.green,
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}
                      >
                        Prochaine échéance
                      </div>
                      {(function () {
                        var c = countdownsWithDays.find(function (x) {
                          return x.jours >= 0;
                        });
                        if (!c) return null;
                        return (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                color: C.text,
                                fontWeight: 500,
                              }}
                            >
                              {c.nom}
                            </span>
                            <span
                              style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color:
                                  c.jours <= 3
                                    ? C.red
                                    : c.jours <= 7
                                    ? C.beige
                                    : C.green,
                              }}
                            >
                              {c.jours === 0 ? "Aujourd'hui" : c.jours + " j"}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* KPIs */}
                  <div style={Object.assign({}, g4, { marginBottom: 14 })}>
                    {[
                      {
                        label: "Terminées",
                        val: terminees + "/" + taches.length,
                        sub:
                          Math.round((terminees / (taches.length || 1)) * 100) +
                          "%",
                        accent: C.green,
                      },
                      {
                        label: "En retard",
                        val: enRetard,
                        sub: "tâches",
                        accent: C.red,
                      },
                      {
                        label: "Habitudes",
                        val: tauxHabit + "%",
                        sub: mois,
                        accent: C.blue,
                      },
                      {
                        label: "Solde",
                        val: fmt(solde),
                        sub: "ce mois",
                        accent: solde >= 0 ? C.green : C.red,
                      },
                    ].map(function (k, i) {
                      return (
                        <Card key={i} style={{ padding: "14px 16px" }}>
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
                        </Card>
                      );
                    })}
                  </div>

                  {/* Graphiques principaux */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    {/* Habitudes semaine */}
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
                                "Réalisées",
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

                    {/* Habitudes mensuel */}
                    <Card>
                      <SecTitle>Habitudes — progression mensuelle</SecTitle>
                      <ResponsiveContainer width="100%" height={140}>
                        <BarChart
                          data={habitBarData}
                          barSize={14}
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
                            unit="%"
                            domain={[0, 100]}
                          />
                          <Tooltip
                            formatter={function (v) {
                              return [v + "%", "Taux"];
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
                          <Bar dataKey="taux" radius={[4, 4, 0, 0]}>
                            {habitBarData.map(function (d, i) {
                              return (
                                <Cell
                                  key={i}
                                  fill={d.active ? C.beige : C.blue}
                                  fillOpacity={0.8}
                                />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    {/* Livres lus par mois */}
                    <Card>
                      <SecTitle>Livres lus cette année</SecTitle>
                      {livres.filter(function (l) {
                        return l.statut === "Terminé";
                      }).length === 0 ? (
                        <p style={{ color: C.textSec, fontSize: 13 }}>
                          Ajoute tes livres dans l'onglet Lecture
                        </p>
                      ) : (
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
                                  "Terminés",
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
                      )}
                    </Card>

                    {/* Tâches par priorité */}
                    <Card style={{ display: "flex", flexDirection: "column" }}>
                      <SecTitle>Tâches par priorité</SecTitle>
                      {donutData.length === 0 ? (
                        <p style={{ color: C.textSec, fontSize: 13 }}>
                          Aucune tâche
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

                  {/* Récap semaine */}
                  <Card style={{ marginBottom: 14 }}>
                    <SecTitle>Récap du jour</SecTitle>
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
                          val: habitWeekDone + "/" + habitudes.length,
                          pct:
                            habitudes.length > 0
                              ? (habitWeekDone / habitudes.length) * 100
                              : 0,
                          color: C.green,
                        },
                        {
                          label: "Meilleur streak",
                          val:
                            bestStreak > 0
                              ? bestStreak +
                                "j " +
                                (bestStreak >= 7
                                  ? "🔥"
                                  : bestStreak >= 3
                                  ? "⚡"
                                  : "✓")
                              : "—",
                          pct: Math.min(100, (bestStreak / 30) * 100),
                          color: C.beige,
                        },
                        {
                          label: "Humeur du jour",
                          val: todayMood
                            ? MOOD_LABELS[todayMood - 1] +
                              " " +
                              todayMood +
                              "/5"
                            : "—",
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
                              : "—",
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
                            <PBar pct={k.pct} color={k.color} h={4} />
                          </div>
                        );
                      })}
                    </div>

                    {/* Mood */}
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
                        {MOOD_LABELS.map(function (m, i) {
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
                                fontSize: 22,
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

                    {/* Habitudes */}
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
                          var checked = todayData[h.id] || false;
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
                                  background: checked ? C.green : "transparent",
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all .2s",
                                }}
                              >
                                {checked && (
                                  <span style={{ color: "#fff", fontSize: 11 }}>
                                    ✓
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
                                  {streak >= 7 ? "🔥" : streak >= 3 ? "⚡" : ""}{" "}
                                  {streak}j
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Gratitude */}
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
                        3 choses positives aujourd'hui 🙏
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
                            style={Object.assign({}, inpStyle, {
                              width: "100%",
                              marginBottom: 6,
                              boxSizing: "border-box",
                            })}
                          />
                        );
                      })}
                    </div>
                  </Card>

                  {/* Objectifs par horizon */}
                  <Card style={{ marginBottom: 14 }}>
                    <SecTitle>Objectifs par horizon</SecTitle>
                    {["court", "moyen", "long"].map(function (terme) {
                      var label =
                        terme === "court"
                          ? "Court terme"
                          : terme === "moyen"
                          ? "Moyen terme"
                          : "Long terme";
                      var color =
                        terme === "court"
                          ? C.green
                          : terme === "moyen"
                          ? C.beige
                          : C.blue;
                      var objs = objectifs.filter(function (o) {
                        return (o.terme || "moyen") === terme;
                      });
                      if (objs.length === 0) return null;
                      return (
                        <div key={terme} style={{ marginBottom: 14 }}>
                          <div
                            style={{
                              fontSize: 11,
                              color: color,
                              fontWeight: 700,
                              marginBottom: 8,
                            }}
                          >
                            {label}
                          </div>
                          {objs.map(function (o) {
                            var dom = domaines.find(function (d) {
                              return d.id === o.domaineId;
                            });
                            return (
                              <div key={o.id} style={{ marginBottom: 10 }}>
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
                                      gap: 6,
                                    }}
                                  >
                                    {dom && (
                                      <div
                                        style={{
                                          width: 6,
                                          height: 6,
                                          borderRadius: "50%",
                                          background: dom.color,
                                        }}
                                      />
                                    )}
                                    <span style={{ color: C.text }}>
                                      {o.obj}
                                    </span>
                                  </div>
                                  <span
                                    style={{
                                      color: C.textSec,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {o.score || 0}%
                                  </span>
                                </div>
                                <PBar pct={o.score || 0} color={color} h={4} />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </Card>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <Card>
                      <SecTitle>Tâches urgentes</SecTitle>
                      {taches.filter(function (t) {
                        return (
                          t.priorite === "Urgent" && t.statut !== "Terminé"
                        );
                      }).length === 0 ? (
                        <p style={{ color: C.textSec, fontSize: 13 }}>
                          Aucune tâche urgente
                        </p>
                      ) : (
                        taches
                          .filter(function (t) {
                            return (
                              t.priorite === "Urgent" && t.statut !== "Terminé"
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
                          return p.statut !== "Terminé";
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
                              <PBar pct={p.prog} color={C.beige} />
                            </div>
                          );
                        })}
                    </Card>
                  </div>
                </div>
              )}

              {/* ── TO DO ── */}
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
                        open("tache", {
                          nom: "",
                          priorite: "Moyen",
                          categorie: "Personnel",
                          echeance: "",
                          statut: "Pas commencé",
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
                      { l: "Terminées", v: terminees },
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
                        t.statut !== "Terminé" &&
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
                                (t.statut === "Terminé" ? C.green : C.gray),
                              background:
                                t.statut === "Terminé"
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
                            {t.statut === "Terminé" && (
                              <span style={{ color: "#fff", fontSize: 12 }}>
                                ✓
                              </span>
                            )}
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color:
                                  t.statut === "Terminé" ? C.textSec : C.text,
                                textDecoration:
                                  t.statut === "Terminé"
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
                              {t.echeance ? " · " + t.echeance : ""}
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
                                s={PRIORITE_STYLE[t.priorite]}
                              />
                            )}
                            <Edit
                              onClick={function () {
                                open("tache", Object.assign({}, t));
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

              {/* ── HABITUDES ── */}
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
                        open("habitude", { nom: "", obj: 30 });
                      }}
                    >
                      + Ajouter
                    </Btn>
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
                        Aujourd'hui —{" "}
                        {today.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                        })}
                      </SecTitle>
                      <span
                        style={{
                          fontSize: 12,
                          color: C.green,
                          fontWeight: 600,
                        }}
                      >
                        {Object.values(todayData).filter(Boolean).length}/
                        {habitudes.length}
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
                        var checked = todayData[h.id] || false;
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
                                  ✓
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
                                {streak >= 7 ? "🔥" : streak >= 3 ? "⚡" : ""}{" "}
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
                      { l: "Réalisées", v: totalReal, c: C.blue },
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
                                    {streak >= 7
                                      ? "🔥"
                                      : streak >= 3
                                      ? "⚡"
                                      : ""}
                                    {streak}j
                                  </span>
                                )}
                                <Edit
                                  onClick={function () {
                                    open("habitude", Object.assign({}, h));
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
                                style={{
                                  background: C.tableBg,
                                  border: "1px solid #D5D0CA",
                                  borderRadius: 8,
                                  padding: "5px 8px",
                                  fontSize: 14,
                                  color: C.text,
                                  outline: "none",
                                  width: 52,
                                  textAlign: "center",
                                }}
                              />
                              <span style={{ fontSize: 11, color: C.textSec }}>
                                / {h.obj}
                              </span>
                              <div style={{ flex: 1 }}>
                                <PBar
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
                              "Réalisé",
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
                                      {streak >= 7
                                        ? "🔥"
                                        : streak >= 3
                                        ? "⚡"
                                        : ""}{" "}
                                      {streak}j
                                    </span>
                                  ) : (
                                    <span style={{ color: C.textSec }}>—</span>
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
                                    style={{
                                      background: C.tableBg,
                                      border: "1px solid #D5D0CA",
                                      borderRadius: 8,
                                      padding: "5px 8px",
                                      fontSize: 13,
                                      color: C.text,
                                      outline: "none",
                                      width: 56,
                                      textAlign: "center",
                                    }}
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
                                  <PBar
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
                                      open("habitude", Object.assign({}, h));
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
                    <SecTitle>Taux de complétion — vue annuelle</SecTitle>
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
                        var obj = habitudes.reduce(function (s, h) {
                          return s + h.obj;
                        }, 0);
                        var pct =
                          obj > 0
                            ? Math.min(100, Math.round((real / obj) * 100))
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

              {/* ── BUDGET ── */}
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
                      { l: "Revenus réels", v: fmt(revReel), c: C.green },
                      { l: "Dépenses réelles", v: fmt(depReel), c: C.red },
                      {
                        l: "Solde net",
                        v: fmt(solde),
                        c: solde >= 0 ? C.green : C.red,
                      },
                      {
                        l: "Revenus prévus",
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
                      <SecTitle>Répartition des dépenses</SecTitle>
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
                                <PBar
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
                      <SecTitle>Répartition des dépenses</SecTitle>
                      <p style={{ color: C.textSec, fontSize: 13 }}>
                        Saisis tes dépenses réelles pour voir le graphique
                      </p>
                    </Card>
                  )}
                  {[
                    { title: "Revenus", key: "revenus" },
                    { title: "Dépenses fixes", key: "fixes" },
                    { title: "Dépenses variables", key: "variables" },
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
                              open("budget_" + sec.key, {
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
                                style={{
                                  background: C.tableBg,
                                  border: "1px solid #D5D0CA",
                                  borderRadius: 8,
                                  padding: "5px 8px",
                                  fontSize: 12,
                                  color: C.text,
                                  outline: "none",
                                  width: isMobile ? 80 : 100,
                                  textAlign: "right",
                                }}
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
                                  open(
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

              {/* ── VISION ── */}
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
                          open("domaine", {
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
                          open("objectif", {
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

                  {/* Vision Board */}
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
                          open("vision_card", {
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
                        Crée tes cartes de vision — images mentales, citations,
                        objectifs visuels
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
                                    open("vision_card", Object.assign({}, v));
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
                                  ✎
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
                                  ×
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>

                  <p
                    style={{
                      color: C.textSec,
                      fontSize: 12,
                      fontStyle: "italic",
                      marginBottom: 16,
                    }}
                  >
                    « Ce que tu fais chaque jour compte plus que ce que tu fais
                    de temps en temps. »
                  </p>
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
                                open("domaine", Object.assign({}, d));
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
                            Aucun objectif pour ce domaine
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
                                    → {o.action}
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
                                    style={{
                                      background: C.tableBg,
                                      border: "1px solid #D5D0CA",
                                      borderRadius: 8,
                                      padding: "4px 6px",
                                      fontSize: 12,
                                      color: C.text,
                                      outline: "none",
                                      width: 50,
                                      textAlign: "center",
                                    }}
                                  />
                                  <span
                                    style={{ fontSize: 11, color: C.textSec }}
                                  >
                                    %
                                  </span>
                                  <Edit
                                    onClick={function () {
                                      open("objectif", Object.assign({}, o));
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
                                <PBar
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

              {/* ── PROJETS ── */}
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
                        open("projet", {
                          nom: "",
                          desc: "",
                          debut: "",
                          fin: "",
                          statut: "Planifié",
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
                                s={{
                                  bg:
                                    (STATUT_STYLE[p.statut] &&
                                      STATUT_STYLE[p.statut].bg) ||
                                    "#eee",
                                  border: "transparent",
                                  color:
                                    (STATUT_STYLE[p.statut] &&
                                      STATUT_STYLE[p.statut].color) ||
                                    "#555",
                                }}
                              />
                              <Edit
                                onClick={function () {
                                  open("projet", Object.assign({}, p));
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
                              {p.debut && <span>Début : {p.debut}</span>}
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
                              <PBar pct={p.prog} color={C.beige} h={8} />
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
                              style={{
                                background: C.tableBg,
                                border: "1px solid #D5D0CA",
                                borderRadius: 8,
                                padding: "5px 8px",
                                fontSize: 13,
                                color: C.text,
                                outline: "none",
                                width: 52,
                                textAlign: "center",
                              }}
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

              {/* ── FOCUS ── */}
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
                  <Card style={{ marginTop: 14 }}>
                    <SecTitle>Conseils pour une session efficace</SecTitle>
                    {[
                      "Éteins les notifications de ton téléphone",
                      "Prépare ta liste de tâches avant de démarrer",
                      "Fais une vraie pause entre chaque session",
                      "Bois un verre d'eau avant de commencer",
                      "Garde ton bureau rangé",
                    ].map(function (tip, i) {
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            padding: "8px 0",
                            borderBottom: "1px solid " + C.tableBg,
                          }}
                        >
                          <span
                            style={{
                              color: C.beige,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}.
                          </span>
                          <span style={{ fontSize: 13, color: C.text }}>
                            {tip}
                          </span>
                        </div>
                      );
                    })}
                  </Card>
                </div>
              )}

              {/* ── LECTURE ── */}
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
                        open("livre", {
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
                          return l.statut === "Terminé";
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
                    return l.statut === "Terminé";
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
                                "Terminés",
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
                        Aucun livre ajouté — commence ta liste !
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
                                    open("livre", Object.assign({}, l));
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
                                {"⭐".repeat(parseInt(l.note) || 0)}
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

              {/* ── SANTÉ ── */}
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
                    Santé & Bien-être
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
                        style={Object.assign({}, inpStyle, {
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
                          open("sport", {
                            type: "",
                            duree: "",
                            distance: "",
                            calories: "",
                            date: todayKey,
                          });
                        }}
                        style={{ padding: "5px 12px", fontSize: 11 }}
                      >
                        + Séance
                      </Btn>
                    </div>
                    <div style={Object.assign({}, g2, { marginBottom: 12 })}>
                      {[
                        {
                          l: "Séances ce mois",
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
                        { l: "Total séances", v: sportData.length, c: C.blue },
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
                    <SecTitle>Humeur — 30 derniers jours</SecTitle>
                    {moodChartData.length === 0 ? (
                      <p style={{ color: C.textSec, fontSize: 13 }}>
                        Commence à noter ton humeur depuis le tableau de bord
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
                              return [
                                MOOD_LABELS[v - 1] + " " + v + "/5",
                                "Humeur",
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

              {/* ── COUNTDOWN ── */}
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
                      Compte à rebours
                    </h2>
                    <Btn
                      onClick={function () {
                        open("countdown", { nom: "", date: "", emoji: "🎯" });
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
                        Ajoute tes échéances importantes — événements,
                        deadlines, voyages...
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
                                <span style={{ fontSize: 28 }}>
                                  {c.emoji || "🎯"}
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
                                      ? "Passé"
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
                                        ? "bientôt"
                                        : "dans " + c.jours + " jours"}
                                    </div>
                                  )}
                                </div>
                                <Edit
                                  onClick={function () {
                                    open("countdown", Object.assign({}, c));
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
                                <PBar
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

              {/* ── RÉTROSPECTIVE ── */}
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
                    Rétrospective Mensuelle
                  </h2>
                  <p
                    style={{ color: C.textSec, fontSize: 13, marginBottom: 20 }}
                  >
                    {MOIS[new Date().getMonth()]} {new Date().getFullYear()} —
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
                            ⭐
                          </button>
                        );
                      })}
                    </div>
                  </Card>

                  {[
                    {
                      key: "victoires",
                      label: "🏆 Mes victoires ce mois",
                      placeholder:
                        "Qu'est-ce que j'ai accompli ? Quels progrès ai-je faits ?",
                    },
                    {
                      key: "ameliorations",
                      label: "🔧 Ce que j'aurais pu mieux faire",
                      placeholder:
                        "Quels obstacles ai-je rencontrés ? Qu'est-ce que j'améliore ?",
                    },
                    {
                      key: "focus",
                      label: "🎯 Mon focus pour le mois prochain",
                      placeholder:
                        "Sur quoi je vais me concentrer ? Quels sont mes 3 priorités ?",
                    },
                    {
                      key: "gratitude",
                      label: "🙏 Ma gratitude du mois",
                      placeholder:
                        "Pour quoi suis-je reconnaissant ce mois-ci ?",
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

                  {/* Stats du mois */}
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
                        { l: "Tâches terminées", v: terminees, c: C.green },
                        {
                          l: "Habitudes (taux)",
                          v: tauxHabit + "%",
                          c: tauxHabit >= 50 ? C.green : C.red,
                        },
                        {
                          l: "Livres lus",
                          v: livres.filter(function (l) {
                            return (
                              l.statut === "Terminé" &&
                              l.date &&
                              l.date.startsWith(
                                new Date().toISOString().substring(0, 7)
                              )
                            );
                          }).length,
                          c: C.blue,
                        },
                        {
                          l: "Séances sport",
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
        {modal === "tache" && (
          <Modal
            title={form.id ? "Modifier la tâche" : "Nouvelle tâche"}
            onClose={close}
          >
            <Row>
              <MI
                placeholder="Nom de la tâche"
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
                value={form.statut || "Pas commencé"}
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
                style={Object.assign({}, inpStyle, { flex: 1 })}
                value={form.echeance || ""}
                onChange={function (e) {
                  f("echeance", e.target.value);
                }}
              />
            </Row>
            <ModalFooter onClose={close} onSave={saveTache} />
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
            <ModalFooter onClose={close} onSave={saveHabitude} />
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
                style={Object.assign({}, inpStyle, { flex: 1 })}
                value={form.debut || ""}
                onChange={function (e) {
                  f("debut", e.target.value);
                }}
              />
              <input
                type="date"
                style={Object.assign({}, inpStyle, { flex: 1 })}
                value={form.fin || ""}
                onChange={function (e) {
                  f("fin", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MS
                value={form.statut || "Planifié"}
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
            <ModalFooter onClose={close} onSave={saveProjet} />
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
            <ModalFooter onClose={close} onSave={saveDomaine} />
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
            <ModalFooter onClose={close} onSave={saveObjectif} />
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
                {["À lire", "En cours", "Terminé"].map(function (s) {
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
                      {"⭐".repeat(n)}
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
            <ModalFooter onClose={close} onSave={saveLivre} />
          </Modal>
        )}
        {modal === "sport" && (
          <Modal title="Nouvelle séance" onClose={close}>
            <Row>
              <MI
                placeholder="Type (course, muscu, vélo...)"
                value={form.type || ""}
                onChange={function (e) {
                  f("type", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MI
                type="number"
                placeholder="Durée (min)"
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
                style={Object.assign({}, inpStyle, { flex: 1 })}
                value={form.date || todayKey}
                onChange={function (e) {
                  f("date", e.target.value);
                }}
              />
            </Row>
            <ModalFooter onClose={close} onSave={saveSport} />
          </Modal>
        )}
        {modal === "countdown" && (
          <Modal
            title={form.id ? "Modifier" : "Nouveau compte à rebours"}
            onClose={close}
          >
            <Row>
              <MI
                placeholder="Nom (ex: Voyage à Paris)"
                value={form.nom || ""}
                onChange={function (e) {
                  f("nom", e.target.value);
                }}
              />
            </Row>
            <Row>
              <MI
                placeholder="Emoji"
                value={form.emoji || "🎯"}
                onChange={function (e) {
                  f("emoji", e.target.value);
                }}
                style={{ maxWidth: 80 }}
              />
              <input
                type="date"
                style={Object.assign({}, inpStyle, { flex: 1 })}
                value={form.date || ""}
                onChange={function (e) {
                  f("date", e.target.value);
                }}
              />
            </Row>
            <ModalFooter onClose={close} onSave={saveCountdown} />
          </Modal>
        )}
        {modal === "vision_card" && (
          <Modal
            title={form.id ? "Modifier la carte" : "Nouvelle carte vision"}
            onClose={close}
          >
            <Row>
              <MI
                placeholder="Titre (ex: Liberté financière)"
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
            <ModalFooter onClose={close} onSave={saveVisionCard} />
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
                  placeholder="Catégorie"
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
                  placeholder="Montant prévu (€)"
                  value={form.prevu || 0}
                  onChange={function (e) {
                    f("prevu", e.target.value);
                  }}
                />
              </Row>
              <ModalFooter
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
