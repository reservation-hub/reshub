//----------------------------------
// redux 全てのリデューサを定義する
//----------------------------------

import { combineReducers } from 'redux'
import { authReducer } from './authReducer'
import { shopReducer } from './shopReducer'

export const rootReducer = combineReducers({
    // auth: authReducer,
    shop: shopReducer
  })
