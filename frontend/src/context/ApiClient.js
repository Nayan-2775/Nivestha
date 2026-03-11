import axios from "axios";

const ApiClient = axios.create({

  baseURL: "http://localhost:5000/api",

});


ApiClient.interceptors.request.use(

(config) => {

const token =
localStorage.getItem("token");

if(token){

config.headers.Authorization =
`Bearer ${token}`;

}

return config;

}

);


export default ApiClient;