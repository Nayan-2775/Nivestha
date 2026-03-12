import React,{useEffect,useState} from "react";
import API from "../../services/api";

export default function RentDistributionPage(){

const [properties,setProperties] = useState([]);
const [property_id,setPropertyId] = useState("");
const [percentage,setPercentage] = useState("3");

useEffect(()=>{
loadProperties();
},[]);

/* LOAD PROPERTIES */

const loadProperties = async ()=>{

try{

const res = await API.get("/admin/properties");

if(res.data.success){
setProperties(res.data.properties);
}

}catch(err){
console.log(err);
}

};

/* DISTRIBUTE RENT */

const distributeRent = async ()=>{

const distributionPercentage = Number(percentage);

if(!property_id || !distributionPercentage){
alert("Please fill all fields");
return;
}

if(distributionPercentage < 3 || distributionPercentage > 4){
alert("Distribution percentage must be between 3% and 4%");
return;
}

try{

const res = await API.post("/admin/distribute-rent",{
property_id,
distribution_percentage:distributionPercentage
});

alert(
res.data.message ||
"Rent distributed successfully"
);

setPercentage("3");

}catch(err){

alert(err.response?.data?.message || "Distribution failed");

}

};

return(

<div style={container}>

<h2 style={title}>Rent Distribution</h2>

<div style={card}>

<label style={label}>Property</label>

<select
style={input}
value={property_id}
onChange={(e)=>setPropertyId(e.target.value)}
>

<option value="">Select Property</option>

{properties.map((p)=>(
<option key={p.property_id} value={p.property_id}>
{p.title} — {p.location}
</option>
))}

</select>

<label style={label}>Distribution Percentage</label>

<input
style={input}
placeholder="Enter percentage between 3 and 4"
value={percentage}
onChange={(e)=>setPercentage(e.target.value)}
/>

<p style={helperText}>
Each investor will receive this percentage of their invested amount for the selected property.
</p>

<button
style={btn}
onClick={distributeRent}
>
Distribute Rent
</button>

</div>

</div>

);

}


/* ===== STYLES ===== */

const container={
display:"flex",
flexDirection:"column",
gap:"25px"
};

const title={
fontSize:"24px",
fontWeight:"600"
};

const card={
background:"#fff",
padding:"25px",
borderRadius:"12px",
boxShadow:"0 6px 16px rgba(0,0,0,0.08)",
display:"flex",
flexDirection:"column",
gap:"12px",
maxWidth:"420px"
};

const label={
fontSize:"14px",
color:"#64748b"
};

const input={
padding:"10px",
borderRadius:"8px",
border:"1px solid #e2e8f0",
fontSize:"14px"
};

const helperText={
fontSize:"12px",
color:"#64748b",
margin:"0"
};

const btn={
marginTop:"10px",
padding:"12px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"8px",
cursor:"pointer",
fontWeight:"500"
};
