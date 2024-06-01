import { nanoid } from "./gen-id.js";
export const StatusKeys = [
    "Unplayed",
    "UnplayedUnreleased",
    "UnplayedRereleased",
    "UnplayedMiscellaneous",
    "Unbeaten",
    "Abandoned",
    "Beaten",
];
const entries = [];
export const nextId = () => nanoid();
// The execution order of the "database" is top to bottom, with bottom being the
// oldest mutation. Therefore, this function always "pushes" a mutation to the
// top of the list.
export function prepend(id, key, value) {
    const entry = { id, key, value };
    entries.unshift(entry);
    return entry;
}
// Build the raw keyValues into full entities
function build() {
    const collected = new Map();
    // TODO: probably want to rethink how a GameEntity is constructed. Want to
    // ensure that non-optional properties always have a value, and that there is
    // a source of truth, rather than a wishy contract between here and the
    // editing view.
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const built = collected.has(entry.id)
            ? collected.get(entry.id)
            : { id: entry.id };
        // Provide an insertion-order sort for un-dated things
        built.insertionId = Math.min(built.insertionId, i);
        // We might need this switch for other data types, like dates, numbers.
        // It only works today this way because everything is a string.
        switch (entry.key) {
            case "status":
                built[entry.key] = entry.value;
                break;
            case "name":
            case "platform":
            case "addedDate":
            case "startDate":
            case "endDate":
            case "comment":
            case "source":
                built[entry.key] = entry.value !== undefined ? entry.value : "";
                break;
            case "log":
                built[entry.key] = entry.value !== undefined ? entry.value : "[]";
                break;
            default: {
                const _n = entry.key;
            }
        }
        collected.set(built.id, built);
    }
    const listedEntries = Array.from(collected.values());
    return listedEntries;
}
let built;
export function useDb() {
    if (!built) {
        built = build();
    }
    return built;
}
export function query(searchField, searchValue, sortFields = ["endDate", "startDate", "addedDate", "insertionId"]) {
    const db = useDb();
    const results = [];
    for (let i = 0; i < db.length; i++) {
        const built = db[i];
        if (built[searchField] === searchValue)
            results.push(built);
    }
    return results.sort((a, b) => {
        for (let i = 0; i < sortFields.length; i++) {
            const field = sortFields[i];
            const sortA = a[field];
            const sortB = b[field];
            // Do not attempt to sort if either field is falsy (aka not-sortable)
            if (!sortA || !sortB)
                continue;
            return (sortA ?? "").toString().localeCompare((sortB ?? "").toString());
        }
        return a.insertionId.toString().localeCompare(b.insertionId.toString());
    });
}
export function diff(orig, next) {
    const mutations = [];
    // Need to take union of all keys to ensure we get as many as possible!
    const keyUnion = new Set();
    Object.keys(orig).forEach((k) => keyUnion.add(k));
    Object.keys(next).forEach((k) => keyUnion.add(k));
    const keys = Array.from(keyUnion);
    const e = JSON.stringify;
    keys.forEach((key) => {
        switch (key) {
            case "status":
            case "name":
            case "platform":
            case "addedDate":
            case "startDate":
            case "endDate":
            case "comment":
            case "source":
            case "log": {
                const k = key;
                if (orig[k] !== next[k])
                    mutations.push(`prepend(${e(next.id)}, ${e(key)}, ${e(next[k])});`);
                break;
            }
            default:
                const _n = key;
                break;
        }
    });
    return mutations;
}
//# sourceMappingURL=aodb.js.map