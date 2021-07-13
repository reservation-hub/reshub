//----------------------------------
// redux action ユーザー印証管理関数
//----------------------------------

/**
 * こっちは現在保留中
 */

import apiEndpoint from '../../utils/api/axios'
import setAuthToken from '../../utils/setAuthToken'
import { 
  USER_REQUEST_START, 
  USER_REQUEST_SUCCESS, 
  USER_REQUEST_FAILURE 
} from '../types/authTypes'

export const userRequestStart = () => {
  return { 
    type: USER_REQUEST_START 
  }
}

export const userRequestFailure = (err) => {
  return {
    type: USER_REQUEST_FAILURE,
    payload: err.response.data
  }
}

export const loginStart = (email, password) => dispatch => {

  try {
    
    const res = apiEndpoint.localLogin(email, password)

    setAuthToken(res.data)

    console.log('token: ', res.data)

    dispatch({
      type: USER_REQUEST_SUCCESS,
      payload: res
    })
  } catch (e) {
    dispatch(userRequestFailure(e))
  }

}

export const googleLogin = (googleResponse) => async dispatch => {

  dispatch(userRequestStart())
  try {
    const { data: { user, token } } = await apiEndpoint.googleLogin(googleResponse.tokenId)
    
    dispatch({
      type: USER_REQUEST_SUCCESS,
      payload: user,
      token: token
    })
  } catch (e) {
    dispatch(userRequestFailure(e))
    console.log(e)
  }
}