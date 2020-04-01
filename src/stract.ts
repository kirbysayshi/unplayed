// Function Bivariance Hack!
// https://stackoverflow.com/a/52668133
type EventHandlerCallback = {
  bivarianceHack(ev: Event): boolean | void;
}["bivarianceHack"];
type RefCallback = {
  bivarianceHack(ref: Element): void;
}["bivarianceHack"];

type ElementLike = Element | DocumentFragment;

type InterpValue =
  // specials
  | EventHandlerCallback
  | RefCallback

  // primitives for concat
  | string
  | null
  | number

  // objects w/ special handling
  | ElementLike

  // Arrays of any of the primitives or objects
  | (string | null | number | ElementLike)[]

  ;

function isEvHandlerCallback(
  match: RegExpMatchArray | null,
  v: InterpValue
): v is EventHandlerCallback {
  return match !== null && typeof v === "function";
}

function isRefHandler(
  match: RegExpMatchArray | null,
  v: InterpValue
): v is RefCallback {
  return match !== null && typeof v === "function";
}

function isString(v: InterpValue): v is string {
  return typeof v === "string";
}

function isNumber(v: InterpValue): v is number {
  return typeof v === "number";
}

function isElementLike(v: InterpValue): v is ElementLike {
  return (
    v !== null &&
    typeof v !== "string" &&
    typeof v !== "number" &&
    typeof v !== "function" &&
    !Array.isArray(v) &&
    "nodeType" in v
  );
}

export function stract(
  strings: TemplateStringsArray,
  ...interps: InterpValue[]
) {
  const finals: string[] = [];
  const refs: { key: string; cb: RefCallback }[] = [];
  const events: {
    key: string;
    name: string;
    cb: EventHandlerCallback;
  }[] = [];
  const elements: {
    key: string;
    el: ElementLike | ElementLike[]
  }[] = [];

  for (let i = 0; i < strings.length; i++) {
    const str = strings[i];
    const interp = interps[i];

    // Look for a Ref
    const refMatch = str.match(/ref="?$/);
    // Look for an event handler
    const eventMatch = str.match(/on([a-z]+)="?/);
    // generate a unique-ish id.
    const key = "xxxxxxxxxxxx".replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    );

    if (interp === undefined) {
      // interp could be undefined
      finals.push(str);
    } else if (isRefHandler(refMatch, interp)) {

      refs.push({ key, cb: interp });
      finals.push(str, key);

    } else if (isEvHandlerCallback(eventMatch, interp)) {
      if (!eventMatch) throw new Error('Unreachable');
      const eventName = eventMatch[1];
      events.push({
        key,
        name: eventName,
        cb: interp
      });
      finals.push(str, key);

    } else if (isString(interp)) {
      finals.push(str, interp);
    } else if (isNumber(interp)) {
      finals.push(str, String(interp));
    } else if (isElementLike(interp)) {
      elements.push({
        key,
        el: interp
      });
      finals.push(str, `<span data-stract=${key}></span>`);
    } else if (Array.isArray(interp)) {
      finals.push(str);

      // It's repetitious, but simpler than recursing, for now... I think.

      for (let j = 0; j < interp.length; j++) {
        const sub = interp[j];
        if (isString(sub)) {
          finals.push(sub);
        } else if (isNumber(sub)) {
          finals.push(String(sub));
        } else if (isElementLike(sub)) {
          elements.push({
            key,
            el: sub
          });
          finals.push(`<span data-stract=${key}></span>`);
        }
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

  events.forEach(desc => {
    const attr = `on${desc.name}`;
    const selector = `[${attr}='${desc.key}']`;
    const el = content.querySelector(selector)!;
    el.removeAttribute(attr);
    el.addEventListener(desc.name, desc.cb);
  });

  elements.forEach(desc => {
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

  refs.forEach(desc => {
    const selector = `[ref='${desc.key}']`;
    const el = content.querySelector(selector)!;
    el.removeAttribute("ref");
    desc.cb(el);
  });

  return content;
}
