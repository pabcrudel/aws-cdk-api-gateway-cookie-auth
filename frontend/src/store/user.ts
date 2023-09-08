// Utilities
import { defineStore } from 'pinia'
import { CognitoUser} from '../utils/auth'

export const useUserStore = defineStore('User', {
  state: () => ({
    user: {} as CognitoUser,
  }),
})
