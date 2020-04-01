import { stract } from "./stract.js";
function onClick(e) {
    console.log("I was clicked!", e.clientX);
}
function getRef(ref) {
    console.log("refed!", ref);
}
function Div() {
    return stract `<div>
    <p ref="${getRef}">
      ${Btn()}
    </p>
  </div>`;
}
function Btn() {
    return stract `<button onclick=${onClick}>Click Me ${"George"}</button>`;
}
const dom = Div();
console.log(dom);
document.body.appendChild(dom);
// interface FnCallback {
//   (ev: Event): boolean;
//   (ref: Element): void;
// }
// function check2(fn: FnCallback) {
//   console.log(fn);
// }
// check2((ev: Event) => true); 
// check2((ref: Element) => {});
// function check(...fn: FnCallback[]) {
//   console.log(fn);
// }
// check((ev: Event) => true); 
// check((ref: Element) => {});
//# sourceMappingURL=stract.test.js.map