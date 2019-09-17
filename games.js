About(
  '<a href="https://kirbysayshi.com">Drew Petersen</a> tried this around 2010 via Trello (blech!), fell off, and is trying again. <a href="https://github.com/kirbysayshi/unplayed-template">Make your own</a> if you\'d like!'
);
Edit("kirbysayshi", "unplayed-template");

/**
 * Cheats / Hints:
 *
 * For all:
 *  (
 *    name,
 *    platform,
 *    comment = ''
 *  )
 *  (startDate = '')
 *  (endDate = '');
 *
 * UnplayedUnreleased
 * Unplayed
 * UnplayedRereleased
 * UnplayedMiscellaneous
 * Unbeaten
 * Abandoned
 * Beaten
 *
 * Empty calls (`Unbeaten()` or `Unbeaten('')`)
 * will be ignored.
 */

Unplayed("Slay the Spire", "Switch");
Unplayed("");

UnplayedUnreleased("Final Fantasy VII Remake", "PS4");
UnplayedUnreleased("");

Unbeaten("Legend of Zelda, Breath of the Wild", "Switch");
Unbeaten("Spiderman", "PS4")("2019-06-29");
Unbeaten("Silent Hill 2", "PS2")("2019-06-22");
Unbeaten("Destiny 2", "PS4")("2019-06-15")
Unbeaten("Final Fantasy IX", "PSVita (PSOne)")("2019-06-29");
Unbeaten("");

Beaten(
  "Final Fantasy VI",
  "GBA",
  "+Sound Restore Patch, +Color Correction Patch. 39h:30m"
)()("2019-06-28");
Beaten(
  "Cadence of Hyrule",
  "Switch",
  "Zelda all the way! Didn't really use other characters. Some of the best music remixes too."
)("2019-07-06")("2019-08-03");
Beaten("Celeste", "Switch", "Finished summit at 4AM. Finished the core the next day. An emotional wallop that left me in a mental soft spot for a week! Amazing marriage of gameplay and theme.")("2019-08-07")("2019-08-10");
Beaten("");

Abandoned("Crypt of the Necrodancer", "PSVita", "Brutal");
Abandoned("");
