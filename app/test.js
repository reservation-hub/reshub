const UserRepository = require('./src/repositories/UserRepository')
const RoleRepository = require('./src/repositories/RoleRepository');

(async () => {
  try {
    // TODO Fix user controller and repository 
    const { value: user } = await UserRepository.findByProps({ id: 1 })
    const userRoleIDs = user.roles.map(role => role.roleID)
    const requestRoles = [1, 2, 3]
    const { value: validRoleIDs } = await RoleRepository.extractValidRoleIDs(requestRoles)
    const rolesToAdd = validRoleIDs.filter(validRoleID => userRoleIDs.indexOf(validRoleID) === -1)
    const rolesToRemove = userRoleIDs.filter(uuid => validRoleIDs.indexOf(uuid) === -1)

    console.log(rolesToAdd, rolesToRemove)
    console.log('valid roles', validRoleIDs)
    console.log('user roles', userRoleIDs)
    console.log('roles to add : ', rolesToAdd)
    console.log('roles to remove : ', rolesToRemove)
  } catch (e) {
    console.error(e)
  } finally {
    process.exit()
  }
})()