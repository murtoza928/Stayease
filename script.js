const COMPLAINT_KEY="stayease_complaints_v3",USER_KEY="stayease_users_v3",SESSION_KEY="stayease_session_v3",COUNTER_KEY="stayease_counter_v3";
const $=id=>document.getElementById(id);

function complaints(){return JSON.parse(localStorage.getItem(COMPLAINT_KEY)||"[]")}
function saveComplaints(x){localStorage.setItem(COMPLAINT_KEY,JSON.stringify(x))}
function users(){return JSON.parse(localStorage.getItem(USER_KEY)||"[]")}
function saveUsers(x){localStorage.setItem(USER_KEY,JSON.stringify(x))}
function session(){return JSON.parse(localStorage.getItem(SESSION_KEY)||"null")}
function setSession(x){localStorage.setItem(SESSION_KEY,JSON.stringify({username:x.username,name:x.name,email:x.email,role:x.role,room:x.room||""}))}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2600)}
function badge(s){return `<span class="status ${s==="Resolved"?"resolved":s==="In Progress"?"progress":"pending"}">${s}</span>`}
function page(id){
  document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===id));
  document.querySelectorAll(".nav-link").forEach(x=>x.classList.toggle("active",x.dataset.page===id));
  window.scrollTo({top:0,behavior:"smooth"});
  setTimeout(()=>document.querySelectorAll(".page.active .reveal").forEach(x=>x.style.animation=""),20);
}
function updateHeader(){
  const s=session();$("sessionLabel").textContent=s?`${s.name} • ${s.role==="admin"?"Admin":"Guest"}`:"";
  $("authBtn").classList.toggle("hidden",!!s);$("logoutBtn").classList.toggle("hidden",!s);
}
function auth(tab="login"){page("auth");document.querySelectorAll(".auth-tab").forEach(x=>x.classList.toggle("active",x.dataset.authTab===tab));$("loginBox").classList.toggle("hidden",tab!=="login");$("registerBox").classList.toggle("hidden",tab!=="register")}
function require(role,target){
  const s=session();if(!s){toast("Please login first.");auth("login");return false}
  if(s.role!==role){toast(`Please login as ${role} to open this page.`);auth("login");return false}
  page(target);return true
}
function nextId(){
  let n=Number(localStorage.getItem(COUNTER_KEY)||0)+1;localStorage.setItem(COUNTER_KEY,n);
  return "C"+String(n).padStart(3,"0")
}
function renderAdmin(){
  const data=complaints();$("totalCount").textContent=data.length;$("pendingCount").textContent=data.filter(x=>x.status==="Pending").length;$("progressCount").textContent=data.filter(x=>x.status==="In Progress").length;$("resolvedCount").textContent=data.filter(x=>x.status==="Resolved").length;
  const q=$("adminSearch").value.toLowerCase(),sf=$("statusFilter").value,cf=$("categoryFilter").value;
  const filtered=data.filter(x=>(sf==="All Status"||x.status===sf)&&(cf==="All Categories"||x.category===cf)&&[x.id,x.guest,x.room,x.category,x.description].join(" ").toLowerCase().includes(q));
  $("complaintTable").innerHTML=filtered.map(x=>`<tr><td><b>${x.id}</b></td><td><b>${x.guest}</b><br><span class="muted">Room ${x.room}</span></td><td>${x.category}</td><td><span class="priority ${x.priority}">${x.priority}</span></td><td>${x.date}</td><td><select class="status-select" onchange="changeStatus('${x.id}',this.value)"><option ${x.status==="Pending"?"selected":""}>Pending</option><option ${x.status==="In Progress"?"selected":""}>In Progress</option><option ${x.status==="Resolved"?"selected":""}>Resolved</option></select></td><td><button class="action-btn" onclick="detail('${x.id}')">View</button><button class="action-btn delete-btn" onclick="removeComplaint('${x.id}')">Delete</button></td></tr>`).join("");
  $("noRows").classList.toggle("hidden",filtered.length>0)
}
function changeStatus(id,status){
  if(session()?.role!=="admin"){toast("Admin login required.");auth("login");return}
  const data=complaints(),x=data.find(c=>c.id===id);if(x){x.status=status;saveComplaints(data);renderAdmin();toast(`${id} is now ${status}`)}
}
function removeComplaint(id){
  if(session()?.role!=="admin"){toast("Admin login required.");return}
  if(confirm(`Delete complaint ${id}?`)){saveComplaints(complaints().filter(x=>x.id!==id));renderAdmin();toast("Complaint deleted")}
}
function detail(id){
  if(session()?.role!=="admin"){toast("Admin login required.");return}
  const x=complaints().find(c=>c.id===id);if(!x)return;
  $("detailContent").innerHTML=`<h2>${x.id}</h2><p class="muted">Complaint details</p><div class="detail-line"><b>Guest</b><span>${x.guest}</span></div><div class="detail-line"><b>Room</b><span>${x.room}</span></div><div class="detail-line"><b>Email</b><span>${x.email}</span></div><div class="detail-line"><b>Category</b><span>${x.category}</span></div><div class="detail-line"><b>Priority</b><span>${x.priority}</span></div><div class="detail-line"><b>Status</b><span>${badge(x.status)}</span></div><div class="detail-line"><b>Submitted</b><span>${x.date}</span></div><div class="detail-description"><b>Description</b><br>${x.description}</div>`;$("detailModal").classList.remove("hidden")
}
function track(){
  const id=$("trackId").value.trim().toUpperCase(),x=complaints().find(c=>c.id===id);
  $("trackResult").innerHTML=x?`<div style="text-align:left"><div class="detail-line"><b>Complaint ID</b><span>${x.id}</span></div><div class="detail-line"><b>Category</b><span>${x.category}</span></div><div class="detail-line"><b>Submitted</b><span>${x.date}</span></div><div class="detail-line"><b>Current Status</b><span>${badge(x.status)}</span></div></div>`:`<div class="empty-state"><span>⚠️</span><h3>Complaint not found</h3><p>Check the ID and try again.</p></div>`
}
function openProfile(){
  const s=session();if(!s){auth("login");return}
  $("profileContent").innerHTML=`<div class="profile-badge">${s.name.charAt(0).toUpperCase()}</div><h2>${s.name}</h2><p class="muted">${s.role==="admin"?"Administrator":"Guest"} account</p><div class="profile-grid"><div class="profile-box"><small>Username</small><b>${s.username}</b></div><div class="profile-box"><small>Email</small><b>${s.email}</b></div><div class="profile-box"><small>Account Type</small><b>${s.role==="admin"?"Admin":"Guest"}</b></div><div class="profile-box"><small>Room</small><b>${s.room||"N/A"}</b></div></div><div class="profile-form"><h3>Change Username</h3><input id="newUsername" placeholder="New username"><button class="btn secondary full-btn" onclick="changeUsername()">Update Username</button><h3 style="margin-top:18px">Change Password</h3><input id="oldPassword" type="password" placeholder="Current password"><input id="newPassword" type="password" placeholder="New password"><input id="confirmNewPassword" type="password" placeholder="Confirm new password"><button class="btn primary full-btn" onclick="changePassword()">Update Password</button></div>`;$("profileModal").classList.remove("hidden")
}
function changeUsername(){
  const s=session(),n=$("newUsername").value.trim();if(!n)return toast("Enter a new username.");
  const us=users();if(us.some(u=>u.username.toLowerCase()===n.toLowerCase()&&u.username!==s.username))return toast("Username already exists.");
  const u=us.find(x=>x.username===s.username);u.username=n;saveUsers(us);setSession({...s,username:n});updateHeader();openProfile();toast("Username updated.")
}
function changePassword(){
  const s=session(),us=users(),u=us.find(x=>x.username===s.username),old=$("oldPassword").value,n=$("newPassword").value,c=$("confirmNewPassword").value;
  if(u.password!==old)return toast("Current password is incorrect.");if(n.length<4)return toast("New password must be at least 4 characters.");if(n!==c)return toast("Passwords do not match.");
  u.password=n;saveUsers(us);toast("Password updated successfully.");$("oldPassword").value="";$("newPassword").value="";$("confirmNewPassword").value=""
}
function successAccount(role,name){
  $("successTitle").textContent="Account Created Successfully";$("successText").textContent=`${name}, your ${role} account has been created. For security, you are not logged in automatically. Please log in manually.`;$("successModal").classList.remove("hidden");$("successLoginBtn").onclick=()=>{$("successModal").classList.add("hidden");auth("login");document.querySelectorAll("[data-login-role]").forEach(b=>b.classList.toggle("active",b.dataset.loginRole===role));$("loginRole").value=role}
}

