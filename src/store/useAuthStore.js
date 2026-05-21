import { create } from 'zustand'

const saved = JSON.parse(localStorage.getItem('winga_auth') || 'null')

export const useAuthStore = create((set) => ({
  user: saved?.user || null,
  accessToken: saved?.accessToken || null,
  refreshToken: saved?.refreshToken || null,
  setAuth: ({ user, accessToken, refreshToken }) =>
    set(() => {
      const next = { user, accessToken, refreshToken }
      localStorage.setItem('winga_auth', JSON.stringify(next))
      return next
    }),
  logout: () =>
    set(() => {
      localStorage.removeItem('winga_auth')
      return { user: null, accessToken: null, refreshToken: null }
    }),
}))
