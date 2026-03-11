import React,{useState} from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function Register(){

const [form,setForm] = useState({
name:"",
email:"",
password:""
});

const handleChange=(e)=>{
setForm({...form,[e.target.name]:e.target.value});
};

const handleRegister=async(e)=>{
e.preventDefault();

try{

await API.post("/auth/register",form);

alert("Account created successfully");

window.location.href="/login";

}catch(err){

alert(err.response?.data?.message || "Registration failed");

}

};

return(

<div className="min-h-screen flex">

<div className="hidden lg:flex w-1/2 bg-green-600 text-white items-center justify-center p-12">

<div>

<h1 className="text-4xl font-bold mb-4">
Start Investing Today
</h1>

<p className="text-lg opacity-90">
Join Nivestha and invest in premium real estate
with fractional ownership.
</p>

</div>

</div>


<div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50">

<form
onSubmit={handleRegister}
className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md"
>

<h2 className="text-2xl font-bold mb-6 text-gray-800">
Create your account
</h2>

<input
type="text"
name="name"
placeholder="Full Name"
className="w-full border p-3 rounded mb-4"
onChange={handleChange}
required
/>

<input
type="email"
name="email"
placeholder="Email"
className="w-full border p-3 rounded mb-4"
onChange={handleChange}
required
/>

<input
type="password"
name="password"
placeholder="Password"
className="w-full border p-3 rounded mb-6"
onChange={handleChange}
required
/>

<button
className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition"
>
Register
</button>

<p className="mt-4 text-sm text-gray-600">

Already have an account?

<Link
to="/login"
className="text-green-600 ml-1 font-medium"
>
Login
</Link>

</p>

</form>

</div>

</div>

);

}