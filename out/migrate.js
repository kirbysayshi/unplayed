// This is a one-time use script to take V1 data and convert to V2.
// Keeping it in the repo just in case. But it should not be needed.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { nanoid } from "./gen-id.js";
function migrate() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch("/games.js");
        const text = yield res.text();
        let buf = "";
        window.nanoid = nanoid;
        function transform(status, name, platform, comment = "", startDate = "", endDate = "", source = "") {
            if (!name)
                return;
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
    });
}
migrate();
//# sourceMappingURL=migrate.js.map