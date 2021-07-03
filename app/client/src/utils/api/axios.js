import axios from 'axios'
import BASE_URL from './index'

//-----------------------------------------------
// get method
//-----------------------------------------------

// 全てのデータをGETする
export const fetchAll = async () => await axios.get(
  `${ BASE_URL }/`
)

// お店のデータをGETする
export const getShop = async () => await axios.get(
  `${ BASE_URL }/shops`
)

// エリアデータをGETする
export const getArea = async () => await axios.get(
  `${ BASE_URL }/area`
) 

// prefectureデータをGETする
export const getPrefecture = async () => await axios.get(
  `${ BASE_URL }/prefecture`
)

// citisデータをGETする
export const getCities = async () => await axios.get(
  `${ BASE_URL }/cities`
)


//-----------------------------------------------
// get one method
//-----------------------------------------------

//　お店データを一つだけGETする
export const getOneShop = async (id) => await axios.get(
  `${ BASE_URL }/shops/${ id }`
)

//　エリアデータを一つだけGETする
export const getOneArea = async (id) => await axios.get(
  `${ BASE_URL }/area/${ id }`
)

//　県データを一つだけGETする
export const getOnePrefecture = async (id) => await axios.get(
  `${ BASE_URL }/prefecture/${ id }`
)

//　都市データを一つだけGETする
export const getOneCities = async (id) => await axios.get(
  `${ BASE_URL }/cities/${ id }`
)

//-----------------------------------------------
// post method
//-----------------------------------------------

// add Shop data
export const addShop = async (shopData) => await axios.post(
  `${ BASE_URL }/shops`, { ...shopData }
)

// patch Shop data
export const patchShop = async (id, shopData) => await axios.patch(
  `${ BASE_URL }/shops/${ id }`, { ...shopData }
)

// put Shop data
export const putShop = async (id, shopData) => await axios.put(
  `${ BASE_URL }/shops/${ id }`, { ...shopData }
)

// delete Shop data
export const deleteShop = async (id) => await axios.delete(
  `${ BASE_URL }/shops/${ id }`
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
  deleteShop
}

export default apiEndpoint