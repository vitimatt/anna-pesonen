import { groq } from 'next-sanity'

export const projectsQuery = groq`
  *[_type == "project"] | order(year desc, _createdAt desc) {
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    type,
    tags,
    location,
    season,
    year,
    coverImage,
    secondCoverImage,
    creativeDirector,
    otherRoles
  }
`

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    type,
    tags,
    location,
    season,
    year,
    coverImage,
    secondCoverImage,
    images[] {
      _type,
      ...,
      _type == "video" => {
        url,
        caption
      }
    },
    creativeDirector,
    otherRoles
  }
`

export const projectSlugsQuery = groq`
  *[_type == "project" && defined(slug.current)][] {
    "slug": slug.current
  }
`
