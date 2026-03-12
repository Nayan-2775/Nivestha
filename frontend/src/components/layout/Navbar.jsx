import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Navbar(){

const { user } = useAuth();
const [notifications,setNotifications] = useState([]);
const [loading,setLoading] = useState(false);
const [open,setOpen] = useState(false);
const panelRef = useRef(null);

const unreadCount = useMemo(
()=>notifications.filter((n)=>!n.is_read).length,
[notifications]
);

const fetchNotifications = async ()=>{
try{
setLoading(true);
const res = await API.get("/notifications");
setNotifications(Array.isArray(res.data) ? res.data : []);
}catch(err){
console.log("Notification load error:",err);
}finally{
setLoading(false);
}
};

const markAsRead = async (id)=>{
try{
await API.patch(`/notifications/${id}/read`);
setNotifications((prev)=>
prev.map((n)=>
n.notification_id === id
? { ...n, is_read:true }
: n
)
);
}catch(err){
console.log("Mark notification read failed:",err);
}
};

useEffect(()=>{
fetchNotifications();
const timer = setInterval(fetchNotifications,30000);
return ()=>clearInterval(timer);
},[]);

useEffect(()=>{
const onClickOutside = (event)=>{
if(panelRef.current && !panelRef.current.contains(event.target)){
setOpen(false);
}
};

document.addEventListener("mousedown",onClickOutside);
return ()=>document.removeEventListener("mousedown",onClickOutside);
},[]);

return(

<div style={navbar}>

<div style={rightGroup} ref={panelRef}>

<button
style={bellBtn}
onClick={()=>setOpen((prev)=>!prev)}
>
<Bell size={18}/>
{unreadCount > 0 && (
<span style={badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
)}
</button>

{open && (
<div style={panel}>
<div style={panelHeader}>
<p style={panelTitle}>Notifications</p>
<button style={refreshBtn} onClick={fetchNotifications}>Refresh</button>
</div>

{loading ? (
<p style={infoText}>Loading notifications...</p>
) : notifications.length === 0 ? (
<p style={infoText}>No notifications yet</p>
) : (
<div style={list}>
{notifications.map((item)=>(
<div
key={item.notification_id}
style={{
...itemCard,
background:item.is_read ? "#ffffff" : "#eff6ff",
borderColor:item.is_read ? "#e2e8f0" : "#bfdbfe"
}}
>
<p style={itemMsg}>{item.message}</p>
<p style={itemTime}>{new Date(item.created_at).toLocaleString()}</p>
{!item.is_read && (
<button
style={readBtn}
onClick={()=>markAsRead(item.notification_id)}
>
Mark as read
</button>
)}
</div>
))}
</div>
)}
</div>
)}

<div style={welcomeText}>Welcome, {user?.full_name}</div>

</div>

</div>

);

}

const navbar={
height:"60px",
background:"#f1f5f9",
display:"flex",
alignItems:"center",
justifyContent:"flex-end",
padding:"0 30px",
fontWeight:"500",
position:"sticky",
top:0,
zIndex:50
};

const rightGroup={
display:"flex",
alignItems:"center",
gap:"12px",
position:"relative"
};

const welcomeText={
fontWeight:"500"
};

const bellBtn={
width:"36px",
height:"36px",
borderRadius:"999px",
border:"1px solid #cbd5e1",
background:"#fff",
display:"flex",
alignItems:"center",
justifyContent:"center",
cursor:"pointer",
position:"relative",
color:"#0f172a"
};

const badge={
position:"absolute",
top:"-5px",
right:"-5px",
minWidth:"18px",
height:"18px",
padding:"0 5px",
borderRadius:"999px",
background:"#ef4444",
color:"#fff",
fontSize:"11px",
fontWeight:"700",
display:"flex",
alignItems:"center",
justifyContent:"center",
lineHeight:1
};

const panel={
position:"absolute",
top:"44px",
right:0,
width:"360px",
maxHeight:"440px",
background:"#fff",
border:"1px solid #e2e8f0",
borderRadius:"12px",
boxShadow:"0 18px 45px rgba(15,23,42,0.18)",
overflow:"hidden",
display:"flex",
flexDirection:"column"
};

const panelHeader={
padding:"10px 12px",
display:"flex",
alignItems:"center",
justifyContent:"space-between",
borderBottom:"1px solid #e2e8f0",
background:"#f8fafc"
};

const panelTitle={
margin:0,
fontSize:"14px",
fontWeight:"700",
color:"#0f172a"
};

const refreshBtn={
border:"none",
background:"transparent",
color:"#2563eb",
fontSize:"12px",
fontWeight:"600",
cursor:"pointer"
};

const infoText={
padding:"16px",
margin:0,
fontSize:"13px",
color:"#64748b"
};

const list={
overflowY:"auto",
maxHeight:"380px",
padding:"10px",
display:"flex",
flexDirection:"column",
gap:"8px"
};

const itemCard={
border:"1px solid",
borderRadius:"10px",
padding:"10px"
};

const itemMsg={
margin:"0 0 6px 0",
fontSize:"13px",
color:"#0f172a",
lineHeight:1.35
};

const itemTime={
margin:0,
fontSize:"11px",
color:"#64748b"
};

const readBtn={
marginTop:"8px",
border:"none",
background:"#1d4ed8",
color:"#fff",
fontSize:"11px",
fontWeight:"600",
padding:"6px 8px",
borderRadius:"6px",
cursor:"pointer"
};
