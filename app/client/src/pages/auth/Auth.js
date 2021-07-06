import React from 'react'
import Login from '../../components/auth/LoginForm'
import useInput from '../../utils/useInput'

const Auth = () => {

  const [value, setValue] = useInput({
    email: '', password: ''
  })
  
  return(
    <Login value={ value } setValue={ setValue } />
  ) 
}

export default Auth