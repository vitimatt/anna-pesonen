import { SanityImageSource } from '@sanity/image-url/lib/types/types'

export interface Project {
  _id: string
  _createdAt: string
  _updatedAt: string
  _rev: string
  _type: 'project'
  title: string
  slug: {
    current: string
  }
  type: string
  tags: string[]
  location: string
  season: string
  year: number
  coverImage: SanityImageSource
  secondCoverImage?: SanityImageSource
  images?: (SanityImageSource | {
    _type: 'video'
    url: string
    caption?: string
  })[]
  creativeDirector?: string
  otherRoles?: {
    roleTitle: string
    roleName: string
  }[]
}

export interface ProjectWithSlug extends Project {
  slug: {
    current: string
  }
}
