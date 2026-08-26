const SUPABASE_URL="https://oxlrqzbdwquimvxjvjll.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_1IliYfoPR1eoOF5xw6b30g_Wyh-mnO5";
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
let mode="login",count=0,total=0,streak=0,seva=0,target=108,mantra="ॐ हनुमते नमः";
const $=id=>document.getElementById(id), today=()=>new Date().toISOString().slice(0,10);
function render(){$("count").textContent=count.toLocaleString();$("targetText").textContent=Number(target).toLocaleString();$("completeMsg").textContent=count>=target?"🙏 आज की साधना पूर्ण! 🚩":"";$("homeJaap").textContent=total.toLocaleString();$("totalJaap").textContent=total.toLocaleString();$("homeStreak").textContent=streak;$("streak").textContent=streak;$("homeSeva").textContent=seva;$("seva").textContent=seva;$("profileJaap").textContent=total.toLocaleString();$("profileStreak").textContent=streak;$("profileSeva").textContent=seva;const b=[];if(total>=108)b.push("📿 First 108 Jaap");if(total>=1008)b.push("🚩 1,008 Jaap");if(streak>=7)b.push("🔥 7-Day Consistency");if(seva)b.push("❤️ First Seva");$("badges").innerHTML=b.length?b.map(x=>`<span class="badge">${x}</span>`).join(" "):"Start your journey today. 🙏"}
function page(p){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));$(p).classList.add("active");const b=document.querySelector(`[data-page="${p}"]`);if(b)b.classList.add("active")}
document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>page(b.dataset.page));
$("plus").onclick=()=>{count++;render()};$("minus").onclick=()=>{count=Math.max(0,count-1);render()};$("mala").onclick=()=>{count+=108;render()};$("reset").onclick=()=>{count=0;render()};
$("mantra").onchange=e=>mantra=e.target.value;$("target").onchange=e=>{target=+e.target.value;count=0;render()};
function setMode(m){mode=m;$("loginTab").classList.toggle("active",m==="login");$("signupTab").classList.toggle("active",m==="signup");$("nameWrap").classList.toggle("hidden",m!=="signup");$("authSubmit").textContent=m==="login"?"Login":"Create account";$("authMessage").textContent=""}
$("loginTab").onclick=()=>setMode("login");$("signupTab").onclick=()=>setMode("signup");
async function profile(user,name){const r=await sb.from("profiles").upsert({id:user.id,display_name:name||"Devotee"},{onConflict:"id"});if(r.error)console.error(r.error)}
async function load(){const {data:{user}}=await sb.auth.getUser();if(!user)return;const r=await sb.from("profiles").select("*").eq("id",user.id).maybeSingle();if(r.data){total=Number(r.data.total_jaap)||0;streak=r.data.streak||0;seva=r.data.seva_count||0;$("profileName").textContent=r.data.display_name||"Devotee";$("profileDisplayName").value=r.data.display_name||"Devotee";$("profileBio").textContent=r.data.bio||"Add a short devotional bio.";$("profileBioInput").value=r.data.bio||"";$("welcome").textContent=`Welcome, ${r.data.display_name||"Devotee"} 🙏`}$("profileEmail").textContent=user.email||"";try{await loadSevaHistory(user.id)}catch(e){console.error(e)};try{await loadCommunityJaap()}catch(e){console.error(e)};try{await loadDailyBhakti()}catch(e){console.error(e)};try{await loadCreations()}catch(e){console.error(e)};render()}
$("authForm").onsubmit=async e=>{e.preventDefault();$("authMessage").textContent="Working…";const email=$("email").value.trim(),password=$("password").value;if(mode==="signup"){const r=await sb.auth.signUp({email,password});if(r.error){$("authMessage").textContent=r.error.message;return}if(r.data.user)await profile(r.data.user,$("displayName").value.trim());$("authMessage").textContent="Account created. Check your email if confirmation is enabled, then log in."}else{const r=await sb.auth.signInWithPassword({email,password});if(r.error){$("authMessage").textContent=r.error.message;return}await show()}};
async function show(){$("auth").classList.add("hidden");$("app").classList.remove("hidden");try{await load()}catch(e){console.error(e);render()}}
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

const COMMUNITY_GOAL=100000;
async function loadCommunityJaap(){
  const r=await sb.from("community_stats").select("total_jaap").eq("id",1).maybeSingle();
  if(r.error){console.error(r.error);$("communityMessage").textContent="Unable to load community total.";return}
  const n=Number(r.data?.total_jaap)||0;
  const pct=Math.min(100,(n/COMMUNITY_GOAL)*100);
  $("communityJaap").textContent=n.toLocaleString();
  $("communityJaapShort").textContent=n.toLocaleString();
  $("communityGoal").textContent=COMMUNITY_GOAL.toLocaleString();
  $("communityPercent").textContent=pct.toFixed(1)+"%";
  $("communityProgress").style.width=pct+"%";
  $("communityGoalText").textContent=`${n.toLocaleString()} / ${COMMUNITY_GOAL.toLocaleString()} jaap`;
  $("communityMessage").textContent="";
}
$("refreshCommunity").onclick=loadCommunityJaap;

