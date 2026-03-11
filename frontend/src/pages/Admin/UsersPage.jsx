import React,{useEffect,useState} from "react";
import API from "../../services/api";

export default function UsersPage(){

const [users,setUsers] = useState([]);

useEffect(()=>{
loadUsers();
},[]);

const loadUsers = async ()=>{

try{

const res = await API.get("/admin/users");

if(res.data.success){
setUsers(res.data.users);
}

}catch(err){
console.log(err);
}

};

/* APPROVE KYC */

const approveKYC = async (user_id) => {

try{

const res = await API.put(`/admin/approve-kyc/${user_id}`);

alert(res.data.message);

loadUsers(); // reload table

}catch(err){

console.log(err);

alert("Failed to approve KYC");

}

};


/* REJECT KYC */

const rejectKYC = async (user_id) => {

try{

const res = await API.put(`/admin/reject-kyc/${user_id}`);

alert(res.data.message);

loadUsers(); // reload table

}catch(err){

console.log(err);

alert("Failed to reject KYC");

}

};

return (

<div style={container}>

<h2 style={title}>Users</h2>

<div style={tableCard}>

<table style={table}>

<thead>
<tr>
<th style={th}>Name</th>
<th style={th}>Email</th>
<th style={th}>KYC Status</th>
<th style={th}>Action</th>
</tr>
</thead>

<tbody>

{users.map((user)=>(
<tr key={user.user_id} style={row}>

<td style={td}>{user.full_name}</td>

<td style={td}>{user.email}</td>

<td style={td}>

<span style={
user.kyc_status==="approved"
? approvedBadge
: pendingBadge
}>
{user.kyc_status}
</span>

</td>

<td style={td}>

{user.kyc_status==="pending" && (

<div style={actionRow}>

<button
style={approveBtn}
onClick={()=>approveKYC(user.user_id)}
>
Approve
</button>

<button
style={rejectBtn}
onClick={()=>rejectKYC(user.user_id)}
>
Reject
</button>

</div>

)}

</td>

</tr>
))}

</tbody>

</table>

</div>

</div>

);

}

const container={
display:"flex",
flexDirection:"column",
gap:"25px"
};

const title={
fontSize:"24px",
fontWeight:"600"
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

const row={
transition:"0.2s"
};

const approvedBadge={
background:"#dcfce7",
color:"#15803d",
padding:"5px 10px",
borderRadius:"6px",
fontSize:"12px",
fontWeight:"500"
};

const pendingBadge={
background:"#fef3c7",
color:"#92400e",
padding:"5px 10px",
borderRadius:"6px",
fontSize:"12px",
fontWeight:"500"
};

const actionRow={
display:"flex",
gap:"10px"
};

const approveBtn={
padding:"6px 10px",
background:"#10b981",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
};

const rejectBtn={
padding:"6px 10px",
background:"#ef4444",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
};