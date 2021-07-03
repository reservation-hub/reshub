//----------------------------------
// redux action types お店管理 
//----------------------------------


//　お店情報のリクエストをスタートする
export const SHOP_REQUEST_START = 'SHOP_REQUEST_START'

//　お店情報の取得成功する場合
export const SHOP_FETCH_SUCCESS = 'SHOP_FETCH_SUCCESS'
//　お店情報の取得成功する場合
export const SHOP_GET_SUCCESS = 'SHOP_GET_SUCCESS'
//　お店情報の登録成功の場合
export const SHOP_ADD_SUCCESS = 'SHOP_ADD_SUCCESS'
//　お店情報の修正成功の場合
export const SHOP_EDIT_SUCCESS = 'SHOP_EDIT_SUCCESS'
//　お店情報の削除成功の場合
export const SHOP_DELETE_SUCCESS = 'SHOP_DELETE_SUCCESS'

//　お店情報の取得・登録・修正・削除失敗の場合
export const SHOP_REQUEST_FAILURE = 'SHOP_REQUEST_FAILURE'