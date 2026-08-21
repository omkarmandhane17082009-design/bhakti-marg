const KEY="bhaktiMargV1";
const defaultState={count:0,totalJaap:0,streak:0,seva:0,lastDate:null,mantra:"ॐ हनुमते नमः",target:108};
let state=JSON.parse(localStorage.getItem(KEY)||"null")||defaultState;

const $=id=>document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function today(){return new Date().toISOString().slice(0,10)}
function render(){
  $("count").textContent=state.count.toLocaleString();
  $("targetText").textContent=Number(state.target).toLocaleString();
  $("mantra").value=state.mantra;
  $("target").value=state.target;
  const pct=Math.min(100,Math.round(state.count/state.target*100));
  $("bar").style.width=pct+"%"; $("percent").textContent=pct+"% complete";
  $("completeMsg").textContent=state.count>=state.target?"🙏 आज की साधना पूर्ण! जय श्री राम 🚩":"";
  ["homeJaap","totalJaap"].forEach(id=>$(id).textContent=state.totalJaap.toLocaleString());
  ["homeStreak","streak"].forEach(id=>$(id).textContent=state.streak);
  ["homeSeva","seva"].forEach(id=>$(id).textContent=state.seva);
  const badges=[];
  if(state.totalJaap>=108) badges.push("📿 First 108 Jaap");
  if(state.totalJaap>=1008) badges.push("🚩 1,008 Jaap");
  if(state.streak>=7) badges.push("🔥 7-Day Consistency");
  if(state.streak>=21) badges.push("🪔 21-Day Consistency");
  if(state.seva>=1) badges.push("❤️ First Seva");
  $("badges").innerHTML=badges.length?badges.map(x=>`<span class="badge">${x}</span>`).join(""):"<p>Your first achievement is waiting. Begin today. 🙏</p>";
}
function addJaap(n){
  const wasComplete=state.count>=state.target;
  state.count=Math.max(0,state.count+n);
  if(n>0){
    state.totalJaap+=n;
    if(state.count>=state.target && !wasComplete){
      const d=today();
      if(state.lastDate!==d){state.streak+=1;state.lastDate=d}
    }
  }
  save();
}
function navigate(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  $(page).classList.add("active");
  const btn=document.querySelector(`[data-page="${page}"]`);
  if(btn)btn.classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
$("plus").onclick=()=>addJaap(1);
$("minus").onclick=()=>addJaap(-1);
$("mala").onclick=()=>addJaap(108);
$("reset").onclick=()=>{state.count=0;save()};
$("mantra").onchange=e=>{state.mantra=e.target.value;save()};
$("target").onchange=e=>{state.target=Number(e.target.value);state.count=0;save()};
$("sevaBtn").onclick=()=>{state.seva+=1;save();alert("❤️ Seva recorded. May your good action inspire another good action.")};
$("clearData").onclick=()=>{if(confirm("Clear all local Bhakti Marg progress?")){localStorage.removeItem(KEY);location.reload()}};
render();