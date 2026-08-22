const SUPABASE_URL="https://oxlrqzbdwquimvxjvjll.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_1IliYfoPR1eoOF5xw6b30g_Wyh-mnO5";
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
let mode="login",count=0,total=0,streak=0,seva=0,target=108,mantra="ॐ हनुमते नमः";
const $=id=>document.getElementById(id), today=()=>new Date().toISOString().slice(0,10);
function render(){$("count").textContent=count.toLocaleString();$("targetText").textContent=Number(target).toLocaleString();$("completeMsg").textContent=count>=target?"🙏 आज की साधना पूर्ण! 🚩":"";$("homeJaap").textContent=total.toLocaleString();$("totalJaap").textContent=total.toLocaleString();$("homeStreak").textContent=streak;$("streak").textContent=streak;$("homeSeva").textContent=seva;$("seva").textContent=seva;const b=[];if(total>=108)b.push("📿 First 108 Jaap");if(total>=1008)b.push("🚩 1,008 Jaap");if(streak>=7)b.push("🔥 7-Day Consistency");if(seva)b.push("❤️ First Seva");$("badges").innerHTML=b.length?b.map(x=>`<span class="badge">${x}</span>`).join(" "):"Start your journey today. 🙏"}
function page(p){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));$(p).classList.add("active");const b=document.querySelector(`[data-page="${p}"]`);if(b)b.classList.add("active")}
document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>page(b.dataset.page));
$("plus").onclick=()=>{count++;render()};$("minus").onclick=()=>{count=Math.max(0,count-1);render()};$("mala").onclick=()=>{count+=108;render()};$("reset").onclick=()=>{count=0;render()};
$("mantra").onchange=e=>mantra=e.target.value;$("target").onchange=e=>{target=+e.target.value;count=0;render()};
function setMode(m){mode=m;$("loginTab").classList.toggle("active",m==="login");$("signupTab").classList.toggle("active",m==="signup");$("nameWrap").classList.toggle("hidden",m!=="signup");$("authSubmit").textContent=m==="login"?"Login":"Create account";$("authMessage").textContent=""}
$("loginTab").onclick=()=>setMode("login");$("signupTab").onclick=()=>setMode("signup");
async function profile(user,name){const r=await sb.from("profiles").upsert({id:user.id,display_name:name||"Devotee"},{onConflict:"id"});if(r.error)console.error(r.error)}
async function load(){const {data:{user}}=await sb.auth.getUser();if(!user)return;const r=await sb.from("profiles").select("*").eq("id",user.id).maybeSingle();if(r.data){total=Number(r.data.total_jaap)||0;streak=r.data.streak||0;seva=r.data.seva_count||0;$("profileName").textContent=r.data.display_name||"Devotee";$("welcome").textContent=`Welcome, ${r.data.display_name||"Devotee"} 🙏`}$("profileEmail").textContent=user.email||"";await loadSevaHistory(user.id);render()}
$("authForm").onsubmit=async e=>{e.preventDefault();$("authMessage").textContent="Working…";const email=$("email").value.trim(),password=$("password").value;if(mode==="signup"){const r=await sb.auth.signUp({email,password});if(r.error){$("authMessage").textContent=r.error.message;return}if(r.data.user)await profile(r.data.user,$("displayName").value.trim());$("authMessage").textContent="Account created. Check your email if confirmation is enabled, then log in."}else{const r=await sb.auth.signInWithPassword({email,password});if(r.error){$("authMessage").textContent=r.error.message;return}await show()}};
async function show(){$("auth").classList.add("hidden");$("app").classList.remove("hidden");await load()}
$("saveJaap").onclick=async()=>{const {data:{user}}=await sb.auth.getUser();if(!user)return;$("saveMessage").textContent="Saving…";const r=await sb.from("jaap_records").upsert({user_id:user.id,mantra,jaap_count:count,target,completed:count>=target,recorded_date:today()},{onConflict:"user_id,recorded_date"});if(r.error){$("saveMessage").textContent=r.error.message;return}const old=total;total=Math.max(total,old+count);const p=await sb.from("profiles").update({total_jaap:total,streak}).eq("id",user.id);$("saveMessage").textContent=p.error?p.error.message:"☁️ Today's jaap saved.";render()};
async function loadSevaHistory(userId){
 const r=await sb.from("seva_records").select("id,seva_type,description,recorded_date").eq("user_id",userId).order("recorded_date",{ascending:false}).limit(50);
 if(r.error){console.error(r.error);$("sevaHistory").innerHTML="<p>Unable to load seva history.</p>";return}
 const rows=r.data||[];$("sevaTotal").textContent=rows.length;$("seva").textContent=rows.length;$("homeSeva").textContent=rows.length;
 $("sevaHistory").innerHTML=rows.length?rows.map(x=>`<div class="seva-item"><div class="seva-icon">❤️</div><div><b>${escapeHtml(x.seva_type)}</b><small>${escapeHtml(x.recorded_date)}</small>${x.description?`<p>${escapeHtml(x.description)}</p>`:""}</div></div>`).join(""):"<p>No seva recorded yet.</p>";
}
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
$("sevaForm").onsubmit=async e=>{
 e.preventDefault();const {data:{user}}=await sb.auth.getUser();if(!user)return;
 $("sevaMessage").textContent="Saving…";
 const r=await sb.from("seva_records").insert({user_id:user.id,seva_type:$("sevaType").value,description:$("sevaDescription").value.trim()||null,recorded_date:today()});
 if(r.error){$("sevaMessage").textContent=r.error.message;return}
 $("sevaForm").reset();$("sevaMessage").textContent="❤️ Seva saved successfully.";await loadSevaHistory(user.id);
};
$("logout").onclick=async()=>{await sb.auth.signOut();location.reload()};
(async()=>{const r=await sb.auth.getSession();setMode("login");if(r.data.session)show();else $("auth").classList.remove("hidden");render()})();
