import { query, useDb } from "./aodb.js";
import { EditInfo, EntityPanel, NewEntityButton } from "./edit.js";
import { stract, insertAsNextSibling } from "./stract.js";
import { useMetadata } from "./site-data.js";
function SectionTpl(name, desc) {
    return stract `
    <h1>${name}</h1>
    <p>${desc}</p>
  `;
}
function SubsectionTpl(name) {
    return stract `
    <h2>${name}</h2>
  `;
}
function EntryListTpl(entries) {
    return stract `
    <ul>
      ${entries.map((entry) => EntryTpl(entry))}
    </ul>
  `;
}
function EntryTpl(entry) {
    const start = entry.startDate ? `${entry.startDate} &mdash; ` : "";
    const end = entry.endDate || "";
    const dates = start || end ? stract `<p class="date">${start}${end}</p>` : "";
    const source = !entry.source
        ? ""
        : entry.source.match(/http|www|[a-z]\.[a-z]/)
            ? `<a href="${entry.source}">${entry.source}</a>`
            : `Rec: ${entry.source}`;
    const logs = (entry.log ? JSON.parse(entry.log) : []);
    let liRef;
    let editing = false;
    function showEditPanel() {
        if (editing)
            return;
        editing = true;
        liRef.style.animation = "";
        const editPanel = EntityPanel(entry);
        insertAsNextSibling(liRef, editPanel);
    }
    return stract `
    <li
      ref=${(el) => {
        liRef = el;
    }}
    >
      <button
        class="name"
        data-name
        type="button"
        onclick=${showEditPanel}
      >${entry.name}</button>
      <span class="platform" data-platform>${entry.platform}</span>
      ${entry.comment
        ? `<p class="comment" data-comment>${entry.comment}</p>`
        : ""}
      ${entry.source ? `<p class="source">${source}</p>` : ""}
      ${logs.map(({ date, text }) => `<p class="log">${date}: ${text}</p>`)}
      ${dates}
    </li>
  `;
}
function UnplayedTpl() {
    return stract `
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
    ${SectionTpl("Abandoned", "Sometimes I get distracted, sometimes it's the game.")}
    ${EntryListTpl(query("status", "Abandoned"))}
    </div>

    ${NewEntityButton()}

    ${EditInfo(useDb())}

    <h1>What!?</h1>
    <p class="about">
    ${useMetadata().about} This is a shameless rip-off of Shaun Inman's
      <a href="https://shauninman.com/unplayed">Unplayed</a>. The intent
      is to help anyone maintain their own list in a similar style.
    </p>
  `;
}
export function render() {
    const el = document.createElement("div");
    el.className = "root";
    el.appendChild(UnplayedTpl());
    document.body.appendChild(el);
}
//# sourceMappingURL=view.js.map