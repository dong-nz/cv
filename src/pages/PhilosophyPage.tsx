import {SectionHeading} from '@/components/ui/SectionHeading'
import {motion} from 'motion/react'
import {InView} from '@/components/ui/InView'

import {useI18n} from '@/i18n/provider'

export function PhilosophyPage() {
    const {ui: s} = useI18n()
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
                <SectionHeading id="philosophy-heading" title={s.philosophy.heading} tag={s.philosophy.heading}/>
                <div className="prose prose-wide">
                    {s.philosophy.quotes.map((quote, i) => (
                        <motion.div
                            key={i}
                            className="philosophy-quote"
                            initial={{opacity: 0, y: 24}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true, amount: 0.2}}
                            transition={{duration: 0.45, ease: 'easeOut', delay: i * 0.08}}
                        >
                            <h3>
                                {quote.title}
                            </h3>
                            <div>
                                {quote.details.map((detail, j) => (
                                    <p key={j}>{detail}</p>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        </InView>
    )
}
