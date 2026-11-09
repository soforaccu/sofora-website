/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as applications from "../applications.js";
import type * as askSofora from "../askSofora.js";
import type * as auth from "../auth.js";
import type * as contact from "../contact.js";
import type * as content from "../content.js";
import type * as devLogins from "../devLogins.js";
import type * as email from "../email.js";
import type * as http from "../http.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_emailLogo from "../lib/emailLogo.js";
import type * as lib_submissions from "../lib/submissions.js";
import type * as media from "../media.js";
import type * as setup from "../setup.js";
import type * as staff from "../staff.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  applications: typeof applications;
  askSofora: typeof askSofora;
  auth: typeof auth;
  contact: typeof contact;
  content: typeof content;
  devLogins: typeof devLogins;
  email: typeof email;
  http: typeof http;
  "lib/access": typeof lib_access;
  "lib/emailLogo": typeof lib_emailLogo;
  "lib/submissions": typeof lib_submissions;
  media: typeof media;
  setup: typeof setup;
  staff: typeof staff;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
};
