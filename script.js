const $ = (s) => document.querySelector(s);

function setStep(step){
  const selected=String(step)==="2"?"2":"1";
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
    grid.classList.toggle("step-one",selected==="1");
    grid.classList.toggle("step-two",selected==="2");
  }
  document.documentElement.dataset.activeStep=selected;
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
  const next=event.key==="Home"?"1":event.key==="End"?"2":
    event.key==="ArrowRight"?(tab.dataset.stepTab==="1"?"2":"1"):
    (tab.dataset.stepTab==="2"?"1":"2");
  setStep(next);
  document.querySelector('[data-step-tab="'+next+'"]')?.focus();
});
setStep("1");
const defaultLevel=()=>[];
const state = {levelObjects:defaultLevel(),selectedObject:-1,activeTool:"select",type:"click", title: "별을 모아라!", intro: "제한 시간 안에 반짝이는 별을 많이 모아 봐!", seconds: 30, color: "#7867f5", button: "게임 시작!", question: "대한민국의 수도는 어디일까?", answer: "서울", score: 0, time: 30, running: false, timer: null, waiting: false, startedAt: 0 };
const controls = { title: $("#gameTitle"), intro: $("#gameIntro"), seconds: $("#gameTime"), color: $("#themeColor"), button: $("#buttonText"), question: $("#quizQuestion"), answer: $("#quizAnswer") };
let toastTimer;
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2200);}
function saveDraft(){try{localStorage.setItem("game-studio-draft-v2",JSON.stringify({type:state.type,title:state.title,intro:state.intro,seconds:state.seconds,color:state.color,button:state.button,question:state.question,answer:state.answer,levelObjects:state.levelObjects}));$("#saveStatus").textContent="자동 저장됨";}catch(e){$("#saveStatus").textContent="자동 저장 사용 불가";}}
function updatePreview(){ $("#previewTitle").textContent=state.title||"나만의 게임";$("#previewIntro").textContent=state.intro;$("#previewTime").textContent=state.seconds;$("#previewScore").textContent="0";$("#playButton").textContent=state.button||"게임 시작!";$("#gameScreen").style.setProperty("--accent",state.color);$("#quizPreviewQuestion").textContent=state.question;$("#quizSettings").hidden=state.type!=="quiz";$("#quizArea").hidden=state.type!=="quiz";$("#playArea").hidden=state.type==="quiz"||state.type==="platformer";$("#platformerSettings").hidden=state.type!=="platformer";$("#platformerArea").hidden=state.type!=="platformer";if(state.type==="platformer")drawMapEditor();$("#colorName").textContent=state.color.toUpperCase();$("#playMessage").innerHTML="준비됐어?<br>시작 버튼을 눌러 봐!";$("#gameTarget").textContent=state.type==="reaction"?"⚡":"✦";$("#gameTarget").style.background=state.color;$("#gameTarget").hidden=true;$("#playButton").hidden=false;$("#playButton").disabled=false;$("#quizInput").value="";state.score=0;state.time=state.seconds;$("#previewScore").textContent="0";$("#previewTime").textContent=state.time;saveDraft();}
function stopGame(){clearInterval(state.timer);state.running=false;state.waiting=false;$("#gameTarget").hidden=true;$("#playButton").disabled=false;$("#playButton").textContent="다시 시작";$("#playMessage").textContent="게임 종료! 점수: "+state.score;$("#playMessage").hidden=false;}
function finishGame(message){clearInterval(state.timer);if(state.platformFrame)cancelAnimationFrame(state.platformFrame);state.running=false;state.waiting=false;$("#gameTarget").hidden=true;$("#quizArea").hidden=true;$("#playArea").hidden=state.type==="platformer";$("#platformerArea").hidden=state.type!=="platformer";$("#playButton").hidden=false;$("#playButton").disabled=false;$("#playButton").textContent="다시 시작";$("#playMessage").textContent=message;$("#playMessage").hidden=false;}
function tick(){state.time--;$("#previewTime").textContent=state.time;if(state.time<=0)finishGame("시간 종료! 최종 점수: "+state.score);}
function startClickGame(){state.score=0;state.time=state.seconds;state.running=true;$("#previewScore").textContent="0";$("#previewTime").textContent=state.time;$("#playMessage").hidden=true;$("#playButton").disabled=true;$("#playButton").textContent="플레이 중…";const target=$("#gameTarget");target.hidden=false;moveTarget();state.timer=setInterval(tick,1000);}
function moveTarget(){const area=$("#playArea"),target=$("#gameTarget");const maxX=Math.max(0,area.clientWidth-target.offsetWidth-12),maxY=Math.max(0,area.clientHeight-target.offsetHeight-12);target.style.left=(6+Math.random()*maxX)+"px";target.style.top=(6+Math.random()*maxY)+"px";}
function startReaction(){state.score=0;state.time=state.seconds;state.running=true;state.waiting=true;state.startedAt=0;$("#previewScore").textContent="0";$("#previewTime").textContent=state.time;$("#playMessage").hidden=false;$("#playMessage").textContent="초록색으로 바뀔 때까지 기다려!";$("#playButton").disabled=true;$("#playButton").textContent="기다리는 중…";const target=$("#gameTarget");target.hidden=false;target.style.left="50%";target.style.top="50%";target.style.transform="translate(-50%,-50%)";target.style.background="#a4a5b4";target.textContent="…";const delay=1200+Math.random()*2200;state.timer=setInterval(tick,1000);setTimeout(()=>{if(!state.running||!state.waiting)return;state.waiting=false;state.startedAt=performance.now();target.style.background="#25c98a";target.textContent="GO!";},delay);}
function startQuiz(){state.score=0;state.time=state.seconds;state.running=true;$("#previewScore").textContent="0";$("#previewTime").textContent=state.time;$("#playButton").hidden=true;$("#quizArea").hidden=false;$("#quizInput").focus();state.timer=setInterval(tick,1000);}