document.querySelectorAll("[data-page]").forEach(x=>x.addEventListener("click",e=>{e.preventDefault();const p=x.dataset.page;if(p==="guest")require("guest","guest");else if(p==="admin")require("admin","admin");else page(p);$("mainNav").classList.remove("open")}));
$("menuBtn").onclick=()=>$("mainNav").classList.toggle("open");
$("authBtn").onclick=()=>auth("login");
$("logoutBtn").onclick=()=>{localStorage.removeItem(SESSION_KEY);updateHeader();toast("Logged out successfully.");page("home")};
$("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("stayease_theme",document.body.classList.contains("dark")?"dark":"light");$("themeBtn").textContent=document.body.classList.contains("dark")?"☀":"☾"};
if(localStorage.getItem("stayease_theme")==="dark"){document.body.classList.add("dark");$("themeBtn").textContent="☀"}

document.querySelectorAll("[data-auth-tab]").forEach(b=>b.onclick=()=>auth(b.dataset.authTab));
document.querySelectorAll("[data-login-role]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-login-role]").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("loginRole").value=b.dataset.loginRole;$("loginHelp").textContent=b.dataset.loginRole==="admin"?"Admin accounts can manage complaint records.":"Guest accounts can submit and track complaints."});
document.querySelectorAll("[data-register-role]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-register-role]").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("registerRole").value=b.dataset.registerRole;$("roomRegisterLabel").style.display=b.dataset.registerRole==="guest"?"block":"none"});

