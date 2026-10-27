# Blackharbor

Slop Browser-Based Superhero Game Inspired By Kingdom Death: Monster. Investigate villains, fight them on hex lairs, and build up your HQ between issues.

**Play:** this repository's GitHub Pages site.

## Files

The game is plain HTML, CSS and JavaScript with no build step. Every push to `main` publishes these files to Pages as they are.

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

To play locally, open `index.html` in a browser. To undo a change, revert its commit and push.

Saves live in the browser (localStorage) for this site's address only.
