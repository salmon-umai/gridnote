import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:3000",
  // ここに共通設定（必要に応じて）
  // timeout: 5000
});

// トークンを自動付与したい場合はここで拡張
api.interceptors.request.use(
  (config) => {
  const token = localStorage.getItem("token");
   if (token) config.headers.Authorization = `Bearer ${token}`;
     return config;
   },
  (error) => Promise.reject(error)

 );

console.log(api.defaults.baseURL);

export default api;