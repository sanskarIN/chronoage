import { PageHeader } from '../components/PageHeader';
import { Logo } from '../components/Logo';
import { mailto, project } from '../config/project';
import { en } from '../i18n/en';
import { sharedText } from '../i18n/shared';

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
        <div className="version-chip">{sharedText.versionLabel(project.version)}</div>
      </section>
      <section className="about-grid">
        <article className="panel">
          <p className="eyebrow">{en.about.projectEyebrow}</p>
          <h2>{en.about.licenseTitle}</h2>
          <p>{en.about.licenseDescription}</p>
          <a href={project.repositoryUrl} target="_blank" rel="noreferrer">
            {en.about.sourceLink}
          </a>
        </article>
        <article className="panel">
          <p className="eyebrow">{en.about.supportEyebrow}</p>
          <h2>{en.about.supportTitle}</h2>
          <p>
            {en.about.supportLabel}{' '}
            <a href={mailto(project.supportEmail)}>{project.supportEmail}</a>
          </p>
          <p>
            {en.about.businessLabel}{' '}
            <a href={mailto(project.businessEmails[0])}>{project.businessEmails[0]}</a>
            <br />
            <a href={mailto(project.businessEmails[1])}>{project.businessEmails[1]}</a>
          </p>
        </article>
        <article className="panel">
          <p className="eyebrow">{en.about.fundingEyebrow}</p>
          <h2>{en.about.fundingTitle}</h2>
          <p>{en.about.fundingDescription}</p>
          <a className="bmc-link" href={project.fundingUrl} target="_blank" rel="noreferrer">
            {en.about.fundingLink}
          </a>
        </article>
        <article className="panel">
          <p className="eyebrow">{en.about.creditEyebrow}</p>
          <h2>{project.credit}</h2>
          <p>{en.about.creditDescription}</p>
          <a href={project.profileUrl} target="_blank" rel="noreferrer">
            {en.about.profileLink}
          </a>
        </article>
      </section>
    </div>
  );
}
