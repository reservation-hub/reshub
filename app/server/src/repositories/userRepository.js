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
        if (!user.googleID) user.googleID = profile.id
        break
      case 'twitter':
        if (!user.twitterID) user.twitterID = profile.id
        break
      case 'line':
        if (!user.lineID) user.lineID = profile.id
        break
      default:
        return user
    }
    return user.save()
  },
}
