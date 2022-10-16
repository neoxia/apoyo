export interface User {
  id: string
  email: string
  role: 'admin' | 'member'
}

export interface Post {
  id: string
  userId: string
}
