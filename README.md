# Anna Pesonen Archive

A Next.js site with Sanity CMS for Anna Pesonen's stylist archive.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access Sanity Studio:
   - Visit `http://localhost:3000/studio` to manage content
   - Or run `npm run studio` for standalone studio

## Project Structure

- **Sanity Studio**: Available at `/studio` route
- **Pages**:
  - `/` - Landing page
  - `/projects` - List of all projects
  - `/projects/[slug]` - Individual project pages

## Sanity Schema

The `Project` schema includes:
- `title` (string)
- `slug` (slug, auto-generated from title)
- `type` (string)
- `tags` (array: Styling, Consulting, Creative Direction)
- `location` (string)
- `season` (string)
- `year` (number)
- `coverImage` (image)
- `images` (array of images and videos)
  - Images: standard image uploads
  - Videos: objects with `url` (string) and `caption` (string)
- `creativeDirector` (string)
- `otherRoles` (array of objects with roleTitle and roleName)

## Development

The site is set up with:
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Sanity CMS integration
- GROQ queries for data fetching

All pages are currently blank templates ready for design implementation.