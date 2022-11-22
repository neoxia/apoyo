export interface User {
  id: string
  email: string
  role: 'admin' | 'moderator' | 'member'
}

export interface Post {
  id: string
  authorId: string
  status: 'draft' | 'published'
}
