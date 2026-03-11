import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function Login() {

const navigate = useNavigate();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const handleLogin = async (e)=>{
e.preventDefault();

try{

const res = await API.post("/auth/login",{
email,
password
});

// save token
localStorage.setItem("token", res.data.token);

// ⭐ save user info
localStorage.setItem(
"user",
JSON.stringify(res.data.user)
);

const role = res.data.user.role;

if(role === "ADMIN"){
navigate("/admin/dashboard");
}else{
navigate("/dashboard");
}

}catch(err){

alert(err.response?.data?.message || "Login failed");

}

};

return(

<div className="min-h-screen flex">

{/* Left Side Branding */}
<div className="hidden lg:flex w-1/2 bg-blue-600 text-white items-center justify-center p-12">

<div>

<h1 className="text-4xl font-bold mb-4">
Welcome to Nivestha
</h1>

<p className="text-lg opacity-90">
Invest in premium real estate with fractional ownership.
Grow your wealth securely.
</p>

</div>

</div>


{/* Right Side Form */}
<div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50">

<form
onSubmit={handleLogin}
className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md"
>

<h2 className="text-2xl font-bold mb-6 text-gray-800">
Login to your account
</h2>

<input
type="email"
placeholder="Email"
className="w-full border p-3 rounded mb-4"
value={email}
onChange={(e)=>setEmail(e.target.value)}
required
/>

<input
type="password"
placeholder="Password"
className="w-full border p-3 rounded mb-6"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
/>

<button
className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
>
Login
</button>

<p className="mt-4 text-sm text-gray-600">

Don't have an account?

<Link
to="/register"
className="text-blue-600 ml-1 font-medium"
>
Register
</Link>

</p>

</form>

</div>

</div>

);

}