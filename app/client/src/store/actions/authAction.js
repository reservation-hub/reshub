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
const userRequestStart = () => {
  return { 
    type: USER_REQUEST_START 
  }
}

const fetchUser = user => {
  return {
    type: USER_REQUEST_SUCCESS,
    user
  }
}

//ユーザーのリクエストが失敗の時に実行するアクション
const userRequestFailure = err => {
  return {
    type: USER_REQUEST_FAILURE,
    err
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
    dispatch(userRequestFailure(e.response.data))
  }

}

// localログインを実行するアクション
export const loginStart = (email, password) => async dispatch => {

  dispatch(userRequestStart())
  try {
    const user = await apiEndpoint.localLogin(email, password)
    const token = user.data.token
    
    Cookies.set('refreshToken', token)
    setAuthToken(token)

    dispatch(fetchUser(user.data.user))
  } catch (e) {
    dispatch(userRequestFailure(e.response.data))
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

    history.push('/pre')
  } catch (e) {
    dispatch(userRequestFailure(e.response.data))
  }
  
}

//　ログアウトを実行するアクション
export const logout = () => async dispatch => {

  dispatch(userRequestStart())
  try {
    const message = await apiEndpoint.logout()    
    Cookies.remove('refreshToken')

    dispatch({
      type: LOGOUT_REQUEST_SUCCESS,
      payload: message
    })
  } catch (e) {
    dispatch(userRequestFailure(e.response.data))
  }

}