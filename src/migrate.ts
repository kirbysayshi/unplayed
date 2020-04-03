// This is a one-time use script to take V1 data and convert to V2.
// Keeping it in the repo just in case. But it should not be needed.

import { nanoid } from "./gen-id.js";

async function migrate() {
  const res = await fetch("/games.js");
  const text = await res.text();

  type V1Entry = {
    name: string;
    platform: string;
    comment: string;
    startDate: string;
    endDate: string;
    source: string;
  };

  type Status =
    | "Unplayed"
    | "UnplayedUnreleased"
    | "UnplayedRereleased"
    | "UnplayedMiscellaneous"
    | "Unbeaten"
    | "Abandoned"
    | "Beaten";

  let buf = "";

  (window as any).nanoid = nanoid;

  function transform(
    status: Status,
    name: string,
    platform: string,
    comment = "",
    startDate = "",
    endDate = "",
    source = ""
  ) {
    if (!name) return;
    const id = nanoid();

    // console.log(arguments);

    // Ordering "newest mutation" to oldest
    buf = `
prepend(${JSON.stringify(id)}, "status", ${JSON.stringify(status)});
prepend(${JSON.stringify(id)}, "name", ${JSON.stringify(name)});
prepend(${JSON.stringify(id)}, "platform", ${JSON.stringify(platform)});
prepend(${JSON.stringify(id)}, "comment", ${JSON.stringify(comment)});
prepend(${JSON.stringify(id)}, "startDate", ${JSON.stringify(startDate)});
prepend(${JSON.stringify(id)}, "endDate", ${JSON.stringify(endDate)});
prepend(${JSON.stringify(id)}, "source", ${JSON.stringify(source)});
${buf}`;
  }

  const fnBody = `
    ${transform.toString()}
    const Unplayed = transform.bind(null, 'Unplayed');
    const UnplayedUnreleased = transform.bind(null, 'UnplayedUnreleased');
    const UnplayedRereleased = transform.bind(null, 'UnplayedRereleased');
    const UnplayedMiscellaneous = transform.bind(null, 'UnplayedMiscellaneous');
    const Unbeaten = transform.bind(null, 'Unbeaten');
    const Abandoned = transform.bind(null, 'Abandoned');
    const Beaten = transform.bind(null, 'Beaten');
    ${text}
  `;

  eval(fnBody);

  console.log(buf);
}

migrate();
