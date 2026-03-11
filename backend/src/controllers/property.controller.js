import pool from "../config/db.js";

/**
 * ===============================
 * ADMIN: Add new property
 * ===============================
 */
export const addProperty = async (req,res)=>{

const {title,location,description,total_value,total_shares} = req.body;
const images = req.file ? [req.file] : [];

if(images.length === 0){
return res.status(400).json({
success:false,
message:"Image required"
});
}

if(!title || !location || !total_value || !total_shares){
return res.status(400).json({
success:false,
message:"All required fields must be provided"
});
}

if(!images || images.length===0){
return res.status(400).json({
success:false,
message:"At least one property image is required"
});
}

const client = await pool.connect();

try{

await client.query("BEGIN");

const propertyResult = await client.query(
`
INSERT INTO properties
(title,location,description,total_value,total_shares,available_shares)
VALUES ($1,$2,$3,$4,$5,$5)
RETURNING property_id
`,
[title,location,description,total_value,total_shares]
);

const propertyId = propertyResult.rows[0].property_id;

for(let i=0;i<images.length;i++){

await client.query(
`
INSERT INTO property_images
(property_id,image_url,is_primary)
VALUES ($1,$2,$3)
`,
[
propertyId,
images[i].filename.replace("/uploads/",""),
i===0
]
);

}

await client.query("COMMIT");

res.status(201).json({
success:true,
message:"Property added successfully",
property_id:propertyId
});

}
catch(error){

await client.query("ROLLBACK");

console.error(error);

res.status(500).json({
success:false,
message:"Failed to add property"
});

}
finally{

client.release();

}

};



/**
 * ===============================
 * USER: View all properties
 * ===============================
 */
export const getAllProperties = async (req,res)=>{

try{

const result = await pool.query(
`
SELECT
p.property_id,
p.title,
p.location,
p.total_value,
p.total_shares,
p.available_shares,
ROUND(p.total_value / p.total_shares,2) AS share_price,
pi.image_url AS primary_image
FROM properties p
LEFT JOIN property_images pi
ON p.property_id = pi.property_id
AND pi.is_primary = true
WHERE p.status='open'
ORDER BY p.created_at DESC
`
);

const properties = result.rows.map(p=>{

let image = p.primary_image;

if(image){
image = image.replace("/uploads/","");
}

return{
...p,
roi:12,
primary_image: image
? `http://localhost:5000/uploads/${image}`
: null
};

});

res.json({
success:true,
properties
});

}
catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};



/**
 * ===============================
 * USER: Property details
 * ===============================
 */
export const getPropertyDetails = async (req,res)=>{

const {id} = req.params;

try{

const property = await pool.query(
`
SELECT *,
ROUND(total_value / total_shares,2) AS share_price
FROM properties
WHERE property_id=$1
`,
[id]
);

const images = await pool.query(
`
SELECT image_url,is_primary
FROM property_images
WHERE property_id=$1
ORDER BY is_primary DESC
`,
[id]
);

const imageUrls = images.rows.map(img=>{

let image = img.image_url.replace("/uploads/","");

return{
...img,
image_url:`http://localhost:5000/uploads/${image}`
};

});

res.json({
success:true,
property:{
...property.rows[0],
roi:12,
images:imageUrls
}
});

}
catch(err){

res.status(500).json({
success:false,
message:err.message
});

}

};