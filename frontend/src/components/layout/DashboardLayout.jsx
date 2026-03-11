import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export default function DashboardLayout() {

return (

<div style={container}>

<Sidebar/>

<div style={mainContent}>

<Navbar/>

<div style={pageContent}>
<Outlet/>
</div>

<Footer/>

</div>

</div>

);

}

const container={
display:"flex",
minHeight:"100vh",
background:"#f1f5f9"
};

const mainContent={
flex:1,
display:"flex",
flexDirection:"column",

/* IMPORTANT FIX */
marginLeft:"70px",   // collapsed sidebar width

transition:"margin-left 0.25s ease"
};

const pageContent={
flex:1,
padding:"30px",
display:"flex",
flexDirection:"column",
gap:"25px",

/* PREVENT CONTENT STRETCHING */
maxWidth:"1400px",
width:"100%",
margin:"0 auto"
};