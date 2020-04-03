import { useDb, StatusKeys, diff, nextId } from "./aodb.js";
import { stract, insertAsNextSibling } from "./stract.js";
import { useMetadata } from "./site-data.js";
// Map a symbol to the element `name` attr
var InputNames;
(function (InputNames) {
    InputNames["status"] = "status";
    InputNames["name"] = "name";
    InputNames["platform"] = "platform";
    InputNames["comment"] = "comment";
    InputNames["startDate"] = "start-date";
    InputNames["endDate"] = "end-date";
    InputNames["source"] = "source";
    InputNames["result"] = "result";
})(InputNames || (InputNames = {}));
export function EntityPanel(entity) {
    // given an entity, display prepend commands for an edit
    const { editLink } = useMetadata();
    // compute platforms
    const db = useDb();
    const platforms = db.reduce((all, e) => {
        all.add(e.platform);
        return all;
    }, new Set());
    let ref;
    const getInput = (name) => ref.querySelector(`[name="${name}"]`);
    const handleChange = () => {
        // Collect the data
        const status = getInput(InputNames.status).value;
        const name = getInput(InputNames.name).value;
        const platform = getInput(InputNames.platform).value;
        const comment = getInput(InputNames.comment).value;
        const startDate = getInput(InputNames.startDate).value;
        const endDate = getInput(InputNames.endDate).value;
        const source = getInput(InputNames.source).value;
        // diff previous data with new
        const orig = entity;
        const next = Object.assign(Object.assign({}, entity), { status: status, name,
            platform,
            comment,
            startDate,
            endDate,
            source });
        const mutations = diff(orig, next);
        // and append to output
        const result = getInput(InputNames.result);
        result.value = `\n${mutations.join("\n")}\n\n`;
    };
    return stract `
    <div
      ref=${(el) => {
        ref = el;
    }}
      data-compose
      onchange=${handleChange}
      oninput=${handleChange}
    >
      <label>
        Status
        <select name="${InputNames.status}">
          ${StatusKeys.map((status) => `<option value="${status}" ${status === entity.status ? "selected" : ""}>${status}</option>`)}
        </select>
      </label>
      <label>
        Game Name
        <input type="text" name="${InputNames.name}" value="${entity.name}">
      </label>
      <label>
        Platform (PSVita, Switch, PS4, PC, SNES, GBA, DS, PS2, PS3, GC, NES, etc)
        <input type="text" name="${InputNames.platform}" list="platforms" value="${entity.platform}">
        <datalist id="platforms">
        ${Array.from(platforms).map((p) => `<option value="${p}">`)}
        </datalist>
      </label>
      <label>
        Comment
        <textarea name="${InputNames.comment}">${entity.comment}</textarea>
      </label>
      <label>
        Start Date
        <input
          type="date"
          name="${InputNames.startDate}"
          value="${entity.startDate}">
      </label>
      <label>
        End Date
        <input
          type="date"
          name="${InputNames.endDate}"
          value="${entity.endDate}">
      </label>
      <label>
        Source (can be URL or just text)
        <input type="text" name="${InputNames.source}" value="${entity.source}">
      </label>

      <label>
        Tap then Copy for Github
        <textarea onclick="this.select()" name="${InputNames.result}"></textarea>
      </label>

      <div style="margin: 2em 0 3em;">${GithubEditTpl(editLink)}</div>
    </div>
  `;
}
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
            status: "Unplayed",
            name: "",
            platform: "",
            comment: "",
            startDate: "",
            endDate: "",
            source: "",
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