# Tactical hero actions — development plan

Branch: `feature/tactical-hero-actions` (based on `main`).

## Scope
Add two universal hero actions without changing the core attack or movement rules:

1. **Take Cover** — spend the hero's action to gain +2 evasion until the next round. Implement a dedicated temporary field on the combat unit (not a permanent hero stat); include it in evasion calculations and reset it with other round-based effects.
2. **Rally** — spend the hero's action to restore up to 2 composure to the selected hero. First release uses self-targeting only to keep controls simple; adjacent-ally targeting can follow after testing.

## Existing integration points
- `battle.js`: `startShowdown`, `damageHero`, `villainPhase`, combat controls in the fight renderer (~lines 923–959), and `act(fn)` (~975).
- `game.js`: action dispatcher near `case 'escort'`, `case 'hack'`, `case 'endround'` (~1707–1713).
- `game.js`: `save()` and `load()` (~527–531), using localStorage.
- Existing hero-unit flags include `acted`, `moved`, `buffEva`, `guard`, and `evaNext`; inspect their precise interactions before changing evasion.

## Implementation steps
1. Trace `stat`/combat evasion checks and confirm whether `buffEva` or `evaNext` is already suitable; avoid stacking bugs.
2. Add action handlers with eligibility checks (active showdown, selected conscious hero, action unused, no busy phase).
3. Add buttons beside Attack/Escort/Hack using existing `btn sm` classes and disable them when an action is unavailable.
4. Make Take Cover's bonus expire during the existing round reset.
5. Add battle log entries and visible status text for both actions.
6. Test normal showdowns, ambushes, multiple villains, KO, end-round, save/reload, touch controls, and narrow mobile layout.

## Acceptance checklist
- [ ] Both actions consume exactly one action and do not consume movement.
- [ ] A hero cannot use either action twice in a round or while KO.
- [ ] Take Cover changes incoming attack hit chances and expires at the intended time.
- [ ] Rally never exceeds max composure and cannot be used on an invalid hero.
- [ ] Existing powers, Guard effects, gear auras, and evasion buffs remain correct.
- [ ] Old saves load without migration errors.
- [ ] Mobile and desktop buttons remain usable.
- [ ] `main` stays unchanged until reviewed and merged.

This document is a plan only; gameplay code has not yet been modified.
