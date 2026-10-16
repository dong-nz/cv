import {SectionHeading} from '@/components/ui/SectionHeading'

import {useLanguage} from '@/hooks/useLanguage'
import {strings} from '@/i18n/strings'

export function PhilosophyPage() {
    const {lang} = useLanguage()
    return (
        <section className="section container-content" aria-labelledby="philosophy-heading">
            <SectionHeading id="philosophy-heading" title={strings.philosophy.heading[lang]} tag={strings.philosophy.heading[lang]}/>
            <div className="prose">
                {strings.philosophy.quotes.map((quote) => (
                    <div key={quote.title[lang]} className="philosophy-quote">
                        <h3>
                            {quote.title[lang]}
                        </h3>
                        <div dangerouslySetInnerHTML={{__html: quote.details[lang]}}/>
                    </div>
                ))}
            </div>
        </section>
    )
}
