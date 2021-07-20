//----------------------------------
// redux action ユーザー印証管理関数
//----------------------------------

import apiEndpoint from '../../utils/api/apiEndpoint'
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
const loginRequestStart = () => {
  return { 
    type: USER_REQUEST_START 
  }
}

const fetchUser = user => {
  return {
    type: USER_REQUEST_SUCCESS,
    payload: user
  }
}

//ユーザーのリクエストが失敗の時に実行するアクション
const loginRequestFailure = err => {
  return {
    type: USER_REQUEST_FAILURE,
    payload: err
  }
}

// refresh tokenをサーバーに投げてユーザー情報をもらってくるアクション
export const silentLogin = () => async dispatch => {

  try {
    const user = await apiEndpoint.silentRefresh()
    const token = user.data.token
    
    Cookies.set('refreshToken', token)
    setAuthToken(Cookies.get('refreshToken'))
    
    dispatch(fetchUser(user.data.user))
  } catch (e) {
    dispatch(loginRequestFailure(e.response.data))
  }

}

// localログインを実行するアクション
export const loginStart = (email, password) => async dispatch => {

  dispatch(loginRequestStart())
  try {
    const user = await apiEndpoint.localLogin(email, password)
    const token = user.data.token
    
    Cookies.set('refreshToken', token)
    setAuthToken(token)

    dispatch(fetchUser(user.data.user))

    history.push('/')
  } catch (e) {
    dispatch(loginRequestFailure(e.response.data))
  }

}

// googelログインを実行するアクション
export const googleLogin = googleResponse => async (dispatch) => {

  try {
    const user = await apiEndpoint.googleLogin(googleResponse.tokenId)
    const token = user.data.token

    Cookies.set('refreshToken', token)
    setAuthToken(token)

    dispatch(fetchUser(user.data.user))

    history.push('/')
  } catch (e) {
    dispatch(loginRequestFailure(e.response.data))
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

    history.push('/')
  } catch (e) {
    dispatch(loginRequestFailure(e.response.data))
  }

}