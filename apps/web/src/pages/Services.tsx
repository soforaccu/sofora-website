import type { CSSProperties, ReactNode } from "react";
import { Link, useParams } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import { websiteDownloads } from "../data/downloads";
import { applyPath, isLoan, servicePath, type Product } from "../data/content";
import { LoanCalculator } from "../components/LoanCalculator";
import { Icon, ServiceIcon } from "../components/Icon";
import { CtaBanner, HeroBanner, ProductGrid, lines, usePageTitle } from "../components/ui";
import { NotFound } from "./NotFound";

// /services/: every loan and savings product, how membership works, calculator and forms.
export function ServicesHub() {
  const { copy: c, loans, savings } = useWebsite();
  const files = websiteDownloads(c);
  const forms = [
    ["shared.nav-membership-form", "/membership-application-form/"],
    ["shared.nav-loan-form", "/loan-application-form/"],
    ["shared.nav-kafo-form", "/kafo-application-form/"],
    ["shared.nav-registration-form", "/registration-form/"],
  ] as const;
  return (
    <>
      <ServiceHero title={c["loans.hub-title"]} overlap>
        <p className="service-hero-text">{c["loans.intro"]}</p>
      </ServiceHero>
      <div className="container">
        <ul className="service-highlights">
          {(
            [
              [1, "calendar"],
              [2, "money"],
              [3, "people"],
              [4, "check"],
            ] as const
          ).map(([n, icon]) => (
            <li key={n}>
              <span className="service-highlight-icon">
                <Icon name={icon} />
              </span>
              <span>
                <strong>{c[`loans.highlight-${n}-title`]}</strong>
                {c[`loans.highlight-${n}-text`]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <section className="section services-section services-section-first" id="loans">
        <div className="container">
          <div className="section-title">
            <h2>{c["loans.products-heading"]}</h2>
            <p>{c["loans.products-text"]}</p>
          </div>
          <ProductGrid products={loans} columns={4} showApply={false} />
        </div>
      </section>

      <section className="section section-white services-section" id="savings">
        <div className="container">
          <div className="section-title">
            <h2>{c["saving.heading"]}</h2>
            <p>{c["saving.p1"]}</p>
          </div>
          <ProductGrid products={savings} columns={4} showApply={false} />
        </div>
      </section>

      <section className="section services-section how-it-works">
        <div className="container">
          <div className="section-title">
            <h2>{c["loans.how-heading"]}</h2>
            <p>{c["loans.how-text"]}</p>
          </div>
          <ol className="how-steps">
            {([1, 2, 3] as const).map((n) => (
              <li key={n}>
                <span className="how-number">{n}</span>
                <h3>{c[`loans.how-${n}-title`]}</h3>
                <p>{c[`loans.how-${n}-text`]}</p>
              </li>
            ))}
          </ol>
          <div className="how-action">
            <Link className="btn" to="/membership-application-form/">
              {c["loans.how-button"]}
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <div className="services-section section-white">
        <LoanCalculator />
      </div>

      <section className="section services-section" id="forms">
        <div className="container">
          <div className="section-title">
            <h2>{c["loans.forms-heading"]}</h2>
            <p>{c["loans.forms-text"]}</p>
          </div>
          <div className="forms-grid">
            <div className="forms-box">
              <h3>{c["loans.forms-online"]}</h3>
              <ul className="forms-list">
                {forms.map(([key, to]) => (
                  <li key={to}>
                    <Link to={to}>
                      <Icon name="arrow" />
                      {c[key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="forms-box">
              <h3>{c["loans.forms-pdf"]}</h3>
              <ul className="forms-list">
                {files.map((file) => (
                  <li key={file.path}>
                    <a href={file.path} download>
                      <Icon name="download" />
                      {file.title.replace(/-/g, " ")}
                    </a>
                  </li>
                ))}
              </ul>
              <Link className="text-link" to="/downloads/">
                {c["loans.forms-all"]}
                <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ServicesCta />
    </>
  );
}

// Navy hero over the shared header photo, used by the services hub and every product page.
function ServiceHero({
  title,
  kicker,
  overlap = false,
  children,
}: {
  title: string;
  kicker?: string;
  overlap?: boolean;
  children: ReactNode;
}) {
  const { copy: c } = useWebsite();
  usePageTitle(title);
  return (
    <section className={`service-hero${overlap ? " service-hero-overlap" : ""}`} style={{ "--hero-image": `url("${c["shared.header-image"]}")` } as CSSProperties}>
      <div className="container">
        {kicker ? <p className="service-hero-kicker">{kicker}</p> : null}
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  );
}

// /services/<product>/, e.g. /services/car-loan/.
export function ServiceDetail() {
  const { slug } = useParams();
  const { loans, savings } = useWebsite();
  const product = [...loans, ...savings].find((p) => servicePath(p.id) === `/services/${slug}/`);
  return product ? <ServicePage key={product.id} product={product} /> : <NotFound />;
}

function ServicePage({ product }: { product: Product }) {
  const { copy: c, contact, loans, savings } = useWebsite();
  const loan = isLoan(product.id);
  const related = (loan ? loans : savings).filter((p) => p.id !== product.id).slice(0, 3);
  const apply = (
    <Link className="btn" to={applyPath(product.id)}>
      {loan ? c["loans.apply-link"] : c["saving.apply"]}
      <Icon name="arrow" />
    </Link>
  );
  const phone = contact.phones[0];
  return (
    <>
      <ServiceHero
        title={product.title}
        kicker={loan ? c["loans.detail-kicker"] : c["saving.detail-kicker"]}
      >
        <div className="service-hero-grid service-hero-product">
          <div>
            <p className="service-hero-text">{product.description}</p>
            {loan ? (
              <ul className="service-hero-facts">
                {([4, 2] as const).map((n) => (
                  <li key={n}>
                    <Icon name="check" />
                    {c[`loans.fact-${n}`]}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="service-actions">
              <Link className="btn btn-light" to={applyPath(product.id)}>
                {loan ? c["loans.apply-link"] : c["saving.apply"]}
                <Icon name="arrow" />
              </Link>
              <Link className="service-hero-back" to={`/services/#${loan ? "loans" : "savings"}`}>
                <Icon name="chevronLeft" />
                {c["loans.back"]}
              </Link>
            </div>
          </div>
          <span className="service-hero-icon">
            <ServiceIcon id={product.id} />
          </span>
        </div>
      </ServiceHero>

      <div className="container service-layout">
        <div className="service-main">
          <section>
            <h2>{c["loans.audience-heading"]}</h2>
            <p>{product.audience}</p>
          </section>
          <section>
            <h2>{c["loans.benefits-heading"]}</h2>
            <ul className="check-list">
              {lines(product.benefits).map((item) => (
                <li key={item}>
                  <Icon name="check" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>{c["loans.requirements-heading"]}</h2>
            <ul className="need-list">
              {lines(product.requirements).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>{loan ? c["loans.steps-heading"] : c["saving.steps-heading"]}</h2>
            <ol className="step-list">
              {lines(product.steps).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
          {product.id === "business" ? <BusinessStory /> : null}
          {product.id === "saving-boxes" ? <SavingBoxesStory /> : null}
        </div>

        <aside className="service-aside">
          <div className="service-card">
            <h2>{product.title}</h2>
            {loan ? (
              <>
                <h3>{c["loans.facts-heading"]}</h3>
                <ul className="check-list">
                  {([1, 2, 3, 4] as const).map((n) => (
                    <li key={n}>
                      <Icon name="check" />
                      {c[`loans.fact-${n}`]}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {apply}
          </div>
          <div className="service-card service-help">
            <h3>{c["loans.help-heading"]}</h3>
            <p>{loan ? c["loans.help-text"] : c["saving.help-text"]}</p>
            {phone ? (
              <a href={`tel:${phone.replace(/\s+/g, "")}`}>
                <Icon name="phone" />
                {phone}
              </a>
            ) : null}
            <a href={`mailto:${contact.email}`}>
              <Icon name="mail" />
              {contact.email}
            </a>
          </div>
        </aside>
      </div>

      <section className="section services-section service-related">
        <div className="container">
          <div className="home-loans-head">
            <div>
              <h2>{loan ? c["loans.related-heading"] : c["saving.related-heading"]}</h2>
            </div>
            <Link className="btn btn-outline home-loans-all" to="/services/">
              {c["loans.back"]}
              <Icon name="arrow" />
            </Link>
          </div>
          <ProductGrid products={related} showApply={false} />
        </div>
      </section>
      <ServicesCta />
    </>
  );
}

// Closing call to action, matching the gallery, contact and partners pages.
function ServicesCta() {
  const { copy: c } = useWebsite();
  return (
    <CtaBanner
      heading={c["loans.cta-heading"]}
      text={c["loans.cta-text"]}
      primary={[c["loans.cta-button"], "/membership-application-form/"]}
      secondary={[c["loans.cta-contact"], "/contact-us/"]}
    />
  );
}

function BusinessStory() {
  const { copy: c } = useWebsite();
  return (
    <section className="service-story media-split">
      <div>
        <h2>{c["loans.business-heading"]}</h2>
        <p className="tagline">{c["loans.business-tagline"]}</p>
        <p className="lead">{c["loans.business-question"]}</p>
        <p>{c["loans.business-p1"]}</p>
        <p>
          {c["loans.business-p2"]} <Link to="/faq/">{c["loans.business-faq"]}</Link>
        </p>
      </div>
      <a className="video-thumb" href={c["loans.business-video"]} target="_blank" rel="noreferrer">
        <img src={c["loans.business-image"]} alt="" loading="lazy" />
        <span className="play-button">
          <Icon name="play" />
          <span className="sr-only">{c["loans.business-video-label"]}</span>
        </span>
      </a>
    </section>
  );
}

function SavingBoxesStory() {
  const { copy: c } = useWebsite();
  return (
    <section className="service-story prose">
      <h2>{c["saving.boxes-heading"]}</h2>
      <p>{c["saving.boxes-p1"]}</p>
      <p>{c["saving.boxes-p2"]}</p>
      <p>{c["saving.boxes-p3"]}</p>
      <p>{c["saving.boxes-p4"]}</p>
      <img className="prose-image" src={c["saving.chart-image"]} alt="" loading="lazy" />
      <img className="prose-image" src={c["saving.boxes-image"]} alt="" loading="lazy" />
      <p>{c["saving.boxes-p5"]}</p>
    </section>
  );
}

export function Downloads() {
  const { copy: c } = useWebsite();
  usePageTitle(c["downloads.title"]);
  const files = websiteDownloads(c);
  const forms = [
    ["shared.nav-membership-form", "/membership-application-form/"],
    ["shared.nav-loan-form", "/loan-application-form/"],
    ["shared.nav-kafo-form", "/kafo-application-form/"],
    ["shared.nav-registration-form", "/registration-form/"],
  ] as const;
  return (
    <>
      <HeroBanner title={c["downloads.title"]} intro={c["downloads.intro"]} image={c["downloads.hero-image"]}>
        <div className="hero-chips">
          <span>
            <Icon name="download" />
            {files.length} {c["downloads.count"]}
          </span>
          <Link to="/membership-application-form/">
            <Icon name="browser" />
            {c["downloads.online-button"]}
          </Link>
        </div>
      </HeroBanner>
      <div className="container downloads-body">
        <section className="downloads-files">
          <h2>{c["downloads.files-heading"]}</h2>
          <p>{c["downloads.files-text"]}</p>
          <ul className="download-grid">
            {files.map((file) => (
              <li key={file.path} className="download-card">
                <div className="download-card-top">
                  <span className="download-file-icon" aria-hidden="true">
                    PDF
                  </span>
                  <span className="download-category">{file.category}</span>
                </div>
                <h3>{file.title.replace(/-/g, " ")}</h3>
                <p className="download-date">
                  <Icon name="calendar" />
                  {c["downloads.updated"]} {file.date}
                </p>
                <div className="download-actions">
                  <a className="btn btn-small" href={file.path} download>
                    <Icon name="download" />
                    {c["downloads.button"]}
                  </a>
                  <Link className="text-link" to={file.online}>
                    {c["downloads.online-button"]}
                    <Icon name="arrow" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <aside className="downloads-aside">
          <div className="side-card side-card-navy">
            <h3>{c["downloads.online-heading"]}</h3>
            <p>{c["downloads.online-text"]}</p>
            <ul className="side-links">
              {forms.map(([key, to]) => (
                <li key={to}>
                  <Link to={to}>
                    {c[key]}
                    <Icon name="arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="side-card">
            <h3>{c["downloads.bring-heading"]}</h3>
            <ul className="side-checklist">
              {([1, 2, 3] as const).map((n) => (
                <li key={n}>
                  <Icon name="check" />
                  {c[`downloads.bring-${n}`]}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      <CtaBanner
        heading={c["downloads.cta-heading"]}
        text={c["downloads.cta-text"]}
        primary={[c["downloads.cta-button"], "/contact-us/"]}
        secondary={[c["downloads.cta-services"], "/services/"]}
      />
    </>
  );
}
