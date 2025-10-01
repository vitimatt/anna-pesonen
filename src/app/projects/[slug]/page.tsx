import { client } from '@/sanity/lib/client'
import { projectBySlugQuery, projectSlugsQuery } from '@/sanity/queries'
import { Project } from '@/sanity/types'
import { notFound } from 'next/navigation'

interface ProjectPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const slugs = await client.fetch(projectSlugsQuery)
  return slugs.map((item: { slug: string }) => ({
    slug: item.slug,
  }))
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project: Project | null = await client.fetch(projectBySlugQuery, {
    slug,
  })

  if (!project) {
    notFound()
  }

  return (
    <div>
      <h1>{project.title}</h1>
      <p>Type: {project.type}</p>
      <p>Location: {project.location}</p>
      <p>Season: {project.season}</p>
      <p>Year: {project.year}</p>
      {/* Project details will be designed later */}
    </div>
  )
}
