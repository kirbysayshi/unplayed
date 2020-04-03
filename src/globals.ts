import { prepend } from './aodb.js';
import { render } from './view.js';

// expose the data registration to the global so games.js can register mutations
(window as any).prepend = prepend;
(window as any).render = render;
