import type { WebsiteContent } from "./websiteDefaults";

// Each PDF form, with the online form that replaces it.
const onlineForms = ["/loan-application-form/", "/registration-form/", "/kafo-application-form/", "/membership-application-form/"];

export function websiteDownloads(c: WebsiteContent["copy"]) {
  return ([1, 2, 3, 4] as const).map((n) => ({
    title: c[`downloads.file-${n}-title`],
    category: c[`downloads.file-${n}-category`],
    date: c[`downloads.file-${n}-date`],
    path: c[`downloads.file-${n}-path`],
    online: onlineForms[n - 1]!,
  }));
}
