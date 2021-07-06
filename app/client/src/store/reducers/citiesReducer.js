import { 
  CITIES_REQUEST_SUCCESS,
  CITIES_REQUEST_FAILURE 
} from "../types/citiesTypes"

const initialState = {
  cities: {}
}

export const citiesReducer = (
  state = initialState, action
) => {
  switch (action.type) {
    case CITIES_REQUEST_SUCCESS:
      return { 
        ...state, 
        cities: action.payload 
      }
    case CITIES_REQUEST_FAILURE:
      return action.payload || {}
    default:
      return state
  }
}
