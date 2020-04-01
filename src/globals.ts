import { prepend } from './aodb.js';
import { render } from './view.js';
import { dispatch } from './edit.js';

// expose the data registration to the global so games.js can register mutations
(window as any).prepend = prepend;
(window as any).render = render;
(window as any).dispatch = dispatch;


// TODO:
// given one state, give me a new state I can append to the db
// on load, grab latest of each... ID? Unique name? Unique name + category (key series)?

// click EDIT next to an entry, show data in editor, change, then append

// click NEW next to a category, show data in editor, then append