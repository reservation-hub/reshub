import axios from 'axios'
import BASE_URL from './index'

const instance = axios.create({
  withCredentials: true,
  baseURL: BASE_URL
})

//-----------------------------------------------
// get method
//-----------------------------------------------

// 全てのデータをGETする
export const fetchAll = async () => await instance.get(
  `/`
)

// お店のデータをGETする
export const getShop = async () => await instance.get(
  `/shops`
)

// エリアデータをGETする
export const getArea = async () => await instance.get(
  `/area`
) 

// prefectureデータをGETする
export const getPrefecture = async () => await instance.get(
  `/prefecture`
)

// citisデータをGETする
export const getCities = async () => await instance.get(
  `/cities`
)


//-----------------------------------------------
// get one method
//-----------------------------------------------

//　お店データを一つだけGETする
export const getOneShop = async (id) => await instance.get(
  `/shops/${ id }`
)

//　エリアデータを一つだけGETする
export const getOneArea = async (id) => await instance.get(
  `/area/${ id }`
)

//　県データを一つだけGETする
export const getOnePrefecture = async (id) => await instance.get(
  `/prefecture/${ id }`
)

//　都市データを一つだけGETする
export const getOneCities = async (id) => await instance.get(
  `/cities/${ id }`
)

//-----------------------------------------------
// post method
//-----------------------------------------------

// add Shop data
export const addShop = async (shopData) => await instance.post(
  `/shops`, { ...shopData }
)

// patch Shop data
export const patchShop = async (id, shopData) => await instance.patch(
  `/shops/${ id }`, { ...shopData }
)

// put Shop data
export const putShop = async (id, shopData) => await instance.put(
  `/shops/${ id }`, { ...shopData }
)

// delete Shop data
export const deleteShop = async (id) => await instance.delete(
  `/shops/${ id }`
)

//-----------------------------------------------
// authenticate
//-----------------------------------------------

export const localLogin = async (email, password) => await instance.post(
  `/auth/test`, { email, password }
)

// export const googleLogin = async (tokenId) => await instance.request({
//   url: `/auth/google`,
//   method: "post",
//   data: { tokenId },
//   withCredentials: true
// })
export const googleLogin = async (tokenId) => await instance.post(
  `/auth/google`, { tokenId }
)

export const logout = async () => await instance.get(
  `/auth/logout`
)

const apiEndpoint = {
  fetchAll,
  getShop,
  getArea,
  getPrefecture,
  getCities,
  getOneShop,
  getOneArea,
  getOnePrefecture,
  getOneCities,
  addShop,
  patchShop,
  putShop,
  deleteShop,
  localLogin,
  googleLogin,
  logout
}

export default apiEndpoint