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
      <Link to="/projects" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)', marginBottom: '32px', display: 'inline-block' }}>
        {strings.projectDetail.backToProjects[lang]} ←
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <h1 id="project-title" style={{ flex: 1 }}>{project.title}</h1>
        <Badge variant="outline">{strings.projects.categories[project.category][lang]}</Badge>
      </div>

      <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        {useField(project.summary, project.summaryEn)}
      </p>

      {project.metrics && project.metrics.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>{strings.projectDetail.impact[lang]}</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {project.metrics.map((m) => (
              <span key={m} className="achievement-metric">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>{strings.projectDetail.role[lang]}</h3>
        <p>{project.role}</p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>{strings.projectDetail.technologies[lang]}</h3>
        <div className="philosophy-keywords">
          {project.technologies.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </div>
      </div>

      {project.sections && project.sections.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>{strings.projectDetail.experiments[lang]}</h3>
          {project.sections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '4px', color: 'var(--text-primary)' }}>{useField(section.title, section.titleEn)}</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{useField(section.content, section.contentEn)}</p>
              <Tag accent>{section.type}</Tag>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
