import {motion, useScroll, useTransform} from "motion/react"
import {InView} from "@/components/ui/InView"
import {resumeAvailable, resumeLanguages, resumeUrlFor, resumeLanguageLabels} from "@/data/resume"
import type {Language} from '@/types'
import {useLanguage} from '@/hooks/useLanguage'
import {strings} from '@/i18n/strings'
import { field } from '@/i18n/field'
import {DownloadResumeDropdown} from '@/components/sections/DownloadResume'


import {Button} from "@/components/ui/Button"
import {Typewriter} from '@/components/ui/Typewriter'
import {HeroParticles} from '@/components/sections/HeroParticles'
import {SocialLinks} from "@/components/ui/SocialLinks"
import {profile} from "@/data/profile"

function HeroDownloadButton({lang}: { lang: Language }) {
    const {lang: currentLang} = useLanguage()
    return (
        <a
            href={resumeUrlFor(lang)}
            download
            target="_blank"
            className="btn btn-primary hero-download-mobile-btn"
        >
            {strings.common.resumeDownload[currentLang]} ({resumeLanguageLabels[lang]})
        </a>
    )
}


export function Hero() {
    const {scrollY} = useScroll()
    const {lang} = useLanguage()
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
              {strings.hero.greeting[lang]}
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
                        <span className="name-highlight">{field(lang, profile.name, profile.nameEn)}</span>
                    </motion.h1>
                    <motion.p
                        className="hero-title"
                        initial={{opacity: 0, y: 24}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.2}}
                        transition={{duration: 0.45, ease: "easeOut", delay: 0.16}}
                    >
                        <Typewriter texts={profile.roles}/>
                    </motion.p>
                    <motion.p
                        className="hero-tagline"
                        initial={{opacity: 0, y: 24}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.2}}
                        transition={{duration: 0.45, ease: "easeOut", delay: 0.24}}
                        dangerouslySetInnerHTML={{__html: field(lang, profile.tagline, profile.taglineEn)}}
                    />
                    <motion.div
                        className="hero-cta"
                        initial={{opacity: 0, y: 24}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.2}}
                        transition={{duration: 0.45, ease: "easeOut", delay: 0.32}}
                    >
                        <Button href="/projects" variant="primary">
                            {strings.hero.ctaProjects[lang]}
                        </Button>
                        <Button href="/contact" variant="primary">
                            {strings.hero.ctaContact[lang]}
                        </Button>
                        {resumeAvailable && (
                            <>
                                <div className="hero-download-desktop">
                                    <DownloadResumeDropdown className="hero-download-dropdown"
                                                            wrapperClassName="hero-download-summary" targetBlank/>
                                </div>
                                <div className="hero-download-mobile">
                                    {resumeLanguages.map(lang => (
                                        <HeroDownloadButton key={lang} lang={lang} />
                                    ))}
                                </div>
                            </>
                        )}

                        <SocialLinks />
                    </motion.div>
                </div>
                <div className="scroll-indicator" aria-hidden="true">
                    <div className="scroll-mouse">
                        <div className="scroll-wheel"/>
                    </div>
                    <span>{strings.hero.scroll[lang]}</span>
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
                        alt={field(lang, profile.name, profile.nameEn)}
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
