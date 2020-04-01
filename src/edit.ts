import { GameEntity, useDb, StatusKeys, EntityId, query } from "./aodb.js";
import { stract } from "./stract.js";

export enum Actions {
  ComputeResult,
  EditEntity,
  NewEntity,
}



export const dispatch = (action: Actions, entityId?: EntityId) => {

  switch (action) {

    case Actions.ComputeResult: {
      break;
    }

    case Actions.EditEntity: {
      if (!entityId) throw new Error('EntityId was not received!');
      const entity = query('id', entityId);
      console.log('entity', entity);
      break;
    }

    case Actions.NewEntity: {
      break;
    }

    default: {
      const _n: never = action;
    }
  }
}

export function EntityPanel(ghHref: string) {
  // const panel = document.createElement("div");
  // panel.setAttribute("data-compose", "");

  return stract`
  `
}

function EditEntityPanel(ghHref: string, entity: GameEntity) {
  // given an entity, display prepend commands for an edit

  // compute platforms
  const db = useDb();
  const platforms = db.reduce((all, e) => {
    all.add(e.platform);
    return all;
  }, new Set());

  return `
    <label>
      Status
      <select name="status">
        ${StatusKeys.map(
          name => `<option value="${name}">${name}</option>`
        )}
      </select>
    </label>
    <label>
      Game Name
      <input type="text" name="game-name">
    </label>
    <label>
      Platform (PSVita, Switch, PS4, PC, SNES, GBA, DS, PS2, PS3, GC, NES, etc)
      <input type="text" name="platform" list="platforms">
      <datalist id="platforms">
      ${Array.from(platforms).map(p => `<option value="${p}">`)}
      </datalist>
    </label>
    <label>
      Comment
      <textarea name="comment"></textarea>
    </label>
    <label>
      Start Date
      <input type="date" name="start-date">
    </label>
    <label>
      End Date
      <input type="date" name="end-date">
    </label>
    <label>
      Source (can be URL or just text)
      <input type="text" name="source">
    </label>

    <label>
      Tap then Copy for Github
      <input name="result" type="text">
    </label>

    <div style="margin: 2em 0 3em;">${GithubEditTpl(ghHref)}</div>
  `
}

function GithubEditTpl(href: string) {
  return `<a href="${href}" target="_blank" rel="noopener">Edit in Github</a>`;
}

export function NewEntityPanel() {
  // generate an id, and then display prepend commands for new entity
}