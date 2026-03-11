import React,{useState} from "react";
import API from "../../services/api";

export default function WithdrawForm({ refresh }){

const [amount,setAmount] = useState("");

const handleWithdraw = async ()=>{

try{

await API.post("/wallet/withdraw",{
amount:Number(amount)
});

alert("Withdraw successful");

refresh();

}
catch(err){

console.log(err.response?.data);

}

};

return(

<div>

<h3>Withdraw</h3>

<input
type="number"
placeholder="Amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
/>

<button onClick={handleWithdraw}>
Withdraw
</button>

</div>

);

}