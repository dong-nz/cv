import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Expertise } from '@/components/sections/Expertise'
import { Experience } from '@/components/sections/Experience'
import { Projects } from '@/components/sections/Projects'
import { Contact } from '@/components/sections/Contact'

export function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Expertise />
      <Experience />
      <Projects />
      <Contact />
    </>
  )
}
