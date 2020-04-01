import { build, keyValue } from './aodb.js';
// expose the data registration to the global so games.js can register mutations
window.keyValue = keyValue;
window.buildDb = build;
//# sourceMappingURL=render.js.map