// Function Bivariance Hack!
// https://stackoverflow.com/a/52668133
type EventHandlerCallback = {
  bivarianceHack(ev: Event): boolean | void;
}["bivarianceHack"];
type RefCallback = {
  bivarianceHack(ref: Element): void;
}["bivarianceHack"];

type InterpValue =
  | EventHandlerCallback
  | RefCallback
  | string
  | Element
  | DocumentFragment
  | Element[]
  | DocumentFragment[]
  | null
  | number;

export function stract(
  strings: TemplateStringsArray,
  ...interps: InterpValue[]
) {
  const finals: string[] = [];
  const refHandlers: { key: string; cb: RefCallback }[] = [];
  const eventHandlers: {
    key: string;
    name: string;
    cb: EventHandlerCallback;
  }[] = [];
  const elementHandlers: {
    key: string;
    el: Element | DocumentFragment | Element[] | DocumentFragment[];
  }[] = [];

  for (let i = 0; i < strings.length; i++) {
    const str = strings[i];
    const interp = interps[i];

    // console.log(str, interp)

    // Look for a Ref
    const refMatch = str.match(/ref="?$/);
    // Look for an event handler
    const eventMatch = str.match(/on([a-z]+)="?/);
    // generate a unique-ish id.
    const key = "xxxxxxxxxxxx".replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    );

    if (refMatch && typeof interp === "function") {
      // it's a ref!
      refHandlers.push({ key, cb: interp as RefCallback });
      finals.push(str, key);
    } else if (eventMatch && typeof interp === "function") {
      // it's an event handler!
      // if interp is _not_ a function, it could be a true string event handler
      const eventName = eventMatch[1];
      eventHandlers.push({
        key,
        name: eventName,
        cb: interp as EventHandlerCallback
      });
      finals.push(str, key);
    } else if (typeof interp === "string") {
      // it's just a string...
      finals.push(str, interp as string);
    } else if (typeof interp === "number") {
      finals.push(str, String(interp));
    } else if (interp && "nodeType" in interp) {
      // it's probably an element returned by another invocation of this fn.
      elementHandlers.push({
        key,
        el: interp
      });
      finals.push(str, `<span data-stract=${key}></span>`);
    } else if (Array.isArray(interp)) {
      if (Array.isArray(interp) && interp.length && "nodeType" in interp[0]) {
        // it's an element[] or DocumentFragment[]!
        elementHandlers.push({
          key,
          el: interp
        });
        finals.push(str, `<span data-stract=${key}></span>`);
      } else if (
        Array.isArray(interp) &&
        interp.length &&
        typeof interp[0] === "string"
      ) {
        // it's a string[]! Hopefully.
        finals.push(str, ...((interp as unknown) as string[]));
      }
    } else if (interp) {
      throw new Error(`Type ${typeof interp} is not a valid interpolation!`);
    } else {
      finals.push(str);
    }
  }

  const frag = document.createElement("template");
  frag.innerHTML = finals.join("");
  const { content } = frag;

  eventHandlers.forEach(desc => {
    const attr = `on${desc.name}`;
    const selector = `[${attr}='${desc.key}']`;
    const el = content.querySelector(selector)!;
    el.removeAttribute("onclick");
    el.addEventListener(desc.name, desc.cb);
  });

  // TODO: clean this up by making specific object unions for each possible interpolation value to avoid having to check for each specific type
  
  elementHandlers.forEach(desc => {
    const selector = `[data-stract='${desc.key}']`;
    const el = content.querySelector(selector)!;
    if (Array.isArray(desc.el)) {
      let referenceNode = el;
      for (let i = 0; i < desc.el.length; i++) {
        referenceNode.parentNode!.insertBefore(
          desc.el[i],
          referenceNode.nextSibling
        );
      }
      el.parentNode!.removeChild(el);
    } else {
      el.parentNode!.replaceChild(desc.el, el);
    }
  });

  refHandlers.forEach(desc => {
    const selector = `[ref='${desc.key}']`;
    const el = content.querySelector(selector)!;
    el.removeAttribute("ref");
    desc.cb(el);
  });

  return content;
}
