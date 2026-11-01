import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export default function DashboardLayout() {

return (

<div className="app-shell">

<Sidebar/>

<div className="app-main">

<Navbar/>

<div className="app-page">
<Outlet/>
</div>

<Footer/>

</div>

</div>

);

}

