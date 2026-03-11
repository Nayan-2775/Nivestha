import React, { useEffect, useState } from "react";
import API from "../../services/api";

export default function AdminTransactionsPage(){

const [transactions,setTransactions] = useState([]);

useEffect(()=>{
loadTransactions();
},[]);

/* LOAD TRANSACTIONS */

const loadTransactions = async ()=>{

try{

const res = await API.get("/admin/transactions");

if(res.data.success){
setTransactions(res.data.transactions);
}

}catch(err){
console.log(err);
}

};

return(

<div style={container}>

<h2 style={title}>Transactions</h2>

<div style={tableCard}>

<table style={table}>

<thead>

<tr>
<th style={th}>User</th>
<th style={th}>Type</th>
<th style={th}>Amount</th>
<th style={th}>Date</th>
</tr>

</thead>

<tbody>

{transactions.map((tx)=>{

const typeColor =
tx.type === "deposit"
? depositBadge
: tx.type === "withdraw"
? withdrawBadge
: investmentBadge;

return(

<tr key={tx.transaction_id}>

<td style={td}>{tx.full_name}</td>

<td style={td}>
<span style={typeColor}>
{tx.type}
</span>
</td>

<td style={td}>
₹ {Number(tx.amount).toLocaleString()}
</td>

<td style={td}>
{new Date(tx.created_at).toLocaleDateString()}
</td>

</tr>

);

})}

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

const depositBadge={
background:"#dcfce7",
color:"#15803d",
padding:"4px 8px",
borderRadius:"6px",
fontSize:"12px"
};

const withdrawBadge={
background:"#fee2e2",
color:"#b91c1c",
padding:"4px 8px",
borderRadius:"6px",
fontSize:"12px"
};

const investmentBadge={
background:"#dbeafe",
color:"#1d4ed8",
padding:"4px 8px",
borderRadius:"6px",
fontSize:"12px"
};