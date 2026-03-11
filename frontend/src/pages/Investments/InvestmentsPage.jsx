import React, { useEffect, useState } from "react";
import API from "../../services/api";

export default function InvestmentsPage(){

const [properties,setProperties] = useState([]);
const [prediction,setPrediction] = useState({});
const [loadingAI,setLoadingAI] = useState(null);
const [investmentYears,setInvestmentYears] = useState({});

const [investModal,setInvestModal] = useState({
open:false,
propertyId:null,
propertyTitle:"",
shares:"",
submitting:false,
error:""
});

const [successPopup,setSuccessPopup] = useState({
open:false,
message:""
});

useEffect(()=>{
loadProperties();
},[]);

const loadProperties = async ()=>{

try{

const res = await API.get("/property");

setProperties(res.data.properties);

}catch(err){

console.log(err);

}

};


/* ===============================
INVEST FUNCTION
=============================== */

const openInvestModal = (property)=>{
setInvestModal({
open:true,
propertyId:property.property_id,
propertyTitle:property.title,
shares:"",
submitting:false,
error:""
});
};

const closeInvestModal = ()=>{
setInvestModal(prev=>({
...prev,
open:false,
shares:"",
error:"",
submitting:false
}));
};

const showSuccessPopup = (message)=>{
setSuccessPopup({
open:true,
message
});

setTimeout(()=>{
setSuccessPopup({
open:false,
message:""
});
},2500);
};

const submitInvestment = async ()=>{

const sharesNumber = Number(investModal.shares);

if(!Number.isInteger(sharesNumber) || sharesNumber <= 0){
setInvestModal(prev=>({
...prev,
error:"Please enter a valid whole number of shares"
}));
return;
}

try{

setInvestModal(prev=>({
...prev,
submitting:true,
error:""
}));

const res = await API.post("/investments",{
property_id:investModal.propertyId,
shares:sharesNumber
});

closeInvestModal();
showSuccessPopup(res.data.message || "Investment successful");

}catch(err){

setInvestModal(prev=>({
...prev,
submitting:false,
error:err.response?.data?.message || "Investment failed"
}));

}

};


/* ===============================
AI PREDICTION
=============================== */

const getPrediction = async (property_id)=>{

try{

setLoadingAI(property_id);

const years = Number(investmentYears[property_id] || 1);

const res = await API.post("/ai/predict",{
property_id,
investment_years: years
});

setPrediction(prev=>({
...prev,
[property_id]:res.data.prediction
}));

setLoadingAI(null);

}catch(err){

console.log(err);
setLoadingAI(null);

}

};

const formatCurrency = (value)=>{

if(value === null || value === undefined || Number.isNaN(Number(value))){
return "N/A";
}

return `Rs ${Number(value).toLocaleString(undefined,{maximumFractionDigits:2})}`;

};

const formatPercent = (value)=>{

if(value === null || value === undefined || Number.isNaN(Number(value))){
return "N/A";
}

const n = Number(value);

return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;

};


return(

<div style={container}>

<h2 style={titleStyle}>Available Investments</h2>

<div style={grid}>

{properties.map((property)=>(

<div key={property.property_id} style={card}>

{/* ===============================
PROPERTY IMAGE
=============================== */}

<div style={imageContainer}>

<img
src={property.primary_image}
alt={property.title}
style={imageStyle}
/>

<div style={roiBadge}>
{property.roi}% ROI
</div>

</div>


{/* ===============================
PROPERTY INFO
=============================== */}

<div style={cardBody}>

<h3 style={propertyTitle}>
{property.title}
</h3>

<p style={locationStyle}>
{property.location}
</p>


<div style={priceRow}>

<div>

<p style={label}>Share Price</p>

<p style={value}>
Rs {Number(property.share_price).toLocaleString()}
</p>

</div>

<div>

<p style={label}>Available</p>

<p style={value}>
{property.available_shares}
</p>

</div>

</div>

<div style={horizonRow}>
<p style={label}>Investment Horizon</p>
<select
style={yearsSelect}
value={investmentYears[property.property_id] || 1}
onChange={(e)=>setInvestmentYears(prev=>({
...prev,
[property.property_id]: Number(e.target.value)
}))}
>
{[1,2,3,4,5,7,10,15,20].map((year)=>(
<option key={year} value={year}>{year} year{year > 1 ? "s" : ""}</option>
))}
</select>
</div>


{/* ===============================
ACTION BUTTONS
=============================== */}

<div style={buttonRow}>

<button
style={investBtn}
onClick={()=>openInvestModal(property)}
>
Invest
</button>

<button
style={predictBtn}
onClick={()=>getPrediction(property.property_id)}
>
{loadingAI===property.property_id ? "Predicting..." : "AI Insight"}
</button>

</div>


{/* ===============================
AI RESULT
=============================== */}

{prediction[property.property_id] && (

<div style={predictionCard}>

<p>
Current Value (Invested Base): {
formatCurrency(prediction[property.property_id].current_value)
}
</p>

<p>
Predicted Value After {prediction[property.property_id].investment_years || 1} Year{(prediction[property.property_id].investment_years || 1) > 1 ? "s" : ""}: {
formatCurrency(prediction[property.property_id].predicted_value)
}
</p>

<p>
Estimated Growth: {
formatCurrency(prediction[property.property_id].growth_amount)
} ({formatPercent(prediction[property.property_id].growth_percent)})
</p>

<p>
Per Share (Now -> Future): {
formatCurrency(prediction[property.property_id].current_per_share)
} -> {
formatCurrency(prediction[property.property_id].predicted_per_share)
}
</p>

<p>
Risk Score: {
Number(prediction[property.property_id].risk_score || 0).toFixed(2)
}
</p>

<p>
Risk Level: {
prediction[property.property_id].risk_score < 2
? "Low Risk"
: prediction[property.property_id].risk_score < 4
? "Medium Risk"
: "High Risk"
}
</p>

</div>

)}

</div>

</div>

))}

</div>

{investModal.open && (
<div style={modalBackdrop} onClick={closeInvestModal}>
<div style={modalCard} onClick={(e)=>e.stopPropagation()}>
<p style={modalTag}>Quick Invest</p>
<h3 style={modalTitle}>{investModal.propertyTitle}</h3>
<p style={modalSubTitle}>Enter number of shares to continue</p>

<input
style={modalInput}
value={investModal.shares}
autoFocus
placeholder="e.g. 5"
onChange={(e)=>setInvestModal(prev=>({
...prev,
shares:e.target.value,
error:""
}))}
/>

{investModal.error && (
<p style={modalError}>{investModal.error}</p>
)}

<div style={modalButtonRow}>
<button style={cancelBtn} onClick={closeInvestModal}>Cancel</button>
<button
style={confirmBtn}
disabled={investModal.submitting}
onClick={submitInvestment}
>
{investModal.submitting ? "Investing..." : "Confirm Investment"}
</button>
</div>
</div>
</div>
)}

{successPopup.open && (
<div style={successPopupCard}>
<div style={successDot}></div>
<div style={successContent}>
<p style={successTitle}>Investment Successful</p>
<p style={successMessage}>{successPopup.message}</p>
</div>
</div>
)}

</div>

);

}



