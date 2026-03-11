import React from "react";

export default function Footer(){

return(

<footer
style={{
marginTop:"auto",
background:"#0f172a",
color:"#fff",
padding:"18px 30px",
display:"flex",
justifyContent:"space-between",
alignItems:"center",
fontSize:"14px",
borderTop:"1px solid #334155"
}}
>

<div>
© {new Date().getFullYear()} Nivestha
</div>

<div
style={{
display:"flex",
gap:"20px"
}}
>

<span style={{cursor:"pointer"}}>Privacy</span>
<span style={{cursor:"pointer"}}>Terms</span>
<span style={{cursor:"pointer"}}>Support</span>

</div>

</footer>

);

}