'use client'

import { client } from '@/sanity/lib/client'
import { projectsQuery } from '@/sanity/queries'
import { Project } from '@/sanity/types'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/client'
import { useRef, useEffect, useState } from 'react'
import ProjectModal from '@/components/ProjectModal'

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [containerWidth, setContainerWidth] = useState(600)
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalProjectSlug, setModalProjectSlug] = useState<string | null>(null)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [hoverDirection, setHoverDirection] = useState<'left' | 'right' | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const data = await client.fetch(projectsQuery)
        setProjects(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)
    return () => window.removeEventListener('resize', updateContainerWidth)
  }, [])

  const openModal = (projectSlug: string, direction: 'left' | 'right') => {
    setModalProjectSlug(projectSlug)
    setSlideDirection(direction)
    setModalOpen(true)
    setHoveredProject(null) // Clear hover state when opening modal
    // No need for separate animation timing - modal moves with page
  }

  const closeModal = () => {
    setIsClosing(true)
    setModalOpen(false)
    setHoveredProject(null) // Clear hover state when closing modal
    setHoverDirection(null) // Clear hover direction
    setIsHovering(false) // Clear hovering state
    // Keep modal mounted during closing transition, then clear project data
    setTimeout(() => {
      setIsClosing(false)
      setModalProjectSlug(null) // Clear selected state after animation completes
    }, 500) // Match the transition duration
  }

  const handleHoverZoneEnter = (direction: 'left' | 'right') => {
    if (modalOpen && !isClosing) {
      setHoverDirection(direction)
      setIsHovering(true)
    }
  }

  const handleHoverZoneLeave = () => {
    if (modalOpen && !isClosing) {
      setHoverDirection(null)
      setIsHovering(false)
    }
  }

  const handleHoverZoneClick = () => {
    if (modalOpen && !isClosing && hoverDirection) {
      closeModal()
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="uppercase">Loading projects...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="uppercase">{error}</div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="uppercase">No projects found. Add projects in Sanity Studio.</div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden" style={{ padding: '10px' }}>
      {/* Hover Zones - positioned outside the moving container */}
      {modalOpen && !isClosing && (
        <>
          {/* Left Hover Zone - only show when opened from images (slideDirection === 'right') */}
          {slideDirection === 'right' && (
            <div
              className="fixed top-0 left-0 w-[10vw] h-screen z-50 cursor-pointer"
              onMouseEnter={() => handleHoverZoneEnter('right')}
              onMouseLeave={handleHoverZoneLeave}
              onClick={handleHoverZoneClick}
            />
          )}
          
          {/* Right Hover Zone - only show when opened from list (slideDirection === 'left') */}
          {slideDirection === 'left' && (
            <div
              className="fixed top-0 right-0 w-[10vw] h-screen z-50 cursor-pointer"
              onMouseEnter={() => handleHoverZoneEnter('left')}
              onMouseLeave={handleHoverZoneLeave}
              onClick={handleHoverZoneClick}
            />
          )}
        </>
      )}

      <div 
        className="flex gap-2.5 h-full transition-transform duration-500"
        style={{
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transform: (() => {
            if (!modalOpen) return 'translateX(0)'
            
            let baseTransform = slideDirection === 'right' 
              ? 'translateX(calc(-50vw + 5px))' 
              : 'translateX(calc(50vw - 5px))'
            
            // Add hover animation - move additional 10% towards closing direction
            if (isHovering && hoverDirection) {
              // When modal opened from right (slideDirection === 'right'), hover left should move content more left (towards closing)
              // When modal opened from left (slideDirection === 'left'), hover right should move content more right (towards closing)
              const hoverOffset = slideDirection === 'right' 
                ? (hoverDirection === 'left' ? '-10%' : '10%')  // Right modal: left hover moves left, right hover moves right
                : (hoverDirection === 'right' ? '10%' : '-10%') // Left modal: right hover moves right, left hover moves left
              
              baseTransform = slideDirection === 'right' 
                ? `translateX(calc(-50vw + 5px + ${hoverOffset}))`
                : `translateX(calc(50vw - 5px + ${hoverOffset}))`
            }
            
            return baseTransform
          })()
        }}
      >
        {/* Left Column - Project Text Info */}
        <div ref={containerRef} className="w-1/2 overflow-y-auto">
          {projects.map((project) => {
            // Calculate visible character counts for each column (accounting for truncation)
            const titleVisibleChars = Math.min(project.title?.length || 0, Math.floor((containerWidth * 0.3 - 16) / 6.8));
            const typeVisibleChars = Math.min(project.type?.length || 0, Math.floor((containerWidth * 0.3 - 16) / 6.8));
            const tagsVisibleChars = Math.min(project.tags?.join(', ').length || 0, Math.floor((containerWidth * 0.2 - 16) / 6.8));
            const locationVisibleChars = Math.min(project.location?.length || 0, Math.floor((containerWidth * 0.1 - 16) / 6.8));
            const seasonVisibleChars = Math.min(project.season?.length || 0, Math.floor((containerWidth * 0.1 - 16) / 6.8));
            
            // Calculate cumulative positions for left alignment on hover
            const titleLeft = 0;
            const typeLeft = (titleVisibleChars * 7) + 12;
            const tagsLeft = typeLeft + (typeVisibleChars * 7) + 12;
            const locationLeft = tagsLeft + (tagsVisibleChars * 7) + 12;
            const seasonLeft = locationLeft + (locationVisibleChars * 7) + 12;
            
            // Calculate current positions in pixels (using actual measured container width)
            const titleCurrent = 0; // First column starts at 0
            const typeCurrent = containerWidth * 0.3; // 30% of container width
            const tagsCurrent = containerWidth * 0.6; // 30% + 30% of container width  
            const locationCurrent = containerWidth * 0.8; // 30% + 30% + 20% of container width
            const seasonCurrent = containerWidth * 0.9; // 30% + 30% + 20% + 10% of container width
            
            // Calculate movement needed (target - current)
            const titleMove = titleLeft - titleCurrent;
            const typeMove = typeLeft - typeCurrent;
            const tagsMove = tagsLeft - tagsCurrent;
            const locationMove = locationLeft - locationCurrent;
            const seasonMove = seasonLeft - seasonCurrent - (containerWidth * 0.1 - 28); // Subtract 10% - 32px offset
            
            // Debug logging
            console.log('Container width:', containerWidth);
            console.log('Project:', project.title);
            console.log('Visible chars - Title:', titleVisibleChars, 'Type:', typeVisibleChars, 'Tags:', tagsVisibleChars, 'Location:', locationVisibleChars, 'Season:', seasonVisibleChars);
            console.log('Target positions:', titleLeft, typeLeft, tagsLeft, locationLeft, seasonLeft);
            console.log('Current positions:', titleCurrent, typeCurrent, tagsCurrent, locationCurrent, seasonCurrent);
            console.log('Movements:', titleMove, typeMove, tagsMove, locationMove, seasonMove);
            
            return (
              <div 
                key={project._id} 
                onClick={() => openModal(project.slug.current, 'left')}
                className={`flex items-center h-[15px] bg-white cursor-pointer relative group/link ${(hoveredProject === project._id || modalProjectSlug === project.slug.current) ? 'hovered' : ''}`}
                onMouseEnter={() => !modalOpen && setHoveredProject(project._id)}
                onMouseLeave={() => !modalOpen && setHoveredProject(null)}
              >
                <div 
                  className="w-[30%] px-2 truncate uppercase project-column"
                  style={{ 
                    '--hover-move': `${titleMove}px`
                  } as React.CSSProperties}
                  title={project.title}
                >
                  {project.title}
                </div>
                <div 
                  className="w-[30%] px-2 truncate uppercase project-column"
                  style={{ 
                    '--hover-move': `${typeMove}px`
                  } as React.CSSProperties}
                  title={project.type}
                >
                  {project.type}
                </div>
                <div 
                  className="w-[20%] px-2 truncate uppercase project-column"
                  style={{ 
                    '--hover-move': `${tagsMove}px`
                  } as React.CSSProperties}
                  title={project.tags?.join(', ')}
                >
                  {project.tags?.join(', ')}
                </div>
                <div 
                  className="w-[10%] px-2 truncate uppercase project-column"
                  style={{ 
                    '--hover-move': `${locationMove}px`
                  } as React.CSSProperties}
                  title={project.location}
                >
                  {project.location}
                </div>
                <div 
                  className="w-[10%] px-2 truncate uppercase text-right project-column"
                  style={{ 
                    '--hover-move': `${seasonMove}px`
                  } as React.CSSProperties}
                  title={project.season}
                >
                  {project.season}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column - Project Cover Images */}
        <div className="w-1/2 flex flex-col gap-2.5 overflow-y-auto">
          {projects.map((project) => (
            <div 
              key={project._id} 
              onClick={() => openModal(project.slug.current, 'right')}
              className="relative w-full aspect-[4/3] bg-white overflow-hidden group cursor-pointer flex-shrink-0"
              onMouseEnter={() => setHoveredProject(project._id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              {/* Cover Image(s) */}
              <div className="absolute inset-0 group-hover:opacity-0 transition-opacity duration-0">
                {project.secondCoverImage ? (
                  // Dual cover images - split vertically
                  <div className="flex h-full">
                    <div className="w-1/2 relative">
                      <Image
                        src={urlFor(project.coverImage).width(800).height(1200).url()}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="w-1/2 relative">
                      <Image
                        src={urlFor(project.secondCoverImage).width(800).height(1200).url()}
                        alt={`${project.title} - Second view`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  // Single cover image
                  project.coverImage && (
                    <Image
                      src={urlFor(project.coverImage).width(1600).height(1200).url()}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  )
                )}
              </div>
              
              {/* Hover Overlay - White background with title, season, and type */}
              <div className={`absolute inset-0 bg-white transition-opacity duration-0 flex items-center justify-center ${(hoveredProject === project._id || modalProjectSlug === project.slug.current) ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-center truncate max-w-full px-2 uppercase">
                  {project.title} {project.season} {project.type}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Project Modal - positioned inside the page container */}
        {(modalOpen || isClosing) && (
          <div 
            className={`absolute top-0 w-[50vw] bg-white overflow-y-auto
              ${slideDirection === 'right' ? 'right-0' : 'left-0'}
            `}
            style={{
              height: 'calc(100vh - 20px)', // Account for parent padding
              transform: slideDirection === 'right' 
                ? 'translateX(100%)' 
                : 'translateX(-100%)'
            }}
          >
            <ProjectModal
              isOpen={modalOpen}
              onClose={closeModal}
              projectSlug={modalProjectSlug}
              slideDirection={slideDirection}
              isAnimating={false}
              isClosing={isClosing}
            />
          </div>
        )}
      </div>
    </div>
  )
}