#!/usr/bin/env node
// Validate the published battle art pack on the real game engine, not a mockup.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const assets=['arena-concrete.svg','arena-steel.svg','arena-wood.svg','arena-circuit.svg','arena-move.svg','arena-danger.svg'];
 for(const file of assets){
   const src=fs.readFileSync('assets/arena/'+file,'utf8');
   assert(src.startsWith('<svg '),file+' must be an actual illustration');
   assert(src.includes('viewBox='),file+' must scale with the screen');
 }
 const html=fs.readFileSync('index.html','utf8');
 assert(html.includes('href="css/battle-art.css"'),'live game references art stylesheet');
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [390,1440]){
    const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    const errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto('file://'+process.cwd()+'/index.html');
    await p.evaluate(()=>{
      newCampaign();S.tut=null;S.tutDone=true;S.guide=null;
      S.heroes=['volt','bulwark','wisp','lynx'].map(x=>newHero(x));
      S.party=S.heroes.map(h=>h.id);
      S.villains=[makeVillain('cantor',2)];S.pool=[];
      S.inv={v:'cantor',clues:3};startShowdown();S.sd.intro=false;S.sd.sel=0;render();
    });
    await p.locator('.board.lair.L-cantor .cell').first().waitFor();
    assert(await p.locator('.board .tok.hst').count()>0,'hero standees retained');
    assert(await p.locator('.board .vtok').count()>0,'villain standee retained');
    assert(await p.locator('.board .cell[data-cell]').count()>25,'hex buttons retained');
    const state=await p.evaluate(()=>{
      const cell=document.querySelector('.board .cell:not(.wall):not(.pit):not(.haz):not(.obs):not(.tele):not(.blast):not(.blast2):not(.firing)');
      return {floor:getComputedStyle(cell,'::before').backgroundImage,
       rim:getComputedStyle(document.querySelector('.boardwrap'),'::after').pointerEvents,
       tile:getComputedStyle(cell,'::before').pointerEvents,
       overflow:document.documentElement.scrollWidth-innerWidth};
    });
    assert(state.floor.includes('arena-wood.svg'),'Cantor arena renders illustrated wood');
    assert.equal(state.rim,'none','bezel cannot block clicks');
    assert.equal(state.tile,'none','floor cannot block clicks');
    assert(state.overflow<=24,'battle should fit '+width+'px viewport');
    assert.deepEqual(errors,[],'no browser script errors');
    for(const file of assets){
      const decoded=await p.evaluate(async src=>{const i=new Image();i.src=src;await i.decode();return i.naturalWidth>0;},'assets/arena/'+file);
      assert(decoded,file+' loads in browser');
    }
    await p.close();
  }
  console.log('PASS: production tactical art pack loads all six images, renders in the real battle, and preserves hexes/controls at 390 and 1440px.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
