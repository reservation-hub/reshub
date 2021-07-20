import { 
  PREFECTURE_REQUEST_FAILURE,
  PREFECTURE_REQUEST_SUCCESS 
} from "../types/prefectureTypes"

const initialState = {
  prefecture: {}
}

export const prefectureReducer = (
  state = initialState, action
) => {
  switch (action.type) {
    case PREFECTURE_REQUEST_SUCCESS:
      return { 
        ...state, 
        prefecture: action.payload 
      }
    case PREFECTURE_REQUEST_FAILURE:
      return action.payload || {}
    default:
      return state
  }
}
