import React,{useState} from "react";
import API from "../../services/api";

export default function DepositForm({ refresh }){

const [amount,setAmount] = useState("");

const handleDeposit = async ()=>{

try{

await API.post("/wallet/deposit",{
amount:Number(amount)
});

alert("Deposit successful");

refresh();

}
catch(err){

console.log(err.response?.data);

}

};

return(

<div>

<h3>Deposit</h3>

<input
type="number"
placeholder="Amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
/>

<button onClick={handleDeposit}>
Deposit
</button>

</div>

);

}