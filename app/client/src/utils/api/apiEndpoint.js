import instance from './index'

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
  `/prefectures`
)

// citisデータをGETする
export const getCities = async () => await instance.get(
  `/cities`
)

export const getUsers = async () => await instance.get(
  `/users`
)


//-----------------------------------------------
// get one method
//-----------------------------------------------

//　お店データを一つだけGETする
export const getOneShop = async id => await instance.get(
  `/shops/${ id }`
)

export const getOneUsers = async id => await instance.get(
  `/users/${ id }`
)

//-----------------------------------------------
// Crud method
//-----------------------------------------------

// add Shop data
export const addShop = async shopData => await instance.post(
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
export const deleteShop = async id => await instance.delete(
  `/shops/${ id }`
)

// ユーザー追加
export const addUser = async userData => await instance.post(
  `/users`, { ...userData }
)

// ユーザー修正
export const patchUser = async (id, userData) => await instance.patch(
  `/users/${ id }`, { ...userData }
)

// ユーザー修正
export const putUser = async (id, userData) => await instance.put(
  `/users/${ id }`, { ...userData }
)

// ユーザー削除
export const deleteUser = async id => await instance.delete(
  `/users/${ id }`
)

//-----------------------------------------------
// authenticate
//-----------------------------------------------

export const localLogin = async (email, password) => await instance.post(
  `/auth/login`, { email, password }
)

export const googleLogin = async tokenId => await instance.post(
  `/auth/google`, { tokenId }
)

export const silentRefresh = async () => await instance.post(
  `/auth/silent_refresh`
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
  getUsers,
  getOneShop,
  getOneUsers,
  addShop,
  patchShop,
  putShop,
  deleteShop,
  addUser,
  patchUser,
  putUser,
  deleteUser,
  localLogin,
  googleLogin,
  silentRefresh,
  logout,
  instance
}

export default apiEndpoint