import { useState, type FormEvent } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useWorkspace } from "../data/workspaceContext";
import {
  Avatar,
  Field,
  Icon,
  PageHeader,
  useFeedback,
  useUnsavedChanges,
} from "../components/ui";

export function Profile() {
  const { user, saveProfile } = useWorkspace();
  const [name, setName] = useState(user.name);
  const dirty = name !== user.name;
  const clearDirty = useUnsavedChanges(dirty);
  const { run, message, pending } = useFeedback();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (
      await run(
        () => saveProfile({ name: trimmed, email: user.email }),
        "Your profile has been saved.",
      )
    ) {
      setName(trimmed);
      clearDirty();
    }
  }

  return (
    <>
      <PageHeader title="My profile" />
      {message}
      <div className="profile-layout">
        <aside className="panel profile-summary" aria-label="Your account">
          <Avatar name={user.name} large />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <span className="staff-status">
            <span /> Active staff account
          </span>
        </aside>
        <section
          className="panel profile-details"
          aria-labelledby="profile-details-title"
        >
          <div className="panel-heading">
            <div>
              <h2 id="profile-details-title">Personal details</h2>
              <p className="quiet">Keep your name up to date.</p>
            </div>
            <Icon name="people" />
          </div>
          <form className="panel-body" onSubmit={submit}>
            <Field label="Full name">
              <input
                name="name"
                disabled={pending}
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!dirty || pending}
                onClick={() => {
                  setName(user.name);
                  clearDirty();
                }}
              >
                Discard changes
              </button>
              <button className="btn" disabled={!dirty || pending}>
                Save changes <Icon name="check" />
              </button>
            </div>
          </form>
          <PasswordForm />
        </section>
      </div>
    </>
  );
}

function PasswordForm() {
  const changePassword = useAction(api.auth.changePassword);
  const { run, message, pending } = useFeedback();
  const [mismatch, setMismatch] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const currentPassword = String(fields.get("currentPassword") ?? "");
    const newPassword = String(fields.get("newPassword") ?? "");
    if (newPassword !== fields.get("confirmPassword")) {
      setMismatch(true);
      return;
    }
    if (await run(() => changePassword({ currentPassword, newPassword }), "Your password has been changed.")) {
      form.reset();
    }
  }

  return (
    <>
      <div className="panel-heading">
        <div>
          <h2 id="profile-password-title">Change password</h2>
          <p className="quiet">Use 12 to 128 characters. Changing your password signs you out on other devices.</p>
        </div>
      </div>
      {message}
      <form className="panel-body" aria-labelledby="profile-password-title" onSubmit={submit} onChange={() => setMismatch(false)}>
        {mismatch && <p className="notice notice-error" role="alert">The new passwords do not match.</p>}
        <Field label="Current password">
          <input name="currentPassword" type="password" autoComplete="current-password" maxLength={128} required disabled={pending} />
        </Field>
        <Field label="New password">
          <input name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={pending} />
        </Field>
        <Field label="Confirm new password">
          <input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={pending} />
        </Field>
        <div className="form-actions">
          <button className="btn" disabled={pending}>Change password <Icon name="check" /></button>
        </div>
      </form>
    </>
  );
}
