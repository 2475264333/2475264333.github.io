import { lazy, Suspense } from 'react'
import { LangProvider, useLang } from './lang'
import { ThemeProvider, useTheme } from './theme'
import { Reveal } from './Reveal'
import logo from '/assets/logo.png'

// 懒加载 3D 场景：three.js 体积不小，让它和首屏文字并行加载，不互相阻塞
const HeroWave = lazy(() =>
  import('./HeroWave').then((m) => ({ default: m.HeroWave })),
)
const RobotArmViewer = lazy(() =>
  import('./NeuralCore').then((m) => ({ default: m.NeuralCore })),
)
const SolarNav = lazy(() =>
  import('./SolarNav').then((m) => ({ default: m.SolarNav })),
)

function Header() {
  const { lang, t, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()
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
      <button
        className="theme-switch"
        aria-label={theme === 'day' ? 'Switch to night theme' : 'Switch to day theme'}
        title={theme === 'day' ? '星空主题' : '简约主题'}
        onClick={toggleTheme}
      >
        {theme === 'day' ? '☾' : '☀'}
      </button>
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
      <div className="team-inner">
        <div className="section-head">
          <p className="eyebrow">{t.team.eyebrow}</p>
          <h2>{t.team.title}</h2>
        </div>
        <div className="team-copy">
          <p>{t.team.copyOne}</p>
          <p>{t.team.copyTwo}</p>
        </div>
      </div>
      <div className="credential-row">
        {t.team.credentials.map((cred) => (
          <div className="credential" key={cred.label}>
            <span>{cred.label}</span>
            <strong>{cred.value}</strong>
          </div>
        ))}
      </div>
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
    <Reveal as="section" className="vision" id="vision">
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

function Motto() {
  const { t } = useLang()
  const chars = Array.from(t.motto)
  return (
    <div className="motto" aria-label={t.motto}>
      <span className="motto-dash" aria-hidden="true">
        ——
      </span>
      <span className="motto-text" aria-hidden="true">
        {chars.map((ch, i) => (
          <i key={i} style={{ '--d': `${i * 0.045}s` } as React.CSSProperties}>
            {ch === ' ' ? '\u00A0' : ch}
          </i>
        ))}
      </span>
      <span className="motto-dash" aria-hidden="true">
        ——
      </span>
    </div>
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
        <Motto />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <Page />
      </LangProvider>
    </ThemeProvider>
  )
}
