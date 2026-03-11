import React,{useState} from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Wallet, ArrowLeftRight, Building, Briefcase } from "lucide-react";

export default function Sidebar(){

const [collapsed,setCollapsed] = useState(true);

const sidebarStyle={
width:collapsed?"70px":"220px",
height:"100vh",
background:"#0f172a",
color:"white",
transition:"width 0.25s ease",
padding:"20px 10px",

/* FIXED POSITION */
position:"fixed",
left:0,
top:0,

display:"flex",
flexDirection:"column",
zIndex:1000
};

const logoStyle={
display:"flex",
alignItems:"center",
justifyContent:collapsed?"center":"flex-start",
gap:"10px",
marginBottom:"30px",
fontSize:"18px",
fontWeight:"bold"
};

const logoIcon={
width:"36px",
height:"36px",
borderRadius:"8px",
background:"#2563eb",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontWeight:"bold"
};

const linkStyle=({isActive})=>({

display:"flex",
alignItems:"center",
gap:"12px",
padding:"12px",
color:"white",
textDecoration:"none",
fontWeight:isActive?"600":"400",
borderRadius:"8px",

background:isActive?"#1e293b":"transparent",

transition:"0.2s",
marginBottom:"5px"

});

return(

<div
style={sidebarStyle}
onMouseEnter={()=>setCollapsed(false)}
onMouseLeave={()=>setCollapsed(true)}
>

{/* LOGO */}

<div style={logoStyle}>

<div style={logoIcon}>N</div>

{!collapsed && "Nivestha"}

</div>

{/* NAV LINKS */}

<NavLink to="/dashboard" style={linkStyle}>
<LayoutDashboard size={20}/>
{!collapsed && "Dashboard"}
</NavLink>

<NavLink to="/wallet" style={linkStyle}>
<Wallet size={20}/>
{!collapsed && "Wallet"}
</NavLink>

<NavLink to="/transactions" style={linkStyle}>
<ArrowLeftRight size={20}/>
{!collapsed && "Transactions"}
</NavLink>

<NavLink to="/investments" style={linkStyle}>
<Building size={20}/>
{!collapsed && "Investments"}
</NavLink>

<NavLink to="/portfolio" style={linkStyle}>
<Briefcase size={20}/>
{!collapsed && "Portfolio"}
</NavLink>

</div>

);

}