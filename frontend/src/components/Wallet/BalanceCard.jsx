import React from "react";

export default function BalanceCard({ balance }){

return(

<div style={{
border:"1px solid #ddd",
padding:"20px",
width:"300px",
borderRadius:"10px",
background:"#f4f6f8"
}}>

<h2>Wallet Balance</h2>

<h1>₹ {balance}</h1>

</div>

);

}