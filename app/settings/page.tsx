import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import {
  getHardcoverConnectionStatus,
  isHardcoverOwner,
} from "@/lib/hardcover-oauth";

export const dynamic = "force-dynamic";

interface SettingsPageProps {
  searchParams: {
    hardcover?: string | string[];
    reason?: string | string[];
  };
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function StatusBanner({ result, reason }: { result?: string; reason?: string }) {
  if (!result) {
    return null;
  }

  const messages: Record<string, { tone: "success" | "error" | "info"; text: string }> = {
    connected: {
      tone: "success",
      text: "Hardcover connected. The site will now use OAuth tokens.",
    },
    disconnected: {
      tone: "success",
      text: "Hardcover disconnected and the local tokens were cleared.",
    },
    denied: {
      tone: "info",
      text: "Hardcover authorization was cancelled.",
    },
    error: {
      tone: "error",
      text: "Hardcover authorization failed.",
    },
    forbidden: {
      tone: "error",
      text: "Only the site owner can manage the Hardcover connection.",
    },
    "not-configured": {
      tone: "info",
      text: "Hardcover OAuth is not configured on this deployment yet.",
    },
    "signed-out": {
      tone: "info",
      text: "Sign in to manage the Hardcover connection.",
    },
  };

  const message = messages[result];
  if (!message) {
    return null;
  }

  const toneClasses = {
    success: "border-green-200 bg-green-50 text-green-900",
    error: "border-red-200 bg-red-50 text-red-900",
    info: "border-blue-200 bg-blue-50 text-blue-900",
  }[message.tone];

  return (
    <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${toneClasses}`}>
      <p className="font-medium">{message.text}</p>
      {reason ? <p className="mt-1 break-words opacity-80">{reason}</p> : null}
    </div>
  );
}

function SetupInstructions() {
  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
      <h3 className="mb-3 text-base font-semibold text-gray-900">
        Register the Hardcover app
      </h3>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          Create a{" "}
          <a
            className="text-primary underline"
            href="https://hardcover.app/account/developer-apps/new"
            target="_blank"
            rel="noreferrer"
          >
            new developer app
          </a>{" "}
          and choose <strong>Web app (server-side)</strong>.
        </li>
        <li>
          Add the redirect URI that matches{" "}
          <code className="rounded bg-white px-1 py-0.5">
            {process.env.HARDCOVER_REDIRECT_URI ||
              "https://your-domain/api/hardcover/callback"}
          </code>
          . It must match exactly.
        </li>
        <li>
          Allow the <code className="rounded bg-white px-1 py-0.5">read:catalog</code>{" "}
          scope. Leave Device Authorization Grant off.
        </li>
        <li>
          Set <code className="rounded bg-white px-1 py-0.5">HARDCOVER_CLIENT_ID</code>,{" "}
          <code className="rounded bg-white px-1 py-0.5">HARDCOVER_CLIENT_SECRET</code>
          , and{" "}
          <code className="rounded bg-white px-1 py-0.5">HARDCOVER_REDIRECT_URI</code>{" "}
          in the deployment environment.
        </li>
        <li>Reload this page and connect.</li>
      </ol>
    </div>
  );
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const user = await currentUser();

  if (!user || !user.id) {
    return (
      <div className="mx-16">
        <h1 className="mb-6 text-2xl font-bold">Settings</h1>
        <p className="text-lg">Sign in to manage settings.</p>
      </div>
    );
  }

  if (!isHardcoverOwner(user.id)) {
    return (
      <div className="mx-16">
        <h1 className="mb-6 text-2xl font-bold">Settings</h1>
        <p className="text-lg">
          The Hardcover connection is managed by the site owner.
        </p>
      </div>
    );
  }

  const status = await getHardcoverConnectionStatus();
  const result = first(searchParams.hardcover);
  const reason = first(searchParams.reason);
  const expiresAt = status.expiresAt
    ? new Date(status.expiresAt).toLocaleString()
    : null;

  return (
    <div className="mx-16 pb-16">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <StatusBanner result={result} reason={reason} />

      <section className="max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Hardcover</h2>
            <p className="mt-1 text-sm text-gray-600">
              Used for book search, trending books, and book details.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              status.connected
                ? "bg-green-100 text-green-800"
                : status.configured
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {status.connected
              ? "OAuth connected"
              : status.configured
              ? "Not connected"
              : "Not configured"}
          </span>
        </div>

        {status.error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {status.error}
          </p>
        ) : null}

        {status.configured ? (
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>
              Scope:{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5">
                {status.scope || "read:catalog"}
              </code>
            </p>
            {expiresAt ? (
              <p>
                Access token expires: <strong>{expiresAt}</strong>. It refreshes
                automatically.
              </p>
            ) : null}
            {!status.connected && status.patFallback ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                The site is currently falling back to the{" "}
                <code className="rounded bg-white px-1 py-0.5">HARDCOVER_TOKEN</code>{" "}
                personal access token. Connecting OAuth will take precedence.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-700">
            Add the OAuth environment variables below to enable the connect
            button.
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {status.configured ? (
            <Link
              href="/api/hardcover/connect"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              {status.connected ? "Reconnect Hardcover" : "Connect Hardcover"}
            </Link>
          ) : null}

          {status.connected ? (
            <form action="/api/hardcover/disconnect" method="post">
              <button
                type="submit"
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                Disconnect
              </button>
            </form>
          ) : null}
        </div>

        {!status.configured ? <SetupInstructions /> : null}
      </section>

      <section className="mt-6 max-w-3xl rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">How tokens work</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Access tokens last one week and are refreshed automatically.</li>
          <li>
            Refresh tokens rotate on every use. The newest pair is stored in the
            database, and a lock prevents two server instances from spending the
            same refresh token.
          </li>
          <li>
            Disconnecting revokes the tokens at Hardcover and removes the local
            copy. You can also revoke access from Hardcover&apos;s Authorized
            Apps page.
          </li>
          <li>
            <code className="rounded bg-gray-100 px-1 py-0.5">HARDCOVER_TOKEN</code>{" "}
            remains as a fallback until an OAuth connection is made.
          </li>
        </ul>
      </section>
    </div>
  );
}
