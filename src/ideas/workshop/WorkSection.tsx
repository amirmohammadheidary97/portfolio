import { useTranslation } from 'react-i18next'
import { projects } from '../../data/projects'
import { Reveal } from './Reveal'

export function WorkSection() {
  const { t } = useTranslation()

  return (
    <section className="section" id="work">
      <div className="container">
        <Reveal>
          <p className="eyebrow">{t('work.eyebrow')}</p>
          <h2 className="section-title">{t('work.title')}</h2>
          <p className="section-subtitle">{t('work.subtitle')}</p>
        </Reveal>

        <div className="work-grid">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={Math.min(index * 0.06, 0.3)}>
              <article className="project">
                <div className="project__media">
                  <img
                    src={project.image}
                    alt=""
                    width={800}
                    height={500}
                    loading="lazy"
                  />
                </div>
                <div className="project__body">
                  <p className="project__index">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="project__name">
                    {t(`projects.${project.nameKey}.name`)}
                  </h3>
                  <p className="project__summary">
                    {t(`projects.${project.nameKey}.summary`)}
                  </p>
                  <div className="project__stack">
                    {project.stack.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="project__links">
                    {project.demoUrl ? (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {project.hasFakeDemo
                          ? t('work.demoFake')
                          : t('work.demo')}
                      </a>
                    ) : (
                      <span className="is-muted">{t('work.private')}</span>
                    )}
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {t('work.code')}
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
