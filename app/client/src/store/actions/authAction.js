//----------------------------------
// redux action ユーザー印証管理関数
//----------------------------------

import apiEndpoint from '../../utils/api/axios'
import setAuthToken from '../../utils/setAuthToken'
import history from '../../utils/history'
import Cookies from 'js-cookie'
import { 
  USER_REQUEST_START, 
  USER_REQUEST_SUCCESS, 
  USER_REQUEST_FAILURE,
  LOGOUT_REQUEST_SUCCESS,
} from '../types/authTypes'

//ユーザーのリクエストをスタートするアクション
export const userRequestStart = () => {
  return { 
    type: USER_REQUEST_START 
  }
}

//ユーザーのリクエストが失敗の時に実行するアクション
export const userRequestFailure = err => {
  return {
    type: USER_REQUEST_FAILURE,
    payload: err.response.data
  }
}

// refresh tokenをサーバーに投げてユーザー情報をもらってくるアクション
export const silentLogin = () => async dispatch => {

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

// localログインを実行するアクション
export const loginStart = (email, password) => async dispatch => {

  try {
    const user = await apiEndpoint.localLogin(email, password)
    console.log(user)
    const token = user.data.token
    
    Cookies.set('refreshToken', token)
    setAuthToken(token)

    dispatch({
      type: USER_REQUEST_SUCCESS,
      payload: user.data.user
    })
  } catch (e) {
    dispatch(userRequestFailure(e))
  }

}

// googelログインを実行するアクション
export const googleLogin = googleResponse => async (dispatch) => {

  dispatch(userRequestStart())
  try {
    const user = await apiEndpoint.googleLogin(googleResponse.tokenId)
    const token = user.data.token

    Cookies.set('refreshToken', token)
    setAuthToken(token)

    dispatch({
      type: USER_REQUEST_SUCCESS,
      payload: user.data.user
    })

    history.push('/pre')
  } catch (e) {
    dispatch(userRequestFailure(e))
  }
  
}

//　ログアウトを実行するアクション
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