/* ===============================
STYLES
=============================== */

const container={
display:"flex",
flexDirection:"column",
gap:"30px"
};

const titleStyle={
fontSize:"24px",
fontWeight:"600"
};

const grid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
gap:"25px"
};

const card={
background:"#fff",
borderRadius:"14px",
overflow:"hidden",
boxShadow:"0 6px 18px rgba(0,0,0,0.08)",
display:"flex",
flexDirection:"column"
};

const imageContainer={
position:"relative"
};

const imageStyle={
width:"100%",
height:"200px",
objectFit:"cover"
};

const roiBadge={
position:"absolute",
top:"10px",
right:"10px",
background:"#10b981",
color:"#fff",
padding:"6px 10px",
borderRadius:"6px",
fontSize:"12px"
};

const cardBody={
padding:"20px",
display:"flex",
flexDirection:"column",
gap:"15px"
};

const propertyTitle={
fontSize:"18px",
fontWeight:"600"
};

const locationStyle={
color:"#64748b",
fontSize:"14px"
};

const priceRow={
display:"flex",
justifyContent:"space-between"
};

const label={
fontSize:"12px",
color:"#64748b"
};

const value={
fontWeight:"600"
};

const horizonRow={
display:"flex",
justifyContent:"space-between",
alignItems:"center"
};

