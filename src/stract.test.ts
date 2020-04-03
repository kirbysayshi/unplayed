import { stract } from "./stract.js";

function onClick(e: MouseEvent) {
  console.log("I was clicked!", e.clientX);
}

function getRef(ref: Element) {
  console.log("refed!", ref);
}

function Div() {
  return stract`<div>
    <p ref="${getRef}">
      ${[Btn(), Btn()]}
    </p>
  </div>`;
}

function Btn() {
  return stract`<button onclick=${onClick}>Click Me ${"George"}</button>`;
}

// const dom = Btn();
const dom = Div();

console.log(dom);
document.body.appendChild(dom);
