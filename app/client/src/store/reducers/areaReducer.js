import { 
  AREA_REQUEST_FAILURE, 
  AREA_REQUEST_SUCCESS
} from "../types/areaTypes"

const initialState = {
  area: {}
}

export const citiesReducer = (
  state = initialState, action
) => {
  switch (action.type) {
    case AREA_REQUEST_SUCCESS:
      return { 
        ...state, 
        area: action.payload 
      }
    case AREA_REQUEST_FAILURE:
      return action.payload || {}
    default:
      return state
  }
}
