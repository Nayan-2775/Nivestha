import React, { useEffect, useState } from "react";
import API from "../../services/api";

import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
ResponsiveContainer
} from "recharts";

import {
Wallet,
TrendingUp,
Building
} from "lucide-react";

export default function InvestorDashboard(){

const [stats,setStats] = useState(null);

useEffect(()=>{
loadStats();
},[]);

const loadStats = async ()=>{

try{

const res = await API.get("/dashboard/stats");

setStats(res.data);

}catch(err){

console.log(err);

}

};

if(!stats){
return <p style={{padding:"20px"}}>Loading dashboard...</p>;
}


/* CARD STYLE */

const cardStyle={
background:"#ffffff",
padding:"22px",
borderRadius:"12px",
boxShadow:"0 4px 12px rgba(0,0,0,0.08)",
display:"flex",
flexDirection:"column",
gap:"6px"
};


return(

<div style={dashboardContainer}>

<h2 style={titleStyle}>
Investor Dashboard
</h2>


{/* ===== DASHBOARD CARDS ===== */}

<div style={cardsGrid}>


{/* WALLET */}

<div style={cardStyle}>

<div style={cardHeader}>

<Wallet size={20} color="#2563eb"/>

<p style={labelStyle}>
Wallet Balance
</p>

</div>

<h2 style={valueStyle}>
₹ {Number(stats.wallet.balance).toLocaleString()}
</h2>

</div>


{/* INVESTMENTS */}

<div style={cardStyle}>

<div style={cardHeader}>

<TrendingUp size={20} color="#10b981"/>

<p style={labelStyle}>
Total Invested
</p>

</div>

<h2 style={valueStyle}>
₹ {Number(stats.investments.total_invested).toLocaleString()}
</h2>

</div>


{/* PROPERTIES */}

<div style={cardStyle}>

<div style={cardHeader}>

<Building size={20} color="#f59e0b"/>

<p style={labelStyle}>
Properties Invested
</p>

</div>

<h2 style={valueStyle}>
{stats.investments.properties}
</h2>

</div>

</div>



{/* ===== PORTFOLIO GROWTH CHART ===== */}

<div style={chartCard}>

<h3 style={chartTitle}>
Portfolio Growth
</h3>

<div style={chartWrapper}>

<ResponsiveContainer width="100%" height="100%">

<LineChart data={stats.growth}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="month"/>

<YAxis/>

<Tooltip/>

<Line
type="monotone"
dataKey="value"
stroke="#2563eb"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

</div>

);

}



/* ===== STYLES ===== */

const dashboardContainer={
display:"flex",
flexDirection:"column",
gap:"30px",
width:"100%"
};

const titleStyle={
fontSize:"26px",
fontWeight:"600"
};

const cardsGrid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:"20px"
};

const cardHeader={
display:"flex",
alignItems:"center",
gap:"10px"
};

const labelStyle={
color:"#64748b"
};

const valueStyle={
fontSize:"26px",
fontWeight:"700"
};

const chartCard={
background:"#ffffff",
padding:"25px",
borderRadius:"12px",
boxShadow:"0 4px 12px rgba(0,0,0,0.08)",
width:"100%"
};

const chartTitle={
marginBottom:"15px",
fontWeight:"600"
};

const chartWrapper={
width:"100%",
height:"300px"
};