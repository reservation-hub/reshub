import { instance } from '../utils/api/axios'

const setAuthToken = token => {
  if (token) {
    instance.defaults.headers.common['Authorization'] = token
  } else {
    delete instance.defaults.headers.common['Authorization']
  }
}

export default setAuthToken