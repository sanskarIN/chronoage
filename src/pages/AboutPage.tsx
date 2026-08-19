import { PageHeader } from '../components/PageHeader';
import { Logo } from '../components/Logo';

export function AboutPage(): React.JSX.Element {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Open source" title="About ChronoAge" description="A polished, privacy-first age and date calculator built as a public portfolio project." />
      <section className="panel about-hero">
        <Logo />
        <p>ChronoAge calculates exact calendar ages, intervals, birthdays, and milestones without requiring an account or server.</p>
        <div className="version-chip">Version 1.0.0</div>
      </section>
      <section className="about-grid">
        <article className="panel"><p className="eyebrow">Project</p><h2>MIT licensed</h2><p>You can use, study, modify, and redistribute ChronoAge under the MIT License.</p><a href="https://github.com/sanskarIN/chronoage" target="_blank" rel="noreferrer">View source on GitHub ↗</a></article>
        <article className="panel"><p className="eyebrow">Support</p><h2>Get help</h2><p>Support: <a href="mailto:supportramsandesh@gmail.com">supportramsandesh@gmail.com</a></p><p>Business: <a href="mailto:sanskarin@outlook.in">sanskarin@outlook.in</a><br /><a href="mailto:sanskarin.business@gmail.com">sanskarin.business@gmail.com</a></p></article>
        <article className="panel"><p className="eyebrow">Funding</p><h2>Buy Me a Coffee</h2><p>ChronoAge is fully usable without donating. Optional support helps open-source development.</p><a className="bmc-link" href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">☕ Support sanskarIN ↗</a></article>
        <article className="panel"><p className="eyebrow">Credit</p><h2>Made by the Sanskar</h2><p>Designed and developed with an emphasis on accessibility, privacy, maintainability, and precise date logic.</p><a href="https://github.com/sanskarIN" target="_blank" rel="noreferrer">github.com/sanskarIN ↗</a></article>
      </section>
    </div>
  );
}
