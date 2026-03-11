import React, { useEffect, useState } from "react";
import API from "../../services/api";

export default function WalletPage() {

const [balance,setBalance] = useState(0);
const [amount,setAmount] = useState("");
const [transactions,setTransactions] = useState([]);

const [stats,setStats] = useState({
total_deposited:0,
total_withdrawn:0,
total_invested:0
});

useEffect(()=>{
loadWallet();
loadTransactions();
loadStats();
},[]);


/* LOAD WALLET BALANCE */

const loadWallet = async ()=>{

try{

const res = await API.get("/wallet");

setBalance(res.data.wallet.balance);

}catch(err){

console.log(err);

}

};


/* LOAD RECENT TRANSACTIONS */

const loadTransactions = async ()=>{

try{

const res = await API.get("/transactions");

setTransactions(res.data.transactions.slice(0,5));

}catch(err){

console.log(err);

}

};


/* LOAD WALLET STATS */

const loadStats = async ()=>{

try{

const res = await API.get("/wallet/stats");

if(res.data.success){
setStats(res.data.stats);
}

}catch(err){

console.log(err);

}

};


/* DEPOSIT */

const deposit = async ()=>{

try{

await API.post("/wallet/deposit",{amount:Number(amount)});

alert("Deposit successful");

setAmount("");

loadWallet();
loadTransactions();
loadStats();

}catch(err){

alert("Deposit failed");

}

};


/* WITHDRAW */

const withdraw = async ()=>{

try{

await API.post("/wallet/withdraw",{amount:Number(amount)});

alert("Withdraw successful");

setAmount("");

loadWallet();
loadTransactions();
loadStats();

}catch(err){

alert("Withdraw failed");

}

};


return(

<div style={walletContainer}>

<h2 style={titleStyle}>Wallet</h2>


{/* BALANCE + ACTION SECTION */}

<div style={topSection}>

{/* BALANCE CARD */}

<div style={balanceCard}>

<p style={balanceLabel}>Current Balance</p>

<h1 style={balanceValue}>
₹ {Number(balance).toLocaleString()}
</h1>

</div>


{/* ACTION CARD */}

<div style={actionCard}>

<input
type="number"
placeholder="Enter amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
style={inputStyle}
/>

<div style={{display:"flex",gap:"10px"}}>

<button style={depositBtn} onClick={deposit}>
Deposit
</button>

<button style={withdrawBtn} onClick={withdraw}>
Withdraw
</button>

</div>

</div>

</div>


{/* WALLET STATS */}

<div style={statsGrid}>

<div style={statCard}>
<p>Total Deposited</p>
<h3>₹ {Number(stats.total_deposited).toLocaleString()}</h3>
</div>

<div style={statCard}>
<p>Total Withdrawn</p>
<h3>₹ {Number(stats.total_withdrawn).toLocaleString()}</h3>
</div>

<div style={statCard}>
<p>Total Invested</p>
<h3>₹ {Number(stats.total_invested).toLocaleString()}</h3>
</div>

</div>


{/* RECENT TRANSACTIONS */}

<div style={transactionsCard}>

<h3 style={{marginBottom:"15px"}}>Recent Transactions</h3>

<table style={table}>

<thead>
<tr>
<th style={th}>Type</th>
<th style={th}>Amount</th>
<th style={th}>Date</th>
</tr>
</thead>

<tbody>

{transactions.map((tx)=>(
<tr key={tx.transaction_id}>

<td style={td}>
<span style={
tx.type==="deposit"
? depositBadge
: tx.type==="withdraw"
? withdrawBadge
: investmentBadge
}>
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
))}

</tbody>

</table>

</div>

</div>

);

}



/* ===== STYLES ===== */

const walletContainer={
display:"flex",
flexDirection:"column",
gap:"30px"
};

const titleStyle={
fontSize:"24px",
fontWeight:"600"
};

const topSection={
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"20px"
};

const balanceCard={
background:"#2563eb",
color:"#fff",
padding:"30px",
borderRadius:"12px",
boxShadow:"0 6px 18px rgba(0,0,0,0.1)"
};

const balanceLabel={
opacity:"0.8"
};

const balanceValue={
fontSize:"32px",
marginTop:"10px"
};

const actionCard={
background:"#fff",
padding:"25px",
borderRadius:"12px",
boxShadow:"0 4px 12px rgba(0,0,0,0.08)",
display:"flex",
flexDirection:"column",
gap:"15px"
};

const inputStyle={
padding:"10px",
borderRadius:"6px",
border:"1px solid #ddd"
};

const depositBtn={
flex:1,
padding:"10px",
background:"#10b981",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
};

const withdrawBtn={
flex:1,
padding:"10px",
background:"#ef4444",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
};

const statsGrid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
gap:"20px"
};

const statCard={
background:"#fff",
padding:"20px",
borderRadius:"10px",
boxShadow:"0 4px 10px rgba(0,0,0,0.08)"
};

const transactionsCard={
background:"#fff",
padding:"20px",
borderRadius:"12px",
boxShadow:"0 6px 16px rgba(0,0,0,0.08)"
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