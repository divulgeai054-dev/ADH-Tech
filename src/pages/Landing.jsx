import Navbar  from '../components/Navbar'
import Footer  from '../components/Footer'
import Hero    from '../sections/Hero'
import About   from '../sections/About'
import Services from '../sections/Services'
import Team    from '../sections/Team'
import Pricing from '../sections/Pricing'
import Contact from '../sections/Contact'

export default function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Team />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
