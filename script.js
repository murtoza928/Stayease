const KEY="stayease_complaints_v1";
const demoData=[
{id:"CMP-1001",guest:"Nusrat Jahan",room:"405",email:"nusrat@example.com",category:"Cleanliness",priority:"High",description:"The bathroom was not cleaned properly after check-in.",date:"2026-08-13 10:20",status:"Resolved",rating:5},
{id:"CMP-1002",guest:"Arif Hasan",room:"212",email:"arif@example.com",category:"Wi-Fi",priority:"Normal",description:"Wi-Fi connection is unstable in the room.",date:"2026-08-13 15:45",status:"In Progress"},
{id:"CMP-1003",guest:"Sadia Rahman",room:"308",email:"sadia@example.com",category:"Room Service",priority:"Urgent",description:"Requested room service has not arrived yet.",date:"2026-08-14 08:10",status:"Pending"},
{id:"CMP-1004",guest:"Tanvir Ahmed",room:"517",email:"tanvir@example.com",category:"Maintenance",priority:"High",description:"The air conditioner is making a loud noise.",date:"2026-08-14 11:30",status:"Pending"}
];

function getData(){return JSON.parse(localStorage.getItem(KEY)||"null")||demoData}
function saveData(data){localStorage.setItem(KEY,JSON.stringify(data))}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2800)}
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===id));
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-page]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();showPage(el.dataset.page);document.querySelector("nav").classList.remove("open")}));
document.getElementById("menuBtn").onclick=()=>document.querySelector("nav").classList.toggle("open");

function badge(status){return `<span class="status ${status==="Resolved"?"resolved":status==="In Progress"?"progress":"pending"}">${status}</span>`}
function renderStats(data){
  totalCount.textContent=data.length;
  pendingCount.textContent=data.filter(x=>x.status==="Pending").length;
  progressCount.textContent=data.filter(x=>x.status==="In Progress").length;
  resolvedCount.textContent=data.filter(x=>x.status==="Resolved").length;
}
function renderAdmin(){
  const data=getData();renderStats(data);
  const q=adminSearch.value.toLowerCase(), sf=statusFilter.value, cf=categoryFilter.value;
  const filtered=data.filter(x=>(sf==="All"||x.status===sf)&&(cf==="All"||x.category===cf)&&[x.id,x.guest,x.room,x.category,x.description].join(" ").toLowerCase().includes(q));
  complaintTable.innerHTML=filtered.map(x=>`<tr>
  <td><b>${x.id}</b></td><td><b>${x.guest}</b><br><span class="muted">Room ${x.room}</span></td><td>${x.category}</td>
  <td><span class="priority ${x.priority}">${x.priority}</span></td><td>${x.date}</td>
  <td><select class="status-select" onchange="changeStatus('${x.id}',this.value)"><option ${x.status==="Pending"?"selected":""}>Pending</option><option ${x.status==="In Progress"?"selected":""}>In Progress</option><option ${x.status==="Resolved"?"selected":""}>Resolved</option></select></td>
  <td><button class="action-btn" onclick="viewComplaint('${x.id}')">View</button><button class="action-btn delete-btn" onclick="deleteComplaint('${x.id}')">Delete</button></td></tr>`).join("");
  noRows.classList.toggle("hidden",filtered.length>0);
}
function renderGuest(){
  const data=getData();
  guestComplaints.innerHTML=data.slice().reverse().slice(0,8).map(x=>`<div class="complaint-row">
    <div><b>${x.id}</b><div class="muted">${x.guest} • Room ${x.room}</div></div>
    <div>${x.category}<div class="muted">${x.date}</div></div>
    <div>${badge(x.status)}</div>
    <button class="action-btn" onclick="viewComplaint('${x.id}')">Details</button>
  </div>`).join("")||`<div class="empty-state"><span>📭</span><h3>No complaints yet</h3><p>Your submitted complaints will appear here.</p></div>`;
}
function viewComplaint(id){
 const x=getData().find(c=>c.id===id); if(!x)return;
 modalContent.innerHTML=`<h2>${x.id}</h2><p class="muted">Complaint details</p>
 <div class="detail-line"><b>Guest</b><span>${x.guest}</span></div><div class="detail-line"><b>Room</b><span>${x.room}</span></div>
 <div class="detail-line"><b>Category</b><span>${x.category}</span></div><div class="detail-line"><b>Priority</b><span>${x.priority}</span></div>
 <div class="detail-line"><b>Status</b><span>${badge(x.status)}</span></div><div class="detail-line"><b>Submitted</b><span>${x.date}</span></div>
 <div class="detail-description"><b>Description</b><br>${x.description}</div>
 ${x.status==="Resolved"?`<div class="feedback"><b>Guest Rating</b><div class="stars">${[1,2,3,4,5].map(n=>`<button class="${(x.rating||0)>=n?"selected":""}" onclick="rateComplaint('${x.id}',${n})">★</button>`).join("")}</div></div>`:""}`;
 modal.classList.remove("hidden");
}
function changeStatus(id,status){
 const data=getData();const x=data.find(c=>c.id===id);if(x){x.status=status;saveData(data);renderAdmin();renderGuest();toast(`${id} updated to ${status}`)}
}
function deleteComplaint(id){if(!confirm(`Delete ${id}?`))return;saveData(getData().filter(x=>x.id!==id));renderAdmin();renderGuest();toast("Complaint deleted")}
function rateComplaint(id,rating){const data=getData();const x=data.find(c=>c.id===id);if(x){x.rating=rating;saveData(data);viewComplaint(id);toast("Thank you for your feedback!")}}
complaintForm.onsubmit=e=>{
 e.preventDefault();const data=getData();let num=1001+data.length;
 const id="CMP-"+num;
 const x={id,guest:guestName.value.trim(),room:roomNumber.value.trim(),email:guestEmail.value.trim(),category:category.value,priority:priority.value,description:description.value.trim(),date:new Date().toLocaleString("en-GB",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),status:"Pending"};
 data.push(x);saveData(data);e.target.reset();renderGuest();renderAdmin();toast(`Complaint submitted successfully. ID: ${id}`);trackId.value=id;showTrack(x);
};
function showTrack(x){
 trackResult.innerHTML=`<div style="text-align:left"><div class="detail-line"><b>Complaint ID</b><span>${x.id}</span></div><div class="detail-line"><b>Guest / Room</b><span>${x.guest} / ${x.room}</span></div><div class="detail-line"><b>Category</b><span>${x.category}</span></div><div class="detail-line"><b>Status</b><span>${badge(x.status)}</span></div><div class="detail-line"><b>Submitted</b><span>${x.date}</span></div></div>`;
}
trackBtn.onclick=()=>{const id=trackId.value.trim().toUpperCase();const x=getData().find(c=>c.id===id);x?showTrack(x):(trackResult.innerHTML=`<div class="empty-state"><span>⚠️</span><h3>Complaint not found</h3><p>Please check the complaint ID and try again.</p></div>`)};
trackScrollBtn.onclick=()=>document.getElementById("trackPanel").scrollIntoView({behavior:"smooth"});
[adminSearch,statusFilter,categoryFilter].forEach(el=>el.addEventListener("input",renderAdmin));
seedBtn.onclick=()=>{if(confirm("Reset all complaints to demo data?")){saveData(demoData);renderAdmin();renderGuest();toast("Demo data restored")}};
closeModal.onclick=()=>modal.classList.add("hidden");
modal.onclick=e=>{if(e.target===modal)modal.classList.add("hidden")};
renderAdmin();renderGuest();
