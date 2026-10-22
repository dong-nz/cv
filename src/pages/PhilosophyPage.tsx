import {SectionHeading} from '@/components/ui/SectionHeading'
import {EditableText} from '@/components/ui/EditableText'
import {motion} from 'motion/react'
import {InView} from '@/components/ui/InView'

import {useI18n} from '@/i18n/provider'

export function PhilosophyPage() {
    const {ui: s, content: c} = useI18n()
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
                    {c.profile.philosophyQuotes.map((quote, i) => (
                        <motion.div
                            key={i}
                            className="philosophy-quote"
                            initial={{opacity: 0, y: 24}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true, amount: 0.2}}
                            transition={{duration: 0.45, ease: 'easeOut', delay: i * 0.08}}
                        >
                            <EditableText
                                as="h3"
                                path={`profile.philosophyQuotes[${i}].title`}
                                label={`${s.edit.fields.quoteTitle} ${i + 1}`}
                            >
                                {quote.title}
                            </EditableText>
                            <div>
                                {quote.details.map((detail, j) => (
                                    <EditableText
                                        as="p"
                                        key={j}
                                        path={`profile.philosophyQuotes[${i}].details[${j}]`}
                                        label={`${s.edit.fields.quoteDetail} ${j + 1}`}
                                        multiline
                                    >
                                        {detail}
                                    </EditableText>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        </InView>
    )
}
