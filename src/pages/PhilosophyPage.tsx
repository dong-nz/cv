import {SectionHeading} from '@/components/ui/SectionHeading'
import {EditableText} from '@/components/ui/EditableText'
import {motion} from 'motion/react'
import {InView} from '@/components/ui/InView'
import { TagListEditor } from '@/components/ui/TagListEditor'
import { RecordControls, AddGhost } from '@/components/ui/RecordControls'
import { useEdit } from '@/hooks/useEdit'
import { useI18n } from '@/i18n/provider'
import { setPath, parsePath } from '@/i18n/draft'

// philosophyQuotes are text-only records: they live in the language document
// being edited, so add and delete go through the plain document primitives.
const quotesPath = 'profile.philosophyQuotes'

export function PhilosophyPage() {
    const {ui: s, content: c} = useI18n()
    const edit = useEdit()
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
                            className={edit ? 'philosophy-quote edit-record-host' : 'philosophy-quote'}
                            initial={{opacity: 0, y: 24}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true, amount: 0.2}}
                            transition={{duration: 0.45, ease: 'easeOut', delay: i * 0.08}}
                        >
                            {edit && (
                                <RecordControls
                                    label={quote.title}
                                    canUp={i > 0}
                                    canDown={i < c.profile.philosophyQuotes.length - 1}
                                    onUp={() => edit.moveItem(edit.textDoc, quotesPath, i, i - 1)}
                                    onDown={() => edit.moveItem(edit.textDoc, quotesPath, i, i + 1)}
                                    onDelete={() => {
                                        const doc = edit.dataOf(edit.textDoc) as Record<string, any>
                                        const next = setPath(doc, parsePath(quotesPath),
                                            (doc.profile.philosophyQuotes as unknown[]).filter((_, j) => j !== i))
                                        edit.apply(edit.textDoc, next)
                                    }}
                                />
                            )}
                            <EditableText
                                as="h3"
                                path={`profile.philosophyQuotes[${i}].title`}
                                label={`${s.edit.fields.quoteTitle} ${i + 1}`}
                            >
                                {quote.title}
                            </EditableText>
                            <TagListEditor
                                arrayPath={`profile.philosophyQuotes[${i}].details`}
                                items={quote.details}
                                containerAs="div"
                                containerClassName="philosophy-quote-details"
                                as="p"
                                labelPrefix={`${quote.title} — ${s.edit.fields.quoteDetail}`}
                                addLabel={s.edit.addQuoteDetail}
                            />
                        </motion.div>
                    ))}
                    {edit && (
                        <AddGhost
                            label={s.edit.addQuote}
                            onClick={() => {
                                const doc = edit.dataOf(edit.textDoc) as Record<string, any>
                                const next = setPath(doc, parsePath(quotesPath),
                                    [...(doc.profile.philosophyQuotes as unknown[]), { title: 'New quote', details: ['Write the quote here.'] }])
                                edit.apply(edit.textDoc, next)
                            }}
                        />
                    )}
                </div>
            </motion.section>
        </InView>
    )
}