const yearsSelect={
padding:"8px 10px",
border:"1px solid #cbd5e1",
borderRadius:"8px",
fontSize:"13px",
background:"#fff",
color:"#111827"
};

const buttonRow={
display:"flex",
gap:"10px"
};

const investBtn={
flex:1,
padding:"10px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"8px",
cursor:"pointer"
};

const predictBtn={
flex:1,
padding:"10px",
background:"#111827",
color:"#fff",
border:"none",
borderRadius:"8px",
cursor:"pointer"
};

const predictionCard={
background:"#f1f5f9",
padding:"12px",
borderRadius:"8px",
fontSize:"13px",
display:"flex",
flexDirection:"column",
gap:"4px"
};

const modalBackdrop={
position:"fixed",
inset:0,
background:"rgba(10,15,30,0.58)",
backdropFilter:"blur(4px)",
WebkitBackdropFilter:"blur(4px)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:1200,
padding:"20px"
};

const modalCard={
width:"100%",
maxWidth:"460px",
background:"linear-gradient(160deg,#f8fbff 0%,#eef4ff 100%)",
border:"1px solid #dbeafe",
borderRadius:"18px",
boxShadow:"0 24px 65px rgba(15,23,42,0.25)",
padding:"24px",
display:"flex",
flexDirection:"column",
gap:"12px"
};

const modalTag={
fontSize:"11px",
fontWeight:"700",
letterSpacing:"0.08em",
textTransform:"uppercase",
color:"#1d4ed8",
margin:0
};

const modalTitle={
margin:0,
fontSize:"22px",
fontWeight:"700",
color:"#0f172a"
};

const modalSubTitle={
margin:0,
fontSize:"13px",
color:"#475569"
};

const modalInput={
marginTop:"6px",
width:"100%",
padding:"12px 14px",
fontSize:"16px",
borderRadius:"12px",
border:"1px solid #bfdbfe",
outline:"none",
background:"#fff",
color:"#0f172a"
};

const modalError={
margin:0,
color:"#b91c1c",
fontSize:"12px",
fontWeight:"500"
};

const modalButtonRow={
display:"flex",
gap:"10px",
marginTop:"8px"
};

const cancelBtn={
flex:1,
padding:"10px 12px",
borderRadius:"10px",
border:"1px solid #cbd5e1",
background:"#fff",
color:"#334155",
cursor:"pointer",
fontWeight:"600"
};

const confirmBtn={
flex:1,
padding:"10px 12px",
borderRadius:"10px",
border:"none",
background:"linear-gradient(135deg,#2563eb 0%,#0ea5e9 100%)",
color:"#fff",
cursor:"pointer",
fontWeight:"600"
};

const successPopupCard={
position:"fixed",
right:"22px",
bottom:"22px",
zIndex:1400,
display:"flex",
alignItems:"flex-start",
gap:"10px",
width:"320px",
padding:"14px 14px",
borderRadius:"14px",
background:"linear-gradient(160deg,#ecfdf5 0%,#d1fae5 100%)",
border:"1px solid #86efac",
boxShadow:"0 16px 40px rgba(16,185,129,0.25)"
};

const successDot={
width:"10px",
height:"10px",
borderRadius:"999px",
background:"#10b981",
marginTop:"6px",
flexShrink:0
};

const successContent={
display:"flex",
flexDirection:"column",
gap:"2px"
};

const successTitle={
margin:0,
fontSize:"14px",
fontWeight:"700",
color:"#065f46"
};

const successMessage={
margin:0,
fontSize:"13px",
color:"#065f46"
};
