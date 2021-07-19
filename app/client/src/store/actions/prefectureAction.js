import apiEndpoint from '../../utils/api/apiEndpoint'
import { 
  PREFECTURE_REQUEST_START,
  PREFECTURE_REQUEST_SUCCESS,
  PREFECTURE_REQUEST_FAILURE
} from '../types/prefectureTypes'

const prefRequestStart = () => {
  return {
    type: PREFECTURE_REQUEST_START
  }
}

const fetchPrefecture = prefecture => {
  return {
    type: PREFECTURE_REQUEST_SUCCESS,
    payload: prefecture
  }
}

const prefRequestFailure = err => {
  return {
    type: PREFECTURE_REQUEST_FAILURE,
    err
  }
}

export const getPrefecture = () => async dispatch => {

  dispatch(prefRequestStart())
  try {
    const res = await apiEndpoint.getPrefecture()
    dispatch(fetchPrefecture(res.data))
  } catch (e) {
    dispatch(prefRequestFailure(e.response.data))
  }
  
}

export const getOnePrefecture = id => async dispatch => {

  dispatch(prefRequestStart())
  try {
    const res = await apiEndpoint.getOnePrefecture(id)
    dispatch(fetchPrefecture(res.data))
  } catch (e) {
    dispatch(prefRequestFailure(e.response.data))
  }

}