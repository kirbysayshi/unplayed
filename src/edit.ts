import {
  GameEntity,
  useDb,
  StatusKeys,
  Status,
  diff,
  nextId,
  ParsedLog,
} from "./aodb.js";
import { stract, insertAsNextSibling } from "./stract.js";
import { useMetadata } from "./site-data.js";

// Map a symbol to the element `name` attr
enum InputNames {
  status = "status",
  name = "name",
  platform = "platform",
  comment = "comment",
  startDate = "start-date",
  endDate = "end-date",
  source = "source",
  result = "result",
  logText = "log-text",
  logDate = "log-date",
}

export function EntityPanel(entity: GameEntity) {
  // given an entity, display prepend commands for an edit

  const { editLink } = useMetadata();

  // compute platforms
  const db = useDb();
  const platforms = db.reduce((all, e) => {
    all.add(e.platform);
    return all;
  }, new Set());

  let ref: HTMLDivElement;

  const getInput = (name: InputNames) =>
    ref.querySelector(`[name="${name}"]`) as HTMLInputElement;

  const getInputs = (name: InputNames) =>
    Array.from(ref.querySelectorAll(`[name="${name}"]`)) as HTMLInputElement[];

  const handleChange = () => {
    // Collect the data
    const status = getInput(InputNames.status).value;
    const name = getInput(InputNames.name).value;
    const platform = getInput(InputNames.platform).value;
    const comment = getInput(InputNames.comment).value;
    const startDate = getInput(InputNames.startDate).value;
    const endDate = getInput(InputNames.endDate).value;
    const source = getInput(InputNames.source).value;

    const logTexts = getInputs(InputNames.logText).map((el) => el.value);
    const logDates = getInputs(InputNames.logDate).map((el) => el.value);
    const logs: ParsedLog[] = logTexts.map((text, i) => ({
      text,
      date: logDates[i],
    }));

    // diff previous data with new
    const orig = entity;
    const next: GameEntity = {
      ...entity,
      status: status as Status,
      name,
      platform,
      comment,
      startDate,
      endDate,
      source,
      log: JSON.stringify(logs),
    };
    const mutations = diff(orig, next);

    // and append to output
    const result = getInput(InputNames.result) as HTMLInputElement;
    result.value = `\n${mutations.join("\n")}\n\n`;
  };

  let logSpan: HTMLSpanElement;
  const logs: ParsedLog[] = entity.log ? JSON.parse(entity.log) : [];

  const addLog = () => {
    logs.push({ date: "", text: "" });
    logSpan.innerHTML = "";
    logSpan.appendChild(LogsComponent());
    handleChange();
  };

  const removeLog = (idx: number) => {
    logs.splice(idx, 1);
    logSpan.innerHTML = "";
    logSpan.appendChild(LogsComponent());
    handleChange();
  };

  const LogsComponent = () =>
    stract`${logs.map(({ text, date }, idx) => {
      return stract`
        <input
          type="date"
          name="${InputNames.logDate}"
          value="${date}">
        <input
          type="text"
          name="${InputNames.logText}"
          value="${text}">
        <button onclick=${(e: MouseEvent) => {
          e.stopPropagation();
          removeLog(idx);
        }}>Remove Log</button>
      `;
    })}`;

  return stract`
    <div
      ref=${(el: HTMLDivElement) => {
        ref = el;
      }}
      data-compose
      onchange=${handleChange}
      oninput=${handleChange}
    >
      <label>
        Status
        <select name="${InputNames.status}">
          ${StatusKeys.map(
            (status) =>
              `<option value="${status}" ${
                status === entity.status ? "selected" : ""
              }>${status}</option>`
          )}
        </select>
      </label>
      <label>
        Game Name
        <input type="text" name="${InputNames.name}" value="${entity.name}">
      </label>
      <label>
        Platform (PSVita, Switch, PS4, PC, SNES, GBA, DS, PS2, PS3, GC, NES, etc)
        <input
          type="text"
          name="${InputNames.platform}"
          list="platforms"
          value="${entity.platform}">
        <datalist id="platforms">
        ${Array.from(platforms).map((p) => `<option value="${p}">`)}
        </datalist>
      </label>
      <label>
        Comment
        <textarea
          name="${InputNames.comment}"
        >${entity.comment ?? ""}</textarea>
      </label>
      <label>
        Start Date
        <input
          type="date"
          name="${InputNames.startDate}"
          value="${entity.startDate ?? ""}">
      </label>
      <label>
        End Date
        <input
          type="date"
          name="${InputNames.endDate}"
          value="${entity.endDate ?? ""}">
      </label>
      <label>
        Source (can be URL or just text)
        <input
          type="text"
          name="${InputNames.source}"
          value="${entity.source ?? ""}">
      </label>
      <label>
        Logs <button onclick="${addLog}">Add Log</button>

        <span ref="${(el: HTMLSpanElement) => {
          logSpan = el;
        }}">
          ${LogsComponent()}
        </span>
        
        
      </label>

      <label>
        Tap then Copy for Github
        <textarea onclick="this.select()" name="${
          InputNames.result
        }"></textarea>
      </label>

      <div style="margin: 2em 0 3em;">${GithubEditTpl(editLink)}</div>
    </div>
  `;
}

function GithubEditTpl(href: string) {
  return `<a href="${href}" target="_blank" rel="noopener">Edit in Github</a>`;
}

export function NewEntityButton() {
  // generate an id, and then display prepend commands for new entity

  let ref: Element;

  const createNew = (ev: Event) => {
    ev.preventDefault();
    const entity: GameEntity = {
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
      log: "",
    };

    const panel = EntityPanel(entity);
    insertAsNextSibling(ref, panel);
    window.scrollBy(0, ref.nextElementSibling!.clientHeight);
  };

  return stract`
    <p
      class="about"
      ref=${(el: Element) => {
        ref = el;
      }}
    ><a href="#" onclick=${createNew}>Add Game</a></p>
  `;
}
