var games = (window.games = {});

games.Unplayed = {
  Released: [],
  Rereleased: [],
  Unreleased: [],
  Miscellaneous: []
};
games.Unbeaten = [];
games.Abandoned = [];
games.Beaten = [];

const UnplayedUnreleased = createPusher(games.Unplayed.Unreleased);
const Unplayed = createPusher(games.Unplayed.Released);
const UnplayedRereleased = createPusher(games.Unplayed.Rereleased);
const UnplayedMiscellaneous = createPusher(games.Unplayed.Miscellaneous);
const Unbeaten = createPusher(games.Unbeaten);
const Abandoned = createPusher(games.Abandoned);
const Beaten = createPusher(games.Beaten);

function createPusher(state) {
  return function(name, platform, comment) {
    if (!name) return;
    const idx = state.push(Entry(...arguments)) - 1;
    return startDate => {
      state[idx] = Entry(name, platform, comment, startDate);
      return endDate => {
        state[idx] = Entry(name, platform, comment, startDate, endDate);
      };
    };
  };
}

function Entry(name, platform, comment = "", startDate = "", endDate = "") {
  return { name, platform, comment, startDate, endDate };
}

var metadata = { about: "", editLink: "" };

function About(comment) {
  metadata.about = comment;
}

function Edit(owner, repo) {
  metadata.editLink = `https://github.com/${owner}/${repo}/edit/gh-pages/games.js`;
}

function EntryListTpl(entries) {
  return `
    <ul>
      ${entries.map(entry => EntryTpl(entry)).join("\n")}
    </ul>
  `;
}

function EntryTpl(entry) {
  const start = entry.startDate && `${entry.startDate} &mdash; `;
  const end = entry.endDate;
  const dates = start || end ? `<p class="date">${start}${end}</p>` : "";
  return `
    <li>
      <span class="name" data-name>${entry.name}</span>
      <span class="platform" data-platform>${entry.platform}</span>
      ${
        entry.comment
          ? `<p class="comment" data-comment>${entry.comment}</p>`
          : ""
      }
      ${dates}
    </li>
  `;
}

function SectionTpl(name, desc) {
  return `
    <h1>${name}</h1>
    <p>${desc}</p>
  `;
}

function SubsectionTpl(name) {
  return `
    <h2>${name}</h2>
  `;
}

function GithubEditTpl(href) {
  return `<a href="${href}" target="_blank" rel="noopener">Edit in Github</a>`;
}

function EditPanelTpl(ghHref) {
  const panel = document.createElement("div");
  panel.setAttribute("data-compose", "");

  const pushers = {
    Unplayed,
    UnplayedUnreleased,
    UnplayedRereleased,
    UnplayedMiscellaneous,
    Unbeaten,
    Abandoned,
    Beaten
  };

  // TODO: do this in a less hacky way.
  const platforms = new Set();
  [
    games.Unplayed.Released,
    games.Unplayed.Rereleased,
    games.Unplayed.Unreleased,
    games.Unplayed.Miscellaneous,
    games.Unbeaten,
    games.Abandoned,
    games.Beaten
  ].forEach(entries => {
    entries.forEach(entry => {
      platforms.add(entry.platform);
    });
  });

  panel.innerHTML = `
    <label>
      Status
      <select name="status">
        ${Object.keys(pushers).map(
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
      Tap then Copy for Github
      <input name="result" type="text">
    </label>

    <div style="margin: 2em 0 3em;">${GithubEditTpl(ghHref)}</div>
  `;

  function createEntryText() {
    const escape = txt => txt.replace(/"/gm, '\\"');
    const status = panel.querySelector("[name=status]").value;
    const gameName = escape(panel.querySelector("[name=game-name]").value);
    const platform = escape(panel.querySelector("[name=platform]").value);
    const comment = escape(panel.querySelector("[name=comment]").value);
    const startDate = escape(panel.querySelector("[name=start-date]").value);
    const endDate = escape(panel.querySelector("[name=end-date]").value);

    return `${status}("${gameName}", "${platform}", "${comment}")("${startDate}")("${endDate}");`;
  }

  function setResultValue() {
    const result = panel.querySelector("[name=result]");
    result.value = createEntryText();
  }

  panel.oninput = function(e) {
    setResultValue();
  };

  panel.onchange = function(e) {
    setResultValue();
  };

  window.toggleCompose = function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (panel.parentNode) {
      panel.parentNode.removeChild(panel);
    } else {
      document.querySelector(".root").appendChild(panel);
      window.scrollBy(0, panel.clientHeight);
    }
  };

  setResultValue();

  return `
    <p class="about">
      <a href="#" onclick="toggleCompose(event)">Prepare Mobile Edit</a>
    </p>
  `;
}

function UnplayedTpl() {
  return `
    <div class="list-section">
    ${SectionTpl("Unplayed", "Maybe I'll play these.")}
    ${EntryListTpl(games.Unplayed.Released)}
    ${SubsectionTpl("Rereleased")}
    ${EntryListTpl(games.Unplayed.Rereleased)}
    ${SubsectionTpl("Unreleased")}
    ${EntryListTpl(games.Unplayed.Unreleased)}
    ${SubsectionTpl("Miscellaneous")}
    ${EntryListTpl(games.Unplayed.Miscellaneous)}
    </div>

    <div class="list-section">
    ${SectionTpl("Unbeaten", "I tend to take a while.")}
    ${EntryListTpl(games.Unbeaten)}
    </div>

    <div class="list-section">
    ${SectionTpl("Beaten", 'Or just considered "finished".')}
    ${EntryListTpl(games.Beaten)}
    </div>

    <div class="list-section">
    ${SectionTpl(
      "Abandoned",
      "Sometimes I get distracted, sometimes it's the game."
    )}
    ${EntryListTpl(games.Abandoned)}
    </div>

    <p class="about">
    ${metadata.about} This is a shameless rip-off of Shaun Inman's
      <a href="https://shauninman.com/unplayed">Unplayed</a>. The intent
      is to help anyone maintain their own list in a similar style.
    </p>

    ${EditPanelTpl(metadata.editLink)}
  `;
}

function render() {
  const data = UnplayedTpl();
  const el = document.createElement("div");
  el.className = "root";
  el.innerHTML = data;
  document.body.appendChild(el);
}
