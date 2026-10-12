import { SectionHeading } from '@/components/ui/SectionHeading'
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

export function ProjectsListPage() {
  return (
    <section className="section container-wide" aria-labelledby="projects-heading">
      <SectionHeading title="Projects" tag="04 - Projects" />
      <div className="projects-grid">
        {projects.map((project) => (
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
            <span className="project-card-cta">View Details →</span>
          </a>
        ))}
      </div>
    </section>
  )
}
