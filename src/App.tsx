import { lazy, Suspense } from 'react'
import { LangProvider, useLang } from './lang'
import { Reveal } from './Reveal'
import logo from '/assets/logo.png'

// 懒加载 3D 场景：three.js 体积不小，让它和首屏文字并行加载，不互相阻塞
const HeroWave = lazy(() =>
  import('./HeroWave').then((m) => ({ default: m.HeroWave })),
)
const RobotArmViewer = lazy(() =>
  import('./RobotArm').then((m) => ({ default: m.RobotArmViewer })),
)
const SolarNav = lazy(() =>
  import('./SolarNav').then((m) => ({ default: m.SolarNav })),
)

function Header() {
  const { lang, t, setLang } = useLang()
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="AccelJoy Tech">
        <img className="brand-mark" src={logo} alt="" />
        <span className="brand-text">AccelJoy<span aria-hidden="true"> · </span>迅洲</span>
      </a>
      <nav className="nav-links" aria-label="导航">
        <a href="#business">{t.nav.business}</a>
        <a href="#team">{t.nav.team}</a>
        <a href="#manufacturing">{t.nav.manufacturing}</a>
        <a href="#contact">{t.nav.contact}</a>
      </nav>
      <div className="lang-switch" role="group" aria-label="Language">
        <button
          className={lang === 'zh' ? 'on' : ''}
          aria-pressed={lang === 'zh'}
          onClick={() => setLang('zh')}
        >
          中
        </button>
        <button
          className={lang === 'en' ? 'on' : ''}
          aria-pressed={lang === 'en'}
          onClick={() => setLang('en')}
        >
          EN
        </button>
      </div>
    </header>
  )
}

function Hero() {
  const { t } = useLang()
  return (
    <section className="hero" id="top">
      <Suspense fallback={null}>
        <HeroWave className="hero-wave" />
      </Suspense>
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1 className="hero-title">
            <span className="line">{t.hero.titleA}</span>
            <span className="line dim">{t.hero.titleB}</span>
          </h1>
          <p className="hero-lead">{t.hero.lead}</p>
          <p className="hero-body">{t.hero.body}</p>
          <div className="hero-actions">
            <a className="btn solid" href="mailto:info@acceljoy.com">{t.hero.ctaPrimary}</a>
            <a className="btn ghost" href="#business">{t.hero.ctaSecondary}</a>
          </div>
        </div>
        <div className="hero-arm">
          <Suspense fallback={null}>
            <RobotArmViewer />
          </Suspense>
        </div>
      </div>
    </section>
  )
}

function Stats() {
  const { t } = useLang()
  return (
    <div className="stats">
      {t.stats.map((s) => (
        <div className="stat" key={s.label}>
          <strong>{s.value}</strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  )
}

function Solar() {
  const { t } = useLang()
  return (
    <Reveal as="section" className="solar" id="solar">
      <Suspense fallback={null}>
        <SolarNav items={t.solar.items} goLabel={t.solar.go} />
      </Suspense>
      <p className="solar-hint">{t.solar.hint}</p>
    </Reveal>
  )
}

function Business() {
  const { t } = useLang()
  const { b, c } = t.business
  return (
    <Reveal as="section" className="section tinted" id="business">
      <div className="section-head">
        <p className="eyebrow">{t.business.eyebrow}</p>
        <h2>{t.business.title}</h2>
        <p className="section-body">{t.business.body}</p>
      </div>
      <div className="biz-grid">
        <div className="biz-track biz-b">
          <span className="biz-tag">{b.tag}</span>
          <h3>{b.title}</h3>
          <p className="biz-lead">{b.body}</p>
          <ul className="biz-items">
            {b.items.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="biz-track biz-c">
          <span className="biz-tag">{c.tag}</span>
          <h3>{c.title}</h3>
          <p className="biz-lead">{c.body}</p>
          <ul className="biz-items">
            {c.items.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  )
}

function Team() {
  const { t } = useLang()
  return (
    <Reveal as="section" className="section team" id="team">
      <div className="section-head">
        <p className="eyebrow">{t.team.eyebrow}</p>
        <h2>{t.team.title}</h2>
      </div>
      <div className="team-cols">
        {t.team.groups.map((g) => (
          <div className="team-col" key={g.n}>
            <span className="team-letter">{g.n}</span>
            <h3>{g.title}</h3>
            <p>{g.text}</p>
          </div>
        ))}
      </div>
      <blockquote className="team-quote">{t.team.quote}</blockquote>
    </Reveal>
  )
}

function Manufacturing() {
  const { t } = useLang()
  return (
    <Reveal as="section" className="section" id="manufacturing">
      <div className="section-head">
        <p className="eyebrow">{t.manufacturing.eyebrow}</p>
        <h2>{t.manufacturing.title}</h2>
        <p className="section-body">{t.manufacturing.body}</p>
      </div>
      <ol className="ed-list">
        {t.manufacturing.items.map((item) => (
          <li key={item.n}>
            <span className="ed-n">{item.n}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  )
}

function Vision() {
  const { t } = useLang()
  return (
    <Reveal as="section" className="vision">
      <p className="eyebrow">{t.vision.eyebrow}</p>
      <h2>{t.vision.title}</h2>
      <p>{t.vision.body}</p>
    </Reveal>
  )
}

function Contact() {
  const { t } = useLang()
  return (
    <section className="contact" id="contact">
      <p className="eyebrow">{t.contact.eyebrow}</p>
      <h2>{t.contact.title}</h2>
      <a className="contact-mail" href="mailto:info@acceljoy.com">
        info@acceljoy.com<span aria-hidden="true"> ↗</span>
      </a>
    </section>
  )
}

function Footer() {
  const { t } = useLang()
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} AccelJoy Tech 迅洲科技</span>
      <span>{t.footer}</span>
    </footer>
  )
}

function Page() {
  return (
    <>
      <Header />
      <main className="grain">
        <Hero />
        <Stats />
        <Solar />
        <Business />
        <Team />
        <Manufacturing />
        <Vision />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <Page />
    </LangProvider>
  )
}
