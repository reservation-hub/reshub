//----------------------------------
// redux action types お店管理 
//----------------------------------


//　お店情報のリクエストをスタートする
export const USERS_REQUEST_START = 'USERS_REQUEST_START'

//　お店情報の取得成功する場合
export const USERS_FETCH_SUCCESS = 'USERS_FETCH_SUCCESS'
//　お店情報の取得成功する場合
export const USERS_GET_SUCCESS = 'USERS_GET_SUCCESS'
//　お店情報の登録成功の場合
export const USERS_ADD_SUCCESS = 'USERS_ADD_SUCCESS'
//　お店情報の修正成功の場合
export const USERS_EDIT_SUCCESS = 'USERS_EDIT_SUCCESS'
//　お店情報の削除成功の場合
export const USERS_DELETE_SUCCESS = 'USERS_DELETE_SUCCESS'

//　お店情報の取得・登録・修正・削除失敗の場合
export const USERS_REQUEST_FAILURE = 'USERS_REQUEST_FAILURE'