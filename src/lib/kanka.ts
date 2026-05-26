const BASE = "/kanka-api";
const KEY = import.meta.env.VITE_KANKA_API_KEY as string;

const headers = () => ({
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
});

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers() });
  if (!res.ok) throw new Error(`Kanka API ${res.status}: ${res.statusText}`);
  return res.json();
}

export interface Campaign {
  id: number;
  name: string;
  locale: string;
  image?: string;
  image_full?: string;
  members: { data: { user: { name: string } }[] };
}

export interface KankaEntity {
  id: number;
  name: string;
  entry?: string;
  entry_parsed?: string;
  image?: string;
  image_full?: string;
  image_thumb?: string;
  tags?: { id: number; name: string; colour?: string }[];
  is_private?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface KankaCharacter extends KankaEntity {
  age?: string;
  sex?: string;
  pronouns?: string;
  race?: { name: string } | null;
  type?: string;
  title?: string;
  location?: { name: string } | null;
  family?: { name: string } | null;
  is_dead?: boolean;
  traits?: { name: string; entry: string; section: string }[];
}

export interface KankaLocation extends KankaEntity {
  type?: string;
  parent?: { name: string } | null;
  map?: string;
}

export interface KankaOrganisation extends KankaEntity {
  type?: string;
  organisation?: { name: string } | null;
  members?: { data: { character: { name: string } }[] };
}

export interface KankaQuest extends KankaEntity {
  type?: string;
  date?: string;
  is_completed?: boolean;
  character?: { name: string } | null;
  elements?: { data: { name: string; description?: string; is_completed?: boolean }[] };
}

export interface KankaJournal extends KankaEntity {
  type?: string;
  date?: string;
  character?: { name: string } | null;
}

export interface KankaItem extends KankaEntity {
  type?: string;
  location?: { name: string } | null;
  character?: { name: string } | null;
  price?: string;
  size?: string;
  weight?: string;
}

export interface KankaNote extends KankaEntity {
  type?: string;
  is_pinned?: boolean;
}

interface ListResponse<T> { data: T[] }
interface SingleResponse<T> { data: T }

export const kanka = {
  campaigns: () => get<{ data: Campaign[] }>("/campaigns"),
  characters: (cid: number) => get<ListResponse<KankaCharacter>>(`/campaigns/${cid}/characters?related=1`),
  locations: (cid: number) => get<ListResponse<KankaLocation>>(`/campaigns/${cid}/locations?related=1`),
  organisations: (cid: number) => get<ListResponse<KankaOrganisation>>(`/campaigns/${cid}/organisations?related=1`),
  quests: (cid: number) => get<ListResponse<KankaQuest>>(`/campaigns/${cid}/quests?related=1`),
  journals: (cid: number) => get<ListResponse<KankaJournal>>(`/campaigns/${cid}/journals`),
  items: (cid: number) => get<ListResponse<KankaItem>>(`/campaigns/${cid}/items`),
  notes: (cid: number) => get<ListResponse<KankaNote>>(`/campaigns/${cid}/notes`),
  recentlyModified: (cid: number) => get<{ data: { id: number; name: string; type: string; child_id: number; updated_at: string }[] }>(`/campaigns/${cid}/entities?page=1`),
};
