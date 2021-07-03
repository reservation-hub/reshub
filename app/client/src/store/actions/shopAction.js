//----------------------------------
// redux action お店情報管理関数
//----------------------------------

import apiEndpoint from '../../utils/api/axios'
import { 
  SHOP_ADD_SUCCESS, 
  SHOP_DELETE_SUCCESS, 
  SHOP_EDIT_SUCCESS, 
  SHOP_FETCH_SUCCESS,
  SHOP_GET_SUCCESS, 
  SHOP_REQUEST_FAILURE, 
  SHOP_REQUEST_START 
} from '../types/shopTypes'

// リクエストを始まる
export const shopRequestStart = () => {

  return { 
    type: SHOP_REQUEST_START 
  }

}

//　リクエストが失敗したらこっち
export const shopRequestFaliure = (err) => {

  return {
    type: SHOP_REQUEST_FAILURE,
    payload: err.response.data
  }

} 

//　全てのお店データを読み込む
export const fetchShopList = () => async dispatch => {

  dispatch(shopRequestStart())
  try {
    const res = apiEndpoint.getShop()
    dispatch({
      type: SHOP_FETCH_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    dispatch(shopRequestFaliure(e))
  }

}

//　お店データを一つだけ読み込む
export const getOneShop = (id) => async dispatch => {

  dispatch(shopRequestStart())
  try {
    const res = apiEndpoint.getOneShop(id)
    dispatch({
      type: SHOP_GET_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    dispatch(shopRequestFaliure(e))
  }

}

//　お店データを追加する
export const addShop = (shopData) => async dispatch => {

  dispatch(shopRequestStart())
  try {
    const res = apiEndpoint.addShop(shopData)
    dispatch({
      type: SHOP_ADD_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    dispatch(shopRequestFaliure(e))
  }

}

//　お店のデータを編集する
export const editShopData = (id, shopData) => async dispatch => {

  dispatch(shopRequestStart())
  try {
    const res = apiEndpoint.patchShop(id, shopData)
    dispatch({
      type: SHOP_EDIT_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    dispatch(shopRequestFaliure(e))
  }

}

//　お店のデータを削除する
export const deleteShopData = (id) => async dispatch => {

  dispatch(shopRequestStart())
  try {
    const res = apiEndpoint.deleteShop(id)
    dispatch({
      type: SHOP_DELETE_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    dispatch(shopRequestFaliure(e))
  }

}