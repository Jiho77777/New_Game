const $ = (s) => document.querySelector(s);

function setStep(step){
  const selected=["1","2","3","4"].includes(String(step))?String(step):"1";
  document.querySelectorAll("[data-step-tab]").forEach(tab=>{
    const active=tab.dataset.stepTab===selected;
    tab.classList.toggle("active",active);
    tab.setAttribute("aria-selected",active?"true":"false");
    tab.setAttribute("tabindex",active?"0":"-1");
  });
  document.querySelectorAll("[data-step-panel]").forEach(panel=>{
    const active=panel.dataset.stepPanel===selected;
    panel.hidden=!active;
    panel.setAttribute("aria-hidden",active?"false":"true");
  });
  const grid=document.querySelector(".studio-grid");
  if(grid){
    grid.classList.remove("step-one","step-two","step-three","step-four");
    grid.classList.add("step-"+({1:"one",2:"two",3:"three",4:"four"}[selected]));
  }
  document.documentElement.dataset.activeStep=selected;
  if(selected==="4")refreshGlobalGames();
}
document.addEventListener("click",event=>{
  const tab=event.target.closest("[data-step-tab]");
  if(!tab)return;
  event.preventDefault();
  setStep(tab.dataset.stepTab);
});
document.addEventListener("keydown",event=>{
  const tab=event.target.closest("[data-step-tab]");
  if(!tab || !["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
  event.preventDefault();
  const current=Number(tab.dataset.stepTab);
  const next=event.key==="Home"?1:event.key==="End"?4:
    event.key==="ArrowRight"?Math.min(4,current+1):Math.max(1,current-1);
  setStep(next);
  document.querySelector('[data-step-tab="'+next+'"]')?.focus();
});
setStep("1");
const defaultLevel=()=>[];
const state = {levelObjects:defaultLevel(),platformLevels:[[],[],[],[],[]],editorLevel:0,playLevelIndex:0,selectedObject:-1,activeTool:"select",type:"click", title: "별을 모아라!", intro: "제한 시간 안에 반짝이는 별을 많이 모아 봐!", seconds: 30, color: "#7867f5", button: "게임 시작!", question: "대한민국의 수도는 어디일까?", answer: "서울", clickPower:1, upgradeName:"강화 클릭", upgradeCost:25, upgradeGain:1, autoCost:50, autoRate:1, currentClickPower:1, currentUpgradeCost:25, currentAutoCost:50, passiveRate:0, customUpgrades:[], score: 0, time: 30, running: false, timer: null, waiting: false, startedAt: 0 };
const controls = { title: $("#gameTitle"), intro: $("#gameIntro"), seconds: $("#gameTime"), color: $("#themeColor"), button: $("#buttonText"), question: $("#quizQuestion"), answer: $("#quizAnswer") };
let toastTimer;
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2200);}
function saveDraft(){try{localStorage.setItem("game-studio-draft-v2",JSON.stringify({clickPower:state.clickPower,upgradeName:state.upgradeName,upgradeCost:state.upgradeCost,upgradeGain:state.upgradeGain,autoCost:state.autoCost,autoRate:state.autoRate,customUpgrades:state.customUpgrades,type:state.type,title:state.title,intro:state.intro,seconds:state.seconds,color:state.color,button:state.button,question:state.question,answer:state.answer,levelObjects:state.levelObjects,platformLevels:state.platformLevels,editorLevel:state.editorLevel}));$("#saveStatus").textContent="자동 저장됨";}catch(e){$("#saveStatus").textContent="자동 저장 사용 불가";}}
function updatePreview(){ $("#previewTitle").textContent=state.title||"나만의 게임";$("#previewIntro").textContent=state.intro;$("#previewTime").textContent=state.seconds;$("#previewScore").textContent="0";$("#playButton").textContent=state.button||"게임 시작!";$("#gameScreen").style.setProperty("--accent",state.color);$("#quizPreviewQuestion").textContent=state.question;$("#quizSettings").hidden=state.type!=="quiz";$("#quizArea").hidden=state.type!=="quiz";$("#clickerSettings").hidden=state.type!=="click";$("#clickerShop").hidden=state.type!=="click";$("#playArea").hidden=state.type==="quiz"||state.type==="platformer";$("#platformerSettings").hidden=state.type!=="platformer";$("#platformerArea").hidden=state.type!=="platformer";if(state.type==="platformer")drawMapEditor();if(state.type==="click")renderCustomShop();$("#colorName").textContent=state.color.toUpperCase();$("#playMessage").innerHTML="준비됐어?<br>시작 버튼을 눌러 봐!";$("#gameTarget").textContent=state.type==="reaction"?"⚡":"✦";$("#gameTarget").style.background=state.color;$("#gameTarget").hidden=true;$("#playButton").hidden=false;$("#playButton").disabled=false;$("#quizInput").value="";state.score=0;state.time=state.seconds;$("#previewScore").textContent="0";$("#previewTime").textContent=state.time;if(state.type==="click")updateClickerShop();saveDraft();}
function stopGame(){clearInterval(state.timer);state.running=false;state.waiting=false;$("#gameTarget").hidden=true;$("#playButton").disabled=false;$("#playButton").textContent="다시 시작";$("#playMessage").textContent="게임 종료! 점수: "+state.score;$("#playMessage").hidden=false;}
function finishGame(message){clearInterval(state.timer);if(state.platformFrame)cancelAnimationFrame(state.platformFrame);state.running=false;state.waiting=false;$("#gameTarget").hidden=true;$("#quizArea").hidden=true;$("#playArea").hidden=state.type==="platformer";$("#platformerArea").hidden=state.type!=="platformer";$("#playButton").hidden=false;$("#playButton").disabled=false;$("#playButton").textContent="다시 시작";$("#playMessage").textContent=message;$("#playMessage").hidden=false;if(state.type==="platformer"){state.levelObjects=state.platformLevels[state.editorLevel]||[];drawMapEditor();}}
function tick(){if(state.type==="click"&&state.running&&state.passiveRate>0){state.score+=state.passiveRate;$("#previewScore").textContent=state.score;}state.time--;$("#previewTime").textContent=state.time;if(state.type==="click")updateClickerShop();if(state.time<=0)finishGame("시간 종료! 최종 점수: "+state.score);}
function startClickGame(){state.customUpgrades=(state.customUpgrades||[]).map(x=>({...x,cost:Number(x.cost)||1}));state.score=0;state.time=state.seconds;state.currentClickPower=Number(state.clickPower)||1;state.currentUpgradeCost=Number(state.upgradeCost)||25;state.currentAutoCost=Number(state.autoCost)||50;state.passiveRate=0;state.running=true;$("#previewScore").textContent="0";$("#previewTime").textContent=state.time;$("#playMessage").hidden=true;$("#playButton").disabled=true;$("#playButton").textContent="플레이 중…";const target=$("#gameTarget");target.hidden=false;moveTarget();updateClickerShop();state.timer=setInterval(tick,1000);}
function updateClickerShop(){const up=$("#buyUpgrade"),au=$("#buyAuto");if(!up||!au)return;up.textContent=(state.upgradeName||"업그레이드")+" · "+state.currentUpgradeCost+" 코인";au.textContent="자동 수익 · "+state.currentAutoCost+" 코인";up.disabled=!state.running||state.score<state.currentUpgradeCost;au.disabled=!state.running||state.score<state.currentAutoCost;$("#clickerStats").textContent="클릭 보상: "+state.currentClickPower+" · 자동 수익: "+state.passiveRate+"/초";renderCustomShop();}
$("#buyUpgrade").addEventListener("click",()=>{if(!state.running||state.score<state.currentUpgradeCost)return;state.score-=state.currentUpgradeCost;state.currentClickPower+=Number(state.upgradeGain)||1;state.currentUpgradeCost=Math.ceil(state.currentUpgradeCost*1.6);$("#previewScore").textContent=state.score;updateClickerShop();});
$("#buyAuto").addEventListener("click",()=>{if(!state.running||state.score<state.currentAutoCost)return;state.score-=state.currentAutoCost;state.passiveRate+=Number(state.autoRate)||1;state.currentAutoCost=Math.ceil(state.currentAutoCost*1.7);$("#previewScore").textContent=state.score;updateClickerShop();});
function moveTarget(){const area=$("#playArea"),target=$("#gameTarget");const maxX=Math.max(0,area.clientWidth-target.offsetWidth-12),maxY=Math.max(0,area.clientHeight-target.offsetHeight-12);target.style.left=(6+Math.random()*maxX)+"px";target.style.top=(6+Math.random()*maxY)+"px";}
function startReaction(){state.score=0;state.time=state.seconds;state.running=true;state.waiting=true;state.startedAt=0;$("#previewScore").textContent="0";$("#previewTime").textContent=state.time;$("#playMessage").hidden=false;$("#playMessage").textContent="초록색으로 바뀔 때까지 기다려!";$("#playButton").disabled=true;$("#playButton").textContent="기다리는 중…";const target=$("#gameTarget");target.hidden=false;target.style.left="50%";target.style.top="50%";target.style.transform="translate(-50%,-50%)";target.style.background="#a4a5b4";target.textContent="…";const delay=1200+Math.random()*2200;state.timer=setInterval(tick,1000);setTimeout(()=>{if(!state.running||!state.waiting)return;state.waiting=false;state.startedAt=performance.now();target.style.background="#25c98a";target.textContent="GO!";},delay);}
function startQuiz(){state.score=0;state.time=state.seconds;state.running=true;$("#previewScore").textContent="0";$("#previewTime").textContent=state.time;$("#playButton").hidden=true;$("#quizArea").hidden=false;$("#quizInput").focus();state.timer=setInterval(tick,1000);}


