import React, { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

export default function PortfolioPage(){

const [portfolio,setPortfolio] = useState([]);

useEffect(()=>{
loadPortfolio();
},[]);

const loadPortfolio = async ()=>{

try{

const res = await API.get("/investments/my");

if(res.data.success){
setPortfolio(res.data.portfolio || []);
}

}catch(err){

console.log(err);

}

};

const totals = useMemo(()=>{
return portfolio.reduce((acc,item)=>{
acc.invested += Number(item.amount_invested || 0);
acc.current += Number(item.current_value || 0);
acc.rent += Number(item.rent_earned || 0);
acc.profit += Number(item.profit || 0);
return acc;
},{
invested:0,
current:0,
rent:0,
profit:0
});
},[portfolio]);

const totalRoi = totals.invested > 0
? (totals.profit / totals.invested) * 100
: 0;

const formatCurrency = (value)=>`Rs ${Number(value || 0).toLocaleString()}`;

return(

<div style={container}>

<h2 style={titleStyle}>My Portfolio</h2>

{portfolio.length === 0 ? (
<p>No investments yet</p>
) : (
<>

<div style={summaryGrid}>
<div style={summaryCard}>
<p style={summaryLabel}>Total Invested</p>
<p style={summaryValue}>{formatCurrency(totals.invested)}</p>
</div>

<div style={summaryCard}>
<p style={summaryLabel}>Current Value</p>
<p style={summaryValue}>{formatCurrency(totals.current)}</p>
</div>

<div style={summaryCard}>
<p style={summaryLabel}>Rent Earned</p>
<p style={{...summaryValue,color:"#0f766e"}}>{formatCurrency(totals.rent)}</p>
</div>

<div style={summaryCard}>
<p style={summaryLabel}>Total P/L</p>
<p style={{...summaryValue,color:totals.profit >= 0 ? "#15803d" : "#dc2626"}}>
{formatCurrency(totals.profit)}
</p>
<p style={roiText}>ROI {totalRoi >= 0 ? "+" : ""}{totalRoi.toFixed(2)}%</p>
</div>
</div>

<div style={grid}>

{portfolio.map((p)=>(
<div key={p.property_id} style={card}>

<h3 style={propertyTitle}>{p.title}</h3>

<p style={locationStyle}>{p.location}</p>

<div style={dataGrid}>

<div>
<p style={label}>Shares</p>
<p style={value}>{p.shares}</p>
</div>

<div>
<p style={label}>Invested</p>
<p style={value}>{formatCurrency(p.amount_invested)}</p>
</div>

<div>
<p style={label}>Current Value</p>
<p style={value}>{formatCurrency(p.current_value)}</p>
</div>

<div>
<p style={label}>Rent Earned</p>
<p style={{...value,color:"#0f766e"}}>{formatCurrency(p.rent_earned)}</p>
</div>

<div>
<p style={label}>Unrealized P/L</p>
<p style={{
fontWeight:"600",
color: Number(p.unrealized_profit || 0) >= 0 ? "#10b981" : "#ef4444"
}}>
{formatCurrency(p.unrealized_profit)}
</p>
</div>

<div>
<p style={label}>Total Profit / Loss</p>
<p style={{
fontWeight:"700",
color: Number(p.profit || 0) >= 0 ? "#16a34a" : "#dc2626"
}}>
{formatCurrency(p.profit)}
</p>
<p style={roiText}>ROI {Number(p.roi || 0) >= 0 ? "+" : ""}{Number(p.roi || 0).toFixed(2)}%</p>
</div>

</div>

</div>
))}

</div>

</>
)}

</div>

);

}

const container={
display:"flex",
flexDirection:"column",
gap:"24px"
};

const titleStyle={
fontSize:"34px",
fontWeight:"700",
color:"#0f172a"
};

const summaryGrid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
gap:"16px"
};

const summaryCard={
background:"linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)",
border:"1px solid #e2e8f0",
padding:"16px",
borderRadius:"12px",
boxShadow:"0 10px 24px rgba(15,23,42,0.06)",
display:"flex",
flexDirection:"column",
gap:"6px"
};

const summaryLabel={
margin:0,
fontSize:"12px",
color:"#64748b",
textTransform:"uppercase",
letterSpacing:"0.06em"
};

const summaryValue={
margin:0,
fontSize:"24px",
fontWeight:"700",
color:"#0f172a"
};

const roiText={
margin:0,
fontSize:"12px",
fontWeight:"600",
color:"#334155"
};

const grid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",
gap:"20px"
};

const card={
background:"#fff",
padding:"20px",
borderRadius:"12px",
boxShadow:"0 10px 24px rgba(15,23,42,0.08)",
display:"flex",
flexDirection:"column",
gap:"14px"
};

const propertyTitle={
fontSize:"18px",
fontWeight:"700",
color:"#0f172a"
};

const locationStyle={
fontSize:"14px",
color:"#64748b"
};

const dataGrid={
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:"14px"
};

const label={
fontSize:"12px",
color:"#64748b"
};

const value={
fontWeight:"600",
color:"#0f172a"
};
