//----------------------------------
// api default settings 
//----------------------------------

import axios from 'axios'

// apiサーバーの基準になるUrl
const BASE_URL = process.env.REACT_APP_BASE_URL

const instance = axios.create({
  withCredentials: true,
  baseURL: BASE_URL
})

export default instance