import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useWebsite } from "../data/WebsiteContent";
import { Icon, SocialIcon, type SocialId } from "./Icon";
import { SmartLink } from "./ui";
import { SearchForm } from "../pages/Search";

// `alsoActive` lists other pages that highlight a plain menu item; a trailing `/*` matches every page below it.
type MenuItem = { label: string; to?: string; alsoActive?: string[]; children?: MenuItem[] };

function useMenu(): MenuItem[] {
  const { copy: c } = useWebsite();
  return [
    { label: c["shared.nav-home"], to: "/" },
    {
      label: c["shared.nav-about-us"],
      children: [
        { label: c["shared.nav-about"], to: "/about-us/" },
        { label: c["shared.nav-history"], to: "/history/" },
        { label: c["shared.nav-faq"], to: "/faq/" },
      ],
    },
    {
      label: c["shared.nav-team"],
      children: [
        { label: c["shared.nav-board"], to: "/board-of-directors/" },
        { label: c["shared.nav-staff"], to: "/staff/" },
      ],
    },
    { label: c["shared.nav-services"], to: "/services/", alsoActive: ["/services/*"] },
    { label: c["shared.nav-partners"], to: "/partners/" },
    {
      label: c["shared.nav-forms-downloads"],
      children: [
        { label: c["shared.nav-registration-form"], to: "/registration-form/" },
        { label: c["shared.nav-membership-form"], to: "/membership-application-form/" },
        { label: c["shared.nav-kafo-form"], to: "/kafo-application-form/" },
        { label: c["shared.nav-loan-form"], to: "/loan-application-form/" },
        { label: c["shared.nav-downloads"], to: "/downloads/" },
      ],
    },
    { label: c["shared.nav-gallery"], to: "/photo-gallery/", alsoActive: ["/youtube-gallery/"] },
    { label: c["shared.nav-contact"], to: "/contact-us/" },
  ];
}

const samePage = (a: string, b: string) =>
  a.endsWith("/*")
    ? b.startsWith(a.slice(0, -1))
    : a.replace(/\/+$/, "") === b.replace(/\/+$/, "");

