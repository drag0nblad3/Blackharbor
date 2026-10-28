# Blackharbor

Slop Browser-Based Superhero Game Inspired By Kingdom Death: Monster. Investigate villains, fight them on hex lairs, and build up your HQ between issues.

**Play:** this repository's GitHub Pages site.

## Files

The game is plain HTML, CSS and JavaScript with no build step. Every merge into `main` publishes these files to Pages as they are.

| File | What it holds |
| --- | --- |
| `index.html` | The page: loads the files below in order and starts the game |
| `game.css` | Layout and UI styles |
| `data.js` | Data tables: heroes, powers, gear, sets, villains, case files, splash quotes, facilities, glossary |
| `game.js` | Campaign rules, HQ, investigations, origin stories, tutorial, saves and screens |
| `battle.js` | Fights: hex board, villain and henchman turns, hazards, attacks, powers, abilities and the battle screen |
| `art.css` | Art styles: splash looks, standees, minis, lair floors, playbook pages |
| `sprite.js` | The SVG icon and emblem sprite |
| `art.js` | Drawing code for portraits, standees, lairs and minis |

`tools/` holds headless helpers for checking data and running balance sims (Node, no install needed); see [tools/README.md](tools/README.md). They are not published to the site.

To play locally, open `index.html` in a browser.

## Making a change

`main` is the live game and only changes through pull requests. Every game change is played on the preview site first, and Tyler OKs it there before anything goes to `main`.

1. Start from the latest `main` and make a branch: `git switch main && git pull && git switch -c <name>/<short-topic>` (for example `claude/payload-bomb-range` or `tyler/new-splash-quotes`).
2. Edit the files at the repo root. Check data and balance with `node tools/q.js ...` and `node tools/sim.js ...` from the repo root, and layouts with `node tools/shots.js` for UI changes.
3. Commit with messages that say what changed in the game, and push the branch.
4. Publish the branch to the preview: `sh tools/preview.sh`. It copies the game files into [Blackharbor-preview](https://github.com/drag0nblad3/Blackharbor-preview), which deploys them to **https://drag0nblad3.github.io/Blackharbor-preview/** in about a minute. The preview has its own save slot and a pink PREVIEW tag naming the branch and commit. It shows one branch at a time, the last one published.
5. Play it there, then ask Tyler to try the preview link. Nothing goes to `main` until Tyler says it is good.
6. After Tyler's OK, open a pull request into `main`. The description says what players will notice, which files changed, and how it was checked. Tyler merges, and Pages deploys the live game within about a minute.

Changes that do not touch the game files (docs, tools/) skip the preview and go straight to a pull request.

To undo a change that is already live, open a pull request that reverts its merge commit (GitHub's "Revert" button on the merged pull request does this).

Saves live in the browser (localStorage). The live game and the preview share one address (drag0nblad3.github.io), so the preview deploy renames the save key to `blackharbor-v4-preview` and the two never touch each other's saves.
