//----------------------------------
// redux reducer ユーザー印証 
//----------------------------------

/**
 * こっちは現在保留中
 */

import { 
  USER_REQUEST_FAILURE, 
  USER_REQUEST_SUCCESS 
} from "../types/authTypes"

const initialState = {
  loading: true,
  isAuthenticated: false,
  user: {},
  err: null
}

export const authReducer =  (state = initialState, action) => {
  switch (action.type) {
  case USER_REQUEST_SUCCESS:
    return { 
      ...state, 
      loading: false,
      isAuthenticated: true,
      user: action.payload
     }
    case USER_REQUEST_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated:false,
        err: action.payload
      }
  default:
    return state
  }
}
