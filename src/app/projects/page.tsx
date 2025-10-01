import { client } from '@/sanity/lib/client'
import { projectsQuery } from '@/sanity/queries'
import { Project } from '@/sanity/types'

export default async function ProjectsPage() {
  const projects: Project[] = await client.fetch(projectsQuery)

  return (
    <div>
      <h1>All Projects</h1>
      <p>Found {projects.length} projects</p>
      {/* Project list will be designed later */}
    </div>
  )
}
