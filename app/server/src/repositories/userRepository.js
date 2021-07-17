const { User } = require('../models/user')

module.exports = {
  async create(values) {
    let user = await new User(values)
    user.save()
    user = user.toObject()
    delete user.password
    return user
  },
  async findByProps(prop) {
    const param = Array.isArray(prop) ? { $or: prop } : prop
    return User.findOne(param).populate('roles').exec()
  },
  async addIdFromPassportProfile(user, profile) {
    switch (profile.provider) {
      case 'google':
        user.googleID = profile.id
        break
      case 'twitter':
        user.twitterID = profile.id
        break
      case 'line':
        user.lineID = profile.id
        break
      default:
        break
    }
    return user.save()
  },
}
