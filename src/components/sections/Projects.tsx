import { Badge } from '@/components/ui/Badge'
import { projects } from '@/data/projects'

const categoryLabels: Record<string, string> = {
  'software-engineering': 'Software Engineering',
  logistics: 'Logistics',
  'ai-ml': 'AI / ML',
  'computer-vision': 'Computer Vision',
  architecture: 'Architecture',
  experiment: 'Experiment',
}

export function Projects() {
  const featured = projects.filter((p) => p.featured).slice(0, 4)

  return (
    <section className="section container-wide" aria-labelledby="projects-heading">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '48px' }}>
        <h2 id="projects-heading">Featured Projects</h2>
        <a href="/projects" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)' }}>
          View All →
        </a>
      </div>
      <div className="projects-grid">
        {featured.map((project) => (
          <a
            key={project.id}
            href={`/projects/${project.id}`}
            className="project-card"
          >
            <div className="project-card-header">
              <h3>{project.title}</h3>
              <Badge variant="outline">
                {categoryLabels[project.category] || project.category}
              </Badge>
            </div>
            <p className="project-card-summary">{project.summary}</p>
            <div className="project-card-techs">
              {project.technologies.slice(0, 4).map((tech) => (
                <span key={tech} className="tag">
                  {tech}
                </span>
              ))}
            </div>
            {project.metrics && project.metrics.length > 0 && (
              <div className="project-card-metrics">
                {project.metrics.map((m) => (
                  <span key={m} className="achievement-metric">
                    {m}
                  </span>
                ))}
              </div>
            )}
            <span className="project-card-cta">View Details →</span>
          </a>
        ))}
      </div>
    </section>
  )
}
