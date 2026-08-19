import { PageHeader } from '../components/PageHeader';
import { Logo } from '../components/Logo';
import { en } from '../i18n/en';

export function AboutPage(): React.JSX.Element {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={en.about.eyebrow}
        title={en.about.title}
        description={en.about.description}
      />
      <section className="panel about-hero">
        <Logo />
        <p>{en.about.heroDescription}</p>
        <div className="version-chip">{en.about.version}</div>
      </section>
      <section className="about-grid">
        <article className="panel">
          <p className="eyebrow">{en.about.projectEyebrow}</p>
          <h2>{en.about.licenseTitle}</h2>
          <p>{en.about.licenseDescription}</p>
          <a href="https://github.com/sanskarIN/chronoage" target="_blank" rel="noreferrer">
            {en.about.sourceLink}
          </a>
        </article>
        <article className="panel">
          <p className="eyebrow">{en.about.supportEyebrow}</p>
          <h2>{en.about.supportTitle}</h2>
          <p>
            {en.about.supportLabel}{' '}
            <a href="mailto:supportramsandesh@gmail.com">supportramsandesh@gmail.com</a>
          </p>
          <p>
            {en.about.businessLabel}{' '}
            <a href="mailto:sanskarin@outlook.in">sanskarin@outlook.in</a>
            <br />
            <a href="mailto:sanskarin.business@gmail.com">sanskarin.business@gmail.com</a>
          </p>
        </article>
        <article className="panel">
          <p className="eyebrow">{en.about.fundingEyebrow}</p>
          <h2>{en.about.fundingTitle}</h2>
          <p>{en.about.fundingDescription}</p>
          <a
            className="bmc-link"
            href="https://buymeacoffee.com/sanskarIN"
            target="_blank"
            rel="noreferrer"
          >
            {en.about.fundingLink}
          </a>
        </article>
        <article className="panel">
          <p className="eyebrow">{en.about.creditEyebrow}</p>
          <h2>{en.about.creditTitle}</h2>
          <p>{en.about.creditDescription}</p>
          <a href="https://github.com/sanskarIN" target="_blank" rel="noreferrer">
            {en.about.profileLink}
          </a>
        </article>
      </section>
    </div>
  );
}
