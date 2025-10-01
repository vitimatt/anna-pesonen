import { defineField, defineType } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Styling', value: 'Styling' },
          { title: 'Consulting', value: 'Consulting' },
          { title: 'Creative Direction', value: 'Creative Direction' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'season',
      title: 'Season',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.required().min(1900).max(new Date().getFullYear() + 1),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'secondCoverImage',
      title: 'Second Cover Image (Optional)',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Optional second cover image. When provided, both images will be displayed side by side.',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        { type: 'image', options: { hotspot: true } },
        {
          type: 'object',
          name: 'video',
          title: 'Video',
          fields: [
            {
              name: 'url',
              title: 'Video URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
          preview: {
            select: {
              title: 'caption',
              subtitle: 'url',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'creativeDirector',
      title: 'Creative Director',
      type: 'string',
    }),
    defineField({
      name: 'otherRoles',
      title: 'Other Roles',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'roleTitle',
              title: 'Role Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'roleName',
              title: 'Role Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      subtitle: 'type',
    },
  },
})
