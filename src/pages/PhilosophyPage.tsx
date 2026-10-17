import {SectionHeading} from '@/components/ui/SectionHeading'
import {motion} from 'motion/react'
import {InView} from '@/components/ui/InView'

import {useLanguage} from '@/hooks/useLanguage'
import {strings} from '@/i18n/strings'

export function PhilosophyPage() {
    const {lang} = useLanguage()
    return (
        <InView>
            <motion.section
                className="section container-content"
                aria-labelledby="philosophy-heading"
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.1}}
                variants={{
                    hidden: {opacity: 0},
                    visible: {opacity: 1, transition: {duration: 0.5}},
                }}
            >
                <SectionHeading id="philosophy-heading" title={strings.philosophy.heading[lang]} tag={strings.philosophy.heading[lang]}/>
                <div className="prose prose-wide">
                    {strings.philosophy.quotes.map((quote, i) => (
                        <motion.div
                            key={quote.title[lang]}
                            className="philosophy-quote"
                            initial={{opacity: 0, y: 24}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true, amount: 0.2}}
                            transition={{duration: 0.45, ease: 'easeOut', delay: i * 0.08}}
                        >
                            <h3>
                                {quote.title[lang]}
                            </h3>
                            <div dangerouslySetInnerHTML={{__html: quote.details[lang]}}/>
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        </InView>
    )
}