const DAILY_FALLBACK={title:"Today's Bhakti Practice",mantra:"ॐ हनुमते नमः",thought:"Let devotion bring steadiness, kindness and courage into your actions.",sadhana:"Sit quietly for a few minutes, remember your chosen deity, and chant with attention.",seva_suggestion:"Help someone today without expecting recognition."};
function localDate(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
async function loadDailyBhakti(){
 const d=localDate();
 $("dailyDate").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"});
 let c=DAILY_FALLBACK;
 try{const r=await sb.from("daily_bhakti_entries").select("title,mantra,thought,sadhana,seva_suggestion").eq("entry_date",d).maybeSingle();if(!r.error&&r.data)c=r.data}catch(e){console.error(e)}
 $("dailyTitle").textContent=c.title||DAILY_FALLBACK.title;$("dailyMantra").textContent=c.mantra||DAILY_FALLBACK.mantra;$("dailyThought").textContent=c.thought||DAILY_FALLBACK.thought;$("dailySadhana").textContent=c.sadhana||DAILY_FALLBACK.sadhana;$("dailySeva").textContent=c.seva_suggestion||DAILY_FALLBACK.seva_suggestion;
 const {data:{user}}=await sb.auth.getUser();if(!user)return;
 const r=await sb.from("daily_bhakti_completions").select("completed_date").eq("user_id",user.id).order("completed_date",{ascending:false}).limit(365);
 if(r.error){console.error(r.error);return}
 const dates=(r.data||[]).map(x=>x.completed_date);$("dailyCompleted").textContent=dates.length;
 let s=0,cur=new Date(d+"T00:00:00");for(const ds of dates){if(ds!==cur.getFullYear()+"-"+String(cur.getMonth()+1).padStart(2,"0")+"-"+String(cur.getDate()).padStart(2,"0"))break;s++;cur.setDate(cur.getDate()-1)}$("dailyStreak").textContent=s;
 if(dates.includes(d)){$("dailyComplete").disabled=true;$("dailyComplete").textContent="✅ Completed today"}
}
$("dailyComplete").onclick=async()=>{const {data:{user}}=await sb.auth.getUser();if(!user)return;const d=localDate();$("dailyMessage").textContent="Saving…";const r=await sb.from("daily_bhakti_completions").insert({user_id:user.id,completed_date:d});if(r.error){$("dailyMessage").textContent=r.error.code==="23505"?"Already completed today. 🙏":r.error.message;await loadDailyBhakti();return}$("dailyMessage").textContent="🌸 Today's practice completed.";await loadDailyBhakti()};

$("logout").onclick=async()=>{await sb.auth.signOut();location.reload()};
(async()=>{const r=await sb.auth.getSession();setMode("login");if(r.data.session)show();else $("auth").classList.remove("hidden");render()})();


// V2.4 — My Bhakti Profile
$("profileForm").onsubmit=async e=>{
 e.preventDefault();
 const {data:{user}}=await sb.auth.getUser(); if(!user)return;
 $("profileMessage").textContent="Saving…";
 const name=$("profileDisplayName").value.trim()||"Devotee";
 const bio=$("profileBioInput").value.trim()||null;
 const r=await sb.from("profiles").update({display_name:name,bio}).eq("id",user.id);
 if(r.error){$("profileMessage").textContent=r.error.message;return}
 $("profileName").textContent=name;$("profileBio").textContent=bio||"Add a short devotional bio.";$("welcome").textContent=`Welcome, ${name} 🙏`;
 $("profileMessage").textContent="✅ Profile updated.";
};

const TYPE_LABELS={bhajan:"🎵 Bhajan",song:"🎤 Song",shayari:"✍️ Shayari",writing:"📝 Bhakti Writing"};
async function loadCreations(){
 const {data:{user}}=await sb.auth.getUser(); if(!user)return;
 const r=await sb.from("bhakti_creations").select("id,content_type,title,content,audio_url,visibility,status,created_at").eq("user_id",user.id).order("created_at",{ascending:false});
 if(r.error){console.error(r.error);$("myCreations").innerHTML="<p>Unable to load your creations.</p>";return}
 const rows=r.data||[];
 $("myCreations").innerHTML=rows.length?rows.map(x=>`<article class="creation-item"><h3>${escapeHtml(x.title)}</h3><div class="creation-meta"><span class="creation-tag">${TYPE_LABELS[x.content_type]||x.content_type}</span><span class="creation-tag">${x.visibility==="public"?"🌍 Public":"🔒 Private"}</span><span class="creation-tag">${x.status==="published"?"🌸 Published":"📝 Draft"}</span></div>${x.content?`<div class="creation-content">${escapeHtml(x.content)}</div>`:""}${x.audio_url?`<p><a href="${escapeHtml(x.audio_url)}" target="_blank" rel="noopener">🎧 Open audio</a></p>`:""}<div class="creation-actions"><button class="danger" data-delete-creation="${x.id}">Delete</button></div></article>`).join(""):"<p>No creations yet. Your first Bhakti creation can start here. 🙏</p>";
 document.querySelectorAll("[data-delete-creation]").forEach(btn=>btn.onclick=async()=>{
   if(!confirm("Delete this creation?"))return;
   const rr=await sb.from("bhakti_creations").delete().eq("id",btn.dataset.deleteCreation);
   if(rr.error){$("creationMessage").textContent=rr.error.message;return}
   $("creationMessage").textContent="🗑️ Creation deleted.";await loadCreations();
 });
}

$("creationForm").onsubmit=async e=>{
 e.preventDefault();
 const {data:{user}}=await sb.auth.getUser(); if(!user)return;
 const type=$("creationType").value,title=$("creationTitle").value.trim(),content=$("creationContent").value.trim()||null,audio=$("creationAudio").value.trim()||null,visibility=$("creationVisibility").value,status=$("creationStatus").value;
 if(visibility==="public"&&status!=="published"){$("creationMessage").textContent="Choose Published to make a creation public.";return}
 $("creationMessage").textContent="Saving…";
 const r=await sb.from("bhakti_creations").insert({user_id:user.id,content_type:type,title,content,audio_url:audio,visibility,status});
 if(r.error){$("creationMessage").textContent=r.error.message;return}
 $("creationForm").reset();$("creationVisibility").value="private";$("creationStatus").value="draft";$("creationMessage").textContent="🙏 Creation saved.";await loadCreations();
};
