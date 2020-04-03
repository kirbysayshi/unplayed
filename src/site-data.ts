const owner = "kirbysayshi";
const repo = "unplayed";
const metadata = {
  about: `<a href="https://kirbysayshi.com">Drew Petersen</a> tried this around 2010 via Trello (blech!), fell off, and is trying again. <a href="https://github.com/kirbysayshi/unplayed">Make your own</a> if you'd like!`,
  editLink: `https://github.com/${owner}/${repo}/edit/gh-pages/games.js`
};

export function useMetadata() {
  return metadata as Readonly<typeof metadata>;
}