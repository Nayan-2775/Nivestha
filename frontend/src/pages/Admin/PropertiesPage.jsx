import React,{useEffect,useState} from "react";
import API from "../../services/api";

export default function PropertiesPage(){

const [properties,setProperties] = useState([]);

const [form,setForm] = useState({
title:"",
location:"",
total_value:"",
total_shares:"",
roi:"",
description:"",
image:null
});

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

/* HANDLE INPUT */

const handleChange = (e)=>{
setForm({
...form,
[e.target.name]:e.target.value
});
};

/* HANDLE IMAGE */

const handleImage = (e)=>{
setForm({
...form,
image:e.target.files[0]
});
};

/* ADD PROPERTY */

const addProperty = async () => {

try{

const data = new FormData();

data.append("title",form.title);
data.append("location",form.location);
data.append("total_value",form.total_value);
data.append("total_shares",form.total_shares);
data.append("roi",form.roi);
data.append("description",form.description);
data.append("image",form.image);

await API.post("/admin/add-property",data,{
headers:{
"Content-Type":"multipart/form-data"
}
});

alert("Property added successfully");

setForm({
title:"",
location:"",
total_value:"",
total_shares:"",
roi:"",
description:"",
image:null
});

loadProperties();

}catch(err){
console.log(err);
}

};

return(

<div style={container}>

<h2 style={title}>Property Management</h2>

{/* ADD PROPERTY FORM */}

<div style={formCard}>

<h3 style={formTitle}>Add Property</h3>

<input
style={input}
name="title"
placeholder="Title"
value={form.title}
onChange={handleChange}
/>

<input
style={input}
name="location"
placeholder="Location"
value={form.location}
onChange={handleChange}
/>

<input
style={input}
name="total_value"
placeholder="Total Property Value"
value={form.total_value}
onChange={handleChange}
/>

<input
style={input}
name="total_shares"
placeholder="Total Shares"
value={form.total_shares}
onChange={handleChange}
/>

<input
style={input}
name="roi"
placeholder="ROI %"
value={form.roi}
onChange={handleChange}
/>

<input
type="file"
style={fileInput}
onChange={handleImage}
/>

<textarea
style={textarea}
name="description"
placeholder="Description"
value={form.description}
onChange={handleChange}
/>

<button
style={addBtn}
onClick={addProperty}
>
Add Property
</button>

</div>

{/* PROPERTY LIST */}

<h3 style={{marginTop:"40px"}}>All Properties</h3>

<div style={tableCard}>

<table style={table}>

<thead>

<tr>
<th style={th}>Title</th>
<th style={th}>Location</th>
<th style={th}>Price</th>
<th style={th}>Shares</th>
<th style={th}>ROI</th>
</tr>

</thead>

<tbody>

{properties.map((p)=>(

<tr key={p.property_id}>

<td style={td}>{p.title}</td>

<td style={td}>{p.location}</td>

<td style={td}>
₹ {Number(p.total_value).toLocaleString()}
</td>

<td style={td}>{p.total_shares}</td>

<td style={td}>
<span style={roiBadge}>
{p.roi}%
</span>
</td>

</tr>

))}

</tbody>

</table>

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

const formCard={
background:"#fff",
padding:"25px",
borderRadius:"12px",
boxShadow:"0 6px 16px rgba(0,0,0,0.08)",
display:"flex",
flexDirection:"column",
gap:"12px",
maxWidth:"420px"
};

const formTitle={
fontSize:"18px",
fontWeight:"600"
};

const input={
padding:"10px",
borderRadius:"8px",
border:"1px solid #e2e8f0",
fontSize:"14px"
};

const textarea={
padding:"10px",
borderRadius:"8px",
border:"1px solid #e2e8f0",
minHeight:"80px"
};

const fileInput={
fontSize:"14px"
};

const addBtn={
marginTop:"10px",
padding:"12px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"8px",
cursor:"pointer",
fontWeight:"500"
};

const tableCard={
background:"#fff",
borderRadius:"12px",
boxShadow:"0 6px 16px rgba(0,0,0,0.08)",
padding:"20px"
};

const table={
width:"100%",
borderCollapse:"collapse"
};

const th={
textAlign:"left",
padding:"12px",
borderBottom:"1px solid #e2e8f0",
fontSize:"14px",
color:"#64748b"
};

const td={
padding:"14px",
borderBottom:"1px solid #f1f5f9",
fontSize:"14px"
};

const roiBadge={
background:"#dcfce7",
color:"#15803d",
padding:"4px 8px",
borderRadius:"6px",
fontSize:"12px"
};