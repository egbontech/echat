import axios from "axios";
import { baseUrl } from "./baseURL";

const url = baseUrl

//base url to make request to api

const instance = axios.create({
    baseURL: `${url}/api/`,   
});

export default instance;