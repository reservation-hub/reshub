//----------------------------------
// redux ユーザー状態管理 reducer
//----------------------------------

import { 
  USERS_FETCH_SUCCESS,
  USERS_GET_SUCCESS,
  USERS_ADD_SUCCESS,
  USERS_EDIT_SUCCESS,
  USERS_DELETE_SUCCESS,
  USERS_REQUEST_FAILURE
} from "../types/usersType"


const initialState = {
  loading: true,
  users: {},
  user: []
}

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USERS_FETCH_SUCCESS:
      return { 
        ...state, 
        loading:false, 
        users: action.payload 
      }
    case USERS_GET_SUCCESS:
      return { 
        ...state, 
        loading:false, 
        user: action.payload 
      }
    case USERS_ADD_SUCCESS:
      return { 
        ...state, 
        loading:false, 
        users: [ action.payload ] 
      }
    case USERS_EDIT_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        users: [ action.payload ] 
      }
    case USERS_DELETE_SUCCESS:
      return {
        ...state,
        users: state.shop.filter(
          res => res._id !== action.payload
          )
      }
    case USERS_REQUEST_FAILURE:
      return action.payload || state
    default:
      return state
  }
}
