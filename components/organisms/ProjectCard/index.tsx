import React from 'react'

type Project = {
  title: string
  description: string
  image?: string
  category?: string
  tech?: string[]
}

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition p-0 border bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
      {project.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.image} alt={project.title} className="w-full h-44 object-cover" />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{project.title}</h3>
        {project.category && (
          <span className="text-sm text-gray-500 dark:text-gray-300">{project.category}</span>
        )}
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{project.description}</p>
        {project.tech && (
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span key={t} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
