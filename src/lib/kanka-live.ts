const DEFAULT_BASES = ["/kanka-proxy", "/make-server-cb991f29/kanka"];

export interface KankaListResponse<T> {
  data?: T[];
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

export interface KankaCampaign {
  id: number;
  name: string;
}

export interface KankaTag {
  id: number;
  name: string;
  colour?: string;
}

export interface KankaRelation {
  id: number;
  source_id: number;
  target_id: number;
  relation?: string;
  colour?: string;
}

export interface KankaEntityBase {
  id: number;
  name: string;
  entry?: string;
  entry_parsed?: string;
  image_full?: string;
  image_thumb?: string;
  type?: string;
  tags?: KankaTag[];
  updated_at?: string;
}

export interface KankaCharacter extends KankaEntityBase {
  age?: string;
  race?: { name: string } | null;
  location?: { name: string } | null;
  is_dead?: boolean;
}

export interface KankaLocation extends KankaEntityBase {
  parent?: { name: string } | null;
}

export interface KankaOrganisation extends KankaEntityBase {
  location?: { name: string } | null;
}

export interface KankaQuest extends KankaEntityBase {
  is_completed?: boolean;
  character?: { name: string } | null;
  date?: string;
}

export interface KankaJournal extends KankaEntityBase {
  character?: { name: string } | null;
  date?: string;
}

export interface KankaItem extends KankaEntityBase {
  character?: { name: string } | null;
  location?: { name: string } | null;
}

export interface KankaData {
  campaignName: string;
  characters: KankaCharacter[];
  locations: KankaLocation[];
  organisations: KankaOrganisation[];
  quests: KankaQuest[];
  journals: KankaJournal[];
  items: KankaItem[];
  relations: KankaRelation[];
}

function appendParams(path: string, params: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path, "https://local.invalid");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return `${url.pathname}${url.search}`;
}

async function fetchJson<T>(token: string, path: string, base: string): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Kanka ${res.status}: ${body || res.statusText}`);
  }

  return res.json();
}

async function request<T>(token: string, path: string): Promise<T> {
  let lastError: unknown;

  for (const base of DEFAULT_BASES) {
    try {
      return await fetchJson<T>(token, path, base);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to reach the Kanka proxy.");
}

async function fetchAllPages<T>(token: string, path: string): Promise<T[]> {
  const firstPath = appendParams(path, { limit: 100, related: 1, page: 1 });
  const first = await request<KankaListResponse<T>>(token, firstPath);
  const results = [...(first.data ?? [])];
  const lastPage = first.meta?.last_page ?? 1;

  if (lastPage <= 1) return results;

  const remaining = Array.from({ length: lastPage - 1 }, (_, index) => index + 2);
  const pages = await Promise.all(
    remaining.map((page) => request<KankaListResponse<T>>(token, appendParams(path, { limit: 100, related: 1, page }))),
  );

  for (const page of pages) results.push(...(page.data ?? []));
  return results;
}

export async function getCampaigns(token: string) {
  const response = await request<KankaListResponse<KankaCampaign>>(token, "/campaigns");
  return response.data ?? [];
}

export async function loadKankaCampaign(token: string, campaignId: string, campaignName?: string): Promise<KankaData> {
  const [characters, locations, organisations, quests, journals, items, relations, campaigns] = await Promise.all([
    fetchAllPages<KankaCharacter>(token, `/campaigns/${campaignId}/characters`),
    fetchAllPages<KankaLocation>(token, `/campaigns/${campaignId}/locations`),
    fetchAllPages<KankaOrganisation>(token, `/campaigns/${campaignId}/organisations`),
    fetchAllPages<KankaQuest>(token, `/campaigns/${campaignId}/quests`),
    fetchAllPages<KankaJournal>(token, `/campaigns/${campaignId}/journals`),
    fetchAllPages<KankaItem>(token, `/campaigns/${campaignId}/items`),
    fetchAllPages<KankaRelation>(token, `/campaigns/${campaignId}/relations`),
    campaignName ? Promise.resolve([] as KankaCampaign[]) : getCampaigns(token).catch(() => []),
  ]);

  const matchedCampaign = campaigns.find((campaign) => String(campaign.id) === String(campaignId));

  return {
    campaignName: campaignName || matchedCampaign?.name || `Campaign ${campaignId}`,
    characters,
    locations,
    organisations,
    quests,
    journals,
    items,
    relations,
  };
}
