//----------------------------------
// redux action ユーザー印証管理関数
//----------------------------------

import apiEndpoint from '../../utils/api/axios'
import setAuthToken from '../../utils/setAuthToken'
import Cookies from 'js-cookie'
import { 
  USER_REQUEST_START, 
  USER_REQUEST_SUCCESS, 
  USER_REQUEST_FAILURE,
  LOGOUT_REQUEST_SUCCESS,
} from '../types/authTypes'

export const userRequestStart = () => {
  return { 
    type: USER_REQUEST_START 
  }
}

export const userRequestFailure = err => {
  return {
    type: USER_REQUEST_FAILURE,
    payload: err.response.data
  }
}

export const sr = () => async dispatch => {
  try {
    const user = await apiEndpoint.silentRefresh()
    const token = user.data.token
    
    Cookies.set('refreshToken', token)
    setAuthToken(Cookies.get('refreshToken'))
    
    dispatch({
      type: USER_REQUEST_SUCCESS,
      payload: user.data.user
    })
  } catch (e) {
    console.log(e.response)
  }

}

export const loginStart = (email, password) => async dispatch => {

  try {
    
    const user = await apiEndpoint.localLogin(email, password)
    const token = user.data.token
    
    // setAuthToken(Cookies.get('refreshToken'))

    // dispatch(userRequestSuccess(token, user.data.user))
  } catch (e) {
    dispatch(userRequestFailure(e))
  }

}

export const googleLogin = googleResponse => async (dispatch) => {

  dispatch(userRequestStart())
  try {
    const user = await apiEndpoint.googleLogin(googleResponse.tokenId)
    const token = user.data.token
    Cookies.set('refreshToken', token)
    setAuthToken(Cookies.get('refreshToken'))

    dispatch({
      type: USER_REQUEST_SUCCESS,
      payload: user.data.user
    })
  } catch (e) {
    dispatch(userRequestFailure(e))
    console.log(e)
  }
}

export const logout = () => async dispatch => {
  try {
    const message = await apiEndpoint.logout()    
    Cookies.remove('refreshToken')

    dispatch({
      type: LOGOUT_REQUEST_SUCCESS,
      payload: message
    })
  } catch (e) {
    dispatch(userRequestFailure(e))
  }

}