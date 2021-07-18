import apiEndpoint from '../../utils/api/axios'
import { 
  AREA_REQUEST_START,
  AREA_REQUEST_SUCCESS,
  AREA_REQUEST_FAILURE
 } from '../types/areaTypes'

export const areaRequestStart = () => {
  return {
    type: AREA_REQUEST_START
  }
}

export const areaRequestFailure = err => {
  return {
    type: AREA_REQUEST_FAILURE,
    payload: err.response.data
  }
}

export const getArea = () => async dispatch => {
  
  dispatch(areaRequestStart())

  try {
    const res = await apiEndpoint.getArea()
    dispatch({
      type: AREA_REQUEST_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    dispatch(areaRequestFailure(e))
  }

}

export const getOneArea = id => async dispatch => {
  
  dispatch(areaRequestStart())

  try {
    const res = await apiEndpoint.getOneArea(id)
    dispatch({
      type: AREA_REQUEST_SUCCESS,
      payload: res.data
    })
  } catch (e) {
    dispatch(areaRequestFailure(e))
  }
  
}