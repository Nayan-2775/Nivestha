import {useEffect,useState} from "react";

import ApiClient from "../../context/ApiClient";


export default function PropertyList(){

const [properties,setProperties]=useState([]);


useEffect(()=>{

ApiClient.get("/property")

.then(res=>{

setProperties(res.data.properties);

});

},[]);


return(

<div>

{

properties.map(p=>(

<div key={p.property_id}>

<h3>{p.title}</h3>

<p>{p.location}</p>

<img

src={p.primary_image}

width="200"

/>

</div>

))

}

</div>

);

}