import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export default function AdminLayout(){

return(

<div className="app-shell" style={{background:"#f5f7fb"}}>

<AdminSidebar/>

<div className="app-main admin-main">

<Navbar/>

<div className="app-page">
<Outlet/>
</div>

<Footer/>

</div>

</div>

);

}

