import { nanoid } from "./gen-id.js";

// AODB = Append Only Data Base

export type EntityId = string & { __entityId: true };

export const StatusKeys = [
  "Unplayed",
  "UnplayedUnreleased",
  "UnplayedRereleased",
  "UnplayedMiscellaneous",
  "Unbeaten",
  "Abandoned",
  "Beaten",
] as const;

export type Status = typeof StatusKeys[number];

export type GameEntity = {
  id: EntityId;
  insertionId: number;
  status: Status;
  name: string;
  platform: string;
  comment: string;
  startDate: string;
  endDate: string;
  source: string;
};

type MutableGameEntityFields = Exclude<keyof GameEntity, "id" | "insertionId">;

type AOKeyValue<K extends MutableGameEntityFields = MutableGameEntityFields> = {
  id: EntityId;
  key: K;
  value: GameEntity[K];
};

const entries: AOKeyValue[] = [];

export const nextId = () => nanoid() as EntityId;

// The execution order of the "database" is top to bottom, with bottom being the
// oldest mutation. Therefore, this function always "pushes" a mutation to the
// top of the list.
export function prepend<K extends MutableGameEntityFields>(
  id: EntityId,
  key: K,
  value: GameEntity[K]
) {
  const entry = { id, key, value };
  entries.unshift(entry);
  return entry;
}

// Build the raw keyValues into full entities
function build() {
  const collected = new Map<EntityId, GameEntity>();

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const built = collected.has(entry.id)
      ? collected.get(entry.id)!
      : ({ id: entry.id } as GameEntity);

    // Provide an insertion-order sort for un-dated things
    built.insertionId = Math.min(built.insertionId, i);

    // We might need this switch for other data types, like dates, numbers.
    // It only works today this way because everything is a string.
    switch (entry.key) {
      case "status":
        built[entry.key] = entry.value as GameEntity["status"];
        break;
      case "name":
      case "platform":
      case "startDate":
      case "endDate":
      case "comment":
      case "source":
        built[entry.key] = entry.value !== undefined ? entry.value : "";
        break;
      default: {
        const _n: never = entry.key;
      }
    }
    collected.set(built.id, built);
  }

  const listedEntries = Array.from(collected.values());
  return listedEntries;
}

let built: ReturnType<typeof build>;

export function useDb() {
  if (!built) {
    built = build();
  }
  return built;
}

export function query<K extends keyof GameEntity>(
  searchField: K,
  searchValue: GameEntity[K],
  sortFields: K[] = ["endDate", "startDate", "insertionId"] as K[]
) {
  const db = useDb();
  const results = [];

  for (let i = 0; i < db.length; i++) {
    const built = db[i];
    if (built[searchField] === searchValue) results.push(built);
  }

  return results.sort((a, b) => {
    for (let i = 0; i < sortFields.length; i++) {
      const field = sortFields[i];
      const sortA = a[field];
      const sortB = b[field];
      // Do not attempt to sort if either field is falsy (aka not-sortable)
      if (!sortA || !sortB) continue;
      return (sortA || "").toString().localeCompare((sortB || "").toString());
    }
    return a.insertionId.toString().localeCompare(b.insertionId.toString());
  });
}
