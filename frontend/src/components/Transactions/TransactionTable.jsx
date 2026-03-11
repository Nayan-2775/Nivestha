import React from "react";

export default function TransactionTable({ transactions }){

return(

<table border="1">

<thead>

<tr>
<th>Type</th>
<th>Amount</th>
<th>Date</th>
</tr>

</thead>

<tbody>

{transactions.map((t)=>(
<tr key={t.transaction_id}>

<td>{t.type}</td>

<td>₹ {t.amount}</td>

<td>{new Date(t.created_at).toLocaleString()}</td>

</tr>
))}

</tbody>

</table>

);

}