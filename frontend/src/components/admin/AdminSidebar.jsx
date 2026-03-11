import React from "react";
import { NavLink } from "react-router-dom";

import {
LayoutDashboard,
Users,
Building2,
Wallet,
ArrowLeftRight
} from "lucide-react";

export default function AdminSidebar(){

const linkStyle = ({isActive}) => ({
display:"flex",
alignItems:"center",
gap:"12px",
padding:"12px 18px",
textDecoration:"none",
color:"#fff",
borderRadius:"6px",
background:isActive ? "#334155" : "transparent"
});

return(

<div style={sidebar}>

{/* LOGO */}

<div style={logoBox}>
<div style={logoCircle}>N</div>
<h2 style={logoText}>Nivestha</h2>
</div>


{/* MENU */}

<NavLink to="/admin/dashboard" style={linkStyle}>
<LayoutDashboard size={20}/>
Dashboard
</NavLink>

<NavLink to="/admin/users" style={linkStyle}>
<Users size={20}/>
Users
</NavLink>

<NavLink to="/admin/properties" style={linkStyle}>
<Building2 size={20}/>
Properties
</NavLink>

<NavLink to="/admin/rent-distribution" style={linkStyle}>
<Wallet size={20}/>
Rent Distribution
</NavLink>

<NavLink to="/admin/transactions" style={linkStyle}>
<ArrowLeftRight size={20}/>
Transactions
</NavLink>

</div>

);

}


/* STYLES */

const sidebar={
width:"220px",
background:"#1e293b",
color:"#fff",
paddingTop:"20px",
height:"100vh",
position:"fixed",
left:0,
top:0,
display:"flex",
flexDirection:"column",
gap:"8px"
};

const logoBox={
display:"flex",
alignItems:"center",
gap:"10px",
padding:"0 18px",
marginBottom:"25px"
};

const logoCircle={
width:"36px",
height:"36px",
borderRadius:"8px",
background:"#2563eb",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontWeight:"bold",
fontSize:"18px"
};

const logoText={
fontSize:"18px",
fontWeight:"600"
};