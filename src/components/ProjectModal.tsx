'use client'

import { useEffect, useState } from 'react'
import { client } from '@/sanity/lib/client'
import { projectBySlugQuery } from '@/sanity/queries'
import { Project } from '@/sanity/types'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/client'

// Loading skeleton component that shows LQIP blurred image
const ImageSkeleton = ({ 
  aspectRatio, 
  lqipUrl, 
  alt 
}: { 
  aspectRatio?: number
  lqipUrl?: string
  alt?: string
}) => (
  <div 
    className="relative w-full bg-gray-200 overflow-hidden" 
    style={{ 
      aspectRatio: aspectRatio ? `${aspectRatio}` : '4/3',
      minHeight: '200px'
    }}
  >
    {lqipUrl && (
      <Image
        src={lqipUrl}
        alt={alt || 'Loading...'}
        fill
        className="object-cover blur-sm scale-110"
        style={{ filter: 'blur(8px)' }}
      />
    )}
  </div>
)

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  projectSlug: string | null
  slideDirection: 'left' | 'right'
  isAnimating: boolean
  isClosing: boolean
}

export default function ProjectModal({ isOpen, onClose, projectSlug, slideDirection, isAnimating, isClosing }: ProjectModalProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({})
  const [imageDimensions, setImageDimensions] = useState<Record<string, { width: number; height: number }>>({})
  const [lqipUrls, setLqipUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && projectSlug) {
      setLoading(true)
      setImageLoadingStates({}) // Reset image loading states
      setImageDimensions({}) // Reset image dimensions
      setLqipUrls({}) // Reset LQIP URLs
      const fetchProject = async () => {
        try {
          const data = await client.fetch(projectBySlugQuery, { slug: projectSlug })
          
          // Preload images to get their dimensions BEFORE setting project data
          const preloadPromises: Promise<void>[] = []
          const dimensions: Record<string, { width: number; height: number }> = {}
          const lqipUrls: Record<string, string> = {}
          
          if (data.coverImage) {
            // Get LQIP URL
            lqipUrls['cover'] = urlFor(data.coverImage).width(20).blur(50).url()
            
            preloadPromises.push(
              new Promise<void>((resolve) => {
                const img = new window.Image()
                img.onload = () => {
                  dimensions['cover'] = { width: img.naturalWidth, height: img.naturalHeight }
                  resolve()
                }
                img.src = urlFor(data.coverImage).width(1600).url()
              })
            )
          }
          
          if (data.secondCoverImage) {
            // Get LQIP URL
            lqipUrls['secondCover'] = urlFor(data.secondCoverImage).width(20).blur(50).url()
            
            preloadPromises.push(
              new Promise<void>((resolve) => {
                const img = new window.Image()
                img.onload = () => {
                  dimensions['secondCover'] = { width: img.naturalWidth, height: img.naturalHeight }
                  resolve()
                }
                img.src = urlFor(data.secondCoverImage).width(1600).url()
              })
            )
          }
          
          if (data.images) {
            data.images.forEach((image: any, index: number) => {
              if (typeof image === 'object' && '_type' in image && image._type === 'video') {
                // For videos, we'll get dimensions when they load
              } else {
                // Get LQIP URL
                lqipUrls[`image-${index}`] = urlFor(image).width(20).blur(50).url()
                
                preloadPromises.push(
                  new Promise<void>((resolve) => {
                    const img = new window.Image()
                    img.onload = () => {
                      dimensions[`image-${index}`] = { width: img.naturalWidth, height: img.naturalHeight }
                      resolve()
                    }
                    img.src = urlFor(image).width(1600).url()
                  })
                )
              }
            })
          }
          
          // Set LQIP URLs immediately (they're generated synchronously)
          setLqipUrls(lqipUrls)
          
          // Initialize loading states for all images
          const loadingStates: Record<string, boolean> = {}
          if (data.coverImage) loadingStates['cover'] = true
          if (data.secondCoverImage) loadingStates['secondCover'] = true
          if (data.images) {
            data.images.forEach((_: any, index: number) => {
              loadingStates[`image-${index}`] = true
            })
          }
          setImageLoadingStates(loadingStates)
          
          // Set the project data immediately
          setProject(data)
          
          // Wait for all images to preload in the background, then set dimensions
          Promise.all(preloadPromises).then(() => {
            setImageDimensions(dimensions)
          })
          
        } catch (error) {
          console.error('Error fetching project:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchProject()
    }
  }, [isOpen, projectSlug])

  const handleImageLoad = (imageKey: string) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [imageKey]: false
    }))
  }

  if ((!isOpen && !isClosing) || !projectSlug) return null

  return (
    <>
      {/* Backdrop - invisible but clickable */}
      <div 
        className="absolute inset-0 z-40 pointer-events-none"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full h-full bg-white">
        <div style={{ 
          padding: slideDirection === 'right' 
            ? '0 5px 0 10px'  // Right side padding when opened from images
            : '0 10px 0 5px'   // Left side padding when opened from list
        }}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-black">Loading...</div>
            </div>
          ) : project ? (
            <>
              {/* Cover Image */}
              {project.coverImage && (
                <div className="relative w-full bg-gray-100 overflow-hidden" style={{ marginBottom: '10px' }}>
                  {imageLoadingStates['cover'] && lqipUrls['cover'] && (
                    <ImageSkeleton 
                      aspectRatio={imageDimensions['cover'] ? imageDimensions['cover'].width / imageDimensions['cover'].height : undefined}
                      lqipUrl={lqipUrls['cover']}
                      alt={project.title}
                    />
                  )}
                  <Image
                    src={urlFor(project.coverImage).width(1600).url()}
                    alt={project.title}
                    width={1600}
                    height={0}
                    className="w-full h-auto object-cover"
                    onLoad={() => handleImageLoad('cover')}
                    style={{ opacity: imageLoadingStates['cover'] ? 0 : 1 }}
                  />
                </div>
              )}

              {/* Secondary Cover Image */}
              {project.secondCoverImage && (
                <div className="relative w-full bg-gray-100 overflow-hidden" style={{ marginBottom: '10px' }}>
                  {imageLoadingStates['secondCover'] && lqipUrls['secondCover'] && (
                    <ImageSkeleton 
                      aspectRatio={imageDimensions['secondCover'] ? imageDimensions['secondCover'].width / imageDimensions['secondCover'].height : undefined}
                      lqipUrl={lqipUrls['secondCover']}
                      alt={`${project.title} - Second view`}
                    />
                  )}
                  <Image
                    src={urlFor(project.secondCoverImage).width(1600).url()}
                    alt={`${project.title} - Second view`}
                    width={1600}
                    height={0}
                    className="w-full h-auto object-cover"
                    onLoad={() => handleImageLoad('secondCover')}
                    style={{ opacity: imageLoadingStates['secondCover'] ? 0 : 1 }}
                  />
                </div>
              )}

              {/* All Images */}
              {project.images && project.images.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  {project.images.map((image, index) => (
                    <div key={index} style={{ marginBottom: index < (project.images?.length || 0) - 1 ? '10px' : '0' }}>
                      {typeof image === 'object' && '_type' in image && image._type === 'video' ? (
                        <div className="relative w-full bg-gray-100 overflow-hidden">
                          {imageLoadingStates[`image-${index}`] && lqipUrls[`image-${index}`] && (
                            <ImageSkeleton 
                              aspectRatio={imageDimensions[`image-${index}`] ? imageDimensions[`image-${index}`].width / imageDimensions[`image-${index}`].height : undefined}
                              lqipUrl={lqipUrls[`image-${index}`]}
                              alt={`${project.title} - Video ${index + 1}`}
                            />
                          )}
                          <video
                            src={image.url}
                            controls
                            className="w-full h-auto"
                            onLoadedData={() => handleImageLoad(`image-${index}`)}
                            style={{ opacity: imageLoadingStates[`image-${index}`] ? 0 : 1 }}
                          />
                          {image.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                              {image.caption}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative w-full bg-gray-100 overflow-hidden">
                          {imageLoadingStates[`image-${index}`] && lqipUrls[`image-${index}`] && (
                            <ImageSkeleton 
                              aspectRatio={imageDimensions[`image-${index}`] ? imageDimensions[`image-${index}`].width / imageDimensions[`image-${index}`].height : undefined}
                              lqipUrl={lqipUrls[`image-${index}`]}
                              alt={`${project.title} - Image ${index + 1}`}
                            />
                          )}
                          <Image
                            src={urlFor(image).width(1600).url()}
                            alt={`${project.title} - Image ${index + 1}`}
                            width={1600}
                            height={0}
                            className="w-full h-auto object-cover"
                            onLoad={() => handleImageLoad(`image-${index}`)}
                            style={{ opacity: imageLoadingStates[`image-${index}`] ? 0 : 1 }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Text Information */}
              <div style={{ marginTop: '10px' }}>
                {/* Homepage-style layout row */}
                <div className="flex items-center h-[15px] bg-white">
                  <div className="w-[50%] px-2 truncate uppercase">
                    {project.title} {project.season} {project.type}
                  </div>
                  <div className="w-[40%] px-2 truncate uppercase">
                    {project.location}
                  </div>
                  <div className="w-[10%] px-2 truncate uppercase text-right">
                    {project.year}
                  </div>
                </div>

                {/* 80px spacing */}
                <div style={{ height: '80px' }} />

                {/* Two columns layout */}
                <div className="flex">
                  {/* Left column */}
                  <div className="w-1/2">
                    <div className="uppercase">Creative Director</div>
                    <div className="uppercase">
                      {(() => {
                        const roles: string[] = []
                        
                        if (project.tags && project.tags.length > 0) {
                          project.tags.forEach(tag => {
                            if (tag === 'Styling') roles.push('Stylist')
                            else if (tag === 'Creative Direction') roles.push('Creative Director')
                            else if (tag === 'Consulting') roles.push('Consultant')
                          })
                        }
                        // Add other roles from otherRoles field
                        if (project.otherRoles && project.otherRoles.length > 0) {
                          project.otherRoles.forEach(role => {
                            if (role.roleTitle === 'Stylist' || role.roleTitle === 'Consultant' || role.roleTitle === 'Creative Director') {
                              roles.push(role.roleTitle)
                            }
                          })
                        }
                        return roles.length > 0 ? roles.join(', ') : 'No roles found'
                      })()}
                    </div>
                    {/* Other role titles */}
                    {project.otherRoles && project.otherRoles.length > 0 && (
                      <div className="uppercase" style={{ marginTop: '10px' }}>
                        {project.otherRoles.map((role, index) => (
                          <div key={index}>
                            {role.roleTitle}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Right column */}
                  <div className="w-1/2">
                    <div className="uppercase">{project.creativeDirector || ''}</div>
                    <div className="uppercase">
                      Anna Pesonen
                    </div>
                    {/* Other role names */}
                    {project.otherRoles && project.otherRoles.length > 0 && (
                      <div className="uppercase" style={{ marginTop: '10px' }}>
                        {project.otherRoles.map((role, index) => (
                          <div key={index}>
                            {role.roleName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 80px spacing */}
                <div style={{ height: '80px' }} />

                {/* Return Home Button */}
                <button
                  onClick={onClose}
                  className="text-black uppercase cursor-pointer"
                >
                  Return Home
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-black">Project not found</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
