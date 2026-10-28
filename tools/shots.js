// Screenshot HQ, roster, villains, investigation, fight splash and battle at six sizes, and print whether the
// fight actions (Move, End round) and the whole board are on screen. Usage: node tools/shots.js [outDir] [gameDir]
// Needs playwright (require('playwright')). Output files: <out>/<size>-<screen>.png
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const out=path.resolve(process.argv[2]||'shots'),dir=path.resolve(process.argv[3]||path.join(__dirname,'..'));
const sizes=[['s360',360,780],['p412',412,915],['land',844,390],['tab',820,1180],['lap',1366,768],['wide',1920,1080]];
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
fs.mkdirSync(out,{recursive:true});
const srv=http.createServer((q,r)=>{const f=path.join(dir,q.url==='/'?'index.html':q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){r.statusCode=404;r.end()}else{r.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');r.end(d)}})});
(async()=>{await new Promise(r=>srv.listen(0,r));const url='http://localhost:'+srv.address().port+'/';const b=await chromium.launch();
for(const [n,w,h] of sizes){const p=await b.newPage({viewport:{width:w,height:h},colorScheme:'dark'});
 p.on('pageerror',e=>console.log(n,'ERROR',e.message));
 await p.goto(url);await p.waitForTimeout(500);
 const snap=async k=>{await p.waitForTimeout(350);await p.screenshot({path:path.join(out,`${n}-${k}.png`)})};
 await p.evaluate(()=>{localStorage.clear();newCampaign({tutDone:true});S.tut=null;S.tutDone=true;S.guide=null;S.tipsOff=true;['volt','lynx','wisp','brick'].forEach(c=>{try{recruitQuick(c)}catch(e){}});S.phase='hq';S.view='hq';render()});await snap('hq');
 for(const v of ['roster','villains']){await p.evaluate(v=>{S.view=v;render()},v);await snap(v)}
 await p.evaluate(()=>{S.view='mission';startInv(S.villains[0].key);S.inv.intro=false;render()});await snap('inv');
 await p.evaluate(()=>{startShowdown();render()});await snap('splash');
 await p.evaluate(()=>{S.sd.intro=false;S.sd.sel=0;S.sd.mode='move';render()});await snap('battle');
 const m=await p.evaluate(()=>{const r=s=>{const e=document.querySelector(s);return e&&e.getBoundingClientRect()},b=r('.board'),mv=r('[data-a="mode:move"]'),en=r('[data-a="endround"]'),H=innerHeight;
  return{boardInView:!!b&&b.top>=0&&b.bottom<=H,moveInView:!!mv&&mv.bottom<=H&&mv.top>=0,endInView:!!en&&en.bottom<=H&&en.top>=0,boardW:b&&Math.round(b.width),hScroll:document.documentElement.scrollWidth>innerWidth}});
 console.log(n,w+'x'+h,JSON.stringify(m));await p.close()}
await b.close();srv.close()})();
