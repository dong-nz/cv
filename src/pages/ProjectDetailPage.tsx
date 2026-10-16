import { useParams, Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Tag } from '@/components/ui/Tag'
import { projects } from '@/data/projects'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { useField } from '@/i18n/useField'


export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { lang } = useLanguage()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <section className="section container-content">
        <h2>{strings.projectDetail.notFound[lang]}</h2>
        <p>
          <Link to="/projects">{strings.projectDetail.backToProjects[lang]} ←</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="section container-content" aria-labelledby="project-title">
      <Link to="/projects" className="back-link">
        {strings.projectDetail.backToProjects[lang]} ←
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <h1 id="project-title" style={{ flex: 1 }}>{project.title}</h1>
        <Badge variant="outline">{strings.projects.categories[project.category][lang]}</Badge>
      </div>

      <p className="prose-lede">
        {useField(project.summary, project.summaryEn)}
      </p>

      <div className="prose">
        {project.metrics && project.metrics.length > 0 && (
          <div>
            <h3>{strings.projectDetail.impact[lang]}</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {project.metrics.map((m) => (
                <span key={m} className="achievement-metric">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3>{strings.projectDetail.role[lang]}</h3>
          <p>{project.role}</p>
        </div>

        <div>
          <h3>{strings.projectDetail.technologies[lang]}</h3>
          <div className="philosophy-keywords">
            {project.technologies.map((tech) => (
              <Tag key={tech}>{tech}</Tag>
            ))}
          </div>
        </div>

        {project.sections && project.sections.length > 0 && (
          <div>
            <h3>{strings.projectDetail.experiments[lang]}</h3>
            {project.sections.map((section, idx) => (
              <div key={idx} className="project-section">
                <h4>{useField(section.title, section.titleEn)}</h4>
                <p>{useField(section.content, section.contentEn)}</p>
                <Tag accent>{section.type}</Tag>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
