import React,{useEffect,useState} from "react";
import API from "../../services/api";

import BalanceCard from "../../components/Wallet/BalanceCard";
import DepositForm from "../../components/Wallet/DepositForm";
import WithdrawForm from "../../components/Wallet/WithdrawForm";
import TransactionTable from "../../components/Transactions/TransactionTable";

export default function Dashboard(){

const [balance,setBalance] = useState(0);
const [transactions,setTransactions] = useState([]);

const loadData = async ()=>{

try{

const walletRes = await API.get("/wallet");

setBalance(Number(walletRes.data.wallet.balance));

const txRes = await API.get("/wallet/transactions");

setTransactions(txRes.data.transactions);

}
catch(err){

console.log(err.response?.data);

}

};

useEffect(()=>{
loadData();
},[]);

return(

<div style={{padding:"20px"}}>

<h1>Investor Dashboard</h1>

<br/>

<BalanceCard balance={balance}/>

<br/>

<DepositForm refresh={loadData}/>

<br/>

<WithdrawForm refresh={loadData}/>

<br/>

<h2>Transactions</h2>

<TransactionTable transactions={transactions}/>

</div>

);

}