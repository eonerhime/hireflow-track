// app/(legal)/cookies/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — HireFlow",
  description: "How HireFlow uses cookies and browser storage.",
};

export default function CookiesPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <h1>Cookie Policy</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Effective date: 1 June 2025 &nbsp;·&nbsp; Last updated: 1 June 2025
      </p>

      <p>
        This Cookie Policy explains how HireFlow (&quot;we&quot;,
        &quot;us&quot;, or &quot;our&quot;) uses cookies and similar
        technologies on{" "}
        <a href="https://hireflow-track.vercel.app">
          https://hireflow-track.vercel.app
        </a>{" "}
        (the &quot;Service&quot;).
      </p>

      <hr />

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files placed on your device by a website. They
        are widely used to make websites work, to keep you signed in, and to
        remember your preferences.
      </p>

      <hr />

      <h2>2. How We Use Cookies</h2>
      <p>
        HireFlow uses cookies only where strictly necessary to operate the
        Service. We do not use cookies for advertising, analytics, or tracking
        your activity across other websites.
      </p>

      <h3>2.1 Strictly Necessary Cookies</h3>
      <p>
        These cookies are essential for the Service to function. Without them,
        you would not be able to sign in or stay signed in.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>next-auth.session-token</code>
              </td>
              <td>Keeps you authenticated after signing in</td>
              <td>Session / 30 days (if &quot;remember me&quot;)</td>
            </tr>
            <tr>
              <td>
                <code>next-auth.csrf-token</code>
              </td>
              <td>
                Protects against cross-site request forgery (CSRF) attacks
              </td>
              <td>Session</td>
            </tr>
            <tr>
              <td>
                <code>next-auth.callback-url</code>
              </td>
              <td>Remembers where to redirect you after sign-in</td>
              <td>Session</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        When you sign in via Google OAuth, Google may set its own cookies during
        the authentication flow. These are governed by{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google&apos;s Privacy Policy
        </a>
        .
      </p>

      <h3>2.2 No Analytics or Advertising Cookies</h3>
      <p>We do not use:</p>
      <ul>
        <li>Google Analytics or any other analytics cookies</li>
        <li>Advertising or retargeting cookies</li>
        <li>Social media tracking pixels</li>
      </ul>

      <hr />

      <h2>3. Local Storage</h2>
      <p>
        In addition to cookies, the Service may use your browser&apos;s{" "}
        <code>localStorage</code> to store your UI preferences (such as dark
        mode setting). This data stays on your device and is not transmitted to
        our servers.
      </p>

      <hr />

      <h2>4. Managing Cookies</h2>
      <p>
        Because we only use strictly necessary cookies, there is no opt-out
        mechanism for cookies within the Service — disabling them would prevent
        you from signing in.
      </p>
      <p>
        You can control or delete cookies through your browser settings. For
        guidance, visit:
      </p>
      <ul>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Firefox
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
          >
            Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
            target="_blank"
            rel="noopener noreferrer"
          >
            Edge
          </a>
        </li>
      </ul>
      <p>Please note that deleting cookies will sign you out of the Service.</p>

      <hr />

      <h2>5. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. Any changes will be
        reflected by updating the &quot;Last updated&quot; date at the top of
        this page.
      </p>

      <hr />

      <h2>6. Contact Us</h2>
      <p>For any questions about our use of cookies:</p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:hireflow-track@gmail.com">hireflow-track@gmail.com</a>
      </p>
    </article>
  );
}