const platformKeys={left:false,right:false,jump:false};let pp,cam=0,lastFrame=0;const WORLD_W=1560,MAP_SCALE=640/WORLD_W,MAP_OFFSET_Y=(300-300*MAP_SCALE)/2;
function renderPlatformLevelTabs(){
 document.querySelectorAll("[data-level]").forEach(b=>b.classList.toggle("active",Number(b.dataset.level)===state.editorLevel));
}
function switchPlatformLevel(index){
 if(!Number.isInteger(index)||index<0||index>4)return;
 state.platformLevels[state.editorLevel]=state.levelObjects;
 state.editorLevel=index;
 state.levelObjects=state.platformLevels[index]||[];
 state.selectedObject=-1;
 renderPlatformLevelTabs();
 chooseObject(-1);
 drawMapEditor();
 saveDraft();
}
document.querySelectorAll("[data-level]").forEach(b=>b.addEventListener("click",()=>switchPlatformLevel(Number(b.dataset.level))));
function drawMapEditor(){const c=$("#mapEditorCanvas");if(!c)return;const g=c.getContext("2d");g.clearRect(0,0,640,300);g.fillStyle="#dff3ff";g.fillRect(0,0,640,300);g.save();g.translate(0,MAP_OFFSET_Y);g.scale(MAP_SCALE,MAP_SCALE);g.strokeStyle="#ffffff88";for(let x=0;x<=WORLD_W;x+=40){g.beginPath();g.moveTo(x,0);g.lineTo(x,300);g.stroke()}for(let y=0;y<=300;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(WORLD_W,y);g.stroke()}state.levelObjects.forEach((o,i)=>{if(o.type==="block"||o.type==="longBlock"){g.fillStyle=o.color;g.fillRect(o.x,o.y,o.w,o.h);g.fillStyle="#ffffff55";g.fillRect(o.x,o.y,o.w,3)}else if(o.type==="laser"){g.fillStyle="#ff405b";g.fillRect(o.x,o.y,o.w,Math.max(7,o.h))}else if(o.type==="coin"){g.fillStyle=o.color;g.beginPath();g.arc(o.x+o.w/2,o.y+o.h/2,Math.max(5,o.w/2),0,7);g.fill()}else if(o.type==="spike"){g.fillStyle=o.color;g.beginPath();g.moveTo(o.x,o.y+o.h);g.lineTo(o.x+o.w/2,o.y);g.lineTo(o.x+o.w,o.y+o.h);g.fill()}if(i===state.selectedObject){g.strokeStyle="#172033";g.lineWidth=4;g.strokeRect(o.x-3,o.y-3,o.w+6,o.h+6)}});g.fillStyle="#ff6b82";g.fillRect(1500,220,5,52);g.restore();}
function chooseObject(i){state.selectedObject=i;const o=state.levelObjects[i];$("#selectedObjectLabel").textContent=o?({block:"정사각형 블록",longBlock:"긴 블록",laser:"레이저",coin:"코인",spike:"가시"}[o.type]+" 선택됨"):"선택된 오브젝트 없음";$("#objectWidth").value=o?Math.round(o.w):180;$("#objectHeight").value=o?Math.round(o.h):22;$("#objectColor").value=o&&o.color?o.color:"#7867f5";$("#deleteObject").disabled=!o;drawMapEditor();}
document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>{state.activeTool=b.dataset.tool;document.querySelectorAll("[data-tool]").forEach(x=>x.classList.toggle("selected",x===b));}));
let mapDrag=null;$("#mapEditorCanvas").addEventListener("pointerdown",e=>{const c=e.currentTarget,r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*640/MAP_SCALE,y=((e.clientY-r.top)/r.height*300-MAP_OFFSET_Y)/MAP_SCALE;if(y<0||y>300)return;if(state.activeTool!=="select"){const t=state.activeTool,d={block:[40,40,"#7867f5"],longBlock:[120,40,"#7867f5"],laser:[120,10,"#ff405b"],coin:[20,20,"#ffc83d"],spike:[44,28,"#55556b"]}[t];const px=(t==="block"||t==="longBlock")?Math.floor(x/40)*40:Math.max(0,x-d[0]/2);const py=(t==="block"||t==="longBlock")?Math.floor(y/40)*40:Math.max(0,Math.min(300-d[1],y-d[1]/2));state.levelObjects.push({type:t,x:Math.max(0,Math.min(WORLD_W-d[0],px)),y:Math.max(0,Math.min(300-d[1],py)),w:d[0],h:d[1],color:d[2]});chooseObject(state.levelObjects.length-1);saveDraft();return;}let hit=-1;for(let i=state.levelObjects.length-1;i>=0;i--){const o=state.levelObjects[i];if(x>=o.x-10&&x<=o.x+o.w+10&&y>=o.y-10&&y<=o.y+o.h+10){hit=i;break;}}chooseObject(hit);if(hit>=0){mapDrag={i:hit,x,y,ox:state.levelObjects[hit].x,oy:state.levelObjects[hit].y};c.setPointerCapture(e.pointerId);}});
$("#mapEditorCanvas").addEventListener("pointermove",e=>{if(!mapDrag)return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*640/MAP_SCALE,y=((e.clientY-r.top)/r.height*300-MAP_OFFSET_Y)/MAP_SCALE,o=state.levelObjects[mapDrag.i];o.x=Math.max(0,Math.min(WORLD_W-o.w,mapDrag.ox+x-mapDrag.x));o.y=Math.max(0,Math.min(300-o.h,mapDrag.oy+y-mapDrag.y));drawMapEditor();});
$("#mapEditorCanvas").addEventListener("pointerup",()=>{if(mapDrag){mapDrag=null;saveDraft();}});$("#mapEditorCanvas").addEventListener("pointercancel",()=>{mapDrag=null;});
function updateSelectedObject(){const o=state.levelObjects[state.selectedObject];if(!o)return;o.w=Math.max(10,Math.min(600,Number($("#objectWidth").value)||10));o.h=Math.max(8,Math.min(120,Number($("#objectHeight").value)||8));o.color=$("#objectColor").value;drawMapEditor();saveDraft();}
["objectWidth","objectHeight","objectColor"].forEach(id=>$("#"+id).addEventListener("input",updateSelectedObject));
$("#deleteObject").addEventListener("click",()=>{if(state.selectedObject<0)return;state.levelObjects.splice(state.selectedObject,1);chooseObject(-1);saveDraft();});
$("#resetMap").addEventListener("click",()=>{state.levelObjects=[];state.platformLevels[state.editorLevel]=state.levelObjects;chooseObject(-1);saveDraft();toast("레벨 "+(state.editorLevel+1)+" 캔버스를 비웠어!");});
function drawPlatform(){const c=$("#platformerCanvas"),g=c.getContext("2d");g.fillStyle="#c9edff";g.fillRect(0,0,640,300);g.save();g.translate(-cam,0);state.levelObjects.forEach(o=>{if(o.type==="block"||o.type==="longBlock"){g.fillStyle=o.color;g.fillRect(o.x,o.y,o.w,o.h);g.fillStyle="#fff8";g.fillRect(o.x,o.y,o.w,4)}else if(o.type==="laser"){g.fillStyle="#ff405b";g.fillRect(o.x,o.y,o.w,Math.max(7,o.h));g.fillStyle="#fff";g.fillRect(o.x,o.y+2,o.w,2)}else if(o.type==="coin"){g.fillStyle=o.color;g.beginPath();g.arc(o.x+o.w/2,o.y+o.h/2,Math.max(5,o.w/2),0,7);g.fill()}else if(o.type==="spike"){g.fillStyle=o.color;g.beginPath();g.moveTo(o.x,o.y+o.h);g.lineTo(o.x+o.w/2,o.y);g.lineTo(o.x+o.w,o.y+o.h);g.fill()}});g.fillStyle="#fff";g.fillRect(1500,220,5,52);g.fillStyle="#ff6b82";g.fillRect(1505,221,36,20);g.fillStyle="#27304a";g.fillRect(pp.x,pp.y,pp.w,pp.h);g.fillStyle="#fff";g.fillRect(pp.x+15,pp.y+7,5,5);g.restore();}
function startPlatformer(){state.platformLevels[state.editorLevel]=state.levelObjects;state.playLevelIndex=0;state.levelObjects=state.platformLevels[0]||[];state.score=0;state.time=state.seconds;state.running=true;$("#previewScore").textContent="0";$("#previewTime").textContent=state.time;$("#playArea").hidden=true;$("#platformerArea").hidden=false;$("#playButton").disabled=true;$("#playButton").textContent="플레이 중…";Object.keys(platformKeys).forEach(k=>platformKeys[k]=false);state.levelObjects.forEach(o=>{if(o.type==="coin")o.got=false;});pp={x:25,y:220,w:24,h:34,vy:0,ground:false};cam=0;lastFrame=performance.now();drawPlatform();state.timer=setInterval(tick,1000);state.platformFrame=requestAnimationFrame(platformFrame);}
function platformFrame(t){if(!state.running)return;const dt=Math.min((t-lastFrame)/16.67||1,2);lastFrame=t;const old=pp.y+pp.h;pp.x=Math.max(0,Math.min(1540,pp.x+((platformKeys.right?3.4:0)-(platformKeys.left?3.4:0))*dt));if(platformKeys.jump&&pp.ground){pp.vy=-10.5;pp.ground=false;}pp.vy=Math.min(12,pp.vy+.48*dt);pp.y+=pp.vy*dt;pp.ground=false;state.levelObjects.forEach(o=>{if(o.type==="block"&&pp.x+pp.w>o.x&&pp.x<o.x+o.w&&old<=o.y+7&&pp.y+pp.h>=o.y&&pp.vy>=0){pp.y=o.y-pp.h;pp.vy=0;pp.ground=true;}});let hazard=false;state.levelObjects.forEach(o=>{if((o.type==="laser"||o.type==="spike")&&pp.x+pp.w>o.x&&pp.x<o.x+o.w&&pp.y+pp.h>o.y&&pp.y<o.y+o.h)hazard=true;if(o.type==="coin"&&!o.got&&Math.abs(pp.x+12-(o.x+o.w/2))<20&&Math.abs(pp.y+17-(o.y+o.h/2))<23){o.got=true;state.score+=10;$("#previewScore").textContent=state.score;}});if(hazard){finishGame("장애물에 닿았어! 점수: "+state.score);return;}if(pp.y>330){finishGame("떨어졌어! 점수: "+state.score);return;}if(pp.x>1495){if(state.playLevelIndex<4){state.playLevelIndex++;state.levelObjects=state.platformLevels[state.playLevelIndex]||[];state.levelObjects.forEach(o=>{if(o.type==="coin")o.got=false;});pp={x:25,y:220,w:24,h:34,vy:0,ground:false};cam=0;toast("레벨 "+(state.playLevelIndex+1)+" 시작!");drawPlatform();state.platformFrame=requestAnimationFrame(platformFrame);return;}finishGame("전체 5레벨 클리어! 최종 점수: "+state.score);return;}cam=Math.max(0,Math.min(900,pp.x-210));drawPlatform();state.platformFrame=requestAnimationFrame(platformFrame);}
document.querySelectorAll("[data-move]").forEach(b=>{const k=b.dataset.move;b.addEventListener("pointerdown",e=>{e.preventDefault();platformKeys[k]=true;});["pointerup","pointercancel","pointerleave"].forEach(ev=>b.addEventListener(ev,()=>platformKeys[k]=false));});
window.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")platformKeys.left=true;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")platformKeys.right=true;if(e.key===" "||e.key==="ArrowUp"||e.key.toLowerCase()==="w")platformKeys.jump=true;});
window.addEventListener("keyup",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")platformKeys.left=false;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")platformKeys.right=false;if(e.key===" "||e.key==="ArrowUp"||e.key.toLowerCase()==="w")platformKeys.jump=false;});
function startGame(){clearInterval(state.timer);state.running=false;state.waiting=false;$("#playButton").hidden=false;$("#quizArea").hidden=true;$("#playMessage").hidden=false;$("#gameTarget").style.transform="none";if(state.type==="click")startClickGame();else if(state.type==="reaction")startReaction();else if(state.type==="platformer")startPlatformer();else startQuiz();}
Object.entries(controls).forEach(([key,el])=>{el.addEventListener("input",()=>{state[key]=key==="seconds"?Number(el.value):el.value;updatePreview();});el.addEventListener("change",()=>{state[key]=key==="seconds"?Number(el.value):el.value;updatePreview();});});
document.querySelectorAll(".template-card").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".template-card").forEach(b=>b.classList.remove("selected"));btn.classList.add("selected");state.type=btn.dataset.type;updatePreview();}));
$("#playButton").addEventListener("click",startGame);
$("#gameTarget").addEventListener("click",()=>{if(!state.running)return;if(state.type==="click"){state.score+=state.currentClickPower;$("#previewScore").textContent=state.score;updateClickerShop();moveTarget();}else if(state.type==="reaction"){if(state.waiting){finishGame("앗! 너무 빨랐어. 다시 도전!");return;}const ms=Math.round(performance.now()-state.startedAt);state.score=ms;$("#previewScore").textContent=ms+"ms";finishGame("반응속도 "+ms+"ms! 다시 도전해 봐.");}});
$("#quizSubmit").addEventListener("click",()=>{if(!state.running)return;const value=$("#quizInput").value.trim();if(value&&value.toLocaleLowerCase()===state.answer.trim().toLocaleLowerCase()){state.score+=10;$("#previewScore").textContent=state.score;finishGame("정답! +10점 획득!");}else toast("아쉽지만 정답이 아니야. 다시 생각해 봐!");});
$("#quizInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("#quizSubmit").click();});
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function makeExport(){state.platformLevels[state.editorLevel]=state.levelObjects;const platformMaps=JSON.stringify(state.platformLevels);const customUpgrades=JSON.stringify(state.customUpgrades||[]);const clickPower=Number(state.clickPower)||1,upgradeName=escapeHtml(state.upgradeName||"강화 클릭"),upgradeCost=Number(state.upgradeCost)||25,upgradeGain=Number(state.upgradeGain)||1,autoCost=Number(state.autoCost)||50,autoRate=Number(state.autoRate)||1;const title=escapeHtml(state.title||"나만의 게임"),intro=escapeHtml(state.intro),color=state.color,seconds=state.seconds,button=escapeHtml(state.button||"게임 시작!"),type=state.type,question=escapeHtml(state.question),answer=escapeHtml(state.answer);let gameScript="";
if(type==="platformer")gameScript=`const pc=$("platformerCanvas"),cx=pc.getContext("2d"),keys={left:false,right:false,jump:false};let px=25,py=220,vy=0,on=false,camera=0,coins=0,frame=0,level=0,maps=${platformMaps},objects=maps[0]||[];area.style.display="none";function paint(){cx.fillStyle="#c9edff";cx.fillRect(0,0,640,300);cx.save();cx.translate(-camera,0);objects.forEach(o=>{if(o.type==="block"){cx.fillStyle=o.color;cx.fillRect(o.x,o.y,o.w,o.h)}else if(o.type==="laser"){cx.fillStyle="#ff405b";cx.fillRect(o.x,o.y,o.w,Math.max(7,o.h))}else if(o.type==="coin"){cx.fillStyle=o.color;cx.beginPath();cx.arc(o.x+o.w/2,o.y+o.h/2,Math.max(5,o.w/2),0,7);cx.fill()}else if(o.type==="spike"){cx.fillStyle=o.color;cx.beginPath();cx.moveTo(o.x,o.y+o.h);cx.lineTo(o.x+o.w/2,o.y);cx.lineTo(o.x+o.w,o.y+o.h);cx.fill()}});cx.fillStyle="#ff6b82";cx.fillRect(1505,221,36,20);cx.fillStyle="#27304a";cx.fillRect(px,py,24,34);cx.fillStyle="#fff";cx.fillRect(px+15,py+7,5,5);cx.restore()}function loop(){if(!frame)return;const old=py+34;px=Math.max(0,Math.min(1540,px+(keys.right?3.4:0)-(keys.left?3.4:0)));if(keys.jump&&on){vy=-10.5;on=false}vy=Math.min(12,vy+.48);py+=vy;on=false;objects.forEach(o=>{if(o.type==="block"&&px+24>o.x&&px<o.x+o.w&&old<=o.y+7&&py+34>=o.y&&vy>=0){py=o.y-34;vy=0;on=true}});let hazard=false;objects.forEach(o=>{if((o.type==="laser"||o.type==="spike")&&px+24>o.x&&px<o.x+o.w&&py+34>o.y&&py<o.y+o.h)hazard=true;if(o.type==="coin"&&!o.got&&Math.abs(px+12-(o.x+o.w/2))<20&&Math.abs(py+17-(o.y+o.h/2))<23){o.got=true;coins+=10;scoreEl.textContent=coins}});if(hazard||py>330){cancelAnimationFrame(frame);frame=0;msg.hidden=false;msg.textContent="장애물에 닿았어! 점수: "+coins;btn.disabled=false;btn.textContent="다시 시작";return}if(px>1495){level++;if(level>=5){cancelAnimationFrame(frame);frame=0;msg.hidden=false;msg.textContent="전체 5레벨 클리어! 점수: "+coins;btn.disabled=false;btn.textContent="다시 시작";return}objects=maps[level]||[];objects.forEach(o=>o.got=false);px=25;py=220;vy=0;camera=0;msg.textContent="레벨 "+(level+1)+" 시작!";}camera=Math.max(0,Math.min(900,px-210));paint();frame=requestAnimationFrame(loop)}function bind(id,k){const el=$(id);el.addEventListener("pointerdown",e=>{e.preventDefault();keys[k]=true});["pointerup","pointercancel","pointerleave"].forEach(ev=>el.addEventListener(ev,()=>keys[k]=false))}bind("left","left");bind("right","right");bind("jump","jump");window.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=true;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=true;if(e.key===" "||e.key==="ArrowUp")keys.jump=true});window.addEventListener("keyup",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=false;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=false;if(e.key===" "||e.key==="ArrowUp")keys.jump=false});function start(){if(frame)cancelAnimationFrame(frame);level=0;objects=maps[0]||[];px=25;py=220;vy=0;coins=0;camera=0;objects.forEach(o=>o.got=false);scoreEl.textContent="0";msg.hidden=true;btn.disabled=true;btn.textContent="플레이 중…";frame=requestAnimationFrame(loop)}btn.onclick=start;`
else if(type==="click")gameScript=`let score=0,left=${seconds},timer,power=${clickPower},upCost=${upgradeCost},autoCostNow=${autoCost},passive=0,extras=${customUpgrades};function shop(){ $("buyUpgrade").textContent=${JSON.stringify(upgradeName)}+" · "+upCost+" 코인";$("buyAuto").textContent="자동 수익 · "+autoCostNow+" 코인";$("buyUpgrade").disabled=score<upCost;$("buyAuto").disabled=score<autoCostNow;$("clickerStats").textContent="클릭 보상: "+power+" · 자동 수익: "+passive+"/초";scoreEl.textContent=score}function move(){const x=Math.random()*Math.max(0,area.clientWidth-54),y=Math.random()*Math.max(0,area.clientHeight-54);target.style.left=x+'px';target.style.top=y+'px'}function start(){clearInterval(timer);score=0;left=${seconds};power=${clickPower};upCost=${upgradeCost};autoCostNow=${autoCost};passive=0;extras=${customUpgrades};scoreEl.textContent=score;timeEl.textContent=left;msg.hidden=true;target.hidden=false;btn.disabled=true;move();shop();timer=setInterval(()=>{score+=passive;shop();timeEl.textContent=--left;if(left<=0){clearInterval(timer);target.hidden=true;msg.hidden=false;msg.textContent='끝! 점수: '+score;btn.disabled=false;btn.textContent='다시 시작'}},1000)}target.onclick=()=>{score+=power;shop();move()};$("buyUpgrade").onclick=()=>{if(score<upCost)return;score-=upCost;power+=${upgradeGain};upCost=Math.ceil(upCost*1.6);shop()};$("buyAuto").onclick=()=>{if(score<autoCostNow)return;score-=autoCostNow;passive+=${autoRate};autoCostNow=Math.ceil(autoCostNow*1.7);shop()};btn.onclick=start;`;
else if(type==="quiz")gameScript=`let left=${seconds},timer;function start(){clearInterval(timer);left=${seconds};timeEl.textContent=left;scoreEl.textContent='0';msg.hidden=true;quiz.hidden=false;btn.hidden=true;answerInput.value='';timer=setInterval(()=>{timeEl.textContent=--left;if(left<=0){clearInterval(timer);msg.hidden=false;msg.textContent='시간 종료!';quiz.hidden=true;btn.hidden=false;btn.textContent='다시 시작'}},1000)}btn.onclick=start;submit.onclick=()=>{if(answerInput.value.trim().toLowerCase()===${JSON.stringify(answer.toLowerCase())}){clearInterval(timer);scoreEl.textContent='10';msg.hidden=false;msg.textContent='정답! +10점';quiz.hidden=true;btn.hidden=false;btn.textContent='다시 시작'}else alert('다시 생각해 봐!')};`;
else gameScript=`let left=${seconds},timer,waiting=false,started=0;function start(){clearInterval(timer);left=${seconds};timeEl.textContent=left;msg.textContent='초록색이 될 때까지 기다려!';msg.hidden=false;target.hidden=false;target.textContent='…';target.style.background='#aaa';btn.disabled=true;waiting=true;timer=setInterval(()=>{timeEl.textContent=--left;if(left<=0){clearInterval(timer);target.hidden=true;msg.textContent='시간 종료!';btn.disabled=false;btn.textContent='다시 시작'}},1000);setTimeout(()=>{if(!waiting)return;waiting=false;started=performance.now();target.textContent='GO!';target.style.background='#25c98a'},1500+Math.random()*1800)}target.onclick=()=>{if(waiting){waiting=false;clearInterval(timer);msg.textContent='너무 빨랐어!';target.hidden=true;btn.disabled=false;btn.textContent='다시 시작'}else if(started){clearInterval(timer);const ms=Math.round(performance.now()-started);scoreEl.textContent=ms+'ms';msg.textContent='반응속도 '+ms+'ms!';target.hidden=true;btn.disabled=false;btn.textContent='다시 시작'}};btn.onclick=start;`;
const extra=type==="click"?`<div class="shop" id="clickerShop" style="margin:14px 0;padding:12px;background:#f5f3ff;border-radius:12px;text-align:left"><b>업그레이드 상점</b><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px"><button id="buyUpgrade">${upgradeName} · ${upgradeCost} 코인</button><button id="buyAuto">자동 수익 · ${autoCost} 코인</button></div><div id="customShopButtons" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px"></div><p id="clickerStats">클릭 보상: ${clickPower} · 자동 수익: 0/초</p></div>`:type==="platformer"?'<div style="margin-top:12px"><canvas id="platformerCanvas" width="640" height="300" style="width:100%;background:#c9edff;border-radius:12px;touch-action:none"></canvas><div style="display:flex;justify-content:center;gap:10px"><button id="left">◀</button><button id="right">▶</button><button id="jump">점프</button></div></div>':type==="quiz"?'<div id="quiz" hidden><p>'+question+'</p><input id="answerInput" placeholder="정답 입력"><button id="submit">정답 확인</button></div>':'';
const htmlDoc='<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:20px;background:#f4f3fb;font-family:system-ui,sans-serif;color:#24243b}.card{width:min(100%,480px);padding:28px;border-radius:24px;background:white;text-align:center;box-shadow:0 12px 40px #2222}h1{font-size:32px;margin:12px 0}p{color:#777} .stats{display:flex;justify-content:center;gap:14px;margin:20px}.stats div{background:#f4f4fa;padding:12px 24px;border-radius:12px}.area{height:190px;position:relative;background:#f8f7ff;border:1px dashed '+color+'66;border-radius:16px;overflow:hidden;display:grid;place-items:center}#target{position:absolute;width:54px;height:54px;border:0;border-radius:50%;background:'+color+';color:white;font-size:24px;touch-action:manipulation}button{border:0;border-radius:12px;background:'+color+';color:white;padding:14px 20px;font-weight:800;cursor:pointer;margin-top:14px}input{padding:12px;border:1px solid #ddd;border-radius:9px;width:100%;margin:8px 0}</style><main class="card"><small>MY GAME</small><h1>'+title+'</h1><p>'+intro+'</p><div class="stats"><div>점수<br><b id="scoreEl">0</b></div><div>남은 시간<br><b id="timeEl">'+seconds+'</b></div></div><div class="area" id="area"><p id="msg">시작 버튼을 눌러 봐!</p><button id="target" hidden>✦</button></div>'+extra+'<button id="btn">'+button+'</button></main><script>const $=id=>document.getElementById(id),area=$("area"),target=$("target"),msg=$("msg"),btn=$("btn"),scoreEl=$("scoreEl"),timeEl=$("timeEl");'+(type==="quiz"?'const quiz=$("quiz"),answerInput=$("answerInput"),submit=$("submit");':'')+gameScript+'<\/script></html>';
const blob=new Blob([htmlDoc],{type:"text/html;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="my-game.html";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast("내 게임 파일을 다운로드했어!");}
$("#exportTop").addEventListener("click",makeExport);$("#exportBottom").addEventListener("click",makeExport);
$("#clickPower").addEventListener("input",()=>{state.clickPower=Math.max(1,Number($("#clickPower").value)||1);saveDraft();});
$("#upgradeName").addEventListener("input",()=>{state.upgradeName=$("#upgradeName").value;saveDraft();});
$("#upgradeCost").addEventListener("input",()=>{state.upgradeCost=Math.max(1,Number($("#upgradeCost").value)||1);saveDraft();});
$("#upgradeGain").addEventListener("input",()=>{state.upgradeGain=Math.max(1,Number($("#upgradeGain").value)||1);saveDraft();});
$("#autoCost").addEventListener("input",()=>{state.autoCost=Math.max(1,Number($("#autoCost").value)||1);saveDraft();});
$("#autoRate").addEventListener("input",()=>{state.autoRate=Math.max(1,Number($("#autoRate").value)||1);saveDraft();});
function renderCustomShop(){
 const host=$("#customShopButtons");if(!host)return;host.innerHTML="";
 (state.customUpgrades||[]).forEach((item,index)=>{const b=document.createElement("button");b.type="button";b.textContent=(item.name||"업그레이드")+" · "+item.cost+" 코인";b.disabled=!state.running||state.score<Number(item.cost);
 b.addEventListener("click",()=>{if(!state.running||state.score<Number(item.cost))return;state.score-=Number(item.cost);if(item.effect==="auto")state.passiveRate+=Number(item.amount)||1;else state.currentClickPower+=Number(item.amount)||1;item.cost=Math.ceil(Number(item.cost)*1.6);$("#previewScore").textContent=state.score;updateClickerShop();});host.appendChild(b);});
}
function renderCustomUpgradeEditor(){
 const host=$("#customUpgradeEditor");if(!host)return;host.innerHTML="";
 (state.customUpgrades||[]).forEach((item,index)=>{const card=document.createElement("div");card.className="custom-upgrade-card";
 const name=document.createElement("input");name.maxLength=24;name.placeholder="업그레이드 이름";name.value=item.name||"";name.addEventListener("input",()=>{item.name=name.value;saveDraft();});
 const effect=document.createElement("select");effect.innerHTML='<option value="click">클릭 보상 증가</option><option value="auto">자동 수익 증가</option>';effect.value=item.effect||"click";effect.addEventListener("change",()=>{item.effect=effect.value;saveDraft();});
 const cost=document.createElement("input");cost.type="number";cost.min="1";cost.value=item.cost||25;cost.placeholder="가격";cost.addEventListener("input",()=>{item.cost=Math.max(1,Number(cost.value)||1);saveDraft();});
 const amount=document.createElement("input");amount.type="number";amount.min="1";amount.value=item.amount||1;amount.placeholder="증가량";amount.addEventListener("input",()=>{item.amount=Math.max(1,Number(amount.value)||1);saveDraft();});
 const remove=document.createElement("button");remove.type="button";remove.className="button button-remove";remove.textContent="삭제";remove.addEventListener("click",()=>{state.customUpgrades.splice(index,1);renderCustomUpgradeEditor();renderCustomShop();saveDraft();});
 card.append(name,effect,cost,amount,remove);host.appendChild(card);});
}
$("#addUpgrade").addEventListener("click",()=>{state.customUpgrades.push({name:"새 업그레이드",effect:"click",cost:100,amount:2});renderCustomUpgradeEditor();saveDraft();});

function restoreDraft(){try{const saved=JSON.parse(localStorage.getItem("game-studio-draft-v2")||"null");if(!saved)return;["clickPower","upgradeName","upgradeCost","upgradeGain","autoCost","autoRate"].forEach(k=>{if(saved[k]!==undefined){state[k]=saved[k];const el=$("#"+k);if(el)el.value=saved[k];}});Object.keys(controls).forEach(k=>{if(saved[k]!==undefined){controls[k].value=saved[k];state[k]=saved[k];}});if(Array.isArray(saved.platformLevels)&&saved.platformLevels.length){state.platformLevels=Array.from({length:5},(_,i)=>Array.isArray(saved.platformLevels[i])?saved.platformLevels[i]:[]);state.editorLevel=Math.max(0,Math.min(4,Number(saved.editorLevel)||0));}else if(Array.isArray(saved.levelObjects)){state.platformLevels=[saved.levelObjects,[],[],[],[]];state.editorLevel=0;}state.levelObjects=state.platformLevels[state.editorLevel]||[];if(Array.isArray(saved.customUpgrades)){state.customUpgrades=saved.customUpgrades;}if(saved.type){state.type=saved.type;document.querySelectorAll(".template-card").forEach(b=>b.classList.toggle("selected",b.dataset.type===saved.type));}}catch(e){}}
setStep("1");
restoreDraft();state.levelObjects=state.platformLevels[state.editorLevel]||[];renderPlatformLevelTabs();renderCustomUpgradeEditor();updatePreview();chooseObject(-1);


// AI builder integration point. The endpoint must be a secure server; never place an AI secret key in this file.
const AI_ENDPOINT = window.GAME_STUDIO_AI_ENDPOINT || "";
const aiPromptEl = $("#aiPrompt");
const aiStatusEl = $("#aiStatus");
document.querySelectorAll("[data-prompt]").forEach(button=>button.addEventListener("click",()=>{aiPromptEl.value=button.dataset.prompt;aiPromptEl.focus();}));
$("#aiBuildButton").addEventListener("click",async()=>{
  const prompt=aiPromptEl.value.trim();
  if(!prompt){toast("먼저 만들고 싶은 게임을 설명해 줘!");aiPromptEl.focus();return;}
  if(!AI_ENDPOINT){aiStatusEl.textContent="아직 AI 서버가 연결되지 않았어. 화면은 준비됐고, 안전한 AI 서버를 연결하면 실제 제작이 가능해.";toast("AI 서버 연결이 아직 필요해!");return;}
  const button=$("#aiBuildButton");button.disabled=true;button.textContent="AI가 게임을 설계하는 중…";aiStatusEl.textContent="요청을 보내고 있어…";
  try{
    const response=await fetch(AI_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt, currentGame:{type:state.type,title:state.title,intro:state.intro,seconds:state.seconds,color:state.color,levelObjects:state.levelObjects}})});
    if(!response.ok)throw new Error("AI 서버 응답 오류 ("+response.status+")");
    const result=await response.json();
    if(result.title){state.title=String(result.title).slice(0,28);controls.title.value=state.title;}
    if(result.intro){state.intro=String(result.intro).slice(0,70);controls.intro.value=state.intro;}
    if(["click","quiz","reaction","platformer"].includes(result.type)){state.type=result.type;document.querySelectorAll(".template-card").forEach(b=>b.classList.toggle("selected",b.dataset.type===state.type));}
    if(Array.isArray(result.levelObjects))state.levelObjects=result.levelObjects.slice(0,150);
    if(result.color&&/^#[0-9a-f]{6}$/i.test(result.color)){state.color=result.color;controls.color.value=state.color;}
    if(result.seconds){state.seconds=Math.max(10,Math.min(120,Number(result.seconds)||30));controls.seconds.value=String(state.seconds);}
    updatePreview();chooseObject(-1);aiStatusEl.textContent=result.message||"게임 초안이 만들어졌어! 미리보기 탭에서 확인해 봐.";setStep("1");toast("AI 게임 초안을 적용했어!");
  }catch(error){aiStatusEl.textContent="AI 제작에 실패했어. 서버 설정을 확인하고 다시 시도해 줘.";toast(error.message||"AI 연결 오류");}
  finally{button.disabled=false;button.innerHTML="<span>✦</span> AI로 만들기";}
});


// Firebase email/password authentication. Paste your Firebase Web App config below.
const FIREBASE_CONFIG = window.GAME_STUDIO_FIREBASE_CONFIG || {
  apiKey: "AIzaSyBYlHR-_bq4qS_G_rixNGQJTedad7R5JYg",
  authDomain: "game-studio-94426.firebaseapp.com",
  projectId: "game-studio-94426",
  appId: "1:510363209588:web:1779ae11241d8a86632621"
};
const authStatus = $("#authStatus");
const authSignedOut = $("#authSignedOut");
const authSignedIn = $("#authSignedIn");
let firebaseAuth = null;
let firebaseDb = null;
let currentAuthUser = null;
function authMessage(message){ if(authStatus) authStatus.textContent=message; }
function showAuthSession(user){
  authSignedOut.hidden=!!user;
  authSignedIn.hidden=!user;
  const headerLoginButton = $("#openLoginPanel");
  const headerStatus = $("#authHeaderStatus");
  const accountTitle = $("#accountPanel .panel-heading h2");
  if(user){
    $("#authUserEmail").textContent=user.displayName ? user.displayName+" ("+(user.email||"")+")" : (user.email||"이메일 계정");
    if(headerLoginButton) headerLoginButton.textContent="프로필";
    if(accountTitle) accountTitle.textContent="내 프로필";
    if(headerStatus){headerStatus.hidden=false;headerStatus.textContent="로그인되었습니다!";}
  }else{
    if(headerLoginButton) headerLoginButton.textContent="로그인";
    if(accountTitle) accountTitle.textContent="계정 로그인";
    if(headerStatus) headerStatus.hidden=true;
  }
}
const firebaseReady = !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.authDomain && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.appId);
if(!firebaseReady){
  authMessage("Firebase 설정이 아직 없어. Firebase 웹 앱의 설정값을 연결하면 이메일 회원가입과 로그인을 사용할 수 있어.");
}else if(!window.firebase?.initializeApp || !window.firebase?.auth || !window.firebase?.firestore){
  authMessage("Firebase 로그인 라이브러리를 불러오지 못했어. 인터넷 연결을 확인해 줘.");
}else{
  try{
    const app = window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(FIREBASE_CONFIG);
    firebaseAuth = app.auth();
    firebaseDb = app.firestore();
    firebaseAuth.onAuthStateChanged(user=>{
      const wasSignedOut=!currentAuthUser;
      currentAuthUser=user||null;
      showAuthSession(user);
      refreshSavedGames();
      refreshGlobalGames();
      authMessage(user ? "로그인되었습니다! "+(user.email||"") : "이메일로 회원가입하거나 로그인해 줘.");
      if(user && wasSignedOut) toast("로그인되었습니다!");
      // 로그인 성공 직후에는 로그인 화면을 닫고, 상단 프로필 버튼으로 들어오게 해.
      if(user && typeof activeHeaderTab !== "undefined" && activeHeaderTab === "login"){
        setHeaderTab(null,false);
      }
    },error=>authMessage("로그인 상태 확인 오류: "+error.message));
  }catch(error){authMessage("Firebase 설정을 확인해 줘: "+error.message);}
}
$("#authSignUp").addEventListener("click",async()=>{
  if(!firebaseAuth){authMessage("먼저 Firebase 웹 앱 설정을 연결해야 해.");return;}
  const email=$("#authEmail").value.trim(),password=$("#authPassword").value;
  if(!email||password.length<6){authMessage("이메일과 6자 이상의 비밀번호를 입력해 줘.");return;}
  try{
    await firebaseAuth.createUserWithEmailAndPassword(email,password);
    authMessage("회원가입과 로그인이 완료됐어!");
    toast("회원가입과 로그인이 완료됐어!");
  }catch(error){authMessage("회원가입 오류: "+(error.code||error.message));}
});
$("#authSignIn").addEventListener("click",async()=>{
  if(!firebaseAuth){authMessage("먼저 Firebase 웹 앱 설정을 연결해야 해.");return;}
  const email=$("#authEmail").value.trim(),password=$("#authPassword").value;
  if(!email||!password){authMessage("이메일과 비밀번호를 입력해 줘.");return;}
  try{
    await firebaseAuth.signInWithEmailAndPassword(email,password);
    authMessage("로그인되었습니다!");
    toast("로그인되었습니다!");
  }catch(error){authMessage("로그인 오류: "+(error.code||error.message));}
});
$("#authGoogle").addEventListener("click",async()=>{
  if(!firebaseAuth){authMessage("먼저 Firebase 웹 앱 설정을 연결해야 해.");return;}
  try{
    const provider = new window.firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({prompt:"select_account"});
    authMessage("Google 계정 선택 화면으로 이동할게...");
    await firebaseAuth.signInWithRedirect(provider);
  }catch(error){authMessage("Google 로그인 오류: "+(error.code||error.message));}
});
if(firebaseAuth){
  firebaseAuth.getRedirectResult().then(result=>{
    if(result && result.user) authMessage("Google 로그인이 완료됐어!");
  }).catch(error=>authMessage("Google 로그인 오류: "+(error.code||error.message)));
}
async function refreshSavedGames(){
 const status=$("#savedGamesStatus"),list=$("#savedGamesList");if(!status||!list)return;list.innerHTML="";
 if(!currentAuthUser){status.textContent="게임 저장과 목록은 로그인한 사용자만 이용할 수 있어.";return;}
 if(!firebaseDb){status.textContent="Firestore 데이터베이스 설정이 필요해.";return;}
 status.textContent="저장된 게임을 불러오는 중…";
 try{
  const snap=await firebaseDb.collection("users").doc(currentAuthUser.uid).collection("games").orderBy("updatedAt","desc").get();
  if(snap.empty){status.textContent="아직 저장된 게임이 없어. 위에서 첫 게임을 저장해 봐!";return;}
  status.textContent=snap.size+"개의 게임이 저장되어 있어.";
  snap.forEach(doc=>{
   const data=doc.data(),card=document.createElement("div");card.className="saved-game-card";
   const title=document.createElement("strong");title.textContent=data.name||data.game?.title||"이름 없는 게임";
   const meta=document.createElement("span");meta.textContent=(data.game?.type||"게임")+" · "+(data.isPublic?"공개":"비공개")+" · "+(data.updatedAt?.toDate?data.updatedAt.toDate().toLocaleDateString():"저장됨");
   const load=document.createElement("button");load.className="button button-primary";load.textContent="불러오기";load.onclick=()=>loadSavedGame(data.game);
   const publish=document.createElement("button");publish.className="button button-dark";publish.textContent=data.isPublic?"비공개로 변경":"공개하기";
   publish.onclick=async()=>{
    publish.disabled=true;publish.textContent="변경 중…";
    try{
     const ownerRef=firebaseDb.collection("users").doc(currentAuthUser.uid).collection("games").doc(doc.id);
     if(data.isPublic){
      await firebaseDb.collection("publicGames").doc(doc.id).delete();
      await ownerRef.update({isPublic:false,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()});
     }else{
      const publicData={ownerId:currentAuthUser.uid,ownerName:currentAuthUser.displayName||currentAuthUser.email||"Game Studio 사용자",sourceGameId:doc.id,name:data.name||data.game?.title||"이름 없는 게임",game:data.game,isPublic:true,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()};
      await firebaseDb.collection("publicGames").doc(doc.id).set(publicData);
      await ownerRef.update({isPublic:true,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()});
     }
     toast(data.isPublic?"비공개로 변경했어.":"글로벌 맵에 공개했어!");
     await refreshSavedGames();await refreshGlobalGames();
    }catch(e){status.textContent="공개 설정 변경 실패: "+e.message;publish.disabled=false;publish.textContent=data.isPublic?"비공개로 변경":"공개하기";}
   };
   const del=document.createElement("button");del.className="button button-remove";del.textContent="삭제";
   del.onclick=async()=>{if(!confirm("이 저장된 게임을 삭제할까?"))return;try{if(data.isPublic)await firebaseDb.collection("publicGames").doc(doc.id).delete();await firebaseDb.collection("users").doc(currentAuthUser.uid).collection("games").doc(doc.id).delete();await refreshSavedGames();await refreshGlobalGames();}catch(e){status.textContent="삭제 실패: "+e.message;}};
   card.append(title,meta,load,publish,del);list.appendChild(card);
  });
 }catch(e){status.textContent="저장 목록을 불러오지 못했어. Firestore 설정과 보안 규칙을 확인해 줘.";console.error(e);}
}
async function refreshGlobalGames(){
 const status=$("#globalGamesStatus"),list=$("#globalGamesList");if(!status||!list)return;list.innerHTML="";
 if(!currentAuthUser){status.textContent="글로벌 맵은 로그인한 사용자만 이용할 수 있어.";return;}
 if(!firebaseDb){status.textContent="Firestore 데이터베이스 설정이 필요해.";return;}
 status.textContent="공개된 게임을 불러오는 중…";
 try{
  // 복합 인덱스가 필요하지 않도록 공개 게임을 가져온 뒤 브라우저에서 정렬해.
  const snap=await firebaseDb.collection("publicGames").where("isPublic","==",true).get();
  const docs=snap.docs
   .filter(doc=>doc.data().isPublic&&doc.data().game)
   .sort((a,b)=>{
    const aTime=a.data().updatedAt?.toMillis?.()||0;
    const bTime=b.data().updatedAt?.toMillis?.()||0;
    return bTime-aTime;
   });
  if(!docs.length){status.textContent="아직 공개된 게임이 없어. 내 게임을 공개하면 여기에 표시돼!";return;}
  status.textContent=docs.length+"개의 공개 게임을 찾았어.";
  docs.forEach(doc=>{
   const data=doc.data(),card=document.createElement("div");card.className="saved-game-card global-game-card";
   const title=document.createElement("strong");title.textContent=data.name||data.game.title||"이름 없는 게임";
   const meta=document.createElement("span");meta.textContent=(data.game.type||"게임")+" · 제작자: "+(data.ownerName||"알 수 없음");
   const play=document.createElement("button");play.className="button button-primary";play.textContent="플레이";
   play.onclick=()=>{loadSavedGame(data.game);setStep("2");$("#playButton").click();toast("공개 게임을 플레이하고 있어! 원본은 변경되지 않아.");};
   card.append(title,meta,play);list.appendChild(card);
  });
 }catch(e){
  const detail=[e.code,e.message].filter(Boolean).join(" — ");
  status.textContent="글로벌 맵을 불러오지 못했어."+(detail?" 원인: "+detail:" 자세한 내용은 콘솔을 확인해 줘.");
  console.error("글로벌 맵 Firestore 오류:",e);
 }
}
$("#refreshGlobalGames")?.addEventListener("click",refreshGlobalGames);

function snapshotGame(){state.platformLevels[state.editorLevel]=state.levelObjects;return {platformLevels:state.platformLevels,editorLevel:state.editorLevel,type:state.type,title:state.title,intro:state.intro,seconds:state.seconds,color:state.color,button:state.button,question:state.question,answer:state.answer,levelObjects:state.levelObjects,clickPower:state.clickPower,upgradeName:state.upgradeName,upgradeCost:state.upgradeCost,upgradeGain:state.upgradeGain,autoCost:state.autoCost,autoRate:state.autoRate,customUpgrades:state.customUpgrades||[]};}
function loadSavedGame(game){if(!game)return;Object.keys(game).forEach(k=>{if(k in state)state[k]=game[k];});if(Array.isArray(game.platformLevels)&&game.platformLevels.length){state.platformLevels=Array.from({length:5},(_,i)=>Array.isArray(game.platformLevels[i])?game.platformLevels[i]:[]);state.editorLevel=Math.max(0,Math.min(4,Number(game.editorLevel)||0));}else if(Array.isArray(game.levelObjects)){state.platformLevels=[game.levelObjects,[],[],[],[]];state.editorLevel=0;}state.levelObjects=state.platformLevels[state.editorLevel]||[];renderPlatformLevelTabs();Object.keys(controls).forEach(k=>{if(game[k]!==undefined)controls[k].value=game[k];});["clickPower","upgradeName","upgradeCost","upgradeGain","autoCost","autoRate"].forEach(k=>{const el=$("#"+k);if(el&&game[k]!==undefined)el.value=game[k];});document.querySelectorAll(".template-card").forEach(b=>b.classList.toggle("selected",b.dataset.type===state.type));renderCustomUpgradeEditor();updatePreview();chooseObject(-1);setStep("1");toast("저장된 게임을 불러왔어!");}
$("#saveGameButton").addEventListener("click",async()=>{
 const status=$("#savedGamesStatus");
 if(!currentAuthUser){status.textContent="저장하려면 먼저 로그인해 줘.";setHeaderTab("login");return;}
 if(!firebaseDb){status.textContent="Firestore 데이터베이스가 연결되지 않았어.";return;}
 const name=$("#savedGameName").value.trim()||state.title||"나의 게임";status.textContent="게임을 저장하는 중…";
 try{await firebaseDb.collection("users").doc(currentAuthUser.uid).collection("games").add({name:name.slice(0,32),game:snapshotGame(),isPublic:false,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()});status.textContent="게임을 저장했어! 기본 설정은 비공개야. 공개하기를 누르면 글로벌 맵에 올라가.";refreshSavedGames();}
 catch(e){status.textContent="저장 실패: Firestore를 활성화하고 보안 규칙을 설정해 줘.";console.error(e);}
});

$("#authSignOut").addEventListener("click",async()=>{
  if(!firebaseAuth){authMessage("Firebase 로그인 서비스가 연결되지 않았어.");return;}
  const confirmed = window.confirm("로그아웃할까?\n다시 로그인하려면 이메일 또는 Google 계정이 필요해.");
  if(!confirmed) return;
  try{await firebaseAuth.signOut();authMessage("로그아웃했어.");}
  catch(error){authMessage("로그아웃 오류: "+(error.code||error.message));}
});


// AI and login are separate toggle tabs. Clicking the active tab returns to the editor.
const aiPanel = $("#aiStudio");
const loginPanel = $("#accountPanel");
const mainViews = [document.querySelector(".intro"), document.querySelector(".step-tabs"), document.querySelector(".studio-grid"), document.querySelector(".export-panel")];
let activeHeaderTab = null;

function setHeaderTab(tab, scroll=true){
  const nextTab = activeHeaderTab === tab ? null : tab;
  activeHeaderTab = nextTab;
  const showAI = nextTab === "ai";
  const showLogin = nextTab === "login";

  mainViews.forEach(view=>{if(view)view.hidden=!!nextTab;});
  aiPanel.hidden = !showAI;
  loginPanel.hidden = !showLogin;

  $("#openAiTab").setAttribute("aria-expanded",showAI?"true":"false");
  $("#openAiTab").classList.toggle("active",showAI);
  $("#openLoginPanel").setAttribute("aria-expanded",showLogin?"true":"false");
  $("#openLoginPanel").classList.toggle("active",showLogin);

  if(scroll){
    const target = showAI ? aiPanel : showLogin ? loginPanel : document.querySelector(".intro");
    target?.scrollIntoView({behavior:"smooth",block:"start"});
  }
}

$("#openAiTab").addEventListener("click",()=>setHeaderTab("ai"));
$("#openLoginPanel").addEventListener("click",()=>setHeaderTab("login"));
$("#backFromAi").addEventListener("click",()=>setHeaderTab(null));
