// app/(legal)/terms/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — HireFlow",
  description: "The terms and conditions governing your use of HireFlow.",
};

export default function TermsPage() {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <h1>Terms of Service</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Effective date: 1 June 2025 &nbsp;·&nbsp; Last updated: 1 June 2025
      </p>

      <p>
        Please read these Terms of Service (&quot;Terms&quot;) carefully before
        using HireFlow (the &quot;Service&quot;), operated at{" "}
        <a href="https://hireflow-track.vercel.app">
          https://hireflow-track.vercel.app
        </a>
        .
      </p>
      <p>
        By creating an account or using the Service, you agree to be bound by
        these Terms. If you do not agree, do not use the Service.
      </p>

      <hr />

      <h2>1. About HireFlow</h2>
      <p>
        HireFlow is a personal job application tracking tool. It helps
        individuals organise, monitor, and reflect on their job search. It is an
        independent open-source project, not a commercial hiring platform or
        recruitment agency.
      </p>
      <p>
        For enquiries:{" "}
        <a href="mailto:hireflow-track@gmail.com">hireflow-track@gmail.com</a>
      </p>

      <hr />

      <h2>2. Eligibility</h2>
      <p>
        You may use the Service if you are at least 13 years of age. By using
        the Service, you represent that you meet this requirement.
      </p>

      <hr />

      <h2>3. Your Account</h2>

      <h3>3.1 Registration</h3>
      <p>
        You may register using an email address and password, or via Google
        Sign-In. You are responsible for providing accurate information during
        registration.
      </p>

      <h3>3.2 Account Security</h3>
      <p>
        You are responsible for keeping your login credentials secure. Do not
        share your password. You must notify us immediately at{" "}
        <a href="mailto:hireflow-track@gmail.com">hireflow-track@gmail.com</a>{" "}
        if you suspect unauthorised access to your account.
      </p>

      <h3>3.3 One Account Per Person</h3>
      <p>
        Each account is for personal use by a single individual. You may not
        share your account with others or create accounts on behalf of third
        parties without our prior written consent.
      </p>

      <hr />

      <h2>4. Acceptable Use</h2>
      <p>
        You agree to use the Service only for lawful purposes and in accordance
        with these Terms. You must not:
      </p>
      <ul>
        <li>
          Use the Service to store or transmit unlawful, harmful, defamatory, or
          fraudulent content
        </li>
        <li>
          Attempt to gain unauthorised access to any part of the Service or its
          infrastructure
        </li>
        <li>
          Reverse engineer, decompile, or otherwise attempt to extract source
          code (beyond what is permitted by any open-source licence applicable
          to the project)
        </li>
        <li>
          Use automated tools (bots, scrapers) to access the Service without our
          written consent
        </li>
        <li>Impersonate any person or entity</li>
        <li>
          Use the Service in any way that could damage, disable, or impair the
          Service or interfere with other users
        </li>
      </ul>

      <hr />

      <h2>5. Your Content</h2>

      <h3>5.1 Ownership</h3>
      <p>
        You retain ownership of all data you enter into the Service, including
        application records, contacts, reminders, notes, and uploaded files
        (&quot;Your Content&quot;).
      </p>

      <h3>5.2 Licence to Us</h3>
      <p>
        By uploading content to the Service, you grant us a limited,
        non-exclusive licence to store, process, and display Your Content solely
        for the purpose of providing the Service to you. We do not claim any
        ownership over Your Content.
      </p>

      <h3>5.3 Your Responsibility</h3>
      <p>
        You are solely responsible for the accuracy, legality, and
        appropriateness of Your Content. We are not responsible for any content
        you store in the Service.
      </p>

      <hr />

      <h2>6. Intellectual Property</h2>
      <p>
        The HireFlow application, including its design, code (except as
        separately open-sourced), and branding, is our intellectual property.
        Nothing in these Terms transfers any intellectual property rights to you
        beyond the right to use the Service as described herein.
      </p>
      <p>
        If the project is made available under an open-source licence, the terms
        of that licence govern your use of the source code.
      </p>

      <hr />

      <h2>7. Third-Party Services</h2>
      <p>
        The Service integrates with third-party providers including Vercel,
        Neon, Cloudinary, Resend, and Google. Your use of those services is
        subject to their respective terms and privacy policies. We are not
        responsible for the acts or omissions of third-party providers.
      </p>

      <hr />

      <h2>8. Availability and Changes</h2>
      <p>
        We provide the Service on an &quot;as is&quot; and &quot;as
        available&quot; basis. We do not guarantee uninterrupted or error-free
        access.
      </p>
      <p>We reserve the right to:</p>
      <ul>
        <li>
          Modify, suspend, or discontinue any part of the Service at any time
          with or without notice
        </li>
        <li>
          Update these Terms at any time (we will notify you of material
          changes)
        </li>
        <li>
          Impose limits on certain features or restrict access to parts of the
          Service
        </li>
      </ul>

      <hr />

      <h2>9. Disclaimers</h2>
      <p>To the maximum extent permitted by applicable law:</p>
      <ul>
        <li>
          The Service is provided without warranties of any kind, express or
          implied, including but not limited to warranties of merchantability,
          fitness for a particular purpose, or non-infringement
        </li>
        <li>
          We do not warrant that the Service will meet your requirements or that
          it will be available at any particular time
        </li>
        <li>
          We are not a recruitment platform, career advisor, or employment
          agency; nothing in the Service constitutes career or legal advice
        </li>
      </ul>

      <hr />

      <h2>10. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, we shall not be
        liable for any indirect, incidental, special, consequential, or punitive
        damages, including but not limited to loss of data, loss of profits, or
        loss of goodwill, arising out of or in connection with your use of the
        Service, even if we have been advised of the possibility of such
        damages.
      </p>
      <p>
        Our total liability to you for any claim arising out of or relating to
        these Terms or the Service shall not exceed the amount you paid us (if
        any) in the 12 months preceding the claim.
      </p>

      <hr />

      <h2>11. Termination</h2>

      <h3>11.1 By You</h3>
      <p>
        You may stop using the Service at any time. To delete your account and
        associated data, contact us at{" "}
        <a href="mailto:hireflow-track@gmail.com">hireflow-track@gmail.com</a>.
        We will process your request within 30 days.
      </p>

      <h3>11.2 By Us</h3>
      <p>
        We reserve the right to suspend or terminate your account at any time if
        we reasonably believe you have violated these Terms, with or without
        prior notice.
      </p>
      <p>
        Upon termination, your right to use the Service ceases immediately.
        Sections 5, 6, 9, 10, and 12 survive termination.
      </p>

      <hr />

      <h2>12. Governing Law and Disputes</h2>
      <p>
        These Terms are governed by the laws of the Federal Republic of Nigeria.
        Any disputes arising out of or in connection with these Terms shall
        first be attempted to be resolved informally by contacting us at{" "}
        <a href="mailto:hireflow-track@gmail.com">hireflow-track@gmail.com</a>.
        If informal resolution fails, disputes shall be subject to the exclusive
        jurisdiction of the courts of Nigeria.
      </p>
      <p>
        If you are located in a jurisdiction with mandatory consumer protection
        laws that provide greater rights than those in these Terms, those laws
        apply to the extent required.
      </p>

      <hr />

      <h2>13. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. We will notify you of
        material changes by email or by a notice within the Service, and we will
        update the &quot;Last updated&quot; date at the top of this page. Your
        continued use of the Service after changes take effect constitutes
        acceptance of the updated Terms.
      </p>

      <hr />

      <h2>14. Contact Us</h2>
      <p>For any questions about these Terms:</p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:hireflow-track@gmail.com">hireflow-track@gmail.com</a>
      </p>
    </article>
  );
}
