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

const socialLinks = [
    {
        label: "GitHub",
        href: profile.githubUrl,
        "aria-label": "View GitHub profile",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path
                    d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
        ),
    },
    {
        label: "LinkedIn",
        href: profile.linkedinUrl,
        "aria-label": "View LinkedIn profile",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
        ),
    },
    {
        label: "Email",
        href: `mailto:${profile.email}`,
        "aria-label": "Send email",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M22 4l-10 8L2 4"/>
            </svg>
        ),
    },
]

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
                    >
                        {useField(profile.tagline, profile.taglineEn)}
                    </motion.p>
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

                        <SocialLinks links={socialLinks}/>
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
