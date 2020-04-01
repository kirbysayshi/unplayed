import { query, GameEntity } from "./aodb.js";
import { EntityPanel, Actions, dispatch } from "./edit.js";
import { stract } from "./stract.js";

function SectionTpl(name: string, desc: string) {
  return stract`
    <h1>${name}</h1>
    <p>${desc}</p>
  `;
}

function SubsectionTpl(name: string) {
  return stract`
    <h2>${name}</h2>
  `;
}

function EntryListTpl(entries: GameEntity[]) {
  return stract`
    <ul>
      ${entries.map(entry => EntryTpl(entry))}
    </ul>
  `;
}

function EntryTpl(entry: GameEntity) {
  const start = entry.startDate && `${entry.startDate} &mdash; `;
  const end = entry.endDate;
  const dates = start || end ? `<p class="date">${start}${end}</p>` : "";
  const source = entry.source.match(/http|www|[a-z]\.[a-z]/)
    ? `<a href="${entry.source}">${entry.source}</a>`
    : entry.source
    ? `Rec: ${entry.source}`
    : "";

  const onEdit = () => {
    dispatch(Actions.EditEntity, entry.id);
  };

  // TODO: I wish there were a way to make this less fiddly & verbose
  let liRef: HTMLLIElement;

  const lpDuration = 1000;
  let toRef: undefined | number;
  const startPress = (e: Event) => {
    clearTimeout(toRef);
    toRef = setTimeout(() => {
      liRef.style.animation = '';
      alert('EDIT');
    }, lpDuration);

    if (!liRef) return
    liRef.style.animation = 'longpress-fill';
    liRef.style.animationDuration = `${String(lpDuration / 1000)}s`;
    liRef.style.animationTimingFunction = 'ease-out';
  };
  const endPress = (e: Event) => {
    clearTimeout(toRef);
    toRef = undefined;
    liRef.style.animation = '';
  };

  return stract`
    <li
      ref=${(el: HTMLLIElement) => {liRef = el}}
      onmousedown=${startPress}
      ontouchstart=${startPress}

      onmouseup=${endPress}
      onmouseleave=${endPress}
      ontouchend=${endPress}
      ontouchcancel=${endPress}
      ontouchleave=${endPress}
    >
      <span class="name" data-name>${entry.name}</span>
      <span class="platform" data-platform>${entry.platform}</span>
      ${
        entry.comment
          ? `<p class="comment" data-comment>${entry.comment}</p>`
          : ""
      }
      ${entry.source ? `<p class="source">${source}</p>` : ""}
      ${dates}
    </li>
  `;
}

function UnplayedTpl() {
  // TODO: make these configurable externally
  const owner = "kirbysayshi";
  const repo = "unplayed";
  const metadata = {
    about: `<a href="https://kirbysayshi.com">Drew Petersen</a> tried this around 2010 via Trello (blech!), fell off, and is trying again. <a href="https://github.com/kirbysayshi/unplayed">Make your own</a> if you'd like!`,
    editLink: `https://github.com/${owner}/${repo}/edit/gh-pages/games.js`
  };

  return stract`
    <div class="list-section">
    ${SectionTpl("Unplayed", "Maybe I'll play these.")}
    ${EntryListTpl(query("status", "Unplayed"))}
    ${SubsectionTpl("Rereleased")}
    ${EntryListTpl(query("status", "UnplayedRereleased"))}
    ${SubsectionTpl("Unreleased")}
    ${EntryListTpl(query("status", "UnplayedUnreleased"))}
    ${SubsectionTpl("Miscellaneous")}
    ${EntryListTpl(query("status", "UnplayedMiscellaneous"))}
    </div>

    <div class="list-section">
    ${SectionTpl("Unbeaten", "I tend to take a while.")}
    ${EntryListTpl(query("status", "Unbeaten"))}
    </div>

    <div class="list-section">
    ${SectionTpl("Beaten", 'Or just considered "finished".')}
    ${EntryListTpl(query("status", "Beaten"))}
    </div>

    <div class="list-section">
    ${SectionTpl(
      "Abandoned",
      "Sometimes I get distracted, sometimes it's the game."
    )}
    ${EntryListTpl(query("status", "Abandoned"))}
    </div>

    <p class="about">
    ${metadata.about} This is a shameless rip-off of Shaun Inman's
      <a href="https://shauninman.com/unplayed">Unplayed</a>. The intent
      is to help anyone maintain their own list in a similar style.
    </p>

    ${EntityPanel(metadata.editLink)}
  `;
}

export function render() {
  const el = document.createElement("div");
  el.className = "root";
  el.appendChild(UnplayedTpl());
  document.body.appendChild(el);
}
