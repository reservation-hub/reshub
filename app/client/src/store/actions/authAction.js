//----------------------------------
// redux action ユーザー印証管理関数
//----------------------------------

/**
 * こっちは現在保留中
 */

// import { 
//   USER_REQUEST_START, 
//   USER_REQUEST_SUCCESS, 
//   USER_REQUEST_FAILURE 
// } from '../types/authTypes'

// export const userRequestStart = () => {
//   return { type: USER_REQUEST_START }
// }

// export const userRequestFailure = (err) => {
//   return {
//     type: USER_REQUEST_FAILURE,
//     payload: err.response.data
//   }
// }

// export const userRequestSuccess = (res) => {
//   return {
//     type: USER_REQUEST_SUCCESS,
//     payload: res.data
//   }
// }

// export const loginStart = (userData) = async dispatch => {
//   dispatch(userRequestStart())

//   try {
//     dispatch(userRequestSuccess())
//   } catch (e) {
//     dispatch(e)
//   }
// }