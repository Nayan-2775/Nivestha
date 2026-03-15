import React, { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

import {
AreaChart,
Area,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
ResponsiveContainer,
Legend
} from "recharts";

import {
Wallet,
TrendingUp,
Building,
HandCoins
} from "lucide-react";

const RANGE_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" }
];

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString()}`;

const compactCurrency = (value) => {
  const amount = Number(value || 0);

  if (Math.abs(amount) >= 10000000) {
    return `Rs ${(amount / 10000000).toFixed(1)}Cr`;
  }

  if (Math.abs(amount) >= 100000) {
    return `Rs ${(amount / 100000).toFixed(1)}L`;
  }

  if (Math.abs(amount) >= 1000) {
    return `Rs ${(amount / 1000).toFixed(0)}k`;
  }

  return `Rs ${amount.toFixed(0)}`;
};

export default function InvestorDashboard(){
  const [stats,setStats] = useState(null);
  const [range,setRange] = useState("month");
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    loadStats(range);
  },[range]);

  const loadStats = async (selectedRange)=>{
    try{
      setLoading(true);
      const res = await API.get(`/dashboard/stats?range=${selectedRange}`);
      setStats(res.data);
    }catch(err){
      console.log(err);
    }finally{
      setLoading(false);
    }
  };

  const chartSummary = useMemo(()=>{
    const growth = stats?.growth || [];

    return growth.reduce((acc,item)=>({
      invested: acc.invested + Number(item.invested || 0),
      rent_earned: acc.rent_earned + Number(item.rent_earned || 0)
    }),{ invested:0, rent_earned:0 });
  },[stats]);

  if(loading && !stats){
    return <p style={{padding:"20px"}}>Loading dashboard...</p>;
  }

  if(!stats){
    return <p style={{padding:"20px"}}>Unable to load dashboard.</p>;
  }

  const cardStyle={
    background:"#ffffff",
    padding:"22px",
    borderRadius:"18px",
    boxShadow:"0 16px 40px rgba(15,23,42,0.08)",
    display:"flex",
    flexDirection:"column",
    gap:"8px",
    border:"1px solid rgba(148,163,184,0.14)"
  };

  return(
    <div style={dashboardContainer}>
      <h2 style={titleStyle}>Investor Dashboard</h2>

      <div style={cardsGrid}>
        <div style={cardStyle}>
          <div style={cardHeader}>
            <Wallet size={20} color="#2563eb"/>
            <p style={labelStyle}>Wallet Balance</p>
          </div>
          <h2 style={valueStyle}>{formatCurrency(stats.wallet.balance)}</h2>
        </div>

        <div style={cardStyle}>
          <div style={cardHeader}>
            <TrendingUp size={20} color="#10b981"/>
            <p style={labelStyle}>Total Invested</p>
          </div>
          <h2 style={valueStyle}>{formatCurrency(stats.investments.total_invested)}</h2>
        </div>

        <div style={cardStyle}>
          <div style={cardHeader}>
            <HandCoins size={20} color="#f59e0b"/>
            <p style={labelStyle}>Rent Earned</p>
          </div>
          <h2 style={valueStyle}>{formatCurrency(stats.earnings.total_rent_earned)}</h2>
        </div>

        <div style={cardStyle}>
          <div style={cardHeader}>
            <Building size={20} color="#7c3aed"/>
            <p style={labelStyle}>Properties Invested</p>
          </div>
          <h2 style={valueStyle}>{stats.investments.properties}</h2>
        </div>
      </div>

      <div style={chartCard}>
        <div style={chartTopRow}>
          <div>
            <h3 style={chartTitle}>Portfolio Growth</h3>
            <p style={chartSubtitle}>
              Track how much you invested and how much rent income came back over time.
            </p>
          </div>

          <div style={filterBar}>
            {RANGE_OPTIONS.map((option)=>(
              <button
                key={option.value}
                type="button"
                onClick={()=>setRange(option.value)}
                style={{
                  ...filterButton,
                  ...(range === option.value ? activeFilterButton : {})
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div style={summaryStrip}>
          <div style={summaryPill}>
            <span style={summaryLabel}>Invested in selected range</span>
            <strong style={summaryValue}>{formatCurrency(chartSummary.invested)}</strong>
          </div>
          <div style={summaryPill}>
            <span style={summaryLabel}>Rent earned in selected range</span>
            <strong style={summaryValue}>{formatCurrency(chartSummary.rent_earned)}</strong>
          </div>
        </div>

        <div style={chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.growth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="investedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03}/>
                </linearGradient>
                <linearGradient id="rentFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.28}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.03}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" stroke="#dbe4f0" />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={compactCurrency} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={84} />
              <Tooltip
                formatter={(value, _name, item) => [formatCurrency(value), item?.name || "Value"]}
                labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                contentStyle={{ borderRadius: "14px", border: "1px solid #dbe4f0", boxShadow: "0 18px 40px rgba(15,23,42,0.12)" }}
              />
              <Legend />
              <Area type="monotone" dataKey="invested" name="Invested" stroke="#2563eb" strokeWidth={3} fill="url(#investedFill)" />
              <Area type="monotone" dataKey="rent_earned" name="Rent Earned" stroke="#10b981" strokeWidth={3} fill="url(#rentFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const dashboardContainer={
  display:"flex",
  flexDirection:"column",
  gap:"30px",
  width:"100%"
};

const titleStyle={
  fontSize:"26px",
  fontWeight:"600"
};

const cardsGrid={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",
  gap:"20px"
};

const cardHeader={
  display:"flex",
  alignItems:"center",
  gap:"10px"
};

const labelStyle={
  color:"#64748b"
};

const valueStyle={
  fontSize:"26px",
  fontWeight:"700"
};

const chartCard={
  background:"#ffffff",
  padding:"28px",
  borderRadius:"20px",
  boxShadow:"0 16px 40px rgba(15,23,42,0.08)",
  width:"100%",
  border:"1px solid rgba(148,163,184,0.14)"
};

const chartTopRow={
  display:"flex",
  justifyContent:"space-between",
  alignItems:"flex-start",
  gap:"16px",
  flexWrap:"wrap",
  marginBottom:"18px"
};

const chartTitle={
  marginBottom:"6px",
  fontWeight:"700",
  fontSize:"18px"
};

const chartSubtitle={
  color:"#64748b",
  margin:0,
  maxWidth:"520px",
  lineHeight:1.5
};

const filterBar={
  display:"flex",
  gap:"10px",
  flexWrap:"wrap"
};

const filterButton={
  border:"1px solid #cbd5e1",
  background:"#f8fafc",
  color:"#334155",
  padding:"10px 16px",
  borderRadius:"999px",
  cursor:"pointer",
  fontWeight:"600",
  transition:"all 0.2s ease"
};

const activeFilterButton={
  background:"linear-gradient(135deg,#2563eb,#1d4ed8)",
  border:"1px solid #1d4ed8",
  color:"#ffffff",
  boxShadow:"0 10px 20px rgba(37,99,235,0.22)"
};

const summaryStrip={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
  gap:"14px",
  marginBottom:"18px"
};

const summaryPill={
  background:"linear-gradient(135deg,#f8fbff,#eef6ff)",
  border:"1px solid #dbeafe",
  borderRadius:"16px",
  padding:"14px 16px",
  display:"flex",
  flexDirection:"column",
  gap:"6px"
};

const summaryLabel={
  color:"#64748b",
  fontSize:"13px"
};

const summaryValue={
  color:"#0f172a",
  fontSize:"18px"
};

const chartWrapper={
  width:"100%",
  height:"360px"
};
