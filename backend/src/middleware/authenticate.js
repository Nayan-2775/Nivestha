import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export default async function authenticate(req, res, next){

try{

const authHeader = req.headers.authorization;

if(!authHeader){
return res.status(401).json({ message:"No token provided" });
}

const token = authHeader.split(" ")[1];

const decoded = jwt.verify(
token,
process.env.JWT_SECRET,
{
algorithms:["HS256"],
issuer:"nivestha-api"
}
);

const roleResult = await pool.query(
`
SELECT r.role_name
FROM user_roles ur
JOIN roles r
ON ur.role_id = r.role_id
WHERE ur.user_id=$1
`,
[decoded.user_id]
);

req.user = {
user_id: decoded.user_id,
role: roleResult.rows.length ? roleResult.rows[0].role_name : null
};

next();

}
catch(err){

console.log("JWT ERROR:",err.message);

return res.status(401).json({
message:"Invalid token"
});

}
}