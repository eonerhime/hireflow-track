// app/(legal)/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — HireFlow",
  description: "How HireFlow collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Effective date: 1 June 2025 &nbsp;·&nbsp; Last updated: 1 June 2025
      </p>

      <p>
        HireFlow (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates
        the job application tracker available at{" "}
        <a href="https://hireflow-track.vercel.app">
          https://hireflow-track.vercel.app
        </a>{" "}
        (the &quot;Service&quot;). This Privacy Policy explains how we collect,
        use, store, and protect your personal information when you use the
        Service.
      </p>
      <p>
        By creating an account or using the Service, you agree to the practices
        described in this Policy. If you do not agree, please do not use the
        Service.
      </p>

      <hr />

      <h2>1. Who We Are</h2>
      <p>
        HireFlow is an independent project. For all privacy-related enquiries,
        contact us at:{" "}
        <a href="mailto:hireflow-track@gmail.com">hireflow-track@gmail.com</a>
      </p>

      <hr />

      <h2>2. Information We Collect</h2>

      <h3>2.1 Information You Provide Directly</h3>
      <p>
        When you register using email and password (&quot;credentials&quot;), we
        collect:
      </p>
      <ul>
        <li>Your email address</li>
        <li>
          A hashed version of your password (we never store your password in
          plain text)
        </li>
        <li>Your first name and last name (optional, set in Settings)</li>
        <li>A profile avatar image (optional, uploaded by you)</li>
      </ul>
      <p>When you use the Service, you also create and store:</p>
      <ul>
        <li>
          Job application records (company name, role, status, notes, dates)
        </li>
        <li>Contact details associated with applications</li>
        <li>Reminder and task entries</li>
        <li>Documents (e.g. CV/résumé files) you choose to upload</li>
        <li>Activity logs generated automatically as you use the Service</li>
      </ul>

      <h3>2.2 Information Collected via Google Sign-In (OAuth)</h3>
      <p>If you choose to sign in with Google, we receive from Google:</p>
      <ul>
        <li>Your email address</li>
        <li>Your display name</li>
        <li>Your Google profile photo URL</li>
      </ul>
      <p>
        We do not receive your Google password. We do not request access to your
        Gmail, Google Drive, Google Calendar, or any other Google service beyond
        your basic profile.
      </p>

      <h3>2.3 Information Collected Automatically</h3>
      <p>
        When you use the Service, our hosting provider (Vercel) may collect
        standard server logs, including your IP address, browser type and
        version, and pages visited with timestamps.
      </p>
      <p>
        We do not use any analytics tools, tracking pixels, or advertising
        networks. We do not use cookies beyond what is strictly necessary to
        keep you signed in.
      </p>

      <hr />

      <h2>3. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Create and manage your account</li>
        <li>
          Provide and operate the core features of the Service (application
          tracking, reminders, pipeline management, analytics)
        </li>
        <li>Allow you to personalise your profile (name, avatar)</li>
        <li>Send you password reset emails if you request them</li>
        <li>Maintain an activity log of your actions within the Service</li>
        <li>Investigate and resolve technical issues</li>
      </ul>
      <p>
        We do not use your information for advertising, marketing to third
        parties, or automated decision-making that produces legal or significant
        effects on you.
      </p>

      <hr />

      <h2>4. How We Share Your Information</h2>
      <p>We do not sell, rent, or trade your personal data.</p>
      <p>
        We share your information only with the following service providers, and
        only to the extent necessary to operate the Service:
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Purpose</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vercel</td>
              <td>Hosting and deployment</td>
              <td>USA</td>
            </tr>
            <tr>
              <td>Neon (PostgreSQL)</td>
              <td>Database storage</td>
              <td>USA</td>
            </tr>
            <tr>
              <td>Cloudinary</td>
              <td>Avatar image storage</td>
              <td>USA</td>
            </tr>
            <tr>
              <td>Resend</td>
              <td>Transactional email delivery</td>
              <td>USA</td>
            </tr>
            <tr>
              <td>Google (OAuth)</td>
              <td>Sign-in authentication</td>
              <td>USA</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        We may also disclose your information if required by law, court order,
        or to protect the rights and safety of users or the public.
      </p>

      <hr />

      <h2>5. Data Retention</h2>
      <p>
        We retain your personal data for as long as your account is active. If
        you delete your account, we will delete your personal data within 30
        days, except where we are required by law to retain it for longer.
      </p>
      <p>
        Uploaded files (avatars, résumés) stored on Cloudinary are deleted when
        you remove them from the Service or when your account is deleted.
      </p>

      <hr />

      <h2>6. Your Rights</h2>
      <p>
        Depending on your location, you may have the following rights regarding
        your personal data:
      </p>
      <ul>
        <li>
          <strong>Access</strong> — request a copy of the data we hold about you
        </li>
        <li>
          <strong>Correction</strong> — ask us to correct inaccurate or
          incomplete data
        </li>
        <li>
          <strong>Deletion</strong> — request that we delete your account and
          associated data
        </li>
        <li>
          <strong>Portability</strong> — request your data in a machine-readable
          format
        </li>
        <li>
          <strong>Objection</strong> — object to certain types of processing
        </li>
      </ul>
      <p>
        To exercise any of these rights, email us at{" "}
        <a href="mailto:hireflow-track@gmail.com">hireflow-track@gmail.com</a>.
        We will respond within 30 days.
      </p>
      <p>
        <strong>Nigerian users:</strong> These rights are provided under the
        Nigeria Data Protection Regulation (NDPR) 2019 and the Nigeria Data
        Protection Act (NDPA) 2023.
      </p>
      <p>
        <strong>European users:</strong> These rights are provided under the
        General Data Protection Regulation (GDPR). Where GDPR applies, our legal
        basis for processing your data is the performance of the contract
        between you and us (Article 6(1)(b)) and, where applicable, our
        legitimate interests in operating and improving the Service (Article
        6(1)(f)).
      </p>

      <hr />

      <h2>7. Security</h2>
      <p>
        We take reasonable technical and organisational measures to protect your
        data, including:
      </p>
      <ul>
        <li>
          Passwords are hashed using bcrypt and never stored in plain text
        </li>
        <li>All data is transmitted over HTTPS</li>
        <li>Database access is restricted to the application backend</li>
        <li>
          Avatar and file uploads are stored on Cloudinary&apos;s secure
          infrastructure
        </li>
      </ul>
      <p>
        No method of transmission over the internet is 100% secure. While we
        strive to protect your data, we cannot guarantee absolute security.
      </p>

      <hr />

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        The Service is not directed at children under the age of 13. We do not
        knowingly collect personal data from children. If you believe a child
        has provided us with their data, please contact us and we will delete it
        promptly.
      </p>

      <hr />

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we will
        update the &quot;Last updated&quot; date at the top of this page. For
        significant changes, we will notify you by email or by a notice within
        the Service. Your continued use of the Service after changes are posted
        constitutes your acceptance of the updated Policy.
      </p>

      <hr />

      <h2>10. Contact Us</h2>
      <p>
        For any questions, concerns, or requests relating to this Privacy
        Policy:
      </p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:hireflow-track@gmail.com">hireflow-track@gmail.com</a>
      </p>
    </article>
  );
}
