import { useDb, StatusKeys, diff, nextId, } from "./aodb.js";
import { stract, insertAsNextSibling } from "./stract.js";
import { useMetadata } from "./site-data.js";
// Map a symbol to the element `name` attr
var InputNames;
(function (InputNames) {
    InputNames["status"] = "status";
    InputNames["name"] = "name";
    InputNames["platform"] = "platform";
    InputNames["comment"] = "comment";
    InputNames["addedDate"] = "added-date";
    InputNames["startDate"] = "start-date";
    InputNames["endDate"] = "end-date";
    InputNames["source"] = "source";
    InputNames["result"] = "result";
    InputNames["logText"] = "log-text";
    InputNames["logDate"] = "log-date";
})(InputNames || (InputNames = {}));
export function EntityPanel(orig) {
    // given an entity, display prepend commands for an edit
    var _a, _b, _c, _d, _e;
    const { editLink } = useMetadata();
    // The rendered version of the entity. The source of truth
    let next = Object.assign({}, orig);
    // compute platforms
    const db = useDb();
    const platforms = db.reduce((all, e) => {
        all.add(e.platform);
        return all;
    }, new Set());
    let ref;
    const getInput = (name) => ref.querySelector(`[name="${name}"]`);
    const getInputs = (name) => Array.from(ref.querySelectorAll(`[name="${name}"]`));
    const handleChange = () => {
        ref.reportValidity();
        // Collect the data
        const status = getInput(InputNames.status).value;
        const name = getInput(InputNames.name).value;
        const platform = getInput(InputNames.platform).value;
        const comment = getInput(InputNames.comment).value;
        const addedDate = getInput(InputNames.addedDate).value;
        const startDate = getInput(InputNames.startDate).value;
        const endDate = getInput(InputNames.endDate).value;
        const source = getInput(InputNames.source).value;
        const logTexts = getInputs(InputNames.logText).map((el) => el.value);
        const logDates = getInputs(InputNames.logDate).map((el) => el.value);
        const logs = logTexts.map((text, i) => ({
            text,
            date: logDates[i],
        }));
        // update the component's notion of the entity
        next = Object.assign(Object.assign({}, orig), { status: status, name,
            platform,
            comment,
            addedDate,
            startDate,
            endDate,
            source, log: JSON.stringify(logs) });
        // diff previous data with new
        const mutations = diff(orig, next);
        // and append to output
        const result = getInput(InputNames.result);
        result.value = `\n${mutations.join("\n")}\n\n`;
    };
    let logSpan;
    const addLog = () => {
        // This order is important since we're not in react-land.
        // update the "next" version of the entity...
        const existing = next.log ? JSON.parse(next.log) : [];
        existing.push({ date: "", text: "" });
        next.log = JSON.stringify(existing);
        // render the list since it always uses the "next"
        logSpan.innerHTML = "";
        logSpan.appendChild(LogsComponent(next, removeLog));
        // finally call update so the dom is up to date to be read from
        handleChange();
    };
    const removeLog = (idx) => {
        // This order is important since we're not in react-land.
        // update the "next" version of the entity...
        const existing = next.log ? JSON.parse(next.log) : [];
        existing.splice(idx, 1);
        next.log = JSON.stringify(existing);
        // render the list since it always uses the "next"
        logSpan.innerHTML = "";
        logSpan.appendChild(LogsComponent(next, removeLog));
        // finally call update so the dom is up to date to be read from
        handleChange();
    };
    return stract `
    <form
      ref=${(el) => {
        ref = el;
    }}
      data-compose
      onchange=${handleChange}
      oninput=${handleChange}
    >
      <label>
        Status
        <select name="${InputNames.status}" required>
          <option value="">Choose Status</option>
          ${StatusKeys.map((status) => `<option value="${status}" ${status === next.status ? "selected" : ""}>${status}</option>`)}
        </select>
      </label>
      <label>
        Game Name
        <input type="text" name="${InputNames.name}" value="${next.name}">
      </label>
      <label>
        Platform (PSVita, Switch, PS4, PC, SNES, GBA, DS, PS2, PS3, GC, NES, etc)
        <input
          type="text"
          name="${InputNames.platform}"
          list="platforms"
          value="${next.platform}">
        <datalist id="platforms">
        ${Array.from(platforms).map((p) => `<option value="${p}">`)}
        </datalist>
      </label>
      <label>
        Comment
        <textarea
          name="${InputNames.comment}"
        >${(_a = next.comment) !== null && _a !== void 0 ? _a : ""}</textarea>
      </label>
      <label>
        Added Date
        <input
          type="date"
          name="${InputNames.addedDate}"
          value="${(_b = next.addedDate) !== null && _b !== void 0 ? _b : ""}">
      </label>
      <label>
        Start Date
        <input
          type="date"
          name="${InputNames.startDate}"
          value="${(_c = next.startDate) !== null && _c !== void 0 ? _c : ""}">
      </label>
      <label>
        End Date
        <input
          type="date"
          name="${InputNames.endDate}"
          value="${(_d = next.endDate) !== null && _d !== void 0 ? _d : ""}">
      </label>
      <label>
        Source (can be URL or just text)
        <input
          type="text"
          name="${InputNames.source}"
          value="${(_e = next.source) !== null && _e !== void 0 ? _e : ""}">
      </label>

      <fieldset>
        <legend>
          Logs
          <a
            href="#"
            onclick="${(ev) => {
        ev.preventDefault();
        addLog();
    }}"
          >Add</a>
        </legend>
        <span ref="${(el) => {
        logSpan = el;
    }}">
          ${LogsComponent(next, removeLog)}
        </span>
      </fieldset>

      <label>
        Tap then Copy for Github
        <textarea onclick="this.select()" name="${InputNames.result}"></textarea>
      </label>

      <div style="margin: 2em 0 3em;">${GithubEditTpl(editLink)}</div>
    </form>
  `;
}
const LogsComponent = (entity, removeLog) => {
    const logs = entity.log ? JSON.parse(entity.log) : [];
    return stract `${logs.map(({ text, date }, idx) => {
        return stract `
      <label>
      <input
        type="date"
        name="${InputNames.logDate}"
        value="${date}">
      </label>
      <label>
      <textarea
        name="${InputNames.logText}"
      >${text}</textarea>
      <a href="#" onclick=${(e) => {
            e.preventDefault();
            removeLog(idx);
        }}>Remove Log</a>
      </label>
    `;
    })}`;
};
function GithubEditTpl(href) {
    return `<a href="${href}" target="_blank" rel="noopener">Edit in Github</a>`;
}
export function NewEntityButton() {
    // generate an id, and then display prepend commands for new entity
    let ref;
    const createNew = (ev) => {
        ev.preventDefault();
        const entity = {
            id: nextId(),
            insertionId: -1,
            // TODO: add a "New Game" button to each category?
            // @ts-ignore Because we want the status to be unset in the UI !
            status: "",
            name: "",
            platform: "",
            comment: "",
            addedDate: "",
            startDate: "",
            endDate: "",
            source: "",
            log: "[]",
        };
        const panel = EntityPanel(entity);
        insertAsNextSibling(ref, panel);
        window.scrollBy(0, ref.nextElementSibling.clientHeight);
    };
    return stract `
    <p
      class="about"
      ref=${(el) => {
        ref = el;
    }}
    ><a href="#" onclick=${createNew}>Add Game</a></p>
  `;
}
//# sourceMappingURL=edit.js.map