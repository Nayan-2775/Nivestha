import React,{useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";

const ROLE_OPTIONS = [
  {
    value:"INVESTOR",
    title:"Investor",
    description:"Invest in listed properties and earn returns from fractional ownership."
  },
  {
    value:"ADMIN",
    title:"Admin / Property Lister",
    description:"List properties, manage fractional offers and distribute rental income."
  }
];

export default function Register(){
  const navigate = useNavigate();

  const [form,setForm] = useState({
    full_name:"",
    email:"",
    password:"",
    role:"INVESTOR"
  });
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  const handleChange=(e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleRegister=async(e)=>{
    e.preventDefault();
    setError("");

    try{
      setLoading(true);
      await API.post("/auth/register",form);
      navigate("/login");
    }catch(err){
      setError(err.response?.data?.message || "Registration failed");
    }finally{
      setLoading(false);
    }
  };

  return(
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-green-600 text-white items-center justify-center p-12">
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Build your real estate journey your way
          </h1>

          <p className="text-xl opacity-90 leading-9">
            Join Nivestha either as an investor looking for fractional ownership or as a property owner ready to list opportunities for the community.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 px-6 py-10">
        <form
          onSubmit={handleRegister}
          className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-xl border border-slate-100"
        >
          <h2 className="text-3xl font-bold mb-3 text-slate-800">
            Create your account
          </h2>

          <p className="text-slate-500 mb-6">
            Choose how you want to use Nivestha and we will set up the right account for you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {ROLE_OPTIONS.map((option)=>(
              <button
                key={option.value}
                type="button"
                onClick={()=>setForm({...form,role:option.value})}
                className={`text-left rounded-2xl border p-4 transition ${form.role === option.value ? "border-green-600 bg-green-50 shadow-md" : "border-slate-200 hover:border-green-300 hover:bg-slate-50"}`}
              >
                <p className="font-semibold text-slate-800 mb-2">{option.title}</p>
                <p className="text-sm text-slate-500 leading-6">{option.description}</p>
              </button>
            ))}
          </div>

          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            className="w-full border p-3 rounded-xl mb-4"
            value={form.full_name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border p-3 rounded-xl mb-4"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border p-3 rounded-xl mb-4"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition disabled:opacity-70"
          >
            {loading ? "Creating account..." : `Register as ${form.role === "ADMIN" ? "Admin" : "Investor"}`}
          </button>

          <p className="mt-5 text-sm text-gray-600">
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
