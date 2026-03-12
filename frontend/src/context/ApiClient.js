import axios from "axios";

const ApiClient = axios.create({

  baseURL: "http://localhost:5000/api",

});


ApiClient.interceptors.request.use(

(config) => {

const token =
sessionStorage.getItem("token");

if(token){

config.headers.Authorization =
`Bearer ${token}`;

}

return config;

}

);


export default ApiClient;
