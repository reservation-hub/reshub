import { 
  CITY_REQUEST_SUCCESS,
  CITY_REQUEST_FAILURE 
} from "../types/cityTypes"

const initialState = {
  city: {}
}

export const cityReducer = (
  state = initialState, action
) => {
  switch (action.type) {
    case CITY_REQUEST_SUCCESS:
      return { 
        ...state, 
        city: action.payload 
      }
    case CITY_REQUEST_FAILURE:
      return action.payload || {}
    default:
      return state
  }
}
