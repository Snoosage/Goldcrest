import { useState, useCallback, useEffect, useRef } from "react";
import {
  Search, Users, MapPin, Shield, Scroll, BookOpen, Package, Clock,
  ChevronRight, X, Eye, Globe, ChevronDown, ChevronUp, Menu,
  LayoutDashboard, GitBranch, Crown, Heart, AlertCircle, Swords,
  Zap, Key, Check, ExternalLink, Loader2, WifiOff, Unplug, Settings
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type ViewId = "dashboard" | "characters" | "locations" | "factions" | "quests" | "journals" | "items" | "sessions";

// ── Mock Data ──────────────────────────────────────────────────────────────

const CHARACTERS = [
  { id: 1, name: "Seraphine Duskhollow", race: "Half-Elf", age: 34, role: "Arcane Investigator", faction: "The Amber Conclave", status: "active", tags: ["mage", "scholar", "neutral"], portrait: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&auto=format", location: "Goldcrest City", description: "A meticulous arcanist who catalogues anomalies in the ley-lines. She carries a grimoire bound in dragonhide and speaks only in precise, measured sentences.", affiliations: ["The Amber Conclave", "Royal Academy"], relationships: [{ name: "Vael Thornwick", type: "Ally" }, { name: "Brother Osric", type: "Mentor" }, { name: "Lord Draven", type: "Rival" }] },
  { id: 2, name: "Vael Thornwick", race: "Human", age: 29, role: "Rogue Operative", faction: "Hollow Blade", status: "active", tags: ["rogue", "spy", "lawful evil"], portrait: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=500&fit=crop&auto=format", location: "The Undercroft", description: "Former city guard turned information broker. His smile never reaches his eyes, and his debts are always paid in blood.", affiliations: ["Hollow Blade", "Goldcrest Guard (former)"], relationships: [{ name: "Seraphine Duskhollow", type: "Complicated" }, { name: "Lady Mireth", type: "Handler" }] },
  { id: 3, name: "Brother Osric Flame", race: "Dwarf", age: 201, role: "High Chaplain", faction: "The Cinder Temple", status: "active", tags: ["cleric", "elder", "fire domain"], portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format", location: "Cinder Temple", description: "Ancient keeper of the eternal forge-flame. He has outlived three kings and remembers the first dragon war.", affiliations: ["The Cinder Temple", "Council of Elders"], relationships: [{ name: "Seraphine Duskhollow", type: "Mentee" }, { name: "King Aldric IV", type: "Advisor" }] },
  { id: 4, name: "Lady Mireth Nox", race: "Tiefling", age: 41, role: "Spymaster", faction: "Crown Intelligence", status: "unknown", tags: ["intelligence", "noble", "manipulator"], portrait: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&auto=format", location: "Unknown", description: "The king's shadow. She has no official title, no official office, and no official enemies — which means everyone is her enemy.", affiliations: ["Crown Intelligence", "The Midnight Court"], relationships: [{ name: "Vael Thornwick", type: "Asset" }, { name: "Lord Draven", type: "Enemy" }] },
  { id: 5, name: "Lord Draven Ashveil", race: "Human", age: 55, role: "Warlord", faction: "The Iron Covenant", status: "hostile", tags: ["villain", "military", "ambitious"], portrait: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&auto=format", location: "Ashveil Keep", description: "A decorated general who believes peace is just a word for the space between wars. Currently consolidating power in the eastern territories.", affiliations: ["The Iron Covenant", "Ashveil Nobility"], relationships: [{ name: "King Aldric IV", type: "Rival" }, { name: "Lady Mireth Nox", type: "Enemy" }, { name: "Seraphine Duskhollow", type: "Target" }] },
  { id: 6, name: "King Aldric IV", race: "Human", age: 62, role: "Sovereign", faction: "The Crown", status: "active", tags: ["royalty", "political", "aging"], portrait: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&auto=format", location: "Royal Palace", description: "A weary king holding a fractured kingdom together through diplomacy and carefully measured strength. He knows more than he lets on.", affiliations: ["The Crown", "Council of Lords"], relationships: [{ name: "Brother Osric Flame", type: "Advisor" }, { name: "Lord Draven Ashveil", type: "Enemy" }] },
];

const LOCATIONS = [
  { id: 1, name: "Goldcrest City", type: "Capital", region: "The Heartlands", description: "A sprawling metropolis built atop ancient ley-line convergence points. Its golden spires catch light even on cloudy days.", npcs: ["Seraphine Duskhollow", "King Aldric IV", "Brother Osric Flame"], factions: ["The Amber Conclave", "Crown Intelligence", "City Watch"], tags: ["capital", "magical", "political"], image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&h=400&fit=crop&auto=format", lore: "Founded three centuries ago by Navigator-King Aldric I, who followed a golden bird to the ley-line nexus beneath what is now the palace district." },
  { id: 2, name: "The Undercroft", type: "Criminal District", region: "Goldcrest Underside", description: "A labyrinthine network of abandoned sewer channels, collapsed foundations, and illicit markets running beneath the city's wealthy quarter.", npcs: ["Vael Thornwick"], factions: ["Hollow Blade", "Thieves Compact"], tags: ["criminal", "underground", "dangerous"], image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=700&h=400&fit=crop&auto=format", lore: "Built by the original city engineers as a maintenance network, the Undercroft became habitable during the Second Siege." },
  { id: 3, name: "Ashveil Keep", type: "Fortress", region: "Eastern Marches", description: "A brutal stone fortress on a volcanic plateau. Every surface is scorched, every corridor designed to kill intruders.", npcs: ["Lord Draven Ashveil"], factions: ["The Iron Covenant"], tags: ["military", "fortress", "eastern"], image: "https://images.unsplash.com/photo-1481488894037-2b9310b9bd75?w=700&h=400&fit=crop&auto=format", lore: "Originally a border watchtower expanded over generations by each successive Ashveil lord." },
  { id: 4, name: "The Amber Spire", type: "Academy", region: "Goldcrest City", description: "The towering seat of the Amber Conclave, its highest floors wreathed in permanent arcane fog.", npcs: ["Seraphine Duskhollow"], factions: ["The Amber Conclave"], tags: ["arcane", "academy", "restricted"], image: "https://images.unsplash.com/photo-1520034475321-cbe63696469a?w=700&h=400&fit=crop&auto=format", lore: "The Spire was grown — not built — over the course of a decade using a slow-casting earth shaping ritual." },
];

const FACTIONS = [
  { id: 1, name: "The Amber Conclave", type: "Arcane Order", influence: 82, alignment: "Neutral Good", members: ["Seraphine Duskhollow", "Archmage Tivara", "12 senior mages"], allies: ["Royal Academy", "Crown Intelligence"], enemies: ["The Iron Covenant", "Hollow Blade"], description: "The kingdom's premier arcane institution. They maintain careful neutrality in political affairs while quietly shaping them through information.", color: "#c9a84c", icon: "✦" },
  { id: 2, name: "The Iron Covenant", type: "Military Faction", influence: 71, alignment: "Lawful Evil", members: ["Lord Draven Ashveil", "General Halveth", "Eastern Army (4,000)"], allies: ["Ashveil Nobility", "Mercenary Guilds"], enemies: ["The Amber Conclave", "Crown Intelligence"], description: "A coalition of eastern lords and hardened soldiers united under Draven's banner, seeking a stronger ruler for the kingdom.", color: "#8a5a5a", icon: "⚔" },
  { id: 3, name: "Hollow Blade", type: "Criminal Syndicate", influence: 58, alignment: "Chaotic Neutral", members: ["Vael Thornwick", "Unknown operatives"], allies: ["Various noble patrons"], enemies: ["City Watch", "The Cinder Temple"], description: "An information and assassination network operating through layers of cutouts. True leadership unknown even to most members.", color: "#6a8fb5", icon: "◆" },
  { id: 4, name: "The Cinder Temple", type: "Religious Order", influence: 65, alignment: "Lawful Neutral", members: ["Brother Osric Flame", "Chaplains (34)", "Temple Guard"], allies: ["Royal Court", "Forge Guilds"], enemies: ["Hollow Blade"], description: "Keepers of the eternal forge-flames, worshippers of the Ember God, holding significant sway over the city's craftwork guilds.", color: "#c4783a", icon: "🔥" },
];

const QUESTS = [
  { id: 1, title: "The Fracture Points", status: "active", priority: "critical", description: "Ley-line anomalies detected at seven points across the kingdom. Seraphine believes they are being artificially induced.", giver: "Seraphine Duskhollow", progress: 3, total: 7 },
  { id: 2, title: "Infiltrate Ashveil Keep", status: "active", priority: "high", description: "Obtain proof of Lord Draven's treaty violations with the eastern mercenary coalition.", giver: "Lady Mireth Nox", progress: 1, total: 4 },
  { id: 3, title: "The Lost Chaplain", status: "completed", priority: "medium", description: "Locate Brother Aldwin, junior chaplain of the Cinder Temple, missing three weeks.", giver: "Brother Osric Flame", progress: 3, total: 3 },
  { id: 4, title: "Silence in the Undercroft", status: "active", priority: "high", description: "Three Hollow Blade informants have gone silent simultaneously. Find out why.", giver: "Vael Thornwick", progress: 0, total: 5 },
];

const SESSIONS = [
  { id: 1, number: 12, title: "The Golden Spire Incident", date: "2025-05-10", summary: "The party uncovered evidence of ley-line tampering beneath the Amber Conclave's east tower. Seraphine was visibly shaken. A strange sigil was found burned into the stones — matching Draven's house crest.", highlights: ["First ley-line fracture discovered", "Vael's true allegiance questioned", "Seraphine revealed her personal connection to the anomalies"], xp: 650 },
  { id: 2, number: 11, title: "The Undercroft Meeting", date: "2025-04-26", summary: "Contact with Hollow Blade operative Yessa went sideways. She provided partial intelligence on Draven before the meeting was ambushed by unknown assailants.", highlights: ["Yessa killed before full debrief", "Recovered coded ledger", "City Watch arrived suspiciously fast"], xp: 500 },
  { id: 3, number: 10, title: "Audience with the Chaplain", date: "2025-04-12", summary: "Brother Osric revealed the Cinder Temple holds one of the seven binding stones that stabilize the ley-line network. He agreed to a temporary alliance.", highlights: ["Binding stone location confirmed", "Temple alliance formed", "Osric's 200-year history with ley-lines revealed"], xp: 400 },
];

const TIMELINE = [
  { date: "Day 1", event: "Ley-line anomaly first detected", type: "discovery" },
  { date: "Day 8", event: "First meeting with Seraphine Duskhollow", type: "npc" },
  { date: "Day 15", event: "Undercroft infiltration", type: "mission" },
  { date: "Day 23", event: "Cinder Temple alliance formed", type: "alliance" },
  { date: "Day 31", event: "Golden Spire incident — Draven sigil found", type: "critical" },
  { date: "Day 38", event: "Second fracture point confirmed", type: "discovery" },
  { date: "Day 45 · Now", event: "Party investigating Ashveil Keep", type: "current" },
];

const ITEMS = [
  { id: 1, name: "Grimoire of Ley-Cartography", type: "Arcane Tome", rarity: "Rare", description: "A living map that updates when ley-lines shift. Currently shows 3 fracture points marked in red.", owner: "Seraphine Duskhollow", tags: ["magic", "map", "arcane"] },
  { id: 2, name: "Ashveil Sigil Fragment", type: "Evidence", rarity: "Common", description: "Stone fragment bearing the Ashveil crest, found burned into the Conclave basement. Links Draven to ley-line tampering.", owner: "Party", tags: ["evidence", "plot", "draven"] },
  { id: 3, name: "Hollow Blade Coded Ledger", type: "Intelligence", rarity: "Uncommon", description: "Encrypted ledger from the ambushed Undercroft meeting. Partially decoded — mentions 'the seventh stone'.", owner: "Party", tags: ["intelligence", "mystery"] },
  { id: 4, name: "Cinder Temple Passage Seal", type: "Key Item", rarity: "Uncommon", description: "Bronze seal granting safe passage through all Cinder Temple properties. Gift from Brother Osric.", owner: "Party", tags: ["key", "temple", "alliance"] },
];

const JOURNALS = [
  { id: 1, title: "The Fracture Hypothesis", author: "Seraphine Duskhollow", date: "Day 40", excerpt: "If the ley-lines are being artificially stressed at precise intervals, there must be a purpose. Resonance collapse? Power extraction? The binding stones are the key..." },
  { id: 2, title: "Undercroft Surveillance Log", author: "Vael Thornwick", date: "Day 36–44", excerpt: "Six exchanges observed at the Red Lamp tavern. Same contact each time — never shows their face. Drops a package, collects a package. Military cadence. Eastern accent." },
  { id: 3, title: "Temple Archives — First Dragon War", author: "Brother Osric Flame", date: "Ancient text, transcribed Day 43", excerpt: "Seven stones were placed at the nexus points to prevent ley-line overflow. Should even one be removed during an unstable period, the consequences would be..." },
  { id: 4, title: "Throne Room Observations", author: "Anonymous", date: "Day 39", excerpt: "The king knows more than he lets on. He flinched at the mention of the Ashveil name. His hands betrayed him. There is a history there — one that could be weaponized." },
  { id: 5, title: "Notes on the Hollow Blade", author: "Lady Mireth Nox", date: "Day 20", excerpt: "Their cell structure is elegant. No single operative knows more than one handler. To destroy Hollow Blade you would need to find its root — and I believe the root is closer to the crown than anyone suspects." },
  { id: 6, title: "Field Report — Session XII", author: "Party Record", date: "Day 45", excerpt: "The east tower basement contained evidence far beyond what we expected. Whoever placed that sigil wanted it found. This feels like a trap set three steps ahead of us." },
];

// ── Utility Components ─────────────────────────────────────────────────────

const GoldDivider = () => (
  <div className="flex items-center gap-3 my-4">
    <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.4))" }} />
    <div className="w-1.5 h-1.5 rotate-45 bg-[#c9a84c] opacity-60" />
    <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(201,168,76,0.4))" }} />
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: "Active", color: "#5a8a6a" },
    completed: { label: "Completed", color: "#6a8fb5" },
    hostile: { label: "Hostile", color: "#8a5a5a" },
    unknown: { label: "Unknown", color: "#8a7d6a" },
    critical: { label: "Critical", color: "#c9a84c" },
    high: { label: "High", color: "#c4783a" },
    medium: { label: "Medium", color: "#6a8fb5" },
  };
  const cfg = map[status] || { label: status, color: "#8a7d6a" };
  return (
    <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm border"
      style={{ color: cfg.color, borderColor: `${cfg.color}44`, background: `${cfg.color}18` }}>
      {cfg.label}
    </span>
  );
};

const RarityBadge = ({ rarity }: { rarity: string }) => {
  const map: Record<string, string> = { Common: "#8a7d6a", Uncommon: "#5a8a6a", Rare: "#6a8fb5", Legendary: "#c9a84c" };
  const color = map[rarity] || "#8a7d6a";
  return (
    <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm border"
      style={{ color, borderColor: `${color}44`, background: `${color}18` }}>{rarity}</span>
  );
};

const Tag = ({ label }: { label: string }) => (
  <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded-sm"
    style={{ color: "#8a7d6a", background: "rgba(138,125,106,0.12)", border: "1px solid rgba(138,125,106,0.2)" }}>
    {label}
  </span>
);

const InfluenceBar = ({ value }: { value: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(201,168,76,0.12)" }}>
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: "linear-gradient(to right, #c9a84c88, #c9a84c)" }} />
    </div>
    <span className="text-[10px] font-mono text-[#c9a84c]">{value}</span>
  </div>
);

const CollapsibleSection = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-sm" style={{ borderColor: "rgba(201,168,76,0.18)" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[rgba(201,168,76,0.05)]">
        <span className="text-xs font-mono tracking-widest uppercase text-[#c9a84c]">{title}</span>
        {open ? <ChevronUp size={14} className="text-[#8a7d6a]" /> : <ChevronDown size={14} className="text-[#8a7d6a]" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

// ── Kanka API helpers ──────────────────────────────────────────────────────

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
}

// Relative path — routed through the Figma Make proxy to the Edge Function
const KANKA_BASE = "/kanka-proxy";
const DEFAULT_CAMPAIGN_ID = "320428";

async function kankaFetch(token: string, path: string) {
  const res = await fetch(`${KANKA_BASE}${path}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Kanka ${res.status}: ${res.statusText}`);
  return res.json();
}

// ── Kanka Settings Modal ───────────────────────────────────────────────────

type KankaStatus = "idle" | "testing" | "success" | "error";

const KankaSettingsModal = ({
  onClose, onConnected,
}: {
  onClose: () => void;
  onConnected: (token: string, campaignId: string, campaignName: string) => void;
}) => {
  const [campaignId, setCampaignId] = useState(() => localStorage.getItem("kanka_campaign_id") || "");
  const [token, setTokenState] = useState(() => localStorage.getItem("kanka_token") || "");
  const [status, setStatus] = useState<KankaStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [campaigns, setCampaigns] = useState<{ id: number; name: string }[]>([]);

  // Fetch campaign list when a token is available
  const fetchCampaigns = async (t: string) => {
    if (!t) return;
    try {
      const data = await kankaFetch(t, "/campaigns");
      setCampaigns(data.data || []);
    } catch {
      setCampaigns([]);
    }
  };

  useEffect(() => { fetchCampaigns(token); }, [token]);

  const handleConnect = async () => {
    if (!campaignId || !token) return;
    setStatus("testing");
    setErrorMsg("");
    try {
      const data = await kankaFetch(token, `/campaigns/${campaignId}/characters?limit=100`);
      if (!data.data) throw new Error("Unexpected response from Kanka.");
      const camp = campaigns.find(c => String(c.id) === String(campaignId));
      localStorage.setItem("kanka_campaign_id", campaignId);
      localStorage.setItem("kanka_token", token);
      setStatus("success");
      setTimeout(() => {
        onConnected(token, campaignId, camp?.name || `Campaign ${campaignId}`);
        onClose();
      }, 900);
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Connection failed. Check your campaign ID.");
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("kanka_campaign_id");
    localStorage.removeItem("kanka_token");
    setCampaignId("");
    setTokenState("");
    setCampaigns([]);
    setStatus("idle");
  };

  const isConnected = status === "success";
  const isTesting = status === "testing";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-md rounded-sm border"
        style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.3)", boxShadow: "0 24px 60px rgba(0,0,0,0.7)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-sm flex items-center justify-center" style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)" }}>
              <Key size={13} className="text-[#c9a84c]" />
            </div>
            <div>
              <div className="text-sm font-[Cinzel] text-[#e8dcc8] tracking-wide">Kanka API Connection</div>
              <div className="text-[10px] font-mono text-[#5a5244] tracking-wider">app.kanka.io → Profile → API</div>
            </div>
          </div>
          <button onClick={onClose}><X size={15} className="text-[#5a5244] hover:text-[#c9a84c] transition-colors" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] block mb-2">
              Kanka API Token <span className="text-[#5a5244] normal-case tracking-normal">— app.kanka.io → Profile → API</span>
            </label>
            <input
              type="password"
              value={token}
              onChange={e => { setTokenState(e.target.value); fetchCampaigns(e.target.value); }}
              placeholder="Paste your Kanka API token here"
              className="w-full px-3 py-2.5 rounded-sm border text-sm font-mono text-[#e8dcc8] outline-none transition-all"
              style={{ background: "#0d1117", borderColor: token ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.15)", color: "#e8dcc8" }}
            />
          </div>

          <div>
            <label className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] block mb-2">
              Campaign {campaigns.length > 0 && <span className="text-[#5a5244] normal-case tracking-normal">— pick one or enter ID</span>}
            </label>
            <input
              type="text"
              value={campaignId}
              onChange={e => setCampaignId(e.target.value)}
              placeholder="Campaign ID, e.g. 123456"
              className="w-full px-3 py-2.5 rounded-sm border text-sm font-mono text-[#e8dcc8] outline-none transition-all"
              style={{ background: "#0a0f16", borderColor: "rgba(201,168,76,0.2)", caretColor: "#c9a84c" }}
              onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
            />
            <div className="text-[10px] font-mono text-[#5a5244] mt-1">
              Found in your campaign URL: app.kanka.io/campaign/<span className="text-[#8a7d6a]">123456</span>/…
            </div>
          </div>

          {/* Campaign picker from API */}
          {campaigns.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-[#5a8a6a] tracking-widest uppercase">
                ✓ Token valid — {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} found
              </div>
              {campaigns.map(c => (
                <button key={c.id} onClick={() => setCampaignId(String(c.id))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-sm border text-left transition-all"
                  style={{
                    background: String(campaignId) === String(c.id) ? "rgba(201,168,76,0.1)" : "#0a0f16",
                    borderColor: String(campaignId) === String(c.id) ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.12)",
                  }}>
                  <span className="text-xs font-[Crimson_Pro] text-[#e8dcc8]">{c.name}</span>
                  <span className="text-[10px] font-mono text-[#5a5244]">#{c.id}</span>
                </button>
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-2 p-3 rounded-sm border" style={{ background: "rgba(138,90,90,0.1)", borderColor: "rgba(138,90,90,0.3)" }}>
              <WifiOff size={13} className="text-[#8a5a5a] shrink-0 mt-0.5" />
              <span className="text-xs font-[Crimson_Pro] text-[#c09090]">{errorMsg}</span>
            </div>
          )}

          <div className="p-3 rounded-sm border" style={{ background: "#0a0f16", borderColor: "rgba(201,168,76,0.1)" }}>
            <div className="text-[10px] font-mono text-[#5a5244] tracking-widest uppercase mb-2">Finding your Campaign ID</div>
            <p className="text-xs font-[Crimson_Pro] text-[#8a7d6a]">
              Open your campaign at app.kanka.io — the number in the URL is your campaign ID.<br />
              e.g. app.kanka.io/campaign/<span className="text-[#c9a84c]">123456</span>/dashboard
            </p>
            <a href="https://app.kanka.io" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 mt-3 text-[10px] font-mono text-[#c9a84c] hover:underline">
              <ExternalLink size={10} /> Open Kanka
            </a>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
          {localStorage.getItem("kanka_token") && (
            <button onClick={handleDisconnect}
              className="px-3 py-2 rounded-sm border text-xs font-mono text-[#8a5a5a] hover:text-[#c09090] transition-colors flex items-center gap-1.5"
              style={{ borderColor: "rgba(138,90,90,0.25)" }}>
              <Unplug size={11} /> Disconnect
            </button>
          )}
          <button onClick={onClose}
            className="flex-1 py-2 rounded-sm border text-xs font-mono text-[#8a7d6a] hover:text-[#e8dcc8] transition-colors"
            style={{ borderColor: "rgba(201,168,76,0.15)" }}>
            Cancel
          </button>
          <button onClick={handleConnect} disabled={!campaignId || isTesting}
            className="flex-1 py-2 rounded-sm text-xs font-mono flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{
              background: isConnected ? "rgba(90,138,106,0.2)" : "rgba(201,168,76,0.15)",
              color: isConnected ? "#5a8a6a" : "#c9a84c",
              border: `1px solid ${isConnected ? "rgba(90,138,106,0.4)" : "rgba(201,168,76,0.3)"}`,
            }}>
            {isTesting ? <><Loader2 size={12} className="animate-spin" /> Connecting…</>
              : isConnected ? <><Check size={12} /> Connected!</>
              : "Connect & Load"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Search Bar ─────────────────────────────────────────────────────────────

const SearchBar = ({ onNavigate }: { onNavigate: (v: ViewId) => void }) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const all = [
    ...CHARACTERS.map(c => ({ type: "Character", name: c.name, sub: `${c.race} · ${c.role}`, view: "characters" as ViewId })),
    ...LOCATIONS.map(l => ({ type: "Location", name: l.name, sub: `${l.type} · ${l.region}`, view: "locations" as ViewId })),
    ...FACTIONS.map(f => ({ type: "Faction", name: f.name, sub: f.type, view: "factions" as ViewId })),
    ...QUESTS.map(q => ({ type: "Quest", name: q.title, sub: q.status, view: "quests" as ViewId })),
    ...ITEMS.map(i => ({ type: "Item", name: i.name, sub: i.type, view: "items" as ViewId })),
    ...JOURNALS.map(j => ({ type: "Journal", name: j.title, sub: j.author, view: "journals" as ViewId })),
  ];

  const results = query.length > 1 ? all.filter(r => r.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];
  const typeIcon: Record<string, React.ReactNode> = {
    Character: <Users size={12} />, Location: <MapPin size={12} />, Faction: <Shield size={12} />,
    Quest: <Scroll size={12} />, Item: <Package size={12} />, Journal: <BookOpen size={12} />,
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-center gap-2 px-3 py-2 rounded-sm border transition-all"
        style={{
          background: "rgba(26,36,51,0.8)",
          borderColor: focused ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.2)",
          boxShadow: focused ? "0 0 0 2px rgba(201,168,76,0.1), 0 4px 20px rgba(0,0,0,0.4)" : "none",
        }}>
        <Search size={14} className="text-[#8a7d6a] shrink-0" />
        <input value={query} onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search characters, locations, factions, quests…"
          className="flex-1 bg-transparent text-sm text-[#e8dcc8] placeholder-[#5a5244] outline-none font-[Crimson_Pro] tracking-wide" />
        {query
          ? <button onClick={() => setQuery("")}><X size={12} className="text-[#8a7d6a] hover:text-[#c9a84c] transition-colors" /></button>
          : <span className="text-[10px] font-mono text-[#5a5244] border rounded px-1" style={{ borderColor: "rgba(138,125,106,0.2)" }}>⌘K</span>}
      </div>
      {results.length > 0 && focused && (
        <div className="absolute top-full mt-1 w-full z-50 rounded-sm border overflow-hidden"
          style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.25)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}>
          {results.map((r, i) => (
            <button key={i} onClick={() => { onNavigate(r.view); setQuery(""); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[rgba(201,168,76,0.07)] border-b last:border-b-0"
              style={{ borderColor: "rgba(201,168,76,0.1)" }}>
              <span className="text-[#c9a84c] opacity-70">{typeIcon[r.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#e8dcc8] font-[Crimson_Pro] truncate">{r.name}</div>
                <div className="text-[10px] font-mono text-[#8a7d6a] tracking-wider uppercase">{r.type} · {r.sub}</div>
              </div>
              <ChevronRight size={12} className="text-[#5a5244] shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────────────

const NAV: { id: ViewId; label: string; icon: React.ReactNode; count: number }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} />, count: 0 },
  { id: "characters", label: "Characters", icon: <Users size={15} />, count: CHARACTERS.length },
  { id: "locations", label: "Locations", icon: <MapPin size={15} />, count: LOCATIONS.length },
  { id: "factions", label: "Organisations", icon: <Shield size={15} />, count: FACTIONS.length },
  { id: "quests", label: "Quests", icon: <Scroll size={15} />, count: QUESTS.length },
  { id: "journals", label: "Journals", icon: <BookOpen size={15} />, count: JOURNALS.length },
  { id: "items", label: "Items", icon: <Package size={15} />, count: ITEMS.length },
  { id: "sessions", label: "Session History", icon: <Clock size={15} />, count: SESSIONS.length },
];

const Sidebar = ({ view, onNavigate, collapsed, setCollapsed, onSettings, onSync, syncing, lastSynced }: {
  view: ViewId; onNavigate: (v: ViewId) => void; collapsed: boolean;
  setCollapsed: (v: boolean) => void; onSettings: () => void;
  onSync: () => void; syncing: boolean; lastSynced: string | null;
}) => (
  <aside className="flex flex-col h-full transition-all duration-300 shrink-0"
    style={{ width: collapsed ? "56px" : "220px", background: "linear-gradient(180deg,#0a0f16,#0d1320)", borderRight: "1px solid rgba(201,168,76,0.12)" }}>
    <div className="flex items-center gap-2.5 px-4 py-5 border-b" style={{ borderColor: "rgba(201,168,76,0.12)" }}>
      <div className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0"
        style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.35)" }}>
        <Crown size={14} className="text-[#c9a84c]" />
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <div className="text-xs font-[Cinzel] font-semibold text-[#c9a84c] tracking-wider truncate">Goldcrest</div>
          <div className="text-[9px] font-mono text-[#5a5244] tracking-widest uppercase">Archive · Demo</div>
        </div>
      )}
      <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-[#5a5244] hover:text-[#c9a84c] transition-colors shrink-0">
        <Menu size={14} />
      </button>
    </div>

    <nav className="flex-1 py-3 overflow-y-auto">
      {NAV.map(item => (
        <button key={item.id} onClick={() => onNavigate(item.id)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 group relative"
          style={{ color: view === item.id ? "#c9a84c" : "#8a7d6a", background: view === item.id ? "rgba(201,168,76,0.08)" : "transparent" }}>
          {view === item.id && <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r-full bg-[#c9a84c]" />}
          <span className="shrink-0 group-hover:text-[#c9a84c] transition-colors">{item.icon}</span>
          {!collapsed && (
            <>
              <span className="flex-1 text-xs font-[Cinzel] tracking-wide truncate group-hover:text-[#c9a84c] transition-colors">{item.label}</span>
              {item.count > 0 && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm shrink-0"
                  style={{ color: "#5a5244", background: "rgba(138,125,106,0.12)", border: "1px solid rgba(138,125,106,0.15)" }}>
                  {item.count}
                </span>
              )}
            </>
          )}
        </button>
      ))}
    </nav>

    <div className="border-t px-3 py-3 space-y-1" style={{ borderColor: "rgba(201,168,76,0.08)" }}>
      <button onClick={onSync} disabled={syncing}
        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-sm transition-all group hover:bg-[rgba(201,168,76,0.07)] disabled:opacity-50">
        <Loader2 size={13} className={`text-[#5a8a6a] shrink-0 ${syncing ? "animate-spin" : ""}`} />
        {!collapsed && <div className="flex flex-col items-start">
          <span className="text-[10px] font-mono text-[#5a8a6a] group-hover:text-[#7ab58a] transition-colors tracking-wider">{syncing ? "Syncing…" : "Sync from Kanka"}</span>
          {lastSynced && <span className="text-[9px] font-mono text-[#3a3530]">{lastSynced}</span>}
        </div>}
      </button>
      <button onClick={onSettings}
        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-sm transition-all group hover:bg-[rgba(201,168,76,0.07)]">
        <Settings size={13} className="text-[#5a5244] group-hover:text-[#c9a84c] transition-colors shrink-0" />
        {!collapsed && <span className="text-[10px] font-mono text-[#5a5244] group-hover:text-[#c9a84c] transition-colors tracking-wider">API Settings</span>}
      </button>
    </div>
  </aside>
);

// ── Dashboard ──────────────────────────────────────────────────────────────

const Dashboard = ({ onNavigate }: { onNavigate: (v: ViewId) => void }) => (
  <div className="p-8 max-w-[1400px] mx-auto">
    <div className="mb-8">
      <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 01 — Overview</div>
      <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Campaign Dashboard</h1>
      <p className="text-sm font-[Crimson_Pro] text-[#8a7d6a] mt-1">Day 45 of the Chronicle · Session XII · Demo Data</p>
    </div>
    <GoldDivider />

    <div className="grid grid-cols-4 gap-4 mb-8">
      {[
        { label: "Active Quests", value: "3", icon: <Scroll size={16} />, sub: "+1 this session", view: "quests" as ViewId },
        { label: "Known NPCs", value: "6", icon: <Users size={16} />, sub: "2 hostile", view: "characters" as ViewId },
        { label: "Factions", value: "4", icon: <Shield size={16} />, sub: "1 allied", view: "factions" as ViewId },
        { label: "Sessions Played", value: "12", icon: <Clock size={16} />, sub: "~26hr total", view: "sessions" as ViewId },
      ].map((s, i) => (
        <button key={i} onClick={() => onNavigate(s.view)}
          className="rounded-sm border p-4 relative overflow-hidden text-left group transition-all hover:border-[rgba(201,168,76,0.35)] hover:-translate-y-0.5"
          style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
          <div className="absolute top-0 right-0 w-16 h-16 opacity-5" style={{ background: "radial-gradient(circle,#c9a84c,transparent 70%)" }} />
          <span className="text-[#c9a84c] opacity-70 block mb-3 group-hover:opacity-100 transition-opacity">{s.icon}</span>
          <div className="text-2xl font-[Cinzel] font-semibold text-[#e8dcc8] mb-1">{s.value}</div>
          <div className="text-[11px] font-mono text-[#8a7d6a] tracking-wide uppercase">{s.label}</div>
          <div className="text-[10px] font-[Crimson_Pro] text-[#5a5244] mt-1">{s.sub}</div>
        </button>
      ))}
    </div>

    <div className="grid grid-cols-12 gap-6">
      {/* Recent Activity */}
      <div className="col-span-5">
        <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-3">Recent Activity</div>
        <div className="space-y-2">
          {[
            { icon: <AlertCircle size={12} />, text: "Ley-line fracture detected at the Eastern Gate", time: "Day 45" },
            { icon: <Eye size={12} />, text: "Vael observed meeting an unknown contact at the docks", time: "Day 44" },
            { icon: <Heart size={12} />, text: "Temple alliance confirmed by Brother Osric", time: "Day 43" },
            { icon: <Swords size={12} />, text: "Hollow Blade operative found dead — Undercroft passage C", time: "Day 42" },
            { icon: <Zap size={12} />, text: "Party gained access to Conclave restricted archives", time: "Day 40" },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-sm border transition-colors hover:bg-[rgba(201,168,76,0.04)]"
              style={{ background: "#0f1520", borderColor: "rgba(201,168,76,0.1)" }}>
              <span className="text-[#c9a84c] opacity-60 mt-0.5 shrink-0">{a.icon}</span>
              <span className="flex-1 text-xs font-[Crimson_Pro] text-[#b0a090] leading-relaxed">{a.text}</span>
              <span className="text-[10px] font-mono text-[#5a5244] shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key NPCs */}
      <div className="col-span-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c]">Key NPCs</div>
          <button onClick={() => onNavigate("characters")} className="text-[10px] font-mono text-[#5a5244] hover:text-[#c9a84c] transition-colors flex items-center gap-1">All <ChevronRight size={10} /></button>
        </div>
        <div className="space-y-2">
          {CHARACTERS.slice(0, 5).map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-sm border transition-all hover:border-[rgba(201,168,76,0.35)]"
              style={{ background: "#0f1520", borderColor: "rgba(201,168,76,0.1)" }}>
              <div className="w-8 h-8 rounded-sm overflow-hidden shrink-0 bg-[#1a2433]">
                <img src={c.portrait} alt={c.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-[Cinzel] text-[#e8dcc8] truncate">{c.name}</div>
                <div className="text-[10px] font-mono text-[#8a7d6a] tracking-wide">{c.race}</div>
              </div>
              <StatusBadge status={c.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Active Quests */}
      <div className="col-span-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c]">Active Quests</div>
          <button onClick={() => onNavigate("quests")} className="text-[10px] font-mono text-[#5a5244] hover:text-[#c9a84c] transition-colors flex items-center gap-1">All <ChevronRight size={10} /></button>
        </div>
        <div className="space-y-2">
          {QUESTS.filter(q => q.status === "active").map(q => (
            <div key={q.id} className="p-3 rounded-sm border" style={{ background: "#0f1520", borderColor: "rgba(201,168,76,0.1)" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-xs font-[Crimson_Pro] text-[#e8dcc8] leading-snug">{q.title}</div>
                <StatusBadge status={q.priority} />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.12)" }}>
                  <div className="h-full rounded-full bg-[#c9a84c]" style={{ width: `${(q.progress / q.total) * 100}%` }} />
                </div>
                <span className="text-[10px] font-mono text-[#8a7d6a]">{q.progress}/{q.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <GoldDivider />

    {/* Faction Matrix */}
    <div className="mt-4">
      <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-4">Faction Relations</div>
      <div className="grid grid-cols-4 gap-3">
        {FACTIONS.map(f => (
          <div key={f.id} className="p-4 rounded-sm border"
            style={{ background: "#0f1520", borderColor: `${f.color}28`, borderLeftWidth: "3px", borderLeftColor: f.color }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: f.color }}>{f.icon}</span>
              <div className="text-xs font-[Cinzel] text-[#e8dcc8] truncate">{f.name}</div>
            </div>
            <div className="text-[9px] font-mono text-[#8a7d6a] tracking-widest uppercase mb-2">{f.type}</div>
            <InfluenceBar value={f.influence} />
          </div>
        ))}
      </div>
    </div>

    {/* Timeline */}
    <div className="mt-8">
      <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-4">Campaign Timeline</div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, rgba(201,168,76,0.4), rgba(201,168,76,0.05))" }} />
        <div className="space-y-3 pl-6">
          {TIMELINE.map((e, i) => {
            const tc: Record<string, string> = { discovery: "#6a8fb5", npc: "#7a5c8a", mission: "#c4783a", alliance: "#5a8a6a", critical: "#c9a84c", current: "#e8dcc8" };
            const color = tc[e.type] || "#8a7d6a";
            return (
              <div key={i} className="relative flex items-start gap-3">
                <div className="absolute -left-[25px] top-1.5 w-1.5 h-1.5 rounded-full border"
                  style={{ borderColor: color, background: e.type === "current" ? color : "transparent" }} />
                <div className="text-[10px] font-mono text-[#5a5244] w-24 shrink-0 pt-0.5">{e.date}</div>
                <div className="text-xs font-[Crimson_Pro] tracking-wide" style={{ color: e.type === "current" ? "#e8dcc8" : "#b0a090" }}>
                  {e.event}
                  {e.type === "current" && <span className="ml-2 text-[9px] font-mono text-[#c9a84c] uppercase tracking-widest">← Now</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

// ── Characters ─────────────────────────────────────────────────────────────

const CharactersView = () => {
  const [selected, setSelected] = useState<typeof CHARACTERS[0] | null>(null);

  if (selected) return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-xs font-mono text-[#8a7d6a] hover:text-[#c9a84c] transition-colors mb-6 group">
        <ChevronRight size={12} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" /> Back to Characters
      </button>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "3/4" }}>
            <img src={selected.portrait} alt={selected.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#131a24 0%,transparent 60%)" }} />
            <div className="absolute bottom-4 left-4"><StatusBadge status={selected.status} /></div>
          </div>
          <div className="mt-4 space-y-3">
            <CollapsibleSection title="Tags">
              <div className="flex flex-wrap gap-1.5 pt-1">{selected.tags.map(t => <Tag key={t} label={t} />)}</div>
            </CollapsibleSection>
            <CollapsibleSection title="Affiliations">
              <div className="space-y-2 pt-1">
                {selected.affiliations.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#c9a84c] opacity-60 shrink-0" />
                    <span className="text-xs font-[Crimson_Pro] text-[#b0a090]">{a}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>
        </div>
        <div className="col-span-8 space-y-5">
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">Character Profile</div>
            <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide mb-2">{selected.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-[#8a7d6a] tracking-wider">
              <span>Race: <span className="text-[#b0a090]">{selected.race}</span></span>
              <span>·</span>
              <span>Age: <span className="text-[#b0a090]">{selected.age}</span></span>
              <span>·</span>
              <span>Location: <span className="text-[#b0a090]">{selected.location}</span></span>
            </div>
          </div>
          <GoldDivider />
          <CollapsibleSection title="Background & Description">
            <p className="text-sm font-[Crimson_Pro] text-[#c0b09a] leading-relaxed tracking-wide pt-1">{selected.description}</p>
          </CollapsibleSection>
          <CollapsibleSection title="Relationships">
            <div className="grid grid-cols-2 gap-2 pt-1">
              {selected.relationships.map((r, i) => {
                const tc: Record<string, string> = { Ally: "#5a8a6a", Enemy: "#8a5a5a", Rival: "#c4783a", Mentor: "#6a8fb5", Mentee: "#7a5c8a", Handler: "#c9a84c", Asset: "#8a7d6a", Complicated: "#7a5c8a", Target: "#8a5a5a" };
                const color = tc[r.type] || "#8a7d6a";
                return (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-sm border"
                    style={{ background: "#0f1520", borderColor: `${color}28` }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-[Cinzel] text-[#e8dcc8] truncate">{r.name}</div>
                      <div className="text-[10px] font-mono tracking-wide" style={{ color }}>{r.type}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 02 — Codex</div>
        <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Characters</h1>
      </div>
      <GoldDivider />
      <div className="grid grid-cols-3 gap-5 mt-6">
        {CHARACTERS.map(c => (
          <div key={c.id} onClick={() => setSelected(c)}
            className="group cursor-pointer rounded-sm border overflow-hidden transition-all duration-200 hover:border-[rgba(201,168,76,0.4)] hover:-translate-y-0.5"
            style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
            <div className="relative h-48 bg-[#0f1520] overflow-hidden">
              <img src={c.portrait} alt={c.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-300" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#131a24 0%,rgba(19,26,36,0.4) 60%,transparent 100%)" }} />
              <div className="absolute bottom-3 left-3"><StatusBadge status={c.status} /></div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"><Eye size={14} className="text-[#c9a84c]" /></div>
            </div>
            <div className="p-4">
              <h3 className="text-base font-[Cinzel] text-[#e8dcc8] mb-1 tracking-wide">{c.name}</h3>
              <div className="text-[11px] font-mono text-[#8a7d6a] tracking-wider mb-2">{c.race} · {c.role}</div>
              <p className="text-xs font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed line-clamp-2 mb-3">{c.description}</p>
              <div className="flex flex-wrap gap-1">{c.tags.map(t => <Tag key={t} label={t} />)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Locations ──────────────────────────────────────────────────────────────

const LocationsView = () => {
  const [selected, setSelected] = useState<typeof LOCATIONS[0] | null>(null);

  if (selected) return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-xs font-mono text-[#8a7d6a] hover:text-[#c9a84c] transition-colors mb-6 group">
        <ChevronRight size={12} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" /> Back to Locations
      </button>
      <div className="relative h-64 rounded-sm overflow-hidden mb-6 bg-[#0f1520]">
        <img src={selected.image} alt={selected.name} className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#0d1117,rgba(13,17,23,0.3) 60%,transparent)" }} />
        <div className="absolute bottom-6 left-6">
          <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">{selected.type} · {selected.region}</div>
          <h1 className="text-4xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">{selected.name}</h1>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          <CollapsibleSection title="Description">
            <p className="text-sm font-[Crimson_Pro] text-[#c0b09a] leading-relaxed tracking-wide pt-1">{selected.description}</p>
          </CollapsibleSection>
          <CollapsibleSection title="Lore">
            <p className="text-sm font-[Crimson_Pro] text-[#c0b09a] leading-relaxed tracking-wide pt-1 italic">{selected.lore}</p>
          </CollapsibleSection>
          <CollapsibleSection title="Map Section" defaultOpen={false}>
            <div className="mt-2 h-44 rounded-sm border flex items-center justify-center"
              style={{ background: "#0f1520", borderColor: "rgba(201,168,76,0.12)" }}>
              <div className="text-center"><Globe size={24} className="text-[#5a5244] mx-auto mb-2" />
                <div className="text-xs font-mono text-[#5a5244]">Connect Kanka to load maps</div>
              </div>
            </div>
          </CollapsibleSection>
        </div>
        <div className="space-y-4">
          <CollapsibleSection title="Known NPCs">
            <div className="space-y-2 pt-1">
              {selected.npcs.map((n, i) => {
                const char = CHARACTERS.find(c => c.name === n);
                return (
                  <div key={i} className="flex items-center gap-2.5 p-2 rounded-sm border" style={{ background: "#0f1520", borderColor: "rgba(201,168,76,0.1)" }}>
                    {char && <img src={char.portrait} alt={n} className="w-6 h-6 rounded-sm object-cover" />}
                    <span className="text-xs font-[Crimson_Pro] text-[#b0a090]">{n}</span>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
          <CollapsibleSection title="Factions Present">
            <div className="space-y-2 pt-1">
              {selected.factions.map((f, i) => {
                const faction = FACTIONS.find(fa => fa.name === f);
                return (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-sm border"
                    style={{ background: "#0f1520", borderColor: faction ? `${faction.color}28` : "rgba(201,168,76,0.1)" }}>
                    <span style={{ color: faction?.color || "#c9a84c" }}>{faction?.icon || "·"}</span>
                    <span className="text-xs font-[Crimson_Pro] text-[#b0a090]">{f}</span>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
          <CollapsibleSection title="Tags">
            <div className="flex flex-wrap gap-1.5 pt-1">{selected.tags.map(t => <Tag key={t} label={t} />)}</div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 03 — Cartography</div>
        <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Locations</h1>
      </div>
      <GoldDivider />
      <div className="space-y-4 mt-6">
        {LOCATIONS.map(l => (
          <div key={l.id} onClick={() => setSelected(l)}
            className="group cursor-pointer rounded-sm border overflow-hidden transition-all duration-200 hover:border-[rgba(201,168,76,0.4)]"
            style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
            <div className="grid grid-cols-5">
              <div className="col-span-2 relative h-44 overflow-hidden bg-[#0f1520]">
                <img src={l.image} alt={l.name} className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right,transparent,#131a24 95%)" }} />
              </div>
              <div className="col-span-3 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm" style={{ color: "#c9a84c", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>{l.type}</span>
                    <span className="text-[10px] font-mono text-[#5a5244]">{l.region}</span>
                  </div>
                  <h3 className="text-xl font-[Cinzel] text-[#e8dcc8] mb-2 tracking-wide">{l.name}</h3>
                  <p className="text-sm font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed">{l.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">{l.tags.map(t => <Tag key={t} label={t} />)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Factions ───────────────────────────────────────────────────────────────

const FactionsView = () => {
  const [selected, setSelected] = useState<typeof FACTIONS[0] | null>(null);

  if (selected) return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-xs font-mono text-[#8a7d6a] hover:text-[#c9a84c] transition-colors mb-6 group">
        <ChevronRight size={12} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" /> Back to Factions
      </button>
      <div className="flex items-start gap-5 mb-6">
        <div className="w-16 h-16 rounded-sm flex items-center justify-center text-3xl shrink-0"
          style={{ background: `${selected.color}18`, border: `2px solid ${selected.color}44` }}>
          {selected.icon}
        </div>
        <div>
          <div className="text-[10px] font-mono tracking-widest uppercase mb-1" style={{ color: selected.color }}>{selected.type} · {selected.alignment}</div>
          <h1 className="text-4xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">{selected.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-mono text-[#8a7d6a]">Influence:</span>
            <div className="w-48"><InfluenceBar value={selected.influence} /></div>
          </div>
        </div>
      </div>
      <GoldDivider />
      <div className="grid grid-cols-3 gap-5 mt-4">
        <div className="col-span-2 space-y-4">
          <CollapsibleSection title="Overview">
            <p className="text-sm font-[Crimson_Pro] text-[#c0b09a] leading-relaxed tracking-wide pt-1">{selected.description}</p>
          </CollapsibleSection>
          <CollapsibleSection title="Members">
            <div className="space-y-2 pt-1">
              {selected.members.map((m, i) => {
                const char = CHARACTERS.find(c => c.name === m);
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-sm border" style={{ background: "#0f1520", borderColor: "rgba(201,168,76,0.1)" }}>
                    {char
                      ? <img src={char.portrait} alt={m} className="w-7 h-7 rounded-sm object-cover shrink-0" />
                      : <div className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0" style={{ background: `${selected.color}12` }}><Users size={12} style={{ color: selected.color }} /></div>}
                    <span className="text-xs font-[Crimson_Pro] text-[#b0a090]">{m}</span>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        </div>
        <div className="space-y-4">
          <CollapsibleSection title="Allies">
            <div className="space-y-2 pt-1">
              {selected.allies.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-sm border" style={{ background: "#0f1520", borderColor: "rgba(90,138,106,0.2)" }}>
                  <Heart size={12} className="text-[#5a8a6a] shrink-0" />
                  <span className="text-xs font-[Crimson_Pro] text-[#b0a090]">{a}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
          <CollapsibleSection title="Enemies">
            <div className="space-y-2 pt-1">
              {selected.enemies.map((e, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-sm border" style={{ background: "#0f1520", borderColor: "rgba(138,90,90,0.2)" }}>
                  <Swords size={12} className="text-[#8a5a5a] shrink-0" />
                  <span className="text-xs font-[Crimson_Pro] text-[#b0a090]">{e}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 04 — Powers</div>
        <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Organisations & Factions</h1>
      </div>
      <GoldDivider />
      <div className="grid grid-cols-2 gap-5 mt-6">
        {FACTIONS.map(f => (
          <div key={f.id} onClick={() => setSelected(f)}
            className="cursor-pointer rounded-sm border overflow-hidden transition-all duration-200 hover:border-[rgba(201,168,76,0.4)] hover:-translate-y-0.5"
            style={{ background: "#131a24", borderColor: `${f.color}28`, borderLeftWidth: "4px", borderLeftColor: f.color }}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm flex items-center justify-center text-lg"
                    style={{ background: `${f.color}18`, border: `1px solid ${f.color}44` }}>{f.icon}</div>
                  <div>
                    <h3 className="text-base font-[Cinzel] text-[#e8dcc8] tracking-wide">{f.name}</h3>
                    <div className="text-[10px] font-mono text-[#8a7d6a] tracking-wider uppercase mt-0.5">{f.type}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm" style={{ color: f.color, background: `${f.color}18`, border: `1px solid ${f.color}35` }}>{f.alignment}</span>
              </div>
              <p className="text-xs font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed mb-4">{f.description}</p>
              <InfluenceBar value={f.influence} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Quests ─────────────────────────────────────────────────────────────────

const QuestsView = () => (
  <div className="p-8 max-w-[1400px] mx-auto">
    <div className="mb-6">
      <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 05 — Objectives</div>
      <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Quests</h1>
    </div>
    <GoldDivider />
    <div className="space-y-4 mt-6">
      {QUESTS.map(q => (
        <div key={q.id} className="rounded-sm border p-5 transition-all duration-200 hover:border-[rgba(201,168,76,0.35)]"
          style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <Scroll size={14} className="text-[#c9a84c]" />
              </div>
              <div>
                <h3 className="text-base font-[Cinzel] text-[#e8dcc8] tracking-wide mb-1">{q.title}</h3>
                <div className="text-[11px] font-mono text-[#8a7d6a]">Given by: <span className="text-[#b0a090]">{q.giver}</span></div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={q.status} />
              <StatusBadge status={q.priority} />
            </div>
          </div>
          <p className="text-sm font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed mb-4">{q.description}</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-[#5a5244] tracking-widest uppercase">Progress</span>
                <span className="text-[10px] font-mono text-[#c9a84c]">{q.progress}/{q.total}</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: "rgba(201,168,76,0.12)" }}>
                <div className="h-full rounded-full bg-[#c9a84c]" style={{ width: `${(q.progress / q.total) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Journals ───────────────────────────────────────────────────────────────

const JournalsView = () => (
  <div className="p-8 max-w-[1400px] mx-auto">
    <div className="mb-6">
      <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 08 — Records</div>
      <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Journals</h1>
    </div>
    <GoldDivider />
    <div className="grid grid-cols-3 gap-4 mt-6">
      {JOURNALS.map(j => (
        <div key={j.id} className="rounded-sm border p-5 transition-all hover:border-[rgba(201,168,76,0.35)]"
          style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
          <div className="flex items-start gap-2 mb-3">
            <BookOpen size={14} className="text-[#c9a84c] opacity-70 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-[Cinzel] text-[#e8dcc8] tracking-wide leading-snug">{j.title}</h3>
              <div className="text-[10px] font-mono text-[#5a5244] mt-1">{j.author} · {j.date}</div>
            </div>
          </div>
          <GoldDivider />
          <p className="text-xs font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed italic">&ldquo;{j.excerpt}&rdquo;</p>
        </div>
      ))}
    </div>
  </div>
);

// ── Items ──────────────────────────────────────────────────────────────────

const ItemsView = () => (
  <div className="p-8 max-w-[1400px] mx-auto">
    <div className="mb-6">
      <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 06 — Relics</div>
      <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Items & Relics</h1>
    </div>
    <GoldDivider />
    <div className="grid grid-cols-2 gap-4 mt-6">
      {ITEMS.map(item => (
        <div key={item.id} className="rounded-sm border p-5 transition-all hover:border-[rgba(201,168,76,0.35)]"
          style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <Package size={14} className="text-[#c9a84c]" />
              </div>
              <div>
                <h3 className="text-sm font-[Cinzel] text-[#e8dcc8] tracking-wide">{item.name}</h3>
                <div className="text-[10px] font-mono text-[#8a7d6a] tracking-wider mt-0.5">{item.type}</div>
              </div>
            </div>
            <RarityBadge rarity={item.rarity} />
          </div>
          <p className="text-xs font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed mb-3">{item.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">{item.tags.map(t => <Tag key={t} label={t} />)}</div>
            <div className="text-[10px] font-mono text-[#5a5244]">Owner: <span className="text-[#8a7d6a]">{item.owner}</span></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Sessions ───────────────────────────────────────────────────────────────

const SessionsView = () => (
  <div className="p-8 max-w-[1400px] mx-auto">
    <div className="mb-6">
      <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 07 — Chronicles</div>
      <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Session History</h1>
    </div>
    <GoldDivider />
    <div className="space-y-5 mt-6">
      {SESSIONS.map(s => (
        <div key={s.id} className="rounded-sm border overflow-hidden" style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
          <div className="flex items-center gap-4 px-5 py-4 border-b" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
            <div className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0 font-[Cinzel] font-semibold text-sm text-[#c9a84c]"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>{s.number}</div>
            <div className="flex-1">
              <h3 className="text-base font-[Cinzel] text-[#e8dcc8] tracking-wide">{s.title}</h3>
              <div className="text-[11px] font-mono text-[#5a5244] tracking-wide mt-0.5">{s.date} · {s.xp} XP earned</div>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm font-[Crimson_Pro] text-[#b0a090] leading-relaxed mb-4">{s.summary}</p>
            <div className="text-[10px] font-mono text-[#c9a84c] tracking-widest uppercase mb-2">Key Moments</div>
            <div className="space-y-1.5">
              {s.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1 h-1 rounded-full bg-[#c9a84c] opacity-60 shrink-0 mt-1.5" />
                  <span className="text-xs font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Relationship Graph ─────────────────────────────────────────────────────

const RelationshipGraph = () => {
  const nodes = [
    { id: "sera", label: "Seraphine", x: 50, y: 18, color: "#c9a84c" },
    { id: "vael", label: "Vael", x: 20, y: 52, color: "#6a8fb5" },
    { id: "osric", label: "Osric", x: 78, y: 52, color: "#c4783a" },
    { id: "mireth", label: "Mireth", x: 32, y: 84, color: "#7a5c8a" },
    { id: "draven", label: "Draven", x: 68, y: 84, color: "#8a5a5a" },
    { id: "king", label: "Aldric IV", x: 50, y: 58, color: "#e8dcc8" },
  ];
  const edges = [
    { from: "sera", to: "vael", label: "Ally", color: "#5a8a6a" },
    { from: "sera", to: "osric", label: "Mentee", color: "#6a8fb5" },
    { from: "sera", to: "draven", label: "Target", color: "#8a5a5a" },
    { from: "vael", to: "mireth", label: "Asset", color: "#7a5c8a" },
    { from: "mireth", to: "draven", label: "Enemy", color: "#8a5a5a" },
    { from: "osric", to: "king", label: "Advisor", color: "#c9a84c" },
    { from: "draven", to: "king", label: "Rival", color: "#c4783a" },
  ];
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  return (
    <div className="relative w-full" style={{ paddingBottom: "58%", background: "#0a0f16", borderRadius: "4px", border: "1px solid rgba(201,168,76,0.18)" }}>
      <svg className="absolute inset-0 w-full h-full">
        {edges.map((e, i) => {
          const f = byId[e.from]; const t = byId[e.to];
          const mx = (f.x + t.x) / 2; const my = (f.y + t.y) / 2;
          return (
            <g key={i}>
              <line x1={`${f.x}%`} y1={`${f.y}%`} x2={`${t.x}%`} y2={`${t.y}%`}
                stroke={e.color} strokeWidth="1.5" strokeOpacity="0.35" strokeDasharray="4,3" />
              <text x={`${mx}%`} y={`${my}%`} fill={e.color} fontSize="8" textAnchor="middle"
                fontFamily="JetBrains Mono" opacity="0.65">{e.label}</text>
            </g>
          );
        })}
        {nodes.map(n => (
          <g key={n.id}>
            <circle cx={`${n.x}%`} cy={`${n.y}%`} r="16" fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" strokeOpacity="0.55" />
            <text x={`${n.x}%`} y={`${n.y + 5.5}%`} fill={n.color} fontSize="8.5" textAnchor="middle"
              fontFamily="Cinzel" fontWeight="500" opacity="0.9">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// ── Kanka Dashboard ────────────────────────────────────────────────────────

const KankaDashboard = ({ data, onNavigate }: { data: KankaData; onNavigate: (v: ViewId) => void }) => {
  const activeQuests = data.quests.filter(q => !q.is_completed);
  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 01 — Overview · Live</div>
        <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">{data.campaignName}</h1>
        <p className="text-sm font-[Crimson_Pro] text-[#8a7d6a] mt-1">Campaign Dashboard · Kanka Live Data</p>
      </div>
      <GoldDivider />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Characters", value: data.characters.length, icon: <Users size={16} />, view: "characters" as ViewId },
          { label: "Locations", value: data.locations.length, icon: <MapPin size={16} />, view: "locations" as ViewId },
          { label: "Organisations", value: data.organisations.length, icon: <Shield size={16} />, view: "factions" as ViewId },
          { label: "Active Quests", value: activeQuests.length, icon: <Scroll size={16} />, view: "quests" as ViewId },
        ].map((s, i) => (
          <button key={i} onClick={() => onNavigate(s.view)}
            className="rounded-sm border p-4 relative overflow-hidden text-left group transition-all hover:border-[rgba(201,168,76,0.35)] hover:-translate-y-0.5"
            style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
            <div className="absolute top-0 right-0 w-16 h-16 opacity-5" style={{ background: "radial-gradient(circle,#c9a84c,transparent 70%)" }} />
            <span className="text-[#c9a84c] opacity-70 block mb-3 group-hover:opacity-100 transition-opacity">{s.icon}</span>
            <div className="text-2xl font-[Cinzel] font-semibold text-[#e8dcc8] mb-1">{s.value}</div>
            <div className="text-[11px] font-mono text-[#8a7d6a] tracking-wide uppercase">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Characters */}
        <div className="col-span-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c]">Characters</div>
            <button onClick={() => onNavigate("characters")} className="text-[10px] font-mono text-[#5a5244] hover:text-[#c9a84c] transition-colors flex items-center gap-1">All <ChevronRight size={10} /></button>
          </div>
          <div className="space-y-2">
            {data.characters.slice(0, 6).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-sm border transition-all hover:border-[rgba(201,168,76,0.35)]"
                style={{ background: "#0f1520", borderColor: "rgba(201,168,76,0.1)" }}>
                <div className="w-8 h-8 rounded-sm overflow-hidden shrink-0 bg-[#1a2433]">
                  {c.image_thumb
                    ? <img src={c.image_thumb} alt={c.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Users size={14} className="text-[#5a5244]" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-[Cinzel] text-[#e8dcc8] truncate">{c.name}</div>
                  <div className="text-[10px] font-mono text-[#8a7d6a] truncate">{c.race?.name || c.type || "Unknown"}</div>
                </div>
                {c.is_dead && <StatusBadge status="hostile" />}
              </div>
            ))}
            {data.characters.length === 0 && <div className="py-8 text-center text-xs font-mono text-[#5a5244]">No characters found</div>}
          </div>
        </div>

        {/* Quests */}
        <div className="col-span-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c]">Active Quests</div>
            <button onClick={() => onNavigate("quests")} className="text-[10px] font-mono text-[#5a5244] hover:text-[#c9a84c] transition-colors flex items-center gap-1">All <ChevronRight size={10} /></button>
          </div>
          <div className="space-y-2">
            {activeQuests.slice(0, 5).map(q => (
              <div key={q.id} className="p-3 rounded-sm border" style={{ background: "#0f1520", borderColor: "rgba(201,168,76,0.1)" }}>
                <div className="text-xs font-[Crimson_Pro] text-[#e8dcc8] leading-snug mb-1">{q.name}</div>
                {q.character?.name && <div className="text-[10px] font-mono text-[#5a5244]">{q.character.name}</div>}
              </div>
            ))}
            {activeQuests.length === 0 && <div className="py-8 text-center text-xs font-mono text-[#5a5244]">No active quests</div>}
          </div>
        </div>

        {/* Organisations */}
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c]">Organisations</div>
            <button onClick={() => onNavigate("factions")} className="text-[10px] font-mono text-[#5a5244] hover:text-[#c9a84c] transition-colors flex items-center gap-1">All <ChevronRight size={10} /></button>
          </div>
          <div className="space-y-2">
            {data.organisations.slice(0, 5).map((o, idx) => {
              const colors = ["#c9a84c", "#6a8fb5", "#7a5c8a", "#c4783a", "#5a8a6a"];
              const color = colors[idx % colors.length];
              return (
                <div key={o.id} className="p-3 rounded-sm border"
                  style={{ background: "#0f1520", borderColor: `${color}28`, borderLeftWidth: "2px", borderLeftColor: color }}>
                  <div className="text-xs font-[Cinzel] text-[#e8dcc8] truncate">{o.name}</div>
                  <div className="text-[10px] font-mono text-[#8a7d6a] mt-0.5">{o.type || "Organisation"}</div>
                </div>
              );
            })}
            {data.organisations.length === 0 && <div className="py-8 text-center text-xs font-mono text-[#5a5244]">No organisations</div>}
          </div>
        </div>
      </div>

      {/* Locations */}
      {data.locations.length > 0 && (
        <>
          <GoldDivider />
          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c]">Locations</div>
              <button onClick={() => onNavigate("locations")} className="text-[10px] font-mono text-[#5a5244] hover:text-[#c9a84c] transition-colors flex items-center gap-1">All <ChevronRight size={10} /></button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {data.locations.slice(0, 4).map(l => (
                <div key={l.id} className="rounded-sm border overflow-hidden" style={{ background: "#0f1520", borderColor: "rgba(201,168,76,0.15)" }}>
                  <div className="h-24 bg-[#0d1320] overflow-hidden">
                    {l.image_full
                      ? <img src={l.image_full} alt={l.name} className="w-full h-full object-cover opacity-70" />
                      : <div className="w-full h-full flex items-center justify-center"><MapPin size={20} className="text-[#2a3a4a]" /></div>}
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-[Cinzel] text-[#e8dcc8] truncate">{l.name}</div>
                    <div className="text-[10px] font-mono text-[#8a7d6a] mt-0.5">{l.type || "Location"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── Kanka live data types ──────────────────────────────────────────────────

interface KankaData {
  campaignName: string;
  characters: { id: number; name: string; entry_parsed?: string; image_full?: string; image_thumb?: string; race?: { name: string }; type?: string; age?: string; location?: { name: string }; is_dead?: boolean; tags?: { id: number; name: string }[] }[];
  locations: { id: number; name: string; entry_parsed?: string; image_full?: string; type?: string; parent?: { name: string }; tags?: { id: number; name: string }[] }[];
  organisations: { id: number; name: string; entry_parsed?: string; type?: string; tags?: { id: number; name: string }[] }[];
  quests: { id: number; name: string; entry_parsed?: string; is_completed?: boolean; character?: { name: string }; date?: string }[];
  journals: { id: number; name: string; entry_parsed?: string; date?: string; character?: { name: string }; type?: string }[];
  items: { id: number; name: string; entry_parsed?: string; type?: string; character?: { name: string }; location?: { name: string } }[];
}

// ── Kanka Live Views ───────────────────────────────────────────────────────

const KankaCharactersView = ({ data }: { data: KankaData }) => {
  const [selected, setSelected] = useState<KankaData["characters"][0] | null>(null);
  if (selected) return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-xs font-mono text-[#8a7d6a] hover:text-[#c9a84c] transition-colors mb-6 group">
        <ChevronRight size={12} className="rotate-180" /> Back
      </button>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <div className="relative rounded-sm overflow-hidden bg-[#0f1520]" style={{ aspectRatio: "3/4" }}>
            {selected.image_full
              ? <img src={selected.image_full} alt={selected.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Users size={48} className="text-[#2a3a4a]" /></div>}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#131a24,transparent 60%)" }} />
            <div className="absolute bottom-4 left-4">{selected.is_dead && <StatusBadge status="hostile" />}</div>
          </div>
          {selected.tags && selected.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">{selected.tags.map(t => <Tag key={t.id} label={t.name} />)}</div>
          )}
        </div>
        <div className="col-span-8 space-y-5">
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">Character · Kanka</div>
            <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide mb-2">{selected.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-[#8a7d6a]">
              {selected.race?.name && <span>Race: <span className="text-[#b0a090]">{selected.race.name}</span></span>}
              {selected.age && <span>Age: <span className="text-[#b0a090]">{selected.age}</span></span>}
              {selected.type && <span>Type: <span className="text-[#b0a090]">{selected.type}</span></span>}
              {selected.location?.name && <span>Location: <span className="text-[#b0a090]">{selected.location.name}</span></span>}
            </div>
          </div>
          <GoldDivider />
          {selected.entry_parsed && (
            <CollapsibleSection title="Description">
              <p className="text-sm font-[Crimson_Pro] text-[#c0b09a] leading-relaxed pt-1">{stripHtml(selected.entry_parsed)}</p>
            </CollapsibleSection>
          )}
        </div>
      </div>
    </div>
  );
  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 02 — Codex · {data.campaignName}</div>
        <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Characters</h1>
        <p className="text-xs font-mono text-[#5a5244] mt-1">{data.characters.length} entries from Kanka</p>
      </div>
      <GoldDivider />
      {data.characters.length === 0
        ? <div className="py-20 text-center text-xs font-mono text-[#5a5244]">No characters found in this campaign.</div>
        : <div className="grid grid-cols-3 gap-5 mt-6">
          {data.characters.map(c => (
            <div key={c.id} onClick={() => setSelected(c)}
              className="group cursor-pointer rounded-sm border overflow-hidden transition-all duration-200 hover:border-[rgba(201,168,76,0.4)] hover:-translate-y-0.5"
              style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
              <div className="relative h-48 bg-[#0f1520] overflow-hidden">
                {c.image_full
                  ? <img src={c.image_full} alt={c.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-300" />
                  : <div className="w-full h-full flex items-center justify-center"><Users size={32} className="text-[#2a3a4a]" /></div>}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#131a24,rgba(19,26,36,0.4) 60%,transparent)" }} />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"><Eye size={14} className="text-[#c9a84c]" /></div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-[Cinzel] text-[#e8dcc8] mb-1 tracking-wide">{c.name}</h3>
                <div className="text-[11px] font-mono text-[#8a7d6a] tracking-wider mb-2">{[c.race?.name, c.type].filter(Boolean).join(" · ") || "Unknown"}</div>
                {c.entry_parsed && <p className="text-xs font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed line-clamp-2 mb-2">{stripHtml(c.entry_parsed)}</p>}
                {c.tags && c.tags.length > 0 && <div className="flex flex-wrap gap-1">{c.tags.slice(0, 3).map(t => <Tag key={t.id} label={t.name} />)}</div>}
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
};

const KankaLocationsView = ({ data }: { data: KankaData }) => (
  <div className="p-8 max-w-[1400px] mx-auto">
    <div className="mb-6">
      <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 03 — Cartography · {data.campaignName}</div>
      <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Locations</h1>
      <p className="text-xs font-mono text-[#5a5244] mt-1">{data.locations.length} entries from Kanka</p>
    </div>
    <GoldDivider />
    <div className="space-y-3 mt-6">
      {data.locations.map(l => (
        <div key={l.id} className="rounded-sm border p-5 transition-all hover:border-[rgba(201,168,76,0.35)]"
          style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
          <div className="flex items-start gap-4">
            <div className="w-24 h-16 rounded-sm overflow-hidden shrink-0 bg-[#0f1520] flex items-center justify-center">
              {l.image_full
                ? <img src={l.image_full} alt={l.name} className="w-full h-full object-cover" />
                : <Globe size={20} className="text-[#2a3a4a]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-sm font-[Cinzel] text-[#e8dcc8] tracking-wide">{l.name}</h3>
                {l.type && <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm" style={{ color: "#c9a84c", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>{l.type}</span>}
                {l.parent?.name && <span className="text-[10px] font-mono text-[#5a5244]">in {l.parent.name}</span>}
              </div>
              {l.entry_parsed && <p className="text-xs font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed line-clamp-2">{stripHtml(l.entry_parsed)}</p>}
              {l.tags && l.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{l.tags.slice(0, 4).map(t => <Tag key={t.id} label={t.name} />)}</div>}
            </div>
          </div>
        </div>
      ))}
      {data.locations.length === 0 && <div className="py-20 text-center text-xs font-mono text-[#5a5244]">No locations found.</div>}
    </div>
  </div>
);

const KankaFactionsView = ({ data }: { data: KankaData }) => {
  const colors = ["#c9a84c", "#6a8fb5", "#7a5c8a", "#c4783a", "#5a8a6a", "#8a5a5a"];
  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 04 — Powers · {data.campaignName}</div>
        <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Organisations</h1>
        <p className="text-xs font-mono text-[#5a5244] mt-1">{data.organisations.length} entries from Kanka</p>
      </div>
      <GoldDivider />
      <div className="grid grid-cols-2 gap-5 mt-6">
        {data.organisations.map((o, idx) => {
          const color = colors[idx % colors.length];
          return (
            <div key={o.id} className="rounded-sm border p-5 transition-all hover:border-[rgba(201,168,76,0.4)]"
              style={{ background: "#131a24", borderColor: `${color}28`, borderLeftWidth: "4px", borderLeftColor: color }}>
              <h3 className="text-base font-[Cinzel] text-[#e8dcc8] tracking-wide mb-1">{o.name}</h3>
              <div className="text-[10px] font-mono text-[#8a7d6a] tracking-wider uppercase mb-3">{o.type || "Organisation"}</div>
              {o.entry_parsed && <p className="text-xs font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed line-clamp-3 mb-3">{stripHtml(o.entry_parsed)}</p>}
              {o.tags && o.tags.length > 0 && <div className="flex flex-wrap gap-1">{o.tags.slice(0, 4).map(t => <Tag key={t.id} label={t.name} />)}</div>}
            </div>
          );
        })}
        {data.organisations.length === 0 && <div className="col-span-2 py-20 text-center text-xs font-mono text-[#5a5244]">No organisations found.</div>}
      </div>
    </div>
  );
};

const KankaQuestsView = ({ data }: { data: KankaData }) => (
  <div className="p-8 max-w-[1400px] mx-auto">
    <div className="mb-6">
      <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 05 — Objectives · {data.campaignName}</div>
      <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Quests</h1>
      <p className="text-xs font-mono text-[#5a5244] mt-1">{data.quests.length} entries from Kanka</p>
    </div>
    <GoldDivider />
    <div className="space-y-4 mt-6">
      {data.quests.map(q => (
        <div key={q.id} className="rounded-sm border p-5 transition-all hover:border-[rgba(201,168,76,0.35)]"
          style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-base font-[Cinzel] text-[#e8dcc8] tracking-wide">{q.name}</h3>
            <StatusBadge status={q.is_completed ? "completed" : "active"} />
          </div>
          {q.character?.name && <div className="text-[11px] font-mono text-[#8a7d6a] mb-2">Quest giver: <span className="text-[#b0a090]">{q.character.name}</span></div>}
          {q.date && <div className="text-[10px] font-mono text-[#5a5244] mb-2">{q.date}</div>}
          {q.entry_parsed && <p className="text-sm font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed">{stripHtml(q.entry_parsed).slice(0, 300)}</p>}
        </div>
      ))}
      {data.quests.length === 0 && <div className="py-20 text-center text-xs font-mono text-[#5a5244]">No quests found.</div>}
    </div>
  </div>
);

const KankaJournalsView = ({ data }: { data: KankaData }) => (
  <div className="p-8 max-w-[1400px] mx-auto">
    <div className="mb-6">
      <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 08 — Records · {data.campaignName}</div>
      <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Journals</h1>
      <p className="text-xs font-mono text-[#5a5244] mt-1">{data.journals.length} entries from Kanka</p>
    </div>
    <GoldDivider />
    <div className="grid grid-cols-3 gap-4 mt-6">
      {data.journals.map(j => (
        <div key={j.id} className="rounded-sm border p-5 transition-all hover:border-[rgba(201,168,76,0.35)]"
          style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
          <div className="flex items-start gap-2 mb-3">
            <BookOpen size={14} className="text-[#c9a84c] opacity-70 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-[Cinzel] text-[#e8dcc8] tracking-wide leading-snug">{j.name}</h3>
              <div className="text-[10px] font-mono text-[#5a5244] mt-1">{[j.character?.name, j.date || j.type].filter(Boolean).join(" · ")}</div>
            </div>
          </div>
          <GoldDivider />
          {j.entry_parsed
            ? <p className="text-xs font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed italic">&ldquo;{stripHtml(j.entry_parsed).slice(0, 220)}&rdquo;</p>
            : <p className="text-xs font-mono text-[#3a3430] italic">No content</p>}
        </div>
      ))}
      {data.journals.length === 0 && <div className="col-span-3 py-20 text-center text-xs font-mono text-[#5a5244]">No journals found.</div>}
    </div>
  </div>
);

const KankaItemsView = ({ data }: { data: KankaData }) => (
  <div className="p-8 max-w-[1400px] mx-auto">
    <div className="mb-6">
      <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c] mb-1">§ 06 — Relics · {data.campaignName}</div>
      <h1 className="text-3xl font-[Cinzel] font-semibold text-[#e8dcc8] tracking-wide">Items</h1>
      <p className="text-xs font-mono text-[#5a5244] mt-1">{data.items.length} entries from Kanka</p>
    </div>
    <GoldDivider />
    <div className="grid grid-cols-2 gap-4 mt-6">
      {data.items.map(item => (
        <div key={item.id} className="rounded-sm border p-5 transition-all hover:border-[rgba(201,168,76,0.35)]"
          style={{ background: "#131a24", borderColor: "rgba(201,168,76,0.18)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <Package size={14} className="text-[#c9a84c]" />
            </div>
            <div>
              <h3 className="text-sm font-[Cinzel] text-[#e8dcc8] tracking-wide">{item.name}</h3>
              <div className="text-[10px] font-mono text-[#8a7d6a] tracking-wider">{item.type || "Item"}</div>
            </div>
          </div>
          {item.entry_parsed && <p className="text-xs font-[Crimson_Pro] text-[#8a7d6a] leading-relaxed mb-2">{stripHtml(item.entry_parsed).slice(0, 200)}</p>}
          <div className="flex gap-3 text-[10px] font-mono text-[#5a5244]">
            {item.character?.name && <span>Holder: <span className="text-[#8a7d6a]">{item.character.name}</span></span>}
            {item.location?.name && <span>Location: <span className="text-[#8a7d6a]">{item.location.name}</span></span>}
          </div>
        </div>
      ))}
      {data.items.length === 0 && <div className="col-span-2 py-20 text-center text-xs font-mono text-[#5a5244]">No items found.</div>}
    </div>
  </div>
);

// ── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<ViewId>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [kankaData, setKankaData] = useState<KankaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const navigate = useCallback((v: ViewId) => setView(v), []);

  // Load from cache on mount, fall back to Kanka fetch
  useEffect(() => {
    const token = localStorage.getItem("kanka_token") || "";
    const campaignId = localStorage.getItem("kanka_campaign_id") || DEFAULT_CAMPAIGN_ID;
    fetch("/cache/read")
      .then(r => r.ok ? r.json() : null)
      .then(cached => {
        if (cached?.data) {
          setKankaData(cached.data);
          setLastSynced(cached.syncedAt || null);
        } else if (token) {
          loadKankaData(token, campaignId, "");
        }
      })
      .catch(() => { if (token) loadKankaData(token, campaignId, ""); });
  }, []);

  const loadKankaData = async (token: string, campaignId: string, campaignName: string) => {
    setLoading(true);
    setLoadError("");
    try {
      const [chRes, locRes, orgRes, qRes, jRes, iRes] = await Promise.allSettled([
        kankaFetch(token, `/campaigns/${campaignId}/characters?limit=100`),
        kankaFetch(token, `/campaigns/${campaignId}/locations?limit=100`),
        kankaFetch(token, `/campaigns/${campaignId}/organisations?limit=100`),
        kankaFetch(token, `/campaigns/${campaignId}/quests?limit=100`),
        kankaFetch(token, `/campaigns/${campaignId}/journals?limit=100`),
        kankaFetch(token, `/campaigns/${campaignId}/items?limit=100`),
      ]);
      // Resolve campaign name if not passed
      let name = campaignName;
      if (!name) {
        try {
          const camps = await kankaFetch(token, "/campaigns");
          const found = camps.data?.find((c: { id: number; name: string }) => String(c.id) === String(campaignId));
          name = found?.name || `Campaign ${campaignId}`;
        } catch { name = `Campaign ${campaignId}`; }
      }
      const fresh: KankaData = {
        campaignName: name,
        characters: chRes.status === "fulfilled" ? chRes.value.data : [],
        locations: locRes.status === "fulfilled" ? locRes.value.data : [],
        organisations: orgRes.status === "fulfilled" ? orgRes.value.data : [],
        quests: qRes.status === "fulfilled" ? qRes.value.data : [],
        journals: jRes.status === "fulfilled" ? jRes.value.data : [],
        items: iRes.status === "fulfilled" ? iRes.value.data : [],
      };
      const syncedAt = new Date().toLocaleString();
      setKankaData(fresh);
      setLastSynced(syncedAt);
      // Save to local cache file
      fetch("/cache/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: fresh, syncedAt }),
      }).catch(() => {});
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : "Failed to load Kanka data.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnected = (token: string, campaignId: string, campaignName: string) => {
    loadKankaData(token, campaignId, campaignName);
  };

  const handleSync = async () => {
    const token = localStorage.getItem("kanka_token") || "";
    const campaignId = localStorage.getItem("kanka_campaign_id") || DEFAULT_CAMPAIGN_ID;
    if (!token) { setShowSettings(true); return; }
    setSyncing(true);
    await loadKankaData(token, campaignId, kankaData?.campaignName || "");
    setSyncing(false);
  };

  // ── Debug ──────────────────────────────────────────────────────────────
  const [debugResult, setDebugResult] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  const runDebug = async () => {
    setDebugResult("Testing…");
    setShowDebug(true);
    // Test health first, then kanka
    try {
      const token = localStorage.getItem("kanka_token") || "";
      const kanka = await fetch(`${KANKA_BASE}/campaigns`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const kankaText = await kanka.text();
      setDebugResult(`Kanka /campaigns: ${kanka.status}\n${kankaText.slice(0, 600)}`);
    } catch (e: unknown) {
      setDebugResult(`Fetch error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const isLive = !!kankaData;

  const content: Record<ViewId, React.ReactNode> = isLive ? {
    dashboard: <KankaDashboard data={kankaData!} onNavigate={navigate} />,
    characters: <KankaCharactersView data={kankaData!} />,
    locations: <KankaLocationsView data={kankaData!} />,
    factions: <KankaFactionsView data={kankaData!} />,
    quests: <KankaQuestsView data={kankaData!} />,
    journals: <KankaJournalsView data={kankaData!} />,
    items: <KankaItemsView data={kankaData!} />,
    sessions: <SessionsView />,
  } : {
    dashboard: <Dashboard onNavigate={navigate} />,
    characters: <CharactersView />,
    locations: <LocationsView />,
    factions: <FactionsView />,
    quests: <QuestsView />,
    journals: <JournalsView />,
    items: <ItemsView />,
    sessions: <SessionsView />,
  };

  return (
    <div className="dark flex h-screen overflow-hidden" style={{ background: "#0d1117", fontFamily: "'Crimson Pro', Georgia, serif" }}>
      {showSettings && <KankaSettingsModal onClose={() => setShowSettings(false)} onConnected={handleConnected} />}

      <Sidebar view={view} onNavigate={navigate} collapsed={collapsed} setCollapsed={setCollapsed} onSettings={() => setShowSettings(true)} onSync={handleSync} syncing={syncing} lastSynced={lastSynced} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-4 px-6 py-3 border-b shrink-0"
          style={{ borderColor: "rgba(201,168,76,0.12)", background: "rgba(13,17,23,0.95)", backdropFilter: "blur(12px)" }}>
          <SearchBar onNavigate={navigate} />
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {loading && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#c9a84c]">
                <Loader2 size={12} className="animate-spin" /> Loading campaign {DEFAULT_CAMPAIGN_ID}…
              </div>
            )}
            {loadError && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-mono text-[#c09090] max-w-xs truncate"
                style={{ borderColor: "rgba(138,90,90,0.3)", background: "rgba(138,90,90,0.08)" }}
                title={loadError}>
                <WifiOff size={12} className="shrink-0" /> {loadError}
              </div>
            )}
            <button onClick={runDebug}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-mono transition-all text-[#8a7d6a] hover:text-[#c9a84c] hover:border-[rgba(201,168,76,0.35)]"
              style={{ borderColor: "rgba(201,168,76,0.18)" }}>
              Test API
            </button>
            <button onClick={() => setShowGraph(!showGraph)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-mono transition-all"
              style={{ borderColor: showGraph ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.18)", color: showGraph ? "#c9a84c" : "#8a7d6a", background: showGraph ? "rgba(201,168,76,0.1)" : "transparent" }}>
              <GitBranch size={12} /> Relations
            </button>
            <button onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-mono transition-all"
              style={{
                borderColor: isLive ? "rgba(90,138,106,0.4)" : "rgba(201,168,76,0.18)",
                color: isLive ? "#5a8a6a" : "#8a7d6a",
                background: isLive ? "rgba(90,138,106,0.08)" : "transparent",
              }}>
              {isLive
                ? <><div className="w-1.5 h-1.5 rounded-full bg-[#5a8a6a] animate-pulse" /> {kankaData!.campaignName}</>
                : <><Key size={12} /> Connect Kanka</>}
            </button>
          </div>
        </header>

        {showDebug && (
          <div className="shrink-0 border-b px-6 py-4" style={{ borderColor: "rgba(201,168,76,0.2)", background: "#0a0f16" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c]">Edge Function Debug</div>
              <button onClick={() => setShowDebug(false)}><X size={13} className="text-[#5a5244] hover:text-[#c9a84c]" /></button>
            </div>
            <pre className="text-[10px] font-mono text-[#8a7d6a] whitespace-pre-wrap break-all leading-relaxed max-h-40 overflow-y-auto">{debugResult}</pre>
          </div>
        )}

        {showGraph && (
          <div className="shrink-0 border-b px-6 py-4" style={{ borderColor: "rgba(201,168,76,0.12)", background: "#0a0f16" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-mono tracking-widest uppercase text-[#c9a84c]">NPC Relationship Map</div>
              <button onClick={() => setShowGraph(false)}><X size={14} className="text-[#5a5244] hover:text-[#c9a84c] transition-colors" /></button>
            </div>
            <RelationshipGraph />
          </div>
        )}

        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,168,76,0.15) transparent" }}>
          {content[view]}
        </main>
      </div>
    </div>
  );
}
