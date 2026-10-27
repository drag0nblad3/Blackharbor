# Blackharbor

Slop Browser-Based Superhero Game Inspired By Kingdom Death: Monster. Investigate villains, fight them on hex lairs, and build up your HQ between issues.

**Play:** this repository's GitHub Pages site.

## How it is built

- `Blackharbor.html` is the whole game in one file and the only file to edit.
- On every push to `main`, the workflow in `.github/workflows/pages.yml` runs `tools/split.js`, which cuts the file into `index.html`, `game.css`, `data.js`, `game.js`, `art.css`, `sprite.js` and `art.js`, and publishes them to Pages.
- To try a build locally: `node tools/split.js site`, then open `site/index.html`.
- To undo a change, revert its commit and push.

Saves live in the browser (localStorage) for this site's address only.
