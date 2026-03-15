// @ts-nocheck
import { useState, useEffect, useContext, createContext } from "react";
import {
  BarChart,
  Bar,
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

async function sbGet(id: string) {
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
async function sbSet(id: string, data: any) {
  try {
    await fetch(SUPABASE_URL + "/rest/v1/dashboard_data", {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id: id,
        data: data,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (e) {}
}

function useSynced(key: string, def: any) {
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
    sbGet(key).then(function (remote: any) {
      if (remote !== null) {
        setV(remote);
        try {
          localStorage.setItem(key, JSON.stringify(remote));
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
    texte:
      "Le succès n'est pas final, l'échec n'est pas fatal. C'est le courage de continuer qui compte.",
    auteur: "Winston Churchill",
  },
  {
    texte:
      "Concentre-toi sur le chemin à parcourir, pas sur les obstacles qui t'en séparent.",
    auteur: "Anonyme",
  },
  {
    texte:
      "Les grandes choses ne sont jamais faites par une seule personne. Elles sont faites par une équipe.",
    auteur: "Steve Jobs",
  },
  {
    texte:
      "Peu importe la vitesse à laquelle tu avances, tu es toujours en avance sur celui qui n'a pas commencé.",
    auteur: "Confucius",
  },
  {
    texte: "La vie commence là où ta zone de confort se termine.",
    auteur: "Neale Donald Walsch",
  },
  {
    texte: "Investis en toi-même. Ton carrière est le moteur de ta richesse.",
    auteur: "Paul Clitheroe",
  },
  {
    texte: "Sois le changement que tu veux voir dans le monde.",
    auteur: "Gandhi",
  },
  {
    texte:
      "Si tu veux aller vite, marche seul. Si tu veux aller loin, marche ensemble.",
    auteur: "Proverbe africain",
  },
  {
    texte: "Le génie, c'est 1% d'inspiration et 99% de transpiration.",
    auteur: "Thomas Edison",
  },
  {
    texte:
      "Il faut toujours viser la lune, car même en cas d'échec, on atterrit dans les étoiles.",
    auteur: "Oscar Wilde",
  },
  {
    texte:
      "La seule façon de faire du bon travail est d'aimer ce que vous faites.",
    auteur: "Steve Jobs",
  },
  {
    texte:
      "L'avenir appartient à ceux qui croient en la beauté de leurs rêves.",
    auteur: "Eleanor Roosevelt",
  },
  {
    texte:
      "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.",
    auteur: "Sénèque",
  },
  { texte: "Chaque expert a été un jour un débutant.", auteur: "Helen Hayes" },
  {
    texte: "La meilleure façon de prédire l'avenir, c'est de le créer.",
    auteur: "Peter Drucker",
  },
  { texte: "Fais de chaque jour ton chef-d'œuvre.", auteur: "John Wooden" },
  {
    texte: "Le succès c'est tomber sept fois et se relever huit.",
    auteur: "Proverbe japonais",
  },
  {
    texte: "Arrête de rêver à ta vie et commence à vivre tes rêves.",
    auteur: "Anonyme",
  },
  {
    texte: "Une journée bien planifiée est une journée à moitié réussie.",
    auteur: "Anonyme",
  },
  {
    texte: "La persévérance est la mère du succès.",
    auteur: "Honoré de Balzac",
  },
  {
    texte: "On ne gère pas le temps, on gère ses priorités.",
    auteur: "Anonyme",
  },
  {
    texte: "Ce qui compte vraiment, c'est ce que tu fais avec ce que tu as.",
    auteur: "Aldous Huxley",
  },
  {
    texte:
      "Le meilleur moment pour planter un arbre était il y a 20 ans. Le second meilleur moment, c'est maintenant.",
    auteur: "Proverbe chinois",
  },
  {
    texte:
      "Il n'y a pas de vent favorable pour celui qui ne sait pas où il va.",
    auteur: "Sénèque",
  },
];

function getCitationDuJour() {
  var now = new Date();
  var dayOfYear = Math.floor(
    (now - new Date(now.getFullYear(), 0, 0)) / 86400000
  );
  return CITATIONS[dayOfYear % CITATIONS.length];
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
  },
  {
    id: "o2",
    domaineId: "d2",
    obj: "Lire 12 livres en 2026",
    action: "Choisir livre de Mars",
    score: 0,
  },
  {
    id: "o3",
    domaineId: "d3",
    obj: "Terminer 2 formations en ligne",
    action: "Choisir formation 1 cette semaine",
    score: 0,
  },
  {
    id: "o4",
    domaineId: "d4",
    obj: "Épargner X% de mes revenus",
    action: "Mettre en place virement automatique",
    score: 0,
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
  var children = p.children;
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
      {children}
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
        transition: "background .5s",
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
          transition: "background .5s",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: C.text,
              }}
            >
              Noa
            </span>
            <span
              style={{
                fontSize: 36,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: C.beige,
              }}
            >
              OS
            </span>
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

export default function App() {
  var [auth, setAuth] = useSynced("auth_v1", false);
  var [darkMode, setDarkMode] = useState(isDark());
  var [manualDark, setManualDark] = useState(null); // null = auto
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

  var alertes = taches.filter(function (t) {
    var retard =
      t.statut !== "Terminé" && t.echeance && new Date(t.echeance) < today;
    var urgent = t.statut !== "Terminé" && t.priorite === "Urgent";
    return retard || urgent;
  });
  var showBanner = alertes.length > 0 && bannerDismissed !== todayKey;

  function requestPermission() {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then(function (p) {
      setPermission(p);
    });
  }
  useEffect(
    function () {
      if (!("Notification" in window) || permission !== "granted") return;
      var timer;
      function schedule() {
        var now = new Date(),
          next = new Date();
        next.setHours(8, 30, 0, 0);
        if (now >= next) next.setDate(next.getDate() + 1);
        timer = setTimeout(function () {
          var r = taches.filter(function (t) {
            return (
              t.statut !== "Terminé" &&
              t.echeance &&
              new Date(t.echeance) < new Date()
            );
          });
          var u = taches.filter(function (t) {
            return t.statut !== "Terminé" && t.priorite === "Urgent";
          });
          var msgs = [];
          if (r.length) msgs.push(r.length + " tâche(s) en retard");
          if (u.length) msgs.push(u.length + " tâche(s) urgente(s)");
          if (msgs.length)
            new Notification("NosaOS", { body: msgs.join(" · ") });
          schedule();
        }, next - now);
      }
      schedule();
      return function () {
        clearTimeout(timer);
      };
    },
    [permission, taches]
  );

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
            ? Object.assign({}, form, { prevu: prevu, reel: reel })
            : r;
        });
        return nb;
      });
    else
      setBudget(function (b) {
        var nb = Object.assign({}, b);
        nb[sec] = b[sec].concat([
          { cat: form.cat.trim(), prevu: prevu, reel: reel, id: uid() },
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

  var TABS = [
    { id: "dashboard", label: "Accueil" },
    { id: "todo", label: "To Do" },
    { id: "habitudes", label: "Habitudes" },
    { id: "budget", label: "Budget" },
    { id: "vision", label: "Vision" },
    { id: "projets", label: "Projets" },
  ];
  var g2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  var g4 = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
    gap: 12,
  };

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
              gap: 32,
              position: "sticky",
              top: 0,
              zIndex: 20,
              transition: "background .4s",
            }}
          >
            <span
              style={{
                color: C.white,
                fontWeight: 900,
                fontSize: 16,
                letterSpacing: "-0.02em",
                padding: "16px 0",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Noa<span style={{ color: C.beige }}>OS</span>
            </span>
            <div style={{ display: "flex", flex: 1 }}>
              {TABS.map(function (t) {
                return (
                  <button
                    key={t.id}
                    onClick={function () {
                      setTab(t.id);
                    }}
                    style={{
                      padding: "16px 14px",
                      fontSize: 13,
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
                marginLeft: "auto",
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
              padding: "14px 18px",
              position: "sticky",
              top: 0,
              zIndex: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "background .4s",
            }}
          >
            <div>
              <div
                style={{
                  color: C.white,
                  fontWeight: 900,
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                }}
              >
                Noa<span style={{ color: C.beige }}>OS</span>
              </div>
              <div style={{ fontSize: 11, color: "#A8ABB0", marginTop: 1 }}>
                {today.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
            </div>
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
          </div>
        )}

        {/* Menu hamburger */}
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
                      padding: "14px 22px",
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
                    <span style={{ fontSize: 18 }}>{ICONS[t.id]}</span>
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

        {/* Bandeau alertes */}
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
          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <div>
              {!isMobile && (
                <div style={{ marginBottom: 20 }}>
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
                  <p style={{ color: C.textSec, fontSize: 13, marginTop: 4 }}>
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
                        style={{ fontSize: 11, color: C.textSec, marginTop: 3 }}
                      >
                        {k.sub}
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Card>
                  <SecTitle>Habitudes — progression mensuelle</SecTitle>
                  <ResponsiveContainer width="100%" height={150}>
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
                            "1px solid " + (C === DARK ? "#444" : "#E2DDD7"),
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Card>
                  <SecTitle>Tâches urgentes</SecTitle>
                  {taches.filter(function (t) {
                    return t.priorite === "Urgent" && t.statut !== "Terminé";
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
                            <span style={{ color: C.textSec }}>{p.prog}%</span>
                          </div>
                          <PBar pct={p.prog} color={C.beige} />
                        </div>
                      );
                    })}
                </Card>
              </div>

              <Card>
                <SecTitle>À faire aujourd'hui</SecTitle>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {taches
                    .filter(function (t) {
                      return t.statut !== "Terminé";
                    })
                    .slice(0, 5)
                    .map(function (t) {
                      return (
                        <div
                          key={t.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <button
                            onClick={function () {
                              toggleT(t.id);
                            }}
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 5,
                              border: "1.5px solid " + C.gray,
                              background: "transparent",
                              cursor: "pointer",
                              flexShrink: 0,
                              minWidth: 20,
                            }}
                          />
                          <span
                            style={{ fontSize: 13, flex: 1, color: C.text }}
                          >
                            {t.nom}
                          </span>
                          <Tag
                            label={t.priorite}
                            s={PRIORITE_STYLE[t.priorite]}
                          />
                        </div>
                      );
                    })}
                </div>
              </Card>
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
                        style={{ fontSize: 18, fontWeight: 700, color: C.text }}
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                          (late ? "#C4A08A" : C === DARK ? "#333" : "#E2DDD7"),
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
                            t.statut === "Terminé" ? C.green : "transparent",
                          cursor: "pointer",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 22,
                        }}
                      >
                        {t.statut === "Terminé" && (
                          <span style={{ color: "#fff", fontSize: 12 }}>✓</span>
                        )}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: t.statut === "Terminé" ? C.textSec : C.text,
                            textDecoration:
                              t.statut === "Terminé" ? "line-through" : "none",
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
                        style={{ fontSize: 20, fontWeight: 700, color: k.c }}
                      >
                        {k.v}
                      </div>
                    </Card>
                  );
                })}
              </div>
              {isMobile ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {habitudes.map(function (h) {
                    var v = moisData[h.id] || 0,
                      taux = Math.round((v / h.obj) * 100);
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
                            style={{ display: "flex", gap: 4, flexShrink: 0 }}
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
                    border: "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
                    overflow: "hidden",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: C.tableBg }}>
                        {[
                          "Habitude",
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
                        var v = moisData[h.id] || 0,
                          taux = Math.round((v / h.obj) * 100);
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
                            <td style={{ padding: "11px 14px", width: 120 }}>
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
                    var d = habitData[m] || {},
                      real = habitudes.reduce(function (s, h) {
                        return s + (d[h.id] || 0);
                      }, 0),
                      obj = habitudes.reduce(function (s, h) {
                        return s + h.obj;
                      }, 0),
                      pct =
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
                              "1px solid " + (C === DARK ? "#444" : "#E2DDD7"),
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
                                <span style={{ color: C.text }}>{d.name}</span>
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
                                totalDep > 0 ? (d.value / totalDep) * 100 : 0
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
                      border: "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
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
                              open("budget_" + sec.key, Object.assign({}, row));
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
                  marginBottom: 4,
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
                      open("domaine", { nom: "", color: DOMAINE_COLORS[0] });
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
                      });
                    }}
                    style={{ padding: "6px 10px", fontSize: 12 }}
                  >
                    + Objectif
                  </Btn>
                </div>
              </div>
              <p
                style={{
                  color: C.textSec,
                  fontSize: 12,
                  fontStyle: "italic",
                  marginBottom: 18,
                }}
              >
                « Ce que tu fais chaque jour compte plus que ce que tu fais de
                temps en temps. »
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
                      border: "1px solid " + (C === DARK ? "#333" : "#E2DDD7"),
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
                                  fontSize: 13,
                                  fontWeight: 500,
                                  marginBottom: 3,
                                  color: C.text,
                                }}
                              >
                                {o.obj}
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
                                  padding: "4px 6px",
                                  fontSize: 12,
                                  color: C.text,
                                  outline: "none",
                                  width: 50,
                                  textAlign: "center",
                                }}
                              />
                              <span style={{ fontSize: 11, color: C.textSec }}>
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
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
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
        </div>

        {/* ══ MODALS ══ */}
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
                style={{
                  background: C.tableBg,
                  border: "1px solid #D5D0CA",
                  borderRadius: 8,
                  padding: "7px 12px",
                  fontSize: 13,
                  color: C.text,
                  outline: "none",
                  flex: 1,
                }}
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
                style={{
                  background: C.tableBg,
                  border: "1px solid #D5D0CA",
                  borderRadius: 8,
                  padding: "7px 12px",
                  fontSize: 13,
                  color: C.text,
                  outline: "none",
                  flex: 1,
                }}
                value={form.debut || ""}
                onChange={function (e) {
                  f("debut", e.target.value);
                }}
              />
              <input
                type="date"
                style={{
                  background: C.tableBg,
                  border: "1px solid #D5D0CA",
                  borderRadius: 8,
                  padding: "7px 12px",
                  fontSize: 13,
                  color: C.text,
                  outline: "none",
                  flex: 1,
                }}
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
            <ModalFooter onClose={close} onSave={saveObjectif} />
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
      </div>
    </ThemeCtx.Provider>
  );
}
