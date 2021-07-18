//----------------------------------
// redux 全てのリデューサを定義する
//----------------------------------

import { combineReducers } from 'redux'
import { authReducer } from './authReducer'
import { shopReducer } from './shopReducer'
import { areaReducer } from './areaReducer'
import { prefectureReducer } from './prefectureReducer'
import { cityReducer } from './cityReducer'



export const rootReducer = combineReducers({
    auth: authReducer,
    shop: shopReducer,
    area: areaReducer,
    prefecture: prefectureReducer,
    city: cityReducer
  })


