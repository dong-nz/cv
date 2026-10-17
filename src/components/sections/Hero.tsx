import {motion, useScroll, useTransform} from "motion/react"
import {InView} from "@/components/ui/InView"
import {resumeAvailable, resumeLanguages, resumeUrlFor, resumeLanguageLabels} from "@/data/resume"
import type {Language} from '@/types'
import {useLanguage} from '@/hooks/useLanguage'
import {strings} from '@/i18n/strings'
import {useField} from '@/i18n/useField'
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
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.3}}
                aria-labelledby="hero-heading"
            >
                <div className="hero-bg-grid"/>
                <HeroParticles/>
                <motion.div
                    className="hero-content"
                    initial={{opacity: 0, x: -30}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.6, delay: 0.2}}
                >
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.4, delay: 0.15}}
                    >
          <span className="hero-greeting">
            <span className="greeting-dot"/>
              {strings.hero.greeting[lang]}
          </span>
                    </motion.div>
                    <motion.h1
                        id="hero-heading"
                        className="hero-name"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.3}}
                    >
                        <span className="name-highlight">{useField(profile.name, profile.nameEn)}</span>
                    </motion.h1>
                    <motion.p
                        className="hero-title"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.4}}
                    >
                        <Typewriter texts={profile.roles}/>
                    </motion.p>
                    <motion.p
                        className="hero-tagline"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.5}}
                        dangerouslySetInnerHTML={{__html: useField(profile.tagline, profile.taglineEn)}}
                    />
                    <motion.div
                        className="hero-cta"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.6}}
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
                </motion.div>
                <div className="scroll-indicator" aria-hidden="true">
                    <div className="scroll-mouse">
                        <div className="scroll-wheel"/>
                    </div>
                    <span>{strings.hero.scroll[lang]}</span>
                </div>
                <motion.div
                    className="hero-visual"
                    style={{y}}
                    initial={{opacity: 0, x: 30}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.6, delay: 0.4}}
                >
                    <img
                        src="/profile-photo.webp"
                        alt="Profile photo"
                        className="hero-photo"
                    />
                </motion.div>
            </motion.section>
        </InView>
    )
}
