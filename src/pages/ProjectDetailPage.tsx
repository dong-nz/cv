import { useParams, Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Tag } from '@/components/ui/Tag'
import { projects } from '@/data/projects'

const categoryLabels: Record<string, string> = {
  'software-engineering': 'Software Engineering',
  logistics: 'Logistics',
  'ai-ml': 'AI / ML',
  'computer-vision': 'Computer Vision',
  architecture: 'Architecture',
  experiment: 'Experiment',
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <section className="section container-content">
        <h2>Project Not Found</h2>
        <p>
          <Link to="/projects">← Back to Projects</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="section container-content" aria-labelledby="project-title">
      <Link to="/projects" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)', marginBottom: '32px', display: 'inline-block' }}>
        ← Back to Projects
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <h1 id="project-title" style={{ flex: 1 }}>{project.title}</h1>
        <Badge variant="outline">{categoryLabels[project.category] || project.category}</Badge>
      </div>

      <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        {project.summary}
      </p>

      {project.metrics && project.metrics.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>Impact</h3>
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
        <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>Role</h3>
        <p>{project.role}</p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>Technologies</h3>
        <div className="philosophy-keywords">
          {project.technologies.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </div>
      </div>

      {project.sections && project.sections.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>Engineering Experiments</h3>
          {project.sections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '4px', color: 'var(--text-primary)' }}>{section.title}</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{section.content}</p>
              <Tag accent>{section.type}</Tag>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
