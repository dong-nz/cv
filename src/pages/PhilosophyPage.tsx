import {SectionHeading} from '@/components/ui/SectionHeading'

import {useLanguage} from '@/hooks/useLanguage'
import {strings} from '@/i18n/strings'

export function PhilosophyPage() {
    const {lang} = useLanguage()
    return (
        <section className="section container-content" aria-labelledby="engineering-heading">
            <SectionHeading title={strings.philosophy.heading[lang]} tag={strings.philosophy.heading[lang]}/>
            {strings.philosophy.quotes.map((quote) => (
                <div key={quote.title[lang]} style={{marginBottom: '48px'}}>
                    <h3 style={{fontSize: '20px', marginBottom: '24px', color: 'var(--text-primary)'}}>
                        {quote.title[lang]}
                    </h3>
                    {/* Placeholder for expanded content */}
                    <p style={{color: 'var(--text-secondary)'}} dangerouslySetInnerHTML={{__html: quote.details[lang]}}/>
                </div>
            ))}
        </section>
    )
}