const platformKeys={left:false,right:false,jump:false};let pp,cam=0,lastFrame=0;const WORLD_W=1560,MAP_SCALE=640/WORLD_W;
function drawMapEditor(){const c=$("#mapEditorCanvas");if(!c)return;const g=c.getContext("2d");g.clearRect(0,0,640,300);g.fillStyle="#dff3ff";g.fillRect(0,0,640,300);g.strokeStyle="#ffffff88";for(let x=0;x<=640;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,300);g.stroke()}for(let y=0;y<=300;y+=30){g.beginPath();g.moveTo(0,y);g.lineTo(640,y);g.stroke()}g.save();g.scale(MAP_SCALE,1);state.levelObjects.forEach((o,i)=>{if(o.type==="block"){g.fillStyle=o.color;g.fillRect(o.x,o.y,o.w,o.h)}else if(o.type==="laser"){g.fillStyle="#ff405b";g.fillRect(o.x,o.y,o.w,Math.max(7,o.h))}else if(o.type==="coin"){g.fillStyle=o.color;g.beginPath();g.arc(o.x+o.w/2,o.y+o.h/2,Math.max(5,o.w/2),0,7);g.fill()}else if(o.type==="spike"){g.fillStyle=o.color;g.beginPath();g.moveTo(o.x,o.y+o.h);g.lineTo(o.x+o.w/2,o.y);g.lineTo(o.x+o.w,o.y+o.h);g.fill()}if(i===state.selectedObject){g.strokeStyle="#172033";g.lineWidth=4;g.strokeRect(o.x-3,o.y-3,o.w+6,o.h+6)}});g.restore();g.fillStyle="#ff6b82";g.fillRect(1500*MAP_SCALE,220,4,52);}
function chooseObject(i){state.selectedObject=i;const o=state.levelObjects[i];$("#selectedObjectLabel").textContent=o?({block:"블록",laser:"레이저",coin:"코인",spike:"가시"}[o.type]+" 선택됨"):"선택된 오브젝트 없음";$("#objectWidth").value=o?Math.round(o.w):180;$("#objectHeight").value=o?Math.round(o.h):22;$("#objectColor").value=o&&o.color?o.color:"#7867f5";$("#deleteObject").disabled=!o;drawMapEditor();}
document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>{state.activeTool=b.dataset.tool;document.querySelectorAll("[data-tool]").forEach(x=>x.classList.toggle("selected",x===b));}));
let mapDrag=null;$("#mapEditorCanvas").addEventListener("pointerdown",e=>{const c=e.currentTarget,r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*640/MAP_SCALE,y=(e.clientY-r.top)/r.height*300;if(state.activeTool!=="select"){const t=state.activeTool,d={block:[78,30,"#7867f5"],laser:[120,10,"#ff405b"],coin:[20,20,"#ffc83d"],spike:[44,28,"#55556b"]}[t];const px=t==="block"?Math.floor(x/78)*78:Math.max(0,x-d[0]/2);const py=t==="block"?Math.floor(y/30)*30:Math.max(0,Math.min(300-d[1],y-d[1]/2));state.levelObjects.push({type:t,x:Math.max(0,Math.min(WORLD_W-d[0],px)),y:Math.max(0,Math.min(300-d[1],py)),w:d[0],h:d[1],color:d[2]});chooseObject(state.levelObjects.length-1);saveDraft();return;}let hit=-1;for(let i=state.levelObjects.length-1;i>=0;i--){const o=state.levelObjects[i];if(x>=o.x-10&&x<=o.x+o.w+10&&y>=o.y-10&&y<=o.y+o.h+10){hit=i;break;}}chooseObject(hit);if(hit>=0){mapDrag={i:hit,x,y,ox:state.levelObjects[hit].x,oy:state.levelObjects[hit].y};c.setPointerCapture(e.pointerId);}});
$("#mapEditorCanvas").addEventListener("pointermove",e=>{if(!mapDrag)return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*640/MAP_SCALE,y=(e.clientY-r.top)/r.height*300,o=state.levelObjects[mapDrag.i];o.x=Math.max(0,Math.min(WORLD_W-o.w,mapDrag.ox+x-mapDrag.x));o.y=Math.max(0,Math.min(300-o.h,mapDrag.oy+y-mapDrag.y));drawMapEditor();});
$("#mapEditorCanvas").addEventListener("pointerup",()=>{if(mapDrag){mapDrag=null;saveDraft();}});$("#mapEditorCanvas").addEventListener("pointercancel",()=>{mapDrag=null;});
function updateSelectedObject(){const o=state.levelObjects[state.selectedObject];if(!o)return;o.w=Math.max(10,Math.min(600,Number($("#objectWidth").value)||10));o.h=Math.max(8,Math.min(120,Number($("#objectHeight").value)||8));o.color=$("#objectColor").value;drawMapEditor();saveDraft();}
["objectWidth","objectHeight","objectColor"].forEach(id=>$("#"+id).addEventListener("input",updateSelectedObject));
$("#deleteObject").addEventListener("click",()=>{if(state.selectedObject<0)return;state.levelObjects.splice(state.selectedObject,1);chooseObject(-1);saveDraft();});
$("#resetMap").addEventListener("click",()=>{state.levelObjects=[];chooseObject(-1);saveDraft();toast("캔버스를 비웠어!");});
function drawPlatform(){const c=$("#platformerCanvas"),g=c.getContext("2d");g.fillStyle="#c9edff";g.fillRect(0,0,640,300);g.save();g.translate(-cam,0);state.levelObjects.forEach(o=>{if(o.type==="block"){g.fillStyle=o.color;g.fillRect(o.x,o.y,o.w,o.h);g.fillStyle="#fff8";g.fillRect(o.x,o.y,o.w,4)}else if(o.type==="laser"){g.fillStyle="#ff405b";g.fillRect(o.x,o.y,o.w,Math.max(7,o.h));g.fillStyle="#fff";g.fillRect(o.x,o.y+2,o.w,2)}else if(o.type==="coin"){g.fillStyle=o.color;g.beginPath();g.arc(o.x+o.w/2,o.y+o.h/2,Math.max(5,o.w/2),0,7);g.fill()}else if(o.type==="spike"){g.fillStyle=o.color;g.beginPath();g.moveTo(o.x,o.y+o.h);g.lineTo(o.x+o.w/2,o.y);g.lineTo(o.x+o.w,o.y+o.h);g.fill()}});g.fillStyle="#fff";g.fillRect(1500,220,5,52);g.fillStyle="#ff6b82";g.fillRect(1505,221,36,20);g.fillStyle="#27304a";g.fillRect(pp.x,pp.y,pp.w,pp.h);g.fillStyle="#fff";g.fillRect(pp.x+15,pp.y+7,5,5);g.restore();}
function startPlatformer(){state.score=0;state.time=state.seconds;state.running=true;$("#previewScore").textContent="0";$("#previewTime").textContent=state.time;$("#playArea").hidden=true;$("#platformerArea").hidden=false;$("#playButton").disabled=true;$("#playButton").textContent="플레이 중…";Object.keys(platformKeys).forEach(k=>platformKeys[k]=false);state.levelObjects.forEach(o=>{if(o.type==="coin")o.got=false;});pp={x:25,y:220,w:24,h:34,vy:0,ground:false};cam=0;lastFrame=performance.now();drawPlatform();state.timer=setInterval(tick,1000);state.platformFrame=requestAnimationFrame(platformFrame);}
function platformFrame(t){if(!state.running)return;const dt=Math.min((t-lastFrame)/16.67||1,2);lastFrame=t;const old=pp.y+pp.h;pp.x=Math.max(0,Math.min(1540,pp.x+((platformKeys.right?3.4:0)-(platformKeys.left?3.4:0))*dt));if(platformKeys.jump&&pp.ground){pp.vy=-10.5;pp.ground=false;}pp.vy=Math.min(12,pp.vy+.48*dt);pp.y+=pp.vy*dt;pp.ground=false;state.levelObjects.forEach(o=>{if(o.type==="block"&&pp.x+pp.w>o.x&&pp.x<o.x+o.w&&old<=o.y+7&&pp.y+pp.h>=o.y&&pp.vy>=0){pp.y=o.y-pp.h;pp.vy=0;pp.ground=true;}});let hazard=false;state.levelObjects.forEach(o=>{if((o.type==="laser"||o.type==="spike")&&pp.x+pp.w>o.x&&pp.x<o.x+o.w&&pp.y+pp.h>o.y&&pp.y<o.y+o.h)hazard=true;if(o.type==="coin"&&!o.got&&Math.abs(pp.x+12-(o.x+o.w/2))<20&&Math.abs(pp.y+17-(o.y+o.h/2))<23){o.got=true;state.score+=10;$("#previewScore").textContent=state.score;}});if(hazard){finishGame("장애물에 닿았어! 점수: "+state.score);return;}if(pp.y>330){finishGame("떨어졌어! 점수: "+state.score);return;}if(pp.x>1495){finishGame("스테이지 클리어! 점수: "+state.score);return;}cam=Math.max(0,Math.min(900,pp.x-210));drawPlatform();state.platformFrame=requestAnimationFrame(platformFrame);}
document.querySelectorAll("[data-move]").forEach(b=>{const k=b.dataset.move;b.addEventListener("pointerdown",e=>{e.preventDefault();platformKeys[k]=true;});["pointerup","pointercancel","pointerleave"].forEach(ev=>b.addEventListener(ev,()=>platformKeys[k]=false));});
window.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")platformKeys.left=true;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")platformKeys.right=true;if(e.key===" "||e.key==="ArrowUp"||e.key.toLowerCase()==="w")platformKeys.jump=true;});
window.addEventListener("keyup",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")platformKeys.left=false;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")platformKeys.right=false;if(e.key===" "||e.key==="ArrowUp"||e.key.toLowerCase()==="w")platformKeys.jump=false;});
function startGame(){clearInterval(state.timer);state.running=false;state.waiting=false;$("#playButton").hidden=false;$("#quizArea").hidden=true;$("#playMessage").hidden=false;$("#gameTarget").style.transform="none";if(state.type==="click")startClickGame();else if(state.type==="reaction")startReaction();else if(state.type==="platformer")startPlatformer();else startQuiz();}
Object.entries(controls).forEach(([key,el])=>{el.addEventListener("input",()=>{state[key]=key==="seconds"?Number(el.value):el.value;updatePreview();});el.addEventListener("change",()=>{state[key]=key==="seconds"?Number(el.value):el.value;updatePreview();});});
document.querySelectorAll(".template-card").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".template-card").forEach(b=>b.classList.remove("selected"));btn.classList.add("selected");state.type=btn.dataset.type;updatePreview();}));
$("#playButton").addEventListener("click",startGame);
$("#gameTarget").addEventListener("click",()=>{if(!state.running)return;if(state.type==="click"){state.score++;$("#previewScore").textContent=state.score;moveTarget();}else if(state.type==="reaction"){if(state.waiting){finishGame("앗! 너무 빨랐어. 다시 도전!");return;}const ms=Math.round(performance.now()-state.startedAt);state.score=ms;$("#previewScore").textContent=ms+"ms";finishGame("반응속도 "+ms+"ms! 다시 도전해 봐.");}});
$("#quizSubmit").addEventListener("click",()=>{if(!state.running)return;const value=$("#quizInput").value.trim();if(value&&value.toLocaleLowerCase()===state.answer.trim().toLocaleLowerCase()){state.score+=10;$("#previewScore").textContent=state.score;finishGame("정답! +10점 획득!");}else toast("아쉽지만 정답이 아니야. 다시 생각해 봐!");});
$("#quizInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("#quizSubmit").click();});
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function makeExport(){const title=escapeHtml(state.title||"나만의 게임"),intro=escapeHtml(state.intro),color=state.color,seconds=state.seconds,button=escapeHtml(state.button||"게임 시작!"),type=state.type,question=escapeHtml(state.question),answer=escapeHtml(state.answer);let gameScript="";
if(type==="platformer")gameScript=`const pc=$("platformerCanvas"),cx=pc.getContext("2d"),keys={left:false,right:false,jump:false};let px=25,py=220,vy=0,on=false,camera=0,coins=0,frame=0,objects=${JSON.stringify(state.levelObjects)};area.style.display="none";function paint(){cx.fillStyle="#c9edff";cx.fillRect(0,0,640,300);cx.save();cx.translate(-camera,0);objects.forEach(o=>{if(o.type==="block"){cx.fillStyle=o.color;cx.fillRect(o.x,o.y,o.w,o.h)}else if(o.type==="laser"){cx.fillStyle="#ff405b";cx.fillRect(o.x,o.y,o.w,Math.max(7,o.h))}else if(o.type==="coin"){cx.fillStyle=o.color;cx.beginPath();cx.arc(o.x+o.w/2,o.y+o.h/2,Math.max(5,o.w/2),0,7);cx.fill()}else if(o.type==="spike"){cx.fillStyle=o.color;cx.beginPath();cx.moveTo(o.x,o.y+o.h);cx.lineTo(o.x+o.w/2,o.y);cx.lineTo(o.x+o.w,o.y+o.h);cx.fill()}});cx.fillStyle="#ff6b82";cx.fillRect(1505,221,36,20);cx.fillStyle="#27304a";cx.fillRect(px,py,24,34);cx.fillStyle="#fff";cx.fillRect(px+15,py+7,5,5);cx.restore()}function loop(){if(!frame)return;const old=py+34;px=Math.max(0,Math.min(1540,px+(keys.right?3.4:0)-(keys.left?3.4:0)));if(keys.jump&&on){vy=-10.5;on=false}vy=Math.min(12,vy+.48);py+=vy;on=false;objects.forEach(o=>{if(o.type==="block"&&px+24>o.x&&px<o.x+o.w&&old<=o.y+7&&py+34>=o.y&&vy>=0){py=o.y-34;vy=0;on=true}});let hazard=false;objects.forEach(o=>{if((o.type==="laser"||o.type==="spike")&&px+24>o.x&&px<o.x+o.w&&py+34>o.y&&py<o.y+o.h)hazard=true;if(o.type==="coin"&&!o.got&&Math.abs(px+12-(o.x+o.w/2))<20&&Math.abs(py+17-(o.y+o.h/2))<23){o.got=true;coins+=10;scoreEl.textContent=coins}});if(hazard||py>330||px>1495){cancelAnimationFrame(frame);frame=0;msg.hidden=false;msg.textContent=hazard?"장애물에 닿았어!":"스테이지 클리어! 점수: "+coins;btn.disabled=false;btn.textContent="다시 시작";return}camera=Math.max(0,Math.min(900,px-210));paint();frame=requestAnimationFrame(loop)}function bind(id,k){const el=$(id);el.addEventListener("pointerdown",e=>{e.preventDefault();keys[k]=true});["pointerup","pointercancel","pointerleave"].forEach(ev=>el.addEventListener(ev,()=>keys[k]=false))}bind("left","left");bind("right","right");bind("jump","jump");window.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=true;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=true;if(e.key===" "||e.key==="ArrowUp")keys.jump=true});window.addEventListener("keyup",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=false;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=false;if(e.key===" "||e.key==="ArrowUp")keys.jump=false});function start(){if(frame)cancelAnimationFrame(frame);px=25;py=220;vy=0;coins=0;camera=0;objects.forEach(o=>o.got=false);scoreEl.textContent="0";msg.hidden=true;btn.disabled=true;btn.textContent="플레이 중…";frame=requestAnimationFrame(loop)}btn.onclick=start;`
else if(type==="click")gameScript=`let score=0,left=${seconds},timer;function move(){const x=Math.random()*Math.max(0,area.clientWidth-54),y=Math.random()*Math.max(0,area.clientHeight-54);target.style.left=x+'px';target.style.top=y+'px'}function start(){clearInterval(timer);score=0;left=${seconds};scoreEl.textContent=score;timeEl.textContent=left;msg.hidden=true;target.hidden=false;btn.disabled=true;move();timer=setInterval(()=>{timeEl.textContent=--left;if(left<=0){clearInterval(timer);target.hidden=true;msg.hidden=false;msg.textContent='끝! 점수: '+score;btn.disabled=false;btn.textContent='다시 시작'}},1000)}target.onclick=()=>{score++;scoreEl.textContent=score;move()};btn.onclick=start;`;
else if(type==="quiz")gameScript=`let left=${seconds},timer;function start(){clearInterval(timer);left=${seconds};timeEl.textContent=left;scoreEl.textContent='0';msg.hidden=true;quiz.hidden=false;btn.hidden=true;answerInput.value='';timer=setInterval(()=>{timeEl.textContent=--left;if(left<=0){clearInterval(timer);msg.hidden=false;msg.textContent='시간 종료!';quiz.hidden=true;btn.hidden=false;btn.textContent='다시 시작'}},1000)}btn.onclick=start;submit.onclick=()=>{if(answerInput.value.trim().toLowerCase()===${JSON.stringify(answer.toLowerCase())}){clearInterval(timer);scoreEl.textContent='10';msg.hidden=false;msg.textContent='정답! +10점';quiz.hidden=true;btn.hidden=false;btn.textContent='다시 시작'}else alert('다시 생각해 봐!')};`;
else gameScript=`let left=${seconds},timer,waiting=false,started=0;function start(){clearInterval(timer);left=${seconds};timeEl.textContent=left;msg.textContent='초록색이 될 때까지 기다려!';msg.hidden=false;target.hidden=false;target.textContent='…';target.style.background='#aaa';btn.disabled=true;waiting=true;timer=setInterval(()=>{timeEl.textContent=--left;if(left<=0){clearInterval(timer);target.hidden=true;msg.textContent='시간 종료!';btn.disabled=false;btn.textContent='다시 시작'}},1000);setTimeout(()=>{if(!waiting)return;waiting=false;started=performance.now();target.textContent='GO!';target.style.background='#25c98a'},1500+Math.random()*1800)}target.onclick=()=>{if(waiting){waiting=false;clearInterval(timer);msg.textContent='너무 빨랐어!';target.hidden=true;btn.disabled=false;btn.textContent='다시 시작'}else if(started){clearInterval(timer);const ms=Math.round(performance.now()-started);scoreEl.textContent=ms+'ms';msg.textContent='반응속도 '+ms+'ms!';target.hidden=true;btn.disabled=false;btn.textContent='다시 시작'}};btn.onclick=start;`;
const extra=type==="platformer"?'<div style="margin-top:12px"><canvas id="platformerCanvas" width="640" height="300" style="width:100%;background:#c9edff;border-radius:12px;touch-action:none"></canvas><div style="display:flex;justify-content:center;gap:10px"><button id="left">◀</button><button id="right">▶</button><button id="jump">점프</button></div></div>':type==="quiz"?'<div id="quiz" hidden><p>'+question+'</p><input id="answerInput" placeholder="정답 입력"><button id="submit">정답 확인</button></div>':'';
const htmlDoc='<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:20px;background:#f4f3fb;font-family:system-ui,sans-serif;color:#24243b}.card{width:min(100%,480px);padding:28px;border-radius:24px;background:white;text-align:center;box-shadow:0 12px 40px #2222}h1{font-size:32px;margin:12px 0}p{color:#777} .stats{display:flex;justify-content:center;gap:14px;margin:20px}.stats div{background:#f4f4fa;padding:12px 24px;border-radius:12px}.area{height:190px;position:relative;background:#f8f7ff;border:1px dashed '+color+'66;border-radius:16px;overflow:hidden;display:grid;place-items:center}#target{position:absolute;width:54px;height:54px;border:0;border-radius:50%;background:'+color+';color:white;font-size:24px;touch-action:manipulation}button{border:0;border-radius:12px;background:'+color+';color:white;padding:14px 20px;font-weight:800;cursor:pointer;margin-top:14px}input{padding:12px;border:1px solid #ddd;border-radius:9px;width:100%;margin:8px 0}</style><main class="card"><small>MY GAME</small><h1>'+title+'</h1><p>'+intro+'</p><div class="stats"><div>점수<br><b id="scoreEl">0</b></div><div>남은 시간<br><b id="timeEl">'+seconds+'</b></div></div><div class="area" id="area"><p id="msg">시작 버튼을 눌러 봐!</p><button id="target" hidden>✦</button></div>'+extra+'<button id="btn">'+button+'</button></main><script>const $=id=>document.getElementById(id),area=$("area"),target=$("target"),msg=$("msg"),btn=$("btn"),scoreEl=$("scoreEl"),timeEl=$("timeEl");'+(type==="quiz"?'const quiz=$("quiz"),answerInput=$("answerInput"),submit=$("submit");':'')+gameScript+'<\/script></html>';
const blob=new Blob([htmlDoc],{type:"text/html;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="my-game.html";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast("내 게임 파일을 다운로드했어!");}
$("#exportTop").addEventListener("click",makeExport);$("#exportBottom").addEventListener("click",makeExport);
function restoreDraft(){try{const saved=JSON.parse(localStorage.getItem("game-studio-draft-v2")||"null");if(!saved)return;Object.keys(controls).forEach(k=>{if(saved[k]!==undefined){controls[k].value=saved[k];state[k]=saved[k];}});if(Array.isArray(saved.levelObjects)){state.levelObjects=saved.levelObjects;}if(saved.type){state.type=saved.type;document.querySelectorAll(".template-card").forEach(b=>b.classList.toggle("selected",b.dataset.type===saved.type));}}catch(e){}}
setStep("1");
restoreDraft();updatePreview();chooseObject(-1);


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
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: ""
};
const authStatus = $("#authStatus");
const authSignedOut = $("#authSignedOut");
const authSignedIn = $("#authSignedIn");
let firebaseAuth = null;
function authMessage(message){ if(authStatus) authStatus.textContent=message; }
function showAuthSession(user){
  authSignedOut.hidden=!!user;
  authSignedIn.hidden=!user;
  if(user) $("#authUserEmail").textContent=user.email||"이메일 계정";
}
const firebaseReady = !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.authDomain && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.appId);
if(!firebaseReady){
  authMessage("Firebase 설정이 아직 없어. Firebase 웹 앱의 설정값을 연결하면 이메일 회원가입과 로그인을 사용할 수 있어.");
}else if(!window.firebase?.initializeApp || !window.firebase?.auth){
  authMessage("Firebase 로그인 라이브러리를 불러오지 못했어. 인터넷 연결을 확인해 줘.");
}else{
  try{
    const app = window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(FIREBASE_CONFIG);
    firebaseAuth = app.auth();
    firebaseAuth.onAuthStateChanged(user=>{
      showAuthSession(user);
      authMessage(user ? "로그인했어! "+(user.email||"") : "이메일로 회원가입하거나 로그인해 줘.");
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
  }catch(error){authMessage("회원가입 오류: "+(error.code||error.message));}
});
$("#authSignIn").addEventListener("click",async()=>{
  if(!firebaseAuth){authMessage("먼저 Firebase 웹 앱 설정을 연결해야 해.");return;}
  const email=$("#authEmail").value.trim(),password=$("#authPassword").value;
  if(!email||!password){authMessage("이메일과 비밀번호를 입력해 줘.");return;}
  try{
    await firebaseAuth.signInWithEmailAndPassword(email,password);
    authMessage("로그인했어!");
  }catch(error){authMessage("로그인 오류: "+(error.code||error.message));}
});
$("#authSignOut").addEventListener("click",async()=>{
  if(!firebaseAuth){authMessage("Firebase 로그인 서비스가 연결되지 않았어.");return;}
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
