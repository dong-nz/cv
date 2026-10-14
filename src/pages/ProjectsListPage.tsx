import { SectionHeading } from '@/components/ui/SectionHeading'
import { Badge } from '@/components/ui/Badge'
import { projects } from '@/data/projects'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { useField } from '@/i18n/useField'

import { Link } from 'react-router'

export function ProjectsListPage() {
  const { lang } = useLanguage()
  return (
    <section className="section container-wide" aria-labelledby="projects-heading">
      <SectionHeading title={strings.projects.all[lang]} tag={strings.projects.all[lang]} />
      <div className="projects-grid">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="project-card"
          >
            <div className="project-card-header">
              <h3>{project.title}</h3>
              <Badge variant="outline">
                {strings.projects.categories[project.category][lang]}
              </Badge>
            </div>
            <p className="project-card-summary">{useField(project.summary, project.summaryEn)}</p>
            <div className="project-card-techs">
              {project.technologies.slice(0, 4).map((tech) => (
                <span key={tech} className="tag">
                  {tech}
                </span>
              ))}
            </div>
            <span className="project-card-cta">{strings.projects.viewDetails[lang]} →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
