import React, { useEffect, useState } from "react";
import API from "../../services/api";

export default function TransactionsPage() {

const [transactions,setTransactions] = useState([]);
const [loading,setLoading] = useState(true);

useEffect(()=>{
fetchTransactions();
},[]);


const fetchTransactions = async ()=>{

try{

const res = await API.get("/transactions");

if(res.data.success){
setTransactions(res.data.transactions);
}

}catch(err){

console.log("Transaction error:",err.response?.data || err);

}finally{

setLoading(false);

}

};


return(

<div style={container}>

<h2 style={titleStyle}>Transactions</h2>

<div style={tableCard}>

{loading ? (

<p>Loading...</p>

) : transactions.length === 0 ? (

<p>No transactions found</p>

) : (

<table style={tableStyle}>

<thead style={tableHead}>

<tr>

<th>Type</th>
<th>Amount</th>
<th>Date</th>

</tr>

</thead>

<tbody>

{transactions.map((tx)=>{

const typeColor =
tx.type === "deposit"
? "#10b981"
: tx.type === "withdraw"
? "#ef4444"
: "#2563eb";

return(

<tr key={tx.transaction_id} style={tableRow}>

<td>

<span style={{
background:typeColor,
color:"#fff",
padding:"5px 10px",
borderRadius:"6px",
fontSize:"12px"
}}>

{tx.type}

</span>

</td>

<td style={{fontWeight:"600"}}>

₹ {Number(tx.amount).toLocaleString()}

</td>

<td>

{new Date(tx.created_at).toLocaleDateString()}

</td>

</tr>

);

})}

</tbody>

</table>

)}

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

const titleStyle={
fontSize:"24px",
fontWeight:"600"
};

const tableCard={
background:"#fff",
padding:"25px",
borderRadius:"12px",
boxShadow:"0 4px 12px rgba(0,0,0,0.08)",
width:"100%"
};

const tableStyle={
width:"100%",
borderCollapse:"collapse"
};

const tableHead={
background:"#f1f5f9",
textAlign:"left"
};

const tableRow={
borderBottom:"1px solid #eee"
};