function Header() {
  const { copy: c, contact } = useWebsite();
  const menu = useMenu();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  return (
    <>
      <div className="top-bar">
        <div className="container container-wide top-bar-inner">
          <p className="top-bar-welcome">{c["shared.topbar-welcome"]}</p>
          <ul className="top-bar-links">
            {contact.phones[0] && (
              <li>
                <a href={`tel:${contact.phones[0].replace(/\s+/g, "")}`}>
                  <Icon name="phone" />
                  <span>{contact.phones[0]}</span>
                </a>
              </li>
            )}
            <li className="top-bar-email">
              <a href={`mailto:${contact.email}`}>
                <Icon name="mail" />
                <span>{contact.email}</span>
              </a>
            </li>
            <li>
              <SmartLink to={c["shared.member-login-url"]} className="top-bar-login">
                <Icon name="user" />
                <span>{c["shared.nav-member-login"]}</span>
              </SmartLink>
            </li>
          </ul>
        </div>
      </div>
      <header
        className="site-header"
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          if (searching) {
            setSearching(false);
            searchToggle.current?.focus();
          } else if (expanded) setExpanded(null);
          else if (open) {
            setOpen(false);
            toggle.current?.focus();
          }
        }}
      >
        <div className="container container-wide header-inner">
          <Link to="/" className="logo" aria-label={c["shared.name"]}>
            <img src={c["shared.logo"]} alt={c["shared.name"]} width="84" height="84" />
          </Link>
          <button
            ref={toggle}
            className="menu-toggle"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="navigation"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
          <nav
            id="navigation"
            className={`navigation${open ? " is-open" : ""}`}
            aria-label="Main menu"
          >
            <ul>
              {menu.map((item) => {
                const active = item.children
                  ? item.children.some((child) => child.to && samePage(child.to, pathname))
                  : [item.to, ...(item.alsoActive ?? [])].some((to) => to !== undefined && samePage(to, pathname));
                if (!item.children)
                  return (
                    <li key={item.label}>
                      <NavLink to={item.to!} end className={active ? "active" : ""}>
                        {item.label}
                      </NavLink>
                    </li>
                  );
                const isExpanded = expanded === item.label;
                return (
                  <li
                    key={item.label}
                    className={`has-sub${isExpanded ? " is-expanded" : ""}`}
                    onMouseLeave={() => setExpanded(null)}
                  >
                    <button
                      type="button"
                      className={active ? "active" : ""}
                      aria-expanded={isExpanded}
                      onClick={() => setExpanded(isExpanded ? null : item.label)}
                    >
                      {item.label}
                      <Icon name="chevronDown" />
                    </button>
                    <ul>
                      {item.children.map((child) => (
                        <li key={child.label}>
                          {child.to ? (
                            <SmartLink to={child.to}>{child.label}</SmartLink>
                          ) : (
                            <span>{child.label}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </nav>
          <button
            ref={searchToggle}
            className="search-toggle"
            type="button"
            aria-label={c["shared.search-button"]}
            aria-expanded={searching}
            aria-controls="header-search-panel"
            onClick={() => setSearching(!searching)}
          >
            <Icon name={searching ? "close" : "search"} />
          </button>
        </div>
        {searching ? (
          <div className="header-search" id="header-search-panel">
            <div className="container">
              <SearchForm autoFocus onSearch={() => setSearching(false)} />
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}

const socials: [SocialId, string, string][] = [
  ["facebook", "Facebook", "shared.social-facebook"],
  ["instagram", "Instagram", "shared.social-instagram"],
  ["x", "X (Twitter)", "shared.twitter-url"],
  ["linkedin", "LinkedIn", "shared.social-linkedin"],
  ["youtube", "YouTube", "shared.social-youtube"],
  ["tiktok", "TikTok", "shared.social-tiktok"],
];

function Footer() {
  const { copy: c, contact } = useWebsite();
  const links = [
    ["shared.nav-about", "/about-us/"],
    ["shared.nav-history", "/history/"],
    ["shared.nav-services", "/services/"],
    ["shared.nav-partners", "/partners/"],
    ["shared.nav-gallery", "/photo-gallery/"],
    ["shared.nav-faq", "/faq/"],
  ] as const;
  const forms = [
    ["shared.nav-membership-form", "/membership-application-form/"],
    ["shared.nav-loan-form", "/loan-application-form/"],
    ["shared.nav-kafo-form", "/kafo-application-form/"],
    ["shared.nav-registration-form", "/registration-form/"],
    ["shared.nav-downloads", "/downloads/"],
  ] as const;
  return (
    <footer className="site-footer">
      <div className="container container-wide footer-main">
        <div className="footer-brand">
          <Link to="/" aria-label={c["shared.name"]}>
            <img src={c["shared.footer-logo"]} alt={c["shared.name"]} width="96" height="96" />
          </Link>
          <p>{c["shared.footer-text"]}</p>
          <h2>{c["shared.footer-social-heading"]}</h2>
          <ul className="footer-socials">
            {socials
              .filter(([, , key]) => c[key as keyof typeof c])
              .map(([id, name, key]) => (
                <li key={id}>
                  <a href={c[key as keyof typeof c]} target="_blank" rel="noreferrer" aria-label={name} title={name}>
                    <SocialIcon id={id} />
                  </a>
                </li>
              ))}
          </ul>
        </div>
        <nav className="footer-column" aria-label={c["shared.footer-links-heading"]}>
          <h2>{c["shared.footer-links-heading"]}</h2>
          <ul>
            {links.map(([key, to]) => (
              <li key={to}>
                <Link to={to}>{c[key]}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav className="footer-column" aria-label={c["shared.footer-forms-heading"]}>
          <h2>{c["shared.footer-forms-heading"]}</h2>
          <ul>
            {forms.map(([key, to]) => (
              <li key={to}>
                <Link to={to}>{c[key]}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer-column footer-contact">
          <h2>{c["shared.footer-contact-heading"]}</h2>
          <ul>
            <li>
              <Icon name="pin" />
              <span>{contact.address}</span>
            </li>
            {contact.phones.slice(0, 2).map((phone) => (
              <li key={phone}>
                <Icon name="phone" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
              </li>
            ))}
            <li>
              <Icon name="mail" />
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container container-wide footer-bottom-inner">
          <span>
            © {new Date().getFullYear()} {c["shared.copyright"]}
          </span>
          <button type="button" className="footer-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            {c["shared.footer-top"]}
            <Icon name="chevronDown" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export function Layout() {
  const { copy: c } = useWebsite();
  const { pathname, hash } = useLocation();
  const previousPath = useRef(pathname);
  useEffect(() => {
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", c["shared.description"]);
    const frame = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : null;
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
      if (previousPath.current !== pathname)
        document.getElementById("main-content")?.focus({ preventScroll: true });
      previousPath.current = pathname;
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, c]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
