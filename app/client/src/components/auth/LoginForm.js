import React from 'react'
import { 
  Grid,
  Container,
  TextField,
  Typography 
} from '@material-ui/core'
import { FcGoogle } from 'react-icons/fc'
import { 
  FaFacebook,
  FaTwitter,
  FaLine 
} from 'react-icons/fa'
// import { Link } from 'react-router-dom'
import LoginStyle from './LoginStyle'
import CommonStyle from '../CommonStyle'

const Login = ({ value, setValue }) => {

  const login = LoginStyle()
  const common = CommonStyle()

  return (
    <main className={ login.loginRoot }>
      <div className={ common.bc }>
        {/* header area */}
        <Container 
          maxWidth='sm'
          align='right' 
          className={login.headerFooter}
        >
          <Typography variant='h4'>
            Reshub-Admin
          </Typography>
        </Container>
        {/* main contents */}
        <Container maxWidth='sm'className={ login.formBox }>
          <Grid 
            container 
            alignItems='center'
            spacing={ 2 }
            className={ common.h255 }
          >
            <Grid item xs>
              <form>
                <TextField 
                  label='email'
                  name='email'
                  autoComplete='off'
                  placeholder='Enter Email'
                  value={ value.email }
                  onChange={ setValue }
                  className={ login.input }
                  fullWidth
                />
                <TextField 
                  label='password'
                  name='password'
                  type='password'
                  autoComplete='off'
                  placeholder='Enter Password'
                  value={ value.password }
                  onChange={ setValue }
                  className={ 
                    login.public + 
                    ' ' + 
                    login.input 
                  }
                  fullWidth
                />
                <button className={ common.b1 }>
                  Login
                </button>
              </form>
            </Grid>
            <Grid 
              container 
              item 
              xs 
              align='center' 
              direction='column'
            >
              <a href='#' className={ common.a1 }> 
                <span>
                  { <FcGoogle /> }
                </span>
                <span>
                  Login with Google
                </span>
              </a>
              <a href='#' className={ common.a1 }>
                <span>
                  { <FaLine /> }
                </span>
                Login with Line
              </a>
              <a href='#' className={ common.a1 }>
                { <FaTwitter /> }
                Login with Twitter
              </a>
              <a href='#' className={ common.a1 }>
                { <FaFacebook /> }
                Login with Facebook
              </a>
            </Grid>
          </Grid>
        </Container>
        {/* footer area */}
        <Container 
          maxWidth='sm'
          className={login.headerFooter}
        >
          <Typography variant='h5'>
            Copyright 2021 Reshub
          </Typography>
        </Container>
      </div>
    </main> 
  )
}

export default Login