$("loginForm").onsubmit=e=>{
  e.preventDefault();const role=$("loginRole").value,u=users().find(x=>x.username.toLowerCase()===$("loginUsername").value.trim().toLowerCase()&&x.password===$("loginPassword").value&&x.role===role);
  if(!u)return toast("Invalid username, password or account type.");setSession(u);updateHeader();e.target.reset();toast(`Welcome back, ${u.name}!`);page(role==="admin"?"admin":"guest");if(role==="admin")renderAdmin();else{$("guestName").value=u.name;$("guestEmail").value=u.email;$("roomNumber").value=u.room||""}
};
$("registerForm").onsubmit=e=>{
  e.preventDefault();const role=$("registerRole").value,name=$("registerName").value.trim(),username=$("registerUsername").value.trim(),email=$("registerEmail").value.trim(),password=$("registerPassword").value,confirm=$("registerConfirm").value,room=$("registerRoom").value.trim();
  if(password!==confirm)return toast("Passwords do not match.");if(users().some(x=>x.username.toLowerCase()===username.toLowerCase()))return toast("Username already exists.");if(users().some(x=>x.email.toLowerCase()===email.toLowerCase()))return toast("Email already exists.");
  if(role==="admin"&&password.length<6)return toast("Admin password must be at least 6 characters.");const list=users();list.push({name,username,email,password,role,room});saveUsers(list);e.target.reset();successAccount(role,name)
};

$("complaintForm").onsubmit=e=>{
  e.preventDefault();const s=session();if(!s||s.role!=="guest"){toast("Guest login is required.");auth("login");return}
  const id=nextId(),data=complaints();data.push({id,guest:s.name,room:$("roomNumber").value.trim(),email:s.email,category:$("category").value,priority:$("priority").value,description:$("description").value.trim(),date:new Date().toLocaleString("en-GB",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),status:"Pending"});saveComplaints(data);e.target.reset();$("guestName").value=s.name;$("guestEmail").value=s.email;$("roomNumber").value=s.room||"";$("successTitle").textContent="Complaint Submitted";$("successText").textContent=`Your complaint has been created successfully. Your unique complaint ID is ${id}. Save this ID to track your complaint.`;$("successLoginBtn").textContent="Track My Complaint";$("successModal").classList.remove("hidden");$("successLoginBtn").onclick=()=>{$("successModal").classList.add("hidden");$("trackId").value=id;track()};toast(`Complaint ${id} created.`)
};
$("trackBtn").onclick=track;$("trackId").addEventListener("keydown",e=>{if(e.key==="Enter")track()});
$("profileBtn").onclick=openProfile;$("adminProfileBtn").onclick=()=>{if(require("admin","admin"))openProfile()};
[$("adminSearch"),$("statusFilter"),$("categoryFilter")].forEach(x=>x.addEventListener("input",()=>{if(session()?.role==="admin")renderAdmin()}));
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$(b.dataset.close).classList.add("hidden"));
document.querySelectorAll(".modal").forEach(m=>m.onclick=e=>{if(e.target===m)m.classList.add("hidden")});

updateHeader();renderAdmin();
