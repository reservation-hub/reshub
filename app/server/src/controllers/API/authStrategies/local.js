const { validationSchema: validator } = require('../../../models/user')

router.post('/signup', async (req, res, next) => {
  const { value, error } = validator.validate(req.body)
  if (error) return next(error)

  if (value.password !== value.confirm) return next({ code: 400, message: "Password did not match!" })
  delete value.confirm
  
  const duplicate = await UserRepository.findByProps([{ email: value.email }, { username: value.username }])
  if (duplicate) return next({code: 400, message: "Username / Email is already taken"})
  
  const hash = bcrypt.hashSync(value.password, saltRounds = 10)
  value.password = hash

  const user = await UserRepository.create(value)
  
  req.logIn(user, (err) => {
    if (err) return next(err)
    return res.send(user)
  })
})