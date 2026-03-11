import React,{useEffect,useState} from "react";
import API from "../../services/api";

import {
Users,
Building2,
Wallet,
ArrowLeftRight,
IndianRupee
} from "lucide-react";

export default function AdminDashboard(){

const [stats,setStats] = useState(null);

useEffect(()=>{
loadStats();
},[]);

const loadStats = async ()=>{

try{

const res = await API.get("/admin/stats");

if(res.data.success){
setStats(res.data.stats);
}

}catch(err){
console.log(err);
}

};

if(!stats){
return <p>Loading dashboard...</p>;
}

return(

<div style={container}>

<h2 style={title}>Admin Dashboard</h2>

<div style={grid}>

<div style={card}>
<Users size={28}/>
<h4>Total Users</h4>
<p>{stats.total_users}</p>
</div>

<div style={card}>
<Building2 size={28}/>
<h4>Total Properties</h4>
<p>{stats.total_properties}</p>
</div>

<div style={card}>
<Wallet size={28}/>
<h4>Total Investments</h4>
<p>{stats.total_investments}</p>
</div>

<div style={card}>
<ArrowLeftRight size={28}/>
<h4>Total Transactions</h4>
<p>{stats.total_transactions}</p>
</div>

<div style={card}>
<IndianRupee size={28}/>
<h4>Total Investment Amount</h4>
<p>₹ {Number(stats.total_investment_amount).toLocaleString()}</p>
</div>

</div>

</div>

);

}


/* STYLES */

const container={
display:"flex",
flexDirection:"column",
gap:"30px"
};

const title={
fontSize:"24px",
fontWeight:"600"
};

const grid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",
gap:"25px"
};

const card={
background:"#fff",
padding:"25px",
borderRadius:"12px",
boxShadow:"0 6px 16px rgba(0,0,0,0.08)",
display:"flex",
flexDirection:"column",
gap:"10px"
};