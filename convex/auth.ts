import {
  convexAuth,
  getAuthSessionId,
  getAuthUserId,
  invalidateSessions,
  modifyAccountCredentials,
  retrieveAccount,
} from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError, v } from "convex/values";
import { email, hash } from "./lib/access";
import { action, type MutationCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { DEV_ADMIN_EMAIL, DEV_USERNAME, devLoginsEnabled } from "./devLogins";

function validatePasswordRequirements(password: string) {
  if (password.length < 12 || password.length > 128)
    throw new ConvexError("Use a password between 12 and 128 characters.");
}

export const changePassword = action({
  args: { currentPassword: v.string(), newPassword: v.string() },
  returns: v.null(),
  handler: async (ctx, { currentPassword, newPassword }) => {
    const userId = await getAuthUserId(ctx);
    const sessionId = await getAuthSessionId(ctx);
    const person = await ctx.runQuery(api.staff.me);
    if (!userId || !sessionId || !person) throw new ConvexError("Sign in again to change your password.");

    validatePasswordRequirements(newPassword);
    if (newPassword === currentPassword) throw new ConvexError("Choose a different password.");
    if (!currentPassword || currentPassword.length > 128)
      throw new ConvexError("Enter your current password.");

    const provider = "password";
    const id = person.loginEmail;
    const { account } = await retrieveAccount(ctx, {
      provider,
      account: { id, secret: currentPassword },
    }).catch((error: unknown) => {
      if (error instanceof Error && error.message === "InvalidSecret")
        throw new ConvexError("Your current password is incorrect.");
      if (error instanceof Error && error.message === "TooManyFailedAttempts")
        throw new ConvexError("Too many attempts. Please wait and try again.");
      throw error;
    });
    if (account.userId !== userId) throw new ConvexError("Sign in again to change your password.");

    await modifyAccountCredentials(ctx, { provider, account: { id, secret: newPassword } });
    await invalidateSessions(ctx, { userId, except: [sessionId] });
    return null;
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({
    profile(params) {
      const login = String(params.email ?? "").trim();
      const id = devLoginsEnabled() && login === DEV_USERNAME ? DEV_ADMIN_EMAIL : login;
      return {email:email(id), invitation:String(params.invitation ?? "")};
    },
    validatePasswordRequirements,
  })],
  callbacks: {
    async createOrUpdateUser(rawCtx, args) {
      const ctx = rawCtx as MutationCtx;
      if (args.existingUserId) return args.existingUserId;
      const token = String(args.profile.invitation ?? "");
      if (token.length < 32 || token.length > 200) throw new ConvexError("A valid staff activation link is required.");
      const awaitHash = await hash(token);
      const invitation = await ctx.db.query("invitations").withIndex("by_hash",q=>q.eq("hash",awaitHash)).unique();
      const person = invitation ? await ctx.db.get(invitation.staffId) : null;
      if (!invitation || invitation.expiresAt < Date.now() || !person?.active || person.userId || person.loginEmail !== args.profile.email)
        throw new ConvexError("This activation link is invalid or expired.");
      const userId = await ctx.db.insert("users",{name:person.name,email:person.loginEmail});
      await ctx.db.patch(person._id,{userId});
      await ctx.db.delete(invitation._id);
      return userId;
    },
    async beforeSessionCreation(rawCtx,{userId}) {
      const ctx=rawCtx as MutationCtx;
      const person=await ctx.db.query("staff").withIndex("by_userId",q=>q.eq("userId",userId)).unique();
      if (!person?.active) throw new ConvexError("This staff account is inactive.");
    },
  },
});
