
/* ============ DATA ============ */
let N = 9;


const UPG = {
  hp:{name:'+2 Max Health',mods:{maxHp:2}}, acc:{name:'+2 Accuracy',mods:{acc:2}}, str:{name:'+2 Strength',mods:{str:2}},
  speed:{name:'+1 Attack Die',mods:{speed:1}}, move:{name:'+1 Movement',mods:{move:1}}, eva:{name:'+2 Evasion',mods:{eva:2}},
  comp:{name:'+2 Max Composure',mods:{maxComp:2}}, range:{name:'+1 Range',mods:{range:1}},
};
const INJ = {
  knee:{name:'Wrecked Knee',mods:{move:-1}}, eye:{name:'Damaged Eye',mods:{acc:-2}}, ribs:{name:'Cracked Ribs',mods:{maxHp:-2}},
  nerve:{name:'Nerve Damage',mods:{eva:-2}}, rattled:{name:'Rattled',mods:{maxComp:-1}},
};

const TRACKS = {
  tech:{name:'Tech',res:'Power',abbr:'PWR',perk:'+2 accuracy',mods:{acc:2}},
  innate:{name:'Innate',res:'Innate rank',abbr:'INN',perk:'+2 max health',mods:{maxHp:2}},
  magic:{name:'Magic',res:'Arcana',abbr:'ARC',perk:'+1 max composure',mods:{maxComp:1}},
};
const SLOTS = {head:'Head',body:'Body',arms:'Arms',legs:'Legs',acc:'Accessory'};
const MODN = {acc:'accuracy',str:'strength',eva:'evasion',move:'movement',speed:'attack die',maxHp:'max health',maxComp:'max composure',range:'range'};
/* ab.act = uses the hero's action; ab.mode = needs a target on the board */
/* Version 127 (Tyler): GEAR, VILLAINS, SETS, START_UNLOCK, ARC_UNLOCK, DEFEAT_UNLOCK, ALL_ITEMS and MID_UNLOCK now hold their final values where they are declared.
   They used to be built up by about 140 patch statements spread through this script; the Version comments that explained those patches are kept where they were.
   Change the data in place rather than adding new patch blocks. tools/q.js prints any of it (see tools/README.md). */

/* Hybrid and capstone gear: every discipline mix up to 3 total ranks has items for at least 2 slots.
   Since v20 (ranks cap at 5) every discipline also has gear at rank 4 in at least 3 slots and at rank 5 in at least 2. */
/* Ouroboros gear, crafted from Scales */
/* Lodestone gear (Lodestones), Nocturne gear (Umbra), Murmur gear (Chitin) */
/* Payload gear (Fuses) */
/* Gridlock gear (Lenses) */
/* balance pass: lift items that were weak for their requirement, trim the outliers */
/* Discipline rework (v20). The three disciplines run on different engines, and each caps at rank 5.
   Tech: abilities spend Power. Max Power = Tech rank + 1 per Tech item worn + bonuses (Version 124); it starts full and slowly recharges, 1 per round (+ recharge bonuses).
   Magic: spells spend Arcana. Max Arcana = Magic rank + the Magic rank each worn item requires + bonuses (Version 125); it starts full each fight and does not refill on its own.
   Innate: abilities are free but require Innate rank (Innate rank + bonuses) of at least ab.min, and a hero fires only one per round.
   ab.c = cost (Tech/Magic), ab.min = Innate rank required (Innate). ab.fx holds the effects. A value can be [a,b] = a + floor(b × Innate rank).
   ab.mode: 'ally' (pick yourself or an ally within r), 'tele' (move to an empty hex within r, then fx), 'strike' (an attack at range).
   Every Tech item has an ability. Every Magic weapon (Weapon slot) has a spell; other Magic items mostly carry passives instead. */
SLOTS.arms='Weapon';
Object.assign(MODN,{maxPwr:'max Power',pwrRegen:'Power recharge',maxArc:'max Arcana',pot:'Innate rank',arcWound:'Arcana when an attack tears a page',innUses:'Innate ability per round'});
/* Version 22: sixth slot (Belt), out-of-combat gear and one-use consumables carried in a 2-item pouch */
SLOTS.belt='Belt';
const POUCH_MAX=2;
const NEW_GEAR_V22=['grapbelt','wiretap','bandolier','satchel','trophy','champ','journal','sash','censer','c_smoke','c_flash','c_frag','c_batt','c_stim','c_salts','c_adren','c_charm','c_vial'];
const slotN=s=>GSLOTS[s]||SLOTS[s]||(s==='pouch'?'Pouch':s);
const pouchOf=h=>h.pouch||(h.pouch=[]);
const wearOK=(h,g)=>canWear(h,g)&&(!GEAR[g].cons||pouchOf(h).length<POUCH_MAX);
/* Version 59 movement pass (Tyler): only a few second moves and second actions remain, most move powers add bonus movement instead,
   Magic owns most teleports (Tech keeps two), Tech and Innate have the leaps, and some Innate gear trades its ability for stronger stats.
   fx.boost = bonus movement on the hero's next move (u.boost), fx.jump makes that move a jump; gear.jumps = every move is a jump. */
/* Version 61 (Tyler): every villain set has 5 pieces */
const NEW_GEAR_V61=['rebarbelt','sunamulet','magbuckle','owlpend','compeyes','detcord','focuscrystal'];
const NEW_GEAR_V59=['surveyor','stilts','corona','flaregaunt','serpeye'];
/* Version 62 (Tyler): two Hand slots and two Accessory slots. Two-handed weapons (gear.two) fill both hands. Paired Tech and Innate
   weapons (gear.pair) get a bonus when both hands hold the same one. New effects: Pain into Power (gear.pain), Relentless (gear.relent),
   Lifeline rescue refunds (gear.rescue), Riposte (gear.riposte or fx.riposte), auras (gear.aura), Blind, deck tricks (Scry, Bury, Excise,
   Scramble), deployable cover (mode 'cover') and bonus salvage (field 'strip'). Abilities that copied each other were reworked. */
for(const k of Object.keys(SLOTS))delete SLOTS[k];
Object.assign(SLOTS,{head:'Head',body:'Body',arms:'Main Hand',arms2:'Off Hand',legs:'Legs',acc:'Accessory',acc2:'Accessory',belt:'Belt'});
const GSLOTS={head:'Head',body:'Body',arms:'Weapon',legs:'Legs',acc:'Accessory',belt:'Belt'};
const SLOT_KEYS={arms:['arms','arms2'],acc:['acc','acc2']};
const NEW_GEAR_V62=['oracle','shotgun','maul','quakehammer','martyr','dynamo','bloodhound','locket','hooks','c_chaff'];
/* paired weapons are single pieces now, so their names lose the plural */
/* Version 99 (Tyler): Lock-on and Callout cost 2 Power; the strongest Tech abilities cost 1 more */
const NEW_GEAR_V20=['cell','fusion','lance','gravboots','cmdvisor','arccore','hide','meteor','senses','apex','quakelegs','runeblade','wand','soulreaver','starfall','font','robes','circlet','stone'];
/* Magic non-weapons lose their old abilities and carry Arcana passives instead */
/* Version 59 balance pass. Innate gear that lost its ability gets stronger stats. Items that need two or three disciplines rise to match
   their wider requirements, and Magic passives rise to match Tech and Innate items of the same rank. */
/* the classic lineup each gets +1 to their discipline's engine */
const POOL_MOD={tech:'maxPwr',innate:'maxHp',magic:'maxArc'},POOL_BONUS_TXT={tech:'+1 max Power',innate:'+2 max health',magic:'+1 max Arcana'};
for(const k in HERO_BASE){const b=HERO_BASE[k],m=POOL_MOD[b.track];b[m]=(b[m]||0)+(m==='maxHp'?2:1)}
/* Version 61 (Tyler): gear costs only salvage, and higher ranks cost more. Set pieces cost their villain's salvage, everything else any salvage.
   Consumables are skipped here; Version 62 below (CONS_COST) prices them at 1 or 2 any salvage. */
/* Version 62 stat pass (Tyler): attack stats (accuracy, Strength, dice, range) live mostly on weapons. Weapon and Body gear is the
   strongest and costs the most, Head and Legs come next, then Accessories and Belts (a hero now wears two Accessories).
   Two-handed weapons are about 1.6 times a one-handed weapon of the same rank. */
/* Paired: both hands hold the same weapon. fx adds to the weapon's ability, mods add once on top of the two copies' own stats */
/* Version 100 (Tyler): the second copy of a Paired weapon adds only the pair bonus, not its own stats or set count, so pair bonuses are bigger */
/* Version 77 (Tyler): bonus dice are rare. Only a few signature abilities add a die (never more than +1), the rest add Strength or accuracy,
   strikes roll 4 dice, and anything that adds a die to several attacks is conditional and once per fight. */
/* auras help the wearer and allies within 1 hex (Version 63: the wearer counts too, and some auras do more than stats) */
/* Version 65 (Tyler): auras reach 2 hexes, and each effect aura only works under a condition */
const AURA_R=2;
const AURA_FX={mend:{n:'Mending Light',txt:'at the start of each round, regain 1 health while at half health or less'},calm:{n:'Calming Smoke',txt:'at the start of each round, regain 1 composure while at half composure or less'},
  charge:{n:'Power Relay',txt:'recharge 1 more Power each round while at 1 Power or less'},brace:{n:'Shield Wall',txt:'take 1 less damage from any hit of 3 or more'},
  luck:{n:'Fortune',txt:'the first henchman attack on you each round rolls twice and keeps the lower die (villains are not affected)'}};
/* Version 115 (Tyler's gear pass) */
/* cost by slot tier and total rank; consumables cost any salvage too */
const slotTier=g=>g.two?'two':g.slot==='arms'||g.slot==='body'?'A':g.slot==='head'||g.slot==='legs'?'B':'C';
/* Version 59 villain sets: gear crafted from one villain's salvage forms a set. Wearing SET_N or more pieces turns on its bonus.
   mods add to stat(); the rest is wired in at round start (cantor, serpent, helios, lode), damageHero (architect), heroAttack (noct),
   henchAct (swarm), blowBombs (bomber), fireBeams and beamStep (grid). */
const SET_N=4; /* Version 124 (Tyler): 4 pieces, each set has 7 */

const setCount=(h,k)=>wornGear(h).filter(g=>GEAR[g]&&GEAR[g].set===k).length;
const setsOn=h=>{const c={};for(const g of wornGear(h)){const s=GEAR[g]&&GEAR[g].set;if(s)c[s]=(c[s]||0)+1}return Object.keys(c).filter(k=>c[k]>=SET_N)};
const setOn=(h,k)=>!!h&&setCount(h,k)>=SET_N;
const jumpsAll=h=>!!h&&Object.values(h.gear).some(g=>GEAR[g]&&GEAR[g].jumps);
const reqTxt=g=>Object.entries(g.reqs).map(([t,n])=>`${TRACKS[t].name} ${n}`).join(' + ');
const reqChips=g=>Object.entries(g.reqs).map(([t,n])=>`<span class="disc t-${t}">${TRACKS[t].name} ${n}</span>`).join('');
const isHybrid=g=>Object.keys(g.reqs).length>1;
const modsTxt=m=>Object.entries(m).map(([k,v])=>`${v>0?'+':''}${v} ${MODN[k]}`).join(', ');
const RES_NAME = {any:'any salvage',tech:'Tech',intel:'Intel',gallows:'Coils',quarry:'Shards',cantor:'Ledgers',architect:'Rebar',helios:'Sunstone',serpent:'Scales',lode:'Lodestones',noct:'Umbra',swarm:'Chitin',bomber:'Fuses',grid:'Lenses',mole:'Grit'};
/* Each villain: 6 base pages plus an ordered list of advanced pages. A level-L villain owns the base pages
   plus 2L+1 advanced ones (plus deckBonus, a per-villain difficulty knob); each level-up adds the next 2.
   Between arcs, the 3 oldest lowest-mark pages are upgraded. */

/* Intel: intro splash, style hints and signature hit reactions shuffled into each villain's hit deck */

const rxOf=(k,id)=>VINTEL[k].react.find(r=>r.id===id);
/* Signature Moves: the big, dangerous pages. [shout before it is played, splash when it is torn out] */
/* crush: damage dealt to heroes a large villain shoves out of its path while moving */
/* footprints on the hex board */
const SHAPE_N={one:'Size 1 · Human-sized · 1 hex',tri:'Size 2 · Large · 3 hexes',diamond:'Size 3 · Large · 4 hexes',big:'Size 4 · Huge · 7 hexes',serpent:'Size 4 · Serpent · 5 hexes and growing',swarm:'Size 1 · Swarm · three 1-hex bodies'};
/* size class for effects that care how big a villain is (Ground Quake): steps up with hex count */
const VSIZE={one:1,swarm:1,tri:2,diamond:3,serpent:4,big:4};
/* Signature reactions live on a playbook page: tearing that page removes the reaction from the hit deck. [page, splash] */
const RXSRC={gallows:{cap:['field','You overloaded his capacitor bank!'],bdrone:['drones','You smashed the drone bay!'],proto:['lash','You ripped the plating off his Tesla rig!']},
  quarry:{skin:['roar','You shattered her granite carapace!'],shrug:['wreck','You knocked the loose rubble off her shoulders!'],crumble:['slam','You split her crumbling hide wide open!']},
  cantor:{gaze:['whisper','You broke his mesmer gaze!'],bodyg:['guns','You scattered his bodyguards!'],smoke:['van','You confiscated his smoke bombs!']},
  architect:{plate:['walls','You knocked out her load-bearing plates!'],trap:['rivet','You jammed her spring traps!'],scaff:['cons','You toppled her scaffolding rig!']},
  helios:{corona:['corona','You smothered his corona!'],glare:['blind','You shattered his focusing lens!'],shell:['heat','You cracked his plasma shell!']},
  serpent:{venom:['bite','You drained its venom sacs!'],tail:['coil','You pinned its tail to the floor!'],gorged:['gulp','You cut open its gorged belly!']},
  lode:{yank:['attract','You shorted out his magnetic core!'],plate:['spike','You stripped off his iron plating!'],repulse:['field','You smashed his repulsor coils!']},
  noct:{riposte:['knife','You disarmed her!'],veil:['fade','You pinned her shadow to the floor!'],feint:['stars','You read every one of her feints!']},
  swarm:{hive:['brood','You crushed the queen!'],sting:['sting','You swatted the stinger!'],shell:['bite','You cracked the shell open!']},
  bomber:{upover:['over','She has nowhere left to spring from!'],bando:['lit','You cut the bombs off her sides!'],short:['tick','You stopped her stopwatch!']},
  grid:{mirror:['red','You smashed his reflector visor!'],lens:['sight','You cracked his lens array!'],flash:['lattice','You burned out his afterimage capacitors!']}};
for(const k in RXSRC)for(const id in RXSRC[k]){const r=rxOf(k,id);[r.src,r.brk]=RXSRC[k][id]}
const ROMAN=['','II','III','IV','V','VI','VII'];
const TGN={nearest:'nearest',weakest:'most injured',farthest:'farthest'};
/* Version 119 (Tyler): every charge covers more ground or more heroes, and staggering one takes as many torn pages as the villain's level */
const ZONEN={blast:'every hex within 2 of the nearest hero',blast2:'the three nearest heroes and every hex around them',line:'straight lines of hexes through the two farthest heroes',nova:'every hex within 3 of the villain',mark:'the two most injured heroes and every hex around them',focus:'the most injured hero, every hex around them, and every hex in a straight line with them in all 6 directions'};
const chargeNeed=v=>v.level+1; /* Version 120 (Tyler): level + 1 pages to stagger */
function applyMk(c,mk){c={...c};if(!mk)return c;
  if(c.dmg!=null)c.dmg+=mk;if(c.amt!=null)c.amt+=mk;if(c.k!=null)c.k+=Math.ceil(mk/2);if(c.mv)c.mv+=mk;if(c.rng>1)c.rng+=mk;
  if(c.r!=null&&(c.t!=='hazard'||c.grow))c.r+=Math.floor(mk/2);if(c.len)c.len+=mk;if(c.ttl)c.ttl+=Math.floor(mk/2);if(c.cnt)c.cnt+=Math.floor(mk/2);
  if(c.t==='reanimate')c.heal=1+Math.floor(mk/2);return c}
function cardText(c,vk){const hn=VILLAINS[vk].hench.name.toLowerCase();
  switch(c.t){
    case 'strike':return (c.mv?`Moves ${c.mv} toward the ${TGN[c.tgt]} hero, then hits at range ${c.rng} for ${c.dmg}.`:`Hits the ${TGN[c.tgt]} hero from up to ${c.rng} away for ${c.dmg}.`)+(c.col?' Civilians next to the target are harmed.':'')+(c.comp?` The target loses ${c.comp} composure.`:'');
    case 'burrow':return `Dives underground and bursts up next to the farthest hero, then hits them for ${c.dmg}. Leaves rubble where it went down.`;
    case 'multi':return `Hits up to ${c.cnt} heroes within ${c.rng} for ${c.dmg} each.`;
    case 'sweep':return `Everything within ${c.r} takes ${c.dmg}. Civilians caught are harmed.`;
    case 'rampage':return `Moves ${c.mv} toward the nearest hero, then everything adjacent takes ${c.dmg}.`;
    case 'summon':return `${c.k} ${hn}s join the fight.`;
    case 'endanger':return `Moves 2 toward the nearest civilian and harms them from up to 3 away. A hero next to them takes ${c.dmg} instead.`;
    case 'taunt':return `Heroes within ${c.r} lose ${c.amt} composure.`;
    case 'vanish':return 'Disappears and reappears far from the heroes.';
    case 'reanimate':{const n=c.heal||1;return `${n} torn page${n>1?'s return':' returns'} to the playbook.`}
    case 'puppet':return `The hero with the least composure loses ${c.amt||1} more and cannot move next round.`;
    case 'walls':return `${c.retreat?`Backs ${c.retreat} hexes away from the nearest hero, then r`:'R'}aises ${c.lines>1?`${c.lines} walls`:'a wall'} of ${c.len} hexes between itself and the heroes. Walls crumble after ${c.ttl} rounds.`;
    case 'hazard':if(c.grow){const who=c.cnt>1?`each of the ${c.cnt} nearest heroes`:'the nearest hero';return `${c.r?'The floor caves in under':'A one-hex sinkhole opens under'} ${who}${c.r?` and every hex within ${c.r} of them`:''} for ${c.ttl} villain turns. Anyone standing in one when the villain acts takes ${c.dmg}.`}return `The floor around ${c.cnt>1?`the ${c.cnt} nearest heroes`:'the nearest hero'} turns molten for ${c.ttl} villain turns. Anyone standing on it when the villain acts takes ${c.dmg}.`;
    case 'cage':return `Fills every open hex around the nearest hero with walls for ${c.ttl} rounds.`;
    case 'shrapnel':return `Detonates every wall and rubble pile within ${c.r}. Heroes next to one take ${c.dmg}. Walls are destroyed.`;
    case 'fortify':return `Rings itself with walls for ${c.ttl} rounds and recovers 1 torn page.`;
    case 'swallow':return `Slithers ${c.mv} toward the nearest civilian or ${hn} and swallows ${c.cnt>1?`up to ${c.cnt}`:'one'} whole, growing one hex longer for the rest of the fight. A hero next to a civilian takes ${c.dmg} instead. With nothing to eat, it bites the nearest hero for ${c.dmg}.`;
    case 'pull':return `Drags every hero within ${c.r} up to ${c.mv} hexes toward itself, then everything adjacent takes ${c.dmg}.`;
    case 'repel':return `Flings every hero within ${c.r} up to ${c.mv} hexes away. A hero who slams into a wall, rubble, the edge or another hero before flying the full distance takes ${c.dmg}.`;
    case 'fade':return `Melts into the shadows and reappears a few hexes from the nearest hero. Her facing is hidden again.${c.amt?` The lights die and every hero loses ${c.amt} composure.`:''}`;
    case 'converge':return `Every body of the swarm flies up to ${c.mv} hexes toward the nearest hero. That hero takes ${c.dmg} for each body next to them.`;
    case 'scatter':return `The swarm bursts apart. Each body reappears next to a different hero and strikes them for ${c.dmg}.`;
    case 'leap':return `Vaults over ${c.cnt>1?`up to ${c.cnt} heroes, one after another,`:'the nearest hero'} within ${c.mv}, sailing over anything in between, and lands on the far side facing away.${c.fuse?` Leaves a bomb on ${c.cnt>1?'each':'that'} hero's hex: ${c.dmg} damage to it and every hex around it in ${c.fuse} villain turn${c.fuse>1?'s':''}.`:''} A hero with no open hex behind them can't be jumped.`;
    case 'bomb':return `Throws ${c.cnt>1?`${c.cnt} bombs, one at each of the ${c.cnt} ${TGN[c.tgt]} heroes`:`a bomb at the ${TGN[c.tgt]} hero`} within ${c.rng}. ${c.cnt>1?'Each':'It'} goes off in ${c.fuse} villain turn${c.fuse>1?'s':''}: ${c.dmg} damage to its hex and every hex around it.`;
    case 'detonate':return `Every bomb on the board goes off right now, with +${c.dmg} damage. No bombs, no boom.`;
    case 'airburst':return `Leaps to the middle of the room and charges up. On her next turn she fires instead of playing a page: ${c.dmg} damage to every hero and civilian within 3 of her. Tear pages equal to her level + 1 before then to stagger it.`;
    case 'beam':{const tail=` Each beam runs to the edge, stops at the first hero it hits and knocks them back ${c.dmg} hex${c.dmg>1?'es':''}.`+(c.ttl>1?` The beams stay lit for ${c.ttl} turns.`:'');
      switch(c.pat){case 'star':return `Fires a beam in all 6 directions for ${c.dmg}.`+tail;
        case 'fan':return `Turns to the nearest hero and fires 3 beams from its front for ${c.dmg}.`+tail;
        case 'aim':return `Turns and fires a beam at ${c.cnt>1?`each of the ${c.cnt} ${TGN[c.tgt]} heroes`:`the ${TGN[c.tgt]} hero`} for ${c.dmg}. A hero who isn't in a straight line with it may be missed.`+tail;
        case 'sweep':return `Fires a beam ahead, then turns and fires again, ${c.cnt} times in all, for ${c.dmg} each.`+tail;
        case 'prism':return `Every ${hn} fires a beam at its nearest hero for ${c.dmg}.`+tail}return ''}
    case 'charge':return `Charges up and marks ${ZONEN[c.zone]}. On its next turn it fires instead of playing a page: ${c.dmg} damage to every hero and civilian in the marked hexes. Tear pages equal to its level + 1 before then to stagger it.`;
  }return ''}
/* the villain's own movement runs one hex further than the table says (Tyler, V76); pull/repel distances are how far heroes are dragged, so they stay */
const MV_UP=['strike','rampage','swallow','converge','leap'];
function buildCard(vk,e){const base=VILLAINS[vk].cards[e.id],c=applyMk(base,e.mk||0);c.id=e.id;c.mk=e.mk||0;c.n=base.n+(c.mk?' '+ROMAN[c.mk]:'');if(c.mv>0&&MV_UP.includes(c.t)&&!VILLAINS[vk].rooted)c.mv++;c.txt=cardText(c,vk);
  if(VILLAINS[vk].shape==='serpent'&&(c.t==='sweep'||c.t==='rampage'))c.txt+=' Reaches out from every hex of its body.';
  if(VILLAINS[vk].shape==='swarm'&&(c.t==='sweep'||c.t==='taunt'||c.t==='multi'))c.txt+=' Reaches out from every body of the swarm.';
  if(c.bombx)c.txt+=' Heroes standing within 1 of a bomb lose 1 more.';
  if(c.zone==='mark')c.txt+=' Her facing is revealed while she lines up the kill.';
  if((c.t==='strike'||c.t==='rampage')&&c.mv&&(VILLAINS[vk].shape==='serpent'||(SHAPES[VILLAINS[vk].shape]||[0]).length>1))c.txt+=c.crush?` Heroes in its path are shoved aside and take ${c.crush}.`:' Heroes in its path are shoved aside.';
  c.uid=Math.random().toString(36).slice(2,9);return c}
const VCAP=8;
function makeVillain(k,level){const vs={key:k,level:1,scheme:0,status:'active',deck:VILLAINS[k].base.map(id=>({id,mk:0})),advIdx:0,beaten:0};
  addAdv(vs,3+(VILLAINS[k].deckBonus||0));for(let l=1;l<Math.min(level,VCAP);l++)levelUpVillain(vs);return vs}
/* playbook size a villain should own at its level */
const deckSize=vs=>VILLAINS[vs.key].base.length+3+(VILLAINS[vs.key].deckBonus||0)+3*(Math.min(vs.level,VCAP)-1); /* Version 123 (Tyler): +3 pages per level again */
function addAdv(vs,n){const adv=VILLAINS[vs.key].adv,out=[];for(let i=0;i<n;i++){const id=adv[vs.advIdx%adv.length],mk=Math.floor(vs.advIdx/adv.length);vs.deck.push({id,mk});vs.advIdx++;out.push(buildCard(vs.key,{id,mk}).n)}return out}
function levelUpVillain(vs){if(vs.level>=VCAP)return [];vs.level++;return addAdv(vs,3)}
function upgradeVillain(vs,n=3){const idx=vs.deck.map((e,i)=>i).sort((a,b)=>vs.deck[a].mk-vs.deck[b].mk||a-b).slice(0,n);
  return idx.map(i=>{const before=buildCard(vs.key,vs.deck[i]).n;vs.deck[i].mk++;return `${before} → ${buildCard(vs.key,vs.deck[i]).n}`})}
/* unlocks */


/* Version 82 (Tyler): villains are never captured. Beating a villain in their lair unlocks their set blueprints instead. */


const itemName=it=>{const[t,k]=it.split(':');return t==='fac'?FAC[k].name:GEAR[k].name};
const isUnlocked=it=>S.unlocked.includes(it);
function unlock(items){const out=[];for(const it of items)if(!isUnlocked(it)){S.unlocked.push(it);out.push(itemName(it))}return out}
const facOpen=k=>arcOf(Math.min(S.issue,MAX_ISSUE))>=(FAC[k].arc||1);
function unlockRandom(kind){const pool=ALL_ITEMS.filter(it=>!isUnlocked(it)&&(!kind||it.startsWith(kind+':')));if(!pool.length)return null;return unlock([pick(pool)])[0]}
function unlockSources(it){const out=[];const arc=arcOf(S.issue);
  for(const a in ARC_UNLOCK)if(+a>arc&&ARC_UNLOCK[a].includes(it))out.push(`Arc ${a}`);if(MID_UNLOCK.includes(it)&&S.issue<TIER3_ISSUE)out.push(`issue ${TIER3_ISSUE}`);
  const inVol=[...S.villains.map(v=>v.key),...S.pool];for(const k of inVol)if(DEFEAT_UNLOCK[k].includes(it))out.push(`beating ${VILLAINS[k].name}`);
  out.push('Skunkworks research','special leads');return out.join(' · ')}
const ISSUES_PER_ARC=6,ARCS=3,MAX_ISSUE=ISSUES_PER_ARC*ARCS;
const arcOf=i=>Math.min(ARCS,Math.ceil(i/ISSUES_PER_ARC));
const schemeMax=()=>S.facilities.includes('bunker')?4:3;
const xpNeed=h=>2+lvlOf(h)+h.pendingUp;
const TACT = [
  ['weak','Weak Point','The wound lands automatically.'],['weak','Weak Point','The wound lands automatically.'],
  ['armor','Reinforced','+4 toughness for this wound.'],['armor','Reinforced','+4 toughness for this wound.'],
  ['over','Overextended','−4 toughness for this wound.'],['over','Overextended','−4 toughness for this wound.'],
  ['counter','Counterstrike','Reaction: the attacker takes 2 damage.'],['counter','Counterstrike','Reaction: the attacker takes 2 damage.'],
  ['mono','Monologue Opening','If this wounds, the hero regains 1 composure.'],
  ['shield','Human Shield','No wound if a civilian is within 2 of the villain.'],
  ['escape','Escape Plan','Reaction: the villain shifts 2 spaces away.'],
  ['glance','Clean Hit','Roll to wound as normal.'],['glance','Clean Hit','Roll to wound as normal.'],
].map(([id,n,txt])=>({id,n,txt}));
const ETHOS = {
  a:{q:'How far will the team go?',opts:[
    {id:'restraint',n:'Restraint',txt:'Every time you beat a villain in their lair, gain 1 extra salvage from them.'},
    {id:'force',n:'Overwhelming Force',txt:'Heroes gain +2 strength. Each civilian harmed costs 2 trust instead of 1.'}]},
  b:{q:'Do the heroes show their faces?',opts:[
    {id:'public',n:'Public Faces',txt:'+1 trust every issue. Investigations end in an ambush on 2 clues or fewer.'},
    {id:'secret',n:'Secret Identities',txt:'+1 max composure for every hero. Evacuations earn at most 1 trust per mission.'}]},
};

/* ============ HELPERS ============ */
const rnd=n=>1+Math.floor(Math.random()*n), d20=()=>{const q=typeof S!=='undefined'&&S&&S.tut&&S.tut.dq;return q&&q.length?q.shift():rnd(20)}; /* Version 133: scripted tutorial rolls come first */
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='blackharbor-v4';
let S;

/* ============ ORIGIN STORIES (hero creation) ============ */
const BASE=h=>h.base||HERO_BASE[h.cls];
const ROSTER_MAX=10;
/* new heroes come with nothing, so a fresh team gets a shared locker of level-1 items */
/* Version 101 (Tyler): nobody starts with villain set gear, so the starter locker holds only non-set items */
/* Version 102 (Tyler): no consumables in the locker, and three new non-set level-1 items fill the gaps: a Tech and an Innate weapon and a Head item */
/* Version 104 (Tyler): a level-1 Head item for Magic and for Innate too */
const STARTER_LOCKER=['baton','knuckles','runeblade','goggles','hood','headband','medkit','scanner','coin','hooks'];
/* Version 116 (Tyler): new heroes start at Strength 2 and evasion 8 (were 3 and 10) */
const O_TEMPLATE={maxHp:9,move:4,speed:2,acc:0,str:2,eva:8,range:1,maxComp:5};
const O_FLOOR={maxHp:6,move:2,speed:1,acc:0,str:1,eva:6,range:1,maxComp:3};
const O_GLOW={tech:'#3DB6DD',innate:'#F08A4B',magic:'#B48CF0'};
const O_COLS=['#C92463','#2F6FB5','#D08A12','#1F9C8A','#7A4FC0','#A0522D','#556B2F','#B0306A','#3F51B5','#5A6275'];
const O_NAME=[['Night','Iron','Static','Crimson','Silver','Ghost','Storm','Ember','Quiet','Neon','Hollow','Rook','Velvet','Cinder'],['hawk','line','fist','shade','wire','fall','jack','spark','veil','watch','bolt','fang','moth','tide']];
const FIELD_AB={
  senses:{id:'senses',n:'Keen Senses',txt:'While in the party, every die rolled during investigations gets +2. Two heroes with it do not stack.'},
  intercept:{id:'intercept',n:'Signal Intercept',txt:'While in the party, every investigation opens with 1 unseen playbook page already revealed. Two heroes with it do not stack.'},
  premonition:{id:'premonition',n:'Premonition',txt:"While in the party, at the start of each issue, reveal 2 unseen pages from free villains' playbooks and gain 1 intel. Two heroes with it do not stack."}};
const O_POW={tech:['arc','patch','barricade','overclock','drone','emp'],innate:['brace','mark','quake','regen','berserk','leap'],magic:['blur','omen','curse','aegis','drain','serene']};
const O_POWFL={arc:'Lightning answers when you call it.',patch:'Your gadgets fix people as well as machines.',barricade:'Ten seconds and some scrap metal, and you have a wall.',
  brace:'You plant your feet and nothing gets past.',mark:'Once you have their scent, they cannot hide.',quake:'You hit the ground and the ground hits back.',
  blur:'You move between the seconds.',omen:'You see the next blow before it lands.',curse:'One whispered word, and their strength rots.',
  overclock:'Redline every circuit for one perfect strike.',drone:'A little flying friend with a big stun gun.',emp:'One pulse and their tech goes dark.',
  regen:'Bullet holes close while you watch.',berserk:'Something wild takes the wheel.',leap:'Rooftop to rooftop in a single bound.',
  aegis:'A circle of light that takes the sting out of the next blow.',drain:'Their strength becomes yours.',serene:'Your calm spreads like a ripple on water.'};
const ORIGIN={
  life:{t:'Before the Mask',cap:'Every hero had a life before the costume. Who were you when nobody was watching?',opts:[
    {id:'cop',n:'Beat Detective',fl:'Ten years with a badge taught you how this city lies.',field:'senses'},
    {id:'hacker',n:'Night-Shift Hacker',fl:'You hear every police band and private line in town.',field:'intercept'},
    {id:'psychic',n:'Storefront Psychic',fl:'The visions were real all along. Nobody believed you.',field:'premonition'},
    {id:'soldier',n:'Ex-Soldier',fl:'Two tours. You know how to take a hit and keep moving.',mods:{maxHp:2}},
    {id:'athlete',n:'Pro Athlete',fl:'Fastest feet in the league, until the knee went. Then it came back.',mods:{move:1}},
    {id:'street',n:'Street Kid',fl:'You grew up dodging trouble in the alleys you now protect.',mods:{eva:2}}]},
  spark:{t:'The Incident',cap:'Then came the night everything changed. Where does your power come from?',opts:[
    {id:'garage',n:'Built It in a Garage',track:'tech',adj:'Gadget',fl:'Duct tape, stolen parts and a genius nobody would hire.',mods:{maxPwr:2}},
    {id:'proto',n:'Stole the Prototype',track:'tech',adj:'Armored',fl:'The suit was built for a war. You took it to the streets.',mods:{str:2}},
    {id:'cyborg',n:'Rebuilt in Chrome',track:'tech',adj:'Cyborg',fl:'They put you back together after the crash. Mostly metal now.',mods:{maxHp:2}},
    {id:'accident',n:'Lab Accident',track:'innate',adj:'Mutant',fl:'The vat exploded. You walked out changed.',mods:{maxHp:3}},
    {id:'born',n:'Born Different',track:'innate',adj:'Born',fl:'It was always in your blood. High school was a nightmare.',mods:{maxHp:2}},
    {id:'cosmic',n:'Cosmic Radiation',track:'innate',adj:'Cosmic',fl:'A meteor shower, a camping trip, and nothing was ever the same.',mods:{acc:2}},
    {id:'pact',n:'Made a Pact',track:'magic',adj:'Occult',fl:'Something old answered when you called. It will want a favor someday.',mods:{maxComp:2}},
    {id:'haunt',n:'Touched by a Ghost',track:'magic',adj:'Spectral',fl:'You died for ninety seconds. Something came back with you.',mods:{move:1}},
    {id:'grimoire',n:'The Forbidden Book',track:'magic',adj:'Arcane',fl:'You read the one book you were told never to open.',mods:{maxArc:2}}]},
  gift:{t:'The Power Awakens',cap:'Your power shows itself for the first time. What can you do that nobody else can?',opts:Object.keys(POWERS).map(id=>({id,n:POWERS[id].name,fl:O_POWFL[id],power:id}))},
  style:{t:'First Night Out',cap:'Your first patrol. A mugging in an alley, three thugs. How do you fight?',opts:[
    {id:'fists',n:'Fists First',role:'brawler',fl:'You learned to fight in parking lots and never stopped.',range:1,fx:'slash',mods:{str:2,maxHp:1}},
    {id:'hitrun',n:'Hit and Run',role:'skirmisher',fl:'In, out and gone before they turn around.',range:1,fx:'slash',mods:{move:1,eva:2}},
    {id:'flurry',n:'A Hundred Blows',role:'striker',fl:'Not hard hits. Just a lot of them.',range:1,fx:'slash',mods:{speed:1,str:-2}},
    {id:'blast',n:'Energy Blasts',role:'blaster',fl:'Point, glow, fire.',range:3,fx:'bolt',mods:{maxHp:-1}},
    {id:'trick',n:'Trick Shots',role:'marksman',fl:'Ricochets, bank shots and a coin off a gargoyle.',range:2,fx:'shot',mods:{acc:2}},
    {id:'roof',n:'From the Rooftops',role:'sniper',fl:'They never see where it came from.',range:4,fx:'shot',mods:{maxHp:-2,move:-1}}]},
  drive:{t:'Why You Keep Going',cap:'Blackharbor never thanks you. So what gets you back out there every night?',opts:[
    {id:'duty',n:'Somebody Has To',fl:'Nobody else was going to.',mods:{maxComp:2}},
    {id:'revenge',n:'They Took Everything',fl:'Every punch is for them.',mods:{str:2,maxComp:-1}},
    {id:'atone',n:'Making Up for Something',fl:'You did something terrible once. You are still paying.',mods:{maxHp:2}},
    {id:'rush',n:'For the Rush',fl:'Nothing else makes you feel this alive.',mods:{move:1,maxComp:-1}},
    {id:'legend',n:'Living Up to a Legend',fl:'Someone wore a mask before you. You will not let them down.',mods:{acc:2,maxComp:-1}}]},
  career:{t:'Their Own Series',cap:'This hero already has a book of their own. What kind of run has it been?',opts:[
    {id:'long',n:'Long-Running Title',fl:'Two hundred issues and counting.',lvl:1},
    {id:'mini',n:'Fan-Favorite Miniseries',fl:'Short, sharp and full of gadgets.',gear:1},
    {id:'team',n:'Team Book Mainstay',fl:'They have run a base before, and it shows.',hq:1}]},
  training:{t:'Years of Training',cap:'Their past issues shaped how their powers grew. Where did the extra training go?'},
  moves:{t:'Signature Moves',cap:'Every long-time reader knows their best tricks. Pick one upgrade for each level beyond the first.'},
  gear:{t:'What They Carry',cap:'They show up with their own kit. Pick from your unlocked blueprints. It is theirs to keep, free.'},
  hq:{t:'What They Bring to HQ',cap:'Joining the Blackharbor Guardians means bringing their resources too. What comes with them?'},
  mask:{t:'The Mask',cap:'Last panel. The costume, the name, the first time Blackharbor sees you.'},
  cover:{t:'Issue #1',cap:''}};
const oSteps=c=>c.mode==='xover'?['life','spark','gift','style','drive','career','training','moves','gear','hq','mask','cover']:['life','spark','gift','style','drive','mask','cover'];
const oOpt=(step,id)=>id&&ORIGIN[step].opts?ORIGIN[step].opts.find(o=>o.id===id):null;
const xArc=()=>arcOf(Math.min(S.issue,MAX_ISSUE));
const xoverUsed=()=>(S.xover||[]).includes(xArc());
const xoverOpen=()=>S.phase==='hq'&&((xArc()>=2&&!xoverUsed())||!!(S.cheat&&S.cheat.xover));
function oLevel(c){return c.mode==='xover'?xArc()+1+(c.picks.career==='long'?1:0):1}
const oGearMax=c=>c.picks.career==='mini'?2:1;
function oTrainOpts(c){const sp=oOpt('spark',c.picks.spark);if(!sp)return [];const m=sp.track,ex=oLevel(c)-1,others=Object.keys(TRACKS).filter(t=>t!==m);
  const o=[{id:'spec',n:`${TRACKS[m].name} Specialist`,fl:'Everything went into the power they started with.',split:{[m]:ex}}];
  others.forEach(t=>o.push({id:'x-'+t,n:`Cross-Trained in ${TRACKS[t].name}`,fl:`They picked up ${TRACKS[t].name.toLowerCase()} tricks along the way.`,split:{[m]:ex-Math.floor(ex/2),[t]:Math.floor(ex/2)}}));
  if(ex>=2)o.push({id:'all',n:'Jack of All Trades',fl:'A little of everything.',split:{[m]:ex-2,[others[0]]:1,[others[1]]:1}});return o}
function oRanks(c){const sp=oOpt('spark',c.picks.spark),r={tech:0,innate:0,magic:0};if(!sp){r.tech=1;return r}r[sp.track]=1;
  if(c.mode==='xover'){const t=oTrainOpts(c).find(o=>o.id===c.picks.training);if(t)for(const[k,n]of Object.entries(t.split))r[k]+=n}return r}
const canWearR=(r,g)=>Object.entries(GEAR[g].reqs).every(([t,n])=>r[t]>=n);
function oHqOpts(){const act=S.villains.filter(v=>v.status==='active').sort((a,b)=>b.level-a.level),top=act[0];
  const o=[{id:'tech',n:'Their Old Lair',fl:'Crates of salvaged hardware.',txt:'+4 tech.'},
    {id:'files',n:'Their Case Files',fl:'Years of notes on this city\'s worst.',txt:'+3 intel.'},
    {id:'fans',n:'A Loyal Fanbase',fl:'The city already loves them.',txt:'+2 public trust.'}];
  if(act.length)o.push({id:'trophy',n:'Trophy Room',fl:'Souvenirs from fights you never saw.',txt:`+2 salvage from each free villain (${act.map(v=>VILLAINS[v.key].salvage).join(', ')}).`});
  if(ALL_ITEMS.some(it=>!isUnlocked(it)))o.push({id:'notes',n:'Lab Notebooks',fl:'Designs nobody else has seen.',txt:'Unlock 2 random missing blueprints.'});
  Object.keys(FAC).filter(k=>isUnlocked('fac:'+k)&&!S.facilities.includes(k)).sort((a,b)=>Object.values(FAC[b].cost).reduce((x,y)=>x+y,0)-Object.values(FAC[a].cost).reduce((x,y)=>x+y,0)).slice(0,2)
    .forEach(k=>o.push({id:'pat-'+k,n:`A Patron Builds the ${FAC[k].name}`,fl:'Their billionaire backer wants in.',txt:`Builds the ${FAC[k].name} for free: ${FAC[k].txt}`}));
  return o}
const oHqMax=c=>Math.min(c.picks.career==='team'?2:1,oHqOpts().length);
function oBuild(c){const p=c.picks,why={},b={...O_TEMPLATE};
  const add=(src,mods)=>{for(const[k,v]of Object.entries(mods||{})){b[k]=(b[k]||0)+v;(why[k]=why[k]||[]).push([src,v])}};
  const life=oOpt('life',p.life),spark=oOpt('spark',p.spark),gift=oOpt('gift',p.gift),style=oOpt('style',p.style),drive=oOpt('drive',p.drive);
  [life,spark,style,drive].forEach(o=>o&&add(o.n,o.mods));
  if(style&&style.range>1)add(style.n,{range:style.range-1});
  for(const k in O_FLOOR)b[k]=Math.max(O_FLOOR[k],b[k]);
  const track=spark?spark.track:'tech',name=(c.name||'').trim()||'Unnamed hero';
  const role=spark&&style?`${spark.adj} ${style.role}`:style?style.role[0].toUpperCase()+style.role.slice(1):'Hero in the making';
  const base={name,role,track,col:c.col,fx:style?style.fx:'slash',glow:O_GLOW[track],...b,power:gift?gift.power:O_POW[track][0],succ:`${name} II`};
  if(life&&life.field)base.field=FIELD_AB[life.field];
  return {base,why,ranks:oRanks(c),level:oLevel(c)}}
function oValid(c,sid){const p=c.picks;
  if(['life','spark','gift','style','drive','career','training'].includes(sid))return !!p[sid];
  if(sid==='moves')return c.ups.length===oLevel(c)-1;
  if(sid==='hq')return c.hq.length===oHqMax(c);
  return true}
/* codenames: several patterns, with word pools flavored by the hero's discipline */
const O_NW={pre:['Night','Iron','Static','Crimson','Silver','Ghost','Storm','Ember','Quiet','Neon','Hollow','Rook','Velvet','Cinder','Black','Star','Moon','Thunder','Frost','Shadow','Steel','Wild','Red','Gold','Dusk','Dawn','Stone','Blood','Sky','Rust'],
  suf:['hawk','line','fist','shade','wire','fall','jack','spark','veil','watch','bolt','fang','moth','tide','wing','claw','strike','blade','fire','storm','light','wolf','heart','runner','breaker','sight','shot','fox','crow','lash'],
  title:['Captain','Doctor','Lady','Mister','Agent','Professor','Sister','Brother','Major','Kid','Madame','Sergeant'],
  noun:['Comet','Lantern','Sentinel','Raven','Phantom','Tempest','Vanguard','Paragon','Spectre','Nomad','Wraith','Harbinger','Gargoyle','Revenant','Beacon','Outrider','Monarch','Jackal','Viper','Cardinal'],
  adj:['Silent','Scarlet','Electric','Iron','Midnight','Atomic','Crimson','Golden','Hollow','Savage','Silver','Shattered','Burning','Masked','Wandering','Last'],
  solo:['Nocturne','Vesper','Quicksilver','Kestrel','Halcyon','Obsidian','Sable','Torrent','Bramble','Vex','Nightjar','Lodestar','Marrow','Echo','Riot','Gloam','Solstice','Paladin','Tinder','Mercury'],
  tech:{pre:['Volt','Circuit','Chrome','Gear','Pulse','Servo','Laser','Turbo','Nano','Static'],noun:['Mainframe','Gadget','Dynamo','Override','Glitch','Rocket','Firewall','Piston']},
  innate:{pre:['Feral','Titan','Primal','Granite','Savage','Brute','Swift','Hyper','Mega','Wild'],noun:['Juggernaut','Mantis','Grizzly','Colossus','Rhino','Panther','Hornet','Behemoth']},
  magic:{pre:['Hex','Rune','Wraith','Mystic','Spell','Grim','Astral','Soul','Witch','Omen'],noun:['Warlock','Sorceress','Oracle','Banshee','Conjurer','Hexer','Seer','Alchemist']}};
function oGenName(t){const W=O_NW,D=W[t]||{pre:[],noun:[]},pre=[...W.pre,...D.pre,...D.pre],noun=[...W.noun,...D.noun,...D.noun];
  switch(rnd(6)){case 1:case 2:return pick(pre)+pick(W.suf);case 3:return `${pick(W.title)} ${pick(noun)}`;case 4:return `The ${pick(noun)}`;case 5:return `${pick(W.adj)} ${pick(noun)}`;default:return pick(W.solo)}}
function oRandName(t){for(let i=0;i<60;i++){const n=oGenName(t);if(n.length<=18&&!S.heroes.some(h=>h.name===n))return n}return 'Nightwatcher'}
const oTrack=c=>{const sp=oOpt('spark',c.picks.spark);return sp?sp.track:null};
function oSuggest(c){const out=[];for(let i=0;i<40&&out.length<6;i++){const n=oRandName(oTrack(c));if(!out.includes(n))out.push(n)}return out}
const oClean=s=>String(s).replace(/[^A-Za-z0-9 .'\-]/g,'').slice(0,18);
function oStart(mode){S.cre={mode,step:0,picks:{},name:'',col:pick(O_COLS),ups:[],gear:[],hq:[]};S.view='create'}
function oPick(sid,id){const c=S.cre;c.picks[sid]=id;
  if(sid==='spark'){const sp=oOpt('spark',id);if(c.picks.gift&&!O_POW[sp.track].includes(c.picks.gift))delete c.picks.gift;delete c.picks.training;c.ups=[];c.gear=[]}
  if(sid==='career'){delete c.picks.training;c.ups=[];c.gear=[];c.hq=[]}
  if(sid==='training')c.gear=[];
  if(sid==='style')c.ups=c.ups.filter(u=>u!=='range'||(oOpt('style',id).range>1))}
function oFinish(){const c=S.cre;if(!c.name.trim())c.name=oRandName(oTrack(c));const r=oBuild(c),xo=c.mode==='xover',L=[];
  const h=newHero('custom',r.base.name,r.base);
  h.origin=['life','spark','style','drive'].map(s=>oOpt(s,c.picks[s]).n);
  if(xo){h.est=true;h.ranks=r.ranks;h.upgrades=c.ups.slice();c.gear.forEach(g=>putGear(h,g));
    for(const id of c.hq){
      if(id==='tech'){S.tech+=4;L.push('+4 tech')}
      else if(id==='files'){S.intel+=3;L.push('+3 intel')}
      else if(id==='fans'){S.trust+=2;L.push('+2 trust')}
      else if(id==='trophy'){S.villains.filter(v=>v.status==='active').forEach(v=>S.salvage[v.key]+=2);L.push('+2 salvage from each free villain')}
      else if(id==='notes'){const a=unlockRandom(),b=unlockRandom();L.push(`new blueprints: ${[a,b].filter(Boolean).join(', ')}`)}
      else if(id.startsWith('pat-')){const k=id.slice(4);if(!S.facilities.includes(k))S.facilities.push(k);L.push(`a free ${FAC[k].name}`)}}
    if(S.cheat&&S.cheat.xover)S.cheat.xover=false;else{S.xover=S.xover||[];S.xover.push(xArc())}}
  recruitXp(h);h.hp=stat(h,'maxHp');h.comp=stat(h,'maxComp');S.heroes.push(h);if(S.party.length<4)S.party.push(h.id);
  S.flash=`${h.name} joins the Blackharbor Guardians${xo?` at level ${lvlOf(h)}`:''}${L.length?`, bringing ${L.join('; ')}`:''}.${S.party.includes(h.id)?' Added to the party.':' Waiting on the bench.'}`;
  S.ui=S.ui||{};S.ui['h-'+h.id]=true;S.cre=null;S.view='hq'}
function recruitQuick(cls){if(roster().length>=ROSTER_MAX||roster().some(h=>h.cls===cls))return;const h=newHero(cls);recruitXp(h);h.hp=stat(h,'maxHp');h.comp=stat(h,'maxComp');S.heroes.push(h);if(S.party.length<4)S.party.push(h.id)}
/* recruits who join after issue #1 start with 1 XP per issue completed */
const recruitXpN=(x=0)=>Math.max(0,Math.min((S.issue||1)+x,MAX_ISSUE+1)-1);
const recruitXpTxt=()=>recruitXpN()?`<p class="small" style="margin:0" data-tip="kw:xp">Joins with <b>${recruitXpN()} XP</b>, 1 for each issue completed.</p>`:'';
function recruitXp(h,x=0){h.xp+=recruitXpN(x);while(h.xp>=xpNeed(h)){h.xp-=xpNeed(h);h.pendingUp++}}
function newHero(cls,name,base){const b=base||HERO_BASE[cls];const ranks={tech:0,innate:0,magic:0};ranks[b.track]=1;
  return {pouch:[],id:cls+Math.random().toString(36).slice(2,7),cls,name:name||b.name,hp:b.maxHp,comp:b.maxComp,xp:0,ranks,trackPick:null,pendingUp:0,upChoices:null,upgrades:[],gear:{},injuries:[],cd:0,retired:false,...(base?{base:{...base}}:{})}}
const lvlOf=h=>h.ranks.tech+h.ranks.innate+h.ranks.magic;
const RANK_MAX=5;
const reactorOn=()=>!!(S&&S.facilities&&S.facilities.includes('reactor'));
/* Version 124 (Tyler): no level bonus. Max Power = Tech rank + 1 per Tech item worn + bonuses; max Arcana = Magic rank + the Magic rank each worn item requires + bonuses (Tyler, Version 125) */
const gearPoolTxt=g=>{if(g.cons)return '';const o=[];if(g.type==='tech')o.push('+1 max Power');if(g.reqs&&g.reqs.magic)o.push(`+${g.reqs.magic} max Arcana`);return o.length?o.join(' and ')+' while worn':''};
const techGearN=h=>wornGear(h).filter(g=>GEAR[g]&&GEAR[g].type==='tech').length;
const magicGearA=h=>wornGear(h).reduce((s,g)=>s+((GEAR[g]&&GEAR[g].reqs&&GEAR[g].reqs.magic)||0),0);
const pwrMax=h=>h.ranks.tech?h.ranks.tech+techGearN(h)+stat(h,'maxPwr')+(reactorOn()?3:0):0;
const arcMax=h=>h.ranks.magic?h.ranks.magic+magicGearA(h)+stat(h,'maxArc')+(reactorOn()?1:0):0;
const pwrRegen=h=>1+stat(h,'pwrRegen');
/* Version 123 (Tyler): Innate rank is gone; Innate abilities use the Innate rank itself */
const potOf=h=>h.ranks.innate||0;
const innUses=h=>1+stat(h,'innUses');
const resMax=(h,t)=>t==='tech'?pwrMax(h):t==='magic'?arcMax(h):0;
const canWear=(h,g)=>Object.entries(GEAR[g].reqs).every(([t,n])=>h.ranks[t]>=n);
/* a value is a number, or [a,b,c] = a + floor(b × Innate rank + c); c is optional, so [0,0.5,0.5] is half Innate rank rounded up */
const abV=(x,P)=>Array.isArray(x)?Math.max(0,x[0]+Math.floor(x[1]*Math.min(RANK_MAX,P||0)+(x[2]||0)+1e-9)):x;
function abF(x,P,min){if(!Array.isArray(x))return String(x);if(P!=null)return String(abV(x,P));const[a,b]=x;
  if(Number.isInteger(b))return b<0?`${a} − Innate rank`:`${a?a+' + ':''}${b===1?'':b+' × '}Innate rank`;
  return String(abV(x,min||1))}
/* for values that only step up at some Innate rank levels: "2 at Innate rank 4+, 3 at 6+" */
function abSteps(x,min){if(!Array.isArray(x)||Number.isInteger(x[1]))return '';const o=[];let prev=abV(x,min||1);
  for(let p=(min||1)+1;p<=RANK_MAX;p++){const v=abV(x,p);if(v!==prev){o.push(o.length?`${v} at ${p}+`:`${v} at Innate rank ${p}+`);prev=v}}return o.join(', ')}
const abCost=(g,short)=>g.cons?(short?'ONCE':'single use, free action'):g.type==='innate'?(short?`REQ INN ${g.ab.min}`:`requires Innate rank ${g.ab.min}+`):`${g.ab.c} ${short?TRACKS[g.type].abbr:TRACKS[g.type].res}`;
function abTxt(a,P){const f=a.fx||{},L=[];let sx=[];
  const v=x=>{if(P==null){const st=abSteps(x,a.min);if(st)sx.push(st)}return abF(x,P,a.min)};
  const pl=(x,o,m)=>{const t=v(x);return `${t} ${t==='1'?o:m}`};
  const push=t=>{L.push(t.replace(/\.$/,'')+(sx.length?` (${sx.join('; ')})`:'')+'.');sx=[]};
  if(a.act)push('Uses your action.');
  if(a.mode==='ally')push(`Pick yourself or an ally within ${a.r===1?'1 hex':`range ${v(a.r)}`}.`);
  if(a.mode==='tele')push(`${a.leap?'Leap':'Teleport'} to an empty hex within ${v(a.r)} hexes.`);
  if(a.mode==='cover')push(`Raise a wall on an empty hex within ${v(a.r)}. It blocks movement and crumbles at the end of the next round.`);
  if(a.mode==='strike')push(`Attack a villain ${a.rng?`within ${a.rng} hexes`:'at any range'} with ${a.dice?`${a.dice} dice`:`your dice +${a.plus}`}${a.str?` and +${a.str} Strength`:''}.${a.splash?` Every henchman within 2 of it takes ${a.splash} damage.`:''}`);
  if(f.evaNext)push(`${a.mode==='ally'?'They get':'Get'} +${v(f.evaNext)} evasion against the next attack on ${a.mode==='ally'?'them':'you'}.`);
  if(f.ward)push(a.mode==='ally'?'They ignore the next hit against them.':'Ignore the next hit against you.');
  if(f.heal)push(`${a.mode==='ally'?'They regain':'Regain'} ${v(f.heal)} health.`);
  if(f.comp)push(`Regain ${v(f.comp)} composure.`);
  if(f.absorb)push(`${a.mode==='ally'?'They gain':'Gain'} a shield that absorbs ${v(f.absorb)} damage. It lasts until used up.`);
  if(f.dr)push(`Take ${v(f.dr)} less damage from each hit (never below 1) until the round ends.`);
  if(f.drAll)push(`You and adjacent allies take ${v(f.drAll)} less damage from each hit (never below 1) until the round ends.`);
  if(f.eva)push(`+${v(f.eva)} evasion until the round ends.`);
  if(f.anchor)push('You cannot be shoved or dragged until the round ends.');
  if(f.breach)push('Smash every wall and rubble pile next to you.');
  if(f.shove)push(`Shove each adjacent villain 1 hex away if its size is no more than ${P==null?'your Innate rank':P}.`);
  const nx=[];if(f.dice)nx.push(`+${pl(f.dice,'die','dice')}`);if(f.acc)nx.push(`${v(f.acc)<0?'−'+(-v(f.acc)):'+'+v(f.acc)} accuracy`);if(f.str)nx.push(`+${v(f.str)} Strength`);
  if(!nx.length&&f.back)push(`Your next attack this round gets +${pl(f.back,'die','dice')} if it is a melee attack from a side arc or the blind spot.`);
  if(nx.length)push(`Your next attack this round: ${nx.length>1?nx.slice(0,-1).join(', ')+' and '+nx[nx.length-1]:nx[0]}${f.back?`, plus ${pl(f.back,'die','dice')} more on a melee attack from a side arc or the blind spot`:''}.`);
  if(f.reap)push(`It heals you ${v(f.reap)} for every page it tears.`);
  if(f.rally)push(`You and allies within 2 regain ${v(f.rally)} composure.`);
  if(f.callout)push(`The next hero attack on the villain this round gets +${pl(f.callout,'die','dice')}.`);
  if(f.mark)push('Once per fight. Until the round ends, every hero attack on the villain from a side arc or the blind spot gets +1 die.');
  if(f.hex)push(`The villain has −${f.hexAmt||4} evasion until the round ends.`);
  if(f.blind)push('The villain is blinded: −4 accuracy until the round ends.');
  if(f.vsplash)push(`Every henchman within 2 of the villain takes ${v(f.vsplash)} damage.`);
  if(f.reflect)push('Until the round ends, the first time the villain hits you, it tears one of its own pages.');
  if(f.riposte)push('Until the round ends, the first time the villain misses you, strike back with a free 1-die attack if it is within your range.');
  if(f.scry)push(`Look at the villain's next ${f.scry} pages and choose which one it plays first.`);
  if(f.bury)push("Look at the villain's next page. You may bury it at the bottom of the playbook.");
  if(f.excise)push(`Until the round ends, the next page torn from the villain is the one you choose from its next ${f.excise}.`);
  if(f.scramble)push("Shuffle the villain's playbook. Anything foreseen is lost.");
  if(f.curse)push('The villain deals 2 less damage (never below 1) until the round ends.');
  if(f.face)push('The villain turns to face you, showing its blind spot to your allies.');
  if(f.foresee)push("Reveal the villain's next page.");
  if(f.eclipse)push("Cancel the villain's charged attack.");
  if(f.shock)push(`Every henchman within ${f.shock[0]} of ${a.mode==='tele'?'where you land':'you'} takes ${f.shock[1]} damage.`);
  if(f.gain)push(`Regain ${v(f.gain)} Arcana.`);if(f.gainP)push(`Regain ${v(f.gainP)} Power.`);
  if(f.tear)push(`Tear ${f.tear===1?'a page':f.tear+' pages'} from the villain's playbook. Hit reactions don't trigger.`);
  if(f.stasis)push("You and allies within 1 hex take no damage from anything until your next turn.");
  if(f.skip)push("The villain's next turn is lost: its next page (or charged attack) is thrown away unplayed.");
  if(f.boost){push(`Your next move goes ${pl(f.boost,'hex','hexes')} farther${f.jump?', and that move is a jump':''}`);push('It lasts until you move')}
  if(f.move)push('Move again.');
  if(f.again)push('Take a second action this round.');
  if(f.hpCost)push(`Then lose ${v(f.hpCost)} health (never below 1).`);
  return L.join(' ')}
/* rank perks: ranks 2-3 (or a first rank outside the origin) give the old perk; ranks 4 and 5 are masteries */
/* Version 22: ranks give no stats on their own; only rank 5 grants a capstone */
const RANK_PERK={tech:{5:{acc:2,pwrRegen:1}},innate:{5:{maxHp:4,innUses:1}},magic:{5:{maxComp:2,arcWound:1}}};
const perkAt=(t,n)=>RANK_PERK[t][n]||{};
function rankMod(h,t,k){const own=t===BASE(h).track;let v=0;for(let n=own?2:1;n<=Math.min(h.ranks[t],RANK_MAX);n++)v+=perkAt(t,n)[k]||0;return v}
function perkTxt(t,n){const m=perkAt(t,n),s=[];for(const[k,v]of Object.entries(m)){if(k==='innUses')s.push('a second Innate ability once per fight, which comes back after any round in which you use no abilities');else if(k==='arcWound')s.push('+1 Arcana whenever an attack tears a page');else s.push(`${v>0?'+':''}${v} ${MODN[k]}`)}return s.join(', ')}

/* Version 22: signature powers run on the discipline engines instead of cooldowns */
const POW_ENG={arc:{d:'tech',c:2},patch:{d:'tech',c:3},barricade:{d:'tech',c:2},overclock:{d:'tech',c:3},drone:{d:'tech',c:2},emp:{d:'tech',c:3},
  brace:{d:'innate',min:1},mark:{d:'innate',min:1},quake:{d:'innate',min:1},regen:{d:'innate',min:1},berserk:{d:'innate',min:1},leap:{d:'innate',min:1},
  blur:{d:'magic',c:1},omen:{d:'magic',c:1},curse:{d:'magic',c:2},aegis:{d:'magic',c:2},drain:{d:'magic',c:2},serene:{d:'magic',c:1}};
const powCost=(pw,short)=>{const e=POW_ENG[pw];return e.d==='innate'?(short?`REQ INN ${e.min}`:`requires Innate rank ${e.min}+ and uses your Innate ability for the round`):`${e.c} ${short?TRACKS[e.d].abbr:TRACKS[e.d].res}`};
function powOk(u,h){const pw=BASE(h).power,e=POW_ENG[pw],P=POWERS[pw];if(!e||u.ko)return false;if(!P.free&&u.acted)return false;if(pw==='mark'&&u.markUsed)return false;
  if(e.d!=='innate'&&(u.abUsed||[]).includes('pow'))return false;
  if(e.d==='innate')return potOf(h)>=e.min&&innOk(u,h);return (u.res[e.d]||0)>=e.c}
function payPow(u,h){const e=POW_ENG[BASE(h).power];if(!e)return;if(e.d!=='innate')(u.abUsed=u.abUsed||[]).push('pow');u.abRd=true;if(e.d==='innate'){if(u.innUsed)u.capUsed=true;u.innUsed=(u.innUsed||0)+1}else u.res[e.d]=Math.max(0,(u.res[e.d]||0)-e.c)}
const engineTxt={tech:'+1 max Power',innate:'+1 Innate rank',magic:'+1 max Arcana'};
function poolTxt(h){const o=[];if(pwrMax(h))o.push(`${pwrMax(h)} Power (+${pwrRegen(h)}/round)`);if(arcMax(h))o.push(`${arcMax(h)} Arcana (per fight)`);if(potOf(h))o.push(`Innate rank ${potOf(h)}${innUses(h)>1?' (+1 Innate ability once per fight)':''}`);return o.join(' · ')||'none'}
const gainTxt=(h,t)=>{const c={...h,ranks:{...h.ranks,[t]:h.ranks[t]+1}},o=[],dp=pwrMax(c)-pwrMax(h),da=arcMax(c)-arcMax(h),dq=potOf(c)-potOf(h);if(dp)o.push(`+${dp} max Power`);if(da)o.push(`+${da} max Arcana`);if(dq)o.push(`+${dq} Innate rank`);return o.join(', ')};
function newCampaign(prev){
  const keys=shuffle(Object.keys(VILLAINS).filter(k=>!VILLAINS[k].intro));
  /* Version 94 (Tyler): new campaigns start with the Workshop built */
  S={vol:(prev&&prev.vol||0)+1,issue:1,trust:6,tech:3,intel:2,salvage:Object.fromEntries(Object.keys(VILLAINS).map(k=>[k,0])),facilities:['workshop'],armory:STARTER_LOCKER.slice(),ethos:{},
    heroes:[],fallen:[],xover:[],
    villains:keys.slice(0,3).map(k=>makeVillain(k,1)),pool:keys.slice(3),unlocked:START_UNLOCK.slice(),
    phase:'hq',view:'hq',inv:null,sd:null,after:null,arcInfo:null,chronicle:[],over:null,seen:(prev&&prev.seen)||{},seenR:(prev&&prev.seenR)||{},tips:(prev&&prev.tips)||[],tipsOff:!!(prev&&prev.tipsOff),mig3:true,d20:true,str1:true,deck3:true,deck2:true,disc5:true,v22:true,v59:true,v61:true,v62:true,v130:true};
  pick(S.villains).scheme=1;
  S.party=[];
  S.guide={s:0,pop:null};if(prev&&prev.tutDone)S.tutDone=true;else S.tut={b:0,dq:[]};S.ui=Object.fromEntries(['hq-base','hq-ws','hq-back','hq-skunk','ro-bench'].map(k=>[k,false]));
}
function introduceVillain(arc,L){if(!S.pool.length)return null;const k=S.pool.shift();
  const hi=Math.max(0,...S.villains.filter(v=>v.status==='active').map(v=>v.level));
  const lvl=Math.min(VCAP,Math.max(2*arc,hi+1));const vs=makeVillain(k,lvl);S.villains.push(vs);
  L.push(`New threat: ${VILLAINS[k].name}, ${VILLAINS[k].tag.toLowerCase()}, arrives at level ${vs.level} with a ${vs.deck.length}-page playbook.`);return vs}
function arcTransition(newArc){const L=[];
  for(const vs of S.villains){if(vs.status!=='active')continue;const d=VILLAINS[vs.key];
    levelUpVillain(vs);upgradeVillain(vs,3);
    L.push(`${d.name} rises to level ${vs.level} and rewrites part of the playbook.`)}
  introduceVillain(newArc,L);
  const un=unlock(ARC_UNLOCK[newArc]||[]);if(un.length)L.push(`New blueprints: ${un.join(', ')}.`);
  L.push('Crossover Issue open: one Established Character can join from HQ this arc.');
  return {arc:newArc,lines:L}}
function finishIssue(L,{hunted,headline,vkey}){
  for(const o of S.villains){if(o.key===hunted||o.status!=='active')continue;o.scheme++;
    if(o.scheme>=schemeMax()){o.scheme=0;levelUpVillain(o);S.trust-=2;L.push(`${VILLAINS[o.key].name}'s scheme hits the city while you were busy. −2 trust, and they rise to level ${o.level}.`)}}
  if(S.facilities.includes('press')){S.trust++;L.push('Press Office: +1 trust.')}
  if(S.ethos.b==='public'){S.trust++;L.push('Public Faces: +1 trust.')}
  {const n=fieldCount('scrap');if(n){S.tech+=n;L.push(`Scavenger's Satchel: +${n} tech.`)}}
  const ft=fieldCount('trust');if(ft){S.trust+=ft;L.push(`Spokesperson Mask: +${ft} trust.`)}
  S.chronicle.push(vkey?`#${S.issue}: ${VILLAINS[vkey].name}, ${headline.toLowerCase().replace('!','')}.`:`#${S.issue}: ${headline.toLowerCase()} while the team heals.`);
  const pend=(S.issue===1&&!S.ethos.a)?'a':(S.issue>=4&&!S.ethos.b)?'b':null;
  if(S.issue%ISSUES_PER_ARC===0){const n=Math.floor(Math.max(0,S.trust)/10);if(n){S.intel+=n;L.push(`Tip line: the city calls in what it saw this arc. +${n} intel (1 per 10 trust).`)}}
  const ended=S.issue;S.issue++;{const un=S.issue>=TIER3_ISSUE?unlock(MID_UNLOCK):[];if(un.length)L.push(`New blueprints: ${un.length} tier 3 items are now on file.`)}issueStart(L);
  S.after={headline,lines:L,vkey,ethos:pend};S.sd=null;S.inv=null;S.phase='after';S.view='mission';
  if(ended%ISSUES_PER_ARC===0&&ended<MAX_ISSUE)S.arcInfo=arcTransition(arcOf(ended)+1);
  if(!S.villains.some(v=>v.status==='active')){const extra=[];if(introduceVillain(arcOf(S.issue),extra))(S.arcInfo?S.arcInfo.lines:L).push(...extra)}
  if(S.trust<=0)S.over={win:false,txt:'Blackharbor has turned on its heroes. The Blackharbor Guardians disband mid-volume.'};
  else if((!S.villains.some(v=>v.status==='active')&&!S.pool.length)||S.issue>MAX_ISSUE){S.finalePending=true;S.arcInfo=null;(S.after.lines).push('The volume builds to its climax. The event comic begins.')}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{const t=localStorage.getItem(KEY);if(t){S=JSON.parse(t);if(S.sd){S.sd.busy=false;S.sd.vturn=false;if(!S.sd.vl){S.sd.v.charge=S.sd.charge;S.sd.v.hex=S.sd.hex;S.sd.vl=[{key:S.sd.vkey,v:S.sd.v}];S.sd.vi=0}S.sd.v=S.sd.vl[S.sd.vi||0].v;N=S.sd.N||9}S.seen=S.seen||{};S.seenR=S.seenR||{};if(S.sd&&!S.sd.bombs)S.sd.bombs=[];if(S.sd&&!S.sd.beams)S.sd.beams=[];if(S.salvage&&S.salvage.serpent==null)S.salvage.serpent=0;if(S.salvage&&S.pool&&S.villains){const have=new Set([...S.pool,...S.villains.map(v=>v.key)]);['lode','noct','swarm','bomber','grid'].forEach(k=>{if(S.salvage[k]==null)S.salvage[k]=0;if(!have.has(k))S.pool.splice(rnd(S.pool.length+1)-1,0,k)})}if(S.sd&&!S.sd.hexv){try{migrateSd()}catch(e){}}if(S.sd&&!S.sd.exits)S.sd.exits=mkExits(S.sd.N||9,!!S.sd.finale);S.xover=S.xover||[];if(S.cre&&S.phase!=='hq'){S.cre=null;if(S.view==='create')S.view='mission'}if(S.inv){if(S.inv.peak==null)S.inv.peak=S.inv.clues;S.inv.found=S.inv.found||[]}if(!S.party){const had=roster();S.party=had.slice(0,4).map(h=>h.id);Object.keys(HERO_BASE).forEach(c=>{if(!S.heroes.some(h=>h.cls===c)){const n=newHero(c);giveStart(n);S.heroes.push(n)}})}if(!S.d20){S.heroes.forEach(h=>{if(h.base){h.base={...h.base};for(const k of ['acc','str','eva'])h.base[k]=(h.base[k]||0)*2}});S.d20=true}if(!S.str1){S.heroes.forEach(h=>{if(h.base){h.base={...h.base};h.base.str=(h.base.str||0)-1}});S.str1=true}if(!S.deck3){(S.villains||[]).forEach(v=>{if(v.level>1)addAdv(v,v.level-1)});S.deck3=true}if(!S.deck2){(S.villains||[]).forEach(v=>{const d=deckSize(v)-v.deck.length,nb=VILLAINS[v.key].base.length;if(d>0)addAdv(v,d);for(let i=d;i<0&&v.deck.length>nb;i++){v.deck.pop();v.advIdx=Math.max(0,v.advIdx-1)}});S.deck2=true}if(!S.mig3){S.heroes.forEach(h=>{const r=h.ranks;if(h.cls==='volt')[r.tech,r.magic]=[r.magic,r.tech];if(h.cls==='wisp')[r.magic,r.innate]=[r.innate,r.magic]});S.mig3=true}if(!S.disc5)migrateDisc5();if(!S.v22)migrateV22();if(!S.v59)migrateV59();
/* Version 61: new set pieces unlock for arcs already reached and villains already beaten */
if(!S.v61){const arc=arcOf(Math.min(S.issue||1,MAX_ISSUE)),fresh=new Set(NEW_GEAR_V61.map(k=>'gear:'+k)),add=it=>{if(fresh.has(it)&&!S.unlocked.includes(it))S.unlocked.push(it)};
  for(let a=2;a<=arc;a++)(ARC_UNLOCK[a]||[]).forEach(add);(S.villains||[]).filter(v=>v.status==='captured'||v.beaten).forEach(v=>(DEFEAT_UNLOCK[v.key]||[]).forEach(add));S.v61=true}
/* Version 62: new blueprints follow the arcs already reached; stats moved between slots, so clamp health and composure */
if(!S.v62){const arc=arcOf(Math.min(S.issue||1,MAX_ISSUE)),fresh=new Set(NEW_GEAR_V62.map(k=>'gear:'+k)),add=it=>{if(fresh.has(it)&&!S.unlocked.includes(it))S.unlocked.push(it)};
  START_UNLOCK.forEach(add);for(let a=2;a<=arc;a++)(ARC_UNLOCK[a]||[]).forEach(add);S.heroes.forEach(clampHero);S.v62=true}if(!S.v82)migrateV82();if(!S.v121)migrateV121();if(!S.v123)migrateV123();if(!S.v124)migrateV124();if(!S.v126)migrateV126();if(!S.v130)migrateV130();/* Version 132 (Tyler): heroes no longer sit out an issue after a knockout */if(!S.v132){(S.heroes||[]).forEach(h=>delete h.rest);S.v132=true}
  /* Version 102: the new starter blueprints */['gear:baton','gear:knuckles','gear:goggles','gear:hood','gear:headband'].forEach(it=>{if(S.unlocked&&!S.unlocked.includes(it))S.unlocked.push(it)});return true}}catch(e){}return false}
/* Version 82: capture, interrogation, leads and the clue consumables are gone. Captured villains go free again (they keep their blueprints),
   a built Containment Cell is refunded, and Informant's Tips and Search Warrants are sold back for intel. */
/* Version 121: Main Hand / Off Hand. A main-only weapon in the off hand (or off-only in the main hand) moves over if that hand is free, else goes back to the armory */
/* Version 123: unlock the new Off Hand gear for arcs already reached, and top villain playbooks up to the +3 per level size */
/* Version 124: open gear blueprints by tier for the Arc already reached */
/* Version 126: tier 3 blueprints for saves already past issue 10 */
/* Version 130: lasting injuries from the old injury roll are healed (Rattled stays). Heroes who already retired stay retired */
function migrateV130(){(S.heroes||[]).forEach(h=>{if(h.injuries&&h.injuries.some(k=>k!=='rattled')){h.injuries=h.injuries.filter(k=>k==='rattled');clampHero(h)}});S.v130=true}
function migrateV126(){const add=it=>{if(!S.unlocked.includes(it))S.unlocked.push(it)};if((S.issue||1)>=TIER3_ISSUE)MID_UNLOCK.forEach(add);if(arcOf(Math.min(S.issue||1,MAX_ISSUE))>=3)ARC_UNLOCK[3].forEach(add);S.v126=true}
function migrateV124(){const arc=arcOf(Math.min(S.issue||1,MAX_ISSUE)),add=it=>{if(!S.unlocked.includes(it))S.unlocked.push(it)};
  START_UNLOCK.forEach(add);for(let a=2;a<=arc;a++)(ARC_UNLOCK[a]||[]).forEach(add);S.v124=true}
function migrateV123(){const arc=arcOf(Math.min(S.issue||1,MAX_ISSUE)),add=it=>{if(!S.unlocked.includes(it))S.unlocked.push(it)};
  ['gear:riotshield','gear:bonebuckler','gear:wardtome'].forEach(add);if(arc>=2)['gear:kinbuckler','gear:scramblepad','gear:quillguard','gear:veillantern'].forEach(add);if(arc>=3)['gear:aegisgen','gear:ironbark','gear:sanctaegis'].forEach(add);
  (S.villains||[]).forEach(vs=>{const n=deckSize(vs)-vs.deck.length;if(n>0)addAdv(vs,n)});S.v123=true}
function migrateV121(){(S.heroes||[]).forEach(h=>{const g=h.gear||{};
  const bad=(s,x)=>x&&GEAR[x]&&!GEAR[x].two&&GEAR[x].hand===(s==='arms'?'off':'main');
  if(bad('arms',g.arms)&&bad('arms2',g.arms2))[g.arms,g.arms2]=[g.arms2,g.arms];
  for(const s of ['arms','arms2']){const x=g[s];if(!bad(s,x))continue;const o=s==='arms'?'arms2':'arms';delete g[s];if(!g[o])g[o]=x;else S.armory.push(x)}
  clampHero(h)});S.v121=true}
function migrateV82(){const gone=['c_tip','c_warrant'];let sold=0;const keep=g=>{if(gone.includes(g)){sold+=g==='c_warrant'?2:1;return false}return true};
  (S.villains||[]).forEach(v=>{if(v.status==='captured'){v.status='active';v.scheme=0;v.beaten=(v.beaten||0)+1}delete v.interrogated});
  if((S.facilities||[]).includes('cell')){S.facilities=S.facilities.filter(f=>f!=='cell');S.tech+=5;S.intel+=3}
  S.unlocked=(S.unlocked||[]).filter(it=>it!=='fac:cell'&&!gone.some(g=>it==='gear:'+g));
  S.armory=(S.armory||[]).filter(keep);(S.heroes||[]).forEach(h=>{if(h.pouch)h.pouch=h.pouch.filter(keep)});S.intel+=sold;
  delete S.leads;if(S.phase==='intg'){S.phase='hq';S.view='hq'}delete S.intg;S.v82=true}
/* v20: ranks cap at 5 (extra ranks move to the lowest other discipline), fights in progress get the new pools, and campaigns already in Arc 2 or 3 get the new blueprints */

/* Version 22 saves: stats drop with the per-rank perks, heroes get a pouch, and the new blueprints follow the arcs already reached */
function migrateV22(){S.heroes.forEach(h=>{h.pouch=h.pouch||[];h.hp=Math.min(h.hp,stat(h,'maxHp'));h.comp=Math.min(h.comp,stat(h,'maxComp'))});
  const arc=arcOf(Math.min(S.issue,MAX_ISSUE)),add=['gear:grapbelt','gear:satchel','gear:journal','gear:c_smoke','gear:c_flash','gear:c_stim','gear:c_salts','gear:c_charm'];
  if(arc>=2)add.push('gear:wiretap','gear:trophy','gear:sash','gear:c_frag','gear:c_batt','gear:c_vial','gear:c_adren');
  if(arc>=3)add.push('gear:bandolier','gear:champ','gear:censer');unlock(add);
  if(S.sd)S.sd.units.forEach(u=>{u.innUsed=u.innUsed||0});S.v22=true}
/* Version 59: new set items unlock for arcs already reached; stats moved, so clamp health and composure */
function migrateV59(){const arc=arcOf(Math.min(S.issue||1,MAX_ISSUE)),fresh=new Set(NEW_GEAR_V59.map(k=>'gear:'+k));
  for(let a=2;a<=arc;a++)(ARC_UNLOCK[a]||[]).filter(it=>fresh.has(it)&&!S.unlocked.includes(it)).forEach(it=>S.unlocked.push(it));
  S.heroes.forEach(h=>{h.hp=Math.min(h.hp,stat(h,'maxHp'));h.comp=Math.min(h.comp,stat(h,'maxComp'))});S.v59=true}
function migrateDisc5(){S.heroes.forEach(h=>{const r=h.ranks;for(const t in r)while(r[t]>RANK_MAX){r[t]--;const o=Object.keys(r).filter(x=>r[x]<RANK_MAX).sort((a,b)=>r[a]-r[b])[0];if(o)r[o]++}h.hp=Math.min(h.hp,stat(h,'maxHp'));h.comp=Math.min(h.comp,stat(h,'maxComp'))});
  if(S.sd&&S.sd.units)S.sd.units.forEach(u=>{const h=heroOf(u);if(!h)return;const t0=u.res&&u.res.tech!=null?u.res.tech:pwrMax(h);u.res={tech:Math.min(pwrMax(h),t0),magic:arcMax(h)};u.innUsed=0});
  const arc=arcOf(Math.min(S.issue||1,MAX_ISSUE)),fresh=new Set(NEW_GEAR_V20.map(k=>'gear:'+k));for(let a=2;a<=arc;a++)(ARC_UNLOCK[a]||[]).filter(it=>fresh.has(it)&&!S.unlocked.includes(it)).forEach(it=>S.unlocked.push(it));
  if(!S.unlocked.includes('gear:runeblade'))S.unlocked.push('gear:runeblade');S.disc5=true}

/* a fight saved on the old square board keeps its positions as hex offsets; villains get their footprint and refreshed pages */
function migrateSd(){const sd=S.sd;sd.walls=sd.walls||[];sd.pits=sd.pits||[];sd.vl.forEach((o,i)=>{const v=o.v;v.shape=VILLAINS[o.key].shape;if(v.face==null)v.face=5;
    ['deck','discard','wounds'].forEach(f=>v[f]=(v[f]||[]).map(c=>buildCard(o.key,{id:c.id,mk:c.mk||0})));if(v.last)v.last=buildCard(o.key,{id:v.last.id,mk:v.last.mk||0});
    focusV(i);if(!vFits(v.x,v.y)){let best=null,bd=1e9;for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!vFits(x,y))continue;const d=cheb({x,y},v);if(d<bd){bd=d;best={x,y}}}if(best){v.x=best.x;v.y=best.y}}
    if(vBig(v))shoveOut(5)});focusV(sd.vi||0);sd.hexv=1}
/* Shaken: a hero at 0 composure in a fight */
const SHAKEN={str:2,acc:2,eva:2,move:1};
function stat(h,k,raw){const b=BASE(h);let v=b[k]??0;
  for(const u of h.upgrades)v+=UPG[u].mods[k]||0;
  for(const g of wornGear(h))v+=GEAR[g].mods[k]||0;
  {const pk=pairOf(h);if(pk&&GEAR[pk].pair.mods)v+=GEAR[pk].pair.mods[k]||0}
  v+=auraMod(h,k);
  for(const s of setsOn(h))v+=SETS[s].mods[k]||0;
  for(const t in TRACKS)v+=rankMod(h,t,k);
  for(const i of h.injuries)v+=INJ[i].mods[k]||0;
  if(k==='str'&&S.ethos.a==='force')v+=2;
  if(k==='maxComp'&&S.ethos.b==='secret')v+=1;
  if(S.sd&&h.comp<=0&&SHAKEN[k])v-=SHAKEN[k];
  /* Version 108 (Tyler): Optics Bench scope rails, +1 range and +1 accuracy in showdowns for heroes with range 2+ */
  if(!raw&&S.sd&&(k==='range'||k==='acc')&&S.facilities.includes('optics')&&(k==='range'?v:stat(h,'range',1))>=2)v+=1;
  if(k==='move'||k==='maxComp'||k==='speed')v=Math.max(1,v);
  return v}
/* Version 62 gear helpers */
/* Version 121 (Tyler): the two Hand slots are now a Main Hand (arms) and an Off Hand (arms2); two-handed weapons fill both.
   gear.hand: 'main' = offensive one-handers, 'off' = defensive or weaker one-handers, 'either' = Paired weapons, which sit at off-hand
   stat level and now count in full from both hands (stats and set count), plus their pair bonus. */
/* Version 123 (Tyler): defensive Off Hand gear (mostly max health, evasion rarely) with shield, reflect, ward, deck and debuff abilities,
   and crafting costs about 15% lower. fx.reflect: the first villain hit on you this round tears one of its own pages. */
/* Version 124 (Tyler): every villain set gets a tier 4 and a tier 5 piece and needs 4 pieces worn (SET_N); new non-set gear fills
   the tier 1 Legs and tier 2 one-handed Main Hand gaps; gear unlocks by tier (0-1 at the start, 2-3 in Arc 2, 4-5 in Arc 3) and no
   longer from beating villains; a stat pass trims the outliers (budget: max Power and max health a little cheaper, movement and damage
   reduction dearer, gear with an ability gets fewer stats); Innate scaling tops out at rank 5. */
/* Version 126 (Tyler): Magic items no longer carry +max Arcana (worn Magic ranks fill the pool now), except the Arcana pieces Mana Font,
   Rune Sash and Philosopher's Stone; tier 3 blueprints open halfway through Arc 2 (issue TIER3_ISSUE) instead of at its start;
   and non-set tier 4 Main Hand, Off Hand and Belt gear for each discipline, so Arc 3 has options outside the sets. */
const TIER3_ISSUE=ISSUES_PER_ARC+4,MID_UNLOCK=['gear:uplink','gear:wings','gear:serum','gear:sigil','gear:titan','gear:grimoire','gear:exo','gear:greaves','gear:claws','gear:helm','gear:familiar','gear:faraday','gear:staff','gear:halo','gear:mantle','gear:shadowpaw','gear:bloodstone','gear:hexfist','gear:crown','gear:paragon','gear:wand','gear:bandolier','gear:censer','gear:dynamo','gear:aegisgen','gear:ironbark','gear:sanctaegis'];
/* Version 124: the Innate capstone's extra Innate ability is once per fight, and comes back after a round in which the hero used no abilities */
const innOk=(u,h)=>(u.innUsed||0)<1+(stat(h,'innUses')>0&&!u.capUsed?1:0);
const handN=g=>g.two?'Two hands':g.hand==='main'?'Main Hand':g.hand==='off'?'Off Hand':'Either Hand';
const gearSlotN=g=>g.slot==='arms'?handN(g):slotN(g.slot);
const pairOf=h=>{const a=h.gear.arms;return a&&a===h.gear.arms2&&GEAR[a]&&GEAR[a].pair?a:null};
/* gear that counts for stats and sets: since Version 121 both copies of a Paired weapon count in full */
function wornGear(h){return Object.values(h.gear)}
const gearHas=(h,p)=>Object.values(h.gear).some(g=>GEAR[g]&&GEAR[g][p]);
/* auras: the wearer and each ally within 1 hex add the gear's aura bonus */
/* an effect aura reaches u if u or a standing ally within 1 hex wears it */
function auraOn(u,id){const sd=S.sd;if(!sd||!u||u.ko)return false;return sd.units.some(o=>!o.ko&&cheb(o,u)<=AURA_R&&Object.values(heroOf(o).gear).some(g=>GEAR[g]&&GEAR[g].auraFx===id))}
/* Fortune works on the first attack against each hero per round */
function luckUp(u){if(!auraOn(u,'luck')||u.luckRd===S.sd.round)return false;u.luckRd=S.sd.round;return true}
function auraTags(u){const L=Object.keys(AURA_FX).filter(id=>auraOn(u,id));return L.length?`<div class="row">${L.map(id=>`<span class="tag g" data-tip="kw:aura">${AURA_FX[id].n}</span>`).join('')}</div>`:''}
function auraMod(h,k){const sd=S&&S.sd;if(!sd||!sd.units)return 0;const u=sd.units.find(o=>o.hid===h.id);if(!u||u.ko)return 0;let v=0;
  for(const o of sd.units){if(o.ko||cheb(o,u)>AURA_R)continue;const t=heroOf(o);if(!t)continue;for(const g of new Set(Object.values(t.gear))){const a=GEAR[g]&&GEAR[g].aura;if(a)v+=a[k]||0}}return v}
/* where an item goes: the slot it fills and the slots it clears (a two-handed weapon clears both hands) */
function eqPlan(h,g,pref){const G=GEAR[g],ks=SLOT_KEYS[G.slot]||[G.slot];
  if(G.slot==='arms'){const a=h.gear.arms,b=h.gear.arms2,tw=a&&GEAR[a].two;
    const s=G.two||G.hand==='main'?'arms':G.hand==='off'?'arms2':pref==='arms'||pref==='arms2'?pref:!a?'arms':a===g?'arms2':b===g?'arms':!b?'arms2':'arms2';
    const clear=G.two||tw?['arms','arms2']:[s];return {s,clear,out:clear.map(x=>h.gear[x]).filter(Boolean)}}
  const clear=[ks.find(s=>!h.gear[s])||ks[0]];
  return {s:clear[0],clear,out:clear.map(s=>h.gear[s]).filter(Boolean)}}
function putGear(h,g,pref){const p=eqPlan(h,g,pref);p.clear.forEach(s=>delete h.gear[s]);h.gear[p.s]=g;return p.out}
const roster=()=>S.heroes.filter(h=>!h.retired);
const heroById=id=>S.heroes.find(h=>h.id===id);
const party=()=>(S.party||[]).map(heroById).filter(h=>h&&!h.retired);
const bench=()=>roster().filter(h=>!(S.party||[]).includes(h.id));
const partyHas=fid=>party().some(h=>BASE(h).field&&BASE(h).field.id===fid);
const fieldGear=fid=>party().flatMap(h=>Object.values(h.gear).filter(g=>GEAR[g].field&&GEAR[g].field.id===fid).map(g=>({h,g})));
const fieldCount=fid=>fieldGear(fid).length;
/* Version 93: the last investigation roll is kept so the result can show the die, the bonus and the target */
let lastInvRoll=null;
/* Version 95 (Tyler): Keen Senses gives +2, down from +4 */
function invRoll(){const d=d20(),b=(partyHas('senses')?2:0)+2*fieldCount('roll');lastInvRoll={d,b,t:d+b};return d+b}
const START_GEAR={bulwark:'graft',volt:'visor',wisp:'cloak',cipher:'suit',rivet:'earpiece',lynx:'wraps',goliath:'medkit',sibyl:'coin',hexen:'monocle'};
function giveStart(h){const g=START_GEAR[h.cls];if(g&&!GEAR[g].set&&!h.gear[GEAR[g].slot])h.gear[GEAR[g].slot]=g;h.hp=stat(h,'maxHp');h.comp=stat(h,'maxComp')}
function issueStart(L){const out=[];
  {const n=fieldCount('wiretap');if(n){S.intel+=n;out.push(`Wiretap Rig: +${n} intel.`)}}
  /* Version 107 (Tyler): Bomb Squad Bay hands out one free bomb consumable per issue */
  if(S.facilities.includes('bombsq')){const b=pick(['c_frag','c_flash','c_smoke','c_chaff']);S.armory.push(b);out.push(`Bomb Squad Bay: a free ${GEAR[b].name} is in the armory.`)}
  if(partyHas('premonition')){const sib=party().find(h=>BASE(h).field&&BASE(h).field.id==='premonition');
    const pool=[];S.villains.filter(v=>v.status==='active').forEach(v=>{const seen=(S.seen&&S.seen[v.key])||[];[...new Set(v.deck.map(e=>e.id))].filter(id=>!seen.includes(id)).forEach(id=>pool.push({k:v.key,id}))});
    const got=shuffle(pool).slice(0,2);got.forEach(p=>markSeen(p.k,p.id));S.intel++;
    out.push(`${sib.name}'s Premonition: +1 intel${got.length?`, and visions of ${got.map(p=>`${VILLAINS[p.k].cards[p.id].n} (${VILLAINS[p.k].short})`).join(' and ')}`:''}.`)}
  for(const h of bench()){h.hp=stat(h,'maxHp');h.comp=stat(h,'maxComp');h.xp++;while(h.xp>=xpNeed(h)){h.xp-=xpNeed(h);h.pendingUp++;out.push(`${h.name} trained on the bench and reached level ${lvlOf(h)+h.pendingUp}.`)}}
  L.push(...out)}
const vState=k=>S.villains.find(v=>v.key===k);
function afford(cost){const sv={...S.salvage};for(const[k,n]of Object.entries(cost)){if(k==='any')continue;if(k in sv){if(sv[k]<n)return false;sv[k]-=n}else if(S[k]<n)return false}
  return !cost.any||Object.values(sv).reduce((a,b)=>a+b,0)>=cost.any}
function pay(cost,pick){for(const[k,n]of Object.entries(cost)){if(k==='any')continue;if(k in S.salvage)S.salvage[k]-=n;else S[k]-=n}
  if(pick){for(const k in pick)S.salvage[k]-=pick[k];return}
  for(let i=0;i<(cost.any||0);i++){const k=Object.keys(S.salvage).sort((a,b)=>S.salvage[b]-S.salvage[a])[0];S.salvage[k]--}}
/* Version 89 (Tyler): "any salvage" costs let you choose which salvage pays, or just use the biggest pile. S.anyAuto skips the question. */
function anySplit(cost){const sv={...S.salvage};for(const[k,n]of Object.entries(cost))if(k!=='any'&&k in sv)sv[k]-=n;const out={};
  for(let i=0;i<(cost.any||0);i++){const k=Object.keys(sv).sort((a,b)=>sv[b]-sv[a])[0];sv[k]--;out[k]=(out[k]||0)+1}return {out,sv}}
const anyAsk=cost=>!FAST&&AUTO_CHOOSE==null&&!S.anyAuto&&cost.any>0&&Object.values(anySplit({...cost,any:0}).sv).filter(n=>n>0).length>1;
function pickAny(g){const cost=g.cost,{sv}=anySplit({...cost,any:0}),N=cost.any,ks=Object.keys(sv).filter(k=>sv[k]>0).sort((a,b)=>sv[b]-sv[a]),al=anySplit(cost).out;
  return new Promise(res=>{const L=document.createElement('div');L.id='choose';L.setAttribute('role','dialog');L.setAttribute('aria-label','Choose salvage');
    const draw=()=>{const t=ks.reduce((a,k)=>a+(al[k]||0),0);
      L.innerHTML=`<div class="chz"><div class="eyebrow">Pay with salvage</div><div class="small"><b>${esc(g.name)}</b> costs ${N} any salvage. Choose which salvage to spend.</div>
      ${ks.map(k=>`<div class="row between anyrow"><span>${resIc(k)} ${RES_NAME[k]} <span class="muted small">(${sv[k]} on hand)</span></span><span class="row"><button class="btn sm" type="button" data-p="${k}:-1" ${(al[k]||0)>0?'':'disabled'} aria-label="One less ${RES_NAME[k]}">−</button><b class="mono anyn">${al[k]||0}</b><button class="btn sm" type="button" data-p="${k}:1" ${(al[k]||0)<sv[k]&&t<N?'':'disabled'} aria-label="One more ${RES_NAME[k]}">+</button></span></div>`).join('')}
      <div class="small ${t===N?'muted':''}">${t}/${N} chosen</div>
      <button class="btn pri" type="button" data-r="ok" ${t===N?'':'disabled'}>Pay ${N} and craft</button>
      <button class="btn" type="button" data-r="auto">Use whatever I have the most of</button>
      <label class="small anyalw"><input type="checkbox" data-r="always"> Always use the biggest pile and don't ask (change this in the Workshop)</label>
      <button class="btn sm" type="button" data-r="no">Cancel</button></div>`};
    draw();document.body.appendChild(L);setTimeout(()=>{const b=L.querySelector('[data-r="ok"]');if(b)b.focus({preventScroll:true})},50);
    L.addEventListener('click',e=>{e.stopPropagation();const p=e.target.closest('[data-p]'),r=e.target.closest('[data-r]');
      if(p){const[k,d]=p.dataset.p.split(':');al[k]=Math.max(0,(al[k]||0)+ +d);draw();return}
      if(!r||r.dataset.r==='always')return;const al2=r.dataset.r==='auto'?anySplit(cost).out:al;
      if(r.dataset.r!=='no'&&L.querySelector('[data-r="always"]').checked)S.anyAuto=true;L.remove();res(r.dataset.r==='no'?null:al2)})})}
function doCraft(a,g,hid,pick){if(a==='craft'){if(afford(GEAR[g].cost)){pay(GEAR[g].cost,pick);S.armory.push(g);if(S.guide)S.guide.eq=true}return}
  const h=S.heroes.find(x=>x.id===hid);if(!h||S.phase!=='hq'||(!S.facilities.includes('workshop')&&!GEAR[g].cons)||!afford(GEAR[g].cost)||!wearOK(h,g))return;pay(GEAR[g].cost,pick);S.armory.push(g);equipHero(h,g)}
const costStr=c=>Object.entries(c).map(([k,n])=>`${n} ${RES_NAME[k]}`).join(' + ');
const costHtml=c=>`<span class="cost">${Object.entries(c).map(([k,n])=>`${resIc(k)}${n} ${RES_NAME[k]}`).join(' + ')}</span>`;
function clampHero(h){h.hp=Math.min(h.hp,stat(h,'maxHp'));h.comp=Math.min(h.comp,stat(h,'maxComp'))}

/* ============ INVESTIGATION ============ */
function hurtRandom(n){const h=pick(party().length?party():roster());h.hp=Math.max(1,h.hp-n);return h.name}
const EVENTS=[
  {id:'witness',title:'A shaken witness',txt:v=>`Someone saw ${v}'s people loading a van downtown. They're terrified.`,opts:[
    {l:'Reassure them',h:'Roll 9+ for a clue',run:i=>{const r=invRoll();if(r>=9){i.clues++;return `Rolled ${r}. They calm down and give you a plate number. +1 clue.`}return `Rolled ${r}. They clam up and leave.`}},
    {l:'Press hard',h:'+1 clue, −1 trust',run:i=>{i.clues++;S.trust--;return 'You get the address. The story of heroes shouting at a witness gets around. +1 clue, −1 trust.'}}]},
  {id:'signal',title:'Encrypted transmission',txt:v=>`A burst signal on a frequency ${v} has used before.`,opts:[
    {l:'Decrypt in the lab',h:'Needs Forensics Lab. +2 clues, a hero takes 1',ok:()=>S.facilities.includes('lab'),run:i=>{const hx=hurtRandom(1);i.clues+=2;return 'The lab cracks it in an hour: a schedule and a location. +2 clues. '+hx+' takes 1 damage on the long night.'}},
    {l:'Trace it on foot',h:'Roll 11+ for a clue, else a hero takes 2',run:i=>{const r=invRoll();if(r>=11){i.clues++;return `Rolled ${r}. You triangulate the source. +1 clue.`}return `Rolled ${r}. The relay was booby-trapped. ${hurtRandom(2)} takes 2 damage.`}},
    {l:'Bag the evidence',h:'+1 intel',run:()=>{S.intel++;return 'You record the burst and file it. The analysts will crack it eventually. +1 intel.'}}]},
  {id:'crime',title:'Robbery in progress',txt:()=>'A bank alarm is going off across town, nowhere near your lead.',opts:[
    {l:'Stop the robbery',h:'+1 trust',run:()=>{S.trust++;return 'The city sees you save the day. +1 trust.'}},
    {l:'Stay on the trail',h:'+1 clue, −1 trust',run:i=>{i.clues++;S.trust--;return 'You keep the pressure on. The news asks where the heroes were. +1 clue, −1 trust.'}}]},
  {id:'safehouse',title:'Henchman safehouse',txt:v=>`You've found where ${v}'s crew sleeps.`,opts:[
    {l:'Raid it',h:'+1 clue, +1 salvage, a hero takes 2',run:i=>{i.clues++;S.salvage[i.v]++;return `You kick in the door. +1 clue and 1 ${VILLAINS[i.v].salvage}. ${hurtRandom(2)} takes 2 damage.`}},
    {l:'Stake it out',h:'Roll 14+ for 2 clues',run:i=>{const r=invRoll();if(r>=14){i.clues+=2;return `Rolled ${r}. A lieutenant leads you right to the lair. +2 clues.`}return `Rolled ${r}. A long cold night with nothing to show.`}},
    {l:'Bag the evidence',h:'+1 intel',run:()=>{S.intel++;return 'You sweep the place for ledgers, phones and maps while the crew is out. +1 intel.'}}]},
  {id:'archive',title:'Old case files',txt:v=>`Police archives mention ${v} years before the costume.`,opts:[
    {l:'Read them',h:'+1 clue',run:i=>{i.clues++;return 'An old address and a known associate. +1 clue.'}},
    {l:'Cross-reference intel',h:'Costs 1 intel. +2 clues, a hero takes 1',ok:()=>S.intel>=1,run:i=>{const hx=hurtRandom(1);S.intel--;i.clues+=2;return 'Your intel lines up with the files perfectly. +2 clues. '+hx+' takes 1 damage on the long night.'}},
    {l:'Bag the evidence',h:'+1 intel',run:()=>{S.intel++;return 'You copy the whole box for HQ. Nothing points to the lair yet, but it will all be useful. +1 intel.'}}]},
  {id:'press',title:'A reporter corners the team',txt:()=>'She has questions, and maybe a source of her own.',opts:[
    {l:'Give a statement',h:'+1 trust',run:()=>{S.trust++;return 'A calm, reassuring quote runs on the front page. +1 trust.'}},
    {l:'Ask what she knows',h:'Roll 11+ for a clue',run:i=>{const r=invRoll();if(r>=11){i.clues++;return `Rolled ${r}. She trades a tip for an exclusive later. +1 clue.`}return `Rolled ${r}. She knows less than you do.`}}]},
  {id:'informant',title:'An informant wants paying',txt:v=>`A small-time fence says he knows where ${v} is hiding.`,opts:[
    {l:'Pay him',h:'Costs 1 tech. +2 clues, a hero takes 1',ok:()=>S.tech>=1,run:i=>{const hx=hurtRandom(1);S.tech--;i.clues+=2;return 'He sells you blueprints of the lair. +2 clues. '+hx+' takes 1 damage on the long night.'}},
    {l:'Lean on him',h:'+1 clue, −1 trust',run:i=>{i.clues++;S.trust--;return 'He talks. He also talks to the papers. +1 clue, −1 trust.'}}]},
  {id:'decoy',title:'A lead that smells wrong',txt:v=>`An anonymous tip points straight to ${v}. Too easy?`,opts:[
    {l:'Follow it',h:'Roll 12+ for 2 clues, else lose 1',run:i=>{const r=invRoll();if(r>=12){i.clues+=2;return `Rolled ${r}. It's real. +2 clues.`}i.clues=Math.max(0,i.clues-1);return `Rolled ${r}. A setup. They know you're coming. −1 clue.`}},
    {l:'Ignore it',h:'No effect',run:()=> 'You stick to your own leads.'}]},
  {id:'vault',cond:()=>ALL_ITEMS.some(it=>it.startsWith('fac:')&&!isUnlocked(it)),title:"A retired hero's vault",txt:v=>`Chasing ${v} leads you to a sealed vault left behind by a hero team from decades ago.`,opts:[
    {l:'Crack it open',h:'Unlock a facility blueprint',run:()=>{const n=unlockRandom('fac');return n?`Inside: plans for a ${n}. Blueprint unlocked.`:'Empty, except for dust.'}},
    {l:'Leave it sealed',h:'+1 trust',run:()=>{S.trust++;return 'Word gets out that you respected their legacy. +1 trust.'}}]},
  {id:'abandoned',cond:()=>ALL_ITEMS.some(it=>it.startsWith('gear:')&&!isUnlocked(it)),title:'An abandoned research lab',txt:v=>`One of ${v}'s old supply runs ends at a lab nobody has opened in years.`,opts:[
    {l:'Recover the schematics',h:'Unlock a gear blueprint',run:()=>{const n=unlockRandom('gear');return n?`The schematics survived. Blueprint unlocked: ${n}.`:'The files are corrupted beyond use.'}},
    {l:'Strip it for parts',h:'+2 tech',run:()=>{S.tech+=2;return 'You haul out crates of usable hardware. +2 tech.'}}]},
  {id:'rooftop',title:'A chase across the rooftops',txt:v=>`One of ${v}'s lookouts spots you and bolts for the fire escape.`,opts:[
    {l:'Run him down',h:'Roll 11+ for a clue, else a hero takes 1',run:i=>{const r=invRoll();if(r>=11){i.clues++;return `Rolled ${r}. You pin him on a water tower and he talks. +1 clue.`}return `Rolled ${r}. He jumps a gap you shouldn't have tried. ${hurtRandom(1)} takes 1 damage.`}},
    {l:'Let him run and tail him',h:'Roll 16+ for 2 clues',run:i=>{const r=invRoll();if(r>=16){i.clues+=2;return `Rolled ${r}. He runs straight home to report. +2 clues.`}return `Rolled ${r}. You lose him in the crowd.`}}]},
  {id:'hospital',title:'Victims in the ER',txt:v=>`Three people came in tonight with injuries only ${v} could cause.`,opts:[
    {l:'Sit with the families',h:'+1 trust',run:()=>{S.trust++;return 'Somebody films you staying until dawn. +1 trust.'}},
    {l:'Study the injuries',h:'Roll 9+ for a clue',run:i=>{const r=invRoll();if(r>=9){i.clues++;return `Rolled ${r}. The wounds tell you where they were standing. +1 clue.`}return `Rolled ${r}. The doctors can't tell you anything new.`}}]},
  {id:'blackout',title:'Rolling blackout',txt:v=>`The power grid is failing block by block, and the pattern circles somewhere ${v} would hide.`,opts:[
    {l:'Get the lights back on',h:'Costs 1 tech. +1 clue, +1 trust',ok:()=>S.tech>=1,run:i=>{S.tech--;i.clues++;S.trust++;return 'You reroute the grid and see exactly which line was tapped. +1 clue, +1 trust.'}},
    {l:'Map the outages',h:'Roll 11+ for a clue',run:i=>{const r=invRoll();if(r>=11){i.clues++;return `Rolled ${r}. The dark blocks point at one substation. +1 clue.`}return `Rolled ${r}. The pattern is just a bad grid.`}}]},
  {id:'rival',title:'A vigilante on the same case',txt:v=>`A masked loner has been hunting ${v} for months and doesn't want company.`,opts:[
    {l:'Trade notes',h:'Costs 1 intel. +2 clues, a hero takes 1',ok:()=>S.intel>=1,run:i=>{const hx=hurtRandom(1);S.intel--;i.clues+=2;return 'Your files fill the holes in theirs. +2 clues. '+hx+' takes 1 damage on the long night.'}},
    {l:'Tell them to stand down',h:'+1 trust',run:()=>{S.trust++;return 'The city likes its heroes licensed. +1 trust.'}}]},
  {id:'locker',title:'The evidence locker',txt:v=>`A precinct is holding gear seized from ${v}'s crew last year.`,opts:[
    {l:'Ask for it properly',h:'+1 clue',run:i=>{i.clues++;return 'Three forms later, a serial number leads somewhere useful. +1 clue.'}},
    {l:'Borrow it overnight',h:'+1 clue, +1 salvage, −1 trust',run:i=>{i.clues++;S.salvage[i.v]++;S.trust--;return `You keep a piece. +1 clue and 1 ${VILLAINS[i.v].salvage}. Internal affairs is not happy. −1 trust.`}},
    {l:'Bag the evidence',h:'+1 intel',run:()=>{S.intel++;return 'You photograph every seized item and log the serial numbers. +1 intel.'}}]},
  {id:'dive',title:'A bar full of henchmen',txt:v=>`${v}'s crew drinks at the same dive every night after a job.`,opts:[
    {l:'Go in undercover',h:'Roll 14+ for 2 clues, else a hero takes 2',run:i=>{const r=invRoll();if(r>=14){i.clues+=2;return `Rolled ${r}. Nobody notices the new regular. +2 clues.`}return `Rolled ${r}. Your cover lasts one drink. ${hurtRandom(2)} takes 2 damage in the brawl.`}},
    {l:'Clear the bar',h:'+1 clue, a hero takes 1',run:i=>{i.clues++;return `The last one standing talks. +1 clue. ${hurtRandom(1)} takes 1 damage.`}}]},
  {id:'cameras',title:'Eye in the sky',txt:v=>`Traffic cameras caught part of the route ${v}'s people drive every night.`,opts:[
    {l:'Pull the footage',h:'Needs Comms Array. +2 clues, a hero takes 1',ok:()=>S.facilities.includes('comms'),run:i=>{const hx=hurtRandom(1);i.clues+=2;return 'The array stitches every camera together into one route. +2 clues. '+hx+' takes 1 damage on the long night.'}},
    {l:'Ask the traffic cops',h:'Roll 11+ for a clue',run:i=>{const r=invRoll();if(r>=11){i.clues++;return `Rolled ${r}. One officer remembers the van. +1 clue.`}return `Rolled ${r}. The footage was wiped hours ago.`}},
    {l:'Bag the evidence',h:'+1 intel',run:()=>{S.intel++;return 'You download a month of footage for the files back home. +1 intel.'}}]},
  {id:'fire',title:'A building on fire',txt:v=>`A tenement on ${v}'s escape route is burning, and people are still inside.`,opts:[
    {l:'Get everyone out',h:'+2 trust, a hero takes 2',run:()=>{S.trust+=2;return `Every family walks out. +2 trust. ${hurtRandom(2)} takes 2 damage from the smoke.`}},
    {l:'Leave it to the fire crews',h:'+1 clue, −1 trust',run:i=>{i.clues++;S.trust--;return 'You stay on the trail. The photos of the fire run without you in them. +1 clue, −1 trust.'}}]},
];
/* each villain's own leads: the third lead of every investigation is always one of these */
const VEVENTS={
  gallows:[
    {id:'gal_lab',title:"Gallows's sealed lab",txt:()=>'The university sealed Dr. Gallows\'s lab after the accident. The locks on the door are new.',opts:[
      {l:'Search his notes',h:'Roll 12+ for 2 clues, else 1',run:i=>{const r=invRoll();if(r>=12){i.clues+=2;return `Rolled ${r}. His latest equations name a building. +2 clues.`}i.clues++;return `Rolled ${r}. Most of it is gibberish, but not all. +1 clue.`}},
      {l:"Trip the dead man's switch",h:'+1 clue, +1 Coils, a hero takes 2',run:i=>{i.clues++;S.salvage.gallows++;return `The lab fries itself, but a coil survives with his address etched inside. +1 clue and 1 Coils. ${hurtRandom(2)} takes 2 damage.`}}]},
    {id:'gal_drone',title:'A downed drone',txt:()=>'One of Gallows\'s drones crashed in a park and is still twitching.',opts:[
      {l:'Take it apart',h:'+1 clue, +1 tech',run:i=>{i.clues++;S.tech++;return 'Its flight log ends at his workshop, and the parts are worth keeping. +1 clue, +1 tech.'}},
      {l:'Fix it and follow it home',h:'Roll 14+ for 2 clues, else a hero takes 2',run:i=>{const r=invRoll();if(r>=14){i.clues+=2;return `Rolled ${r}. It limps straight back to its master. +2 clues.`}return `Rolled ${r}. It self-destructs mid-flight. ${hurtRandom(2)} takes 2 damage.`}}]},
    {id:'gal_subjects',title:'Unwilling test subjects',txt:()=>'People are vanishing from a shelter on the east side and coming back wrong.',opts:[
      {l:'Guard the shelter',h:'+2 trust',run:()=>{S.trust+=2;return 'Nobody vanishes on your watch. +2 trust.'}},
      {l:'Scan the survivors',h:'Needs Forensics Lab. +2 clues, a hero takes 1',ok:()=>S.facilities.includes('lab'),run:i=>{const hx=hurtRandom(1);i.clues+=2;return 'The implants share a manufacturer\'s mark and a shipping address. +2 clues. '+hx+' takes 1 damage on the long night.'}}]}],
  quarry:[
    {id:'qua_tremor',title:'Tremors under the street',txt:()=>'Seismographs show something huge moving through the bedrock beneath downtown.',opts:[
      {l:'Read the seismographs',h:'Costs 1 tech. +2 clues, a hero takes 1',ok:()=>S.tech>=1,run:i=>{const hx=hurtRandom(1);S.tech--;i.clues+=2;return 'You plot her path through the stone. +2 clues. '+hx+' takes 1 damage on the long night.'}},
      {l:'Climb down the sinkhole',h:'Roll 12+ for 2 clues, else a hero takes 2',run:i=>{const r=invRoll();if(r>=12){i.clues+=2;return `Rolled ${r}. Fresh tunnels lead toward her den. +2 clues.`}return `Rolled ${r}. The sinkhole collapses behind you. ${hurtRandom(2)} takes 2 damage.`}}]},
    {id:'qua_miners',title:'The survivors of the collapse',txt:()=>'The miners who lived through the collapse that made Mother Quarry still meet every week. Some of them still visit her.',opts:[
      {l:'Listen to their stories',h:'Roll 9+ for a clue, +1 trust',run:i=>{S.trust++;const r=invRoll();if(r>=9){i.clues++;return `Rolled ${r}. One of them knows where she rests. +1 clue, +1 trust.`}return `Rolled ${r}. They don't trust you yet, but they appreciate the visit. +1 trust.`}},
      {l:'Follow them at night',h:'+2 clues, −2 trust',run:i=>{i.clues+=2;S.trust-=2;return 'They lead you right to her. They saw you following. +2 clues, −2 trust.'}}]},
    {id:'qua_rubble',title:'A block turned to rubble',txt:()=>'Mother Quarry passed through here an hour ago. The whole block is gone.',opts:[
      {l:'Dig out survivors',h:'+2 trust, a hero takes 1',run:()=>{S.trust+=2;return `You pull out everyone who's still breathing. +2 trust. ${hurtRandom(1)} takes 1 damage.`}},
      {l:'Gather her shards',h:'+1 clue, +1 Shards',run:i=>{i.clues++;S.salvage.quarry++;return 'The broken stone still points the way she went. +1 clue and 1 Shards.'}}]}],
  cantor:[
    {id:'can_ledger',title:'The missing ledger',txt:()=>'One of The Cantor\'s bookkeepers ran off with a ledger. His hired guns are already looking for her.',opts:[
      {l:'Find her first',h:'Roll 12+ for 2 clues and 1 Ledgers',run:i=>{const r=invRoll();if(r>=12){i.clues+=2;S.salvage.cantor++;return `Rolled ${r}. She hands over the book for a ride out of town. +2 clues and 1 Ledgers.`}return `Rolled ${r}. His people got there first.`}},
      {l:'Offer her protection',h:'+1 clue, +1 trust',run:i=>{i.clues++;S.trust++;return 'She keeps the ledger but tells you what\'s in it. +1 clue, +1 trust.'}}]},
    {id:'can_song',title:'A song on every radio',txt:()=>'At midnight every radio in the club district plays the same tune, and people walk out of their homes still asleep.',opts:[
      {l:'Jam the signal',h:'Costs 1 tech. +1 clue, +1 trust',ok:()=>S.tech>=1,run:i=>{S.tech--;i.clues++;S.trust++;return 'The sleepers wake up confused but safe, and the jammer shows where the signal came from. +1 clue, +1 trust.'}},
      {l:'Follow the sleepwalkers',h:'Roll 14+ for 2 clues, else a hero takes 2',run:i=>{const r=invRoll();if(r>=14){i.clues+=2;return `Rolled ${r}. They lead you to his stage. +2 clues.`}return `Rolled ${r}. The song gets into your head too. ${hurtRandom(2)} takes 2 damage before you snap out of it.`}}]},
    {id:'can_debt',title:'Collection night',txt:()=>'A shop owner owes The Cantor. The collectors come tonight.',opts:[
      {l:'Be there when they arrive',h:'+1 clue, +1 trust, a hero takes 2',run:i=>{i.clues++;S.trust++;return `The collectors fold and talk. +1 clue, +1 trust. ${hurtRandom(2)} takes 2 damage.`}},
      {l:'Follow the money',h:'Roll 12+ for 2 clues, −1 trust',run:i=>{S.trust--;const r=invRoll();if(r>=12){i.clues+=2;return `Rolled ${r}. The cash goes straight up the ladder. +2 clues. The shop owner won't forgive you. −1 trust.`}return `Rolled ${r}. The money vanishes into a laundromat, and the shop owner saw you watching. −1 trust.`}}]}],
  architect:[
    {id:'arc_plans',title:'Plans at city hall',txt:()=>'Every building The Architect designed was filed with the city. Some floors are missing from the plans.',opts:[
      {l:'Compare plans to the skyline',h:'Costs 1 intel. +2 clues, a hero takes 1',ok:()=>S.intel>=1,run:i=>{const hx=hurtRandom(1);S.intel--;i.clues+=2;return 'One tower is two floors taller than its drawings. +2 clues. '+hx+' takes 1 damage on the long night.'}},
      {l:'Pull the permits',h:'Roll 11+ for a clue',run:i=>{const r=invRoll();if(r>=11){i.clues++;return `Rolled ${r}. A shell company signed for all of them. +1 clue.`}return `Rolled ${r}. A paper maze, built on purpose.`}}]},
    {id:'arc_shift',title:'A building that moved',txt:()=>'An office tower shifted three feet overnight. Nobody inside noticed.',opts:[
      {l:'Walk the halls',h:'Roll 14+ for 2 clues, else a hero takes 2',run:i=>{const r=invRoll();if(r>=14){i.clues+=2;return `Rolled ${r}. You find the hinge, and where its control line runs. +2 clues.`}return `Rolled ${r}. A corridor folds shut on you. ${hurtRandom(2)} takes 2 damage.`}},
      {l:'Evacuate the tower',h:'+2 trust',run:()=>{S.trust+=2;return 'Everyone is out before it moves again. +2 trust.'}}]},
    {id:'arc_site',title:'A night shift nobody ordered',txt:()=>'Constructs are pouring concrete at a site that closed months ago.',opts:[
      {l:'Smash a construct',h:'+1 clue, +1 Rebar, a hero takes 1',run:i=>{i.clues++;S.salvage.architect++;return `Its work orders are stamped inside its chest. +1 clue and 1 Rebar. ${hurtRandom(1)} takes 1 damage.`}},
      {l:'Watch what they build',h:'Roll 9+ for a clue',run:i=>{const r=invRoll();if(r>=9){i.clues++;return `Rolled ${r}. It's a copy of her lair's entrance. +1 clue.`}return `Rolled ${r}. Just a wall. For now.`}}]}],
  helios:[
    {id:'hel_heat',title:'A heatwave at midnight',txt:()=>'It is 104°F at 2 a.m. in one neighborhood, and climbing.',opts:[
      {l:'Map the hot spots',h:'Roll 9+ for a clue',run:i=>{const r=invRoll();if(r>=9){i.clues++;return `Rolled ${r}. The heat radiates from one rooftop. +1 clue.`}return `Rolled ${r}. The readings swim in the haze.`}},
      {l:'Open cooling centers',h:'Costs 1 tech. +2 trust',ok:()=>S.tech>=1,run:()=>{S.tech--;S.trust+=2;return 'Nobody dies tonight. +2 trust.'}}]},
    {id:'hel_reactor',title:'The reactor that made him',txt:()=>'The fusion lab\'s logs were wiped, but the reactor core remembers where its energy went.',opts:[
      {l:'Read the core',h:'Needs Forensics Lab. +2 clues, a hero takes 1',ok:()=>S.facilities.includes('lab'),run:i=>{const hx=hurtRandom(1);i.clues+=2;return 'The decay pattern points to where he recharges. +2 clues. '+hx+' takes 1 damage on the long night.'}},
      {l:'Go into containment',h:'Roll 14+ for 2 clues, else a hero takes 3',run:i=>{const r=invRoll();if(r>=14){i.clues+=2;return `Rolled ${r}. Scorched footprints lead out a maintenance door. +2 clues.`}return `Rolled ${r}. The radiation is worse than the meters said. ${hurtRandom(3)} takes 3 damage.`}}]},
    {id:'hel_sprite',title:'A stray Sunsprite',txt:()=>'A sunsprite has drifted from the swarm and is setting rooftops alight.',opts:[
      {l:'Capture it',h:'+1 clue, +1 Sunstone, a hero takes 2',run:i=>{i.clues++;S.salvage.helios++;return `It burns out in your hands and leaves a sunstone behind, still warm and tugging toward home. +1 clue and 1 Sunstone. ${hurtRandom(2)} takes 2 damage.`}},
      {l:'Let it lead you home',h:'Roll 12+ for 2 clues',run:i=>{const r=invRoll();if(r>=12){i.clues+=2;return `Rolled ${r}. It rejoins the swarm right over his lair. +2 clues.`}return `Rolled ${r}. It flickers out over the river.`}}]}],
  serpent:[
    {id:'ser_skin',title:'Shed skin in the subway',txt:()=>'A molted skin as long as a train lies in a tunnel nobody has used since the seventies.',opts:[
      {l:'Collect it',h:'+1 clue, +1 Scales',run:i=>{i.clues++;S.salvage.serpent++;return 'The scales are fresh and the skin points deeper. +1 clue and 1 Scales.'}},
      {l:'Follow the trail deeper',h:'Roll 14+ for 2 clues, else a hero takes 2',run:i=>{const r=invRoll();if(r>=14){i.clues+=2;return `Rolled ${r}. You hear it breathing below. +2 clues.`}return `Rolled ${r}. Cultists wait in the dark. ${hurtRandom(2)} takes 2 damage.`}}]},
    {id:'ser_cult',title:'A cult recruiter',txt:()=>'Flyers promising "rebirth" are taped to every station pillar on the night line.',opts:[
      {l:'Go to a meeting',h:'Roll 12+ for 2 clues, else a hero takes 2',run:i=>{const r=invRoll();if(r>=12){i.clues+=2;return `Rolled ${r}. They take the new believers down to see it. +2 clues.`}return `Rolled ${r}. They know a hero when they see one. ${hurtRandom(2)} takes 2 damage getting out.`}},
      {l:'Break up the meeting',h:'+1 clue, +1 trust',run:i=>{i.clues++;S.trust++;return 'The recruits go home. One of the robed ones drops a station map. +1 clue, +1 trust.'}}]},
    {id:'ser_crew',title:'The missing track crew',txt:()=>'A track crew went down at midnight and never came up.',opts:[
      {l:'Search for survivors',h:'+2 trust, a hero takes 2',run:()=>{S.trust+=2;return `You find two of them alive in a side tunnel. +2 trust. ${hurtRandom(2)} takes 2 damage.`}},
      {l:'Check the work logs',h:'Costs 1 intel. +2 clues, a hero takes 1',ok:()=>S.intel>=1,run:i=>{const hx=hurtRandom(1);S.intel--;i.clues+=2;return 'Every missing crew was sent to the same junction. +2 clues. '+hx+' takes 1 damage on the long night.'}}]}],
  lode:[
    {id:'lod_yard',title:'A scrapyard that moved',txt:()=>'Every wreck in an east-side scrapyard slid fifty feet north overnight, all in one perfect line.',opts:[
      {l:'Follow the line',h:'Roll 12+ for 2 clues',run:i=>{const r=invRoll();if(r>=12){i.clues+=2;return `Rolled ${r}. The line points straight at a steel mill that closed years ago. +2 clues.`}return `Rolled ${r}. The line runs into the river and stops.`}},
      {l:'Pry loose a magnetized part',h:'+1 clue, +1 Lodestones',run:i=>{i.clues++;S.salvage.lode++;return 'The bumper is still humming, and it tugs in one direction. +1 clue and 1 Lodestones.'}}]},
    {id:'lod_comp',title:'Compasses gone wrong',txt:()=>'Every compass in the harbor points at the same building, and it is not north.',opts:[
      {l:'Triangulate the pull',h:'Costs 1 tech. +2 clues, a hero takes 1',ok:()=>S.tech>=1,run:i=>{const hx=hurtRandom(1);S.tech--;i.clues+=2;return 'Three readings cross over one rooftop. +2 clues. '+hx+' takes 1 damage on the long night.'}},
      {l:'Ask the harbor master',h:'Roll 9+ for a clue',run:i=>{const r=invRoll();if(r>=9){i.clues++;return `Rolled ${r}. Ships keep drifting toward the same pier. +1 clue.`}return `Rolled ${r}. She thinks you are from the insurance company.`}}]},
    {id:'lod_train',title:'A derailed freight train',txt:()=>'A freight train was dragged off its rails, and every ton of its steel cargo is missing.',opts:[
      {l:'Help the crew',h:'+2 trust, a hero takes 2',run:()=>{S.trust+=2;return `You lift the cab off the driver. +2 trust. ${hurtRandom(2)} takes 2 damage.`}},
      {l:'Track the cargo',h:'Roll 14+ for 2 clues, else a hero takes 2',run:i=>{const r=invRoll();if(r>=14){i.clues+=2;return `Rolled ${r}. Gouges in the road lead to his yard. +2 clues.`}return `Rolled ${r}. A girder flies at you out of the dark. ${hurtRandom(2)} takes 2 damage.`}}]}],
  noct:[
    {id:'noc_card',title:'A name on a black card',txt:()=>'A city councilman found a black card on his pillow with his name on it. Her last three targets got the same card.',opts:[
      {l:'Guard him tonight',h:'+1 clue, +1 trust, a hero takes 2',run:i=>{i.clues++;S.trust++;return `She comes, finds you waiting, and leaves. Her blade leaves a mark. +1 clue, +1 trust. ${hurtRandom(2)} takes 2 damage.`}},
      {l:'Study the card',h:'Needs Forensics Lab. +2 clues, a hero takes 1',ok:()=>S.facilities.includes('lab'),run:i=>{const hx=hurtRandom(1);i.clues+=2;return 'The ink is printed at one shop in the old town. +2 clues. '+hx+' takes 1 damage on the long night.'}}]},
    {id:'noc_dark',title:'The blackout block',txt:()=>'Every streetlight on one block went dark, and nobody can get them back on.',opts:[
      {l:'Walk the block',h:'Roll 14+ for 2 clues, else a hero takes 3',run:i=>{const r=invRoll();if(r>=14){i.clues+=2;return `Rolled ${r}. You spot a Shade slipping down a drain. +2 clues.`}return `Rolled ${r}. Something in the dark cuts you before you see it. ${hurtRandom(3)} takes 3 damage.`}},
      {l:'Bring floodlights',h:'Costs 1 tech. +1 clue, +1 trust',ok:()=>S.tech>=1,run:i=>{S.tech--;i.clues++;S.trust++;return 'The block lights up and the shadows give up a footprint. +1 clue, +1 trust.'}}]},
    {id:'noc_shade',title:'A captured Shade',txt:()=>'Police caught one of her Shades. It has not said a word, and its shadow keeps moving on its own.',opts:[
      {l:'Question it',h:'Roll 12+ for 2 clues',run:i=>{const r=invRoll();if(r>=12){i.clues+=2;return `Rolled ${r}. Its shadow points at the door it came from. +2 clues.`}return `Rolled ${r}. It melts away in the interview room.`}},
      {l:'Bottle its shadow',h:'+1 clue, +1 Umbra',run:i=>{i.clues++;S.salvage.noct++;return 'The jar is ice cold and the shadow inside keeps pointing one way. +1 clue and 1 Umbra.'}}]}],
  swarm:[
    {id:'swm_hive',title:'A hive in the subway',txt:()=>'Commuters report a humming nest of drones the size of a bus under the night line.',opts:[
      {l:'Clear it out',h:'+1 clue, +1 Chitin, a hero takes 1',run:i=>{i.clues++;S.salvage.swarm++;return `The nest comes down in pieces, and one still has its homing chip. +1 clue and 1 Chitin. ${hurtRandom(1)} takes 1 damage.`}},
      {l:'Watch where they fly',h:'Roll 12+ for 2 clues',run:i=>{const r=invRoll();if(r>=12){i.clues+=2;return `Rolled ${r}. At dawn the whole nest lifts off and flies home. +2 clues.`}return `Rolled ${r}. They scatter in a hundred directions.`}}]},
    {id:'swm_hum',title:'Dead air',txt:()=>'At midnight every phone in the market district buzzes with the same droning hum.',opts:[
      {l:'Jam the frequency',h:'Costs 1 tech. +1 clue, +1 trust',ok:()=>S.tech>=1,run:i=>{S.tech--;i.clues++;S.trust++;return 'The hum stops, and the jammer logs where it was coming from. +1 clue, +1 trust.'}},
      {l:'Trace the signal',h:'Roll 14+ for 2 clues, else a hero takes 2',run:i=>{const r=invRoll();if(r>=14){i.clues+=2;return `Rolled ${r}. The signal comes from a rooftop relay. +2 clues.`}return `Rolled ${r}. The swarm notices you listening. ${hurtRandom(2)} takes 2 damage.`}}]},
    {id:'swm_lab',title:'The robotics lab',txt:()=>'A university robotics lab lost its whole drone fleet. A week later, the fleet came back and took the lab.',opts:[
      {l:'Evacuate the campus',h:'+2 trust',run:()=>{S.trust+=2;return 'Every student is out before the doors seal. +2 trust.'}},
      {l:'Search the lab',h:'Costs 1 intel. +2 clues, a hero takes 1',ok:()=>S.intel>=1,run:i=>{const hx=hurtRandom(1);S.intel--;i.clues+=2;return 'The fleet\'s original flight logs show where it roosts. +2 clues. '+hx+' takes 1 damage on the long night.'}}]}],
  bomber:[
    {id:'bom_roof',title:'Scorched rooftops',txt:()=>'Scorch marks run across the rooftops downtown, each one a little farther apart than anyone should be able to jump.',opts:[
      {l:'Follow the marks',h:'Roll 12+ for 2 clues, else a hero takes 2',run:i=>{const r=invRoll();if(r>=12){i.clues+=2;return `Rolled ${r}. The trail of burns ends at a shuttered stunt arena. +2 clues.`}return `Rolled ${r}. A rigged skylight gives way under you. ${hurtRandom(2)} takes 2 damage.`}},
      {l:'Measure the jumps',h:'Needs Forensics Lab. +2 clues, a hero takes 1',ok:()=>S.facilities.includes('lab'),run:i=>{const hx=hurtRandom(1);i.clues+=2;return 'Custom spring boots, and only one shop in the city sells coils that strong. +2 clues. '+hx+' takes 1 damage on the long night.'}}]},
    {id:'bom_fire',title:'The fireworks warehouse',txt:()=>'A fireworks warehouse by the docks was cleaned out overnight. The alarm never went off, and the lock was blown from the inside.',opts:[
      {l:'Sift the wreckage',h:'+1 clue, +1 Fuses',run:i=>{i.clues++;S.salvage.bomber++;return 'Half-burned fuse cord, cut to the same length every time. +1 clue and 1 Fuses.'}},
      {l:'Stake out the docks',h:'+1 clue, a hero takes 1',run:i=>{i.clues++;return `She comes back for the last crate and leaves a present for whoever is watching. +1 clue. ${hurtRandom(1)} takes 1 damage.`}}]},
    {id:'bom_squad',title:'The bomb squad',txt:()=>'The city bomb squad has found eleven of her devices this month. Their sergeant thinks she wanted them found.',opts:[
      {l:'Hear him out',h:'+1 clue, +1 trust',run:i=>{i.clues++;S.trust++;return 'Every bomb was built to be found. She is putting on a show for someone. +1 clue, +1 trust.'}},
      {l:'Study a live device',h:'Costs 1 tech. Roll 14+ for 2 clues, else a hero takes 2',ok:()=>S.tech>=1,run:i=>{S.tech--;const r=invRoll();if(r>=14){i.clues+=2;return `Rolled ${r}. The circuit board has a return address etched on it. +2 clues.`}return `Rolled ${r}. It was never meant to be taken apart. ${hurtRandom(2)} takes 2 damage.`}}]}],
  grid:[
    {id:'grd_lights',title:'Every light is red',txt:()=>'At 2 a.m. every traffic signal downtown turned red at once and stayed that way. The control center says nobody is logged in.',opts:[
      {l:'Trace the override',h:'Needs Forensics Lab. +2 clues, a hero takes 1',ok:()=>S.facilities.includes('lab'),run:i=>{const hx=hurtRandom(1);i.clues+=2;return 'The override bounces off survey towers across the city and ends at one rooftop. +2 clues. '+hx+' takes 1 damage on the long night.'}},
      {l:'Walk the intersections',h:'Roll 12+ for 2 clues, else a hero takes 2',run:i=>{const r=invRoll();if(r>=12){i.clues+=2;return `Rolled ${r}. Every camera at every junction has been turned to face the same building. +2 clues.`}return `Rolled ${r}. The laser across the last corner was not a survey beam. ${hurtRandom(2)} takes 2 damage.`}}]},
    {id:'grd_club',title:'The laser show',txt:()=>'A waterfront nightclub bought a laser rig far too precise for a dance floor. The buyer paid cash and took the lenses back out the next day.',opts:[
      {l:'Strip the rig',h:'+1 clue, +1 Lenses',run:i=>{i.clues++;S.salvage.grid++;return 'One lens was left behind, ground to a military spec. +1 clue and 1 Lenses.'}},
      {l:'Talk to the bouncer',h:'+1 clue, +1 trust',run:i=>{i.clues++;S.trust++;return 'He remembers the van, and the city surveyor logo on its side. +1 clue, +1 trust.'}}]},
    {id:'grd_van',title:"The surveyor's van",txt:()=>'A city survey van has been parked outside the same warehouse for a week. The back is full of tripods, and the windows are painted over.',opts:[
      {l:'Pick the lock',h:'Costs 1 tech. Roll 14+ for 2 clues, else a hero takes 2',ok:()=>S.tech>=1,run:i=>{S.tech--;const r=invRoll();if(r>=14){i.clues+=2;return `Rolled ${r}. Inside is a hand-drawn map of the warehouse floor, ruled into lanes. +2 clues.`}return `Rolled ${r}. The van was wired to a beam emitter. ${hurtRandom(2)} takes 2 damage.`}},
      {l:'Watch the van',h:'+1 clue',run:i=>{i.clues++;return 'At dusk a man in a hard hat carries a crate of mirrors inside. +1 clue.'}}]}],
};
function evOf(id){return EVENTS.find(e=>e.id===id)||Object.values(VEVENTS).flat().find(e=>e.id===id)}
function invQuality(c){const amb=S.ethos.b==='public'?2:1;return c<=amb?'ambush':c>=4?'prepared':'normal'}
const QUAL={ambush:{n:'Ambush',txt:'The villain acts first, with an extra henchman, and your heroes start scattered.'},
  normal:{n:'Standoff',txt:'Your heroes enter from the south edge. You act first.'},
  prepared:{n:'Prepared',txt:'You catch them by surprise: change gear before going in, you act first, and the villain starts with 1 wound. +1 salvage on a win.'}};
function invEvents(k){const g=shuffle(EVENTS.filter(e=>!e.cond||e.cond()).map(e=>e.id)),own=VEVENTS[k];return own?g.slice(0,2).concat(pick(own).id):g.slice(0,3)}
/* Version 82 (Tyler): clues at the start come from the Comms Array, one clue gear in the party (extra copies don't stack) and a hero field */
/* Version 87 (Tyler): each starting-clue source only comes through 70% of the time */
const START_CLUE_P=.7;
function startInv(k){const notes=[];let c0=0;
  if(S.facilities.includes('comms')){if(Math.random()<START_CLUE_P){c0++;notes.push('Comms Array: +1 clue')}else notes.push('Comms Array: nothing')}
  {const fg=fieldGear('clue')[0];if(fg){if(Math.random()<START_CLUE_P){c0++;notes.push(`${GEAR[fg.g].name}: +1 clue`)}else notes.push(`${GEAR[fg.g].name}: nothing`)}}
  if(partyHas('senses'))notes.push('Keen Senses: +2 to rolls');fieldGear('roll').forEach(({g})=>notes.push(`${GEAR[g].name}: +2 to rolls`));
  S.inv={v:k,step:0,notes,clues:c0,events:invEvents(k),res:null,intro:true,peak:0,found:[],fresh:0};S.phase='inv';S.view='mission';intelSync();
  /* Version 84 (Tyler): Signal Intercept reveals a page instead of giving a clue */
  if(partyHas('intercept')){const pg=intelPool(k).filter(f=>f.kind==='page');if(pg.length){const f=pick(pg);markSeen(k,f.id);S.inv.found.push(f);S.inv.notes.push(`${party().find(h=>BASE(h).field&&BASE(h).field.id==='intercept').name}: 1 page revealed`)}}}
/* every new clue (peak count, so lost clues are not re-earned) opens one unseen playbook page or hit reaction */
function intelPool(k){const vs=vState(k),seen=(S.seen&&S.seen[k])||[],sr=(S.seenR&&S.seenR[k])||[];
  return [...[...new Set(vs.deck.map(e=>e.id))].filter(id=>!seen.includes(id)).map(id=>({kind:'page',id})),...VINTEL[k].react.filter(r=>!sr.includes(r.id)).map(r=>({kind:'rx',id:r.id}))]}
/* Version 79 (Tyler): overflow clues are the ones past the 4 needed for Prepared; each gives +1 intel (by peak, so lost clues are not re-earned) */
const PREP_CLUES=4;
function intelSync(){const i=S.inv;if(!i)return 0;let n=0;i.ovfFresh=0;
  while(i.clues>i.peak){i.peak++;if(i.peak>PREP_CLUES){S.intel++;i.ovf=(i.ovf||0)+1;i.ovfFresh++}const pool=intelPool(i.v);if(!pool.length)continue;const f=pick(pool);if(f.kind==='page')markSeen(i.v,f.id);else markSeenR(i.v,f.id);i.found.push(f);n++}
  i.fresh=n;return n}
function markSeenR(k,id){S.seenR=S.seenR||{};const a=S.seenR[k]=S.seenR[k]||[];if(!a.includes(id))a.push(id)}
function pageOf(k,id){const vs=vState(k),e=vs.deck.filter(x=>x.id===id).sort((a,b)=>b.mk-a.mk)[0]||{id,mk:0};return buildCard(k,e)}
function intelTile(k,f,isNew){if(f.kind==='page'){const c=pageOf(k,f.id);return `<button type="button" class="intel pg-i ${c.sig?'sigi':''} ${isNew?'new':''}" data-a="book:${k}" data-tip="vpage:${k}:${f.id}"><span class="isfx">${esc(TYPE_SFX[c.t]||'!')}</span><span><small>${c.sig?'Signature Move':'Playbook page'}</small><b>${esc(c.n)}</b></span></button>`}
  const r=rxOf(k,f.id);return `<button type="button" class="intel rx-i ${isNew?'new':''}" data-a="book:${k}" data-tip="vrx:${k}:${f.id}"><span class="isfx">${esc(r.sfx)}</span><span><small>Hit reaction</small><b>${esc(r.n)}</b></span></button>`}
const prepGear=()=>S.phase==='inv'&&S.inv&&S.inv.step>=3&&invQuality(S.inv.clues)==='prepared';

/* ============ SHOWDOWN ============ */
/* hex board: pointy-top hexes stored as odd-r offset (x = column, y = row; odd rows sit half a hex right).
   Distances and shapes use axial (q,r). Board units: one hex is 1 wide, HS = side length. */
const HS=1/Math.sqrt(3);
const ax=p=>({q:p.x-((p.y-(p.y&1))>>1),r:p.y});
const off=(q,r)=>({x:q+((r-(r&1))>>1),y:r});
const AXD=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];/* E NE NW W SW SE */
const FACE_DEG=[0,-60,-120,180,120,60];
function cheb(a,b){const A=ax(a),B=ax(b),dq=A.q-B.q,dr=A.r-B.r;return (Math.abs(dq)+Math.abs(dr)+Math.abs(dq+dr))/2}
const step=(p,d)=>{const A=ax(p);return off(A.q+AXD[d][0],A.r+AXD[d][1])};
const nbrs=p=>AXD.map((_,d)=>step(p,d));
const inB=(x,y)=>x>=0&&y>=0&&x<N&&y<N;
const HC=(x,y)=>({cx:x+.5+(y&1?.5:0),cy:HS+y*1.5*HS});
const BW=()=>N+.5,BH=()=>(1.5*N+.5)*HS;
function hexesWithin(p,r){const out=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(cheb({x,y},p)<=r)out.push({x,y});return out}
const SHAPES={one:[[0,0]],tri:[[0,0],[1,0],[0,1]],diamond:[[0,0],[1,0],[0,1],[1,1]],big:[[0,0],...AXD],serpent:[[0,0]],swarm:[[0,0]]};
const vShape=v=>SHAPES[v.shape]||SHAPES.one;
const vBig=v=>!!v.body||vShape(v).length>1;
/* serpent: v.body lists the segments behind the head (v.x,v.y). Stepping the head drags each segment into the one ahead of it;
   v.grow holds segments still owed from a meal, so the tail stays put on the next step. A jump of more than one hex moves the body rigidly. */
/* swarm: v.sw lists the other bodies {x,y,f}; v.pk names every body, lead first. Bodies move one by one and each keeps its own facing. */
const SWN={hive:'Queen',sting:'Stinger',shell:'Shell'};
const IC=(id,c='')=>`<svg class="ic${c?' '+c:''}" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;
const VART={gallows:['#4E8F2A','#D7FF5C'],quarry:['#86684C','#FFB347'],cantor:['#6A2C91','#F1C02C'],architect:['#2F5D9E','#9FD3FF'],helios:['#E08A12','#FFF3B0'],serpent:['#1E7F6C','#F3CB4B'],lode:['#55606E','#E23B3B'],noct:['#2A2D52','#8CF0FF'],swarm:['#B07A0B','#FFE066'],bomber:['#C9402A','#FFD27A'],grid:['#1590B2','#FF2D55'],mole:['#7A4E2A','#F1C02C'],hive:['#B07A0B','#FFE066'],sting:['#B0306A','#FFE066'],shell:['#7A5AA8','#FFE066']};
const vArt=k=>VART[k]||['var(--magenta)','#F3CB4B'],vSty=k=>`--vc:${vArt(k)[0]};--ac:${vArt(k)[1]}`;
const UI=id=>IC('u-'+id,'u'),resIc=k=>k==='tech'||k==='intel'?UI(k):VART[k]?`<span class="vic" style="${vSty(k)}">${vIc(k)}</span>`:UI('salv');
/* Version 130 (Tyler): what each villain says on the fight's splash pages. The opening line follows the investigation
   (ambush 0-1 clues, normal Standoff, prepared 4+); escape plays on a win (beaten villains always get away), taunt on a loss */


const vLine=(k,t)=>(VLINES[k]&&VLINES[k][t])||({escape:'This isn\'t over.',taunt:'Is that all Blackharbor has?'})[t]||'So. You found me.';
const vKey=k=>k==='swarm'?'hive':k,vIc=k=>IC(VART[k]?'v-'+vKey(k):'v-any'),mIc=k=>IC(VART[k]?'m-'+k:'m-any'),pIc=p=>IC(POWERS[p]?'p-'+p:'p-any'),vWm=k=>IC(VART[k]?'v-'+vKey(k):'v-any','wm');
const swBodies=v=>[{x:v.x,y:v.y,f:v.face,k:v.pk[0],i:0},...v.sw.map((c,j)=>({x:c.x,y:c.y,f:c.f,k:v.pk[j+1],i:j+1}))];
const swNear=(v,p)=>swBodies(v).sort((a,b)=>cheb(p,a)-cheb(p,b)||a.i-b.i)[0];
function swSet(v,i,x,y,f){const b=i?v.sw[i-1]:v;b.x=x;b.y=y;if(f!=null){if(i)b.f=f;else v.face=f}}
function vCellsAt(v,x,y){if(v.sw){if(x===v.x&&y===v.y)return [{x,y},...v.sw.map(c=>({x:c.x,y:c.y}))];
    const dq=ax({x,y}).q-ax(v).q,dr=y-v.y;return [{x,y},...v.sw.map(c=>{const A=ax(c);return off(A.q+dq,A.r+dr)})]}
  if(v.body){const H={x:v.x,y:v.y};if(x===v.x&&y===v.y)return [H,...v.body];
    if(cheb({x,y},H)===1)return [{x,y},H,...v.body.slice(0,v.grow?v.body.length:v.body.length-1)];
    const dq=ax({x,y}).q-ax(H).q,dr=y-v.y;return [{x,y},...v.body.map(c=>{const A=ax(c);return off(A.q+dq,A.r+dr)})]}
  const A=ax({x,y});return vShape(v).map(([dq,dr])=>off(A.q+dq,A.r+dr))}
const vCells=v=>vCellsAt(v,v.x,v.y);
const inV=(v,x,y)=>vCells(v).some(c=>c.x===x&&c.y===y);
function dV(p,v){return Math.min(...vCells(v).map(c=>cheb(p,c)))}
function vCtr(v){if(v.body||v.sw)return HC(v.x,v.y);const cs=vCells(v).map(c=>HC(c.x,c.y));return {cx:cs.reduce((s,c)=>s+c.cx,0)/cs.length,cy:cs.reduce((s,c)=>s+c.cy,0)/cs.length}}
const angDiff=(a,b)=>Math.abs(((a-b)%360+540)%360-180);
function dirC(a,b){const g=Math.atan2(b.cy-a.cy,b.cx-a.cx)*180/Math.PI;let best=0,bd=999;FACE_DEG.forEach((f,i)=>{const d=angDiff(g,f);if(d<bd){bd=d;best=i}});return best}
function faceTo(p){const v=S.sd.v;if(v.sw){const n=swNear(v,p),L=live();swBodies(v).forEach(b=>{const t=b===n||b.i===n.i?p:L.slice().sort((a,c)=>cheb(a,b)-cheb(c,b))[0]||p;if(t.x!==b.x||t.y!==b.y)swSet(v,b.i,b.x,b.y,dirC(HC(b.x,b.y),HC(t.x,t.y)))});return}v.face=dirC(vCtr(v),HC(p.x,p.y))}
/* facing: front is within 60° of the arrow, the blind spot is the narrow cone behind (125° or more) */
function sideOf(p,v,b){if(v.sw&&!b)b=swNear(v,p);const c=b?HC(b.x,b.y):vCtr(v),t=HC(p.x,p.y),d=angDiff(Math.atan2(t.cy-c.cy,t.cx-c.cx)*180/Math.PI,FACE_DEG[(b?b.f:v.face)??5]);return d<=60?'front':d>=125?'rear':'flank'}
const heroOf=u=>S.heroes.find(h=>h.id===u.hid);
const live=()=>S.sd.units.filter(u=>!u.ko);
function blocked(x,y,o={}){const sd=S.sd;if(x<0||y<0||x>=N||y>=N)return true;
  if(!o.noWall&&sd.obs.includes(x+','+y))return true;
  if(!o.noWall&&sd.walls&&sd.walls.some(w=>w.k===x+','+y))return true;
  if(!o.noPit&&sd.pits&&sd.pits.includes(x+','+y))return true;
  for(const o2 of (sd.vl||[{v:sd.v}])){if(o2.v.down)continue;if(o.ignoreV&&o2.v===sd.v)continue;if(inV(o2.v,x,y))return true}
  if(sd.units.some(u=>!u.ko&&u!==o.self&&u.x===x&&u.y===y))return true;
  if(sd.hench.some(h=>h!==o.self&&h.x===x&&h.y===y))return true;
  if(sd.civs.some(c=>c.x===x&&c.y===y&&!(c.f&&o.self&&o.self.hid===c.f)))return true;return false}
function reach(s,mv,self){const dist={[s.x+','+s.y]:0},q=[[s.x,s.y]];
  while(q.length){const[x,y]=q.shift(),d=dist[x+','+y];if(d>=mv)continue;
    for(const n of nbrs({x,y})){const nx=n.x,ny=n.y,k=nx+','+ny;if(k in dist||blocked(nx,ny,{self}))continue;dist[k]=d+1;q.push([nx,ny])}}
  delete dist[s.x+','+s.y];return dist}
/* A villain bigger than one hex ignores heroes, henchmen and civilians when it moves (loose) and shoves them aside; strict = they block.
   smash: it walks straight through walls and rubble (vSlide knocks them down). Big villains also stride over pits. */
function vFits(x,y,strict,smash){const sd=S.sd,v=sd.v,loose=vBig(v)&&!strict,big=vBig(v);
  if(v.body&&vCellsAt(v,x,y).slice(1).some(c=>c.x===x&&c.y===y))return false;
  return vCellsAt(v,x,y).every(c=>{const k=c.x+','+c.y;return inB(c.x,c.y)&&(smash||(!sd.obs.includes(k)&&!(sd.walls||[]).some(w=>w.k===k)))&&(big||!(sd.pits||[]).includes(k))&&!sd.vl.some(o=>o.v!==v&&!o.v.down&&inV(o.v,c.x,c.y))&&(loose||!blocked(c.x,c.y,{ignoreV:true,noPit:big,noWall:smash}))})}
function shoveOut(d){const sd=S.sd,v=sd.v,occ=vCells(v),isOcc=p=>occ.some(c=>c.x===p.x&&c.y===p.y),cc=vCtr(v);
  const movers=[...sd.units.map(o=>({o,k:'h'})),...sd.hench.map(o=>({o,k:'m'})),...sd.civs.map(o=>({o,k:'c'}))].filter(e=>isOcc(e.o));
  for(const e of movers){const o=e.o,ok=p=>inB(p.x,p.y)&&!isOcc(p)&&!blocked(p.x,p.y,{self:o});
    let t=ok(step(o,d))?step(o,d):null;
    if(!t)t=nbrs(o).filter(ok).sort((a,b)=>{const A=HC(a.x,a.y),B=HC(b.x,b.y);return Math.hypot(B.cx-cc.cx,B.cy-cc.cy)-Math.hypot(A.cx-cc.cx,A.cy-cc.cy)})[0]||null;
    if(!t){const seen=new Set([o.x+','+o.y]),q=[o];while(q.length&&!t){const p=q.shift();for(const n of nbrs(p)){const k=n.x+','+n.y;if(seen.has(k)||!inB(n.x,n.y))continue;seen.add(k);if(ok(n)){t=n;break}q.push(n)}}}
    if(t){o.x=t.x;o.y=t.y}}
  return movers}
function vPut(v,x,y){if(v.body){const adj=cheb({x,y},v)===1;v.body=vCellsAt(v,x,y).slice(1);if(adj&&v.grow)v.grow--}v.x=x;v.y=y}
/* a serpent steers by its head; v.path records each step so vMove can animate the body slithering */
function vSlide(p,steps,stop,o,sign){if(S.sd.v.sw)return swSlide(p,steps,stop,sign);if(VILLAINS[S.sd.vkey].rooted){if(p&&live().length)faceTo(p);return []}const v=S.sd.v,sh=[],hd=q=>v.body?cheb(p,q):dV(p,q);for(let i=0;i<steps;i++){if(sign<0&&dV(p,v)<=stop&&(!v.body||cheb(p,v)<=stop))break;let best=null,bd=hd(v),bdir=0;
  const sm=vBig(v);for(let d=0;d<6;d++){const n=step(v,d);if(!vFits(n.x,n.y,o.strict,sm))continue;const dd=v.body?cheb(p,n):dV(p,{...v,x:n.x,y:n.y});if(sign<0?dd<bd:dd>bd){bd=dd;best=n;bdir=d}}
  if(!best)break;vPut(v,best.x,best.y);v.face=bdir;if(sm)smashUnder(v);if(v.body)(v.path=v.path||[]).push({x:v.x,y:v.y,body:v.body.map(c=>({...c}))});if(vBig(v)&&!o.strict)shoveOut(bdir).forEach(e=>{if(!sh.includes(e.o))sh.push(e.o)})}
  if(sign>0&&live().length)faceTo(p);
  return sh}
/* the lead body chases p; the others chase their own nearest hero, so the swarm drifts apart unless something pulls it together */
function swStep(v,i,p,steps,stop,sign){const b=swBodies(v)[i],r=reach(b,steps,b),sc=c=>sign<0?Math.max(stop,cheb(p,c)):-cheb(p,c);let best=null,bs=sc(b),bn=0;
  for(const k in r){const[x,y]=k.split(',').map(Number),s=sc({x,y});if(s<bs||(s===bs&&best&&r[k]<bn)){bs=s;bn=r[k];best={x,y}}}
  if(best)swSet(v,i,best.x,best.y,dirC(HC(b.x,b.y),HC(best.x,best.y)))}
function swSlide(p,steps,stop,sign){const v=S.sd.v,L=live();swBodies(v).forEach(b=>{const t=sign<0&&b.i?L.slice().sort((a,c)=>cheb(a,b)-cheb(c,b))[0]||p:p;swStep(v,b.i,t,steps,b.i&&t!==p?1:stop,sign)});
  if(live().length)faceTo(p);return []}
/* bodies follow the hit reactions: tearing a body's page drops it, recovering the page regrows it next to the swarm */
function swSync(v){const want=VINTEL.swarm.react.filter(r=>rxLive(v,r)).map(r=>r.id),all=swBodies(v),out={lost:[],grew:[]};let keep=all.filter(b=>want.includes(b.k));if(!keep.length)keep=[all[0]];
  out.lost=all.filter(b=>!keep.includes(b)).map(b=>b.k);v.x=keep[0].x;v.y=keep[0].y;v.face=keep[0].f;v.pk=keep.map(b=>b.k);v.sw=keep.slice(1).map(b=>({x:b.x,y:b.y,f:b.f}));
  for(const k of want){if(v.pk.includes(k))continue;const t=freeTiles((x,y)=>dV({x,y},v)===1)[0];if(!t)break;v.sw.push({x:t.x,y:t.y,f:v.face});v.pk.push(k);out.grew.push(k)}
  return out}
/* a big villain knocks down any wall or rubble under its body; vMove plays the dust and logs it */
function smashUnder(v){const sd=S.sd,ks=vCells(v).map(c=>c.x+','+c.y).filter(k=>sd.obs.includes(k)||sd.walls.some(w=>w.k===k));if(!ks.length)return;
  sd.obs=sd.obs.filter(k=>!ks.includes(k));sd.walls=sd.walls.filter(w=>!ks.includes(w.k));(v.smashed=v.smashed||[]).push(...ks)}
const vToward=(p,steps,stop,o={})=>vSlide(p,steps,stop,o,-1);
const vAway=(p,steps,o={})=>vSlide(p,steps,0,o,1);
/* Version 115: a hex stores how much evasion it takes away (true = 4, from older saves and EMP) */
const hexA=x=>x===true?4:(x||0);
/* Version 121 (Tyler): villain accuracy grows at half speed (+1 every 2 levels). Version 122: it starts at +4 at level 1 */
const vLvB=(k,lv)=>k==='acc'?4+Math.floor((lv-1)/2):lv-1;
function vStat(k){const sd=S.sd;return VILLAINS[sd.vkey][k]+vLvB(k,sd.v.level)-(k==='eva'?hexA(sd.v.hex):0)-(k==='acc'&&sd.v.blind?4:0)}
function log(k,t){S.sd.log.push({k,t});if(S.sd.log.length>60)S.sd.log.shift()}
/* comic SFX: positions are in board units (see HC) */
let fxTimer;
function fx(cx,cy,t,k='hit'){const sd=S.sd;if(!sd)return;sd.fx=sd.fx||[];sd.fx.push({cx,cy,t,k,born:Date.now()});
  clearTimeout(fxTimer);fxTimer=setTimeout(()=>{if(S.sd&&S.sd.fx){S.sd.fx=S.sd.fx.filter(f=>Date.now()-f.born<1600);render()}},1700)}
const fxP=(x,y,t,k)=>{const c=HC(x,y);fx(c.cx,c.cy,t,k)};
const fxU=(u,t,k)=>fxP(u.x,u.y,t,k);
const fxV=(t,k)=>{const c=vCtr(S.sd.v);fx(c.cx,c.cy,t,k)};
const SFX_HIT=['BAM!','POW!','WHAM!','KRAK!','THWACK!','BOOM!'],SFX_VHIT=['THOOM!','KRASH!','SMACK!','CRUNCH!'];
function mkUnit(h,x,y){return {hid:h.id,x,y,moved:false,acted:false,ko:false,anchor:setOn(h,'lode'),res:{tech:pwrMax(h),magic:arcMax(h)},innUsed:0,buffDice:0,buffStr:0}}
function freeTiles(f){const out=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!blocked(x,y)&&(!f||f(x,y)))out.push({x,y});return out}

function focusV(i){const sd=S.sd;if(i<0||!sd.vl[i])return;sd.vi=i;sd.v=sd.vl[i].v;sd.vkey=sd.vl[i].key}
/* lair terrain (V76): each lair has its own layout of rubble, fixed walls, pits and hazard hexes; the finale rolls a random mix.
   wall and pit lists are segment lengths, laid in straight hex lines. Pieces never touch a villain or the heroes' start row,
   and a piece that would cut off part of the floor is thrown out and re-rolled. */
const LAIR={
  gallows:{rub:2,wall:[3,2],haz:2,hn:'live wiring'},      // lab benches, sparking cables
  quarry:{rub:6,pit:[2,1,1]},                             // quarry floor: boulders and blasting holes
  cantor:{rub:2,wall:[3,3],pit:[1]},                      // club: bar counters, tables, a trapdoor
  architect:{rub:1,wall:[2,2,2],pit:[1],haz:2,hn:'molten floor'},
  helios:{rub:3,pit:[2],haz:3,hn:'reactor slag'},
  serpent:{rub:3,pit:[3,2]},                              // sewer channels with crossings
  lode:{rub:4,wall:[3,2]},                                // scrapyard: crushed cars, scrap fences
  noct:{rub:2,wall:[1,1,1,1,1]},                          // pillars to hide behind
  swarm:{rub:2,wall:[2],pit:[1,1,1]},                     // hive comb and burrows
  bomber:{rub:2,pit:[3,2]},                               // gaps between rooftops
  grid:{rub:3,wall:[1],pit:[2]}};                         // little cover for a beam fight
function randLair(){const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),seg=(n,lo,hi)=>Array.from({length:n},()=>r(lo,hi));
  return {rub:r(3,6),wall:seg(r(1,3),1,3),pit:seg(r(1,3),1,2),haz:Math.random()<.5?r(1,3):0,hn:'molten floor'}}
function layTerrain(L){const sd=S.sd,taken=k=>sd.obs.includes(k)||sd.walls.some(w=>w.k===k)||sd.pits.includes(k)||sd.haz.some(h=>h.k===k);
  const ok=(x,y)=>inB(x,y)&&y>=2&&y<=N-3&&!taken(x+','+y)&&!sd.vl.some(o=>dV({x,y},o.v)<=1)&&!(sd.exits||[]).includes(x+','+y);
  /* every open hex must still connect to the heroes' start row */
  const open=()=>{const solid=k=>sd.obs.includes(k)||sd.walls.some(w=>w.k===k)||sd.pits.includes(k);const seen=new Set(),q=[];
    for(let x=0;x<N;x++){const k=x+','+(N-1);if(!solid(k)){seen.add(k);q.push({x,y:N-1})}}
    while(q.length){const p=q.shift();for(const n of nbrs(p)){const k=n.x+','+n.y;if(!inB(n.x,n.y)||seen.has(k)||solid(k)||sd.vl.some(o=>inV(o.v,n.x,n.y)))continue;seen.add(k);q.push(n)}}
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){const k=x+','+y;if(!solid(k)&&!sd.vl.some(o=>inV(o.v,x,y))&&!seen.has(k))return false}
    return sd.vl.every(o=>vCells(o.v).some(c=>nbrs(c).some(n=>seen.has(n.x+','+n.y))))};
  const put=(len,add,del)=>{for(let g=0;g<60;g++){const x=rnd(N)-1,y=1+rnd(N-2),d=pick([0,1,5]);const ks=[];let p={x,y};
      for(let i=0;i<len;i++){if(!ok(p.x,p.y))break;ks.push(p.x+','+p.y);p=step(p,d)}
      if(ks.length<len||new Set(ks).size<len)continue;ks.forEach(add);if(open())return;ks.forEach(del)}};
  (L.wall||[]).forEach(n=>put(n,k=>sd.walls.push({k,ttl:1,perm:1}),k=>{sd.walls=sd.walls.filter(w=>w.k!==k)}));
  (L.pit||[]).forEach(n=>put(n,k=>sd.pits.push(k),k=>{sd.pits=sd.pits.filter(e=>e!==k)}));
  for(let i=0;i<(L.rub||0);i++)put(1,k=>sd.obs.push(k),k=>{sd.obs=sd.obs.filter(e=>e!==k)});
  for(let i=0;i<(L.haz||0);i++)put(1,k=>sd.haz.push({k,ttl:1,dmg:2,perm:1,n:L.hn}),k=>{sd.haz=sd.haz.filter(h=>h.k!==k)})}
/* Version 78 (Tyler): half the lairs have an evidence terminal on the villain's back edge (row 0). A hero on it or beside it can hack it
   with their action for TERM_INTEL intel. Area damage (charged attacks, bombs, shockwaves) on its hex destroys it. */
const TERM_INTEL=2;
const termP=()=>{const[x,y]=S.sd.term.k.split(',').map(Number);return {x,y}};
/* Version 92 (Tyler): the terminal appears in every fight without a special henchman, instead of half of all fights */
function placeTerm(){const sd=S.sd;sd.term=null;if(sd.vl.some(o=>eliteOf(o.key)&&o.v.level>=3))return;
  const ks=[];for(let x=0;x<N;x++){const k=x+',0';if(sd.obs.includes(k)||sd.walls.some(w=>w.k===k)||sd.pits.includes(k)||sd.haz.some(h=>h.k===k)||(sd.exits||[]).includes(k)||sd.vl.some(o=>inV(o.v,x,0)))continue;ks.push(k)}
  if(ks.length)sd.term={k:pick(ks)}}
function termHit(inZ,src){const sd=S.sd;if(!sd.term||!inZ(termP()))return;const p=termP();sd.term=null;fxP(p.x,p.y,'CRUNCH!','vhit');log('vill',`${src} wrecks the evidence terminal.`)}
const canHack=u=>!!(S.sd.term&&!u.acted&&!u.ko&&cheb(u,termP())<=1);
function hack(){const sd=S.sd,u=sd.units[sd.sel];if(!u||!canHack(u))return;const h=heroOf(u);
  return act(async()=>{u.acted=true;const p=termP();A.lunge('h'+u.hid,HC(p.x,p.y));await A.sparkle(HC(p.x,p.y),COL.cyan);sd.term=null;sd.termGot=(sd.termGot||0)+TERM_INTEL;S.intel+=TERM_INTEL;
    fxP(p.x,p.y,'DOWNLOADED!','good');log('hero',`${h.name} hacks the evidence terminal. +${TERM_INTEL} intel.`)})}
function startShowdown(opt={}){
  const fin=!!opt.finale;N=fin?11:9;
  const keys=fin?opt.keys:[S.inv.v],q=fin?(opt.quality||'normal'):invQuality(S.inv.clues);
  const sd=S.sd={N,finale:fin,vkey:keys[0],quality:q,round:q==='ambush'?0:1,obs:[],units:[],hench:[],civs:[],vl:[],vi:0,
    tdk:{},walls:[],pits:[],haz:[],bombs:[],beams:[],sel:null,mode:null,busy:false,log:[],evac:0,harmed:0,woundsBy:{},result:null,fx:[],intro:!FAST};
  sd.hexv=1;const spots=fin?[[2,1],[7,1]]:[[4,1]];
  keys.forEach((k,i)=>{const vs=vState(k),sh=VILLAINS[k].shape,big=sh==='big',ser=sh==='serpent';sd.vl.push({key:k,v:{x:spots[i][0]+(big?1:0),y:spots[i][1]+(big||ser?1:0)+(k==='grid'?2:0),shape:sh,face:5,level:vs.level,deck:shuffle(vs.deck.map(e=>buildCard(k,e))),discard:[],wounds:[],last:null}});
    if(ser){const v=sd.vl[sd.vl.length-1].v;v.body=[0,1,2,3].map(j=>({x:Math.min(N-1,spots[i][0]+j),y:spots[i][1]}));v.ate=0;v.grow=0}
    if(sh==='swarm'){const v=sd.vl[sd.vl.length-1].v;const sx=spots[i][0],taken=(x,y)=>sd.vl.slice(0,-1).some(o=>inV(o.v,x,y));v.sw=[[-2,1],[2,1],[-1,2],[1,2],[-3,2],[3,2]].map(([dx,y])=>({x:sx+dx,y:y+spots[i][1],f:5})).filter(p=>inB(p.x,p.y)&&!taken(p.x,p.y)).slice(0,2);v.pk=['hive','sting','shell'].slice(0,v.sw.length+1)}
    if(k==='noct')sd.vl[sd.vl.length-1].v.hide=q!=='prepared'});
  focusV(0);
  sd.exits=mkExits(N,fin);layTerrain(fin?randLair():LAIR[keys[0]]||LAIR.gallows);placeTerm();
  const hs=party();
  if(q==='ambush'&&!S.facilities.includes('hangar')){hs.forEach(h=>{const t=pick(freeTiles((x,y)=>y>=3&&y<=N-2));sd.units.push(mkUnit(h,t.x,t.y))})}
  else{const cols=fin?[2,4,6,8]:[1,3,5,7];hs.forEach((h,i)=>{let x=cols[i%cols.length],y=N-1;if(blocked(x,y)){const t=pick(freeTiles((a,b)=>b>=N-2));x=t.x;y=t.y}sd.units.push(mkUnit(h,x,y))})}
  hs.forEach(h=>{h.comp=stat(h,'maxComp');h.cd=0});
  lastPos={};
  sd.vl.forEach((o,vi)=>{const n=Math.min(4,fin?Math.ceil(o.v.level/2):o.v.level)+(q==='ambush'?1:0);
    for(let i=0;i<n;i++){const t=pick(freeTiles((x,y)=>y>=1&&y<=4&&Math.abs(x-(o.v.x+.5))<=3))||pick(freeTiles((x,y)=>y<=5));if(t)sd.hench.push({id:'h'+vi+'_'+i,owner:o.key,x:t.x,y:t.y,hp:henchHp(2)})}
    if(eliteOf(o.key)&&o.v.level>=3){const t=freeTiles((x,y)=>dV({x,y},o.v)===1)[0]||pick(freeTiles((x,y)=>y<=4));if(t){sd.hench.push(mkElite(o,t));sd.elites=(sd.elites||[]).concat(o.key)}}});
  if(S.facilities.includes('dojo'))sd.units.forEach(u=>u.evaNext=6);
  /* about a third of civilians start deep in the lair, behind or beside the villain */
  const nc=opt.civs||3;for(let i=0;i<nc;i++){const dry=(x,y)=>!sd.haz.some(h=>h.k===x+','+y),t=(Math.random()<.35&&pick(freeTiles((x,y)=>y<=1&&dry(x,y))))||pick(freeTiles((x,y)=>y>=2&&y<=N-3&&dry(x,y)));if(t)sd.civs.push({id:i,x:t.x,y:t.y})}
  if(q==='prepared')sd.vl.forEach(o=>o.v.wounds.push(o.v.deck.shift()));
  sd.vl.forEach(o=>{if(o.v.sw)swSync(o.v)});
  sd.vl.forEach((o,i)=>{focusV(i);const t=live().slice().sort((a,b)=>dV(a,o.v)-dV(b,o.v))[0];if(t)faceTo(t)});focusV(0);
  S.phase='sd';S.view='mission';vWarn();
  log('sys',fin?`Event comic: ${keys.map(k=>VILLAINS[k].name).join(' and ')} strike together!`:`Issue #${S.issue}: the lair of ${VILLAINS[keys[0]].name}. ${QUAL[q].n}.`);
  if(q==='ambush'){log('sys','Ambush! The villain moves first.');if(!sd.intro){render();setTimeout(villainPhase,500)}}
  else log('sys',fin?'Round 1. Tap a villain to target it, and a hero to act.':'Round 1. Tap a hero to act.');
}
/* ---------- animation layer (persistent, outside #app so re-renders don't cut effects) ---------- */
const FAST=typeof window==='undefined';
const RM=!FAST&&window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const COL={mag:'#EE548C',cyan:'#3DB6DD',yel:'#F3CB4B',tech:'#3DB6DD',innate:'#F08A4B',magic:'#B48CF0',heal:'#5BC27D',grey:'#9AA1B2',rock:'#8A7A66'};
let stage=null;
function getStage(){if(!stage){stage=document.createElement('div');stage.id='stage';stage.setAttribute('aria-hidden','true');document.body.appendChild(stage)}return stage}
function bpos(p){if(FAST||RM)return null;const b=document.querySelector('.board');if(!b)return null;const r=b.getBoundingClientRect();const c=(r.width-5)/BW();
  return {x:r.left+2.5+p.cx*c,y:r.top+2.5+p.cy*c,c,top:r.top}}
function mk(html){const d=document.createElement('div');d.innerHTML=html.trim();const e=d.firstElementChild;getStage().appendChild(e);return e}
const gone=(e,ms)=>new Promise(r=>setTimeout(()=>{e.remove();r()},ms));
const TC=(dx,dy,extra='')=>`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) ${extra}`;
const A={
  bolt(f,t,col,thin){const a=bpos(f),b=bpos(t);if(!a||!b)return Promise.resolve();
    const n=9,pts=[];const nx=b.y-a.y,ny=-(b.x-a.x),L=Math.hypot(nx,ny)||1;
    for(let i=0;i<=n;i++){const k=i/n;let x=a.x+(b.x-a.x)*k,y=a.y+(b.y-a.y)*k;if(i&&i<n){const j=(Math.random()-.5)*a.c*.7;x+=nx/L*j;y+=ny/L*j}pts.push(x.toFixed(1)+','+y.toFixed(1))}
    const p=pts.join(' ');
    const s=mk(`<svg class="a-full"><polyline points="${p}" fill="none" stroke="${col}" stroke-width="${thin?4:12}" stroke-linejoin="round" stroke-linecap="round" opacity=".6"/><polyline points="${p}" fill="none" stroke="#fff" stroke-width="${thin?1.5:4}" stroke-linejoin="round" stroke-linecap="round"/>${thin?'':`<circle cx="${b.x}" cy="${b.y}" r="${a.c*.5}" fill="#fff" opacity=".85"/>`}</svg>`);
    s.animate([{opacity:0},{opacity:1,offset:.08},{opacity:.25,offset:.25},{opacity:1,offset:.4},{opacity:.6,offset:.7},{opacity:0}],{duration:560});
    if(!thin){const fl=mk(`<div class="a-flash"></div>`);fl.animate([{opacity:0},{opacity:.35,offset:.1},{opacity:0}],{duration:300});gone(fl,300)}
    return gone(s,560)},
  laser(f,t,col){const a=bpos(f),b=bpos(t);if(!a||!b)return Promise.resolve();
    const s=mk(`<svg class="a-full"><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${col}" stroke-width="${a.c*.34}" stroke-linecap="round" opacity=".55"/><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#fff" stroke-width="${a.c*.1}" stroke-linecap="round"/></svg>`);
    s.animate([{opacity:0},{opacity:1,offset:.12},{opacity:.7,offset:.6},{opacity:0}],{duration:520});return gone(s,520)},
  shot(f,t,col){const a=bpos(f),b=bpos(t);if(!a||!b)return Promise.resolve();const s=a.c*.34;
    const e=mk(`<div class="a-orb" style="width:${s}px;height:${s}px;left:${a.x}px;top:${a.y}px;box-shadow:0 0 0 3px ${col},0 0 16px 6px ${col}"></div>`);
    const d=Math.hypot(b.x-a.x,b.y-a.y),dur=Math.max(180,Math.min(420,d*1.4));
    e.animate([{transform:TC(0,0,'scale(.6)')},{transform:TC(b.x-a.x,b.y-a.y,'scale(1)')}],{duration:dur,easing:'ease-in'});
    return gone(e,dur).then(()=>A.pop(t,col))},
  pop(t,col){const b=bpos(t);if(!b)return Promise.resolve();const e=mk(`<div class="a-ring" style="left:${b.x}px;top:${b.y}px;width:${b.c}px;height:${b.c}px;border-color:${col};background:${col}55"></div>`);
    e.animate([{transform:TC(0,0,'scale(.2)'),opacity:1},{transform:TC(0,0,'scale(1)'),opacity:0}],{duration:240,easing:'ease-out'});return gone(e,240)},
  throw(f,t,kind='car'){const a=bpos(f),b=bpos(t);if(!a||!b)return Promise.resolve();const dx=b.x-a.x,dy=b.y-a.y,lift=Math.hypot(dx,dy)*.45+a.c*.6;
    const e=mk(`<div class="a-throw ${kind}" style="left:${a.x}px;top:${a.y}px;width:${a.c*.9}px;height:${a.c*.5}px"><i></i><i></i></div>`);
    e.animate([{transform:TC(0,0,'rotate(0) scale(.8)')},{transform:TC(dx/2,dy/2-lift,'rotate(220deg) scale(1.15)'),offset:.5},{transform:TC(dx,dy,'rotate(430deg) scale(1)')}],{duration:620,easing:'cubic-bezier(.3,.1,.6,1)'});
    return gone(e,620).then(()=>A.smoke(t,3))},
  slash(t,col){const b=bpos(t);if(!b)return Promise.resolve();const ps=[];
    for(let i=0;i<3;i++){const e=mk(`<div class="a-slash" style="left:${b.x+(i-1)*b.c*.12}px;top:${b.y+(i-1)*b.c*.08}px;width:${b.c*1.2}px;height:${b.c*1.2}px;border-top-color:${col}"></div>`);
      e.animate([{transform:TC(0,0,'rotate(-110deg) scale(.5)'),opacity:0},{opacity:1,offset:.2},{transform:TC(0,0,'rotate(70deg) scale(1.1)'),opacity:0}],{duration:300,delay:i*45,easing:'ease-out',fill:'backwards'});
      ps.push(gone(e,300+i*45))}return Promise.all(ps)},
  lunge(tid,to){if(FAST||RM)return;const e=document.querySelector(`[data-tid="${tid}"]`),b=bpos(to);if(!e||!b)return;const r=e.getBoundingClientRect();
    const dx=(b.x-(r.left+r.width/2))*.4,dy=(b.y-(r.top+r.height/2))*.4;e.animate([{transform:'none'},{transform:`translate(${dx}px,${dy}px) scale(1.08)`,offset:.45},{transform:'none'}],{duration:300,easing:'ease-out'})},
  shield(at,col,big){const b=bpos(at);if(!b)return Promise.resolve();const R=b.c*(big?.95:.7);
    const pts=[...Array(6)].map((_,i)=>{const a=Math.PI/3*i-Math.PI/2;return `${Math.cos(a).toFixed(3)},${Math.sin(a).toFixed(3)}`}).join(' ');
    const e=mk(`<svg class="a-box" viewBox="-1.1 -1.1 2.2 2.2" style="left:${b.x}px;top:${b.y}px;width:${R*2}px;height:${R*2}px"><polygon points="${pts}" fill="${col}" fill-opacity=".22" stroke="${col}" stroke-width=".09"/><polygon points="${pts}" fill="none" stroke="#fff" stroke-width=".03" transform="scale(.82)"/></svg>`);
    e.animate([{transform:TC(0,0,'scale(.4)'),opacity:0},{transform:TC(0,0,'scale(1.12)'),opacity:1,offset:.25},{transform:TC(0,0,'scale(1)'),opacity:.4,offset:.45},{opacity:1,offset:.6},{opacity:.5,offset:.75},{transform:TC(0,0,'scale(1.05)'),opacity:0}],{duration:700});
    return gone(e,700)},
  ring(at,col,cells,{dashed=false,fill=true,count=1,inward=false}={}){const b=bpos(at);if(!b)return Promise.resolve();const ps=[];const D=b.c*cells;
    for(let i=0;i<count;i++){const e=mk(`<div class="a-ring" style="left:${b.x}px;top:${b.y}px;width:${D}px;height:${D}px;border-color:${col};border-style:${dashed?'dashed':'solid'};${fill?`background:radial-gradient(circle,transparent 45%,${col}66 70%,transparent 72%)`:''}"></div>`);
      const k=inward?[{transform:TC(0,0,'scale(1)'),opacity:0},{transform:TC(0,0,'scale(.15)'),opacity:1}]:[{transform:TC(0,0,'scale(.15)'),opacity:1},{transform:TC(0,0,'scale(1)'),opacity:0}];
      e.animate(k,{duration:520,delay:i*140,easing:'ease-out',fill:'backwards'});ps.push(gone(e,520+i*140))}return Promise.all(ps)},
  heal(at,col){const b=bpos(at);if(!b)return Promise.resolve();const ps=[];
    for(let i=0;i<4;i++){const e=mk(`<div class="a-plus" style="left:${b.x+(i-1.5)*b.c*.22}px;top:${b.y}px;color:${col};font-size:${b.c*.45}px">+</div>`);
      e.animate([{transform:TC(0,0),opacity:0},{opacity:1,offset:.2},{transform:TC(0,-b.c*.9),opacity:0}],{duration:650,delay:i*90,easing:'ease-out',fill:'backwards'});ps.push(gone(e,650+i*90))}
    return Promise.all(ps)},
  smoke(at,n=6){const b=bpos(at);if(!b)return Promise.resolve();const ps=[];
    for(let i=0;i<n;i++){const s=b.c*(.35+Math.random()*.35),ang=Math.random()*6.28,r=b.c*(.3+Math.random()*.4);
      const e=mk(`<div class="a-puff" style="left:${b.x}px;top:${b.y}px;width:${s}px;height:${s}px"></div>`);
      e.animate([{transform:TC(0,0,'scale(.3)'),opacity:.95},{transform:TC(Math.cos(ang)*r,Math.sin(ang)*r,'scale(1.4)'),opacity:0}],{duration:560,easing:'ease-out'});ps.push(gone(e,560))}
    return Promise.all(ps)},
  sparkle(at,col){const b=bpos(at);if(!b)return Promise.resolve();const ps=[];
    for(let i=0;i<9;i++){const ang=6.28*i/9,r=b.c*.8;const e=mk(`<div class="a-spark" style="left:${b.x}px;top:${b.y}px;width:${b.c*.2}px;height:${b.c*.2}px;background:${col}"></div>`);
      e.animate([{transform:TC(0,0,'rotate(45deg) scale(.4)'),opacity:1},{transform:TC(Math.cos(ang)*r,Math.sin(ang)*r,'rotate(225deg) scale(1)'),opacity:0}],{duration:480,easing:'ease-out'});ps.push(gone(e,480))}
    return Promise.all(ps)},
  sigil(at,col,cells=2.4){const b=bpos(at);if(!b)return Promise.resolve();const R=b.c*cells/2;
    const st=[...Array(5)].map((_,i)=>{const a=Math.PI*4/5*i-Math.PI/2;return `${(Math.cos(a)*.78).toFixed(3)},${(Math.sin(a)*.78).toFixed(3)}`}).join(' ');
    const e=mk(`<svg class="a-box" viewBox="-1.1 -1.1 2.2 2.2" style="left:${b.x}px;top:${b.y}px;width:${R*2}px;height:${R*2}px"><circle r="1" fill="none" stroke="${col}" stroke-width=".07"/><circle r=".86" fill="none" stroke="${col}" stroke-width=".025" stroke-dasharray=".08 .06"/><polygon points="${st}" fill="${col}" fill-opacity=".15" stroke="${col}" stroke-width=".05"/></svg>`);
    e.animate([{transform:TC(0,0,'rotate(-90deg) scale(.3)'),opacity:0},{transform:TC(0,0,'rotate(0) scale(1)'),opacity:1,offset:.35},{opacity:1,offset:.7},{transform:TC(0,0,'rotate(60deg) scale(1.1)'),opacity:0}],{duration:800,easing:'ease-out'});
    return gone(e,800)},
  reticle(at,col){const b=bpos(at);if(!b)return Promise.resolve();const R=b.c*1.2;
    const e=mk(`<svg class="a-box" viewBox="-1.2 -1.2 2.4 2.4" style="left:${b.x}px;top:${b.y}px;width:${R*2}px;height:${R*2}px"><circle r=".8" fill="none" stroke="${col}" stroke-width=".08"/><path d="M0 -1.15V-.45M0 .45V1.15M-1.15 0H-.45M.45 0H1.15" stroke="${col}" stroke-width=".09"/></svg>`);
    e.animate([{transform:TC(0,0,'scale(1.8) rotate(45deg)'),opacity:0},{transform:TC(0,0,'scale(1) rotate(0)'),opacity:1,offset:.5},{opacity:1,offset:.8},{opacity:0}],{duration:620,easing:'ease-out'});
    return gone(e,620)},
  beam(at,col){const b=bpos(at);if(!b)return Promise.resolve();const h=Math.max(b.c,b.y-b.top+b.c*.3);
    const e=mk(`<div class="a-beam" style="left:${b.x}px;top:${b.y-h}px;width:${b.c*.9}px;height:${h}px;background:linear-gradient(90deg,transparent,${col} 25%,#fff 50%,${col} 75%,transparent)"></div>`);
    e.animate([{transform:'translateX(-50%) scaleY(0)',opacity:1},{transform:'translateX(-50%) scaleY(1)',opacity:1,offset:.35},{transform:'translateX(-50%) scaleY(1) scaleX(1.6)',opacity:.9,offset:.6},{transform:'translateX(-50%) scaleY(1) scaleX(.2)',opacity:0}],{duration:700});
    return gone(e,700).then(()=>A.ring(at,col,2.6))},
  lift(at){const b=bpos(at);if(!b)return Promise.resolve();
    const e=mk(`<div class="a-orb" style="left:${b.x}px;top:${b.y}px;width:${b.c*.45}px;height:${b.c*.45}px;background:${COL.yel};box-shadow:0 0 0 2px #151821,0 0 14px 4px ${COL.yel}"></div>`);
    e.animate([{transform:TC(0,0)},{transform:TC(0,-b.c*1.6,'scale(.4)'),opacity:0}],{duration:520,easing:'ease-in'});
    return Promise.all([gone(e,520),A.sparkle(at,COL.yel)])},
};
function strikeAnim(style,from,to,col,tid){
  switch(style){case 'none':return Promise.resolve();case 'bolt':return A.bolt(from,to,col);case 'shot':return A.shot(from,to,col);
    case 'throw':return A.throw(from,to,'car');case 'rock':return A.throw(from,to,'rock');case 'beam':return A.beam(to,col);
    default:if(tid)A.lunge(tid,to);return sleep(FAST||RM?0:110).then(()=>A.slash(to,col))}}
const ctrU=u=>HC(u.x,u.y),ctrV=()=>vCtr(S.sd.v);

/* ---------- card reveals: comic book opening (draws) and torn pages (wounds) ---------- */
const TYPE_SFX={multi:'BARRAGE!',walls:'BUILD!',hazard:'MELTDOWN!',cage:'CAGED!',shrapnel:'DEMOLISH!',fortify:'FORTIFY!',charge:'CHARGING!',strike:'STRIKE!',sweep:'SHOCKWAVE!',summon:'BACKUP!',endanger:'HOSTAGE!',taunt:'TAUNT!',vanish:'POOF!',reanimate:'RECHARGE!',puppet:'OBEY!',rampage:'RAMPAGE!',swallow:'GULP!',pull:'ATTRACT!',repel:'REPEL!',fade:'FADE…',converge:'SWARM!',scatter:'SCATTER!',leap:'BOING!',bomb:'TSSS!',detonate:'KABOOM!',airburst:'LOOK UP!',beam:'ZZARK!',burrow:'SHUNK!'};
const TAC_SFX={weak:'CRACK!',armor:'TINK!',over:'OPENING!',counter:'COUNTER!',mono:'BLAH BLAH…',shield:'NO!',escape:'HA HA!',glance:'SOLID!'};
const TEAR=(()=>{const z=[];for(let i=0;i<=12;i++)z.push([i*100/12,48+(i%2?6:-5)+((i*37)%5)-2]);return z})();
const tearTop=`polygon(0 0,100% 0,${TEAR.slice().reverse().map(([x,y])=>`${x}% ${y}%`).join(',')})`;
const tearBot=`polygon(${TEAR.map(([x,y])=>`${x}% ${y}%`).join(',')},100% 100%,0 100%)`;
function reveal(o){if(FAST)return Promise.resolve();
  return new Promise(res=>{
    const L=document.createElement('div');L.id='cards';if(o.vk){L.className='vth';L.setAttribute('style',vSty(o.vk))}L.setAttribute('role','dialog');L.setAttribute('aria-label',`${o.title}: ${o.text}`);
    const page=(cls,style='')=>`<div class="pg ${cls||''}${o.sig?' sig':''}" style="${style}"><div class="hd"><span>${o.vk?vIc(o.vk):''}${esc(o.deck)}</span><span>${esc(o.tag||'')}</span></div>${o.rib?`<div class="sigrib ${o.ribCls||''}">${esc(o.rib)}</div>`:''}
      <div class="art ${o.art||''}">${o.vk?vWm(o.vk):''}<span>${esc(o.sfx)}</span></div><h2>${esc(o.title)}</h2><div class="tx">${esc(o.text)}</div>
      ${o.foot?`<div class="tx small"><b>${esc(o.foot)}</b></div>`:''}<div class="ft">${o.mode==='tear'?'Tap to tear it out':'Tap to resolve'}</div></div>`;
    const tear=o.mode==='tear';
    L.innerHTML=tear?`<div class="book tearbook">${page('top',`clip-path:${tearTop}`)}${page('bot',`clip-path:${tearBot}`)}
        <svg class="tearline" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${TEAR.map(([x,y])=>`${x},${y}`).join(' ')}" vector-effect="non-scaling-stroke"/></svg><span class="woundstamp">Wound!</span></div>
        <button class="btn pri cardgo" type="button">Tear it out</button>`
      :`<div class="book">${page()}<div class="cover ${o.coverCls||''}"><small>${esc(o.coverTop)}</small><b>${esc(o.coverTitle)}</b><small>${esc(o.coverFoot||'')}</small></div></div>
        <button class="btn pri cardgo" type="button">Resolve</button>`;
    document.body.appendChild(L);const ready=Date.now()+(tear||RM?250:850);
    const btn=L.querySelector('.cardgo');setTimeout(()=>btn.focus({preventScroll:true}),RM?0:800);
    const go=e=>{e.stopPropagation();if(Date.now()<ready)return;L.removeEventListener('click',go);L.classList.add('leaving');
      L.querySelector('.book').classList.add(tear?'torn':'out');setTimeout(()=>{L.remove();res()},RM?0:tear?700:280)};
    L.addEventListener('click',go)})}
function villainCardView(c){const sd=S.sd,def=VILLAINS[sd.vkey];return {vk:sd.vkey,mode:'open',deck:`${def.name} · Playbook`,tag:`Round ${Math.max(1,sd.round)}`,sfx:TYPE_SFX[c.t]||'!',title:c.n,text:c.txt,
  sig:!!c.sig,rib:c.sig?'★ Signature Move ★':'',art:'vil',coverCls:c.sig?'vil sig':'vil',coverTop:c.sig?'★ Signature move! ★':'Villain turn',coverTitle:def.name,coverFoot:`Issue #${S.issue} · ${sd.v.deck.length} pages left`}}
const ARCN={front:'front',flank:'side',rear:'rear'};const arcTxt=a=>a.map(x=>ARCN[x]).join(' and ')+(a.length>1?' arcs':' arc');
function tacticCardView(tc,h,side,inArc,why){return {mode:'open',deck:tc.sig?`${VILLAINS[tc.sig].short} · Hit reaction`:'Hit deck',tag:h.name,sfx:tc.sig?tc.sfx:TAC_SFX[tc.id]||'!',title:tc.n,text:tc.txt,
  rib:tc.sig?'Signature reaction':'',ribCls:'r',foot:[why||(tc.arc&&side?`${h.name} struck from the ${ARCN[side]} arc: ${inArc?'it triggers!':'wrong side, it does nothing.'}`:''),tc.sig&&tc.src?`Lost when ${VILLAINS[tc.sig].cards[tc.src].n} is torn from the playbook.`:''].filter(Boolean).join(' '),art:'tac',coverCls:'tac',coverTop:'Hit!',coverTitle:`${h.name} connects`,coverFoot:'Draw a hit card'}}
async function woundAnim(foot,q){const sd=S.sd,v=sd.v,k=sd.vkey;if(!v.deck.length&&v.discard.length){v.deck=shuffle(v.discard);v.discard=[];log('sys','The playbook is reshuffled.')}
  if(v.excise&&v.deck.length>1){const top=v.deck.slice(0,v.excise);v.excise=0;top.forEach(c=>markSeen(k,c.id));
    const i=await choose(`Find the Flaw · ${VILLAINS[k].short}`,'Choose the page this wound tears out.',top.map(c=>({l:`${c.sig?'★ ':''}${c.n}`,s:c.txt})));const p=top[i];v.deck.splice(v.deck.indexOf(p),1);v.deck.unshift(p);log('hero',`Find the Flaw: ${p.n} is the page that tears.`)}
  const c=v.deck[0];if(c)markSeen(k,c.id);if(q)q.page=c;if(c&&!q)await reveal({vk:k,mode:'tear',deck:`${VILLAINS[k].name} · Playbook`,tag:`${Math.max(0,v.deck.length+v.discard.length-1)} pages left`,sfx:TYPE_SFX[c.t]||'!',title:c.n,text:c.txt,foot,art:'vil',sig:!!c.sig,rib:c.sig?'★ Signature Move ★':''});
  const was=VINTEL[k].react.filter(r=>rxLive(v,r));
  v.hurtAt=Date.now();const end=woundV();log('hero',`${c?c.n:'A page'} is torn from the playbook.`);
  const splash=(...a)=>q?q.splash.push(a):breakSplash(...a);
  if(c&&c.sig){log('hero',`${c.brk} ${c.n} is gone.`);await splash(c.brk,`${c.n} is torn from ${VILLAINS[k].name}'s playbook`,'Signature Move destroyed')}
  for(const r of was.filter(r=>!rxLive(v,r))){markSeenR(k,r.id);log('hero',`${r.brk} The ${r.n} reaction leaves the hit deck.`);await splash(r.brk,`${r.n} is gone from the hit deck`,'Signature reaction destroyed')}
  if(v.sw&&!v.down){const s=swSync(v);s.lost.forEach(b=>{log('hero',`The ${SWN[b].toLowerCase()} body falls out of the swarm.`);fxV('SPLAT!','hit')})}
  vWarn();render();return end}
/* one panel per attack: the attack roll and each hit's reaction card, then 100ms later the strength checks beside them */
function attackPanel(o){if(FAST)return Promise.resolve();
  return new Promise(res=>{const L=document.createElement('div');L.id='atk';L.setAttribute('role','dialog');L.setAttribute('aria-label',`${o.name} attacks: ${o.hits} hits, ${o.rows.filter(r=>r.ok).length} wounds`);
    const row=(r,dl)=>{const tc=r.tc,note=r.note?`<div class="note">${esc(r.note)}</div>`:'';
      const res=r.ok?'WOUND!':r.block?'BLOCKED!':'CLANG!',roll=r.block?esc(r.blockTxt):r.auto?`${tc.sig?esc(tc.n):'Weak point'}: the wound lands.`:`Strength roll <b>${r.r}</b> + ${r.str} = ${r.r+r.str} vs toughness ${r.tough}${r.r===20?' (natural 20)':r.r===1?' (natural 1)':''}`;
      return `<div class="arow"><div class="rx ${tc.sig?'sig':''} ${r.off?'off':''}">${dl}<span class="sfx">${esc(tc.sig?tc.sfx:TAC_SFX[tc.id]||'!')}</span><h4>${esc(tc.n)}</h4><div>${esc(tc.txt)}</div>${note}</div>
        <div class="st ${r.ok?'ok':''}"><span class="res">${res}</span><div>${roll}</div>${r.page?`<div class="torn">Torn out: ${r.page.sig?'★ ':''}${esc(r.page.n)}</div>`:''}</div></div>`};
    const isHit=d=>d===20||(d!==1&&d+o.acc>=o.eva),acc=(d,i)=>`<div class="dl"><span class="die ${isHit(d)?'hit':''}">${d}</span><small>Die ${i+1}: ${d} + ${o.acc} = ${d+o.acc} vs evasion ${o.eva}${d===20?' (natural 20)':d===1?' (natural 1)':''}</small></div>`;
    let k=0;const rows=o.rolls.map((d,i)=>{if(!isHit(d))return `<div class="arow"><div class="rx miss">${acc(d,i)}</div><div class="st"><span class="res">MISS</span><div>No hit card drawn.</div></div></div>`;
      const r=o.rows[k++];return r?row(r,acc(d,i)):`<div class="arow"><div class="rx">${acc(d,i)}</div><div class="st"><span class="res">—</span><div>The villain is already down.</div></div></div>`});
    L.innerHTML=`<div class="atkp"><div class="ah"><b>${esc(o.name)} attacks!</b><small>${o.rolls.length} ${o.rolls.length===1?'die':'dice'} · ${o.hits} hit${o.hits===1?'':'s'} · ${o.rows.filter(r=>r.ok).length} wound${o.rows.filter(r=>r.ok).length===1?'':'s'}</small></div>
      <div class="rows">${rows.join('')}</div></div><button class="btn pri cardgo" type="button">Continue</button>`;
    document.body.appendChild(L);const ready=Date.now()+(RM?150:450);const btn=L.querySelector('.cardgo');setTimeout(()=>btn.focus({preventScroll:true}),RM?0:300);
    const go=e=>{e.stopPropagation();if(Date.now()<ready)return;L.removeEventListener('click',go);L.classList.add('leaving');setTimeout(()=>{L.remove();res()},RM?0:200)};
    L.addEventListener('click',go)})}
/* a signature reaction stays in the hit deck while the page that carries it is still in the playbook */
const rxLive=(v,r)=>!r.src||[...v.deck,...v.discard].some(p=>p.id===r.src);
function breakSplash(title,sub,tag){if(FAST)return Promise.resolve();
  return new Promise(res=>{const L=document.createElement('div');L.id='brk';L.setAttribute('role','alert');
    L.innerHTML=`<div class="burst"><div class="bt"><span>${esc(tag)}</span><b>${esc(title)}</b><small>${esc(sub)}</small></div></div>`;document.body.appendChild(L);
    const t0=Date.now();let done=false;const go=()=>{if(done||Date.now()-t0<350)return;done=true;L.classList.add('leaving');setTimeout(()=>{L.remove();res()},RM?0:240)};
    L.addEventListener('click',e=>{e.stopPropagation();go()});setTimeout(go,RM?1600:2600)})}
/* several breaks from one attack stack in one overlay, each bursting in shortly after the last; one tap clears them all */
function breakStack(list){if(!list.length)return Promise.resolve();if(list.length===1)return breakSplash(...list[0]);if(FAST)return Promise.resolve();
  return new Promise(res=>{const L=document.createElement('div');L.id='brk';L.className='stack';L.setAttribute('role','alert');const gap=RM?0:420;
    L.innerHTML=list.map(([title,sub,tag],i)=>`<div class="burst" style="animation-delay:${i*gap}ms"><div class="bt"><span>${esc(tag)}</span><b>${esc(title)}</b><small>${esc(sub)}</small></div></div>`).join('');document.body.appendChild(L);
    const t0=Date.now(),all=(list.length-1)*gap;let done=false;const go=()=>{if(done||Date.now()-t0<all+350)return;done=true;L.classList.add('leaving');setTimeout(()=>{L.remove();res()},RM?0:240)};
    L.addEventListener('click',e=>{e.stopPropagation();go()});setTimeout(go,all+(RM?1600:2800))})}
/* a villain about to play a Signature Move shouts a hint; tearing that page first cancels it */
function vWarn(){const sd=S.sd;if(!sd)return;sd.vl.forEach(o=>{const v=o.v,top=v.deck[0];
  if(v.down||v.charge||!top||!top.sig||sd.result){v.warn=null;return}
  if(v.warn===top.uid)return;v.warn=top.uid;log('vill',`${VILLAINS[o.key].short} shouts: “${top.shout}”`)})}

/* ---------- combat ---------- */
function damageHero(u,n){const h=heroOf(u);if(u.stasis&&n>0){fxU(u,'NO EFFECT','good');log('hero',`Time Stop: ${h.name} takes no damage.`);return}if(S.cheat&&S.cheat.god){log('sys',`${h.name} shrugs off ${n} damage (invincible).`);return}if(n>1&&setOn(h,'architect')){n--;log('hero',`Load-Bearing: ${h.name} takes 1 less.`)}if(n>2&&auraOn(u,'brace')){n--;log('hero',`Shield Wall: ${h.name} takes 1 less.`)}if(u.dr&&n>0){const m=Math.max(1,n-u.dr);log('hero',`${h.name}'s guard soaks ${n-m} damage.`);n=m}if(u.absorb&&n>0){const m=Math.min(u.absorb,n);u.absorb-=m;n-=m;log('hero',`${h.name}'s shield absorbs ${m} damage${u.absorb?` (${u.absorb} left)`:' and fades'}.`)}h.hp-=n;u.hurtAt=Date.now();if(n>0&&h.hp>0)painGain(u,h);if(h.hp<=0&&!u.anti&&S.facilities.includes('antivenom')){h.hp=1;u.anti=true;fxU(u,'ANTIVENOM!','good');log('hero',`Antivenom Lab: ${h.name} stays on their feet with 1 health.`)}if(h.hp<=0){h.hp=0;u.ko=true;u.guard=false;log('vill',`${h.name} is down!`)}}
function harmCiv(c,why){const sd=S.sd;sd.civs=sd.civs.filter(o=>o!==c);sd.harmed++;fxP(c.x,c.y,'AAAH!','vhit');log('vill',`A civilian is hurt by ${why}.`)}
/* Civilians are saved on an exit hex (sd.exits). c.f = id of the hero they follow, c.held = id of the henchman dragging them. */
function mkExits(n,fin){const e=[`0,${n-1}`,`${n-1},${n-1}`];if(fin)e.push(`${Math.random()<.5?0:n-1},${Math.floor(n/2)}`);return e}
const isExit=p=>(S.sd.exits||[]).includes(p.x+','+p.y);
const followers=u=>S.sd.civs.filter(c=>c.f===u.hid);
const civHeld=c=>!!c.held&&S.sd.hench.some(m=>m.id===c.held);
const panicky=c=>!c.f&&!civHeld(c)&&!live().some(u=>cheb(u,c)<=1);
function saveCiv(c,u){const sd=S.sd;if(!sd.civs.includes(c))return;sd.civs=sd.civs.filter(o=>o!==c);sd.evac++;fxP(c.x,c.y,'SAVED!','good');
  const h=u&&heroOf(u);log('hero',h?`${h.name} gets a civilian out through the exit.`:'A civilian makes it out through an exit.');if(h&&gearHas(h,'rescue'))lifeline(u,h)}
function civHazard(c){const sd=S.sd,k=c.x+','+c.y;if(sd.haz.some(h=>h.k===k))harmCiv(c,'the molten floor');else if(litMap()[k])harmCiv(c,'a beam')}
function letGo(u,why){const fs=followers(u);fs.forEach(c=>c.f=null);if(fs.length&&why)log('hero',`${heroOf(u).name} ${why}`);return fs.length}
/* after a hero moves, the civilians they lead catch up through free hexes; a hero on an exit sends them all out */
function civFollow(u){const sd=S.sd,fs=followers(u);if(!fs.length)return;
  if(u.ko){letGo(u,'goes down, and the civilians scatter.');return}
  if(isExit(u)){fs.forEach(c=>saveCiv(c,u));return}
  const placed=[u],lim=stat(heroOf(u),'move')+3,near=p=>placed.some(o=>cheb(o,p)<=1);
  for(const c of fs.sort((a,b)=>cheb(a,u)-cheb(b,u))){
    if(near(c)){placed.push(c);continue}
    const r=reach(c,lim,c);let best=null,bd=1e9;for(const k in r){const[x,y]=k.split(',').map(Number);if(r[k]<bd&&near({x,y})){bd=r[k];best={x,y}}}
    if(best){c.x=best.x;c.y=best.y;placed.push(c);civHazard(c);if(isExit(c))saveCiv(c,u)}
    else{c.f=null;fxP(c.x,c.y,'WAIT!','miss');log('hero',`A civilian can't keep up with ${heroOf(u).name} and is left behind.`)}}}
function escort(){const sd=S.sd,u=sd.units[sd.sel];if(!u||u.ko||(u.acted&&!u.freeEvac))return;const h=heroOf(u),cs=sd.civs.filter(c=>c.f!==u.hid&&!civHeld(c)&&cheb(c,u)<=1);if(!cs.length)return;
  return act(async()=>{if(u.freeEvac)u.freeEvac=false;else u.acted=true;A.lunge('h'+u.hid,HC(cs[0].x,cs[0].y));await Promise.all(cs.map(c=>A.sparkle(HC(c.x,c.y),COL.yel)));
    cs.forEach(c=>{c.f=u.hid;fxP(c.x,c.y,'THIS WAY!','good')});log('hero',`${h.name} gathers ${cs.length} civilian${cs.length>1?'s':''}. They follow ${h.name} until they reach an exit.`);
    if(isExit(u))cs.forEach(c=>saveCiv(c,u))})}
/* villain turn: loose civilians with nobody beside them run 1 hex from the nearest threat; they may run into hazards or out an exit */
async function civPanic(){const sd=S.sd,T=[];sd.vl.forEach(o=>{if(!o.v.down)vCells(o.v).forEach(c=>T.push(c))});sd.hench.forEach(m=>T.push(m));(sd.bombs||[]).forEach(b=>T.push(bombP(b)));
  const scared=sd.civs.filter(panicky);if(!T.length||!scared.length)return;const dT=p=>Math.min(...T.map(t=>cheb(t,p)));let ran=0;
  for(const c of scared){if(!sd.civs.includes(c))continue;const d0=dT(c);
    const opts=nbrs(c).filter(n=>!blocked(n.x,n.y)).map(n=>({n,d:dT(n)+Math.random()*.4})).filter(o=>o.d>=d0+1).sort((a,b)=>b.d-a.d);
    fxP(c.x,c.y,pick(['HELP!','AIEE!','RUN!','EEK!']),'panic');c.panic=Date.now();
    if(opts.length){c.x=opts[0].n.x;c.y=opts[0].n.y;ran++}}
  log('vill',ran?`${ran} panicking civilian${ran>1?'s run':' runs'} from the fight.`:'The civilians cower in place.');render();await sleep(FAST?0:650);
  for(const c of scared){if(!sd.civs.includes(c))continue;civHazard(c);if(sd.civs.includes(c)&&isExit(c))saveCiv(c,null)}render()}
/* a henchman next to a loose civilian grabs them and drags them 1 hex toward its villain each turn instead of attacking */
async function henchGrab(hm){const sd=S.sd,o=sd.vl.find(o=>o.key===(hm.owner||sd.vkey)&&!o.v.down)||sd.vl.find(o=>!o.v.down);if(!o)return false;
  const vv=o.v,first=!sd.civs.some(c=>c.held===hm.id),cv=sd.civs.find(c=>c.held===hm.id)||sd.civs.find(c=>!c.f&&!civHeld(c)&&cheb(c,hm)<=1);if(!cv)return false;
  cv.held=hm.id;const dv=p=>dV(p,vv),n=nbrs(cv).filter(p=>!blocked(p.x,p.y)&&dv(p)<dv(cv)).sort((a,b)=>dv(a)-dv(b))[0];
  const hn=VILLAINS[o.key].hench.name;
  if(n){cv.x=n.x;cv.y=n.y;if(cheb(hm,cv)>1){const t=freeTiles((x,y)=>cheb({x,y},cv)===1).sort((a,b)=>cheb(a,hm)-cheb(b,hm))[0];if(t){hm.x=t.x;hm.y=t.y}}
    if(cheb(hm,cv)>1)cv.held=null;else{fxP(cv.x,cv.y,first?'GOTCHA!':'LET GO!','vhit');log('vill',first?`A ${hn.toLowerCase()} grabs a civilian and drags them toward ${VILLAINS[o.key].name}.`:`The ${hn.toLowerCase()} drags the civilian closer to ${VILLAINS[o.key].name}.`)}
    render();await sleep(FAST?0:350);civHazard(cv)}
  else{fxP(cv.x,cv.y,first?'GOTCHA!':'HELP!','vhit');log('vill',`A ${hn.toLowerCase()} holds a civilian hostage.`)}
  return true}
async function wardBlocks(u){if(!u.ward)return false;u.ward=false;await A.shield(ctrU(u),COL.magic,true);fxU(u,'WARDED!','good');log('hero',`A ward turns the blow aside from ${heroOf(u).name}.`);render();return true}
async function vHit(u,dmg,label,style){const h=heroOf(u);if(S.sd.v.cursed&&dmg>0)dmg=Math.max(1,dmg-2);faceTo(u);render();await strikeAnim(style,ctrV(),ctrU(u),COL.mag,'v'+S.sd.vi);
  let r=d20();/* Version 115 (Tyler): Lucky Coin no longer affects villain attacks */const acc=vStat('acc'),eva=stat(h,'eva')+(u.buffEva||0)+(u.evaNext||0);if(u.evaNext){log('hero',`Wind Ward: +${u.evaNext} evasion for ${h.name}.`);u.evaNext=0};const hit=r===20||(r!==1&&r+acc>=eva);
  log('vill',`${label} at ${h.name}: rolled ${r}+${acc} vs evasion ${eva}. ${hit?`Hit for ${dmg}.`:'Miss.'}`);
  if(hit&&await wardBlocks(u))return false;
  if(hit&&u.reflect&&!S.sd.v.down){u.reflect=0;log('hero',`${h.name} turns the blow back: ${VILLAINS[S.sd.vkey].short} tears a page.`);await woundAnim(`${h.name}: reflected.`)}
  fxU(u,hit?pick(SFX_VHIT):'SWISH!',hit?'vhit':'miss');if(hit)damageHero(u,dmg);render();if(!hit)await riposte(u);return hit}
/* Version 117 (Tyler): a conditional target (weakest, farthest) is picked only among heroes the villain can reach this turn
   (within move + range, by hex distance). If nobody is in reach it goes for the nearest hero. */
function pickTarget(mode,reach){const sd=S.sd;let L=live();if(!L.length)return null;
  if(reach!=null&&mode!=='nearest'){const inR=L.filter(u=>dV(u,sd.v)<=reach);if(inR.length)L=inR;else mode='nearest'}
  if(mode==='weakest')return L.slice().sort((a,b)=>heroOf(a).hp-heroOf(b).hp)[0];
  const byD=L.slice().sort((a,b)=>dV(a,sd.v)-dV(b,sd.v));return mode==='farthest'?byD[byD.length-1]:byD[0]}
function dmgScale(d){return d+Math.floor(S.sd.v.level/2)} /* Version 83 (Tyler): +1 damage at every even level */
function vStyle(c){if(c.fx)return c.fx;return (c.rng||0)>1||c.t==='endanger'?VILLAINS[S.sd.vkey].rstyle:'slash'}
async function vMove(fn,crush=0,label=''){const sd=S.sd,v=sd.v,ox=v.x,oy=v.y,osw=JSON.stringify(v.sw||0);const sh=fn()||[];const path=v.path;delete v.path;
  if(path&&path.length){const fin={x:v.x,y:v.y,body:v.body};for(const p of path){v.x=p.x;v.y=p.y;v.body=p.body;noFlip.add('v'+sd.vi);render();await sleep(FAST?0:RM?60:150)}v.x=fin.x;v.y=fin.y;v.body=fin.body}
  else if(v.x!==ox||v.y!==oy||JSON.stringify(v.sw||0)!==osw){render();await sleep(Math.min(520,180+90*Math.hypot(v.x-ox,v.y-oy)))}
  for(const o of sh){if(sd.units.includes(o)){if(o.ko)continue;if(crush){fxU(o,'CRUNCH!','vhit');damageHero(o,crush);log('vill',`${label||'The charge'} shoves ${heroOf(o).name} aside for ${crush} damage.`)}else{fxU(o,'SHOVED!','miss');log('vill',`${heroOf(o).name} is shoved aside.`)}}
    else if(sd.civs.includes(o)){if(crush)harmCiv(o,label||'the stampede');else fxP(o.x,o.y,'EEK!','miss')}}
  if(v.smashed&&v.smashed.length){const ks=v.smashed;delete v.smashed;await Promise.all(ks.map(k=>{const[x,y]=k.split(',').map(Number);return A.smoke(HC(x,y),3)}));fxV('KRASH!','vhit');log('vill',`${VILLAINS[sd.vkey].name} smashes straight through ${ks.length>1?ks.length+' hexes of walls and rubble':'a wall'}.`);render()}
  if(sh.length)render()}
async function execCard(c){const sd=S.sd,v=sd.v,vn=VILLAINS[sd.vkey].name;
  switch(c.t){
    case 'strike':{let t=pickTarget(c.tgt,(VILLAINS[sd.vkey].rooted?0:c.mv||0)+(c.rng||1));if(!t)break;await vMove(()=>vToward(t,c.mv,c.rng),c.crush||0,c.n);
      if(dV(t,v)>c.rng){log('vill',`${vn} can't reach ${heroOf(t).name}.`);fxV('GRR!','say');break}
      if(shotVB(t,v)){log('vill',`A girder is in the way: ${vn}'s ${c.n} can't reach ${heroOf(t).name}.`);fxV('GRR!','say');break}
      let dmg=dmgScale(c.dmg);const g=live().find(o=>o.guard&&o!==t&&cheb(o,t)<=2);
      if(g){log('hero',`${heroOf(g).name} braces and takes the blow.`);A.lunge('h'+g.hid,ctrU(t));await A.shield(ctrU(g),COL.yel,true);t=g;if(dmg>0)dmg=Math.max(1,dmg-1)}
      {const hit=await vHit(t,dmg,c.n,vStyle(c));if(hit&&c.comp&&!t.ko){const th=heroOf(t);th.comp=Math.max(0,th.comp-c.comp);fxU(t,'RATTLED!','vhit');log('vill',`${th.name} loses ${c.comp} composure.`);render()}}
      if(c.col)sd.civs.filter(cv=>cheb(cv,t)<=1).forEach(cv=>harmCiv(cv,'flying wreckage'));break}
    case 'sweep':await sweep(c.r,dmgScale(c.dmg),c.n);break;
    /* Version 133: Mole Boy digs under the floor and bursts up beside the farthest hero, leaving rubble where he went down */
    case 'burrow':{const t=pickTarget('farthest');if(!t)break;const from={x:v.x,y:v.y},sp=nbrs(t).filter(p=>inB(p.x,p.y)&&!(p.x===v.x&&p.y===v.y)&&vFits(p.x,p.y,true)).sort((a,b)=>cheb(a,from)-cheb(b,from))[0];
      if(!sp){log('vill',`${vn} can't find soft ground near ${heroOf(t).name}.`);fxV('GRR!','say');break}
      await A.smoke(ctrV(),3);vPut(v,sp.x,sp.y);noFlip.add('v'+sd.vi);const k0=from.x+','+from.y;if(!sd.obs.includes(k0))sd.obs.push(k0);render();await A.smoke(ctrV(),3);fxV('SHUNK!','say');
      log('vill',`${vn} dives underground and bursts up next to ${heroOf(t).name}, leaving rubble where he went down.`);await vHit(t,dmgScale(c.dmg),c.n,'slash');break}
    case 'rampage':{const t=pickTarget('nearest');if(t)await vMove(()=>vToward(t,c.mv,1),c.crush||0,c.n);await sweep(1,dmgScale(c.dmg),c.n);break}
    case 'summon':{const added=[];for(let i=0;i<c.k;i++){const t=freeTiles().sort((a,b)=>dV(a,v)-dV(b,v))[0];if(t){const m={id:'s'+Date.now()+i,owner:sd.vkey,x:t.x,y:t.y,hp:henchHp(2)};sd.hench.push(m);added.push(m)}}
      fxV('GET THEM!','say');render();await Promise.all(added.map(m=>A.smoke(ctrU(m))));log('vill',`${added.length} ${VILLAINS[sd.vkey].hench.name.toLowerCase()}s arrive.`);break}
    case 'endanger':{const cv=sd.civs.slice().sort((a,b)=>dV(a,v)-dV(b,v))[0];if(cv)faceTo(cv);
      if(!cv){const t=pickTarget('nearest');if(t){await vMove(()=>vToward(t,2,1));if(dV(t,v)<=1)await vHit(t,dmgScale(2),c.n,'slash')}break}
      await vMove(()=>vToward(cv,2,1));const prot=live().find(u=>cheb(u,cv)<=1);
      if(prot){A.lunge('h'+prot.hid,ctrU(cv));await strikeAnim(vStyle(c),ctrV(),ctrU(prot),COL.mag,'v'+S.sd.vi);log('hero',`${heroOf(prot).name} shields a civilian and takes ${dmgScale(c.dmg||2)}.`);
        if(!await wardBlocks(prot)){await A.shield(ctrU(prot),COL.yel);fxU(prot,'OOF!','vhit');damageHero(prot,dmgScale(c.dmg||2))}}
      else if(dV(cv,v)<=3){await strikeAnim(vStyle(c),ctrV(),ctrU(cv),COL.mag,'v'+S.sd.vi);harmCiv(cv,c.n)}
      else{log('vill',`${c.n} falls short. The civilian runs.`);fxP(cv.x,cv.y,'EEK!','miss')}break}
    case 'taunt':{await A.ring(ctrV(),COL.yel,c.r*2+2,{dashed:true,fill:false,count:3});
      const hit=live().filter(u=>dV(u,v)<=c.r);const lm=litMap(),ex=u=>(c.bombx&&(sd.bombs||[]).some(b=>cheb(bombP(b),u)<=1)?1:0)+(c.litx&&lm[u.x+','+u.y]?1:0);hit.forEach(u=>{const h=heroOf(u);h.comp=Math.max(0,h.comp-c.amt-ex(u));fxU(u,'GRR!','miss')});
      log('vill',hit.length?`${c.n}: ${hit.map(u=>heroOf(u).name).join(', ')} lose ${c.amt} composure.`:`${c.n}: nobody is close enough to hear.`);break}
    case 'vanish':{let best=null,bs=-1;for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!vFits(x,y,true))continue;const s=Math.min(...live().map(u=>dV(u,{x,y})))+Math.random();if(s>bs){bs=s;best=[x,y]}}
      await A.smoke(ctrV(),9);if(best){v.x=best[0];v.y=best[1]}noFlip.add('v'+sd.vi);render();await A.smoke(ctrV(),9);fxV('POOF!','miss');{const t=pickTarget('nearest');if(t)faceTo(t)}log('vill',`${vn} vanishes and reappears across the room.`);break}
    case 'multi':{const ts=live().filter(u=>dV(u,v)<=c.rng).sort((a,b)=>dV(a,v)-dV(b,v)).slice(0,c.cnt);
      if(!ts.length){log('vill',`${c.n} has no one in range.`);fxV('GRR!','say');break}
      for(const t of ts)await vHit(t,dmgScale(c.dmg),c.n,vStyle(c));break}
    case 'walls':{if(c.retreat){const n=live().slice().sort((a,b)=>dV(a,v)-dV(b,v))[0];if(n){const was=JSON.stringify(vCells(v));await vMove(()=>vAway(n,c.retreat),0,c.n);if(JSON.stringify(vCells(v))!==was)log('vill',`${vn} backs away into the maze.`)}} /* Version 94 (Tyler): Labyrinth retreats before the walls go up */
      const L=live().slice().sort((a,b)=>dV(a,v)-dV(b,v));const made=[];
      for(let i=0;i<(c.lines||1)&&i<L.length;i++){const t=L[i],d=dirC(HC(t.x,t.y),vCtr(v)),mid=ax(step(t,d)),pd=AXD[(d+2)%6],half=Math.floor(c.len/2);
        for(let j=0;j<c.len;j++){const{x,y}=off(mid.q+pd[0]*(j-half),mid.r+pd[1]*(j-half)),k=x+','+y;
          if(inB(x,y)&&!blocked(x,y)&&!made.includes(k))made.push(k)}}
      await Promise.all(made.map(k=>{const[x,y]=k.split(',').map(Number);return A.smoke(HC(x,y),3)}));
      made.forEach(k=>sd.walls.push({k,ttl:c.ttl}));fxV('BUILD!','say');log('vill',`${c.n}: ${made.length} wall hexes rise from the floor.`);break}
    case 'hazard':{const ts=live().slice().sort((a,b)=>dV(a,v)-dV(b,v)).slice(0,c.cnt||1),ks=new Set();
      ts.forEach(t=>hexesWithin(t,c.r).forEach(({x,y})=>{const k=x+','+y;if(sd.obs.includes(k)||inV(v,x,y))return;ks.add(k)}));
      await Promise.all(ts.map(t=>A.ring(ctrU(t),COL.innate,c.r*2+1.4,{count:2})));
      const dm=dmgScale(c.dmg);ks.forEach(k=>{const e=sd.haz.find(h=>h.k===k);if(e){e.ttl=Math.max(e.ttl,c.ttl);e.dmg=Math.max(e.dmg,dm)}else sd.haz.push({k,ttl:c.ttl,dmg:dm})});
      ts.forEach(t=>fxU(t,'HOT!','vhit'));log('vill',`${c.n}: ${ks.size} hexes turn molten. Get off them before the villain acts again.`);break}
    case 'cage':{const t=pickTarget('nearest');if(!t)break;const made=[];for(const{x,y}of nbrs(t)){if(!blocked(x,y))made.push(x+','+y)}
      await Promise.all(made.map(k=>{const[x,y]=k.split(',').map(Number);return A.smoke(HC(x,y),2)}));made.forEach(k=>sd.walls.push({k,ttl:c.ttl}));
      fxU(t,'CAGED!','vhit');log('vill',`${c.n} boxes in ${heroOf(t).name}.`);break}
    case 'shrapnel':{const tiles=[...sd.walls.map(w=>w.k),...sd.obs].map(k=>{const[x,y]=k.split(',').map(Number);return {k,x,y}}).filter(p=>dV(p,v)<=c.r);
      if(!tiles.length){log('vill',`${c.n}: nothing nearby to blow up.`);fxV('TCH!','say');break}
      await Promise.all(tiles.map(p=>A.ring(HC(p.x,p.y),COL.innate,1.8)));
      const hit=live().filter(u=>tiles.some(p=>cheb(p,u)<=1));sd.walls=sd.walls.filter(w=>!tiles.some(p=>p.k===w.k));render();
      log('vill',`${c.n}: ${tiles.length} piles explode.`);for(const u of hit)await vHit(u,dmgScale(c.dmg),c.n,'none');break}
    case 'fortify':{const made=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(dV({x,y},v)!==1||blocked(x,y))continue;made.push(x+','+y)}
      await Promise.all(made.map(k=>{const[x,y]=k.split(',').map(Number);return A.smoke(HC(x,y),2)}));made.forEach(k=>sd.walls.push({k,ttl:c.ttl}));
      if(v.wounds.length){v.deck.push(v.wounds.pop());shuffle(v.deck)}fxV('FORTIFIED!','vhit');log('vill',`${vn} walls itself in and recovers a page.`);break}
    case 'beam':{const L=live();if(!L.length)break;const near=pickTarget('nearest');let lines=[];
      if(c.pat==='star'){faceTo(near);lines=[0,1,2,3,4,5].map(d=>({from:emitCell(v,d),d}))}
      else if(c.pat==='fan'){faceTo(near);const f=v.face;lines=[f,(f+1)%6,(f+5)%6].map(d=>({from:emitCell(v,d),d}))}
      else if(c.pat==='aim'){const ts=L.slice().sort((a,b)=>dV(a,v)-dV(b,v));lines=(c.tgt==='farthest'?ts.reverse():ts).slice(0,c.cnt||1).map(t=>aimLine(v,t));v.face=lines[0].d}
      else if(c.pat==='prism'){const ps=sd.hench.filter(m=>m.owner===sd.vkey);
        if(!ps.length){log('vill',`${c.n}: no ${VILLAINS[sd.vkey].hench.name.toLowerCase()}s left, so ${vn} fires himself.`);lines=[aimLine(v,near)];v.face=lines[0].d}
        else lines=ps.map(m=>aimLine(m,L.slice().sort((a,b)=>cheb(a,m)-cheb(b,m))[0]))}
      else if(c.pat==='sweep'){faceTo(near);const hit=new Set(),f=v.face;
        for(let i=0;i<(c.cnt||4)&&!sd.result;i++){const d=(f+i)%6;v.face=d;render();await sleep(FAST?0:160);await fireBeams([{from:emitCell(v,d),d}],dmgScale(c.dmg),c.n,{hit,ttl:c.ttl})}break}
      fxV('WHIRR!','say');render();await sleep(FAST?0:220);await fireBeams(lines,dmgScale(c.dmg),c.n,{ttl:c.ttl});break}
    case 'charge':{const z=chargeZone(c.zone);sd.v.charge={n:c.n,dmg:dmgScale(c.dmg),zone:z,w0:v.wounds.length,need:chargeNeed(v)};render();
      await A.ring(ctrV(),COL.yel,4,{inward:true,count:3});fxV('CHARGING…','say');log('vill',`${vn} begins charging ${c.n}! ${z.length} hexes are marked. Tear ${chargeNeed(v)} pages or get clear before it fires.`);break}
    case 'reanimate':{await A.ring(ctrV(),COL.mag,3,{inward:true,count:2});let n=0;for(let i=0;i<(c.heal||1)&&v.wounds.length;i++){v.deck.push(v.wounds.pop());n++}if(n){shuffle(v.deck);fxV('ZZZAP!','vhit');log('vill',`${vn} recovers ${n} torn page${n>1?'s':''}.`)}else log('vill',`${vn} has nothing to recover.`);break}
    case 'swallow':{const hn=VILLAINS[sd.vkey].hench.name.toLowerCase(),food=()=>[...sd.civs.map(o=>({o,k:'c'})),...sd.hench.map(o=>({o,k:'m'}))].sort((a,b)=>cheb(a.o,v)-cheb(b.o,v));let ate=0;
      for(let n=0;n<(c.cnt||1)&&!sd.result;n++){const F=food()[0];if(!F)break;faceTo(F.o);await vMove(()=>vToward(F.o,n?2:c.mv,1),0,c.n);
        const what=F.k==='c'?'a civilian':`a ${hn}`;
        if(cheb(F.o,v)>1){log('vill',`${vn} slithers after ${what} but can't reach.`);fxP(F.o.x,F.o.y,'EEK!','miss');break}
        faceTo(F.o);const prot=F.k==='c'&&live().find(u=>cheb(u,F.o)<=1);
        if(prot){A.lunge('v'+sd.vi,ctrU(prot));log('hero',`${heroOf(prot).name} shoves the civilian clear and takes the bite for ${dmgScale(c.dmg)}.`);
          if(!await wardBlocks(prot)){await A.shield(ctrU(prot),COL.yel);fxU(prot,'CHOMP!','vhit');damageHero(prot,dmgScale(c.dmg))}render();break}
        A.lunge('v'+sd.vi,ctrU(F.o));await A.ring(ctrU(F.o),COL.mag,1.6,{inward:true,count:2});fxP(F.o.x,F.o.y,'GULP!','vhit');
        if(F.k==='c'){sd.civs=sd.civs.filter(o=>o!==F.o);sd.harmed++}else sd.hench=sd.hench.filter(o=>o!==F.o);
        ate++;v.ate=(v.ate||0)+1;const grew=serpGrow(v);render();
        log('vill',`${vn} swallows ${what} whole! ${grew?`It grows to ${vCells(v).length+(v.grow||0)} hexes long.`:'It is too long to grow any more, so it recovers a torn page instead.'}`)}
      if(!ate&&!food().length){const t=pickTarget('nearest');if(!t)break;log('vill',`Nothing left to eat. ${vn} turns on the heroes.`);await vMove(()=>vToward(t,c.mv,1),0,c.n);
        if(dV(t,v)<=1)await vHit(t,dmgScale(c.dmg),c.n,'slash');else fxV('HSSS!','say')}break}
    case 'pull':{const t0=pickTarget('nearest');if(t0)faceTo(t0);await A.ring(ctrV(),COL.cyan,c.r*2+2,{inward:true,count:3});const ts=live().filter(u=>!u.anchor&&dV(u,v)<=c.r).sort((a,b)=>dV(a,v)-dV(b,v));let moved=0;
      for(const u of ts){let n=0;for(let i=0;i<c.mv;i++){const fr=p=>sideOf(p,v)==='front'?0:1,t=freeTiles((x,y)=>cheb({x,y},u)===1).sort((a,b)=>dV(a,v)-dV(b,v)||fr(a)-fr(b))[0];if(!t||dV(t,v)>=dV(u,v))break;u.x=t.x;u.y=t.y;n++}if(n){moved++;fxU(u,'CLANK!','vhit')}}
      render();await sleep(FAST?0:320);log('vill',`${c.n}: ${moved?`${moved} hero${moved>1?'es are':' is'} dragged toward ${vn}.`:'nobody is close enough to feel it.'}`);
      await sweep(1,dmgScale(c.dmg),c.n);break}
    case 'repel':{await A.ring(ctrV(),COL.cyan,c.r*2+2,{count:3});const ts=live().filter(u=>!u.anchor&&dV(u,v)<=c.r).sort((a,b)=>dV(b,v)-dV(a,v)),dm=dmgScale(c.dmg);
      if(!ts.length)log('vill',`${c.n}: nobody is close enough to throw.`);
      for(const u of ts){let n=0,slam=false;for(let i=0;i<c.mv;i++){const t=freeTiles((x,y)=>cheb({x,y},u)===1).sort((a,b)=>dV(b,v)-dV(a,v))[0];if(!t||dV(t,v)<=dV(u,v)){slam=true;break}u.x=t.x;u.y=t.y;n++}
        render();await sleep(FAST?0:180);const hn=heroOf(u).name;
        if(slam){if(await wardBlocks(u))continue;fxU(u,'SLAM!','vhit');damageHero(u,dm);log('vill',`${hn} is flung ${n} hex${n===1?'':'es'} and slams into something for ${dm}.`)}
        else{fxU(u,'WHOOSH!','miss');log('vill',`${hn} is flung ${n} hexes away.`)}}
      render();break}
    case 'fade':{const L=live();let best=null,bs=-1e9;for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!vFits(x,y,true))continue;const d=L.length?Math.min(...L.map(u=>cheb(u,{x,y}))):3,s=-Math.abs(d-3)+Math.random()*.9;if(s>bs){bs=s;best=[x,y]}}
      await A.smoke(ctrV(),9);if(best){v.x=best[0];v.y=best[1]}v.face=rnd(6)-1;v.hide=true;noFlip.add('v'+sd.vi);render();await A.smoke(ctrV(),6);
      if(c.amt){L.forEach(u=>{const h=heroOf(u);h.comp=Math.max(0,h.comp-c.amt);fxU(u,'?!','vhit')});log('vill',`The lights die. Every hero loses ${c.amt} composure.`)}
      fxV('…','miss');log('vill',`${vn} fades into the dark and reappears somewhere else. Her facing is hidden.`);break}
    case 'converge':{const t=pickTarget('nearest');if(!t)break;if(!v.sw){await vMove(()=>vToward(t,c.mv,1));if(dV(t,v)<=1)await vHit(t,dmgScale(c.dmg),c.n,'slash');break}
      const os=JSON.stringify([v.x,v.y,v.sw]);swBodies(v).forEach(b=>swStep(v,b.i,t,c.mv,1,-1));faceTo(t);if(JSON.stringify([v.x,v.y,v.sw])!==os){render();await sleep(FAST?0:420)}
      const adj=swBodies(v).filter(b=>cheb(b,t)===1).length;
      if(!adj){log('vill',`${vn} swarms toward ${heroOf(t).name} but can't close in.`);fxV('BZZ!','say');break}
      await vHit(t,dmgScale(c.dmg)*adj,`${c.n} (${adj} bod${adj>1?'ies':'y'})`,'slash');break}
    case 'scatter':{const L=live().slice().sort((a,b)=>heroOf(a).hp-heroOf(b).hp);if(!L.length)break;if(!v.sw){const t=L[0];await vMove(()=>vToward(t,3,1));if(dV(t,v)<=1)await vHit(t,dmgScale(c.dmg),c.n,'slash');break}
      await A.smoke(ctrV(),9);const pairs=[];
      swBodies(v).forEach((b,j)=>{const t=L[j%L.length],sp=freeTiles((x,y)=>cheb({x,y},t)===1).sort((a,c2)=>Math.min(...swBodies(v).filter(o=>o.i!==b.i).map(o=>cheb(c2,o)))-Math.min(...swBodies(v).filter(o=>o.i!==b.i).map(o=>cheb(a,o))))[0];
        if(sp){swSet(v,b.i,sp.x,sp.y,dirC(HC(sp.x,sp.y),HC(t.x,t.y)));noFlip.add(`v${sd.vi}s${b.i}`);pairs.push([b.i,t])}});
      noFlip.add('v'+sd.vi);render();fxV('BZZZT!','say');log('vill',`${vn} bursts into ${pairs.length} pieces that land beside the heroes.`);
      for(const [i,t] of pairs){if(sd.result||t.ko)continue;const b=swBodies(v)[i];if(!b||cheb(b,t)>1)continue;await vHit(t,dmgScale(c.dmg),`${c.n} (${SWN[b.k]})`,'slash')}break}
    case 'puppet':{const L=live();if(!L.length)break;const u=L.sort((a,b)=>heroOf(a).comp-heroOf(b).comp)[0],h=heroOf(u);
      await Promise.all([A.bolt(ctrV(),ctrU(u),COL.magic,true),A.bolt(ctrV(),ctrU(u),COL.magic,true)]);h.comp=Math.max(0,h.comp-(c.amt||1));u.dazed=true;fxU(u,'?!','vhit');
      log('vill',`${h.name}'s limbs stop obeying. They can't move next round.`);break}
    case 'leap':{let n=0;const done=[];
      for(let i=0;i<(c.cnt||1)&&!sd.result;i++){const L=live().filter(u=>!done.includes(u)&&dV(u,v)<=c.mv).sort((a,b)=>dV(a,v)-dV(b,v));let t=null,sp=null;
        for(const u of L){const s=leapSpot(u);if(s){t=u;sp=s;break}}
        if(!t)break;done.push(t);const lit=c.fuse&&dropBomb(t.x,t.y,c.fuse,dmgScale(c.dmg));await vLeap(t,sp);n++;
        if(lit)fxU(t,'TSSS!','vhit');log('vill',`${vn} vaults over ${heroOf(t).name}${lit?' and leaves a lit bomb at their feet':''}.`);render()}
      if(!n){const t=pickTarget('nearest');if(!t)break;log('vill',`Nobody close enough has open ground behind them, so ${vn} bounds toward ${heroOf(t).name}.`);await vMove(()=>vToward(t,c.mv,1));
        if(c.fuse&&dV(t,v)<=3){await A.throw(ctrV(),ctrU(t),'bomb');if(dropBomb(t.x,t.y,c.fuse,dmgScale(c.dmg))){fxU(t,'TSSS!','vhit');log('vill',`She tosses the bomb at ${heroOf(t).name} instead.`)}}else fxV('TCH!','say')}
      render();break}
    case 'bomb':{const inR=()=>{const L=live().filter(u=>dV(u,v)<=c.rng).sort((a,b)=>dV(a,v)-dV(b,v));return c.tgt==='farthest'?L.reverse():L};let ts=inR();
      if(!ts.length){const t=pickTarget('nearest');if(t)await vMove(()=>vToward(t,2,c.rng));ts=inR()}
      ts=ts.slice(0,c.cnt||1);if(!ts.length){log('vill',`${c.n}: nobody in range to throw at.`);fxV('TCH!','say');break}
      faceTo(ts[0]);render();const got=[];
      for(const t of ts){await A.throw(ctrV(),ctrU(t),'bomb');if(dropBomb(t.x,t.y,c.fuse,dmgScale(c.dmg))){got.push(t);fxU(t,'TSSS!','vhit')}render()}
      log('vill',got.length?`${c.n}: ${got.length>1?`${got.length} lit bombs land`:'a lit bomb lands'} at ${got.map(t=>heroOf(t).name).join(' and ')}'s feet. ${c.fuse} villain turn${c.fuse>1?'s':''} to get clear.`:`${c.n}: she is out of bombs, ${BOMB_MAX} are already lit.`);break}
    case 'detonate':{const L=(sd.bombs||[]).slice();await A.ring(ctrV(),COL.yel,3,{inward:true,count:2});
      if(!L.length){fxV('CLICK…','miss');log('vill',`${vn} squeezes the detonator, but there are no bombs left to blow.`);break}
      log('vill',`${vn} hits the switch. ${L.length>1?`${L.length} bombs go`:'A bomb goes'} off at once!`);await blowBombs(L,c.dmg||0);break}
    case 'airburst':{const m=N>>1,sp=hexesWithin({x:m,y:m},2).sort((a,b)=>cheb(a,{x:m,y:m})-cheb(b,{x:m,y:m})).find(p=>(p.x===v.x&&p.y===v.y)||vFits(p.x,p.y,true));
      if(sp&&(sp.x!==v.x||sp.y!==v.y)){fxV('BOING!','say');vPut(v,sp.x,sp.y);render();await sleep(FAST?0:RM?60:360)}
      {const t=pickTarget('nearest');if(t)faceTo(t)}const z=chargeZone(c.zone);sd.v.charge={n:c.n,dmg:dmgScale(c.dmg),zone:z,w0:v.wounds.length,need:chargeNeed(v)};render();
      await A.ring(ctrV(),COL.yel,4,{inward:true,count:3});fxV('CHARGING…','say');log('vill',`${vn} lands in the middle of the room and starts the countdown on ${c.n}. ${z.length} hexes are marked. Tear ${chargeNeed(v)} pages or get clear before it fires.`);break}
  }}
/* Payload leaps clear over a hero, past anything in between, onto the hex straight behind them or one of the two beside it */
function leapSpot(t){const v=S.sd.v,d=dirC(vCtr(v),HC(t.x,t.y));return [d,(d+1)%6,(d+5)%6].map(e=>step(t,e)).find(p=>!(p.x===v.x&&p.y===v.y)&&vFits(p.x,p.y,true))||null}
async function vLeap(t,sp){const sd=S.sd,v=sd.v;A.lunge('v'+sd.vi,ctrU(t));fxV('BOING!','say');await sleep(FAST?0:160);
  vPut(v,sp.x,sp.y);v.face=dirC(HC(t.x,t.y),HC(sp.x,sp.y));render();await sleep(FAST?0:RM?60:380);fxV('HUP!','say')}
/* a meal adds a segment behind the tail, or on its next step if the tail is boxed in; past the cap it heals a page instead */
const SERP_MAX=9;
function serpGrow(v){if(v.body.length+1+(v.grow||0)>=SERP_MAX){if(v.wounds.length){v.deck.push(v.wounds.pop());shuffle(v.deck)}return false}
  const cs=vCells(v),tail=cs[cs.length-1],t=nbrs(tail).filter(p=>!blocked(p.x,p.y)).sort((a,b)=>cheb(b,v)-cheb(a,v))[0];
  if(t)v.body.push(t);else v.grow=(v.grow||0)+1;return true}
async function sweep(r,dmg,label){const sd=S.sd,v=sd.v;A.lunge('v'+sd.vi,ctrV());await A.ring(ctrV(),COL.mag,r*2+2.4);const hit=live().filter(u=>dV(u,v)<=r);
  if(!hit.length)log('vill',`${label} hits only rubble.`);for(const u of hit)await vHit(u,dmg,label,'none');
  sd.civs.filter(c=>dV(c,v)<=r).forEach(c=>harmCiv(c,label))}
/* Version 84 (Tyler): henchman damage scales half as fast as villain damage, +1 every 4 levels of the villain they serve */
/* Version 86 (Tyler): special henchmen. A villain with an elite brings one from level 3. Health 2 + level, evasion 9 + half the level,
   +4 to hit, damage 1 + half the level (twice as fast as normal henchmen). Taking one down is worth 1 of that villain's salvage.
   The Cantor's Made Man is a bodyguard: while he stands next to her he takes the first hit of every hero attack on her. */
const eliteOf=k=>VILLAINS[k].elite||null;
const hName=hm=>hm.elite?eliteOf(hm.owner||S.sd.vkey).name:'the '+VILLAINS[hm.owner||S.sd.vkey].hench.name.toLowerCase();
function mkElite(o,t){const L=o.v.level;return {id:'e_'+o.key,owner:o.key,x:t.x,y:t.y,hp:henchHp(2+L),elite:1}}
/* Version 107 (Tyler): Hive Jammer takes 1 health off every henchman, down to 1 */
const henchHp=n=>S.facilities.includes('jammer')?Math.max(1,n-1):n;
const eliteEva=hm=>9+Math.floor(henchLv(hm)/2);
function henchLv(hm){const sd=S.sd,o=sd.vl.find(o=>o.key===(hm.owner||sd.vkey));return o?o.v.level:sd.v.level}
/* Version 89 (Tyler): three more special henchmen. Gallows' Failed Experiment is slow (moves 2), hits 1 harder and shrugs off the first hit
   each round. Ouroboros' High Priest attacks from range 3 and raises a fallen Cultist each round while fewer than 2 remain. The Architect's
   Foreman throws up a wall next to the hero closest to the Architect each round (it lasts 2 rounds). */
function henchDmg(hm){if(hm.elite)return 1+Math.floor(henchLv(hm)/2)+(eliteOf(hm.owner||S.sd.vkey).brute?1:0);const sd=S.sd,o=sd.vl.find(o=>o.key===(hm.owner||sd.vkey)),lv=o?o.v.level:sd.v.level;return 1+Math.floor(lv/4)}
async function henchAct(hm){const sd=S.sd,L=live();if(!L.length)return;const def=hm.elite?eliteOf(hm.owner||sd.vkey):VILLAINS[hm.owner||sd.vkey].hench;
  if(hm.elite&&def.guard){const o=sd.vl.find(o=>o.key===hm.owner&&!o.v.down);if(o&&dV(hm,o.v)>1){const opts=reach(hm,3,hm);let best=null,bd=1e9;
    for(const k in opts){const[x,y]=k.split(',').map(Number);if(dV({x,y},o.v)!==1)continue;const d=Math.min(...L.map(u=>cheb(u,{x,y})));if(d<bd){bd=d;best=[x,y]}}
    if(best){hm.x=best[0];hm.y=best[1];render();await sleep(300)}}
    const adj=L.filter(u=>cheb(u,hm)<=def.rng);if(o&&!adj.length)return}
  else if(!hm.elite&&await henchGrab(hm))return;
  if(hm.elite)await eliteTurn(hm,def,L);if(sd.result||!sd.hench.includes(hm))return;
  let t=L.slice().sort((a,b)=>cheb(a,hm)-cheb(b,hm))[0];
  if(cheb(t,hm)>def.rng){const opts=reach(hm,def.mv||3,hm);let best=null,bd=cheb(t,hm);
    for(const k in opts){const[x,y]=k.split(',').map(Number);const d=cheb(t,{x,y});if(d<bd||(d===bd&&best&&Math.random()<.3)){bd=d;best=[x,y]}}
    if(best){hm.x=best[0];hm.y=best[1];render();await sleep(300)}}
  if(cheb(t,hm)<=def.rng&&!shotBlocked(hm,t)){await strikeAnim(def.style,ctrU(hm),ctrU(t),COL.grey,'m'+hm.id);
    const h=heroOf(t),r=luckUp(t)?Math.min(d20(),d20()):d20(),eva=stat(h,'eva')+(t.buffEva||0)+(t.evaNext||0);if(t.evaNext){log('hero',`Wind Ward: +${t.evaNext} evasion for ${h.name}.`);t.evaNext=0};const ha=(setOn(h,'swarm')?-2:2)+(hm.elite?2:0),hit=r===20||(r!==1&&r+ha>=eva);
    log('vill',`${def.name} attacks ${h.name}: ${r}${ha<0?'−'+(-ha):'+'+ha} vs ${eva}. ${hit?`Hit for ${henchDmg(hm)}.`:'Miss.'}`);
    if(hit&&!await wardBlocks(t)){fxU(t,def.rng>1?'PEW!':'THUD!','vhit');damageHero(t,henchDmg(hm))}else if(!hit)fxU(t,'SWISH!','miss')}}
/* Version 91 (Tyler): the Foreman's girders block shots (any attack at range 2+ whose hex line crosses one) and topple onto an adjacent hero
   when they come down two villain turns later, for 2 + half the Architect's level. */
function hexLine(a,b){const A=ax(a),B=ax(b),n=cheb(a,b),out=[];const ac={q:A.q+1e-6,r:A.r+1e-6},bc={q:B.q+1e-6,r:B.r+1e-6};
  for(let i=1;i<n;i++){const t=i/n,q=ac.q+(bc.q-ac.q)*t,r=ac.r+(bc.r-ac.r)*t,s=-q-r;let rq=Math.round(q),rr=Math.round(r),rs=Math.round(s);
    const dq=Math.abs(rq-q),dr=Math.abs(rr-r),ds=Math.abs(rs-s);if(dq>dr&&dq>ds)rq=-rr-rs;else if(dr>ds)rr=-rq-rs;out.push(off(rq,rr))}return out}
function shotBlocked(a,b){const sd=S.sd;if(cheb(a,b)<=1||!sd.walls.some(w=>w.girder))return false;return hexLine(a,b).some(p=>sd.walls.some(w=>w.girder&&w.k===p.x+','+p.y))}
const shotVB=(u,v)=>vCells(v).every(c=>shotBlocked(u,c));
async function eliteTurn(hm,def,L){const sd=S.sd,o=sd.vl.find(o=>o.key===hm.owner&&!o.v.down);if(!o)return;
  if(def.priest&&sd.hench.filter(m=>!m.elite&&m.owner===hm.owner).length<2){const t=freeTiles((x,y)=>cheb({x,y},hm)===1)[0];
    if(t){sd.hench.push({id:'p'+Date.now(),owner:hm.owner,x:t.x,y:t.y,hp:henchHp(2)});await A.smoke(HC(t.x,t.y),3);fxP(t.x,t.y,'RISE!','say');log('vill',`${def.name} chants, and a fallen ${VILLAINS[hm.owner].hench.name.toLowerCase()} rises again.`);render()}}
  if(def.foreman){const near=L.slice().sort((a,b)=>dV(a,o.v)-dV(b,o.v))[0];const t=near&&freeTiles((x,y)=>cheb({x,y},near)===1&&dV({x,y},o.v)<dV(near,o.v))[0];
    if(t){sd.walls.push({k:t.x+','+t.y,ttl:2,girder:1,dmg:2+Math.floor(henchLv(hm)/2)});await A.smoke(HC(t.x,t.y),3);fxP(t.x,t.y,'CLANG!','say');log('vill',`${def.name} bolts a girder into place in front of ${heroOf(near).name}. It blocks shots, and it will topple in 2 turns.`);render()}}}
function drawTactic(){const sd=S.sd,k=sd.vkey,v=sd.v;sd.tdk=sd.tdk||{};
  for(let g=0;g<60;g++){if(!sd.tdk[k]||!sd.tdk[k].length)sd.tdk[k]=shuffle([...(VILLAINS[k].tact?TACT.filter(t=>VILLAINS[k].tact.includes(t.id)):TACT),...VINTEL[k].react.filter(r=>rxLive(v,r)).map(r=>({...r,sig:k}))]);
    const tc=sd.tdk[k].shift();if(tc.sig&&!rxLive(v,rxOf(k,tc.id)))continue;if(tc.sig)markSeenR(k,tc.id);return tc}
  return TACT[TACT.length-1]}
function benchTile(u,v,fn){return freeTiles((x,y)=>cheb({x,y},u)===1).sort(fn)[0]}
function woundV(){const sd=S.sd,v=sd.v;if(v.down)return true;if(!v.deck.length&&v.discard.length){v.deck=shuffle(v.discard);v.discard=[]}
  if(v.deck.length)v.wounds.push(v.deck.shift());
  if(!v.deck.length&&!v.discard.length){v.down=true;v.charge=null;
    if(sd.vl.every(o=>o.v.down)){endSd('win');return true}
    fxV('DEFEATED!','hit');log('sys',`${VILLAINS[sd.vkey].name} is down! Finish the other one.`);focusV(sd.vl.findIndex(o=>!o.v.down));return true}
  return false}
async function heroAttack(u,target,bonus=0,fixedDice=0,style){const sd=S.sd,h=heroOf(u),v=sd.v,b=BASE(h);
  if(letGo(u,'lets go of the civilians to fight.'))render();
  const aim=sd.aim,body=target==='v'&&v.sw?(aim&&swBodies(v).find(o=>o.x===aim.x&&o.y===aim.y&&cheb(u,o)<=stat(h,'range'))||swNear(v,u)):null;sd.aim=null;
  const side=target==='v'?sideOf(u,v,body):null,blind=side==='rear';if(blind){fxU(u,'BLIND SPOT!','good');log('hero',`${h.name} strikes from the blind spot: +1 die.`)}
  /* Version 113 (Tyler): side/rear bonus dice (Backstab, Frenzy, From the Shadows) only work in melee */
  const melee=target==='v'&&(body?cheb(u,body):dV(u,v))<=1,back=target==='v'&&side!=='front'&&melee?(u.buffBack||0)+(setOn(h,'noct')?1:0):0,call=target==='v'?(v.callout||0):0;if(call){v.callout=0;log('hero',`Callout: +${call} ${call===1?'die':'dice'} on this attack.`)}if(back)log('hero',`${h.name} strikes from the ${ARCN[side]} arc: +${back} more.`);
  const turret=setOn(h,'grid')&&!u.moved?1:0;if(turret)log('hero',`Turret Stance: ${h.name} hasn't moved yet, +1 die.`);
  const rel=target==='v'&&!u.noRel&&gearHas(h,'relent')&&u.relKey===sd.vkey?Math.min(1,u.relN||0):0;if(rel)log('hero',`Relentless: +${rel} ${rel===1?'die':'dice'} for keeping up the pressure.`);if(target==='v'&&!u.noRel)u.relHit=sd.vkey;
  const dice=(fixedDice||stat(h,'speed')+bonus)+(u.buffDice||0)+(target==='v'&&v.marked&&side!=='front'?1:0)+(blind?1:0)+back+call+turret+rel,strB=u.buffStr||0,accB=u.buffAcc||0,reap=target==='v'?(u.buffReap||0):0;u.buffDice=0;u.buffStr=0;u.buffAcc=0;u.buffBack=0;if(target==='v')u.buffReap=0;
  const acc=stat(h,'acc')+accB,rolls=[];let hits=0,wounds=0;
  await strikeAnim(style||b.fx,ctrU(u),target==='v'?(body?HC(body.x,body.y):ctrV()):ctrU(target),b.glow,'h'+u.hid);
  if(target==='v'){const eva=vStat('eva');
    for(let i=0;i<dice;i++){const r=d20();rolls.push(r);if(r===20||(r!==1&&r+acc>=eva))hits++}
    log('hero',`${h.name} attacks: rolled ${rolls.join(', ')} (+${acc}) vs evasion ${eva}. ${hits} hit${hits===1?'':'s'}.`);
    {const gm=hits?sd.hench.find(m=>m.elite&&m.owner===sd.vkey&&m.hp>0&&eliteOf(m.owner).guard&&dV(m,v)<=1):null;
      if(gm){hits--;gm.hp--;gm.hurtAt=Date.now();fxP(gm.x,gm.y,gm.hp<=0?'K.O.!':'BLOCKED!','hit');log('vill',`${eliteOf(gm.owner).name} steps in front of ${VILLAINS[sd.vkey].short} and takes the first hit.${gm.hp<=0?' He goes down.':''}`);if(gm.hp<=0)sd.hench=sd.hench.filter(m=>m!==gm);render()}}
    if(!hits){fxV('WHIFF!','miss');render();return}
    if(v.hide){v.hide=false;fxU(u,'GOTCHA!','good');log('hero',`${h.name} lands a hit and reads her stance. ${VILLAINS[sd.vkey].short}'s facing is revealed.`)}
    const ranged=dV(u,v)>1,close=body&&swBodies(v).some(o=>o.i!==body.i&&cheb(o,body)===1);
    if(body)log('hero',`${h.name} strikes the ${SWN[body.k].toLowerCase()} body from its ${ARCN[side]} arc.${close?' Another body is right beside it: +2 toughness.':''}`);
    let counter=0,flee=false,drain=0,summon=0,push=0,wall=false,pull=0,hide=false,bombAt=0,fuseTick=false,reflect=0,flash=false;const rows=[],q={splash:[]};
    for(let i=0;i<hits&&!sd.result;i++){let tc=drawTactic();if(tc.sig)tc={...tc,...rxOf(tc.sig,tc.id)};const okArc=!tc.arc||tc.arc.includes(side),okRng=!tc.ranged||ranged,okPart=!tc.part||(body&&body.k===tc.part),inArc=okArc&&okRng&&okPart;
      const why=!tc.sig?'':!okPart?`${h.name} hit the ${body?SWN[body.k].toLowerCase():''} body, not the ${SWN[tc.part].toLowerCase()}, so it does nothing.`:!okRng?`${h.name} is adjacent, and it only answers ranged attacks.`:tc.ranged&&okArc?`${h.name} attacked from range: it triggers!`:'';
      const note=why||(tc.arc&&side?`${h.name} struck from the ${ARCN[side]} arc: ${inArc?'it triggers!':'wrong side, it does nothing.'}`:'');
      if(tc.sig&&!inArc){log('hero',why||`${tc.n} only works in the ${arcTxt(tc.arc)}. ${h.name} is in the ${ARCN[side]} arc, so it does nothing.`);fxU(u,!okPart?'WRONG BODY!':!okRng?'TOO CLOSE!':'WRONG SIDE!','good')}
      let tough=vStat('tough')+(close?2:0),auto=false,block=false,blockTxt='A civilian is in the way.';
      if(tc.sig&&inArc){if(tc.auto)auto=true;tough+=(tc.tough||0)+(tc.gorge?2*Math.min(3,v.ate||0):0);if(tc.dmg&&(!tc.adj||dV(u,v)<=1))counter+=tc.dmg;drain+=tc.comp||0;summon+=tc.summon||0;if(tc.escape)flee=true;if(tc.push&&(!tc.adj||dV(u,v)<=1))push=Math.max(push,tc.push);if(tc.pull)pull=Math.max(pull,tc.pull);if(tc.hide)hide=true;if(tc.wall)wall=true;if(tc.bomb)bombAt=Math.max(bombAt,tc.bomb);if(tc.fuse)fuseTick=true;if(tc.reflect)reflect=Math.max(reflect,tc.reflect);if(tc.flash)flash=true;
        if(tc.guard&&sd.hench.some(hm=>dV(hm,v)<=1)){block=true;blockTxt='A henchman takes the blow.'}}
      else if(!tc.sig){if(tc.id==='weak')auto=true;if(tc.id==='armor')tough+=4;if(tc.id==='over')tough-=4;if(tc.id==='counter')counter+=2;
      if(tc.id==='shield'&&sd.civs.some(c=>dV(c,v)<=2))block=true;if(tc.id==='escape')flee=true}
      const r=d20(),str=stat(h,'str')+strB,ok=!block&&(auto||r===20||(r!==1&&r+str>=tough));
      const rollTxt=block?blockTxt:auto?`${tc.sig?tc.n:'Weak point'}: the wound lands.`:`Wound roll ${r} + ${str} vs toughness ${tough}.`;
      log('hero',`${tc.n}: ${rollTxt} ${ok?'Wound!':block?'':'No wound.'}`);
      const rw={tc,note,off:tc.sig&&!inArc,auto,block,blockTxt,r,str,tough,ok};rows.push(rw);
      if(ok){wounds++;sd.woundsBy[h.id]=(sd.woundsBy[h.id]||0)+1;if(tc.id==='mono')h.comp=Math.min(stat(h,'maxComp'),h.comp+1);
        q.page=null;const end=await woundAnim(`${h.name}: ${rollTxt}`,q);rw.page=q.page;if(end)break}}
    await attackPanel({name:h.name,acc,eva,rolls,hits,rows});
    fxV(wounds>=3?'KA-BOOM!':wounds?pick(SFX_HIT):rows.some(o=>o.block)?'NO!':'CLANG!',wounds?'hit':'miss');render();
    await breakStack(q.splash);
    if(wounds&&setOn(h,'bomber')&&!sd.result){const hm=sd.hench.filter(m=>cheb(m,u)<=1);if(hm.length){await A.ring(ctrU(u),COL.yel,2.4);hm.forEach(m=>{m.hp-=1;m.hurtAt=Date.now();fxP(m.x,m.y,m.hp<=0?'K.O.!':'SHRAPNEL!','hit')});sd.hench=sd.hench.filter(m=>m.hp>0);log('hero',`Shrapnel: ${hm.length} henchm${hm.length===1?'an':'en'} next to ${h.name} take 1.`);render()}}
    if(counter&&!sd.result){log('vill',`Reaction! ${h.name} takes ${counter}.`);await strikeAnim('slash',ctrV(),ctrU(u),COL.mag,'v'+S.sd.vi);fxU(u,'OOF!','vhit');damageHero(u,counter);render()}
    if(drain&&!sd.result){h.comp=Math.max(0,h.comp-drain);fxU(u,'RATTLED!','vhit');log('vill',`${h.name} loses ${drain} composure.`);render()}
    if(push&&!u.ko&&u.anchor&&!sd.result){fxU(u,'ANCHORED!','good');log('hero',`${h.name} is anchored and holds firm.`)}
    if(push&&!u.ko&&!u.anchor&&!sd.result){let n=0;for(let i=0;i<push;i++){const t=benchTile(u,v,(a,b)=>dV(b,v)-dV(a,v));if(!t||dV(t,v)<=dV(u,v))break;u.x=t.x;u.y=t.y;n++}if(n){log('vill',n>1?`${h.name} is flung ${n} hexes back.`:`${h.name} is shoved back.`);render();await sleep(260)}else log('vill',`${h.name} is pinned in place and can't be shoved.`)}
    if(pull&&!u.ko&&u.anchor&&!sd.result){fxU(u,'ANCHORED!','good');log('hero',`${h.name} is anchored and holds firm.`)}
    if(pull&&!u.ko&&!u.anchor&&!sd.result){let n=0;for(let i=0;i<pull;i++){const t=benchTile(u,v,(a,b)=>dV(a,v)-dV(b,v));if(!t||dV(t,v)>=dV(u,v))break;u.x=t.x;u.y=t.y;n++}if(n){fxU(u,'YANKED!','vhit');log('vill',`${h.name} is dragged ${n} hex${n>1?'es':''} toward ${VILLAINS[sd.vkey].short}.`);render();await sleep(260)}}
    if(wall&&!sd.result){const t=benchTile(u,v,(a,b)=>dV(a,v)-dV(b,v));if(t){sd.walls.push({k:t.x+','+t.y,ttl:2});await A.smoke(HC(t.x,t.y),2);log('vill','A scaffold wall slams down.');render()}}
    for(let n=0;n<summon&&!sd.result;n++){const t=freeTiles((x,y)=>dV({x,y},v)===1)[0];if(!t)break;sd.hench.push({id:'r'+Date.now()+n,owner:sd.vkey,x:t.x,y:t.y,hp:henchHp(2)});fxP(t.x,t.y,'BACKUP!','say');log('vill',`A ${VILLAINS[sd.vkey].hench.name.toLowerCase()} joins the fight.`);render()}
    if(bombAt&&!sd.result&&!u.ko&&dropBomb(u.x,u.y,1,dmgScale(bombAt))){fxU(u,'TSSS!','vhit');log('vill',`${VILLAINS[sd.vkey].short} leaves a lit bomb at ${h.name}'s feet.`);render()}
    if(flee&&!sd.result){const was=JSON.stringify(vCells(v));await vMove(()=>vAway(u,2,{strict:true}));if(JSON.stringify(vCells(v))!==was){fxV('HA HA!','say');log('vill','The villain slips out of reach.')}else{fxV('CORNERED!','good');log('vill','The villain tries to slip away, but there is nowhere to go.')}}
    if(wounds&&!u.ko){if(reap){const n=reap*wounds;h.hp=Math.min(stat(h,'maxHp'),h.hp+n);fxU(u,`+${n} HP`,'good');log('hero',`${h.name} reaps ${n} health.`)}
      const aw=h.ranks.magic?stat(h,'arcWound'):0;if(aw&&u.res){const was=u.res.magic||0;u.res.magic=Math.min(arcMax(h),was+aw);if(u.res.magic>was)log('hero',`${h.name} draws ${u.res.magic-was} Arcana from the torn page.`)}}
    if(fuseTick&&!sd.result&&sd.bombs&&sd.bombs.length){fxV('FZZT!','say');log('vill','Short Fuse! Every bomb on the board ticks down 1.');await bombTick()}
    if(reflect&&!sd.result&&!u.ko&&!v.down){fxV('PTCHOO!','say');log('vill',`Reflector Visor! The attack bounces back at ${h.name} as a beam.`);await fireBeams([aimLine(v,u)],dmgScale(reflect),'Reflector Visor')}
    if(flash&&!sd.result){const lm=litMap(),on=live().filter(o=>lm[o.x+','+o.y]);fxV('FLASH!','say');
      if(on.length){for(const o of on){fxU(o,'ZZT!','vhit');damageHero(o,optic(1))}log('vill',`Flashback! Every lit beam pulses: ${on.map(o=>heroOf(o).name).join(', ')} take${on.length>1?'':'s'} ${optic(1)}.`);checkLoss()}
      else log('vill','Flashback! The beams pulse, but nobody is standing in one.');render()}
    if(hide&&!sd.result&&!v.down){v.hide=true;log('vill',`${VILLAINS[sd.vkey].short} melts back into the shadows. Her facing is hidden again.`);render()}
  }else{const hm=target,meva=hm.elite?eliteEva(hm):7;for(let i=0;i<dice;i++){const r=d20();rolls.push(r);if(r===20||(r!==1&&r+acc>=meva))hits++}
    if(hits&&hm.elite&&eliteOf(hm.owner||sd.vkey).brute&&hm.shrug!==sd.round){hm.shrug=sd.round;hits--;log('vill',`${hName(hm)} shrugs off the first hit this round.`)}
    hm.hp-=hits;hm.hurtAt=Date.now();log('hero',`${h.name} hits ${hName(hm)}: rolled ${rolls.join(', ')}. ${hits} damage.`);
    fxP(hm.x,hm.y,hm.hp<=0?'K.O.!':hits?pick(SFX_HIT):'WHIFF!',hits?'hit':'miss');
    if(hm.hp<=0){render();await A.smoke(ctrU(hm),4);sd.hench=sd.hench.filter(o=>o!==hm);log('hero','Henchman down.')}render()}}
async function splash(target){const sd=S.sd;const from=target==='v'?ctrV():ctrU(target);
  const near=sd.hench.filter(h=>h!==target&&(target==='v'?dV(h,sd.v)<=1:cheb(h,target)<=1));if(!near.length)return;
  await Promise.all(near.map(h=>A.bolt(from,ctrU(h),COL.magic,true)));
  near.forEach(h=>{h.hp--;h.hurtAt=Date.now();fxP(h.x,h.y,h.hp<=0?'K.O.!':'ZAP!','hit')});const dead=near.filter(h=>h.hp<=0);sd.hench=sd.hench.filter(h=>h.hp>0);
  log('hero',`Arc Burst jumps to ${near.length} henchm${near.length===1?'an':'en'}${dead.length?`, dropping ${dead.length}`:''}.`);render()}
function endSd(r){S.sd.result=r;S.sd.mode=null;S.sd.sel=null;if(r==='win')fxV('DEFEATED!','hit');
  log('sys',r==='win'?'The villain\'s playbook is empty. Victory!':r==='loss'?'Every hero is down.':'The villain escapes before you can finish it.')}
function checkLoss(){if(!S.sd.result&&!live().length)endSd('loss')}
async function villainPhase(){const sd=S.sd;if(!sd||sd.result||sd.busy)return;sd.busy=true;sd.vturn=true;sd.mode=null;sd.sel=null;render();await sleep(250);
  beamTick();await hazardTick();checkLoss();await bombTick();checkLoss();
  for(let i=0;i<sd.vl.length&&!sd.result;i++){if(sd.vl[i].v.down)continue;focusV(i);const v=sd.v,vn=VILLAINS[sd.vkey].name;
    if(v.skip){v.skip=false;fxV('FROZEN!','good');if(v.charge){log('hero',`Time Stop: ${vn} loses ${v.charge.n}.`);v.charge=null}
      else{if(!v.deck.length){v.deck=shuffle(v.discard);v.discard=[]}const c=v.deck.shift();if(c){markSeen(sd.vkey,c.id);v.discard.push(c);log('hero',`Time Stop: ${vn} loses its turn. ${c.n} is thrown away unplayed.`)}}render();await sleep(400)}
    else if(v.charge){await fireCharge();checkLoss()}
    else{
      if(!v.deck.length){v.deck=shuffle(v.discard);v.discard=[];log('sys',`${vn} reshuffles the playbook.`)}
      if(!v.deck.length)continue;
      const c=v.deck[0];await reveal(villainCardView(c));markSeen(sd.vkey,c.id);v.deck.shift();
      v.last=c;v.foresee=false;log('vill',`${vn} plays ${c.n}.`);fxV(c.n.toUpperCase()+'!','say');render();await sleep(300);
      await execCard(c);v.discard.push(c);if(v.sw){const r=swSync(v);r.grew.forEach(k=>log('vill',`The ${SWN[k].toLowerCase()} body re-forms and rejoins the swarm.`));if(r.grew.length)render()}}
    checkLoss();render();await sleep(300)}
  for(const hm of sd.hench.slice()){if(sd.result)break;if(!sd.hench.includes(hm))continue;await henchAct(hm);checkLoss();render();await sleep(120)}
  if(!sd.result){sd.units.forEach(civFollow);await civPanic()}
  sd.units.forEach(u=>u.guard=false);sd.vl.forEach(o=>{o.v.hex=false;o.v.marked=false;o.v.cursed=false;o.v.callout=0;o.v.blind=false;o.v.excise=0});sd.walls.forEach(w=>{if(!w.perm)w.ttl--});{const fall=sd.walls.filter(w=>w.girder&&w.ttl<=0);sd.walls=sd.walls.filter(w=>w.ttl>0);
    for(const w of fall){const[x,y]=w.k.split(',').map(Number),t=live().filter(u=>cheb(u,{x,y})===1).sort((a,b)=>heroOf(a).hp-heroOf(b).hp)[0];await A.smoke(HC(x,y),4);
      if(t){fxU(t,'CRASH!','vhit');log('vill',`A girder topples onto ${heroOf(t).name} for ${w.dmg}.`);damageHero(t,w.dmg)}else log('vill','A girder topples over and hits nobody.');render()}checkLoss()}
  focusV(sd.vl.findIndex(o=>!o.v.down));vWarn();
  if(!sd.result){sd.round++;
    {sd.units.forEach(u=>{u.stasis=false;u.moved=!!u.dazed;u.dazed=false;u.acted=false;u.freeEvac=false;u.buffDice=0;u.buffStr=0;u.buffAcc=0;u.buffBack=0;u.buffReap=0;u.buffEva=0;u.dr=0;u.anchor=false;if(u.capUsed&&!u.abRd)u.capUsed=false;u.abRd=false;u.innUsed=0;u.abUsed=[];u.jump=false;u.ripo=false;u.ripUsed=false;u.reflect=0;
        if(u.relHit){u.relN=u.relHit===u.relKey?(u.relN||0)+1:1;u.relKey=u.relHit}else{u.relN=0;u.relKey=null}u.relHit=null;
        const h=heroOf(u);u.anchor=setOn(h,'lode');if(!u.ko){if(setOn(h,'cantor'))h.comp=Math.min(stat(h,'maxComp'),h.comp+1);if(setOn(h,'serpent'))h.hp=Math.min(stat(h,'maxHp'),h.hp+1)}u.lowP=(u.res.tech||0)<=1;u.res.tech=Math.min(pwrMax(h),(u.res.tech||0)+pwrRegen(h));u.res.magic=Math.min(arcMax(h),u.res.magic||0);if(S.facilities.includes('sanctum')&&!u.ko)h.comp=Math.min(stat(h,'maxComp'),h.comp+1)});
      roster().forEach(h=>{if(h.cd>0)h.cd--});
      sd.units.forEach(u=>{const h=heroOf(u);if(u.ko||!setOn(h,'helios'))return;const hm=sd.hench.filter(m=>cheb(m,u)<=1);if(!hm.length)return;hm.forEach(m=>{m.hp-=1;m.hurtAt=Date.now();fxP(m.x,m.y,m.hp<=0?'K.O.!':'SIZZLE!','hit')});sd.hench=sd.hench.filter(m=>m.hp>0);log('hero',`Corona: ${h.name} scorches ${hm.length} henchm${hm.length===1?'an':'en'}.`)});
      {const got={mend:[],calm:[],charge:[]};sd.units.forEach(u=>{if(u.ko)return;const h=heroOf(u);
        if(auraOn(u,'mend')&&h.hp*2<=stat(h,'maxHp')){h.hp++;got.mend.push(h.name)}
        if(auraOn(u,'calm')&&h.comp*2<=stat(h,'maxComp')){h.comp++;got.calm.push(h.name)}
        if(auraOn(u,'charge')&&pwrMax(h)&&u.lowP&&(u.res.tech||0)<pwrMax(h)){u.res.tech++;got.charge.push(h.name)}});
        for(const id in got)if(got[id].length)log('hero',`${AURA_FX[id].n}: ${got[id].join(', ')} ${id==='mend'?'regain 1 health':id==='calm'?'regain 1 composure':'recharge 1 more Power'}.`)}
      log('sys',`Round ${sd.round}. Your move.`)}}
  sd.busy=false;sd.vturn=false;render()}

/* ============ AFTERMATH ============ */
function debrief(){const sd=S.sd,vs=vState(sd.vkey),def=VILLAINS[sd.vkey],L=[],res=sd.result;
  const evT=S.ethos.b==='secret'?Math.min(1,sd.evac):sd.evac,per=S.ethos.a==='force'?2:1;
  if(sd.termGot)L.push(`Evidence terminal hacked: +${sd.termGot} intel.`);
  S.trust+=evT-sd.harmed*per;L.push(`${sd.evac} civilian${sd.evac===1?'':'s'} evacuated (+${evT} trust), ${sd.harmed} harmed (−${sd.harmed*per} trust).`);
  eliteSalvage(L);
  let headline;
  if(res==='win'){const sal=3+(sd.quality==='prepared'?1:0)+fieldCount('salvage')+(S.facilities.includes('magnet')?1:0);S.salvage[sd.vkey]+=sal;S.tech++;L.push(`Salvaged ${sal} ${def.salvage} and 1 tech from the lair.`);
    {let n=0;for(const {h} of fieldGear('strip'))n+=Math.floor((sd.woundsBy[h.id]||0)/3);if(n){S.salvage[sd.vkey]+=n;L.push(`Scrapper's Hooks: +${n} ${def.salvage} stripped from the pages torn out.`)}}
    vs.beaten=(vs.beaten||0)+1;
    if(S.ethos.a==='restraint'){S.salvage[sd.vkey]++;L.push(`Restraint: +1 ${def.salvage}.`)}
    {const un=unlock(DEFEAT_UNLOCK[sd.vkey]);if(un.length)L.push(`Seized blueprints: ${un.join(', ')}.`)}
    levelUpVillain(vs);vs.scheme=0;headline='Victory!';L.push(`${def.name} escapes in the chaos and returns at level ${vs.level}.`)}
  else if(res==='loss'){S.trust-=2;const add=levelUpVillain(vs);vs.scheme=0;headline='Defeat';L.push(`The team is carried out of the lair. −2 trust. ${def.name} grows bolder (level ${vs.level}).`)}
  else{S.trust--;S.salvage[sd.vkey]++;vs.scheme=0;headline='Slipped away';L.push(`${def.name} gets away. You recover 1 ${def.salvage}. −1 trust.`)}
  if(S.facilities.includes('lab')){S.tech++;L.push('The lab reverse-engineers scraps: +1 tech.')}
  const med=S.facilities.includes('medbay'),train=S.facilities.includes('training'),xpAt=L.length,xpL=[];
  for(const u of sd.units){const h=heroOf(u);let xp=1+(train?1:0)+((sd.woundsBy[h.id]||0)>=2?1:0)+(Object.values(h.gear).some(g=>GEAR[g].field&&GEAR[g].field.id==='xp')?1:0);h.xp+=xp;xpL.push(`${h.name} +${xp}`);
    while(h.xp>=xpNeed(h)){h.xp-=xpNeed(h);h.pendingUp++;L.push(`${h.name} reaches level ${lvlOf(h)+h.pendingUp}. Choose a discipline and an upgrade in the roster. Next level needs ${xpNeed(h)} XP.`)}
    /* Version 130 (Tyler): no injury roll, careers never end, and a knocked-out hero is ready for the next issue */
    if(u.ko)h.hp=Math.ceil(stat(h,'maxHp')/2);
    else h.hp=Math.max(h.hp,Math.ceil(stat(h,'maxHp')*.6));
    /* Med Bay: half of the health still missing after normal recovery */
    if(med)h.hp+=Math.ceil((stat(h,'maxHp')-h.hp)/2);
    if(h.comp<=0&&!h.injuries.includes('rattled')){h.injuries.push('rattled');L.push(`${h.name} ended the fight with no composure and is Rattled (−1 max composure).`)}
    h.comp=stat(h,'maxComp');h.cd=0;clampHero(h)}
  if(xpL.length)L.splice(xpAt,0,`XP earned: ${xpL.join(', ')}.`);
  const mk=fieldCount('medkit');if(mk){party().forEach(h=>{h.hp=Math.min(stat(h,'maxHp'),h.hp+3*mk)});L.push(`Field Medic Kit: the party recovers ${3*mk} extra health.`)}
  finishIssue(L,{hunted:sd.vkey,headline,vkey:sd.vkey})}

/* ============ RENDER ============ */
let lastPos={};const noFlip=new Set();
/* Version 117 (Tyler): tap an empty gear slot on a hero card to pick an armory item for it */
let slotPick=null;
const handFits=(s,G)=>G.slot!=='arms'||G.two||G.hand==='either'||G.hand===(s==='arms'?'main':'off');
const slotFits=(h,s)=>{const base=s.replace(/2$/,'');return [...new Set(S.armory)].filter(g=>GEAR[g]&&!GEAR[g].cons&&GEAR[g].slot===base&&handFits(s,GEAR[g])).sort((a,b)=>wearOK(h,b)-wearOK(h,a)||GEAR[a].req-GEAR[b].req)};
function slotPickView(){if(!slotPick)return '';const h=S.heroes.find(x=>x.id===slotPick.h);if(!h||!(S.phase==='hq'||prepGear())){slotPick=null;return ''}
  const ks=slotFits(h,slotPick.s);
  return `<div id="slotpick" role="dialog" aria-modal="true" aria-label="Equip ${esc(h.name)}"><div class="gbox"><div class="eyebrow">${esc(h.name)} · ${SLOTS[slotPick.s]} slot</div><h3 style="margin:0">Equip from the armory</h3>
    ${ks.length?ks.map(g=>{const G=GEAR[g],ok=wearOK(h,g),pl=eqPlan(h,g,slotPick.s),n=S.armory.filter(x=>x===g).length;return `<button class="btn opt t-${G.type}" data-a="equip:${h.id}:${g}:${slotPick.s}" data-tip="gear:${g}" ${ok?'':'disabled'}><span>${esc(G.name)}${n>1?` ×${n}`:''}</span><small>${ok?[modsTxt(G.mods),G.ab?G.ab.n:'',pl.out.length?`swaps out ${[...new Set(pl.out)].map(o=>GEAR[o].name).join(' and ')}`:'',G.two?'two hands':''].filter(Boolean).join(' · '):`Needs ${reqTxt(G)}`}</small></button>`}).join('')
      :`<div class="cap">Nothing in the armory fits this slot. Craft one in the Workshop on the HQ tab.</div>`}
    <div class="small muted">Long-press an item for full details.</div><button class="btn" data-a="slotpick:close">Cancel</button></div></div>`}
document.addEventListener('click',e=>{if(slotPick&&e.target.id==='slotpick'){slotPick=null;render()}});
document.addEventListener('keydown',e=>{if(slotPick&&e.key==='Escape'){slotPick=null;render()}});
function render(){tutTick();guideTick();visitTick();const app=document.getElementById('app');app.innerHTML=mast()+nav()+body()+slotPickView();if(!FAST){fixDisabled(app);flip();tutPaint()}save()}
function flip(){const b=document.querySelector('.board');if(!b){lastPos={};return}const c=(b.getBoundingClientRect().width-5)/BW(),now={};
  b.querySelectorAll('[data-tid]').forEach(e=>{const id=e.dataset.tid,x=+e.dataset.cx,y=+e.dataset.cy;now[id]=[x,y];const p=lastPos[id];
    if(p&&(p[0]!==x||p[1]!==y)&&!noFlip.has(id)&&!RM){const d=Math.hypot(p[0]-x,p[1]-y);
      e.animate([{transform:`translate(${(p[0]-x)*c}px,${(p[1]-y)*c}px)`},{transform:`translate(${(p[0]-x)*c*.5}px,${(p[1]-y)*c*.5-c*.18}px)`,offset:.5},{transform:'none'}],{duration:Math.min(520,180+90*d),easing:'ease-in-out'})}});
  noFlip.clear();lastPos=now}
function mast(){return `<header class="mast"><div><small>A campaign of capes and consequences</small><h1>Blackharbor</h1></div>
  <div class="row"><span class="issue" data-tip="kw:volume">Vol. ${S.vol} · Arc ${arcOf(Math.min(S.issue,MAX_ISSUE))} · #${Math.min(S.issue,MAX_ISSUE)}</span></div>
  <div class="res" style="flex-basis:100%">
    <span class="chip trust" data-tip="kw:trust" aria-label="Trust" title="Trust">${UI('trust')}${S.trust}</span><span class="chip" data-tip="kw:techres" aria-label="Tech" title="Tech">${UI('tech')}${S.tech}</span><span class="chip" data-tip="kw:intel" aria-label="Intel" title="Intel">${UI('intel')}${S.intel}</span>
    ${Object.keys(S.salvage).filter(k=>S.salvage[k]>0||S.villains.some(v=>v.key===k)).map(k=>`<span class="chip" data-tip="kw:salvage" aria-label="${RES_NAME[k]}" title="${RES_NAME[k]} (${VILLAINS[k]?VILLAINS[k].short:''} salvage)">${resIc(k)}${S.salvage[k]}</span>`).join('')}
  </div></header>`}
function nav(){const m=S.phase!=='hq'&&S.phase!=='over';const v=S.view;
  const pend=roster().some(h=>h.pendingUp>0);
  const g=m?{}:navGlow();
  return `<nav class="nav">${m?`<button class="btn ${v==='mission'?'on':''}" data-a="view:mission">${UI('target')}Mission</button>`:`<button class="btn ${v==='hq'||v==='create'?'on':''} ${g.hq?'glow':''}" data-a="view:hq">${UI('hq')}HQ</button>`}
  <button class="btn ${v==='roster'?'on':''} ${g.roster?'glow':''}" data-a="view:roster">${UI('roster')}Roster${pend?' ★':''}</button>${m?'':`<button class="btn ${v==='villains'?'on':''} ${g.villains?'glow':''}" data-a="view:villains">${UI('mask')}Villains</button>`}</nav>`}
/* tab glow: HQ while something there can be used, Roster while there is new armory gear or a pending choice, Villains once HQ and Roster have both been opened this issue */
function visitTick(){if(S.phase!=='hq')return;if(!S.visit||S.visit.issue!==S.issue)S.visit={issue:S.issue};const v=S.view==='create'?'hq':S.view;
  if(v==='hq'||v==='roster'||v==='villains')S.visit[v]=true;if(v==='roster')S.armSeen=S.armory.slice()}
function newArmory(){const seen=(S.armSeen||[]).slice();return S.armory.some(g=>{const i=seen.indexOf(g);if(i<0)return true;seen.splice(i,1);return false})}
function hqUse(){const R=roster(),full=R.length>=ROSTER_MAX;
  if(!full&&(party().length<4||xoverOpen()))return true;
  if(Object.keys(FAC).some(k=>isUnlocked('fac:'+k)&&!S.facilities.includes(k)&&facOpen(k)&&afford(FAC[k].cost)))return true;
  if(S.facilities.includes('skunk')&&!(S.rd&&S.rd.issue===S.issue&&S.rd.free)&&Object.keys(GEAR).some(k=>!isUnlocked('gear:'+k)))return true;
  const ws=S.facilities.includes('workshop'),own=new Set([...S.armory,...R.flatMap(h=>Object.values(h.gear))]);
  return Object.keys(GEAR).some(k=>{const g=GEAR[k];if(!isUnlocked('gear:'+k)||!(ws||g.cons)||!afford(g.cost))return false;
    return g.cons?R.some(h=>wearOK(h,k)):(!own.has(k)||(g.pair&&[...S.armory,...R.flatMap(h=>Object.values(h.gear))].filter(x=>x===k).length<2))&&R.some(h=>wearOK(h,k))})}
function navGlow(){if(S.phase!=='hq'||S.view==='create')return {};const vi=S.visit&&S.visit.issue===S.issue?S.visit:{};
  return {hq:S.view!=='hq'&&hqUse(),roster:S.view!=='roster'&&(newArmory()||roster().some(h=>h.pendingUp>0)),villains:S.view!=='villains'&&!!vi.hq&&!!vi.roster&&!vi.villains}}
function body(){return bodyMain()+fsplashView()+cheatPanel()+guideModal()+tipModal()+tutModal()}
function bodyMain(){if(S.phase==='tutend')return tutEndView();if(S.over&&S.phase!=='after')return overView();if(S.view==='create'&&S.cre&&S.phase==='hq')return createView();if(S.view==='roster')return rosterView();if(S.phase==='event')return eventView();if(S.phase==='arc')return arcView();
  if(S.phase==='hq')return hqView(S.view==='villains'?'villains':null);if(S.phase==='inv')return invView();if(S.phase==='sd')return sdView();if(S.phase==='after')return afterView();return ''}

function hqView(only){if(tutOn())return tutHq(only);const arc=arcOf(S.issue),iia=(S.issue-1)%ISSUES_PER_ARC+1;
  const act=S.villains.filter(o=>o.status==='active');
  const vcard=o=>{const d=VILLAINS[o.key],seen=((S.seen&&S.seen[o.key])||[]).length;
    return `<div class="card">
    <div class="row between"><div class="row" style="flex-wrap:nowrap;gap:8px"><span class="vbadge" style="${vSty(o.key)}">${vIc(o.key)}</span><h3>${d.name}</h3></div><span class="lvl" data-tip="kw:vlevel">LVL ${o.level}</span></div>
    <div class="small muted">${d.tag}. Drops <span class="cost">${resIc(o.key)}</span>${d.salvage}. <span class="kwd" data-tip="kw:playbook">${o.deck.length}-page playbook</span>.</div>
    <button class="btn sm" data-a="book:${o.key}" style="align-self:flex-start">Read playbook · ${seen} seen</button>
    <div class="row small"><span class="eyebrow" data-tip="kw:scheme">Scheme</span><span class="meter">${[...Array(schemeMax())].map((_,i)=>`<i class="${i<o.scheme?'f':''}"></i>`).join('')}</span></div>
      ${S.guide&&party().length<4?`<button class="btn pri" data-a="inv:${o.key}" data-tip="kw:party" disabled>Needs 4 heroes · ${party().length}/4</button>`:`<button class="btn pri" data-a="inv:${o.key}" ${party().length?'':'disabled'}>Investigate</button>`}</div>`};
  const facCard=k=>{const f=FAC[k],b=S.facilities.includes(k),soon=!facOpen(k);return `<div class="card ${b?'built':''}" data-tip="fac:${k}">
    <div class="row between"><h3>${f.name}</h3>${b?'<span class="tag g">Built</span>':''}</div><div class="small">${f.txt}</div>
    ${b?'':`<div class="row between"><span class="small mono">${costHtml(f.cost)}</span><button class="btn sm" data-a="build:${k}" ${afford(f.cost)&&!soon?'':'disabled'}>${soon?`Opens in Arc ${f.arc}`:'Build'}</button></div>`}</div>`};
  const lockedCard=it=>`<div class="card locked" data-tip="${it}"><div class="row between"><h3>${itemName(it)}</h3><span class="tag" data-tip="kw:blueprint">No blueprint</span></div>${it.startsWith('gear:')?`<div class="row">${reqChips(GEAR[it.slice(5)])}<span class="small muted">${gearSlotN(GEAR[it.slice(5)])}</span></div>`:''}<div class="small muted">Unlocks from: ${unlockSources(it)}</div></div>`;
  const facNow=k=>facOpen(k)&&afford(FAC[k].cost);
  const facU=Object.keys(FAC).filter(k=>isUnlocked('fac:'+k)&&!S.facilities.includes(k)).sort((a,b)=>facNow(b)-facNow(a)),facB=Object.keys(FAC).filter(k=>S.facilities.includes(k)),facL=Object.keys(FAC).filter(k=>!isUnlocked('fac:'+k));
  const ws=S.facilities.includes('workshop');
  const canMake=k=>(ws||GEAR[k].cons)&&afford(GEAR[k].cost),wsBy=(S.ui&&S.ui.wsBy)||'vil',VK=Object.keys(VILLAINS).filter(k=>k in S.salvage),vil=g=>VK.some(v=>g.cost[v]);
  const consG={id:'cons',label:'<span class="disc fill hyb" data-tip="kw:pouch">Consumables</span>',f:g=>!!g.cons};
  const groups=wsBy==='slot'?[...Object.keys(GSLOTS).map(s=>({id:'slot-'+s,label:`<b>${GSLOTS[s]}</b>`,f:g=>g.slot===s})),consG]
    :wsBy==='disc'?[...Object.keys(TRACKS).map(t=>({id:t,label:`<span class="disc fill t-${t}" data-tip="kw:${t}">${TRACKS[t].name}</span>`,f:g=>!g.cons&&!isHybrid(g)&&g.reqs[t]})),consG,{id:'hybrid',sub:1,label:'<span class="disc fill hyb" data-tip="kw:hybrid">Hybrid</span>',f:g=>!g.cons&&isHybrid(g)}]
    :[...VK.map(v=>({id:'vil-'+v,label:`<b>${VILLAINS[v].name}</b><span class="small">${RES_NAME[v]} · ${S.salvage[v]} on hand</span>`,f:g=>!g.cons&&!!g.cost[v]})),
      {id:'vil-any',sub:1,label:'<b>Any salvage</b>',f:g=>!g.cons&&!!g.cost.any&&!vil(g)},{id:'vil-none',label:'<b>Tech &amp; Intel only</b>',f:g=>!g.cons&&!g.cost.any&&!vil(g)},consG];
  /* Version 103 (Tyler): craft cards list copies already owned, in the armory and on heroes */
  const ownedTxt=k=>{const inA=S.armory.filter(x=>x===k).length,on=roster().map(h=>[h,Object.values(h.gear).filter(x=>x===k).length+pouchOf(h).filter(x=>x===k).length]).filter(([,n])=>n);const tot=inA+on.reduce((a,[,n])=>a+n,0);
    return tot?`<div class="small owned"><b>Owned ${tot}:</b> ${[inA?`${inA} in the armory`:'',...on.map(([h,n])=>`${GEAR[k].cons?'carried':'worn'} by ${esc(h.name)}${n>1?` ×${n}`:''}`)].filter(Boolean).join(' · ')}</div>`:''};
  const craftCard=k=>{const g=GEAR[k];return `<div class="card" data-tip="gear:${k}">${gearInfo(k)}${ownedTxt(k)}
    <div class="row between"><span class="small mono">${costHtml(g.cost)}</span><button class="btn sm" data-a="craft:${k}" ${canMake(k)?'':'disabled'}>Craft</button></div>${canMake(k)?eqTo(k,true):''}</div>`};
  const wsGroup=(gr,ks)=>{ks=ks.slice().sort((a,b)=>canMake(b)-canMake(a)||GEAR[a].req-GEAR[b].req);if(!ks.length)return '';const rdy=ks.filter(canMake).length;
    const inner=gr.sub&&ks.length>8?Object.keys(GSLOTS).map(sl=>wsGroup({id:gr.id+'-'+sl,label:`<b>${GSLOTS[sl]}</b>`},ks.filter(k=>GEAR[k].slot===sl))).join(''):`<div class="grid2">${ks.map(craftCard).join('')}</div>`;
    return coll('ws-'+gr.id,`${gr.label}<span class="small muted">${ks.length} blueprint${ks.length===1?'':'s'}</span>${rdy?`<span class="tag g">${rdy} ready</span>`:''}`,inner,rdy>0&&(gr.id!=='hybrid'||ks.length<5),'nested')};
  /* Version 128 (Tyler): groups list only what you can craft now; unaffordable blueprints share one collapsed header near the bottom, above the missing blueprints */
  const gear=groups.map(gr=>wsGroup(gr,Object.keys(GEAR).filter(k=>gr.f(GEAR[k])&&isUnlocked('gear:'+k)&&canMake(k)))).join('');
  const cantK=Object.keys(GEAR).filter(k=>isUnlocked('gear:'+k)&&!canMake(k)&&groups.some(gr=>gr.f(GEAR[k])));
  const cant=cantK.length?wsGroup({id:'cant',sub:1,label:`<span class="eyebrow">Can't afford yet</span>`},cantK):'';
  const armK=[...new Set(S.armory)],armOK=g=>roster().some(h=>wearOK(h,g));
  const armG=[...Object.keys(GSLOTS),'pouch'].map(sl=>{const ks=armK.filter(g=>GEAR[g].slot===sl).sort((a,b)=>armOK(b)-armOK(a));if(!ks.length)return '';const n=S.armory.filter(g=>GEAR[g].slot===sl).length,rdy=ks.filter(armOK).length;
    return coll('arm-'+sl,`<span class="eyebrow">${slotN(sl)} · ${n}</span>${rdy?`<span class="tag g">${rdy} wearable</span>`:''}`,`<div class="grid2">${ks.map(g=>{const n=S.armory.filter(x=>x===g).length;return `<div class="card" data-tip="gear:${g}">${gearInfo(g)}<span class="small muted">${n>1?`${n} in stock`:'Ready to equip'}${armOK(g)?'':' · nobody can use it yet'}</span>${eqTo(g,false)}</div>`}).join('')}</div>`,true,'nested')}).join('');
  const wsTabs=`<div class="row small"><span class="eyebrow">Craft new gear · group by</span>${[['vil','Villain salvage'],['disc','Discipline'],['slot','Slot']].map(([k,l])=>`<button class="btn sm ${wsBy===k?'pri':''}" data-a="wsby:${k}">${l}</button>`).join('')}</div>
    <div class="row small"><span class="eyebrow">Paying any salvage</span>${[['0','Ask me which'],['1','Use my biggest pile']].map(([k,l])=>`<button class="btn sm ${(S.anyAuto?'1':'0')===k?'pri':''}" data-a="anyauto:${k}">${l}</button>`).join('')}</div>`;
  const gearL=Object.keys(GEAR).filter(k=>!isUnlocked('gear:'+k)).sort((a,b)=>GEAR[a].req-GEAR[b].req);
  const rTop=!roster().length||(S.guide&&S.guide.s<=1);
  if(only==='villains')return `${guideBar()}<section class="panel">${coll('vl-cases',`<div><div class="eyebrow">Volume ${S.vol} · Arc ${arc} of ${ARCS} · Issue ${iia} of ${ISSUES_PER_ARC}</div><h2>Case files</h2></div>`,
    `<div class="steps" data-tip="kw:arc">${[...Array(ISSUES_PER_ARC)].map((_,i)=>`<span class="${i<iia-1?'f':''}"></span>`).join('')}</div>
    <div class="cap tilt">${arc<ARCS?`When this arc ends, every free villain levels up and rewrites part of their playbook, and a new villain arrives.`:'Final arc. When it ends, two villains team up for the event comic finale.'} Villains you don't hunt keep scheming. Long-press any stat, item or keyword for details.</div>
    <div class="row small"><span class="eyebrow" data-tip="kw:party">Party</span>${party().map(h=>`<span class="tag g">${esc(h.name)}</span>`).join('')||'<span class="tag">Empty</span>'}<button class="btn sm" data-a="view:roster">Change party</button></div>
    <div class="grid2">${act.map(vcard).join('')}</div>
    ${S.pool.length?`<p class="small muted" style="margin:0">${S.pool.length} more villain${S.pool.length>1?'s':''} will surface later in this volume.</p>`:''}`)}</section>
  `;
  const fl=S.flash;S.flash=null;
  return `${guideBar()}${fl?`<div class="cap tilt"><b>Fresh off the press!</b> ${esc(fl)}</div>`:''}${recruitPanel()}
  ${skunkPanel()}
  <section class="panel">${coll('hq-base',`<div><div class="eyebrow">Headquarters · ${S.facilities.length} built</div><h2>Base development</h2></div>`,
    `${facU.length?`<div class="grid2">${facU.map(facCard).join('')}</div>`:'<p class="small muted" style="margin:0">Every facility blueprint on file is built.</p>'}
    ${facB.length?coll('hq-facb',`<span class="eyebrow">Built · ${facB.length}</span>`,`<div class="grid2">${facB.map(facCard).join('')}</div>`,false,'nested'):''}
    ${facL.length?coll('hq-facl',`<span class="eyebrow" data-tip="kw:blueprint">Missing facility blueprints · ${facL.length}</span>`,`<div class="grid2">${facL.map(k=>lockedCard('fac:'+k)).join('')}</div>`,false,'nested'):''}`)}</section>
  <section class="panel">${coll('hq-ws',`<div><div class="eyebrow">Workshop</div><h2>Gear from salvage</h2></div>`,
    `${ws?'':'<p class="small muted" style="margin:0">Build the Workshop to craft gear. Consumables can be bought without it.</p>'}
    <p class="small muted" style="margin:0">Each item fills one body slot and needs the listed discipline ranks to equip. Gear costs only salvage, and higher-rank gear costs more. Tech abilities spend Power, Magic spells spend Arcana, and Innate abilities require Innate rank. Hybrid gear needs ranks in more than one discipline. "Any salvage" can be paid from any villain's salvage.</p>
    ${wsFind(canMake,craftCard)}
    ${coll('ws-browse',`<span class="eyebrow">Browse the armory and every blueprint</span>`,`${S.armory.length?coll('ws-arm',`<span class="eyebrow">In the armory · ${S.armory.length}</span>`,armG,true,'nested'):''}
    ${wsTabs}${gear||'<p class="small muted" style="margin:0">Nothing you can afford to craft right now.</p>'}${cant}
    ${gearL.length?coll('hq-gearl',`<span class="eyebrow" data-tip="kw:blueprint">Missing gear blueprints · ${gearL.length}</span>`,`<div class="grid2">${gearL.map(k=>lockedCard('gear:'+k)).join('')}</div>`,false,'nested'):''}`,false,'nested')}`)}</section>
  ${S.chronicle.length?`<section class="panel">${coll('hq-back',`<div class="eyebrow">Back issues · ${S.chronicle.length}</div>`,`<ul class="lines small">${S.chronicle.slice().reverse().map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`,false)}</section>`:''}`}
function arcView(){const a=S.arcInfo;return `<section class="panel"><div class="eyebrow">Volume ${S.vol}</div><div><span class="sfxhead">Arc ${a.arc} begins!</span></div>
  <div class="cap tilt">Time passes. The villains still at large grow stronger and rewrite their playbooks.</div>
  ${coll('arc-lines','<span class="eyebrow">What changed · '+a.lines.length+'</span>',`<ul class="lines">${a.lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`)}<button class="btn pri" data-a="arcnext">Begin issue #${S.issue}</button></section>`}
function chargeZone(z){const sd=S.sd,v=sd.v,L=live().slice().sort((a,b)=>dV(a,v)-dV(b,v)),ks=new Set();
  const box=(t,r=1)=>hexesWithin(t,r).forEach(p=>{if(inB(p.x,p.y)&&!inV(v,p.x,p.y))ks.add(p.x+','+p.y)});
  const hurt=()=>L.slice().sort((a,b)=>heroOf(a).hp-heroOf(b).hp);
  if(z==='blast'&&L[0]){box(L[0],2);faceTo(L[0])}
  if(z==='blast2')L.slice(0,3).forEach(t=>box(t));
  if(z==='mark'&&L.length){const ts=hurt().slice(0,2);ts.forEach(t=>box(t));faceTo(ts[0]);v.hide=false}
  if(z==='line'&&L.length){const far=L.slice(-2).reverse();far.forEach((t,i)=>{const d=dirC(vCtr(v),HC(t.x,t.y)),A=ax(t);if(!i)v.face=d;
    for(let k=-2*N;k<=2*N;k++){const p=off(A.q+AXD[d][0]*k,A.r+AXD[d][1]*k);if(inB(p.x,p.y)&&!inV(v,p.x,p.y))ks.add(p.x+','+p.y)}})}
  if(z==='focus'&&L.length){const t=hurt()[0];faceTo(t);box(t);
    for(let d=0;d<6;d++){let p=t;for(let g=0;g<2*N;g++){p=step(p,d);const k=p.x+','+p.y;if(!inB(p.x,p.y)||sd.obs.includes(k)||(sd.walls||[]).some(w=>w.k===k)||inV(v,p.x,p.y))break;ks.add(k)}}}
  if(z==='nova')for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!inV(v,x,y)&&dV({x,y},v)<=3)ks.add(x+','+y);
  return [...ks]}
async function hazardTick(){const sd=S.sd;if(!sd.haz.length)return;
  for(const u of live().filter(u=>sd.haz.some(h=>h.k===u.x+','+u.y))){const hz=sd.haz.find(h=>h.k===u.x+','+u.y);
    await A.ring(ctrU(u),COL.innate,1.6);fxU(u,'SIZZLE!','vhit');damageHero(u,hz.dmg);log('vill',`${heroOf(u).name} is burned by the ${hz.n||'molten floor'} for ${hz.dmg}.`);render()}
  sd.haz.forEach(h=>{if(!h.perm)h.ttl--});sd.haz=sd.haz.filter(h=>h.ttl>0)}
/* Payload's bombs: sd.bombs [{k,fuse,dmg,o}] tick down at the start of each villain turn and go off on their hex and the 6 around it.
   They hit heroes, civilians and henchmen, never a villain. A Sapper beside a bomb packs it for +1. */
const BOMB_MAX=4;
const bombP=b=>{const[x,y]=b.k.split(',').map(Number);return {x,y}};
function dropBomb(x,y,fuse,dmg){const sd=S.sd,k=x+','+y;sd.bombs=sd.bombs||[];const e=sd.bombs.find(b=>b.k===k);
  if(e){e.fuse=Math.min(e.fuse,fuse);e.dmg=Math.max(e.dmg,dmg);return true}
  if(sd.bombs.length>=BOMB_MAX)return false;sd.bombs.push({k,fuse,dmg,o:sd.vkey});return true}
async function blowBombs(list,bonus=0){const sd=S.sd;
  for(const b of list){if(sd.result)break;sd.bombs=sd.bombs.filter(o=>o!==b);const p=bombP(b),inZ=q=>cheb(q,p)<=1,sap=sd.hench.some(m=>m.owner===b.o&&cheb(m,p)<=1)?1:0,dm=b.dmg+bonus+sap;
    render();await A.ring(HC(p.x,p.y),COL.yel,3.4,{count:2});fxP(p.x,p.y,pick(['KA-BOOM!','BLAM!','KRAKOOM!']),'vhit');
    if(sap)log('vill','A Sapper packed that bomb: +1 damage.');
    const hd=dm,hs=live().filter(inZ),hm=sd.hench.filter(inZ);
    for(const u of hs){if(await wardBlocks(u))continue;fxU(u,'OOF!','vhit');damageHero(u,hd);log('vill',`A bomb goes off on ${heroOf(u).name} for ${hd}.`)}
    sd.civs.filter(inZ).forEach(c=>harmCiv(c,'a bomb'));termHit(inZ,'A bomb');
    hm.forEach(m=>{m.hp-=dm;m.hurtAt=Date.now()});const dead=hm.filter(m=>m.hp<=0);if(dead.length){sd.hench=sd.hench.filter(m=>m.hp>0);log('vill',`The blast takes out ${dead.length} of the villain's own henchm${dead.length>1?'en':'an'}.`)}
    if(!hs.length&&!hm.length)log('vill','A bomb goes off, but nobody is close enough to get hurt.');
    render();checkLoss();await sleep(FAST?0:220)}}
async function bombTick(){const sd=S.sd;if(!sd.bombs||!sd.bombs.length)return;sd.bombs.forEach(b=>b.fuse--);render();const due=sd.bombs.filter(b=>b.fuse<=0);if(due.length)await blowBombs(due)}
/* Gridlock's beams run along a hex line to the board edge. A beam stops at walls, rubble and villains, and at the first hero or civilian
   it hits; a hero hit is knocked back along the beam as many hexes as the damage. Hexes it crossed stay lit until his next turn:
   stepping into one costs BEAM_HOT and ends the move, and a hero can jump over a single lit hex for 2 movement. Prisms split a beam 60° both ways. */
const BEAM_HOT=2;
function litMap(){const m={};((S.sd&&S.sd.beams)||[]).forEach(b=>b.ks.forEach(k=>{m[k]=Math.max(m[k]||0,b.hot)}));return m}
/* Version 108 (Tyler): Optics Bench no longer cuts beam damage, it fits scope rails (see stat) */
function optic(n){return n}
function beamTick(){const sd=S.sd;if(!sd.beams||!sd.beams.length)return;sd.beams.forEach(b=>b.ttl--);sd.beams=sd.beams.filter(b=>b.ttl>0);render()}
function beamStep(u){const n=litMap()[u.x+','+u.y];if(!n||u.ko)return;const dm=optic(n);fxU(u,'ZZZT!','vhit');damageHero(u,dm);log('vill',`${heroOf(u).name} steps into a beam and takes ${dm}. Their move ends there.`);checkLoss()}
/* hero movement with lit beams: a lit hex can be entered but not passed through, unless you jump clean over it */
/* beams end a normal move; only a jumping hero (u.jump from Solar Dive, u.boostJump from Mighty Leap, Jet or Piston Leap, or gear with jumps) can clear one lit hex for 2 movement */
const JUMP_AB=['wings'];
function reachH(u,mv){const lm=litMap(),pt=new Set(S.sd.pits||[]),jump=!!(u.jump||u.boostJump||jumpsAll(heroOf(u)));reachH.leaps=new Set();if(!Object.keys(lm).length&&!(jump&&pt.size))return reach(u,mv,u);
  const s=u.x+','+u.y,dist={[s]:0},q=[[u.x,u.y]],lp=reachH.leaps;
  while(q.length){const[x,y]=q.shift(),k0=x+','+y,d=dist[k0];if(d>=mv||(k0!==s&&lm[k0]))continue;
    for(let e=0;e<6;e++){const n=step({x,y},e),k=n.x+','+n.y;
      if(!blocked(n.x,n.y,{self:u})&&!(k in dist&&dist[k]<=d+1)){dist[k]=d+1;lp.delete(k);q.push([n.x,n.y])}
      if(jump&&(lm[k]||pt.has(k))&&d+2<=mv){const n2=step(n,e),k2=n2.x+','+n2.y;if(inB(n2.x,n2.y)&&!lm[k2]&&!blocked(n2.x,n2.y,{self:u})&&!(k2 in dist&&dist[k2]<=d+2)){dist[k2]=d+2;lp.add(k2);q.push([n2.x,n2.y])}}}}
  delete dist[s];return dist}
/* each direction fires from the body hex that leads that way, so a 4-hex turret has several emitters */
function emitCell(v,d){const u=FACE_DEG[d]*Math.PI/180,dx=Math.cos(u),dy=Math.sin(u);return vCells(v).map(c=>{const h=HC(c.x,c.y);return {c,s:h.cx*dx+h.cy*dy}}).sort((a,b)=>b.s-a.s)[0].c}
function rayK(f,d,t){const A=ax(f),B=ax(t),dq=B.q-A.q,dr=B.r-A.r,[a,b]=AXD[d],k=a?dq/a:dr/b;return k>0&&Number.isInteger(k)&&dq===a*k&&dr===b*k?k:0}
/* aim from a villain or a single hex: straight through the target if any emitter lines up, else the closest direction */
function aimLine(from,t){const vil=!!from.shape,cells=vil?vCells(from):[from];let best=null;
  for(const c of cells)for(let d=0;d<6;d++){const k=rayK(c,d,t),n=step(c,d);if(k&&!(vil&&inV(from,n.x,n.y))&&(!best||k<best.k))best={from:{x:c.x,y:c.y},d,k}}
  if(best)return {from:best.from,d:best.d};
  const d=dirC(vil?vCtr(from):HC(from.x,from.y),HC(t.x,t.y));return {from:vil?emitCell(from,d):{x:from.x,y:from.y},d}}
function traceBeam(L,hitSet,split){const sd=S.sd,ks=[],res={ks,hit:null,civ:null,splits:[]};let p=L.from;
  for(let g=0;g<4*N;g++){p=step(p,L.d);if(!inB(p.x,p.y))break;const k=p.x+','+p.y;
    if(sd.obs.includes(k)||(sd.walls||[]).some(w=>w.k===k)||sd.vl.some(o=>!o.v.down&&inV(o.v,p.x,p.y)))break;
    ks.push(k);const u=live().find(o=>o.x===p.x&&o.y===p.y);if(u){if(!hitSet.has(u))res.hit=u;break}
    const cv=sd.civs.find(c=>c.x===p.x&&c.y===p.y);if(cv){res.civ=cv;break}
    const pm=sd.hench.find(m=>m.x===p.x&&m.y===p.y&&m.owner==='grid');
    if(pm&&!split.has(pm)){split.add(pm);res.splits.push({from:{x:p.x,y:p.y},d:(L.d+1)%6},{from:{x:p.x,y:p.y},d:(L.d+5)%6})}}
  return res}
async function fireBeams(lines,dmg,label,o={}){const sd=S.sd,v=sd.v,hitSet=o.hit||new Set(),split=new Set(),q=lines.slice(),done=[],hot=dmgScale(BEAM_HOT);sd.beams=sd.beams||[];
  while(q.length&&done.length<24){const L=q.shift(),r=traceBeam(L,hitSet,split);done.push({L,r});q.push(...r.splits);if(r.hit)hitSet.add(r.hit)}
  const lit=done.filter(e=>e.r.ks.length);lit.forEach(e=>sd.beams.push({k0:e.L.from.x+','+e.L.from.y,ks:e.r.ks,ttl:o.ttl||1,hot}));
  await Promise.all(lit.map(e=>{const[zx,zy]=e.r.ks[e.r.ks.length-1].split(',').map(Number);return A.laser(HC(e.L.from.x,e.L.from.y),HC(zx,zy),'#FF2D55')}));render();
  const civs=done.filter(e=>e.r.civ),hits=done.filter(e=>e.r.hit);civs.forEach(e=>{if(sd.civs.includes(e.r.civ))harmCiv(e.r.civ,label)});
  const dm=optic(v.cursed&&dmg>0?Math.max(1,dmg-2):dmg);
  for(const e of hits){const u=e.r.hit,h=heroOf(u);if(u.ko||sd.result)continue;if(await wardBlocks(u))continue;
    fxU(u,'ZZARK!','vhit');damageHero(u,dm);let n=0;
    if(!u.ko){if(u.anchor)fxU(u,'ANCHORED!','good');else for(let i=0;i<dm;i++){const t=step(u,e.L.d);if(!inB(t.x,t.y)||blocked(t.x,t.y,{self:u}))break;u.x=t.x;u.y=t.y;n++}}
    log('vill',`${label} hits ${h.name} for ${dm}${n?` and knocks them back ${n} hex${n>1?'es':''}`:u.anchor?'. They are anchored and hold firm':''}.`);render();await sleep(FAST?0:220)}
  const nk=new Set(lit.flatMap(e=>e.r.ks)).size;
  log('vill',hits.length||civs.length?`${nk} hexes stay lit until ${VILLAINS[sd.vkey].short}'s next turn.`:`${label}: ${lit.length} beam${lit.length===1?'':'s'} light up ${nk} hexes, but nobody is caught.`);
  checkLoss();return hits.map(e=>e.r.hit)}
async function fireCharge(){const sd=S.sd,v=sd.v,ch=sd.v.charge;sd.v.charge=null;
  if(v.wounds.length-ch.w0>=(ch.need||2)){fxV('STAGGERED!','good');log('hero',`The heroes tore ${v.wounds.length-ch.w0} pages. ${ch.n} fizzles out!`);render();await sleep(400);return}
  const cells=ch.zone.map(k=>{const[x,y]=k.split(',').map(Number);return {...HC(x,y),x,y}});
  sd.firing=ch.zone;fxV(ch.n.toUpperCase()+'!','say');render();
  await Promise.all([A.bolt(ctrV(),cells[Math.floor(cells.length/2)],COL.yel),...cells.map((p,i)=>sleep(i*22).then(()=>A.ring(p,COL.yel,1.4)))]);
  sd.firing=null;const inZ=p=>ch.zone.includes(p.x+','+p.y);
  const hit=live().filter(inZ);
  const cd=ch.dmg>0&&v.cursed?Math.max(1,ch.dmg-2):ch.dmg;for(const u of hit){if(await wardBlocks(u))continue;fxU(u,pick(['FWOOOM!','KRAKOOM!']),'vhit');damageHero(u,cd);log('vill',`${ch.n} scorches ${heroOf(u).name} for ${ch.dmg}.`)}
  sd.civs.filter(inZ).forEach(c=>harmCiv(c,ch.n));termHit(inZ,ch.n);
  if(!hit.length)log('vill',`${ch.n} fires, but everyone got clear!`);render()}

function rosterView(){const p=party(),b=bench(),atHQ=S.phase==='hq',fl=S.flash;S.flash=null;
  return `${guideBar()}${fl?`<div class="cap tilt"><b>Fresh off the press!</b> ${esc(fl)}</div>`:''}<section class="panel">${coll('ro-party',`<div><div class="eyebrow" data-tip="kw:party">Active party · ${p.length}/4</div><h2>Party</h2></div>`,
    `<p class="small muted" style="margin:0">${prepGear()?'You caught the villain by surprise: gear can be changed before entering the lair.':atHQ?'Only the party goes on missions and investigations. Benched heroes train and recover: full health and +1 XP every issue.':'The party can be changed at HQ between issues.'}</p>
    ${p.length?`<div class="grid2">${p.map(h=>heroCard(h,'party')).join('')}</div>`:'<div class="cap">The party is empty. Add heroes from the bench before the next mission.</div>'}`)}</section>
  <section class="panel">${coll('ro-bench',`<div><div class="eyebrow">Reserves · ${b.length}</div><h2>Bench</h2></div>`,`${b.length?'':'<p class="small muted" style="margin:0">Nobody on the bench.</p>'}<div class="grid2">${b.map(h=>heroCard(h,'bench')).join('')}</div>${atHQ&&roster().length<ROSTER_MAX?'<div class="row"><button class="btn sm" data-a="view:hq">Recruit more heroes at HQ</button></div>':''}`)}</section>
  ${S.fallen.length?`<p class="small muted" style="margin:0">Retired: ${S.fallen.map(esc).join(', ')}</p>`:''}`}
/* passive gear effects, one line each */
function gearExtra(g){const o=[];if(g.two)o.push('<b>Two-handed:</b> fills both the Main Hand and the Off Hand.');else if(g.hand==='main')o.push('<b>Main Hand</b> weapon.');else if(g.hand==='off')o.push('<b>Off Hand</b> item.');
  if(g.pair)o.push(`<b>Paired:</b> goes in either hand. Hold one in each hand and both count in full, plus ${g.pair.txt}.`);
  if(g.pain)o.push(`<b>Pain into ${TRACKS[g.pain].res}:</b> regain 1 ${TRACKS[g.pain].res} whenever you take damage.`);
  if(g.relent)o.push('<b>Relentless:</b> +1 die on attacks against a villain you also attacked last round.');
  if(g.riposte)o.push('<b>Riposte:</b> once per round, when the villain misses you and is within your range, strike back with a free 1-die attack.');
  if(g.rescue)o.push('<b>Lifeline:</b> each civilian you get out through an exit restores 1 Power or 1 Arcana, or 2 health if neither is missing.');
  if(g.aura)o.push(`<b>Aura:</b> you and allies within ${AURA_R} hexes get ${modsTxt(g.aura)}.`);if(g.auraFx)o.push(`<b>Aura, ${AURA_FX[g.auraFx].n}:</b> you and allies within ${AURA_R} hexes ${AURA_FX[g.auraFx].txt}.`);return o}
function gearInfo(k){const g=GEAR[k];return `${g.set?`<span class="settag" data-tip="kw:set">${esc(VILLAINS[g.set].name)} set</span>`:''}<div class="row between"><h3>${g.name}</h3><span class="row" style="gap:4px">${reqChips(g)}</span></div>
  <div class="small"><span class="eyebrow">${gearSlotN(g)}${g.pair?' · paired':''}</span> · ${g.cons?'Consumable · one use, then it is gone':(modsTxt(g.mods)||'No passive bonus')+(gearPoolTxt(g)?' · '+gearPoolTxt(g):'')}</div>
  ${g.ab?`<div class="small t-${g.type}"><b style="color:var(--tc)">${g.ab.n} · ${abCost(g)}.</b> ${abTxt(g.ab)}</div>`:''}
  ${g.jumps?'<div class="small" data-tip="kw:jumps"><b>All your moves are jumps.</b></div>':''}${gearExtra(g).map(t=>`<div class="small">${t}</div>`).join('')}
  ${g.field?`<div class="small"><span class="disc t-${g.type}" data-tip="kw:fieldgear">Out of combat</span> ${g.field.txt}</div>`:''}${g.set?setFoot(g.set):''}`}
/* set footer on a set item: the bonus, and how many pieces each hero on the roster wears */
function setFoot(k){const w=roster().map(h=>[h,setCount(h,k)]).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]);
  return `<div class="small setfoot"><b class="sn">${SETS[k].n}</b> <span class="muted">(${SET_N} pieces)</span> ${SETS[k].txt}<br><span class="muted">${w.length?'Wearing: '+w.map(([h,n])=>`${esc(h.name)} ${n}/${SET_N}${n>=SET_N?' ✓':''}`).join(', '):'Nobody is wearing this set yet.'}</span></div>`}
function setRows(h){const ks=[...new Set(Object.values(h.gear).map(g=>GEAR[g]&&GEAR[g].set).filter(Boolean))];if(!ks.length)return '';
  return `<div class="setrows">${ks.map(k=>{const n=setCount(h,k),on=n>=SET_N,id=`set-${h.id}-${k}`,left=SET_N-n;
    return `<details class="setp ${on?'on':''}" data-cid="${id}" ${uiOpen(id,false)?'open':''}><summary><span class="settag">${esc(VILLAINS[k].name)}</span><span class="sn">${SETS[k].n}</span><span class="setpips">${[...Array(Math.max(SET_N,n))].map((_,i)=>`<i class="${i<n?'f':''}"></i>`).join('')}</span><span class="mono small">${n}/${SET_N}</span>${on?'<span class="small sn">Active</span>':''}</summary><div class="small">${on?'':`Wear ${left} more piece${left>1?'s':''} to unlock: `}${SETS[k].txt}</div></details>`}).join('')}</div>`}
function heroCard(h,where){const b=BASE(h),mx=stat(h,'maxHp'),mc=stat(h,'maxComp'),p=POWERS[b.power];
  if(h.pendingUp>0&&h.trackPick&&!h.upChoices){h.upChoices=shuffle(Object.keys(UPG).filter(k=>k!=='range'||stat(h,'range')>1)).slice(0,3)}
  const ranks=Object.keys(TRACKS).map(t=>`<span class="disc t-${t} ${h.ranks[t]?'fill':''}" data-tip="kw:${t}">${TRACKS[t].name} ${h.ranks[t]}</span>`).join('');
  const res=poolTxt(h);if(h.pendingUp>0&&!h.trackPick&&Object.keys(TRACKS).every(t=>h.ranks[t]>=RANK_MAX))h.trackPick='none';
  const atHQ=S.phase==='hq',gearOK=atHQ||prepGear();
  const slots=Object.keys(SLOTS).map(s=>{const g=h.gear[s],tw=s==='arms2'&&h.gear.arms&&GEAR[h.gear.arms].two;if(tw)return `<div class="slot has t-${GEAR[h.gear.arms].type}" data-tip="gear:${h.gear.arms}"><span class="sl">${SLOTS[s]}</span><span class="muted">${GEAR[h.gear.arms].name} (two hands)</span></div>`;return g?`<div class="slot has t-${GEAR[g].type}" data-tip="gear:${g}"><span class="sl">${SLOTS[s]}</span><span>${GEAR[g].name}</span>${gearOK?`<button class="btn sm" data-a="unequip:${h.id}:${s}">Remove</button>`:''}</div>`
    :gearOK?(()=>{const n=slotFits(h,s).filter(g=>wearOK(h,g)).length;return `<button type="button" class="slot pick" data-a="slotpick:${h.id}:${s}"><span class="sl">${SLOTS[s]}</span><span class="muted">Empty · ${n?`tap to equip (${n} fit${n===1?'s':''})`:'nothing fits yet'}</span></button>`})()
    :`<div class="slot"><span class="sl">${SLOTS[s]}</span><span class="muted">Empty</span></div>`}).join('');
  const efr=gearOK&&S.armory.length?eqFilter(h):null,avail=efr?efr.ks:[];
  const lvlUp=h.pendingUp>0?(!h.trackPick?`<div class="cap"><b>Level up!</b> Which discipline does ${esc(h.name)} grow into?</div>
    <div class="grid2">${Object.entries(TRACKS).map(([t,d])=>{const n=h.ranks[t],mx=n>=RANK_MAX,nx=n+1,pk=nx===1&&t===b.track?'':perkTxt(t,nx),gn=gainTxt(h,t);return `<button class="btn opt t-${t}" data-a="track:${h.id}:${t}" data-tip="kw:${t}" style="border-color:var(--tc)" ${mx?'disabled':''}><span style="color:var(--tc)">${d.name} ${n} → ${mx?'mastered':nx}${nx===RANK_MAX?' · Capstone':''}</span><small>${mx?`Already at the rank ${RANK_MAX} cap.`:[pk&&`Capstone: ${pk}`,gn&&`Engine: ${gn}`,`Opens ${d.name} ${nx} gear`].filter(Boolean).join('. ')+'.'}</small></button>`}).join('')}</div>`
    :`<div class="cap"><b>${TRACKS[h.trackPick]?`${TRACKS[h.trackPick].name} rank gained.`:'Every discipline is mastered.'}</b> Now choose one upgrade:</div><div class="row">${h.upChoices.map(k=>`<button class="btn sm pri" data-a="up:${h.id}:${k}" data-tip="upg:${k}">${UPG[k].name}</button>`).join('')}</div>`):'';
  const SK={HP:'hp',MOV:'move',DICE:'speed',ACC:'acc',STR:'str',EVA:'eva',RNG:'range',COMP:'comp'},SI={HP:'hp',MOV:'move',DICE:'dice',ACC:'acc',STR:'str',EVA:'eva',RNG:'rng',COMP:'comp'};
  const st=[['HP',`${h.hp}/${mx}`],['MOV',stat(h,'move')],['DICE',stat(h,'speed')],['ACC',(stat(h,'acc')<0?'':'+')+stat(h,'acc')],['STR',(stat(h,'str')<0?'':'+')+stat(h,'str')],['EVA',stat(h,'eva')],['RNG',stat(h,'range')],['COMP',mc]];
  return `<div class="card"><details class="coll" data-cid="h-${h.id}" ${uiOpen('h-'+h.id,true)?'open':''}><summary><div class="row"><span class="vic" style="--vc:${b.col}">${pIc(b.power)}</span><h3>${esc(h.name)}</h3><span class="lvl" data-tip="kw:xp">LVL ${lvlOf(h)}</span>${h.est?'<span class="tag" data-tip="kw:established">Established</span>':''}<span class="small mono muted" data-tip="kw:hp">HP ${h.hp}/${mx}</span>${b.field?'<span class="tag g" data-tip="kw:field">Field</span>':''}${h.pendingUp?'<span class="tag" data-tip="kw:levelup">Level up!</span>':''}</div></summary><div class="cbody">
  ${atHQ&&where==='party'?`<div class="row"><button class="btn sm" data-a="bench:${h.id}">Move to bench</button></div>`:''}${atHQ&&where==='bench'?(party().length<4?`<div class="row"><button class="btn sm pri" data-a="join:${h.id}">Join the party</button></div>`:`<div class="row"><span class="eyebrow">Swap in for</span>${party().map(o=>`<button class="btn sm" data-a="swap:${h.id}:${o.id}">${esc(o.name)}</button>`).join('')}</div>`):''}
  <div class="small muted">${esc(b.role)}${h.name!==b.name?` · carries the ${esc(b.name)} mantle`:''}</div>${h.origin?`<div class="small muted" data-tip="kw:origin">Origin: ${esc(h.origin.join(' · '))}</div>`:''}
  <div class="row">${ranks}</div>
  <div class="small muted" data-tip="kw:engines">Combat engines: ${res}</div>
  <div class="bar" data-tip="kw:hp"><i style="width:${100*h.hp/mx}%"></i></div><div class="bar c" data-tip="kw:comp"><i style="width:${100*h.comp/mc}%"></i></div>
  <div class="stats ico">${st.map(([k,v])=>`<div class="stat" data-tip="kw:${SK[k]}" title="${k}" aria-label="${k} ${v}">${UI(SI[k])}<b>${v}</b></div>`).join('')}</div>
  <div class="small" data-tip="pow:${b.power}"><b>${p.name}.</b> ${p.txt}</div>
  ${b.field?`<div class="small fieldab" data-tip="kw:field"><b>${b.field.n}</b> <span class="disc t-${b.track}">Field</span> ${b.field.txt}</div>`:''}
  <div class="row small"><span class="eyebrow" data-tip="kw:xp">XP</span><span class="meter">${[...Array(xpNeed(h))].map((_,i)=>`<i class="${i<h.xp?'f':''}"></i>`).join('')}</span><span class="mono">${h.xp}/${xpNeed(h)}</span></div>
  ${h.injuries.length?`<div class="row">${h.injuries.map(i=>`<span class="tag" data-tip="inj:${i}">${INJ[i].name}</span>`).join('')}</div>`:''}
  <div class="eyebrow" data-tip="kw:slot">Gear</div><div class="slots">${slots}</div>${pairOf(h)?`<div class="small" data-tip="kw:paired"><b>Paired ${GEAR[pairOf(h)].name}s:</b> ${GEAR[pairOf(h)].pair.txt}, on top of both weapons' own stats.</div>`:''}${setRows(h)}
  <div class="row small"><span class="eyebrow" data-tip="kw:pouch">Pouch ${pouchOf(h).length}/${POUCH_MAX}</span>${pouchOf(h).map((g,i)=>`<span class="tag g" data-tip="gear:${g}">${GEAR[g].name}</span>${gearOK?`<button class="btn sm" data-a="unpouch:${h.id}:${i}">Remove</button>`:''}`).join('')||'<span class="muted">Empty. Consumables from the armory go here.</span>'}</div>
  ${efr?`<div class="eyebrow">Equip from the armory</div>${efr.bar}`:''}${avail.length?`<div class="row">${avail.map(g=>{const ok=wearOK(h,g),G=GEAR[g];return `<button class="btn sm" data-a="equip:${h.id}:${g}" data-tip="gear:${g}" ${ok?'':'disabled'} title="${ok?'':`Needs ${reqTxt(G)}`}">+ ${G.name} <span class="muted">(${G.cons?`pouch ${pouchOf(h).length}/${POUCH_MAX}`:gearSlotN(G)}${ok?'':G.cons?', full':`, needs ${reqTxt(G)}`})</span></button>`}).join('')}</div>`:''}
  ${lvlUp}
  </div></details></div>`}

function introView(){const i=S.inv,d=VILLAINS[i.v],vs=vState(i.v),I=VINTEL[i.v],seen=(S.seen&&S.seen[i.v])||[],sr=(S.seenR&&S.seenR[i.v])||[];
  const ids=[...new Set(vs.deck.map(e=>e.id))],pk=ids.filter(id=>seen.includes(id)).length,rk=I.react.filter(r=>sr.includes(r.id)).length;
  return `<section class="panel vintro"><div class="vsplash"><small>Case file · Issue #${S.issue} · Level ${vs.level}</small><b>${esc(d.name)}</b><span class="ctag">${esc(d.tag)}</span></div>
    <div class="cap tilt">${esc(I.intro)}</div>
    <div class="card"><div class="eyebrow" data-tip="kw:hints">What the streets say</div><ul class="hints">${I.hints.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>
    <div class="row small"><span class="chip" data-tip="kw:playbook"><b>Pages known</b>${pk}/${ids.length}</span><span class="chip" data-tip="kw:reaction"><b>Reactions known</b>${rk}/${I.react.length}</span><span class="chip" data-tip="kw:vsize"><b>Size</b>${SHAPE_N[d.shape]}</span><span class="chip" data-tip="kw:clues"><b>Head start</b>${i.clues} clue${i.clues===1?'':'s'}</span></div>
    ${i.found.length?`<div class="eyebrow" data-tip="kw:intelfile">Your head start uncovered</div><div class="intels">${i.found.map(f=>intelTile(i.v,f,true)).join('')}</div>`:''}
    ${i.ovf?`<div class="small" data-tip="kw:overflow"><b>More than you need.</b> Your head start is past ${PREP_CLUES} clues: +${i.ovf} intel.</div>`:''}
    <p class="small muted" style="margin:0">Every clue you find opens one unseen playbook page or hit reaction. Find 4 or more to catch ${esc(d.short)} by surprise and change gear before the fight.</p>
    <button class="btn pri" data-a="invgo">Hit the streets</button></section>`}

function invView(){const i=S.inv,d=VILLAINS[i.v];const done=i.step>=3;
  if(i.intro)return introView();
  let inner;
  if(done){const q=invQuality(i.clues);inner=`<div class="cap"><b>${i.clues} clue${i.clues===1?'':'s'}.</b> You've found the lair.</div>
    <div class="card"><div class="eyebrow">Showdown condition</div><div class="big" style="color:var(--magenta)">${QUAL[q].n}</div><div class="small">${QUAL[q].txt}</div></div>
    <p class="small muted" style="margin:0">0–${S.ethos.b==='public'?2:1} clues: Ambush · ${S.ethos.b==='public'?3:2}–3: Standoff · 4+: Prepared</p>
    ${q==='prepared'?coll('gearup',`<div><div class="eyebrow" data-tip="kw:gearup">Surprise!</div><h3>Gear up before you go in</h3></div>`,
      `<p class="small muted" style="margin:0">They don't know you're coming. Swap gear between the party and the armory now, using what the case file tells you.</p>
      <div class="grid2">${party().map(h=>heroCard(h,'prep')).join('')}</div>`,true):''}
    <button class="btn pri" data-a="lair">Enter the lair</button>`}
  else{const e=evOf(i.events[i.step]),sig=VEVENTS[i.v]&&VEVENTS[i.v].includes(e);
    const nf=i.res&&i.fresh?i.found.slice(-i.fresh):[];
    inner=`<div class="eyebrow">Lead ${i.step+1} of 3${sig?` · <span data-tip="kw:vlead">${esc(d.short)}'s trail</span>`:''}</div><h3>${e.title}</h3><div class="cap tilt">${esc(e.txt(d.name))}</div>
    ${i.res?`<div class="card"><div class="small">${esc(i.res)}</div>${nf.length?`<div class="eyebrow" data-tip="kw:intelfile">New intel</div><div class="intels">${nf.map(f=>intelTile(i.v,f,true)).join('')}</div>`:''}${i.ovfFresh?`<div class="small" data-tip="kw:overflow"><b>More than you need.</b> +${i.ovfFresh} intel from clues past ${PREP_CLUES}.</div>`:''}<button class="btn" data-a="invnext">${i.step<2?'Next lead':'Find the lair'}</button></div>`:
    `<div class="grid2">${e.opts.map((o,k)=>`<button class="btn opt" data-a="invopt:${k}" ${o.ok&&!o.ok()?'disabled':''}><span>${o.l}</span><small>${o.h}</small></button>`).join('')}</div>`}`}
  return `<section class="panel"><div class="row between"><div><div class="eyebrow">Investigation</div><h2>Tracking ${d.name}</h2></div><span class="chip" data-tip="kw:clues"><b>Clues</b>${i.clues}</span>${(i.notes||[]).map(n=>`<span class="tag g" data-tip="kw:field">${esc(n)}</span>`).join('')}${i.ovf?`<span class="tag g" data-tip="kw:overflow">+${i.ovf} intel filed</span>`:''}</div>
    <div class="steps">${[0,1,2].map(k=>`<span class="${k<i.step||(k===i.step&&i.res)?'f':''}"></span>`).join('')}</div>${inner}
    ${i.found.length?coll('intelfile',`<div><div class="eyebrow" data-tip="kw:intelfile">Case file</div><h3>Intel this investigation · ${i.found.length}</h3></div>`,`<div class="intels">${i.found.map(f=>intelTile(i.v,f,false)).join('')}</div>
    <button class="btn sm" data-a="book:${i.v}" style="align-self:flex-start">Read the full playbook</button>`,false):''}</section>`}

/* Version 130 (Tyler): a splash page opens every fight with the villain's line for how the investigation went,
   and another closes it with the villain's escape (win) or taunt (loss). Headless sims never see either. */
let fsSeen='';
function fsplashView(){const sd=S.sd;if(FAST||S.phase!=='sd'||!sd||sd.patrol)return '';
  const keys=sd.vl.map(o=>o.key),q=sd.quality,id=(sd.intro?'in':sd.result)+S.vol+'.'+S.issue+keys.join(),still=id===fsSeen?' still':'';fsSeen=id;
  if(sd.intro){const head=sd.finale&&S.event?`Event comic · ${esc(S.event.title)}`:`Issue #${S.issue} · Lair showdown`;
    return `<div id="fsplash" class="${still}" role="dialog" aria-modal="true" aria-label="The fight begins">${keys.map((k,i)=>{const d=VILLAINS[k];
      return `<div class="fs fsv-${k}" style="${vSty(k)}"><span class="fsem">${vIc(k)}</span><span class="fsfx" aria-hidden="true">${VSFX[k]||''}</span><small>${head} · Level ${sd.vl[i].v.level}</small><b class="fsn">${esc(d.name)}</b>${i===0?`<span class="fsq" data-tip="kw:q_${q}">${QUAL[q].n}</span>`:''}
        <div class="say">“${esc(vLine(k,q))}”</div>${i===keys.length-1?`<div class="fsd">${QUAL[q].txt}</div>`:''}</div>`}).join('')}
      <div class="fsb"><button class="btn pri" data-a="sdgo">${q==='ambush'?'Brace yourselves!':'Fight!'}</button></div></div>`}
  if(sd.result&&!sd.busy&&!sd.outro){const win=sd.result==='win',t=win?'escape':'taunt';
    const head=win?(sd.finale?'City saved!':'Victory!'):sd.result==='loss'?(sd.finale?'Blackharbor falls':'Defeat'):'Slipped away';
    return `<div id="fsplash" class="${still}" role="dialog" aria-modal="true" aria-label="${head}">${keys.map((k,i)=>{const d=VILLAINS[k];
      return `<div class="fs fsv-${k}" style="${vSty(k)}"><span class="fsem">${vIc(k)}</span><span class="fsfx" aria-hidden="true">${VSFX[k]||''}</span>${i===0?`<span class="fsx ${win?'':'bad'}">${head}</span>`:''}<small>${win?'Escaping':'Gloating'}</small><b class="fsn">${esc(d.name)}</b>
        <div class="say">“${esc(vLine(k,t))}”</div>${i===keys.length-1?`<div class="fsd">${win?(sd.finale?'The playbooks are empty and Blackharbor is safe, for now.':`${esc(d.short)} slips away in the chaos${d.intro?'. Something tells you he\'ll be back.':' and will be back a level stronger.'}`):'The team is carried out of the lair.'}</div>`:''}</div>`}).join('')}
      <div class="fsb"><button class="btn" data-a="sdlook">See the board</button><button class="btn pri" data-a="debrief">Debrief</button></div></div>`}
  return ''}
/* Version 134 (Tyler): hit feedback. Each render compares health and torn pages with the last render of the same fight and
   floats a damage number where something dropped. A hero losing 3+ health or a villain losing 2+ pages shakes the board. */
let HPS={sd:null,m:{}},SHK=0;
function hitTick(sd){const fresh=HPS.sd!==sd;if(fresh)HPS={sd,m:{}};const m=HPS.m;let big=false;
  const see=(key,val,cx,cy,k,bigAt)=>{const was=m[key];m[key]=val;if(fresh||was==null||val>=was)return;const d=was-val;fx(cx+.3,cy-.3,'−'+d,k);if(d>=bigAt)big=true};
  sd.units.forEach(o=>{const c=HC(o.x,o.y);see('h'+o.hid,heroOf(o).hp,c.cx,c.cy,'dmgh',3)});
  sd.hench.forEach(x=>{const c=HC(x.x,x.y);see('m'+x.id,x.hp,c.cx,c.cy,'dmg',9)});
  sd.vl.forEach((o,i)=>{const c=vCtr(o.v);see('v'+i,-(o.v.wounds||[]).length,c.cx,c.cy,'dmg',2)});
  if(big)SHK=Date.now()}
/* Version 141 (Tyler): subtle facing zones. Hexes up to two away in a villain's front arc get the lair's --zf tint and its
   blind spot gets --zr (sideOf decides). Hidden Nocturne shows none. Drawn above the floor, under every token. */
function vZones(W,H){const sd=S.sd;if(sd.result)return '';let s='';const wl=new Set((sd.walls||[]).map(w=>w.k));
  sd.vl.forEach(o=>{const v=o.v;if(v.down||v.hide)return;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!inB(x,y)||inV(v,x,y)||wl.has(x+','+y))continue;const d=dV({x,y},v);if(d<1||d>2)continue;const z=sideOf({x,y},v);if(z==='flank')continue;const h=HC(x,y);
      s+=`<polygon class="z${z==='front'?'f':'r'}${d>1?' z2':''}" points="${VHX(h.cx,h.cy,.97)}"/>`}});
  return s?`<svg class="zones" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`:''}
function sdView(){const sd=S.sd,def=VILLAINS[sd.vkey],v=sd.v;
  const u=sd.sel!=null?sd.units[sd.sel]:null,h=u?heroOf(u):null;
  let reachM={},tg=new Set(),al=new Set();
  if(u&&!sd.busy){if(sd.mode==='move'&&!u.moved)reachM=reachH(u,stat(h,'move')+(u.boost||0));
    const rng=stat(h,'range');
    const vt=o=>vCells(o.v).forEach(({x,y})=>tg.add(x+','+y));
    if(sd.mode==='attack'||sd.mode==='arc'){sd.vl.forEach(o=>{if(!o.v.down&&dV(u,o.v)<=rng&&!shotVB(u,o.v))vt(o)});sd.hench.forEach(m=>{if(cheb(m,u)<=rng&&!shotBlocked(u,m))tg.add(m.x+','+m.y)})}
    if(sd.mode==='patch')live().forEach(o=>{if(cheb(o,u)<=3)al.add(o.x+','+o.y)});
    const sab=sd.abKey&&GEAR[sd.abKey]&&GEAR[sd.abKey].ab,sr=sab&&sab.r!=null?abV(sab.r,potOf(h)):0;
    if(sd.mode==='abally')live().forEach(o=>{if(cheb(o,u)<=sr)al.add(o.x+','+o.y)});
    if(sd.mode==='abstrike')sd.vl.forEach(o=>{if(!o.v.down&&(!sab.rng||dV(u,o.v)<=sab.rng))vt(o)});
    if(sd.mode==='barricade')for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(cheb({x,y},u)<=2&&!blocked(x,y))reachM[x+','+y]=1;
    if(sd.mode==='abtele'||sd.mode==='abcover')for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(cheb({x,y},u)<=sr&&!blocked(x,y))reachM[x+','+y]=1}
  const W=BW(),H=BH(),P=(x,y)=>{const c=HC(x,y);return `left:${(c.cx-.5)*100/W}%;top:${(c.cy-HS)*100/H}%;width:${100/W}%;height:${2*HS*100/H}%`},D=(x,y)=>{const c=HC(x,y);return `data-cx="${c.cx}" data-cy="${c.cy}"`};
  const blindK=new Set(),frontK=new Set();sd.vl.forEach(o=>{if(o.v.down||o.v.hide)return;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const p={x,y};if(inV(o.v,x,y)||dV(p,o.v)>3)continue;const sd2=sideOf(p,o.v);if(sd2==='rear')blindK.add(x+','+y);else if(sd2==='front')frontK.add(x+','+y)}});
  const blastK=new Set(),blast2K=new Set();(sd.bombs||[]).forEach(b=>hexesWithin(bombP(b),1).forEach(p=>(b.fuse<=1?blastK:blast2K).add(p.x+','+p.y)));
  const litM=litMap();let cells='';for(let y=0;y<N;y++)for(let x=0;x<N;x++){const k=x+','+y;const c=['cell'];if(litM[k])c.push('beam');if(blindK.has(k))c.push('blind');else if(frontK.has(k))c.push('front');if((sd.exits||[]).includes(k))c.push('exit');if(sd.obs.includes(k))c.push('obs');if(sd.walls&&sd.walls.some(w=>w.k===k))c.push('wall');if(sd.pits&&sd.pits.includes(k))c.push('pit');if(sd.haz&&sd.haz.some(h=>h.k===k))c.push('haz');if(blastK.has(k))c.push('blast');else if(blast2K.has(k))c.push('blast2');if(sd.vl.some(o=>o.v.charge&&o.v.charge.zone.includes(k)))c.push('tele');if(sd.firing&&sd.firing.includes(k))c.push('firing');if(k in reachM)c.push('reach');if(tg.has(k))c.push('tgt');if(al.has(k))c.push('ally');
    cells+=`<button class="${c.join(' ')}" data-cell="${k}" data-tip="cell:${x}:${y}" style="${P(x,y)}" aria-label="Hex ${x+1},${y+1}${(sd.exits||[]).includes(k)?', exit':''}${blindK.has(k)?', blind spot':frontK.has(k)?', front arc':''}${litM[k]?', lit beam':''}">${c.includes('wall')?wallArms(x,y):''}</button>`}
  if((sd.beams||[]).length)cells+=`<svg class="beams" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${sd.beams.map(b=>{const[ax0,ay0]=b.k0.split(',').map(Number),[zx,zy]=b.ks[b.ks.length-1].split(',').map(Number),p=HC(ax0,ay0),z=HC(zx,zy),ln=(w,col,op)=>`<line x1="${p.cx}" y1="${p.cy}" x2="${z.cx}" y2="${z.cy}" stroke="${col}" stroke-width="${w}" opacity="${op}"/>`;return ln(.42,'#FF2D55',b.ttl>1?.22:.14)+ln(.2,'#FF2D55',b.ttl>1?.6:.4)+ln(.07,'#FFE3EA',.95)+`<line class="flow" x1="${p.cx}" y1="${p.cy}" x2="${z.cx}" y2="${z.cy}" stroke="#fff" stroke-width=".05" opacity=".9"/><circle cx="${p.cx}" cy="${p.cy}" r=".13" fill="#FF2D55" stroke="#fff" stroke-width=".04"/>`}).join('')}</svg>`;
  const hurt=o=>o.hurtAt&&Date.now()-o.hurtAt<450?'hurt':'';
  const FR={one:1.3,tri:2.2,diamond:2.5,big:3.4,serpent:1.3,swarm:1.3};
  const VT=[];sd.vl.forEach((o,i)=>{const v=o.v;if(v.down)return;const fc=sd.vl.length>1&&i===sd.vi?'focus':'';
    if(v.sw){swBodies(v).forEach(b=>VT.push([b.y,`<div class="vtok ${hurt(v)} ${fc}" data-tid="v${i}${b.i?'s'+b.i:''}" ${D(b.x,b.y)} style="${P(b.x,b.y)};${vSty(b.k)}">${vStandee(b.k,[{x:b.x,y:b.y}],null,b.i?0:v.level,b.x,b.y,1)}<span class="face" style="left:50%;top:50%;width:130%;--fa:${FACE_DEG[b.f??5]}deg" data-tip="kw:swarm"><i></i></span></div>`]));return}
    const a=HC(v.x,v.y),cc=vCtr(v),cs=vCells(v);
    VT.push([Math.max(...cs.map(c=>c.y)),`<div class="vtok ${hurt(v)} ${v.charge?'charging':''} ${fc}" data-tid="v${i}" ${D(v.x,v.y)} style="${P(v.x,v.y)};${vSty(o.key)}">${vStandee(o.key,v.body?[cs[0]]:cs,v.body?cs.slice(1):null,v.level,v.x,v.y,0,v.hide)}<span class="face${v.hide?' hid':''}" style="left:${(cc.cx-a.cx)*100+50}%;top:${(cc.cy-a.cy)*100/(2*HS)+50}%;width:${(FR[v.shape]||1.3)*100}%;--fa:${v.hide?0:FACE_DEG[v.face??5]}deg" data-tip="kw:${v.hide?'vhide':'facing'}">${v.hide?'<em>?</em>':'<i></i>'}</span></div>`])});
  let toks='';
  sd.vl.forEach(o=>{const v=o.v;if(v.down||!v.warn||!v.deck[0]||v.deck[0].uid!==v.warn)return;const cc=vCtr(v),lo=cc.cy<2.2,ext=(FR[v.shape]||1.3)/2;if(v.hush===v.warn)return;toks+=`<div class="shout ${lo?'below':''}" data-a="hush:${sd.vl.indexOf(o)}" role="button" aria-label="Dismiss shout" style="left:${cc.cx*100/W}%;top:${(cc.cy+(lo?ext:-.3))*100/H}%">“${esc(v.deck[0].shout)}”</div>`});
  (sd.exits||[]).forEach(k=>{const[x,y]=k.split(',').map(Number);if(sd.units.some(o=>!o.ko&&o.x===x&&o.y===y)||sd.civs.some(c=>c.x===x&&c.y===y))return;const h=HC(x,y);
    toks+=`<div class="tok exitt" ${D(x,y)} style="${P(x,y)}" data-tip="kw:exit">${miniSvg(x,y,MINI.exitA(h.cx,h.cy,y>=N-1?90:y===0?-90:x===0?180:0))}</div>`});
  if(sd.term){const p=termP(),h=HC(p.x,p.y);VT.push([p.y,`<div class="tok termt" ${D(p.x,p.y)} style="${P(p.x,p.y)}" data-tip="kw:terminal">${miniSvg(p.x,p.y,MINI.terminal(h.cx,h.cy))}</div>`])}
  (sd.bombs||[]).forEach(b=>{const p=bombP(b),h=HC(p.x,p.y);VT.push([p.y,`<div class="tok bombt" ${D(p.x,p.y)} style="${P(p.x,p.y)}">${miniSvg(p.x,p.y,MINI.bomb(h.cx,h.cy,b.fuse,b.fuse<=1))}</div>`])});
  sd.civs.forEach(c=>{const fu=c.f&&sd.units.find(o=>o.hid===c.f),held=civHeld(c),pz=!sd.busy&&!sd.result&&panicky(c),pn=c.panic&&Date.now()-c.panic<1200,h=HC(c.x,c.y);
    const ring=fu?BASE(heroOf(fu)).col:held?'#C92463':null,art=MINI.civArt(eyeHash(c.id),{panic:pz||held||pn});
    VT.push([c.y,`<div class="tok civt ${pn?'panic':''}" data-tid="c${c.id}" ${D(c.x,c.y)} style="${P(c.x,c.y)}" title="Civilian">${miniSvg(c.x,c.y,miniStand(h.cx,h.cy,art,'#F3CB4B',ring,.8,pz?miniBang:null,'crim'))}</div>`])});
  sd.hench.forEach(m=>{const h=HC(m.x,m.y),[b,a]=VART[m.owner]||VART.mole,art=(MINI.HF[m.owner]||MINI.HF.swarm)(b,a),el=m.elite;
    VT.push([m.y,`<div class="tok hmt ${hurt(m)}" data-tid="m${m.id}" ${el?'data-tip="kw:elite"':''} ${D(m.x,m.y)} style="${P(m.x,m.y)}">${miniSvg(m.x,m.y,miniStand(h.cx,h.cy,art,b,el?'#F3CB4B':null,el?.98:.86,miniNum(m.hp),'erim'))}</div>`])});
  /* standees overlap the hex above, so heroes and villains are drawn top rows first (villains by their lowest row) */
  sd.units.forEach((o,i)=>{const hh=heroOf(o),b=BASE(hh);const done=o.moved&&o.acted;
    VT.push([o.y+.1,`<div class="tok hst ${o.ko?'ko':''} ${sd.sel===i?'sel':''} ${done?'done':''} ${hurt(o)}" data-tid="h${o.hid}" ${D(o.x,o.y)} style="${P(o.x,o.y)}"><span class="st" title="${esc(hh.name)}">${standee(hh,o)}${o.guard?'<span class="gd"></span>':''}${hh.comp<=0&&!o.ko?'<span class="sh">!</span>':''}</span></div>`])});
  VT.sort((p,q)=>p[0]-q[0]).forEach(t=>toks+=t[1]);
  if(!FAST)hitTick(sd);const now=Date.now();(sd.fx||[]).forEach(f=>{const el=now-f.born;if(el>1600)return;
    toks+=`<div class="fx k-${f.k}" style="left:${f.cx*100/W}%;top:${f.cy*100/H}%;animation-delay:-${el}ms" aria-hidden="true"><div class="b"><span>${esc(f.t)}</span></div></div>`});
  const pipT=v.deck.length+v.discard.length+v.wounds.length;
  const vbar=`<div class="pips" aria-label="Playbook" data-tip="kw:pips">${v.deck.map(()=>'<span class="pip f"></span>').join('')}${v.discard.map(()=>'<span class="pip d"></span>').join('')}${v.wounds.map(()=>'<span class="pip w"></span>').join('')}</div>`;
  let ctrl;
  if(sd.result&&sd.patrol){ctrl=`<div class="cap"><b>Patrol cleared.</b> Both Diggers are down.</div><button class="btn pri" data-a="tut:hq">Head back to HQ</button>`}
  else if(sd.result){ctrl=`<div class="cap"><b>${sd.result==='win'?'Victory.':sd.result==='loss'?'Defeat.':'Escape.'}</b> Head back to HQ to count the cost.</div><button class="btn pri" data-a="debrief">Debrief</button>`}
  else if(sd.busy){ctrl=`<div class="cap">${sd.vturn?`${def.name} is acting…`:'Resolving…'}</div>`}
  else if(u&&h){const p=POWERS[BASE(h).power];const canAct=!u.acted&&!u.ko;const adjCiv=sd.civs.some(c=>c.f!==u.hid&&!civHeld(c)&&cheb(c,u)<=1),nFol=followers(u).length;
    const freeP=!!p.free;
    ctrl=`<div class="row between hrow"><div class="hwho">${eyesArt(h)}<div><h3>${esc(h.name)}</h3><div class="small muted hline"><span data-tip="kw:hp">${UI('hp')}${h.hp}/${stat(h,'maxHp')}</span> · <span data-tip="kw:comp">${UI('comp')}${h.comp}/${stat(h,'maxComp')}</span>${h.comp<=0?' · <b style="color:var(--magenta)" class="kwd" data-tip="kw:shaken">Shaken (−2 STR/ACC/EVA, −1 MOV)</b>':''}${u.dazed?' · <span class="kwd" data-tip="kw:dazed">Dazed</span>':''}</div></div></div>
      <span class="hst"><span class="${u.moved?'used':''}" title="${u.moved?'Moved':'Can move'}" aria-label="${u.moved?'Moved':'Can move'}">${UI('move')}</span><span class="${u.acted?'used':''}" title="${u.acted?'Acted':'Can act'}" aria-label="${u.acted?'Acted':'Can act'}">${UI('atk')}</span></span></div>
      <div class="row">
        <button class="btn sm sub ${sd.mode==='move'?'on':''}" data-a="mode:move" data-tip="act:move" ${u.moved?'disabled':''}>${UI('move')}Move<small>${stat(h,'move')+(u.boost||0)} hex${stat(h,'move')+(u.boost||0)===1?'':'es'}</small></button>
        <button class="btn sm sub ${sd.mode==='attack'?'on':''}" data-a="mode:attack" data-tip="act:attack" ${canAct?'':'disabled'}>${UI('atk')}Attack<small>Range ${stat(h,'range')}</small></button>
        <button class="btn sm abtn t-${POW_ENG[BASE(h).power].d} ${sd.mode===BASE(h).power?'on':''}" data-a="power" data-tip="pow:${BASE(h).power}" ${powOk(u,h)?'':'disabled'}>${p.name}<small>${powCost(BASE(h).power,true)}</small></button>
        <button class="btn sm" data-a="escort" data-tip="act:escort" ${(canAct||u.freeEvac)&&adjCiv?'':'disabled'}>Escort</button>${sd.term?`<button class="btn sm" data-a="hack" data-tip="act:hack" ${canHack(u)?'':'disabled'}>${UI('intel')}Hack</button>`:''}${nFol?`<button class="btn sm" data-a="letgo" data-tip="act:letgo">Let go (${nFol})</button>`:''}
      </div><div class="small muted">${p.txt}</div>
      <div class="resrow"><span class="r" style="--tc:var(--cyan)" data-tip="kw:comp">${UI('comp')} ${[...Array(stat(h,'maxComp'))].map((_,i)=>`<i class="${i<h.comp?'f':''}"></i>`).join('')} <b class="mono">${h.comp}/${stat(h,'maxComp')}</b></span></div>
      ${pwrMax(h)||arcMax(h)||potOf(h)?`<div class="resrow">${pwrMax(h)?`<span class="r t-tech" data-tip="res:tech">PWR ${[...Array(pwrMax(h))].map((_,i)=>`<i class="${i<u.res.tech?'f':''}"></i>`).join('')} <b class="mono">${u.res.tech}/${pwrMax(h)} · +${pwrRegen(h)}/rd</b></span>`:''}${arcMax(h)?`<span class="r t-magic" data-tip="res:magic">ARC ${[...Array(arcMax(h))].map((_,i)=>`<i class="${i<u.res.magic?'f':''}"></i>`).join('')} <b class="mono">${u.res.magic}/${arcMax(h)}</b></span>`:''}${potOf(h)?`<span class="r t-innate" data-tip="res:innate">POT <b class="mono">${potOf(h)}</b> · ${Math.max(0,innUses(h)-(u.innUsed||0))?'Innate ready':'Innate used'}</span>`:''}</div>`:''}
      ${(u.boost||u.buffDice||u.buffStr||u.ward||u.absorb||u.evaNext||u.buffAcc||u.buffBack||u.buffReap||u.dr||u.buffEva||u.anchor)?`<div class="row">${u.boost?`<span class="tag g" data-tip="kw:boost">+${u.boost} next move${u.boostJump?' (jump)':''}</span>`:''}${u.buffDice?`<span class="tag g" data-tip="kw:buff">+${u.buffDice} dice next attack</span>`:''}${u.buffStr?`<span class="tag g" data-tip="kw:buff">+${u.buffStr} Strength next attack</span>`:''}${u.ward?'<span class="tag g" data-tip="kw:warded">Warded</span>':''}${u.absorb?`<span class="tag g" data-tip="kw:absorb">Shield: absorbs ${u.absorb}</span>`:''}${u.buffAcc?`<span class="tag g" data-tip="kw:buff">+${u.buffAcc} accuracy next attack</span>`:''}${u.buffBack?`<span class="tag g" data-tip="kw:buff">+${u.buffBack} dice on a melee attack from a side or the rear</span>`:''}${u.buffReap?`<span class="tag g" data-tip="kw:buff">Reap ${u.buffReap} per page</span>`:''}${u.dr?`<span class="tag g" data-tip="kw:guard">Guard −${u.dr} per hit</span>`:''}${u.buffEva?`<span class="tag g" data-tip="kw:guard">+${u.buffEva} evasion</span>`:''}${u.evaNext?`<span class="tag g" data-tip="kw:windward">Wind Ward +${u.evaNext} evasion</span>`:''}${u.anchor?'<span class="tag g" data-tip="kw:anchor">Anchored</span>':''}</div>`:''}
      ${auraTags(u)}${u.ripo||(gearHas(h,'relent')&&u.relN&&u.relKey===sd.vkey)?`<div class="row">${u.ripo?'<span class="tag g" data-tip="kw:riposte">Riposte ready</span>':''}${gearHas(h,'relent')&&u.relN&&u.relKey===sd.vkey?`<span class="tag g" data-tip="kw:relent">Relentless +${Math.min(1,u.relN)} vs ${VILLAINS[sd.vkey].short}</span>`:''}</div>`:''}
      ${(sd.mode==='attack'||sd.mode==='arc')&&canAct&&!tg.size?`<div class="cap">Nothing in range. ${esc(h.name)} reaches ${stat(h,'range')} hex${stat(h,'range')===1?'':'es'}${stat(h,'range')===1?', so they must stand next to the target':''}, and walls, rubble and other units block shots. Move first, then attack.</div>`:''}
      ${abButtons(u,h)}
      <div class="eyebrow">Character sheet</div>${heroCard(h,'fight')}`}
  else ctrl=`<div class="small muted">Tap a hero to select them. Each hero can move once and take one action per round. Long-press any hex to see what is on it, or any button, stat or keyword for details.</div>`;
  const last=(v.last?`<div class="cap"><b>${esc(v.last.n)}.</b> ${esc(v.last.txt)}</div>`:'')+
    (sd.v.foresee?`<div class="cap t-magic" style="border-color:var(--tc)"><b>Foreseen next card:</b> ${v.deck.length?`${esc(v.deck[0].n)}. ${esc(v.deck[0].txt)}`:'The playbook will be reshuffled first.'}</div>`:'')+
    sd.vl.filter(o=>!o.v.down&&o.v.warn&&o.v.deck[0]&&o.v.deck[0].uid===o.v.warn).map(o=>`<div class="cap warn" data-tip="kw:sigmove"><b>${VILLAINS[o.key].short} shouts: “${esc(o.v.deck[0].shout)}”</b> A Signature Move is next. Tear a page before the villain acts to rip it out.</div>`).join('')+
    sd.vl.filter(o=>o.v.charge&&!o.v.down).map(o=>`<div class="cap charge" data-tip="kw:charge"><b>${VILLAINS[o.key].short} is charging ${esc(o.v.charge.n)}.</b> Fires for ${o.v.charge.dmg} on the marked hexes next villain turn instead of a new page. Torn since: ${o.v.wounds.length-o.v.charge.w0} of ${o.v.charge.need||2} needed to stagger it.</div>`).join('')+
    ((sd.bombs||[]).length?`<div class="cap charge" data-tip="kw:bomb"><b>${sd.bombs.length} lit bomb${sd.bombs.length>1?'s':''} on the board.</b> ${sd.bombs.some(b=>b.fuse<=1)?'Hexes striped red blow at the start of the next villain turn, so get 2 hexes clear of the bomb.':'The numbers count down each villain turn.'}</div>`:'')+
    (v.marked?'<div class="small"><span class="disc t-innate" data-tip="kw:marked">Marked: +1 die on side and rear attacks this round</span></div>':'')+(v.cursed?'<div class="small"><span class="disc t-magic" data-tip="kw:cursed">Cursed: −2 damage this round</span></div>':'')+
    (sd.v.hex?'<div class="small"><span class="disc t-magic" data-tip="kw:hexed">Hexed: −${hexA(sd.v.hex)} evasion this round</span></div>':'')+(v.skip?'<div class="small"><span class="disc t-magic" data-tip="kw:frozen">Time Stop: loses its next turn</span></div>':'')+(v.blind?'<div class="small"><span class="disc t-tech" data-tip="kw:blinded">Blinded: −4 accuracy this round</span></div>':'')+(v.excise?'<div class="small"><span class="disc t-tech" data-tip="kw:excise">Find the Flaw: you pick the next page torn this round</span></div>':'')+(v.callout?`<div class="small"><span class="disc t-tech" data-tip="kw:callout">Called out: +${v.callout} dice on the next hero attack</span></div>`:'');
  return `<section class="panel">
    <div class="row between"><div>${sd.patrol?`<div class="eyebrow">Patrol · Round ${sd.round}</div><h2>Subway platform</h2>`:`<div class="eyebrow">${sd.finale?'Event comic':'Lair showdown'} · Round ${Math.max(1,sd.round)} · <span class="kwd" data-tip="kw:q_${sd.quality}">${QUAL[sd.quality].n}</span></div><h2>${sd.finale&&S.event?esc(S.event.title):def.name}</h2>`}</div>
    <span class="small mono" data-tip="kw:evac">Evac ${sd.evac} · Harmed ${sd.harmed}</span></div>
    ${sd.vl.length>1?`<div class="row vswitch"><span class="eyebrow">Target</span>${sd.vl.map((o,i)=>`<button class="btn sm ${i===sd.vi?'on':''}" data-a="focus:${i}" ${o.v.down?'disabled':''} style="${vSty(o.key)}">${vIc(o.key)}${VILLAINS[o.key].short} · ${o.v.down?'down':`${o.v.deck.length+o.v.discard.length} pages`}</button>`).join('')}</div>`:''}
    ${sd.patrol?'':`<div class="row between small"><span>${sd.vl.length>1?`<b>${VILLAINS[sd.vkey].short}</b> · `:''}<span class="kwd" data-tip="kw:playbook">Playbook</span> <b class="mono">${v.deck.length}</b> · <span class="kwd" data-tip="kw:discard">Discard</span> <b class="mono">${v.discard.length}</b> · <span class="kwd" data-tip="kw:wound">Torn</span> <b class="mono">${v.wounds.length}</b> of ${pipT}</span><button class="btn sm" data-a="book:${sd.vkey}">Read playbook</button></div>
    ${vbar}${last}`}
    <div class="boardwrap"><div class="board${lairCls()}${Date.now()-SHK<320?' shk':''}" style="aspect-ratio:${W}/${H};animation-delay:-${Math.min(320,Date.now()-SHK)}ms">${cells}${lairCls()?'<div class="amb"></div>':''}${vZones(W,H)}${toks}</div></div>
    ${!sd.result&&!sd.busy?`<button class="btn pri" data-a="endround">End round</button>`:''}
    ${coll('legend','<span class="eyebrow">Board key</span>',`<div class="legend"><span data-tip="kw:civilian"><span class="vic" style="--vc:var(--yellow)">${IC('civ')}</span>Civilian</span><span data-tip="kw:exit"><i class="sw" style="background:color-mix(in srgb,var(--good) 32%,var(--panel));border:1.5px solid var(--good)"></i>Exit</span><span data-tip="kw:henchman"><span class="vic" style="${vSty(sd.vkey)};border-radius:25%">${mIc(sd.vkey)}</span>Henchman (HP)</span><span data-tip="kw:rubble"><span class="vic" style="--vc:var(--line)">${IC('rubble')}</span>Rubble</span><span data-tip="kw:walls"><i class="sw" style="background:#7A5A48"></i>Wall</span><span data-tip="kw:pit"><i class="sw" style="background:radial-gradient(#030407 40%,#3A404D)"></i>Pit</span><span data-tip="kw:haz"><i class="sw" style="background:#F08A4B"></i>Molten</span><span data-tip="kw:charge"><i class="sw" style="background:repeating-linear-gradient(45deg,#F3CB4B 0 3px,transparent 3px 6px)"></i>Charge zone</span><span data-tip="kw:terminal"><span class="vic" style="--vc:var(--cyan)">${UI('intel')}</span>Evidence terminal</span><span data-tip="kw:bomb"><span class="vic" style="--vc:#FFD27A">${IC('bomb')}</span>Bomb (fuse)</span><span data-tip="kw:braced"><i class="sw" style="background:var(--yellow);transform:rotate(45deg);width:9px;height:9px"></i>Braced</span><span data-tip="kw:facing"><i class="sw" style="width:0;height:0;border:0;border-top:6px solid transparent;border-bottom:6px solid transparent;border-left:10px solid var(--yellow)"></i>Facing</span><span data-tip="kw:blind"><i class="sw" style="background:color-mix(in srgb,var(--ink) 18%,var(--panel))"></i>Blind spot</span><span data-tip="kw:facearc"><i class="sw" style="background:color-mix(in srgb,var(--magenta) 22%,var(--panel))"></i>Front arc</span></div>`,false,'nested')}
    ${ctrl}
  </section>
  <section class="panel">${coll('sd-log','<div class="eyebrow">Combat log</div>',`<div class="log">${sd.log.slice().reverse().map(l=>`<p class="${l.k}">${esc(l.t)}</p>`).join('')}</div>`)}</section>`}

function abOk(u,h,k){const g=GEAR[k],a=g&&g.ab,sd=S.sd;if(!a||u.ko)return false;const f=a.fx||{};
  if(g.cons){if(!pouchOf(h).includes(k))return false}else if(g.type!=='innate'&&(u.abUsed||[]).includes(k))return false;else if(g.type==='innate'){if(potOf(h)<a.min||!innOk(u,h))return false}else if((u.res[g.type]||0)<a.c)return false;
  if(a.act&&u.acted)return false;if(f.move&&!u.moved)return false;if(f.boost&&u.boost)return false;if(f.again&&!u.acted)return false;
  if(f.eclipse&&!sd.vl.some(o=>o.v.charge&&!o.v.down))return false;if(f.mark&&u.markUsed)return false;
  if((f.tear||f.skip||f.hex||f.curse||f.face||f.foresee||f.mark||f.callout||f.blind||f.scry||f.bury||f.excise||f.scramble||f.vsplash)&&sd.v.down)return false;
  if(f.gain&&(u.res.magic||0)>=arcMax(h))return false;if(f.gainP&&(u.res.tech||0)>=pwrMax(h))return false;
  return true}
function abButtons(u,h){const ks=[...new Set(Object.values(h.gear)),...new Set(pouchOf(h))].filter(g=>GEAR[g].ab);if(!ks.length)return '';const P=potOf(h);
  return `<div class="row">${ks.map(k=>{const g=GEAR[k],a=g.ab,ok=abOk(u,h,k),low=g.type==='innate'&&P<a.min,on=S.sd.abKey===k&&S.sd.mode&&S.sd.mode.startsWith('ab');
    return `<button class="btn sm abtn t-${g.type} ${on?'on':''}" data-a="ab:${k}" data-tip="gear:${k}" ${ok?'':'disabled'} title="${esc(low?`Requires Innate rank ${a.min}. ${abTxt(a)}`:abTxt(a,g.type==='innate'?P:null))}">${a.n}<small>${abCost(g,true)}</small></button>`}).join('')}</div>`}
function afterView(){const a=S.after,d=VILLAINS[a.vkey];
  const eth=a.ethos?ETHOS[a.ethos]:null;
  const bad=/Defeat|Slipped/.test(a.headline);
  return `<section class="panel"><div class="eyebrow">Aftermath · ${d?d.name:'Headquarters'}</div><div><span class="sfxhead ${bad?'bad':''}">${a.headline}</span></div>
  ${a.lines.length>3?coll('after-lines','<span class="eyebrow">What happened · '+a.lines.length+'</span>',`<ul class="lines">${a.lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`):`<ul class="lines">${a.lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`}
  ${eth?`<div class="cap"><b>A defining moment.</b> ${eth.q} This choice is permanent.</div><div class="grid2">${eth.opts.map(o=>`<button class="btn opt" data-a="ethos:${a.ethos}:${o.id}"><span>${o.n}</span><small>${o.txt}</small></button>`).join('')}</div>`
    :`<button class="btn pri" data-a="next">${S.over?'See how the volume ends':S.arcInfo?`Arc ${S.arcInfo.arc} begins`:S.finalePending?'Open the event comic':`Begin issue #${S.issue}`}</button>`}</section>`}
function overView(){const o=S.over;return `<section class="panel"><div class="eyebrow">Volume ${S.vol}</div><div><span class="sfxhead ${o.win?'':'bad'}">${o.win?'The End':'Cancelled!'}</span></div>
  <p style="margin:0">${o.txt}</p>${coll('over-chron','<span class="eyebrow">Back issues · '+S.chronicle.length+'</span>',`<ul class="lines small">${S.chronicle.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`,false)}
  <button class="btn pri" data-a="restart">Start Volume ${S.vol+1}</button><p class="small muted" style="margin:0">A new volume starts a fresh team and three random villains. What you learned about villain playbooks carries over.</p></section>`}

/* ============ ORIGIN STORY VIEWS ============ */
const O_STATS=[['HP','maxHp'],['MOV','move'],['DICE','speed'],['ACC','acc'],['STR','str'],['EVA','eva'],['RNG','range'],['COMP','maxComp']];
const O_SK={maxHp:'hp',move:'move',speed:'speed',acc:'acc',str:'str',eva:'eva',range:'range',maxComp:'comp'};
const TRACK_HOW={tech:'Abilities spend Power, a pool of your Tech rank + 1 for each Tech item you wear that slowly recharges during a fight. Every Tech item has an ability.',
  innate:'Abilities spend nothing but require a minimum Innate rank (1 at the start), and you fire one per round. Many grow with your Innate rank.',
  magic:'Spells spend Arcana, a pool of your Magic rank + the Magic rank each item you wear requires that does not refill during a fight. Spells hit harder, and every Magic weapon carries one.'};
const trackTxt=t=>`${TRACKS[t].name} discipline: ${TRACK_HOW[t]} Ranks go up to ${RANK_MAX}, and rank ${RANK_MAX} is a capstone: ${perkTxt(t,RANK_MAX)}.`;
function oMech(sid,o,c){
  if(sid==='life')return o.field?`Field ability, ${FIELD_AB[o.field].n}: ${FIELD_AB[o.field].txt}`:`${modsTxt(o.mods)}.`;
  if(sid==='spark')return `${modsTxt(o.mods)}. ${trackTxt(o.track)}`;
  if(sid==='gift')return `Signature power, ${POW_ENG[o.power].d==='innate'?'':'costs '}${powCost(o.power)}. ${POWERS[o.power].txt}`;
  if(sid==='style')return `Range ${o.range} (${o.range>1?'attacks from a distance':'melee, must be adjacent'}). ${modsTxt(o.mods)}.`;
  if(sid==='drive')return `${modsTxt(o.mods)}.`;
  if(sid==='career'){const L=xArc()+1+(o.lvl||0);return `Arrives at level ${L}, with ${1+(o.gear||0)} gear pick${o.gear?'s':''} and ${1+(o.hq||0)} HQ bonus${o.hq?'es':''}.`}
  if(sid==='training'){const r=oRanks({...c,picks:{...c.picks,training:o.id}});return `Ends with ${Object.keys(TRACKS).filter(t=>r[t]).map(t=>`${TRACKS[t].name} ${r[t]}`).join(' · ')}. Every rank opens higher gear; rank 5 adds a capstone. Tech and Magic ranks add 2 to their pool, Innate ranks unlock and strengthen Innate abilities. Ranks cap at ${RANK_MAX}.`}
  if(sid==='hq')return o.txt;
  return ''}
function oHero(c){const r=oBuild(c),b=r.base,xo=c.mode==='xover';const h={...newHero('custom',b.name,b),ranks:r.ranks,upgrades:xo?c.ups.slice():[],gear:{}};if(xo)c.gear.forEach(g=>putGear(h,g));return h}
function oPreview(c){const r=oBuild(c),b=r.base,xo=c.mode==='xover',h=oHero(c);
  const st=O_STATS.map(([l,k])=>{const v=stat(h,k),d=v-O_TEMPLATE[k];return `<div class="stat ${d>0?'up':d<0?'dn':''}" data-tip="ostat:${k}"><b>${(k==='acc'||k==='str')&&v>=0?'+':''}${v}</b><span>${l}</span></div>`}).join('');
  const sp=oOpt('spark',c.picks.spark),gift=oOpt('gift',c.picks.gift);
  return `<aside class="card opv"><div class="eyebrow">The hero so far</div>
    <div class="row"><span class="sw" style="background:${c.col};border-radius:50%;width:16px;height:16px"></span><h3>${esc(b.name)}</h3><span class="lvl">LVL ${r.level}</span></div>
    <div class="small muted">${esc(b.role)}</div>
    ${sp?`<div class="row">${Object.keys(TRACKS).filter(t=>r.ranks[t]).map(t=>`<span class="disc fill t-${t}" data-tip="kw:${t}">${TRACKS[t].name} ${r.ranks[t]}</span>`).join('')}</div>`:''}
    ${sp?`<div class="small muted" data-tip="kw:engines">Engines: ${poolTxt(h)}</div>`:''}
    <div class="stats">${st}</div>
    ${gift?`<div class="small" data-tip="pow:${gift.power}"><b>${POWERS[gift.power].name}.</b> ${POWERS[gift.power].txt}</div>`:''}
    ${b.field?`<div class="small fieldab" data-tip="kw:field"><b>${b.field.n}</b> ${b.field.txt}</div>`:''}
    ${xo&&c.gear.length?`<div class="small"><b>Gear:</b> ${c.gear.map(g=>GEAR[g].name).join(', ')}</div>`:''}
    <p class="small muted" style="margin:0">Long-press a stat to see where it came from.</p></aside>`}
function createView(){const c=S.cre,steps=oSteps(c),sid=steps[c.step],pg=ORIGIN[sid],xo=c.mode==='xover',last=c.step===steps.length-1;
  const strip=`<div class="ostrip">${steps.map((s,i)=>`<span class="${i<c.step?'f':i===c.step?'cur':''}" title="${ORIGIN[s].t}"></span>`).join('')}</div>`;
  const head=`<div class="ohead ${xo?'xo':''}"><small>${xo?'Crossover Issue · Established Character':'Origin Story · Basic hero'} · Page ${c.step+1} of ${steps.length}</small>${strip}</div>`;
  const navb=`<div class="row between"><button class="btn" data-a="${c.step?'oback':'ocancel'}">${c.step?'Back':'Cancel'}</button>${last?'':`<button class="btn pri" data-a="onext" ${oValid(c,sid)?'':'disabled'}>${steps[c.step+1]==='cover'?'See the cover':'Next page'}</button>`}</div>`;
  if(sid==='cover')return `<section class="panel ocomic">${head}${oCover(c)}${navb}</section>`;
  const optBtn=(o,sel,mech,extra='')=>`<button class="btn opt oopt ${sel?'sel':''}" data-a="opick:${sid}:${o.id}" data-tip="oopt:${sid}:${o.id}" ${extra}><span class="on">${esc(o.n)}</span>${o.fl?`<i class="fl">“${esc(o.fl)}”</i>`:''}<small class="mech">${mech}</small></button>`;
  let inner='';
  if(sid==='spark'){const sp=oOpt('spark',c.picks.spark),d=c.disc||(sp&&sp.track);
    inner=`<div class="eyebrow">First, pick a discipline</div><div class="ogrid odisc">${Object.keys(TRACKS).map(t=>`<button class="btn opt oopt t-${t} ${d===t?'sel':''}" data-a="odisc:${t}" data-tip="kw:${t}"><span class="on" style="color:var(--tc)">${TRACKS[t].name}</span><small class="mech">${trackTxt(t)}</small><small>${O_POW[t].length} powers: ${O_POW[t].map(p=>POWERS[p].name).join(', ')}</small></button>`).join('')}</div>
    ${d?`<div class="eyebrow">Then, how it happened</div><div class="ogrid">${pg.opts.filter(o=>o.track===d).map(o=>optBtn(o,c.picks.spark===o.id,oMech(sid,o,c))).join('')}</div>`:''}`}
  else if(['life','style','drive','career'].includes(sid))inner=`<div class="ogrid">${pg.opts.map(o=>optBtn(o,c.picks[sid]===o.id,oMech(sid,o,c))).join('')}</div>`;
  else if(sid==='gift'){const sp=oOpt('spark',c.picks.spark);inner=`<p class="small muted" style="margin:0">These are the ${O_POW[sp.track].length} <b class="t-${sp.track}" style="color:var(--tc)">${TRACKS[sp.track].name}</b> powers. Go back a page to see another discipline's. Free powers don't use your action. Tech powers spend Power, Magic powers spend Arcana, and Innate powers require Innate rank and use the hero's one Innate ability for the round.</p><div class="ogrid">${O_POW[sp.track].map(id=>optBtn(oOpt('gift',id),c.picks.gift===id,oMech('gift',oOpt('gift',id),c))).join('')}</div>`}
  else if(sid==='training'){const ex=oLevel(c)-1;inner=`<p class="small muted" style="margin:0">They arrive at level ${oLevel(c)}: ${ex} rank${ex===1?'':'s'} beyond the first.</p><div class="ogrid">${oTrainOpts(c).map(o=>optBtn(o,c.picks.training===o.id,oMech('training',o,c))).join('')}</div>`}
  else if(sid==='moves'){const need=oLevel(c)-1,rng=oOpt('style',c.picks.style).range>1;
    inner=`<div class="row"><span class="chip"><b>Picked</b>${c.ups.length}/${need}</span>${c.ups.map((u,i)=>`<button class="btn sm" data-a="ounup:${i}" title="Remove">${UPG[u].name} ✕</button>`).join('')}</div>
    <div class="ogrid">${Object.keys(UPG).filter(k=>k!=='range'||rng).map(k=>{const n=c.ups.filter(u=>u===k).length;return `<button class="btn opt oopt ${n?'sel':''}" data-a="oup:${k}" data-tip="upg:${k}" ${c.ups.length>=need||n>=2?'disabled':''}><span class="on">${UPG[k].name}${n?` ×${n}`:''}</span><small class="mech">Permanently gives ${modsTxt(UPG[k].mods)}. Up to 2 times.</small></button>`}).join('')}</div>`}
  else if(sid==='gear'){const r=oRanks(c),max=oGearMax(c),ks=Object.keys(GEAR).filter(k=>isUnlocked('gear:'+k)&&!GEAR[k].cons&&!GEAR[k].set&&canWearR(r,k)).sort((a,b)=>GEAR[b].req-GEAR[a].req);
    inner=`<div class="row"><span class="chip"><b>Picked</b>${c.gear.length}/${max}</span><span class="small muted">One item per slot. Only blueprints you have unlocked and they can wear are shown.</span></div>
    ${ks.length?`<div class="ogrid">${ks.map(k=>{const sel=c.gear.includes(k),clash=!sel&&c.gear.some(g=>GEAR[g].slot===GEAR[k].slot);return `<button class="btn opt oopt t-${GEAR[k].type} ${sel?'sel':''}" data-a="ogear:${k}" data-tip="gear:${k}" ${!sel&&(c.gear.length>=max||clash)?'disabled':''}>${gearInfo(k)}</button>`}).join('')}</div>`:'<div class="cap">No unlocked blueprint fits them yet. They arrive empty-handed.</div>'}`}
  else if(sid==='hq'){const max=oHqMax(c);inner=`<div class="row"><span class="chip"><b>Picked</b>${c.hq.length}/${max}</span></div><div class="ogrid">${oHqOpts().map(o=>{const sel=c.hq.includes(o.id);return optBtn(o,sel,o.txt,!sel&&c.hq.length>=max?'disabled':'').replace(`data-a="opick:hq:${o.id}"`,`data-a="ohq:${o.id}"`)}).join('')}</div>`}
  else if(sid==='mask')inner=`<label class="oname"><span class="eyebrow">Codename</span><input id="oname" maxlength="18" autocomplete="off" value="${esc(c.name)}" placeholder="Type or pick a name"></label>
    <div class="row"><button class="btn sm" data-a="orand">${c.sugg?'More ideas':'Suggest codenames'}</button>${(c.sugg||[]).map((n,i)=>`<button class="btn sm ${c.name===n?'on':''}" data-a="osug:${i}">${esc(n)}</button>`).join('')}</div>
    <div class="eyebrow">Costume color</div><div class="row">${O_COLS.map(col=>`<button class="oswatch ${c.col===col?'sel':''}" data-a="ocol:${col}" style="background:${col}" aria-label="Color ${col}"></button>`).join('')}</div>`;
  return `<section class="panel ocomic">${head}<div><span class="sfxhead osfx">${pg.t}</span></div>${pg.cap?`<div class="cap tilt">${pg.cap}</div>`:''}
    <div class="obody"><div class="ocol">${inner}</div>${oPreview(c)}</div>${navb}</section>`}
function oCover(c){const r=oBuild(c),b=r.base,xo=c.mode==='xover',gift=POWERS[b.power];
  const h=oHero(c);
  const st=O_STATS.map(([l,k])=>`<div><b>${(k==='acc'||k==='str')&&stat(h,k)>=0?'+':''}${stat(h,k)}</b><span>${l}</span></div>`).join('');
  const story=['life','spark','gift','style','drive'].concat(xo?['career','training']:[]).map(s=>{const o=s==='training'?oTrainOpts(c).find(x=>x.id===c.picks.training):oOpt(s,c.picks[s]);return o?`<li><b>${ORIGIN[s].t}:</b> ${esc(o.n)}. <span class="muted">${oMech(s,o,c)}</span></li>`:''}).join('');
  return `<div class="ocover" style="--hc:${c.col}"><small>${xo?'Special crossover issue':'Blackharbor presents'} · Issue #1</small><b>${esc(b.name)}</b><span class="ctag">${esc(b.role)}</span>
    <div class="ocstats">${st}</div><div class="small"><b>${gift.name}:</b> ${gift.txt}</div>${b.field?`<div class="small"><b>${b.field.n}:</b> ${b.field.txt}</div>`:''}
    <div class="row">${Object.keys(TRACKS).filter(t=>r.ranks[t]).map(t=>`<span class="disc fill t-${t}">${TRACKS[t].name} ${r.ranks[t]}</span>`).join('')}<span class="lvl">LVL ${r.level}</span></div></div>
    ${coll('o-story','<span class="eyebrow">The story so far</span>',`<ul class="lines small">${story}</ul>`)}
    ${xo?`<div class="card"><div class="small"><b>Signature moves:</b> ${c.ups.map(u=>UPG[u].name).join(', ')||'none'}</div><div class="small"><b>Gear:</b> ${c.gear.map(g=>GEAR[g].name).join(', ')||'none'}</div><div class="small"><b>Brings to HQ:</b> ${c.hq.map(id=>(oHqOpts().find(o=>o.id===id)||{n:id}).n).join(', ')}</div></div>`
      :'<p class="small muted" style="margin:0">Basic heroes are free. They start at level 1 with no gear and change nothing at HQ.</p>'}
    ${recruitXpTxt()}<button class="btn pri obig" data-a="ofinish">Print it! ${esc(b.name)} joins the team</button>`}
function qbCard(k){const b=HERO_BASE[k];return `<div class="card" data-tip="qb:${k}"><div class="row between"><h3>${b.name}</h3><span class="disc fill t-${b.track}">${TRACKS[b.track].name}</span></div>
  <div class="small muted">${b.role} · ${POWERS[b.power].name}${b.field?` · ${b.field.n}`:''}</div>
  <div class="small" data-tip="kw:engines">${poolTxt(newHero(k))} <span class="muted">(veteran: ${POOL_BONUS_TXT[b.track]})</span></div>
  <div class="small mono">HP ${b.maxHp} · MOV ${b.move} · DICE ${b.speed} · ACC +${b.acc} · STR +${b.str} · EVA ${b.eva} · RNG ${b.range}</div>${recruitXpTxt()}
  <button class="btn sm" data-a="qb:${k}" ${roster().length>=ROSTER_MAX?'disabled':''}>Recruit ${b.name}</button></div>`}
/* ============ NEW-VOLUME GUIDE ============ */
/* S.guide only exists on volumes started after this update: s 0 splash, 1 team, 2 base, 3 gear, 4 roster. pop names the step a pop-up is suggesting. */
function equipHero(h,g,pref){const i=S.armory.indexOf(g),G=GEAR[g];if(i<0||!wearOK(h,g))return false;
  if(G.cons){S.armory.splice(i,1);pouchOf(h).push(g);if(S.guide)S.guide.eq=true;return true}
  S.armory.splice(i,1);putGear(h,g,pref).forEach(o=>S.armory.push(o));if(G.mods.maxHp)h.hp+=G.mods.maxHp;clampHero(h);if(S.guide)S.guide.eq=true;return true}
function eqTo(g,craft){const G=GEAR[g],hs=[...party(),...bench()];if(!hs.length)return '<button class="btn sm" disabled title="Recruit a hero first">Equip to…</button>';
  return `<details class="eqto"><summary class="btn sm">${craft?'Craft &amp; equip to…':'Equip to…'}</summary><div class="eqmenu">${hs.map(h=>{const ok=wearOK(h,g),pl=G.cons?null:eqPlan(h,g);
    return `<button class="btn sm" data-a="${craft?`crafteq:${g}:${h.id}`:`equip:${h.id}:${g}`}" ${ok?'':'disabled'}>${esc(h.name)}${S.party.includes(h.id)?'':' <span class="muted">(bench)</span>'} <span class="muted">${ok?(pl&&pl.out.length?`swaps out ${[...new Set(pl.out)].map(o=>GEAR[o].name).join(' and ')}`:G.cons?`pouch ${pouchOf(h).length}/${POUCH_MAX}`:`${SLOTS[pl.s]} empty`):G.cons?'pouch full':`needs ${reqTxt(G)}`}</span></button>`}).join('')}</div></details>`}
function guideTick(){const g=S.guide;if(!g||S.tut)return;
  if(S.phase!=='hq'){S.guide=null;return}
  if(g.s===1&&party().length>=4){g.s=2;g.pop='base'}
  if(g.s===2&&S.facilities.some(k=>k!=='workshop')){g.s=3;g.pop='gear'}
  if(g.s===3&&g.eq){g.s=4;g.pop='roster'}
  if(g.pop==='roster'&&S.view==='roster')g.pop=null}
const G_STEPS=['Team','Base','Gear','Roster'];
function guideBar(){const g=S.guide;if(!g||!g.s||S.phase!=='hq')return '';const n=party().length;
  const msg=[,`<b>Recruit a team of four.</b> Every mission sends a party of 4 heroes, and investigations stay locked until all four spots are filled. Party ${n}/4.`,
    `<b>Build your base.</b> The Workshop is already running, so you can craft gear. Spend Tech and Intel on another facility under Base development.`,
    `<b>Gear up.</b> The armory has a starter locker. Use Equip to… in the Workshop panel, or craft something new.`,
    S.view==='villains'?`<b>Pick a villain.</b> Read each case file below, then tap <b>Investigate</b> on the one you want to hunt this issue.`:`<b>Check your roster.</b> Look over each hero's stats, power and gear. When you're happy, open the <b>Villains</b> tab and Investigate a villain under Case files.`][g.s];
  const btn=g.s===2?`<button class="btn sm" data-a="guide:open:hq-base">Base development</button><button class="btn sm" data-a="guide:next">Skip to gear</button>`
    :g.s===3?`<button class="btn sm" data-a="guide:open:hq-ws">Workshop</button><button class="btn sm" data-a="guide:next">Done gearing up</button>`
    :g.s===4?(S.view==='roster'?`<button class="btn sm pri" data-a="guide:open:vl-cases">Pick a villain</button>`:S.view==='villains'?'':`<button class="btn sm" data-a="guide:open:roster">Open roster</button>`):'';
  return `<div class="gbar" role="status"><div class="gsteps">${G_STEPS.map((t,i)=>`<span class="${i+1===g.s?'on':i+1<g.s?'done':''}">${i+1}. ${t}</span>`).join('')}</div>
    <div class="small">${msg}</div><div class="row">${btn}<button class="btn sm" data-a="guide:skip" style="margin-left:auto">Hide guide</button></div></div>`}
function guideModal(){const g=S.guide;if(!g||S.tut||S.phase!=='hq'||S.view==='create')return '';
  if(g.s===0)return `<div id="guide" role="dialog" aria-modal="true" aria-labelledby="gtitle"><div class="gbox"><div class="eyebrow">Volume ${S.vol} · How a volume plays</div><div><span class="sfxhead" id="gtitle">Welcome to Blackharbor!</span></div>
    <p class="small" style="margin:0">A volume is a full campaign: ${ARCS} arcs of ${ISSUES_PER_ARC} issues, then an event comic finale. Each issue goes like this:</p>
    <ol class="gflow"><li><span><b>Recruit four heroes.</b> Every mission sends a party of 4.</span></li><li><span><b>Build your base.</b> The Workshop is ready for crafting. Other facilities add healing, resources and new options.</span></li><li><span><b>Gear up.</b> Equip items from the armory, or craft new ones from villain salvage.</span></li><li><span><b>Check the roster.</b> Make sure the right four are in the party.</span></li><li><span><b>Investigate a villain</b> from the Villains tab. Clues decide how the fight starts and reveal their playbook.</span></li><li class="later"><span><b>Showdown in the lair</b>, then the aftermath: XP, salvage and injuries. Villains you leave alone keep scheming and grow stronger each arc.</span></li></ol>
    <p class="small muted" style="margin:0">Long-press any stat, item or keyword for details.</p>
    <div class="row"><button class="btn pri" data-a="guide:go">Recruit my team</button><button class="btn" data-a="guide:skip">I know how to play</button></div></div></div>`;
  const P={base:['Team assembled!','Your four heroes are ready. Your Workshop is already up and running for crafting gear. Next, build up the rest of your base: other facilities give you resources, healing and new options.','Go to base development','hq-base'],
    gear:['Base online!','Time to gear up. The armory has a starter locker: use Equip to… to hand items straight to a hero, or craft new gear in the Workshop.','Go to the workshop','hq-ws'],
    roster:['Suited up!','Before you investigate a villain, look over your roster. Check each hero\'s stats, power and gear, and make sure the right four are in the party.','Open the roster','roster']}[g.pop];
  if(!P)return '';
  return `<div id="guide" role="dialog" aria-modal="true" aria-labelledby="gtitle"><div class="gbox"><div class="eyebrow">Step ${g.s} of 4</div><div><span class="sfxhead" id="gtitle">${P[0]}</span></div>
    <p class="small" style="margin:0">${P[1]}</p><div class="row"><button class="btn pri" data-a="guide:open:${P[3]}">${P[2]}</button><button class="btn" data-a="guide:close">Not now</button></div></div></div>`}
/* ============ FIRST-TIME TIPS ============ */
/* one pop-up the first time each mechanic shows up; ids seen live in S.tips and carry into the next volume */
const inSd=()=>S.phase==='sd'&&S.sd&&!S.sd.result&&!S.sd.busy&&!S.sd.intro,sdV=f=>inSd()&&S.sd.vl.some(o=>!o.v.down&&f(o)),selH=()=>{const u=inSd()&&S.sd.sel!=null&&S.sd.units[S.sd.sel];return u?heroOf(u):null};
const atHQ=()=>S.phase==='hq'&&S.view!=='create'&&!S.guide;
const TIPS=[
  {id:'inv',when:()=>S.phase==='inv'&&S.inv&&S.inv.intro,t:'Investigation',b:()=>`Each issue, your party tracks one villain through 3 leads. <b>Every clue opens one unseen page</b> of the villain's playbook or one of their hit reactions, and the clue total decides how the fight starts: 0–1 an ambush, 2–3 a standoff, 4 or more prepared. The street hints tell you how this villain fights, so read them before you go.`},
  {id:'lead',when:()=>S.phase==='inv'&&S.inv&&!S.inv.intro&&S.inv.step<3&&!S.inv.res,t:'Working a lead',b:()=>`Pick how to work each lead. Options that roll use <b>a d20 plus bonuses</b> from field abilities and gear, and show the number you need. Risky options can hurt a hero or cost trust. The third lead is always the villain's own trail, built around how they operate.`},
  {id:'lair',when:()=>S.phase==='inv'&&S.inv&&S.inv.step>=3,t:'Finding the lair',b:()=>`Your clues set the showdown. <b>Ambush:</b> the villain acts first with an extra henchman and your heroes start scattered. <b>Standoff:</b> you enter from the south edge and act first. <b>Prepared:</b> change gear now, act first, and the villain starts with 1 page torn out.`},
  {id:'sd',when:()=>inSd(),t:'The showdown',b:()=>`Tap a hero to select them. Each round, every hero can <b>move once and take one action</b>. Then press End round and the villain plays the top page of its playbook. <b>The playbook is also its health:</b> every wound tears out a page, and when none are left it's beaten. There is no time limit: when it runs out of pages to play, its untorn pages are shuffled back in. <b>Escort</b> civilians to a green exit hex for trust, because harmed civilians cost trust. Civilians left alone panic and run on the villain's turn, and henchmen drag them off.`},
  {id:'attack',when:()=>inSd()&&S.sd.mode==='attack',t:'Attacking',b:()=>`Roll one d20 per attack die and add accuracy. <b>Each die that reaches the target's evasion is a hit.</b> A natural 20 always hits and a 1 always misses. Each hit on a villain draws a card from the hit deck, then rolls <b>d20 + strength against its toughness</b>. A success tears a page. Long-press a hero's stats to see their numbers.`},
  {id:'arcs',when:()=>!!selH(),t:'Facing and blind spots',b:()=>`The yellow arrow shows where the villain faces. The tinted hexes in front are its <b>front arc</b>. The shaded hexes behind are its <b>blind spot</b>, and attacks from there get +1 die. It turns toward whatever it moves to or attacks. Some signature hit reactions only trigger from certain sides, so read the playbook to learn which angle is safe.`},
  {id:'engines',when:()=>{const h=selH();return !!h&&!!(pwrMax(h)||arcMax(h)||potOf(h))},t:'Power, Arcana and Innate rank',b:()=>`Gear abilities and signature powers run on a hero's disciplines. <b>Tech</b> abilities spend Power, which slowly recharges. <b>Magic</b> spells spend Arcana: one pool per fight that doesn't refill on its own, so save it for big moments. <b>Innate</b> abilities spend nothing but require enough Innate rank, and each hero can fire one per round. The bars under the action buttons show what this hero has.`},
  {id:'multi',when:()=>inSd()&&S.sd.vl.length>1,t:'Two villains',b:()=>`More than one villain is on the board, and they act one after the other each round. Use the <b>Target</b> buttons, or tap a villain, to choose whose playbook you're tearing.`},
  {id:'sig',when:()=>sdV(o=>o.v.warn&&o.v.deck[0]&&o.v.deck[0].uid===o.v.warn),t:'Signature Move!',b:()=>`The villain just shouted a warning: its next page is a <b>Signature Move</b>, one of its most dangerous attacks. Every wound tears the <b>top</b> page, so land a wound before you end the round to rip it out before it fires.`},
  {id:'charge',when:()=>sdV(o=>o.v.charge),t:'Charged attack',b:()=>`The villain is winding up. On its next turn the <b>striped hexes</b> get hit instead of it playing a new page. Move out of them, or tear pages equal to the villain's level + 1 before then to stagger it.`},
  {id:'haz',when:()=>inSd()&&S.sd.haz&&S.sd.haz.length,t:'Hazard hexes',b:()=>`Orange hexes are a hazard. <b>Any hero standing on one when the villain's turn starts takes damage</b>, so step off before you end the round.`},
  {id:'walls',when:()=>inSd()&&S.sd.walls&&S.sd.walls.length,t:'Walls',b:()=>`Walls block movement and beams like rubble. Walls built into the lair stay all fight; walls the villain raises crumble after a few rounds. <b>Villains bigger than one hex smash straight through walls and rubble</b>, so cover won't stop them.`},
  {id:'pit',when:()=>inSd()&&S.sd.pits&&S.sd.pits.length,t:'Pits',b:()=>`Dark hexes are pits. <b>Nobody can walk into one, but shots and beams pass over.</b> A jumping hero can clear one pit hex for 2 movement, and villains bigger than one hex stride across.`},
  {id:'serpent',when:()=>sdV(o=>VILLAINS[o.key].shape==='serpent'),t:'A serpent villain',b:()=>`Ouroboros fills a chain of hexes and <b>its body follows its head</b>. Every civilian or henchman it swallows makes it one hex longer. Keep bystanders away from its mouth.`},
  {id:'swarm',when:()=>sdV(o=>VILLAINS[o.key].shape==='swarm'),t:'A swarm villain',b:()=>`Murmur is <b>three separate bodies</b>: a queen, a stinger and a shell. Each has its own facing, and you strike the body you aim at. A body with another body right beside it gets +2 toughness, so split them up.`},
  {id:'bomber',when:()=>sdV(o=>o.key==='bomber'),t:'A leaping bomber',b:()=>`Payload <b>vaults over the nearest hero</b> and leaves a lit bomb where they stood. A bomb goes off on its hex and every hex around it when its fuse runs out, so get 2 hexes clear. She can't jump a hero with no open hex behind them, and she always lands facing away from the hero she jumped.`},
  {id:'grid',when:()=>sdV(o=>o.key==='grid'),t:'A beam turret',b:()=>`Gridlock is <b>bolted to the floor</b>: he turns but never moves, and nothing can shove him. His beams run in straight hex lines to the edge of the board, and each one <b>stops at the first hero it hits and knocks them back</b> as many hexes as the damage. Walls and rubble block beams, so use them as cover. His Prisms split any beam that passes through them.`},
  {id:'beams',when:()=>inSd()&&S.sd.beams&&S.sd.beams.length,t:'Lit beams',b:()=>`Red lines are lit beams. They stay until the villain's next turn. <b>Stepping into a lit hex costs ${BEAM_HOT} damage and ends your move</b>, and a normal move can't cross one. Only a hero who is <b>jumping</b> (the move after Mighty Leap, Jet or Piston Leap, a Solar Dive, or any move in Gravity Boots or Earthshaker Greaves) can clear a single lit hex for 2 movement. Leaping abilities that land on a chosen hex fly over beams too. A hero who starts their turn in a beam can step out freely.`},
  {id:'hide',when:()=>sdV(o=>o.v.hide),t:'Hidden facing',b:()=>`Nocturne hides which way she faces. Her arrow shows a question mark and her arcs aren't shaded, but <b>they still count</b>. Every hit you land reveals her facing until she fades again.`},
  {id:'shaken',when:()=>inSd()&&S.sd.units.some(u=>!u.ko&&heroOf(u).comp<=0),t:'Shaken',b:()=>`A hero's composure (the blue bar) hit 0. They're <b>Shaken: −2 Strength, −2 accuracy, −2 evasion and −1 movement</b> until it's restored. Ending a fight at 0 composure leaves a lasting Rattled injury.`},
  {id:'ko',when:()=>inSd()&&S.sd.units.some(u=>u.ko),t:'Hero down',b:()=>`A knocked-out hero is out of this fight. After the mission they're back on their feet at half health, ready for the next issue. Nobody's career ends.`},
  {id:'after',when:()=>S.phase==='after'&&S.after&&!S.after.ethos,t:'Aftermath',b:()=>`Every hero on the mission earns XP, more if they landed 2 or more wounds. A win brings salvage for crafting. Villains you beat always <b>escape and come back a level stronger</b>, and beating one unlocks their facility blueprints. Every villain you didn't hunt moved its scheme forward.`},
  {id:'arc',when:()=>S.phase==='arc',t:'A new arc',b:()=>`Every free villain gains a level, adds new pages and upgrades old ones, and a new villain arrives. Once per arc a <b>Crossover Issue</b> lets an experienced hero join from HQ.`},
  {id:'tabs',when:()=>atHQ()&&roster().length>0,t:'HQ, Roster and Villains',b:()=>`Between missions there are three tabs. <b>HQ</b> is for recruiting, building the base and crafting gear. <b>Roster</b> is for the party, equipment and level-ups. <b>Villains</b> holds the case files, where you pick who to investigate. A tab <b>glows</b> when it needs you: HQ while you have resources or options to use, Roster when there is new gear or a hero has a choice to make, and Villains once you have checked the other two this issue.`},
  {id:'levelup',when:()=>atHQ()&&roster().some(h=>h.pendingUp>0),t:'Level up',b:()=>`A hero has enough XP to level up. Open the <b>Roster</b> and find the ★: pick which discipline they grow into (up to rank 5), then choose one upgrade. Benched heroes also earn 1 XP every issue.`},
  {id:'pouch',when:()=>atHQ()&&S.armory.some(g=>GEAR[g]&&GEAR[g].cons),t:'Consumables',b:()=>`The armory has <b>consumables</b>: cheap one-use items like Stim Shots and Smoke Pellets. Each hero carries up to ${POUCH_MAX} in a pouch, separate from their gear slots. Use them in a fight as a free action, or during investigations for the ones that give clues. Buy more in the Workshop panel, even before the Workshop is built.`},
  {id:'scheme',when:()=>atHQ()&&S.issue>=2&&S.villains.some(v=>v.status==='active'&&v.scheme>0),t:'Schemes',b:()=>`Every issue you don't hunt a villain, <b>its scheme meter fills</b> by one. When it's full, the villain strikes the city: −2 trust and it gains a level. You can only chase one villain per issue, so keep an eye on the meters on the <b>Villains</b> tab.`},
  {id:'sets',when:()=>atHQ()&&roster().some(h=>Object.values(h.gear).some(g=>GEAR[g]&&GEAR[g].set)),t:'Villain sets',b:()=>`Gear crafted from one villain's salvage belongs to that villain's <b>set</b> (the green tag on top of the item). <b>Wear ${SET_N} pieces of the same set</b> on one hero to turn on a set bonus themed on that villain. The hero card shows each set you're wearing just below the gear, and it glows once the bonus is on.`},
  {id:'salvage',when:()=>atHQ()&&Object.values(S.salvage).some(n=>n>0),t:'Salvage',b:()=>`You've got villain salvage. Spend it in the <b>Workshop</b> (Base development) to craft gear from your blueprints, then use Equip to… to hand it to a hero. "Any salvage" costs can be paid from any villain's salvage.`},
  {id:'event',when:()=>S.phase==='event',t:'The event comic',b:()=>`The volume's finale: <b>two villains attack together</b> on a bigger board, acting one after the other each round. Choose a preparation, then beat both to end the volume in triumph.`},
];
function tipNow(){if(S.tipsOff||FAST)return null;if(S.tut&&!(TUT[S.tut.b]&&TUT[S.tut.b].id==='free'))return null;const g=S.guide;if(g&&(g.s===0||g.pop))return null;if(S.view==='roster'&&S.phase==='hq')return null;
  if(S.tipAt&&Date.now()-S.tipAt<4000)return null;const seen=S.tips||[];return TIPS.find(t=>!seen.includes(t.id)&&t.when())||null}
function tipModal(){const t=tipNow();if(!t)return '';
  return `<div id="guide" class="tip1" role="dialog" aria-modal="true" aria-labelledby="gtitle"><div class="gbox"><div class="eyebrow">New mechanic</div><div><span class="sfxhead" id="gtitle">${t.t}</span></div>
    <p class="small" style="margin:0">${t.b()}</p><div class="row"><button class="btn pri" data-a="tip:ok:${t.id}">Got it</button><button class="btn" data-a="tip:off">Turn off tips</button></div></div></div>`}
function recruitPanel(){const n=roster().length,full=n>=ROSTER_MAX,arc=xArc(),xo=xoverOpen(),qb=Object.keys(HERO_BASE).filter(k=>!roster().some(h=>h.cls===k));
  const xl=xo?'Start a Crossover':arc<2?'Opens in Arc 2':arc<ARCS?`Used. Next one in Arc ${arc+1}`:'Used this arc';
  return `<section class="panel">${coll('hq-recruit',`<div><div class="eyebrow">Recruitment · ${n}/${ROSTER_MAX} heroes</div><h2>New heroes</h2></div>`,
    `${!n?'<div class="cap tilt"><b>The Blackharbor Guardians need four heroes.</b> Write an origin story for each hero, or grab a quick build to skip ahead. Every mission sends a party of 4, so fill all four spots before you investigate. The armory holds a starter locker of ten items to hand out once the team is set.</div>':''}
    ${full?'<p class="small muted" style="margin:0">The roster is full.</p>':''}
    <div class="grid2"><div class="card orec"><h3>Origin Story</h3><div class="small">Create a basic hero over six comic pages. Every choice shows what it does to them. Free: level 1, no gear, no HQ changes.</div><button class="btn pri" data-a="ostart:basic" data-tip="kw:origin" ${full?'disabled':''}>Write an origin</button></div>
      <div class="card orec xo"><h3>Crossover Issue</h3><div class="small">Recruit an Established Character from their own series. They arrive at level ${Math.max(2,arc)+1} or higher, with gear and HQ bonuses you choose. One per arc, from Arc 2.</div><button class="btn ${xo?'pri':''}" data-a="ostart:xover" data-tip="kw:crossover" ${xo&&!full?'':'disabled'}>${xl}</button></div></div>
    ${qb.length?coll('hq-qb',`<span class="eyebrow" data-tip="kw:quickbuild">Quick builds · ${qb.length}</span>`,`<p class="small muted" style="margin:0">The classic Guardians lineup, ready to go. Same rules as a basic hero: level 1 and no gear.</p><div class="grid2">${qb.map(qbCard).join('')}</div>`,!n,'nested'):''}`)}</section>`}

/* ============ GLOSSARY + LONG-PRESS DETAILS ============ */

function tipFor(key){const[t,k,id]=key.split(':');
  if(t==='cell')return cellTip(+k,+id);
  if(t==='oopt'&&S.cre&&ORIGIN[k]){const c=S.cre,o=k==='training'?oTrainOpts(c).find(x=>x.id===id):k==='hq'?oHqOpts().find(x=>x.id===id):oOpt(k,id);if(o)return {title:o.n,eyebrow:ORIGIN[k].t,body:`${o.fl?o.fl+' ':''}${oMech(k,o,c)}`}}
  if(t==='ostat'&&S.cre&&k in O_TEMPLATE){const c=S.cre,r=oBuild(c),h=oHero(c),v=stat(h,k),lab=MODN[k]||k,w=r.why[k]||[],parts=[`Starting template: ${O_TEMPLATE[k]}`].concat(w.map(([s,d])=>`${s}: ${d>0?'+':''}${d}`));
    const fl=r.base[k]-O_TEMPLATE[k]-w.reduce((a,[,d])=>a+d,0);if(fl)parts.push(`Raised to the minimum of ${O_FLOOR[k]}: +${fl}`);const rest=v-r.base[k];if(rest)parts.push(`Ranks, upgrades, gear and ethos: ${rest>0?'+':''}${rest}`);
    return {title:`${lab[0].toUpperCase()+lab.slice(1)}: ${v}`,eyebrow:'Where this stat comes from',body:parts.join('. ')+'.'}}
  if(t==='qb'&&HERO_BASE[k]){const b=HERO_BASE[k];return {title:b.name,eyebrow:`Quick build · ${TRACKS[b.track].name} · ${b.role}`,body:`Health ${b.maxHp}, movement ${b.move}, ${b.speed} attack ${b.speed===1?'die':'dice'}, accuracy +${b.acc}, strength +${b.str}, evasion ${b.eva}, range ${b.range}, composure ${b.maxComp}. ${POWERS[b.power].name}: ${POWERS[b.power].txt}${b.field?` ${b.field.n}: ${b.field.txt}`:''} Starts with ${poolTxt(newHero(k))}, including the veteran bonus of ${POOL_BONUS_TXT[b.track]}.`}}
  if(t==='vpage'&&VILLAINS[k]){const c=pageOf(k,id);return {title:c.n,eyebrow:`${VILLAINS[k].name} · Playbook page`,body:c.txt}}
  if(t==='vrx'&&VILLAINS[k]&&rxOf(k,id)){const r=rxOf(k,id);return {title:r.n,eyebrow:`${VILLAINS[k].name} · Hit reaction`,body:r.txt}}
  if(t==='kw'&&GLOSS[k])return {title:GLOSS[k][0],body:GLOSS[k][1]};
  if(GLOSS[key])return {title:GLOSS[key][0],body:GLOSS[key][1]};
  if(t==='res'&&GLOSS[key])return {title:GLOSS[key][0],body:GLOSS[key][1]};
  if(t==='pow'&&POWERS[k])return {title:POWERS[k].name,eyebrow:`Signature power · ${powCost(k)}`,body:POWERS[k].txt};
  if(t==='gear'&&GEAR[k]){const g=GEAR[k];return {title:g.name,eyebrow:g.cons?'Consumable · carried in the pouch':`Needs ${reqTxt(g)} · ${gearSlotN(g)}${g.pair?' · paired':''}`,body:`${g.cons?`Anyone can carry it, up to ${POUCH_MAX} per hero. One use, then it is gone.`:(modsTxt(g.mods)||'No passive bonus')+'.'}${gearPoolTxt(g)?` <b>Pool:</b> ${gearPoolTxt(g)}.`:''}${g.ab?` <b>${g.ab.n}</b> (${abCost(g)}${g.type==='innate'?', one Innate ability per round':''}): ${abTxt(g.ab)}`:''}${g.jumps?' <b>All your moves are jumps.</b>':''}${gearExtra(g).map(t=>' '+t).join('')}${g.field?` <b>Out of combat:</b> ${g.field.txt} Works only while the wearer is in the party.`:''}${g.set?` <span class="sn">${esc(VILLAINS[g.set].name)} set, ${SETS[g.set].n} (${SET_N} pieces):</span> ${SETS[g.set].txt}`:''} <span class="muted">Craft: ${costStr(g.cost)}.</span>`,html:true}}
  if(t==='fac'&&FAC[k])return {title:FAC[k].name,eyebrow:`Facility · ${costStr(FAC[k].cost)}`,body:FAC[k].txt};
  if(t==='upg'&&UPG[k])return {title:UPG[k].name,eyebrow:'Upgrade',body:`Permanently gives ${modsTxt(UPG[k].mods)}.`};
  if(t==='inj'&&INJ[k])return {title:INJ[k].name,eyebrow:'Lasting injury',body:`Permanently gives ${modsTxt(INJ[k].mods)}.`};
  return null}
/* Version 93: long-press any board hex for what is on it. Tokens ignore the pointer, so the hex underneath carries the tip. */
function cellTip(x,y){const sd=S.sd;if(!sd||S.phase!=='sd')return null;const k=x+','+y,G=(id,pre)=>({title:GLOSS[id][0],body:(pre||'')+GLOSS[id][1]});
  const su=sd.sel!=null?sd.units[sd.sel]:null,sh=su&&!su.ko?heroOf(su):null,need=n=>Math.min(20,Math.max(2,n)),pct=n=>Math.round(5*(21-need(n)));
  const o=sd.vl.find(o=>!o.v.down&&inV(o.v,x,y));
  if(o){const v=o.v,d=VILLAINS[o.key],L=v.level-1,eva=d.eva+L-hexA(v.hex),tough=d.tough+L,acc=d.acc+vLvB('acc',v.level)-(v.blind?4:0),pg=v.deck.length+v.discard.length;
    let b=`Evasion ${eva}: an attack die plus accuracy must reach it to hit. Toughness ${tough}: a wound roll plus Strength must reach it to tear a page. Accuracy +${acc} against your heroes' evasion. ${pg} page${pg===1?'':'s'} left.`;
    if(sh){const hn=eva-stat(sh,'acc'),wn=tough-stat(sh,'str');b+=` ${sh.name} hits on ${need(hn)}+ (${pct(hn)}% per die) and wounds on ${need(wn)}+ (${pct(wn)}%), before hit cards and bonuses.`}
    b+=v.hide?' Its facing is hidden until you land a hit.':v.sw?' Each body has its own facing: attack from a side or behind for bonus dice.':' The yellow arrow is its facing. Attacks from the shaded blind spot behind it get +1 die.';
    return {title:d.name,eyebrow:`Villain · level ${v.level}`,body:b}}
  const m=sd.hench.find(m=>m.x===x&&m.y===y);
  if(m){const e=m.elite&&eliteOf(m.owner);return e?{title:e.name,eyebrow:`Special henchman · health ${m.hp}`,body:GLOSS.elite[1]}:{title:VILLAINS[m.owner].hench.name,eyebrow:`Henchman · health ${m.hp}`,body:GLOSS.henchman[1]}}
  const u=sd.units.find(o=>!o.ko&&o.x===x&&o.y===y);
  if(u){const h=heroOf(u);return {title:h.name,eyebrow:`Hero · health ${h.hp}/${stat(h,'maxHp')} · composure ${h.comp}/${stat(h,'maxComp')}`,body:`Move ${stat(h,'move')}, range ${stat(h,'range')}, ${stat(h,'speed')} attack ${stat(h,'speed')===1?'die':'dice'}, evasion ${stat(h,'eva')}. ${u.moved&&u.acted?'Done for this round.':u.moved?'Has moved, can still act.':u.acted?'Has acted, can still move.':'Can still move and act this round.'} Tap to select.`}}
  const c=sd.civs.find(c=>c.x===x&&c.y===y);
  if(c)return G('civilian',c.f?`Following ${heroOf(sd.units.find(o=>o.hid===c.f)).name}. `:civHeld(c)?'Grabbed by a henchman: knock it out to free them. ':'');
  const bm=(sd.bombs||[]).find(b=>b.k===k);if(bm)return G('bomb',`Fuse ${bm.fuse}. `);
  if(sd.term&&sd.term.k===k)return G('terminal');
  const lit=litMap()[k];if(lit)return G('beam',`This hex deals ${lit}. `);
  if(sd.vl.some(o=>o.v.charge&&!o.v.down&&o.v.charge.zone.includes(k)))return G('charge');
  if((sd.exits||[]).includes(k))return G('exit');
  if(sd.obs.includes(k))return G('rubble');if(sd.walls&&sd.walls.some(w=>w.k===k))return G('walls');if(sd.pits&&sd.pits.includes(k))return G('pit');
  {const hz=sd.haz&&sd.haz.find(h=>h.k===k);if(hz)return G('haz')}
  for(const o of sd.vl){if(o.v.down||o.v.hide||dV({x,y},o.v)>3)continue;const sd2=sideOf({x,y},o.v);if(sd2==='rear')return G('blind');if(sd2==='front')return G('facearc')}
  return null}
let tipEl=null,lp=null,suppressClick=false;
function hideTip(){if(tipEl){tipEl.remove();tipEl=null}}
function showTip(el){const d=tipFor(el.dataset.tip);if(!d)return false;hideTip();
  tipEl=document.createElement('div');tipEl.id='tip';tipEl.setAttribute('role','tooltip');
  tipEl.innerHTML=`${d.eyebrow?`<div class="eyebrow">${esc(d.eyebrow)}</div>`:''}<h4>${esc(d.title)}</h4><div>${d.html?d.body:esc(d.body)}</div>`;
  document.body.appendChild(tipEl);const r=el.getBoundingClientRect(),t=tipEl.getBoundingClientRect();
  let x=r.left+r.width/2-t.width/2,y=r.top-t.height-10;x=Math.max(12,Math.min(innerWidth-t.width-12,x));if(y<12)y=Math.min(innerHeight-t.height-12,r.bottom+10);
  tipEl.style.left=x+'px';tipEl.style.top=y+'px';return true}
document.addEventListener('pointerdown',e=>{if(tipEl&&!e.target.closest('#tip')){hideTip()}
  const t=e.target.closest('[data-tip]');if(!t)return;
  lp={x:e.clientX,y:e.clientY,timer:setTimeout(()=>{lp=null;if(showTip(t)){suppressClick=true;tutLP(t);try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}}},430)}},{passive:true});
const cancelLP=()=>{if(lp){clearTimeout(lp.timer);lp=null}};
document.addEventListener('pointerup',cancelLP,{passive:true});document.addEventListener('pointercancel',cancelLP,{passive:true});
document.addEventListener('scroll',()=>{cancelLP();hideTip()},{passive:true,capture:true});
document.addEventListener('pointermove',e=>{if(lp&&Math.hypot(e.clientX-lp.x,e.clientY-lp.y)>10)cancelLP()},{passive:true});
document.addEventListener('click',e=>{if(suppressClick){suppressClick=false;e.stopPropagation();e.preventDefault()}},true);
document.addEventListener('contextmenu',e=>{if(e.target.closest('[data-tip]'))e.preventDefault()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideTip();if(S.guide&&S.guide.pop){S.guide.pop=null;render()}else{const t=document.querySelector('#guide.tip1 [data-a^="tip:ok"]');if(t)t.click()}}});
/* disabled buttons swallow pointer events, so buttons with details use aria-disabled instead */
function fixDisabled(root){root.querySelectorAll('button[disabled][data-tip]').forEach(b=>{b.removeAttribute('disabled');b.setAttribute('aria-disabled','true')})}

/* ============ PLAYBOOK BROWSER ============ */
function markSeen(k,n){S.seen=S.seen||{};const a=S.seen[k]=S.seen[k]||[];if(!a.includes(n))a.push(n)}
let PB=null;
function openPlaybook(k){const def=VILLAINS[k],vs=vState(k),sd=(S.sd&&S.sd.vl&&S.sd.vl.find(o=>o.key===k))||null,lvl=sd?sd.v.level:vs.level,seen=(S.seen&&S.seen[k])||[];
  const known=c=>seen.includes(c.id);
  const remain=sd?[...sd.v.deck,...sd.v.discard]:vs.deck.map(e=>buildCard(k,e));
  const sorted=remain.slice().sort((a,b)=>(known(b)-known(a))||a.n.localeCompare(b.n));
  const torn=sd?sd.v.wounds:[];
  const all=remain.concat(torn);
  const sr=(S.seenR&&S.seenR[k])||[],rx=VINTEL[k].react;
  PB={k,lvl,inFight:!!sd,i:0,remainN:remain.length,tornN:torn.length,seenN:all.filter(known).length,total:all.length,status:vs.status,rxN:rx.filter(r=>sr.includes(r.id)).length,rxT:rx.length,
    pages:[{kind:'cover'},...sorted.map(c=>({kind:known(c)?'card':'unk',c})),...torn.map(c=>({kind:'torn',c,known:known(c)})),...rx.map(r=>({kind:sr.includes(r.id)?'rx':'rxunk',r}))]};
  const L=document.createElement('div');L.id='comic';L.setAttribute('role','dialog');L.setAttribute('aria-label',`${def.name} playbook`);document.body.appendChild(L);
  L.addEventListener('click',e=>{const b=e.target.closest('[data-pb]');if(!b)return;const[a,n]=b.dataset.pb.split(':');
    if(a==='close')closePlaybook();if(a==='next')turnPB(1);if(a==='prev')turnPB(-1);if(a==='go')turnPB(+n-PB.i)});
  let sx=null;L.addEventListener('pointerdown',e=>{if(e.target.closest('.cstage'))sx=e.clientX});
  L.addEventListener('pointerup',e=>{if(sx==null)return;const dx=e.clientX-sx;sx=null;if(dx<-45)turnPB(1);else if(dx>45)turnPB(-1)});
  drawPB(0);L.querySelector('[data-pb="close"]').focus({preventScroll:true})}
function closePlaybook(){const L=document.getElementById('comic');if(L)L.remove();PB=null}
document.addEventListener('keydown',e=>{if(!PB)return;if(e.key==='Escape')closePlaybook();if(e.key==='ArrowRight')turnPB(1);if(e.key==='ArrowLeft')turnPB(-1)});
function turnPB(d){if(!PB||!d)return;const ni=PB.i+d;if(ni<0||ni>=PB.pages.length)return;
  const pg=document.querySelector('#comic .cstage .pg');if(pg&&!RM){pg.classList.add(d>0?'flipOutL':'flipOutR');setTimeout(()=>{PB.i=ni;drawPB(d)},170)}else{PB.i=ni;drawPB(d)}}
function pbPage(p,idx){const def=VILLAINS[PB.k],n=PB.pages.length-1;
  const hd=(r)=>`<div class="hd"><span>${vIc(PB.k)}${esc(def.name)} · Playbook</span><span>${r}</span></div>`;
  if(p.kind==='cover')return `<div class="pg pbcover">${vWm(PB.k)}<small>${PB.inFight?'This fight':'Case file'} · Level ${PB.lvl}</small><b>${esc(def.name)}</b><span class="ctag">${esc(def.tag)}</span>
    <div class="cstats"><span><b>${PB.remainN}</b> pages left</span>${PB.inFight?`<span><b>${PB.tornN}</b> torn out</span>`:''}<span><b>${PB.seenN}/${PB.total}</b> seen</span><span><b>${PB.rxN}/${PB.rxT}</b> hit reactions known</span></div>
    <small>Swipe or tap Next to read</small></div>`;
  if(p.kind==='rx'||p.kind==='rxunk'){const show=p.kind==='rx',r=p.r;return `<div class="pg"><div class="hd"><span>${vIc(PB.k)}${esc(def.name)} · Hit reaction</span><span>Hit deck</span></div><div class="sigrib r">Signature reaction</div><div class="art tac ${show?'':'unk'}"><span>${show?esc(r.sfx):'???'}</span></div><h2>${show?esc(r.n):'???'}</h2><div class="tx ${show?'':'muted'}">${show?esc(r.txt):`One of ${esc(def.short)}'s signature hit reactions. Uncover clues while investigating, or draw it in a fight, to learn it.`}</div><div class="ft">${show&&r.src?`Lost when ${esc(def.cards[r.src].n)} is torn`:show?'Shuffled into the hit deck':'Unknown reaction'}</div></div>`}
  if(p.kind==='unk')return `<div class="pg">${hd(`Page ${idx} of ${n}`)}<div class="art unk"><span>???</span></div><h2>???</h2><div class="tx muted">You haven't seen this page played yet. Uncover clues, fight ${esc(def.name)} or use Foresee to learn it.</div><div class="ft">Unknown page</div></div>`;
  const c=p.c,show=p.kind==='card'||p.known,sg=show&&c.sig;
  const body=`${hd(p.kind==='torn'?'Torn out':`Page ${idx} of ${n}`)}${sg?'<div class="sigrib">★ Signature Move ★</div>':''}<div class="art ${show?'':'unk'}">${show?vWm(PB.k):''}<span>${show?esc(TYPE_SFX[c.t]||'!'):'???'}</span></div><h2>${show?esc(c.n):'???'}</h2><div class="tx">${show?esc(c.txt):'Torn out before you could read it.'}</div><div class="ft">${p.kind==='torn'?'No longer in the playbook':`Page ${idx} of ${n}`}</div>`;
  if(p.kind==='torn')return `<div class="pg tornpg ${sg?'sig':''}" style="clip-path:${tearTop}">${body}</div><div class="tornlabel">Torn out this fight</div>`;
  return `<div class="pg ${sg?'sig':''}">${body}</div>`}
function drawPB(d){const L=document.getElementById('comic');if(!L||!PB)return;const def=VILLAINS[PB.k],p=PB.pages[PB.i];
  L.innerHTML=`<div class="cbar"><div><div class="eyebrow">Villain playbook</div><h3>${esc(def.name)}</h3></div><button class="btn sm" data-pb="close" type="button">Close</button></div>
    <div class="cstage"><div class="book pbook vth" style="${vSty(PB.k)}">${pbPage(p,PB.i)}</div></div>
    <div class="cnav"><button class="btn sm" data-pb="prev" type="button" ${PB.i?'':'disabled'}>Prev</button><span class="mono small">${PB.i?`${PB.i} / ${PB.pages.length-1}`:'Cover'}</span><button class="btn sm" data-pb="next" type="button" ${PB.i<PB.pages.length-1?'':'disabled'}>Next</button></div>
    <div class="cstrip">${PB.pages.map((q,i)=>`<button type="button" class="tile ${q.kind} ${q.kind==='card'&&q.c.sig?'sig':''} ${i===PB.i?'cur':''}" data-pb="go:${i}" aria-label="${q.kind==='cover'?'Cover':q.kind==='unk'?'Unknown page':q.kind==='torn'?'Torn page':q.kind==='rx'?esc(q.r.n):q.kind==='rxunk'?'Unknown hit reaction':esc(q.c.n)}"></button>`).join('')}</div>`;
  const pg=L.querySelector('.cstage .pg');if(pg&&d&&!RM)pg.classList.add(d>0?'flipInL':'flipInR')}

/* ============ COLLAPSIBLES ============ */
const uiOpen=(id,def)=>S.ui&&id in S.ui?S.ui[id]:def;
/* Version 129 (Tyler): Workshop search. Text matches the item's name and details; the dropdowns default to craftable items that fill an empty slot on someone */
const WSF_OPTS={aff:[['craft','Can craft'],['cant',"Can't afford"],['any','Any cost']],eq:[['empty','Fills empty slot'],['can','Someone can equip'],['cannot','Nobody can equip'],['any','Anyone or nobody']],
  disc:[['all','All disciplines'],['tech','Tech'],['innate','Innate'],['magic','Magic']],slot:[['all','All slots'],...Object.entries(GSLOTS),['pouch','Pouch (consumables)']]};
/* Version 130 (Tyler): the same search on each hero's equip list in the roster, judged for that hero and without the cost filter */
const EF_OPTS={eq:[['empty','Fills empty slot'],['can','Can equip'],['cannot',"Can't equip"],['any','All armory items']],disc:WSF_OPTS.disc,slot:WSF_OPTS.slot};
const wsfOf=hid=>{S.ui=S.ui||{};const O=hid?EF_OPTS:WSF_OPTS,f=hid?((S.ui.ef=S.ui.ef||{})[hid]=S.ui.ef[hid]||{}):(S.ui.wsf=S.ui.wsf||{});for(const k in O)if(!O[k].some(([v])=>v===f[k]))f[k]=O[k][0][0];if(typeof f.q!=='string')f.q='';if(!hid&&(!f.hero||f.hero!=='all'&&!roster().some(h=>h.id===f.hero)))f.hero='all';return f};
const gearQ=(k,q)=>{if(!q)return true;const g=GEAR[k],t=tipFor('gear:'+k),txt=(g.name+' '+(t?t.eyebrow+' '+t.body:'')+' '+(g.set?VILLAINS[g.set].name+' set':'')).replace(/<[^>]+>/g,' ').toLowerCase();return q.toLowerCase().split(/\s+/).filter(Boolean).every(w=>txt.includes(w))};
const wsSel=(f,O,k,hid)=>`<select data-wsf="${k}" ${hid?`data-wsh="${hid}"`:''} aria-label="${k}">${O[k].map(([v,l])=>`<option value="${v}" ${f[k]===v?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
function eqFilter(h){const f=wsfOf(h.id),ks=[...new Set(S.armory)].filter(g=>{const G=GEAR[g];
    if(f.eq==='empty'&&!fillsEmpty(h,g)||f.eq==='can'&&!wearOK(h,g)||f.eq==='cannot'&&wearOK(h,g))return false;
    if(f.disc!=='all'&&G.type!==f.disc&&!(G.reqs&&G.reqs[f.disc]))return false;if(f.slot!=='all'&&G.slot!==f.slot)return false;return gearQ(g,f.q)}).sort((a,b)=>wearOK(h,b)-wearOK(h,a)||GEAR[a].name.localeCompare(GEAR[b].name));
  const dflt=Object.keys(EF_OPTS).every(k=>f[k]===EF_OPTS[k][0][0])&&!f.q;
  return {ks,bar:`<div class="wsf"><input class="wsq" data-wsh="${h.id}" type="search" autocomplete="off" placeholder="Search the armory" value="${esc(f.q)}">${Object.keys(EF_OPTS).map(k=>wsSel(f,EF_OPTS,k,h.id)).join('')}</div>
    <div class="row between small"><span class="muted">${ks.length} of ${new Set(S.armory).size} armory item${new Set(S.armory).size===1?'':'s'}</span>${dflt?'':`<button class="btn sm" data-a="effreset:${h.id}">Reset filters</button>`}</div>`}}
const fillsEmpty=(h,g)=>{const G=GEAR[g];if(!wearOK(h,g))return false;if(G.cons)return true;const ks=SLOT_KEYS[G.slot]||[G.slot];
  if(G.two)return !h.gear.arms&&!h.gear.arms2;return ks.some(s=>!h.gear[s]&&!(s==='arms2'&&h.gear.arms&&GEAR[h.gear.arms].two))};
/* Version 131 (Tyler): a hero dropdown narrows the equip filters to one hero */
function wsMatch(k,f,canMake){const g=GEAR[k],R=f.hero&&f.hero!=='all'?roster().filter(h=>h.id===f.hero):roster();if(!isUnlocked('gear:'+k))return false;
  if(f.aff==='craft'&&!canMake(k)||f.aff==='cant'&&canMake(k))return false;
  if(f.eq==='empty'&&!R.some(h=>fillsEmpty(h,k))||f.eq==='can'&&!R.some(h=>wearOK(h,k))||f.eq==='cannot'&&R.some(h=>canWear(h,k)))return false;
  if(f.disc!=='all'&&g.type!==f.disc&&!(g.reqs&&g.reqs[f.disc]))return false;
  if(f.slot!=='all'&&g.slot!==f.slot)return false;
  return gearQ(k,f.q)}
function wsFind(canMake,card){const f=wsfOf(),ks=Object.keys(GEAR).filter(k=>wsMatch(k,f,canMake)).sort((a,b)=>canMake(b)-canMake(a)||!!GEAR[a].cons-!!GEAR[b].cons||GEAR[a].req-GEAR[b].req||GEAR[a].name.localeCompare(GEAR[b].name));
  const hn=f.hero!=='all'&&roster().find(h=>h.id===f.hero),O=hn?{...WSF_OPTS,eq:[['empty',`Fills ${hn.name}'s empty slot`],['can',`${hn.name} can equip`],['cannot',`${hn.name} can't equip`],['any','Any']]}:WSF_OPTS,sel=k=>wsSel(f,O,k);
  const dflt=Object.keys(WSF_OPTS).every(k=>f[k]===WSF_OPTS[k][0][0])&&!f.q&&f.hero==='all';
  const heroSel=`<select data-wsf="hero" aria-label="hero"><option value="all">All heroes</option>${roster().map(h=>`<option value="${h.id}" ${f.hero===h.id?'selected':''}>${esc(h.name)}</option>`).join('')}</select>`;
  return `<div class="eyebrow">Find gear</div><div class="wsf"><input id="wsq" class="wsq" type="search" autocomplete="off" placeholder="Search names and abilities" value="${esc(f.q)}">${Object.keys(WSF_OPTS).map(sel).join('')}${heroSel}</div>
    <div class="row between small"><span class="muted">${ks.length} match${ks.length===1?'':'es'}</span>${dflt?'':'<button class="btn sm" data-a="wsfreset">Reset filters</button>'}</div>
    ${ks.length?`<div class="grid2">${ks.slice(0,40).map(card).join('')}</div>${ks.length>40?`<div class="small muted">Showing the first 40. Narrow the search to see the rest.</div>`:''}`:`<div class="cap">Nothing matches. ${f.aff==='craft'&&f.eq==='empty'?'Nothing you can afford right now fills an empty slot. Try "Someone can equip" or "Can\'t afford".':'Try loosening a filter.'}</div>`}`}
document.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.wsf;if(!k)return;wsfOf(e.target.dataset.wsh)[k]=e.target.value;render()});
document.addEventListener('input',e=>{if(!e.target.classList||!e.target.classList.contains('wsq'))return;const hid=e.target.dataset.wsh,v=e.target.value,p=e.target.selectionStart;wsfOf(hid).q=v;render();const n=document.querySelector(hid?`.wsq[data-wsh="${hid}"]`:'#wsq');if(n){n.focus({preventScroll:true});try{n.setSelectionRange(p,p)}catch(_){}}});
function coll(id,head,inner,def=true,cls=''){return `<details class="coll ${cls}" data-cid="${id}" ${uiOpen(id,def)?'open':''}><summary>${head}</summary><div class="cbody">${inner}</div></details>`}
if(!FAST)document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.cid){S.ui=S.ui||{};S.ui[d.dataset.cid]=d.open;save()}},true);

/* ============ SKUNKWORKS ============ */
function rushCost(){const n=S.rd&&S.rd.issue===S.issue?S.rd.rush:0;return {tech:2+n,intel:1+n}}
function research(free){S.rd=S.rd&&S.rd.issue===S.issue?S.rd:{issue:S.issue,rush:0,free:false,last:null};
  if(free){if(S.rd.free)return;S.rd.free=true}else{const c=rushCost();if(!afford(c))return;pay(c);S.rd.rush++}
  const locked=Object.keys(GEAR).filter(k=>!isUnlocked('gear:'+k));
  if(!locked.length){S.rd.last='Every gear blueprint is already on file.';return}
  const top=Math.max(...roster().map(lvlOf));
  const wearNow=locked.filter(k=>roster().some(h=>canWear(h,k)));
  const soon=locked.filter(k=>GEAR[k].req<=top+1);
  const pool=wearNow.length?wearNow:soon.length?soon:locked;const k=pick(pool);unlock(['gear:'+k]);
  S.rd.last=`Blueprint discovered: ${GEAR[k].name} (${reqTxt(GEAR[k])}, ${gearSlotN(GEAR[k])}).`}
function skunkPanel(){if(!S.facilities.includes('skunk'))return '';const rd=S.rd&&S.rd.issue===S.issue?S.rd:{free:false,rush:0,last:null};const c=rushCost();
  const left=Object.keys(GEAR).filter(k=>!isUnlocked('gear:'+k)).length;
  return `<section class="panel">${coll('hq-skunk',`<div><div class="eyebrow">Skunkworks</div><h2>Blueprint research</h2></div>`,
    `<p class="small muted" style="margin:0">One free discovery every issue. Research favors gear someone on the team can already wear. ${left} gear blueprint${left===1?'':'s'} still undiscovered.</p>
    <div class="row"><button class="btn pri" data-a="rd:free" ${rd.free||!left?'disabled':''}>${rd.free?'Free research used':'Research (free)'}</button>
    <button class="btn" data-a="rd:rush" ${afford(c)&&left?'':'disabled'}>Rush research · ${costStr(c)}</button></div>
    ${rd.last?`<div class="cap">${esc(rd.last)}</div>`:''}`)}</section>`}

/* ============ EVENT COMIC FINALE ============ */
const EVENT_TITLES=['Night of Two Masters','Total Breakout','The Long Eclipse','City Under Siege','Twilight of Heroes'];
function setupEvent(){const free=S.villains.filter(v=>v.status==='active').sort((a,b)=>b.level-a.level);const keys=free.slice(0,2).map(v=>v.key);
  S.event={keys,title:pick(EVENT_TITLES),prep:null};S.finalePending=false;S.phase='event';S.view='mission'}
const PREP={scout:{n:'Coordinated recon',txt:'Both villains start with 1 page already torn out.'},
  evac:{n:'Evacuate the district',txt:'Only 2 civilians remain on the battlefield instead of 4, and the city thanks you: +2 trust.'},
  rally:{n:'Rally the team',txt:'Heroes start at full health and composure, and every hero\'s first attack gets +1 die.'}};
function startFinale(p){S.event.prep=p;if(p==='evac')S.trust+=2;
  if(p==='rally')party().forEach(h=>{h.hp=stat(h,'maxHp');h.comp=stat(h,'maxComp')});
  startShowdown({finale:true,keys:S.event.keys,quality:p==='scout'?'prepared':'normal',civs:p==='evac'?2:4});
  if(p==='rally')S.sd.units.forEach(u=>u.buffDice=1)}
function eliteSalvage(L){const sd=S.sd;for(const k of sd.elites||[])if(!sd.hench.some(m=>m.elite&&m.owner===k)){S.salvage[k]=(S.salvage[k]||0)+1;L.push(`${eliteOf(k).name} was taken down: +1 ${VILLAINS[k].salvage}.`)}}
function finaleDebrief(){const sd=S.sd,L=[],names=S.event.keys.map(k=>VILLAINS[k].name).join(' and ');
  eliteSalvage(L);const evT=sd.evac,per=S.ethos.a==='force'?2:1;S.trust+=evT-sd.harmed*per;L.push(`${sd.evac} civilians evacuated, ${sd.harmed} harmed.`);
  let headline;
  if(sd.result==='win'){headline='City saved!';S.trust+=3;L.push(`${names} are beaten together and the city is safe again. +3 trust.`)}
  else{headline=sd.result==='loss'?'Blackharbor falls':'They got away';L.push(sd.result==='loss'?`${names} overwhelm the team.`:`${names} slip away before the dust settles.`)}
  const beatN=S.villains.filter(v=>v.beaten).length+(sd.result==='win'?S.event.keys.filter(k=>!vState(k).beaten).length:0),total=S.villains.length;
  S.chronicle.push(`Event comic, "${S.event.title}": ${headline.toLowerCase().replace('!','')}.`);
  const win=sd.result==='win'&&S.trust>0;
  S.over={win,txt:win?`"${S.event.title}" ends in victory. Volume ${S.vol} closes with ${beatN} of ${total} villains beaten in their lairs.`:`"${S.event.title}" ends in defeat. Volume ${S.vol} closes with ${beatN} of ${total} villains beaten in their lairs, and the city remembers who failed it.`};
  S.after={headline,lines:L,vkey:S.event.keys[0],ethos:null};S.sd=null;N=9;S.phase='after';S.view='mission'}
function eventView(){const e=S.event;
  return `<section class="panel eventsplash"><div class="eyebrow">Volume ${S.vol} · Event comic</div><div><span class="sfxhead">${esc(e.title)}!</span></div>
    <div class="cap tilt">Two villains join forces for one last strike on Blackharbor. They act one after the other every round, on a bigger 11×11 battlefield. Beat both to end the volume in triumph.</div>
    <div class="grid2">${e.keys.map(k=>{const v=vState(k),d=VILLAINS[k];return `<div class="card"><div class="row between"><h3>${d.name}</h3><span class="lvl">LVL ${v.level}</span></div><div class="small muted">${d.tag}. ${v.deck.length}-page playbook.</div><button class="btn sm" data-a="book:${k}" style="align-self:flex-start">Read playbook</button></div>`}).join('')}</div>
    <div class="eyebrow">Choose your preparation</div>
    <div class="grid2">${Object.entries(PREP).map(([k,p])=>`<button class="btn opt" data-a="finale:${k}"><span>${p.n}</span><small>${p.txt}</small></button>`).join('')}</div></section>`}

/* ============ PLAYTEST CHEATS ============ */
function cheatPanel(){const ph=S.phase,inSd=ph==='sd'&&S.sd&&!S.sd.result,god=S.cheat&&S.cheat.god;
  const b=(a,l,dis)=>`<button class="btn sm" data-a="cheat:${a}" ${dis?'disabled':''}>${l}</button>`;
  return `<section class="panel cheats">${coll('cheats','<div><div class="eyebrow">Playtest</div><h3>Cheat menu</h3></div>',
    `<div class="row">${b('res','Add all resources')}${b('xp','+6 XP to every hero')}${b('heal','Heal team')}${b('god',god?'Invincible: ON':'Invincible: off')}${b('tips','Show first-time tips again')}${b('wipe',wipeArmed()?'Tap again to erase your save':'Reset save (first-time player)')}</div>
    <div class="row">${b('unlock','Unlock all blueprints')}${b('build','Build all unlocked facilities')}${b('vlevel','Free villains +1 level')}</div>
    ${ph==='hq'?`<div class="row">${b('arcend',`Skip to end of Arc ${arcOf(S.issue)}`)}${b('finale','Skip to the event comic')}${b('xover','Allow a Crossover Issue now')}</div>`:''}
    ${ph==='inv'?`<div class="row">${b('clues','+3 clues')}</div>`:''}
    ${inSd?`<div class="row">${b('tear','Tear 3 pages from target')}${b('refresh','Refresh actions, powers and resources')}${b('win','Win this fight')}${b('lose','Lose this fight')}</div>`:''}`,false)}</section>`}
const wipeArmed=()=>!!(S.cheat&&S.cheat.wipe&&Date.now()-S.cheat.wipe<6000);
function cheat(a,p2){S.cheat=S.cheat||{};
  switch(a){
    case 'res':S.tech+=20;S.intel+=20;S.trust+=5;for(const k in S.salvage)S.salvage[k]+=6;break;
    case 'xp':roster().forEach(h=>{h.xp+=6;while(h.xp>=xpNeed(h)){h.xp-=xpNeed(h);h.pendingUp++}});break;
    case 'heal':roster().forEach(h=>{h.hp=stat(h,'maxHp');h.comp=stat(h,'maxComp')});if(S.sd)S.sd.units.forEach(u=>{if(u.ko){u.ko=false}});break;
    case 'god':S.cheat.god=!S.cheat.god;break;
    case 'tips':S.tips=[];S.tipsOff=false;S.tipAt=0;break;
    case 'xover':S.cheat.xover=true;break;
    case 'wipe':if(!wipeArmed()){S.cheat.wipe=Date.now();break}try{localStorage.removeItem(KEY)}catch(e){}newCampaign();scrollTo(0,0);break;
    case 'unlock':unlock(ALL_ITEMS);break;
    case 'build':Object.keys(FAC).forEach(k=>{if(isUnlocked('fac:'+k)&&!S.facilities.includes(k))S.facilities.push(k)});break;
    case 'vlevel':S.villains.forEach(v=>{if(v.status==='active')levelUpVillain(v)});break;
    case 'arcend':{S.issue=arcOf(S.issue)*ISSUES_PER_ARC;const k=(S.villains.find(v=>v.status==='active')||S.villains[0]).key;finishIssue(['Playtest skip: time jumps to the end of the arc.'],{hunted:null,headline:'Time skip',vkey:k});break}
    case 'finale':{S.issue=MAX_ISSUE;S.arcInfo=null;const k=(S.villains.find(v=>v.status==='active')||S.villains[0]).key;finishIssue(['Playtest skip: time jumps to the end of the volume.'],{hunted:null,headline:'Time skip',vkey:k});S.arcInfo=null;break}
    case 'clues':if(S.inv){S.inv.clues+=3;intelSync()}break;
    case 'tear':{const sd=S.sd;for(let i=0;i<3&&!sd.result;i++)woundV();break}
    case 'refresh':S.sd.units.forEach(u=>{const h=heroOf(u);u.moved=false;u.acted=false;h.cd=0;u.res={tech:pwrMax(h),magic:arcMax(h)};u.innUsed=0;u.abUsed=[]});break;
    case 'win':S.sd.vl.forEach(o=>o.v.down=true);endSd('win');break;
    case 'lose':S.sd.units.forEach(u=>{u.ko=true;heroOf(u).hp=0});endSd('loss');break;
  }}

/* ============ TUTORIAL ============ */
/* Version 133 (Tyler): a first volume offers a guided first night. Lynx alone against two Diggers, a trip to HQ to recruit Volt and
   craft and equip a Shock Baton, then Mole Boy. The Diggers fight and Mole Boy's first round run on rails: only the highlighted control
   works and each scripted roll comes from S.tut.dq (see d20). After that round the fight plays out with real dice. Losing costs nothing
   beyond his taunt. At the end the player keeps Lynx and Volt or starts an all-new team.
   S.tut={b,dq,...}: b is the beat in TUT (0 = the offer pop-up). S.tutStash holds the real villains, pool and armory meanwhile. */
const TUT_TIPS=['sd','attack','arcs','engines','sig','tabs','salvage'];
const tutOn=()=>!!(S&&S.tut&&S.tut.b);
const tutBeat=()=>tutOn()?TUT[S.tut.b]:null;
const tutH=k=>roster().find(h=>h.cls===k);
const tutIdx=k=>S.sd?S.sd.units.findIndex(u=>{const h=heroOf(u);return !!h&&h.cls===k}):-1;
const tutU=k=>S.sd&&S.sd.units[tutIdx(k)];
const tutCell=p=>p?`cell:${p.x},${p.y}`:'';
const tutDig=id=>S.sd&&S.sd.hench.find(m=>m.id===id);
const tutMole=()=>S.sd&&S.sd.vl[0]&&S.sd.vl[0].v;
const moleState=()=>({key:'mole',level:1,scheme:0,status:'active',deck:VILLAINS.mole.base.map(id=>({id,mk:0})),advIdx:0,beaten:0});
/* select the hero, open Attack, then tap the target */
const tutAtkOnly=(k,tg)=>()=>{const sd=S.sd,i=tutIdx(k),t=tg();if(!t)return [];if(sd.sel!==i)return [tutCell(sd.units[i])];if(sd.mode!=='attack')return ['mode:attack'];return [tutCell(t)]};
const tutAtkRing=(k,tg,lbl)=>()=>{const sd=S.sd,i=tutIdx(k),t=tg();if(sd.sel!==i)return [sd.units[i].x,sd.units[i].y,'Tap '+heroOf(sd.units[i]).name];return sd.mode==='attack'&&t?[t.x,t.y,lbl]:null};
const tutAtkLit=k=>()=>S.sd.sel===tutIdx(k)&&S.sd.mode!=='attack'?'#app [data-a="mode:attack"]':null;
const tutAimDest=(k,pick)=>{const sd=S.sd,u=tutU(k),r=reachH(u,stat(heroOf(u),'move'));const c=pick(Object.keys(r).map(s=>{const[x,y]=s.split(',').map(Number);return {x,y}}));S.tut.dest=c?[c.x,c.y]:null};
const TUT=[
  {id:'offer'},
  {id:'meet',next:1,nextL:'To the subway',only:[],t:'This is <b>Lynx</b>, a tracker who fights up close. Diggers are breaking into the subway on 9th Street. Every number on this card gets explained the first time it matters, so don\'t try to memorise anything.',
    extra:()=>{const h=tutH('lynx');if(!h)return '';const st=[['hp','Health',stat(h,'maxHp')],['move','Move',stat(h,'move')],['dice','Dice',stat(h,'speed')],['acc','Accuracy','+'+stat(h,'acc')],['str','Strength','+'+stat(h,'str')],['eva','Evasion',stat(h,'eva')],['rng','Range',stat(h,'range')],['comp','Composure',stat(h,'maxComp')]];
      return `<div class="tutst">${st.map(([i,l,v])=>`<span>${UI(i)}<b>${v}</b><small>${l}</small></span>`).join('')}</div>`},
    go:()=>tutPatrol()},
  /* the Diggers */
  {id:'p-sel',only:()=>[tutCell(tutU('lynx'))],ring:()=>{const u=tutU('lynx');return [u.x,u.y,'Tap Lynx']},done:()=>S.sd.sel===tutIdx('lynx'),
    t:'Two Diggers, and they\'ve spotted you. <b>Tap Lynx</b> to take control.'},
  {id:'p-move',enter:()=>{const B=tutDig('tB'),A=tutDig('tA');tutAimDest('lynx',ps=>ps.filter(p=>cheb(p,A)===1&&cheb(p,B)>=2).sort((p,q)=>cheb(p,B)-cheb(q,B)||cheb(p,tutU('lynx'))-cheb(q,tutU('lynx')))[0])},
    only:()=>S.tut.dest?[`cell:${S.tut.dest.join(',')}`]:[],ring:()=>S.tut.dest?[...S.tut.dest,'Move here']:null,done:()=>tutU('lynx').moved,
    t:'Each round a hero can <b>move once</b> and take <b>one action</b>, like an attack. Selecting a hero opens Move, and the blue hexes are in reach. Lynx hits at range 1, so get next to a Digger: <b>tap the ringed hex</b>.'},
  {id:'p-atk',dq:[14,2],only:tutAtkOnly('lynx',()=>tutDig('tA')),ring:tutAtkRing('lynx',()=>tutDig('tA'),'Attack'),lit:tutAtkLit('lynx'),done:()=>tutU('lynx').acted,
    t:'Now hit it. Lynx rolls 2 dice. <b>Tap Attack</b>, then the ringed Digger.'},
  {id:'p-roll',only:[],done:()=>!S.sd.busy,t:'Each die is a <b>d20 plus accuracy</b>. Match or beat the target\'s evasion to hit. 14 + 4 = 18 beats evasion 7, but 2 + 4 = 6 falls short. One hit, one miss, and each hit does 1 damage to a henchman.'},
  {id:'p-end',dq:[9,1],only:['endround'],lit:()=>'#app [data-a="endround"]',done:()=>S.sd.busy||S.sd.round>=2,
    t:'Lynx has moved and attacked. <b>End the round</b> and the bad guys take their turn.'},
  {id:'p-enemy',next:1,only:[],wait:()=>!S.sd.busy,t:'Henchmen roll too: a d20 + 2 against Lynx\'s evasion of 10. The first Digger rolled 9 and landed a hit for 1. The other rolled a <b>natural 1, which always misses</b>, whatever the bonus.'},
  {id:'p-lp',next:1,only:[],wait:()=>{const B=tutDig('tB');return !!B&&S.tut.lp===`${B.x},${B.y}`},ring:()=>{const B=tutDig('tB');return B?[B.x,B.y,'Hold']:null},
    t:'Round 2. Hold your finger on any hex (or hold the mouse button) to see what\'s on it and your odds. <b>Long-press the fresh Digger.</b>'},
  {id:'p-atk2',dq:[20,12],only:tutAtkOnly('lynx',()=>tutDig('tB')),ring:tutAtkRing('lynx',()=>tutDig('tB'),'Attack'),lit:tutAtkLit('lynx'),done:()=>tutU('lynx').acted,
    t:'Lynx is already in place, so no need to move. <b>Tap Lynx, then Attack, then the fresh Digger.</b>'},
  {id:'p-roll2',only:[],done:()=>!S.sd.busy,t:'A <b>natural 20 always hits</b>, whatever the evasion. Remember that against tough villains.'},
  {id:'p-end2',dq:[5],only:['endround'],lit:()=>'#app [data-a="endround"]',done:()=>S.sd.busy||S.sd.round>=3,t:'One Digger left. <b>End the round.</b>'},
  {id:'p-atk3',dq:[16,8],only:tutAtkOnly('lynx',()=>tutDig('tA')),ring:tutAtkRing('lynx',()=>tutDig('tA'),'Attack'),lit:tutAtkLit('lynx'),done:()=>!!S.sd.result,
    t:'It missed. Finish the job: <b>Lynx, Attack, Digger.</b>'},
  {id:'p-won',only:['tut:hq'],lit:()=>'#app [data-a="tut:hq"]',done:()=>S.phase==='hq',t:'Subway safe! These Diggers work for a villain called Mole Boy, and they dropped his <b>salvage</b>, called Grit. <b>Head back to HQ.</b>'},
  /* HQ */
  {id:'h-grit',next:1,only:[],lit:()=>'.mast .chip[aria-label="Grit"]',t:'Your 2 Grit sits in the masthead with your other resources. Every villain drops their own kind of salvage, and the Workshop turns it into gear.'},
  {id:'h-recruit',only:['qb:volt'],lit:()=>'#app [data-a="qb:volt"]',done:()=>!!tutH('volt'),t:'Lynx fights up close. Volt hits from 4 hexes away. Heroes who fight differently cover each other. <b>Recruit Volt.</b>'},
  {id:'h-craft',only:['craft:baton'],lit:()=>'#app [data-a="craft:baton"]',done:()=>S.armory.includes('baton')||(tutH('volt')&&tutH('volt').gear.arms==='baton'),
    t:'Crafting spends salvage and puts the item in your armory. Volt has a rank in Tech, so a Tech weapon fits. <b>Craft the Shock Baton.</b>'},
  {id:'h-roster',enter:()=>{const V=tutH('volt');S.ui=S.ui||{};S.ui['ro-party']=true;if(V)S.ui['h-'+V.id]=true},only:['view:roster'],lit:()=>'#app [data-a="view:roster"]',done:()=>S.view==='roster',
    t:'The baton is in the armory. <b>Open the Roster tab</b> to hand it to Volt.'},
  {id:'h-slot',only:()=>{const V=tutH('volt');return [`slotpick:${V.id}:arms`]},lit:()=>`#app [data-a="slotpick:${tutH('volt').id}:arms"]`,done:()=>!!slotPick&&slotPick.h===tutH('volt').id,
    t:'Empty gear slots are buttons. <b>Tap Volt\'s Main Hand slot</b> to see what fits it.'},
  {id:'h-equip',only:()=>{const V=tutH('volt');return [`equip:${V.id}:baton:arms`,`slotpick:${V.id}:arms`]},lit:()=>{const V=tutH('volt');return slotPick?`#slotpick [data-a="equip:${V.id}:baton:arms"]`:`#app [data-a="slotpick:${V.id}:arms"]`},
    done:()=>tutH('volt').gear.arms==='baton',t:'<b>Tap the Shock Baton</b> to equip it.'},
  {id:'h-stats',next:1,only:[],lit:()=>`[data-cid="h-${tutH('volt').id}"] .stats`,t:'Volt\'s accuracy and Strength went up. The baton also gives Volt a new fight button, <b>Stun Charge</b>: it spends Power for +4 Strength on the next attack.'},
  {id:'h-vil',only:['view:villains'],lit:()=>'#app [data-a="view:villains"]',done:()=>S.view==='villains',t:'A case file just landed on your desk. <b>Open the Villains tab.</b>'},
  {id:'h-go',only:['tut:fight'],lit:()=>'#app [data-a="tut:fight"]',done:()=>S.phase==='sd',
    t:'Normally you investigate a villain first to learn their tricks. Tonight there\'s no time: Mole Boy is tunnelling under the bank right now. <b>Confront him.</b>'},
  /* Mole Boy, round 1 */
  {id:'b-splash',only:['sdgo'],lit:()=>'[data-a="sdgo"]',done:()=>!S.sd.intro,t:'Every fight opens with the villain\'s splash page. <b>Fight!</b>'},
  {id:'b-pages',next:1,only:[],lit:()=>'#app .pips',t:'Villains have no health bar. Their <b>playbook is their health</b>: every wound tears out a page. Mole Boy has 4 pages, so 4 wounds beat him.'},
  {id:'b-sig',next:1,only:[],lit:()=>'#app .cap.warn',t:'Wounds always tear out the <b>top</b> page, and his top page is a Signature Move, Big Dig. Wound him this round and it never happens.'},
  {id:'b-arcs',next:1,only:[],lit:()=>'#app .boardwrap',t:'The yellow arrow shows where he faces, and the tinted hexes in front are his <b>front arc</b>. The shaded hexes behind him are his <b>blind spot</b>: attacks from there roll +1 die. Some hit reactions only trigger from one side.'},
  {id:'b-volt',only:()=>[tutCell(tutU('volt'))],ring:()=>{const u=tutU('volt');return [u.x,u.y,'Tap Volt']},done:()=>S.sd.sel===tutIdx('volt'),t:'Volt first. <b>Tap Volt.</b>'},
  {id:'b-stun',only:['ab:baton'],lit:()=>'#app [data-a="ab:baton"]',done:()=>{const u=tutU('volt');return u.buffStr>=4&&!S.sd.busy},
    t:'Mole Boy\'s skull is thick. <b>Stun Charge</b> spends 2 Power for +4 Strength on Volt\'s next attack, and Power refills a little every round. <b>Tap Stun Charge.</b>'},
  {id:'b-vatk',dq:[17,1,6],only:tutAtkOnly('volt',tutMole),ring:tutAtkRing('volt',tutMole,'Attack'),lit:tutAtkLit('volt'),done:()=>tutU('volt').acted,
    t:'Volt can hit him from 4 hexes away. <b>Tap Attack, then Mole Boy.</b>'},
  {id:'b-vres',only:[],done:()=>!S.sd.busy,t:'Every hit draws a <b>hit reaction</b>, then rolls <b>d20 + Strength against toughness</b>. Hard Hat added +4 toughness because Volt hit him from the front, but Stun Charge got the wound through: 6 + 8 = 14 against 12. Without it, 6 + 4 = 10 would have bounced. And there goes Big Dig!'},
  {id:'b-lynx',only:()=>[tutCell(tutU('lynx'))],ring:()=>{const u=tutU('lynx');return [u.x,u.y,'Tap Lynx']},done:()=>S.sd.sel===tutIdx('lynx'),t:'Now Lynx. <b>Tap Lynx.</b>'},
  {id:'b-lmove',enter:()=>{const v=tutMole();tutAimDest('lynx',ps=>{const near=ps.filter(p=>dV(p,v)===1),u=tutU('lynx');return (near.filter(p=>sideOf(p,v)==='rear')[0]&&near.filter(p=>sideOf(p,v)==='rear').sort((a,b)=>cheb(a,u)-cheb(b,u))[0])||near.sort((a,b)=>cheb(a,u)-cheb(b,u))[0]})},
    only:()=>S.tut.dest?[`cell:${S.tut.dest.join(',')}`]:[],ring:()=>S.tut.dest?[...S.tut.dest,'Blind spot']:null,done:()=>tutU('lynx').moved,
    t:'Lynx moves 5. Swing around behind him: <b>tap the ringed hex</b> in his blind spot.'},
  {id:'b-latk',dq:[12,9,1,10,4],only:tutAtkOnly('lynx',tutMole),ring:tutAtkRing('lynx',tutMole,'Attack'),lit:tutAtkLit('lynx'),done:()=>tutU('lynx').acted,
    t:'From the blind spot Lynx rolls 3 dice instead of 2. <b>Tap Attack, then Mole Boy.</b>'},
  {id:'b-lres',only:[],done:()=>!S.sd.busy,t:'<b>Soft Belly</b> only triggers from the blind spot, so that wound landed for free. A hit doesn\'t always wound, though: the Clean Hit rolled 4 + 2 = 6, short of his toughness of 8.'},
  {id:'b-end',dq:[13],only:['endround'],lit:()=>'#app [data-a="endround"]',done:()=>S.sd.busy||S.sd.round>=2,t:'Both heroes have acted. <b>End the round.</b>'},
  {id:'b-vturn',next:1,only:[],wait:()=>!S.sd.busy,t:'Every round the villain plays the top page of its playbook. <b>Tunnel Ambush:</b> he dug under the floor and burst up next to the hero farthest away, leaving rubble where he went down.'},
  {id:'b-free',next:1,nextL:'Play on',only:[],go:()=>{S.tut.dq=[];S.tips=[...new Set([...(S.tips||[]),...TUT_TIPS])]},
    t:'That\'s the end of the script. Mole Boy has 2 pages left. <b>Finish him off on your own</b>, with real dice. Long-press anything you\'re unsure about.'},
  {id:'free'},
  {id:'end'}];
function tutGo(i){const t=S.tut;t.b=i;const B=TUT[i];if(B&&B.dq)t.dq=B.dq.slice();if(B&&B.enter)B.enter()}
function tutTick(){if(!tutOn())return;const sd=S.sd;
  if(sd&&sd.patrol&&!sd.result&&!sd.busy&&!sd.hench.length){sd.result='win';sd.sel=null;sd.mode=null;log('sys','Patrol cleared. The subway is safe.')}
  for(let g=0;g<6;g++){const B=TUT[S.tut.b];if(!B||!B.done||!B.done())break;tutGo(S.tut.b+1)}}
/* a scripted beat accepts only its own taps; tutorial buttons and the playtest cheats always work */
function tutBlock(a){const B=tutBeat();if(!B||!B.only||!a)return false;if(a.startsWith('tut:')||a.startsWith('cheat:'))return false;
  const o=typeof B.only==='function'?B.only():B.only;if(o.includes(a))return false;
  const c=document.getElementById('tutc');if(c){c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake')}return true}
function tutLP(el){if(!tutOn())return;const d=el.dataset.tip||'';if(d.startsWith('cell:')){S.tut.lp=d.slice(5).replace(':',',');save();setTimeout(tutPaint,0)}}
function tutBoard(n){N=n;lastPos={};const sd=S.sd={N:n,finale:false,vkey:'mole',quality:'normal',round:1,obs:[],units:[],hench:[],civs:[],vl:[],vi:0,tdk:{},walls:[],pits:[],haz:[],bombs:[],beams:[],
  sel:null,mode:null,busy:false,log:[],evac:0,harmed:0,woundsBy:{},result:null,fx:[],intro:false,hexv:1};sd.exits=mkExits(n,false);return sd}
function tutHero(sd,k,x,y){const h=tutH(k);h.hp=stat(h,'maxHp');h.comp=stat(h,'maxComp');h.cd=0;sd.units.push(mkUnit(h,x,y))}
function tutStart(){S.tutStash={villains:S.villains,pool:S.pool,armory:S.armory};S.villains=[moleState()];S.pool=[];S.armory=[];S.guide=null;
  recruitQuick('lynx');S.tut={b:0,dq:[]};tutGo(TUT.findIndex(b=>b.id==='meet'));S.phase='hq';S.view='hq'}
function tutPatrol(){const sd=tutBoard(7);sd.patrol=true;
  sd.vl.push({key:'mole',v:{x:0,y:0,shape:'one',face:5,level:1,deck:[],discard:[],wounds:[],last:null,down:true}});focusV(0);
  tutHero(sd,'lynx',3,6);sd.hench.push({id:'tA',owner:'mole',x:2,y:2,hp:2},{id:'tB',owner:'mole',x:5,y:1,hp:2});sd.obs.push('0,2','6,4');
  S.phase='sd';S.view='mission';log('sys','Patrol: Diggers on the 9th Street subway platform.');log('sys','Round 1. Tap a hero to act.')}
function tutPatrolEnd(){const h=tutH('lynx');S.salvage.mole=(S.salvage.mole||0)+2;h.xp+=1;h.hp=stat(h,'maxHp');h.comp=stat(h,'maxComp');S.sd=null;N=9;S.phase='hq';S.view='hq'}
function tutBoss(){if(!tutH('volt'))return;const sd=tutBoard(7),vs=vState('mole');
  sd.vl.push({key:'mole',v:{x:3,y:2,shape:'one',face:5,level:vs.level,deck:['dig','claw','tunnel','kick'].map(id=>buildCard('mole',{id,mk:0})),discard:[],wounds:[],last:null}});focusV(0);
  sd.obs.push('0,2','6,3');tutHero(sd,'lynx',1,6);tutHero(sd,'volt',5,6);
  sd.tdk.mole=[{...rxOf('mole','hardhat'),sig:'mole'},{...rxOf('mole','belly'),sig:'mole'},...TACT.filter(t=>t.id==='glance')];
  faceTo(sd.units[1]);sd.intro=!FAST;S.phase='sd';S.view='mission';vWarn();
  log('sys','Issue #1: Mole Boy\'s tunnel under the First City Bank. Standoff.');log('sys','Round 1. Tap a hero to act.')}
function tutFinish(){const sd=S.sd,t=S.tut,win=sd.result==='win',L=[];
  if(win){S.salvage.mole+=3;L.push('Salvaged 3 Grit from the tunnel.')}else L.push('The team is dragged out of the tunnel, a little dusty. No harm done.');
  const xp=[];sd.units.forEach(u=>{const h=heroOf(u);h.xp+=1;xp.push(`${h.name} +1`);h.hp=stat(h,'maxHp');h.comp=stat(h,'maxComp')});L.push(`XP earned: ${xp.join(', ')}.`);
  if(win)L.push('Mole Boy escapes into his tunnels. Something tells you he\'ll be back.');
  t.won=win;t.lines=L;S.sd=null;N=9;S.phase='tutend';S.view='mission';tutGo(TUT.findIndex(b=>b.id==='end'))}
function tutSkip(){const t=S.tut;S.sd=null;N=9;slotPick=null;t.skip=true;t.lines=null;S.phase='tutend';S.view='mission';tutGo(TUT.findIndex(b=>b.id==='end'))}
function tutClose(){S.tips=[...new Set([...(S.tips||[]),...TUT_TIPS])];S.tut=null;S.tutDone=true;S.tutStash=null;S.sd=null;N=9;S.phase='hq';S.view='hq'}
function tutKeep(){const st=S.tutStash||{};S.villains=(st.villains||S.villains).filter(v=>v.key!=='mole');S.pool=st.pool||S.pool;S.armory=[...(st.armory||[]),...S.armory];
  roster().forEach(h=>{h.hp=stat(h,'maxHp');h.comp=stat(h,'maxComp')});tutClose();S.guide={s:1,pop:null}}
function tutFresh(){const keep={tips:S.tips,seen:S.seen,seenR:S.seenR,tipsOff:S.tipsOff};newCampaign();Object.assign(S,keep);tutClose()}
function tutAct(p){switch(p){
  case 'start':tutStart();scrollTo(0,0);break;
  case 'no':S.tut=null;S.tutDone=true;break;
  case 'next':{const B=tutBeat();if(!B||!B.next||(B.wait&&!B.wait()))break;if(B.go)B.go();tutGo(S.tut.b+1);break}
  case 'skip':if(tutOn())tutSkip();break;
  case 'hq':if(S.sd&&S.sd.patrol&&S.sd.result)tutPatrolEnd();scrollTo(0,0);break;
  case 'fight':tutBoss();scrollTo(0,0);break;
  case 'keep':if(S.phase==='tutend')tutKeep();scrollTo(0,0);break;
  case 'fresh':if(S.phase==='tutend')tutFresh();scrollTo(0,0);break}}
function tutModal(){if(FAST||!S.tut||S.tut.b||S.phase!=='hq')return '';
  return `<div id="guide" role="dialog" aria-modal="true" aria-labelledby="gtitle"><div class="gbox"><div class="eyebrow">Volume ${S.vol} · New to Blackharbor?</div><div><span class="sfxhead" id="gtitle">Your first night on patrol</span></div>
    <p class="small" style="margin:0">Learn the ropes in about 6 minutes: a scuffle with two henchmen, a trip to HQ to recruit a hero and craft them a weapon, and a small villain to beat. Afterwards you can keep those heroes or start an all-new team.</p>
    <div class="row"><button class="btn pri" data-a="tut:start">Start the tutorial</button><button class="btn" data-a="tut:no">Skip, I know how to play</button></div></div></div>`}
/* HQ during the tutorial: only the one thing the player needs next */
function tutHq(only){const V=tutH('volt'),d=VILLAINS.mole;
  if(only==='villains')return `<section class="panel"><div><div class="eyebrow">Case files · 1 open</div><h2>Case files</h2></div>
    <div class="card"><div class="row between"><div class="row" style="flex-wrap:nowrap;gap:8px"><span class="vbadge" style="${vSty('mole')}">${vIc('mole')}</span><h3>${d.name}</h3></div><span class="lvl" data-tip="kw:vlevel">LVL 1</span></div>
    <div class="small muted">${d.tag}. Drops <span class="cost">${resIc('mole')}</span>${d.salvage}. <span class="kwd" data-tip="kw:playbook">4-page playbook</span>.</div>
    <p class="small" style="margin:0">${esc(VINTEL.mole.intro)}</p><button class="btn pri" data-a="tut:fight">Confront Mole Boy</button></div></section>`;
  const baton=V||S.armory.includes('baton');
  return `<section class="panel"><div><div class="eyebrow">Recruitment · ${roster().length}/${ROSTER_MAX} heroes</div><h2>New heroes</h2></div>
    ${V?'<p class="small muted" style="margin:0">Volt has joined the team. The rest of the recruiting desk opens after tonight.</p>':`<div class="grid2">${qbCard('volt')}</div>`}</section>
  ${baton?`<section class="panel"><div><div class="eyebrow">Workshop</div><h2>Gear from salvage</h2></div>
    <p class="small muted" style="margin:0">Each item fills one body slot and needs the listed discipline rank to equip. "Any salvage" can be paid from any villain's salvage.</p>
    <div class="grid2"><div class="card" data-tip="gear:baton">${gearInfo('baton')}<div class="row between"><span class="small mono">${costHtml(GEAR.baton.cost)}</span>${S.armory.includes('baton')||(V&&V.gear.arms==='baton')?'<span class="tag g">Crafted</span>':`<button class="btn sm" data-a="craft:baton" ${afford(GEAR.baton.cost)?'':'disabled'}>Craft</button>`}</div></div></div></section>`:''}`}
function tutEndView(){const t=S.tut||{},ns=roster().map(h=>h.name),gear=roster().some(h=>h.gear.arms==='baton')?', the Shock Baton':'';
  const head=t.skip?'Tutorial skipped':t.won?'Mole Boy dug away!':'Mole Boy got away';
  return `<section class="panel"><div class="eyebrow">Tutorial complete</div><div><span class="sfxhead ${t.won===false?'bad':''}">${head}</span></div>
    ${t.lines?`<ul class="lines">${t.lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`:''}
    <p style="margin:0">Eleven villains are loose in Blackharbor. Who answers the call?</p>
    <div class="grid2"><button class="btn opt" data-a="tut:keep"><span>Keep ${esc(ns.join(' and ')||'the team')}</span><small>They join Volume ${S.vol}${gear}${S.salvage.mole?` and your ${S.salvage.mole} Grit`:''} come with them. Recruit more heroes to fill a party of four.</small></button>
      <button class="btn opt" data-a="tut:fresh"><span>Start an all-new team</span><small>A fresh Volume ${S.vol} with an empty roster and the starter locker. Write your own heroes or pick quick builds.</small></button></div></section>`}
let tutSeenB=-1;
function tutPaint(){let c=document.getElementById('tutc');const B=tutBeat();document.querySelectorAll('.tutlit').forEach(e=>e.classList.remove('tutlit'));document.querySelectorAll('.tutring').forEach(e=>e.remove());
  if(!B||!B.t){if(c)c.remove();document.body.classList.remove('tutpad');tutSeenB=-1;return}
  if(!c){c=document.createElement('div');c.id='tutc';c.setAttribute('role','status');document.body.appendChild(c)}
  const ready=!B.wait||B.wait(),txt=typeof B.t==='function'?B.t():B.t;
  const html=`<div class="tc"><b>Dispatch</b><p>${txt}</p>${B.extra?B.extra():''}<div class="row">${B.next?`<button class="btn sm pri" data-a="tut:next" ${ready?'':'disabled'}>${B.nextL||'Next'}</button>`:''}<button class="btn sm" data-a="tut:skip" style="margin-left:auto">Skip tutorial</button></div></div>`;
  if(c.dataset.h!==html){c.innerHTML=html;c.dataset.h=html}c.classList.toggle('top',!!document.querySelector('#atk,#cards,#brk'));
  document.body.classList.add('tutpad');document.body.style.setProperty('--tutpad',(c.offsetHeight+20)+'px');
  let tgt=null;const sel=B.lit&&B.lit();if(sel)document.querySelectorAll(sel).forEach(e=>{e.classList.add('tutlit');tgt=tgt||e});
  const r=B.ring&&B.ring();if(r){const cell=document.querySelector(`.board [data-cell="${r[0]},${r[1]}"]`);if(cell){const d=document.createElement('div');d.className='tutring';d.setAttribute('style',cell.getAttribute('style'));
    d.innerHTML=`<svg viewBox="0 0 100 115.5" preserveAspectRatio="none" aria-hidden="true"><polygon points="50,3 97,30 97,85.5 50,112.5 3,85.5 3,30"/></svg>${r[2]?`<span>${esc(r[2])}</span>`:''}`;cell.parentNode.appendChild(d);tgt=tgt||d}}
  /* scroll the target into view whenever it changes, clear of the caption at the bottom */
  const key=S.tut.b+'|'+sel+'|'+(r||'');if(key!==tutSeenB){tutSeenB=key;if(tgt&&!document.getElementById('atk')&&!document.getElementById('cards'))setTimeout(()=>{if(!tgt.isConnected)return;const R=tgt.getBoundingClientRect(),top=c.getBoundingClientRect().top;
    if(R.top<8||R.bottom>top-8)scrollBy({top:R.top+R.height/2-Math.min(innerHeight/2,(top-8)/2),behavior:RM?'auto':'smooth'})},60)}}

/* while an attack panel, playbook page or break splash is up, the caption moves to the top and lets taps through to it */
if(!FAST&&typeof MutationObserver!=='undefined')new MutationObserver(()=>{const c=document.getElementById('tutc');if(c)c.classList.toggle('top',!!document.querySelector('#atk,#cards,#brk'))}).observe(document.body,{childList:true});

/* ============ INPUT ============ */
document.addEventListener('click',e=>{
  {const c0=e.target.closest('[data-cell]'),e0=e.target.closest('[data-a]');if(tutBlock(c0&&S.phase==='sd'?'cell:'+c0.dataset.cell:e0&&!e0.disabled?e0.dataset.a:null))return}
  const cell=e.target.closest('[data-cell]');if(cell&&S.phase==='sd'){onCell(...cell.dataset.cell.split(',').map(Number));return}
  const el=e.target.closest('[data-a]');if(!el||el.disabled||el.getAttribute('aria-disabled')==='true')return;const[a,p1,p2,p3]=el.dataset.a.split(':');
  switch(a){
    case 'view':S.view=p1;break;
    case 'wsby':S.ui=S.ui||{};S.ui.wsBy=p1;break;
    case 'build':if(facOpen(p1)&&afford(FAC[p1].cost)){pay(FAC[p1].cost);S.facilities.push(p1)}break;
    case 'craft':case 'crafteq':if(GEAR[p1]&&afford(GEAR[p1].cost)&&anyAsk(GEAR[p1].cost)){pickAny(GEAR[p1]).then(pk=>{if(pk)doCraft(a,p1,p2,pk);render()});return}doCraft(a,p1,p2);break;
    case 'anyauto':S.anyAuto=p1==='1';break;
    case 'equip':{const h=S.heroes.find(x=>x.id===p1);slotPick=null;if(!h||!(S.phase==='hq'||prepGear()))break;equipHero(h,p2,p3);break}
    case 'wsfreset':{S.ui=S.ui||{};S.ui.wsf={};break}
    case 'effreset':{S.ui=S.ui||{};if(S.ui.ef)delete S.ui.ef[p1];break}
    case 'slotpick':{slotPick=p1==='close'?null:{h:p1,s:p2};break}
    case 'guide':{const g=S.guide;if(!g)break;if(p1==='skip'){S.guide=null;break}if(p1==='go'){g.s=1;g.pop=null;break}if(p1==='close'){g.pop=null;break}
      if(p1==='next'){if(g.s===2){g.s=3;g.pop='gear'}else if(g.s===3){g.s=4;g.pop='roster'}break}
      if(p1==='open'){g.pop=null;S.ui=S.ui||{};if(p2==='roster'){S.view='roster';S.ui['ro-party']=S.ui['ro-bench']=true;roster().forEach(h=>S.ui['h-'+h.id]=true)}else{S.view=p2.startsWith('vl-')?'villains':'hq';S.ui[p2]=true}
        render();const t=p2==='roster'?null:document.querySelector(`[data-cid="${p2}"]`);if(t)t.scrollIntoView({block:'start',behavior:RM?'auto':'smooth'});else scrollTo(0,0);return}
      break}
    case 'unequip':{const h=S.heroes.find(x=>x.id===p1);if(!h||!(S.phase==='hq'||prepGear()))break;const g=h.gear[p2];if(g){delete h.gear[p2];S.armory.push(g);clampHero(h)}break}
    case 'track':{const h=S.heroes.find(x=>x.id===p1);if(!h||h.trackPick||!TRACKS[p2]||h.ranks[p2]>=RANK_MAX)break;const mh=stat(h,'maxHp'),mc=stat(h,'maxComp');h.ranks[p2]++;h.trackPick=p2;h.hp+=Math.max(0,stat(h,'maxHp')-mh);h.comp+=Math.max(0,stat(h,'maxComp')-mc);break}
    case 'up':{const h=S.heroes.find(x=>x.id===p1);h.upgrades.push(p2);h.pendingUp--;h.upChoices=null;h.trackPick=null;if(p2==='hp')h.hp+=3;if(p2==='comp')h.comp+=2;break}
    case 'ab':useAb(p1);break;
    case 'unpouch':{const h=S.heroes.find(x=>x.id===p1);if(!h||!(S.phase==='hq'||prepGear()))break;const p=pouchOf(h),g=p[+p2];if(g){p.splice(+p2,1);S.armory.push(g)}break}
    case 'book':openPlaybook(p1);return;
    case 'inv':startInv(p1);break;
    case 'invopt':{const i=S.inv,ev=evOf(i.events[i.step]),o=ev.opts[+p1];lastInvRoll=null;i.res=o.run(i);
      {const r=lastInvRoll,m=/Roll (\d+)\+/.exec(o.h);if(r&&i.res.startsWith(`Rolled ${r.t}.`))i.res=`Rolled ${r.t}${r.b?` (d20 ${r.d} + ${r.b})`:''}${m?`, needed ${m[1]}+`:''}.`+i.res.slice(`Rolled ${r.t}.`.length)}
      intelSync();break}
    case 'invnext':S.inv.step++;S.inv.res=null;S.inv.fresh=0;break;
    case 'invgo':S.inv.intro=false;break;
    case 'lair':startShowdown();break;
    case 'mode':S.sd.mode=S.sd.mode===p1?null:p1;break;
    case 'power':usePower();break;
    case 'escort':escort();return;
    case 'hack':hack();return;
    case 'letgo':{const u=S.sd&&S.sd.units[S.sd.sel];if(u)letGo(u,'lets the civilians go.');break}
    case 'endround':villainPhase();return;
    case 'debrief':if(tutOn()){tutFinish();break}S.sd.finale?finaleDebrief():debrief();break;
    case 'tut':tutAct(p1);break;
    case 'sdgo':{const sd=S.sd;if(!sd||!sd.intro)break;sd.intro=false;if(sd.quality==='ambush'&&sd.round===0&&!sd.busy){render();setTimeout(villainPhase,500);return}break}
    case 'sdlook':if(S.sd)S.sd.outro=true;break;
    case 'ethos':S.ethos[p1]=p2;if(p1==='b'&&p2==='secret')roster().forEach(h=>h.comp=stat(h,'maxComp'));S.after.ethos=null;break;
    case 'next':S.after=null;if(S.over)S.phase='over';else if(S.arcInfo){S.phase='arc';S.view='mission'}else if(S.finalePending)setupEvent();else{S.phase='hq';S.view='hq'}break;
    case 'finale':startFinale(p1);break;
    case 'focus':focusV(+p1);break;
    case 'hush':{const o=S.sd&&S.sd.vl[+p1];if(o)o.v.hush=o.v.warn;break}
    case 'rd':research(p1==='free');break;
    case 'cheat':cheat(p1,p2);break;
    case 'tip':S.tips=S.tips||[];if(p1==='off')S.tipsOff=true;else if(p2&&!S.tips.includes(p2))S.tips.push(p2);S.tipAt=Date.now();break;
    case 'ostart':if(S.cre&&S.cre.mode===p1)S.view='create';else if(p1==='basic'||xoverOpen())oStart(p1);render();scrollTo(0,0);return;
    case 'opick':oPick(p1,p2);break;
    case 'oup':{const c=S.cre;if(c.ups.length<oLevel(c)-1&&c.ups.filter(u=>u===p1).length<2)c.ups.push(p1);break}
    case 'ounup':S.cre.ups.splice(+p1,1);break;
    case 'ogear':{const c=S.cre,i=c.gear.indexOf(p1);if(i>=0)c.gear.splice(i,1);else if(c.gear.length<oGearMax(c)&&!c.gear.some(g=>GEAR[g].slot===GEAR[p1].slot))c.gear.push(p1);break}
    case 'ohq':{const c=S.cre,i=c.hq.indexOf(p1);if(i>=0)c.hq.splice(i,1);else if(c.hq.length<oHqMax(c))c.hq.push(p1);break}
    case 'ocol':S.cre.col=p1;break;
    case 'orand':S.cre.sugg=oSuggest(S.cre);break;
    case 'osug':{const c=S.cre,n=c.sugg&&c.sugg[+p1];if(n)c.name=n;break}
    case 'odisc':{const c=S.cre,sp=oOpt('spark',c.picks.spark);c.disc=p1;if(sp&&sp.track!==p1){delete c.picks.spark;if(c.picks.gift&&!O_POW[p1].includes(c.picks.gift))delete c.picks.gift;delete c.picks.training;c.ups=[];c.gear=[]}break}
    case 'onext':{const c=S.cre,st=oSteps(c);if(oValid(c,st[c.step])&&c.step<st.length-1)c.step++;render();scrollTo(0,0);return}
    case 'oback':S.cre.step=Math.max(0,S.cre.step-1);render();scrollTo(0,0);return;
    case 'ocancel':S.cre=null;S.view='hq';break;
    case 'ofinish':oFinish();render();scrollTo(0,0);return;
    case 'qb':recruitQuick(p1);break;
    case 'bench':S.party=S.party.filter(id=>id!==p1);break;
    case 'join':if(S.party.length<4&&!S.party.includes(p1))S.party.push(p1);break;
    case 'swap':{const i=S.party.indexOf(p2);if(i>=0&&!S.party.includes(p1))S.party[i]=p1;break}
    case 'arcnext':S.arcInfo=null;S.phase='hq';S.view='hq';break;
    case 'restart':newCampaign(S);break;
  }render()});
document.addEventListener('input',e=>{if(e.target.id==='oname'&&S.cre){const v=oClean(e.target.value);if(v!==e.target.value)e.target.value=v;S.cre.name=v;save()}});
async function act(fn){const sd=S.sd;if(sd.busy)return;sd.busy=true;const keepSel=sd.sel;sd.mode=null;render();
  try{await fn()}finally{if(S.sd===sd){sd.busy=false;if(!sd.result)sd.units.forEach(civFollow);checkLoss();if(sd.sel==null&&!sd.result)sd.sel=keepSel;if(sd.thenMode&&!sd.result){sd.mode=sd.thenMode}sd.thenMode=null;render()}}}
function usePower(){const sd=S.sd,u=sd.units[sd.sel],h=heroOf(u),pw=BASE(h).power,P=POWERS[pw];if(!powOk(u,h)&&sd.mode!==pw)return;
  const glow=BASE(h).glow;
  if(pw==='overclock')return act(async()=>{payPow(u,h);await A.ring(ctrU(u),glow,2.2,{inward:true,count:2});u.buffDice+=1;u.buffAcc=(u.buffAcc||0)+2;fxU(u,'OVERCLOCK!','good');log('hero',`${h.name} overclocks: +1 die and +2 accuracy on the next attack.`)});
  if(pw==='drone')return act(async()=>{payPow(u,h);const hm=sd.hench.filter(m=>cheb(m,u)<=3);await Promise.all(hm.map(m=>A.shot(ctrU(u),ctrU(m),glow)));
    hm.forEach(m=>{m.hp-=2;m.hurtAt=Date.now();fxP(m.x,m.y,m.hp<=0?'K.O.!':'ZAP!','hit')});sd.hench=sd.hench.filter(m=>m.hp>0);if(!hm.length)fxU(u,'NO TARGETS','miss');log('hero',`${h.name}'s drone zaps ${hm.length} henchm${hm.length===1?'an':'en'}.`)});
  if(pw==='emp'){if(dV(u,sd.v)>3){fxU(u,'TOO FAR','miss');render();return}
    return act(async()=>{payPow(u,h);await A.ring(ctrV(),glow,3,{count:2});sd.v.hex=true;fxV('EMP!','good');log('hero',`${h.name}'s EMP scrambles ${VILLAINS[sd.vkey].name}: −4 evasion this round.`)})}
  if(pw==='regen')return act(async()=>{payPow(u,h);await A.heal(ctrU(u),COL.heal);const n=Math.max(1,potOf(h));h.hp=Math.min(stat(h,'maxHp'),h.hp+n);fxU(u,`+${n} HP`,'good');log('hero',`${h.name} regenerates ${n} health.`)});
  if(pw==='berserk')return act(async()=>{payPow(u,h);await A.ring(ctrU(u),glow,2.4,{inward:true,count:2});u.buffDice+=1;u.buffStr+=4;fxU(u,'RAAARGH!','good');log('hero',`${h.name} goes berserk: +1 die and +4 Strength on the next attack.`)});
  if(pw==='leap')return act(async()=>{payPow(u,h);await A.smoke(ctrU(u),5);u.boost=(u.boost||0)+2;u.boostJump=true;fxU(u,'BOUND!','good');log('hero',`${h.name} gathers for a leap: +2 to the next move, and it is a jump.`);if(!u.moved)sd.thenMode="move"});
  if(pw==='aegis')return act(async()=>{payPow(u,h);const al=live().filter(o=>o!==u&&cheb(o,u)<=3).sort((a,b)=>(heroOf(a).hp/stat(heroOf(a),'maxHp'))-(heroOf(b).hp/stat(heroOf(b),'maxHp')))[0];
    u.absorb=Math.max(u.absorb||0,3);await A.shield(ctrU(u),COL.magic,true);if(al){al.absorb=Math.max(al.absorb||0,3);await A.shield(ctrU(al),COL.magic,true);fxU(al,'AEGIS!','good')}fxU(u,'AEGIS!','good');log('hero',`${h.name} raises an aegis${al?` over themselves and ${heroOf(al).name}`:''}: the next 3 damage is absorbed.`)});
  if(pw==='drain'){if(dV(u,sd.v)>4){fxU(u,'TOO FAR','miss');render();return}
    return act(async()=>{u.acted=true;payPow(u,h);const w0=sd.woundsBy[h.id]||0;await heroAttack(u,'v',0,0,'bolt');const w=(sd.woundsBy[h.id]||0)-w0;
      if(w&&!u.ko){h.hp=Math.min(stat(h,'maxHp'),h.hp+w);await A.heal(ctrU(u),COL.magic);fxU(u,`+${w} HP`,'good');log('hero',`${h.name} drains ${w} health.`)}})}
  if(pw==='serene')return act(async()=>{payPow(u,h);await A.ring(ctrU(u),COL.cyan,5,{count:2});live().forEach(o=>{const t=heroOf(o);t.comp=Math.min(stat(t,'maxComp'),t.comp+2)});fxU(u,'BREATHE…','say');log('hero',`${h.name} steadies the team: +2 composure each.`)});
  if(pw==='brace')return act(async()=>{u.guard=true;payPow(u,h);await A.shield(ctrU(u),COL.yel,true);fxU(u,'BRACE!','good');log('hero',`${h.name} braces to protect nearby allies.`)});
  if(pw==='blur')return act(async()=>{await A.sparkle(ctrU(u),BASE(h).glow);u.buffEva=(u.buffEva||0)+2;u.freeEvac=true;payPow(u,h);fxU(u,'ZOOM!','good');log('hero',`${h.name} blurs: +2 evasion this round.`)});
  if(pw==='mark')return act(async()=>{sd.v.marked=true;u.markUsed=true;payPow(u,h);await A.reticle(ctrV(),BASE(h).glow);fxV('MARKED!','good');log('hero',`${h.name} marks ${VILLAINS[sd.vkey].name}: +1 die on every attack against it from a side or the rear this round.`)});
  if(pw==='omen')return act(async()=>{payPow(u,h);await A.sigil(ctrV(),BASE(h).glow,2);sd.v.foresee=true;if(sd.v.deck.length)markSeen(sd.vkey,sd.v.deck[0].id);live().forEach(o=>{const t=heroOf(o);t.comp=Math.min(stat(t,'maxComp'),t.comp+1)});fxU(u,'I FORESEE…','say');log('hero',`${h.name} reads the omens.`)});
  if(pw==='quake')return act(async()=>{payPow(u,h);A.lunge('h'+u.hid,ctrU(u));await A.ring(ctrU(u),BASE(h).glow,3.2,{count:2});
    const hm=sd.hench.filter(m=>cheb(m,u)<=1),qd=Math.max(1,potOf(h)),qh=Math.max(1,Math.ceil(qd/2));hm.forEach(m=>{m.hp-=qh;m.hurtAt=Date.now();fxP(m.x,m.y,m.hp<=0?'K.O.!':'THOOM!','hit')});sd.hench=sd.hench.filter(m=>m.hp>0);
    const keep=sd.vi;for(let i=0;i<sd.vl.length;i++){if(sd.vl[i].v.down||dV(u,sd.vl[i].v)>1)continue;focusV(i);if(VILLAINS[sd.vkey].rooted){fxV('BOLTED DOWN!','miss');log('hero',`${VILLAINS[sd.vkey].short} is bolted to the floor and can't be shoved.`);continue}const vz=VSIZE[sd.v.shape]||1;if(vz>qd){fxV('UNMOVED!','miss');log('hero',`${VILLAINS[sd.vkey].short} is size ${vz}, too big to shove at Innate rank ${qd}.`);continue}await vMove(()=>vAway(u,1,{strict:true}));fxV('SHOVED!','hit')}focusV(keep);
    log('hero',`${h.name} quakes the ground${hm.length?`, flattening ${hm.length} henchm${hm.length===1?'an':'en'}`:''}.`)});
  if(pw==='curse'){if(dV(u,sd.v)>4){fxU(u,'TOO FAR','miss');render();return}
    return act(async()=>{payPow(u,h);await A.bolt(ctrU(u),ctrV(),BASE(h).glow,true);await A.sigil(ctrV(),BASE(h).glow,2.6);sd.v.cursed=true;fxV('CURSED!','good');log('hero',`${h.name} curses ${VILLAINS[sd.vkey].name}: its attacks deal 2 less damage this round (never below 1).`)})}
  sd.mode=sd.mode===pw?null:pw;render()}
function payAb(u,k){const g=GEAR[k];u.abRd=true;if(!g.cons&&g.type!=='innate')(u.abUsed=u.abUsed||[]).push(k);if(g.cons){const p=pouchOf(heroOf(u)),i=p.indexOf(k);if(i>=0)p.splice(i,1);return}if(g.type==='innate'){if(u.innUsed)u.capUsed=true;u.innUsed=(u.innUsed||0)+1}else u.res[g.type]-=g.ab.c}
function useAb(k){const sd=S.sd,u=sd.units[sd.sel],h=u&&heroOf(u),g=GEAR[k],a=g&&g.ab;if(!u||!a||!abOk(u,h,k))return;
  if(a.mode){const m='ab'+a.mode;sd.mode=sd.mode===m&&sd.abKey===k?null:m;sd.abKey=k;render();return}
  return act(async()=>{payAb(u,k);log('hero',`${h.name} uses ${a.n} (${abCost(g)}).`);await abApply(u,h,g,u)})}
/* resolves an ability's effects; tu is the chosen ally for mode 'ally' (otherwise the user) */
async function abApply(u,h,g,tu){const sd=S.sd,a=g.ab,f=pairFx(h,g),P=potOf(h),v=x=>abV(x,P),col=COL[g.type],th=heroOf(tu);
  if(f.evaNext){const n=v(f.evaNext);await A.shield(ctrU(tu),COL.cyan,true);tu.evaNext=(tu.evaNext||0)+n;fxU(tu,'WHOOSH!','good');log('hero',`Wind wraps ${th.name}: +${n} evasion against the next attack.`)}
  if(f.ward){await A.shield(ctrU(tu),COL.magic,true);tu.ward=true;fxU(tu,'WARD!','good')}
  if(f.heal){const n=v(f.heal);await A.heal(ctrU(tu),COL.heal);th.hp=Math.min(stat(th,'maxHp'),th.hp+n);fxU(tu,`+${n} HP`,'good');log('hero',`${th.name} regains ${n} health.`)}
  if(f.comp){const n=v(f.comp);await A.heal(ctrU(u),COL.cyan);h.comp=Math.min(stat(h,'maxComp'),h.comp+n);fxU(u,'FOCUS!','good')}
  if(f.absorb){const n=v(f.absorb);tu.absorb=Math.max(tu.absorb||0,n);await A.shield(ctrU(tu),col,true);fxU(tu,'SHELL!','good');log('hero',`${th.name} gains a shield that absorbs ${n} damage.`)}
  if(f.dr){const n=v(f.dr);u.dr=(u.dr||0)+n;await A.shield(ctrU(u),col);fxU(u,'GUARD!','good');log('hero',`${h.name} takes ${n} less damage per hit this round.`)}
  if(f.drAll){const n=v(f.drAll);await A.ring(ctrU(u),col,2.4,{count:2});live().filter(o=>cheb(o,u)<=1).forEach(o=>{o.dr=(o.dr||0)+n;fxU(o,'BRACED!','good')})}
  if(f.eva){u.buffEva=(u.buffEva||0)+v(f.eva);fxU(u,'DODGE!','good')}
  if(f.anchor)u.anchor=true;
  if(f.breach){const adj=[];for(const n of nbrs(u)){const k=n.x+','+n.y;if(sd.walls.some(w=>w.k===k)||sd.obs.includes(k))adj.push(k)}
    await Promise.all(adj.map(k=>{const[x,y]=k.split(',').map(Number);return A.smoke(HC(x,y),4)}));sd.walls=sd.walls.filter(w=>!adj.includes(w.k));sd.obs=sd.obs.filter(k=>!adj.includes(k));fxU(u,adj.length?'KRUNCH!':'THUNK.','hit')}
  if(f.shove){const keep=sd.vi;for(let i=0;i<sd.vl.length;i++){if(sd.vl[i].v.down||dV(u,sd.vl[i].v)>1)continue;focusV(i);if(VILLAINS[sd.vkey].rooted){fxV('BOLTED DOWN!','miss');log('hero',`${VILLAINS[sd.vkey].short} is bolted to the floor and can't be shoved.`);continue}const vz=VSIZE[sd.v.shape]||1;if(vz>P){fxV('UNMOVED!','miss');log('hero',`${VILLAINS[sd.vkey].short} is size ${vz}, too big to shove at Innate rank ${P}.`);continue}await vMove(()=>vAway(u,1,{strict:true}));fxV('SHOVED!','hit');log('hero',`${h.name} shoves ${VILLAINS[sd.vkey].short} back.`)}focusV(keep)}
  if(f.dice||f.str||f.acc||f.back){const d=f.dice?v(f.dice):0,st=f.str?v(f.str):0,ac=f.acc?v(f.acc):0,bk=f.back?v(f.back):0;u.buffDice+=d;u.buffStr+=st;u.buffAcc=(u.buffAcc||0)+ac;u.buffBack=(u.buffBack||0)+bk;
    if(!f.move&&a.mode!=='tele'){await A.ring(ctrU(u),col,2.2,{inward:true,count:2});fxU(u,pick(['VRRRM!','RAAAH!','POWER UP!']),'good')}
    log('hero',`${h.name}'s next attack: ${[d&&`+${d} ${d===1?'die':'dice'}`,ac&&`${ac<0?'−'+(-ac):'+'+ac} accuracy`,st&&`+${st} Strength`,bk&&`+${bk} more on a melee attack from a side or the rear`].filter(Boolean).join(', ')}.`)}
  if(f.reap)u.buffReap=(u.buffReap||0)+v(f.reap);
  if(f.rally){const n=v(f.rally);await A.ring(ctrU(u),COL.cyan,5,{count:2});live().filter(o=>cheb(o,u)<=2).forEach(o=>{const t=heroOf(o);t.comp=Math.min(stat(t,'maxComp'),t.comp+n);fxU(o,'STEADY!','good')})}
  if(f.gain){u.res.magic=Math.min(arcMax(h),(u.res.magic||0)+v(f.gain));await A.sparkle(ctrU(u),COL.magic);fxU(u,'+ARCANA','good')}if(f.gainP){u.res.tech=Math.min(pwrMax(h),(u.res.tech||0)+v(f.gainP));await A.sparkle(ctrU(u),COL.tech);fxU(u,'+POWER','good')}
  if(f.callout){sd.v.callout=(sd.v.callout||0)+v(f.callout);await A.reticle(ctrV(),col);fxV('CALLED OUT!','good')}
  if(f.mark){sd.v.marked=true;u.markUsed=true;await A.reticle(ctrV(),col);fxV('TARGETED!','good')}
  if(f.hex||f.curse){await A.sigil(ctrV(),col,3);if(f.hex)sd.v.hex=Math.max(hexA(sd.v.hex),f.hexAmt||4);if(f.curse)sd.v.cursed=true;fxV(f.hex&&f.curse?'WITHERED!':f.hex?'HEXED!':'CURSED!','good')}
  if(f.face){faceTo(u);render();fxV('LOOK AT ME!','say');log('hero',`${VILLAINS[sd.vkey].short} turns to face ${h.name}.`)}
  if(f.foresee){await A.sigil(ctrV(),col,2);sd.v.foresee=true;if(sd.v.deck.length)markSeen(sd.vkey,sd.v.deck[0].id);fxU(u,'I SEE…','say')}
  if(f.eclipse){const ci=sd.vl.findIndex(o=>o.v.charge&&!o.v.down);if(ci>=0){focusV(ci);await A.sigil(ctrV(),col,3);sd.v.charge=null;fxV('ECLIPSED!','good');log('hero',`${h.name} snuffs out the charge.`)}}
  if(f.shock){const[r,d]=f.shock,hm=sd.hench.filter(m=>cheb(m,u)<=r);termHit(q=>cheb(q,u)<=r,a.n);await A.ring(ctrU(u),col,r*2+1.4,{count:2});
    hm.forEach(m=>{m.hp-=d;m.hurtAt=Date.now();fxP(m.x,m.y,m.hp<=0?'K.O.!':'ZZAP!','hit')});sd.hench=sd.hench.filter(m=>m.hp>0);log('hero',hm.length?`${a.n} hits ${hm.length} henchm${hm.length===1?'an':'en'}.`:`${a.n} hits nobody.`)}
  if(f.stasis){const zs=live().filter(o=>cheb(o,u)<=1);await A.ring(ctrU(u),col,3.4,{count:3});zs.forEach(o=>{o.stasis=true;fxU(o,'FROZEN IN TIME','good')});log('hero',`${h.name} stops time: ${zs.map(o=>heroOf(o).name).join(', ')} can't be hurt until ${h.name}'s next turn.`)}
  if(f.skip){sd.v.skip=true;await A.sigil(ctrV(),col,3);fxV('TIME STOPS!','good');log('hero',`${VILLAINS[sd.vkey].short} will lose its next turn.`)}
  if(f.tear){await A.beam(ctrV(),col);for(let i=0;i<f.tear&&!sd.result&&!sd.v.down;i++)await woundAnim(`${h.name}: ${a.n}.`)}
  if(f.boost){const n=v(f.boost);u.boost=(u.boost||0)+n;if(f.jump)u.boostJump=true;await A.smoke(ctrU(u),5);fxU(u,'WHOOSH!','good');log('hero',`${h.name}: +${n} to the next move${f.jump?', and it is a jump':''}.`);if(!u.moved)sd.thenMode='move'}
  if(f.move){u.moved=false;if(JUMP_AB.includes(g.ab.id))u.jump=true;await A.smoke(ctrU(u),5);fxU(u,'WHOOSH!','good');sd.thenMode='move'}
  if(f.again){u.acted=false;await A.ring(ctrU(u),col,3,{count:2});fxU(u,'UNLEASHED!','good')}
  if(f.blind){await A.sigil(ctrV(),col,2.6);sd.v.blind=true;fxV('BLINDED!','good');log('hero',`${VILLAINS[sd.vkey].short} is blinded: −4 accuracy this round.`)}
  if(f.vsplash)await splashV(v(f.vsplash));
  if(f.reflect){u.reflect=1;await A.shield(ctrU(u),col);fxU(u,'BRACED!','good');log('hero',`${h.name} is ready to turn the next villain hit back on it.`)}
  if(f.riposte){u.ripo=true;await A.shield(ctrU(u),col);fxU(u,'EN GARDE!','good');log('hero',`${h.name} is ready to strike back at the next miss.`)}
  if(f.excise){sd.v.excise=v(f.excise);await A.reticle(ctrV(),col);fxV('FLAW FOUND!','good');log('hero',`${h.name} finds the flaw: the next page torn from ${VILLAINS[sd.vkey].short} this round is one you choose from its next ${sd.v.excise}.`)}
  if(f.scramble){const vv=sd.v;if(!vv.deck.length&&vv.discard.length){vv.deck=vv.discard;vv.discard=[]}vv.deck=shuffle(vv.deck);vv.foresee=false;vv.warn=null;await A.ring(ctrV(),col,3,{count:2});fxV('SCRAMBLED!','good');log('hero',`${VILLAINS[sd.vkey].short}'s playbook is shuffled.`);vWarn()}
  if(f.scry)await scry(v(f.scry),col,u);
  if(f.bury)await bury(col,u);
  if(f.hpCost){const n=Math.min(v(f.hpCost),h.hp-1);if(n>0){h.hp-=n;fxU(u,`−${n} HP`,'vhit');log('hero',`${h.name} pays ${n} health for it.`)}}
  render()}
/* a paired weapon's ability adds its pair bonus */
function pairFx(h,g){const f=g.ab.fx||{},p=pairOf(h)===g.ab.id&&GEAR[g.ab.id].pair.fx;if(!p)return f;const o={...f};
  for(const k in p){const x=o[k];o[k]=x==null?p[k]:Array.isArray(x)?[x[0]+p[k],...x.slice(1)]:x+p[k]}return o}
/* deck tricks: look at the next pages, then choose which comes first (Scry) or send the next one to the bottom (Bury) */
async function scry(n,col,u){const sd=S.sd,v=sd.v,k=sd.vkey;if(!v.deck.length&&v.discard.length){v.deck=shuffle(v.discard);v.discard=[];log('sys','The playbook is reshuffled.')}
  const top=v.deck.slice(0,n);if(!top.length)return;top.forEach(c=>markSeen(k,c.id));await A.sigil(ctrV(),col,2);
  const i=top.length>1?await choose(`Scry · ${VILLAINS[k].short}`,'Pick the page the villain plays next. The others stay in order behind it.',top.map(c=>({l:`${c.sig?'★ ':''}${c.n}`,s:c.txt}))):0;
  const c=top[i];v.deck.splice(v.deck.indexOf(c),1);v.deck.unshift(c);v.foresee=true;v.warn=null;vWarn();fxU(u,'I SEE…','say');log('hero',`Scry: ${VILLAINS[k].short} will play ${c.n} next.`)}
async function bury(col,u){const sd=S.sd,v=sd.v,k=sd.vkey;if(!v.deck.length&&v.discard.length){v.deck=shuffle(v.discard);v.discard=[];log('sys','The playbook is reshuffled.')}
  const c=v.deck[0];if(!c)return;markSeen(k,c.id);await A.reticle(ctrV(),col);
  const i=v.deck.length>1?await choose(`Spot the Tell · ${VILLAINS[k].short}`,`Next page: ${c.n}. ${c.txt}`,[{l:'Bury it',s:'Move it to the bottom of the playbook.'},{l:'Leave it on top',s:'Keep it foreseen, so you know what is coming.'}]):1;
  if(i===0){v.deck.push(v.deck.shift());v.foresee=false;v.warn=null;vWarn();fxV('BURIED!','good');log('hero',`${c.n} is buried at the bottom of ${VILLAINS[k].short}'s playbook.`)}
  else{v.foresee=true;fxU(u,'GOT IT.','say');log('hero',`${c.n} stays on top, foreseen.`)}}
/* a small pick-one overlay; AUTO_CHOOSE answers it in tests */
let AUTO_CHOOSE=null;
function choose(title,sub,opts){if(FAST||AUTO_CHOOSE!=null)return Promise.resolve(Math.min(opts.length-1,AUTO_CHOOSE||0));
  return new Promise(res=>{const L=document.createElement('div');L.id='choose';L.setAttribute('role','dialog');L.setAttribute('aria-label',title);
    L.innerHTML=`<div class="chz"><div class="eyebrow">${esc(title)}</div><div class="small">${esc(sub)}</div>${opts.map((o,i)=>`<button class="btn opt" type="button" data-i="${i}"><span>${esc(o.l)}</span>${o.s?`<small>${esc(o.s)}</small>`:''}</button>`).join('')}</div>`;
    document.body.appendChild(L);setTimeout(()=>{const b=L.querySelector('[data-i]');if(b)b.focus({preventScroll:true})},50);
    L.addEventListener('click',e=>{const b=e.target.closest('[data-i]');e.stopPropagation();if(!b)return;L.remove();res(+b.dataset.i)})})}
/* Riposte: a free 1-die attack when the villain misses, once per round; it keeps the hero's charged bonuses for their own attack */
async function riposte(u){const sd=S.sd,h=heroOf(u);if(sd.result||u.ko||u.ripUsed||!(u.ripo||gearHas(h,'riposte'))||sd.v.down||dV(u,sd.v)>stat(h,'range'))return;
  u.ripUsed=true;const keep=[u.buffDice,u.buffStr,u.buffAcc,u.buffBack,u.buffReap],call=sd.v.callout;u.buffDice=u.buffStr=u.buffAcc=u.buffBack=u.buffReap=0;sd.v.callout=0;u.noRel=true;
  fxU(u,'RIPOSTE!','good');log('hero',`Riposte! ${h.name} strikes back.`);await heroAttack(u,'v',0,1);
  u.noRel=false;[u.buffDice,u.buffStr,u.buffAcc,u.buffBack,u.buffReap]=keep;sd.v.callout=call}
function painGain(u,h){for(const g of new Set(Object.values(h.gear))){const t=GEAR[g]&&GEAR[g].pain;if(!t||!u.res)continue;const mx=resMax(h,t);
  if((u.res[t]||0)<mx){u.res[t]=(u.res[t]||0)+1;log('hero',`${GEAR[g].name}: ${h.name} turns the pain into 1 ${TRACKS[t].res}.`)}}}
function lifeline(u,h){if(pwrMax(h)&&u.res.tech<pwrMax(h)){u.res.tech++;fxU(u,'+POWER','good');log('hero',`Lifeline: ${h.name} regains 1 Power.`)}
  else if(arcMax(h)&&u.res.magic<arcMax(h)){u.res.magic++;fxU(u,'+ARCANA','good');log('hero',`Lifeline: ${h.name} regains 1 Arcana.`)}
  else if(h.hp<stat(h,'maxHp')){h.hp=Math.min(stat(h,'maxHp'),h.hp+2);fxU(u,'+2 HP','good');log('hero',`Lifeline: ${h.name} regains 2 health.`)}}
async function splashV(n){const sd=S.sd,hm=sd.hench.filter(m=>dV(m,sd.v)<=2);if(!hm.length)return;
  await Promise.all(hm.map(m=>A.bolt(ctrV(),ctrU(m),COL.magic,true)));
  hm.forEach(m=>{m.hp-=n;m.hurtAt=Date.now();fxP(m.x,m.y,m.hp<=0?'K.O.!':'ZAP!','hit')});sd.hench=sd.hench.filter(m=>m.hp>0);
  log('hero',`The blast catches ${hm.length} henchm${hm.length===1?'an':'en'}.`);render()}
function onCell(x,y){const sd=S.sd;if(sd.busy||sd.result)return;const k=x+','+y;const vAt=sd.vl.findIndex(o=>!o.v.down&&inV(o.v,x,y));
  const u=sd.sel!=null?sd.units[sd.sel]:null,h=u&&heroOf(u);
  const unitIdx=sd.units.findIndex(o=>!o.ko&&o.x===x&&o.y===y);
  if(u){
    if(sd.mode==='move'&&!u.moved){const r=reachH(u,stat(h,'move')+(u.boost||0));if(k in r){const lp=reachH.leaps.has(k),sw=sd.civs.find(c=>c.x===x&&c.y===y);if(sw){sw.x=u.x;sw.y=u.y}u.x=x;u.y=y;u.moved=true;u.jump=false;u.boost=0;u.boostJump=false;sd.mode=null;if(lp){fxU(u,'HUP!','good');log('hero',`${h.name} jumps clear over a beam.`)}beamStep(u);civFollow(u);render();return}}
    if(sd.mode==='attack'||sd.mode==='arc'){const rng=stat(h,'range');let t=null;
      if(vAt>=0&&dV(u,sd.vl[vAt].v)<=rng&&!shotVB(u,sd.vl[vAt].v)){focusV(vAt);t='v';sd.aim={x,y}}else{const m=sd.hench.find(m=>m.x===x&&m.y===y&&cheb(m,u)<=rng&&!shotBlocked(u,m));if(m)t=m}
      if(t){const arc=sd.mode==='arc';return act(async()=>{u.acted=true;if(arc)payPow(u,h);await heroAttack(u,t,arc?1:0);if(arc&&!sd.result)await splash(t)})}}
    if(sd.mode==='patch'&&unitIdx>=0&&cheb(sd.units[unitIdx],u)<=3){const tu=sd.units[unitIdx],t=heroOf(tu);
      return act(async()=>{payPow(u,h);if(tu!==u)await A.shot(ctrU(u),ctrU(tu),COL.heal);await A.heal(ctrU(tu),COL.heal);
        t.hp=Math.min(stat(t,'maxHp'),t.hp+3);t.comp=Math.min(stat(t,'maxComp'),t.comp+2);fxU(tu,'+3 HP','good');log('hero',`${h.name} patches up ${t.name}.`)})}
    if(sd.mode==='barricade'&&cheb({x,y},u)<=2&&!blocked(x,y))return act(async()=>{payPow(u,h);await A.smoke(HC(x,y),4);sd.walls.push({k,ttl:3});fxU(u,'CLANK!','good');log('hero',`${h.name} bolts up a barricade.`)});
    if(sd.mode==='abally'&&unitIdx>=0){const key=sd.abKey,g=GEAR[key],a=g.ab,tu=sd.units[unitIdx];
      if(cheb(tu,u)<=abV(a.r,potOf(h)))return act(async()=>{payAb(u,key);log('hero',`${h.name} uses ${a.n} on ${tu===u?'themselves':heroOf(tu).name} (${abCost(g)}).`);if(tu!==u)await A.shot(ctrU(u),ctrU(tu),COL[g.type]);await abApply(u,h,g,tu)})}
    if(sd.mode==='abtele'&&cheb({x,y},u)<=abV(GEAR[sd.abKey].ab.r,potOf(h))&&!blocked(x,y)){const key=sd.abKey,g=GEAR[key],a=g.ab;
      return act(async()=>{payAb(u,key);await A.sparkle(ctrU(u),COL[g.type]);u.x=x;u.y=y;noFlip.add('h'+u.hid);beamStep(u);render();await A.sparkle(ctrU(u),COL[g.type]);fxU(u,a.leap?'KA-THOOM!':'BAMF!','good');log('hero',`${h.name} uses ${a.n} (${abCost(g)}).`);await abApply(u,h,g,u)})}
    if(sd.mode==='abcover'&&cheb({x,y},u)<=abV(GEAR[sd.abKey].ab.r,potOf(h))&&!blocked(x,y)){const key=sd.abKey,g=GEAR[key],a=g.ab;
      return act(async()=>{payAb(u,key);await A.smoke(HC(x,y),4);sd.walls.push({k,ttl:2});fxU(u,'CLANK!','good');log('hero',`${h.name} uses ${a.n} (${abCost(g)}): a wall goes up.`)})}
    if(sd.mode==='abstrike'&&vAt>=0){const key=sd.abKey,g=GEAR[key],a=g.ab;
      if((!a.rng||dV(u,sd.vl[vAt].v)<=a.rng)&&!shotVB(u,sd.vl[vAt].v)){focusV(vAt);sd.aim={x,y};
        return act(async()=>{payAb(u,key);u.acted=true;log('hero',`${h.name} unleashes ${a.n} (${abCost(g)})!`);if(a.str)u.buffStr+=a.str;await heroAttack(u,'v',a.plus||0,a.dice||0,'beam');if(a.splash&&!sd.result)await splashV(a.splash)})}}}
  if(vAt>=0&&sd.vl.length>1&&unitIdx<0){focusV(vAt);render();return}
  if(unitIdx>=0){sd.sel=unitIdx;const o=sd.units[unitIdx];sd.mode=o.moved?null:'move'}
  else{sd.sel=null;sd.mode=null}
  render()}

(function(){const pts=[];for(let i=0;i<28;i++){const a=Math.PI*2*i/28,r=i%2?32+((i*7)%5):50-((i*3)%4);pts.push(`${(50+r*Math.cos(a)).toFixed(1)}% ${(50+r*Math.sin(a)).toFixed(1)}%`)}
  const st=document.createElement('style');st.textContent=`.fx:not(.k-say) .b::before,.fx:not(.k-say) .b::after,#brk .burst::before,#brk .burst::after{clip-path:polygon(${pts.join(',')})}`;document.head.appendChild(st)})();
