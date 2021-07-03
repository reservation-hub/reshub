//----------------------------------
// redux お店状態管理 reducer
//----------------------------------

import { 
  SHOP_ADD_SUCCESS, 
  SHOP_DELETE_SUCCESS, 
  SHOP_EDIT_SUCCESS, 
  SHOP_FETCH_SUCCESS, 
  SHOP_GET_SUCCESS, 
  SHOP_REQUEST_FAILURE 
} from "../types/shopTypes"


const initialState = {
  loading: true,
  shops: {},
  shop: []
}

export const shopReducer = (state = initialState, action) => {
  switch (action.type) {
    case SHOP_FETCH_SUCCESS:
      return { 
        ...state, 
        loading:false, 
        shops: action.payload 
      }
    case SHOP_GET_SUCCESS:
      return { 
        ...state, 
        loading:false, 
        shop: action.payload 
      }
    case SHOP_ADD_SUCCESS:
      return { 
        ...state, 
        loading:false, 
        shops: [ action.payload ] 
      }
    case SHOP_EDIT_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        shops: [ action.payload ] 
      }
    case SHOP_DELETE_SUCCESS:
      return {
        ...state,
        shops: state.shop.filter(
          res => res._id !== action.payload
          )
      }
    case SHOP_REQUEST_FAILURE:
      return action.payload || state
    default:
      return state
  }
}
