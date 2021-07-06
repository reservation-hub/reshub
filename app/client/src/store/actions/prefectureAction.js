import apiEndpoint from '../../utils/api/axios'
import { 
  PREFECTURE_REQUEST_START,
  PREFECTURE_REQUEST_SUCCESS,
  PREFECTURE_REQUEST_FAILURE
} from '../types/prefectureTypes'

export const prefRequestStart = () => {
  return {
    type: PREFECTURE_REQUEST_START
  }
}

export const prefRequestFailure = (err) => {
  return {
    type: PREFECTURE_REQUEST_FAILURE,
    payload: err.response.data
  }
}

export const getPrefecture = () => async dispatch => {

  dispatch(prefRequestStart())
  try {
    const res = apiEndpoint.getPrefecture()
    dispatch({
      type: PREFECTURE_REQUEST_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    dispatch(prefRequestFailure(e))
  }
  
}

export const getOnePrefecture = (id) => async dispatch => {

  dispatch(prefRequestStart())
  try {
    const res = apiEndpoint.getOnePrefecture(id)
    dispatch({
      type: PREFECTURE_REQUEST_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    dispatch(prefRequestFailure(e))
  }

}