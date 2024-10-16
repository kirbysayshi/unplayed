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
  addedDate = "added-date",
  startDate = "start-date",
  endDate = "end-date",
  source = "source",
  result = "result",
  logText = "log-text",
  logDate = "log-date",
}

enum DOMIds {
  EditStaging = "edit-staging",
}

export function EntityPanel(orig: GameEntity) {
  // given an entity, display prepend commands for an edit

  // The rendered version of the entity. The source of truth
  let next: GameEntity = {
    ...orig,
  };

  // compute platforms
  const db = useDb();
  const platforms = db.reduce((all, e) => {
    all.add(e.platform);
    return all;
  }, new Set<string>());

  let ref: HTMLFormElement;

  const getInput = (name: InputNames) =>
    ref.querySelector(`[name="${name}"]`) as HTMLInputElement;

  const getInputs = (name: InputNames) =>
    Array.from(ref.querySelectorAll(`[name="${name}"]`)) as HTMLInputElement[];

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
    const logs: ParsedLog[] = logTexts.map((text, i) => ({
      text,
      date: logDates[i],
    }));

    // update the component's notion of the entity
    next = {
      ...orig,
      status: status as Status,
      name,
      platform,
      comment,
      addedDate,
      startDate,
      endDate,
      source,
      log: JSON.stringify(logs),
    };
    // diff previous data with new
    const mutations = diff(orig, next);

    // and append to output
    setStagingForEntity(next, mutations.join("\n"));
  };

  let logSpan: HTMLSpanElement;

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

  const removeLog = (idx: number) => {
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

  return stract`
    <form
      ref=${(el: HTMLFormElement) => {
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
          ${StatusKeys.map(
            (status) =>
              `<option value="${status}" ${
                status === next.status ? "selected" : ""
              }>${status}</option>`,
          )}
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
        >${next.comment ?? ""}</textarea>
      </label>
      <label>
        Added Date
        <input
          type="date"
          name="${InputNames.addedDate}"
          value="${next.addedDate ?? ""}">
      </label>
      <label>
        Start Date
        <input
          type="date"
          name="${InputNames.startDate}"
          value="${next.startDate ?? ""}">
      </label>
      <label>
        End Date
        <input
          type="date"
          name="${InputNames.endDate}"
          value="${next.endDate ?? ""}">
      </label>
      <label>
        Source (can be URL or just text)
        <input
          type="text"
          name="${InputNames.source}"
          value="${next.source ?? ""}">
      </label>

      <fieldset>
        <legend>
          Logs
          <a
            href="#"
            onclick="${(ev: MouseEvent) => {
              ev.preventDefault();
              addLog();
            }}"
          >Add</a>
        </legend>
        <span ref="${(el: HTMLSpanElement) => {
          logSpan = el;
        }}">
          ${LogsComponent(next, removeLog)}
        </span>
      </fieldset>
    </form>
  `;
}

const LogsComponent = (
  entity: GameEntity,
  removeLog: (idx: number) => void,
) => {
  const logs: ParsedLog[] = entity.log ? JSON.parse(entity.log) : [];
  return stract`${logs.map(({ text, date }, idx) => {
    return stract`
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
        <a href="#" onclick=${(e: MouseEvent) => {
          e.preventDefault();
          removeLog(idx);
        }}>Remove Log</a>
      </label>
    `;
  })}`;
};

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
    createStagingForEntity(entity);
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

function StagedChange(entity: GameEntity) {
  return stract`
    <textarea data-entityid="${entity.id}"></textarea>
  `;
}

function getStagingForEntity(entity: GameEntity) {
  const existing = document.querySelector(
    `textarea[data-entityid="${entity.id}"]`,
  );
  if (!existing) return null;

  const area = existing as HTMLTextAreaElement;
  return area;
}

function createStagingForEntity(entity: GameEntity) {
  const existing = getStagingForEntity(entity);
  if (existing) return;

  const area = StagedChange(entity).children[0] as HTMLTextAreaElement;
  const staging = document.getElementById(DOMIds.EditStaging);
  if (!staging) return;
  staging.appendChild(area);
}

function setStagingForEntity(entity: GameEntity, changes: string) {
  const existing = getStagingForEntity(entity);
  if (!existing) return;

  const area = existing as HTMLTextAreaElement;
  area.value = changes;

  // manually setting the value does not trigger change events, so do that
  // manually.
  const evt = new Event("change", { bubbles: true });
  area.dispatchEvent(evt);
}

/**
 * Editing works by ensuring there is a hidden textarea for each entity. Then
 * when a change occurs, all the textarea values are collected into the single
 * "results" area. This avoids needing complex join/diffing of the final
 * results.
 */
export function EditInfo(existing: GameEntity[]) {
  const { editLink } = useMetadata();

  let stagingRef: HTMLDivElement;
  let resultRef: HTMLTextAreaElement;

  function handleStagingChange() {
    const staged = Array.from(stagingRef.children) as HTMLTextAreaElement[];
    const result = staged
      .map((el) => el.value)
      .filter((v) => !!v)
      .join("\n\n");
    resultRef.value = `\n${result}\n\n`;
  }

  return stract`
    <div class="flex flex-col gap-0.5">
      <h1>Edit Summary</h1>

      <div data-compose class="flex flex-col gap-0.25">

        <form
          style="display: none"
          id="${DOMIds.EditStaging}"
          ref=${(el: HTMLDivElement) => {
            stagingRef = el;
          }}
          onchange=${handleStagingChange}
        >
          ${existing.map((entity) => StagedChange(entity))}
        </form>

        <label for="${InputNames.result}">
          Tap then Copy for Github
          <textarea
            onclick="this.select()"
            name="${InputNames.result}"
            ref=${(el: HTMLTextAreaElement) => {
              resultRef = el;
            }}
          ></textarea>
        </label>
        <div>${GithubEditTpl(editLink)}</div>
      </div>
    </div>
  `;
}
