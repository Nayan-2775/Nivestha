import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export default function AdminLayout(){

return(

<div style={container}>

<AdminSidebar/>

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
background:"#f5f7fb"
};

const mainContent={
flex:1,
display:"flex",
flexDirection:"column",
marginLeft:"220px"
};

const pageContent={
flex:1,
padding:"30px",
display:"flex",
flexDirection:"column",
gap:"25px"
};