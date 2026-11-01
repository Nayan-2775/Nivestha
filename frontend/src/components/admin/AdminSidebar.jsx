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

<div className="app-sidebar" style={sidebar}>

{/* LOGO */}

<NavLink
to="/"
className="sidebar-brand"
style={{...logoBox,color:"inherit",textDecoration:"none"}}
aria-label="Nivestha home"
title="Go to your home page"
>
<div style={logoCircle}>N</div>
<h2 style={logoText}>Nivestha</h2>
</NavLink>


{/* MENU */}

<NavLink to="/admin/dashboard" style={linkStyle}>
<LayoutDashboard size={20}/>
<span className="sidebar-label" data-short="Home">Dashboard</span>
</NavLink>

<NavLink to="/admin/users" style={linkStyle}>
<Users size={20}/>
<span className="sidebar-label" data-short="Users">Users</span>
</NavLink>

<NavLink to="/admin/properties" style={linkStyle}>
<Building2 size={20}/>
<span className="sidebar-label" data-short="Properties">Properties</span>
</NavLink>

<NavLink to="/admin/rent-distribution" style={linkStyle}>
<Wallet size={20}/>
<span className="sidebar-label" data-short="Rent">Rent Distribution</span>
</NavLink>

<NavLink to="/admin/transactions" style={linkStyle}>
<ArrowLeftRight size={20}/>
<span className="sidebar-label" data-short="Transactions">Transactions</span>
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
