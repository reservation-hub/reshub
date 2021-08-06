import { User } from "../../entities/User"
import prisma from "../../repositories/prisma"
import { UserRepositoryInterface } from "../services/SignUpService"

export const insertUser(email: string, username: string, password: string): Promise<User> => {
  return prisma.user.create({
    data: {
      email,
      username,
      password
    }
  })
}

const UserRepository: UserRepositoryInterface = {
  insertUser
}

export default UserRepository