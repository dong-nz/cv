import {motion, useScroll, useTransform} from "motion/react"
import {InView} from "@/components/ui/InView"
import {useI18n} from '@/i18n/provider'
import {DownloadResume} from '@/components/sections/DownloadResume'


import {Button} from "@/components/ui/Button"
import {Typewriter} from '@/components/ui/Typewriter'
import {HeroParticles} from '@/components/sections/HeroParticles'
import {SocialLinks} from "@/components/ui/SocialLinks"


export function Hero() {
    const {scrollY} = useScroll()
    const {ui: s, content: c} = useI18n()
    const y = useTransform(scrollY, [0, 300], [0, -80])
    return (
        <InView>
            <motion.section
                className="hero container-wide"
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.1}}
                variants={{
                    hidden: {opacity: 0},
                    visible: {opacity: 1, transition: {duration: 0.5}},
                }}
                aria-labelledby="hero-heading"
            >
                <div className="hero-bg-grid"/>
                <HeroParticles/>
                {/* Entrance belongs to the items (whileInView + delay 0, 0.08, 0.16, 0.24,
                     0.32, 0.4 = i * 0.08), exactly like the timeline entries; the wrapper no
                     longer slides in on its own, so there is one fade, not three. */}
                <div className="hero-content">
                    <motion.div
                        initial={{opacity: 0, y: 24}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.2}}
                        transition={{duration: 0.45, ease: "easeOut", delay: 0}}
                    >
          <span className="hero-greeting">
            <span className="greeting-dot"/>
              {s.hero.greeting}
          </span>
                    </motion.div>
                    <motion.h1
                        id="hero-heading"
                        className="hero-name"
                        initial={{opacity: 0, y: 24}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.2}}
                        transition={{duration: 0.45, ease: "easeOut", delay: 0.08}}
                    >
                        <span className="name-highlight">{c.profile.name}</span>
                    </motion.h1>
                    <motion.p
                        className="hero-title"
                        initial={{opacity: 0, y: 24}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.2}}
                        transition={{duration: 0.45, ease: "easeOut", delay: 0.16}}
                    >
                        <Typewriter texts={c.profile.roles}/>
                    </motion.p>
                    <motion.p
                        className="hero-tagline"
                        initial={{opacity: 0, y: 24}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.2}}
                        transition={{duration: 0.45, ease: "easeOut", delay: 0.24}}
                    >
                        {/* Tagline segments (D9): markup is this component's rendering,
                            never content — the emphasis span keeps its classes. */}
                        {c.profile.tagline.map((segment, i) => (
                            segment.emphasis ? (
                                <span key={i} className="ok-possible name-highlight">{segment.text}</span>
                            ) : (
                                <span key={i}>{segment.text}</span>
                            )
                        ))}
                    </motion.p>
                    <motion.div
                        className="hero-cta"
                        initial={{opacity: 0, y: 24}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.2}}
                        transition={{duration: 0.45, ease: "easeOut", delay: 0.32}}
                    >
                        <Button href="/projects" variant="primary">
                            {s.hero.ctaProjects}
                        </Button>
                        <Button href="/contact" variant="primary">
                            {s.hero.ctaContact}
                        </Button>
                        <DownloadResume />

                        <SocialLinks />
                    </motion.div>
                </div>
                <div className="scroll-indicator" aria-hidden="true">
                    <div className="scroll-mouse">
                        <div className="scroll-wheel"/>
                    </div>
                    <span>{s.hero.scroll}</span>
                </div>
                <motion.div
                    className="hero-visual"
                    initial={{opacity: 0, y: 24}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.2}}
                    transition={{duration: 0.45, ease: "easeOut", delay: 0.4}}
                >
                    <motion.img
                        src="/profile-photo.webp"
                        alt={c.profile.name}
                        className="hero-photo"
                        style={{y}}
                        width="1200"
                        height="1600"
                        fetchPriority="high"
                    />
                </motion.div>
            </motion.section>
        </InView>
    )
}
