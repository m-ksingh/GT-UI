import axios from 'axios'
import { TokenService } from './storage.service'

const AxiosService = {

    init(baseURL) {
        axios.defaults.baseURL = baseURL;
        axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
    },

    setHeader() {
        axios.defaults.headers.common["Authorization"] = `Bearer ${TokenService.getToken()}`
        axios.defaults.headers.common["Authorization"] = `Bearer ${TokenService.getToken()}`
    },

    removeHeader() {
        axios.defaults.headers.common = {}
    },

    get(resource) {
        return axios.get(resource)
    },

    post(resource, data, params, headers) {
        const config = {
            headers: headers,
            params: params
        }
        return axios.post(resource, data, config)
    },

    put(resource, data) {
        return axios.put(resource, data)
    },

    delete(resource) {
        return axios.delete(resource)
    },

    uploadMultiPart(resource, formData) {
        return axios({
            method: "POST",
            url: resource,
            data: formData,
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });
    }
}

export default AxiosService