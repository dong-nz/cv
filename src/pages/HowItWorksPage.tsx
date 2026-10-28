import { useRef } from 'react'
import { motion } from 'motion/react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { InView } from '@/components/ui/InView'
import { useI18n } from '@/i18n/provider'
import { useLanguage } from '@/hooks/useLanguage'

// Chapter times are wall-clock strings for the reader ("0:14"); parsing them
// back to seconds is only the seek mechanic. The timeline itself lives in
// video/src/Explainer.tsx and the .vtt tracks mirror it.
function toSeconds(time: string): number {
  const [m, s] = time.split(':').map(Number)
  return m * 60 + s
}

export function HowItWorksPage() {
  const { ui: s } = useI18n()
  const { lang } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)

  const seekTo = (time: string) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = toSeconds(time)
    void video.play()
  }

  return (
    <InView>
      <motion.section
        className="section container-content"
        aria-labelledby="how-it-works-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
      >
        <SectionHeading
          id="how-it-works-heading"
          title={s.howItWorks.heading}
          tag={s.howItWorks.heading}
        />
        <p className="prose-lede">{s.howItWorks.intro}</p>

        <figure className="how-it-works-video">
          {/* preload="none" + poster: the video never loads until the visitor
              presses play, so it cannot compete with the page's LCP image. */}
          <video
            ref={videoRef}
            controls
            playsInline
            preload="none"
            poster="/media/how-it-works-poster.jpg"
            aria-label={s.howItWorks.videoAria}
          >
            <source src="/media/how-it-works.mp4" type="video/mp4" />
            <track
              kind="captions"
              src={`/media/how-it-works.${lang}.vtt`}
              srcLang={lang}
              label={lang === 'vi' ? 'Tiếng Việt' : 'English'}
              default
            />
          </video>
        </figure>

        <h3 className="subheading">{s.howItWorks.stepsTitle}</h3>
        <div className="how-it-works-grid">
          {s.howItWorks.steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="how-it-works-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
            >
              <h4>{step.title}</h4>
              <p>{step.body}</p>
            </motion.div>
          ))}
        </div>

        <h3 className="subheading">{s.howItWorks.chaptersTitle}</h3>
        <ul className="how-it-works-chapters">
          {s.howItWorks.chapters.map((chapter) => (
            <li key={chapter.time}>
              <button type="button" className="chapter-chip" onClick={() => seekTo(chapter.time)}>
                <span className="chapter-time">{chapter.time}</span>
                <span className="chapter-label">{chapter.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </motion.section>
    </InView>
  )
}
