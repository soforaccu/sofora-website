import { copyFields, type PageId } from "./copy";
import { servicePath } from "./content";
import type { WebsiteContent } from "./websiteDefaults";

type Entry = { title: string; path: string; text: string };

const pagePaths: Partial<Record<PageId, [titleKey: keyof WebsiteContent["copy"], path: string]>> = {
  about: ["about.title", "/about-us/"],
  history: ["history.title", "/history/"],
  faq: ["faq.title", "/faq/"],
  board: ["board.title", "/board-of-directors/"],
  staff: ["staff.title", "/staff/"],
  loans: ["loans.hub-title", "/services/"],
  saving: ["saving.heading", "/services/#savings"],
  downloads: ["downloads.title", "/downloads/"],
  photos: ["shared.nav-gallery", "/photo-gallery/"],
  videos: ["shared.nav-gallery", "/youtube-gallery/"],
  contact: ["contact.title", "/contact-us/"],
  partners: ["partners.title", "/partners/"],
};
const posts = [
  ["blog.post-1-", "/exciting-news-for-sofora-cooperative-credit-union-members/"],
  ["blog.post-2-", "/the-evolution-of-sofora/"],
] as const;

// Gathers the visible text of each page (and each blog post) from the current content.
export function websiteSearchEntries(content: WebsiteContent): Entry[] {
  const { copy: c } = content;
  const textOf = (page: PageId, skipPrefix?: string) =>
    copyFields
      .filter((f) => f.page === page && f.kind === "text" && !(skipPrefix && f.key.startsWith(skipPrefix)))
      .map((f) => c[f.key])
      .join(" ");
  const list: Entry[] = [{ title: c["shared.nav-home"], path: "/", text: textOf("home") }];
  for (const [page, [titleKey, path]] of Object.entries(pagePaths) as [PageId, [keyof typeof c, string]][]) {
    const extra =
      page === "faq" ? content.faqs.map((f) => `${f.question} ${f.answer}`)
      : page === "board" ? content.board.map(({ name, role }) => `${name} ${role}`)
      : page === "staff" ? content.staff.map(({ name, role }) => `${name} ${role}`)
      : page === "contact" ? [content.contact.address, content.contact.email, ...content.contact.phones]
      : page === "partners" ? content.partners.map((p) => `${p.name} ${p.fullName}`)
      : [];
    list.push({ title: c[titleKey], path, text: [textOf(page), ...extra].join(" ") });
  }
  for (const product of [...content.loans, ...content.savings])
    list.push({
      title: product.title,
      path: servicePath(product.id),
      text: [product.description, product.audience, product.benefits, product.requirements, product.steps].join(" "),
    });
  for (const [group, base] of [["board", "/board-of-directors/"], ["staff", "/staff/"]] as const)
    for (const person of content[group])
      list.push({
        title: person.name,
        path: `${base}${person.slug}/`,
        text: [person.role, person.quote, person.bio, person.focus].join(" "),
      });
  for (const [key, path, text] of [
    ["shared.nav-registration-form", "/registration-form/", "membership registration apply join"],
    ["shared.nav-membership-form", "/membership-application-form/", "membership application apply join sole joint"],
    ["shared.nav-kafo-form", "/kafo-application-form/", "kafo group organisation membership application apply"],
    ["shared.nav-loan-form", "/loan-application-form/", "loan application apply borrow"],
  ] as const)
    list.push({ title: c[key], path, text });
  for (const [prefix, path] of posts) {
    const key = (name: string) => c[`${prefix}${name}` as keyof typeof c];
    list.push({ title: key("title"), path, text: `${key("title")} ${key("excerpt")} ${key("body")}` });
  }
  return list;
}

export type SearchResult = { title: string; path: string; snippet: string };

export function searchSite(content: WebsiteContent, query: string): SearchResult[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return websiteSearchEntries(content)
    .map((entry) => {
      const text = entry.text.replace(/\s+/g, " ").trim();
      const haystack = `${entry.title} ${text}`.toLowerCase();
      if (!words.every((word) => haystack.includes(word))) return null;
      const score = words.reduce((sum, word) => sum + haystack.split(word).length - 1 + (entry.title.toLowerCase().includes(word) ? 5 : 0), 0);
      const at = Math.max(0, text.toLowerCase().indexOf(words[0]!));
      let start = Math.max(0, at - 60);
      if (start) start = text.indexOf(" ", start) + 1 || start;
      const snippet = `${start ? "…" : ""}${text.slice(start, start + 220).trim()}${start + 220 < text.length ? "…" : ""}`;
      return { title: entry.title, path: entry.path, snippet, score };
    })
    .filter((result) => result !== null)
    .sort((a, b) => b.score - a.score)
    .map(({ title, path, snippet }) => ({ title, path, snippet }));
}
