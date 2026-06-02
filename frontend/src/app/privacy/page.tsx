'use client';
import { useLanguage } from '@/i18n/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-black pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-white/70 text-base leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Information We Collect</h2>
            <p>
              We collect only the information necessary to provide our IPTV service:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Email address</strong> — used to send you login credentials and service updates</li>
              <li><strong>Payment data</strong> — all payments are processed securely by PayPal. We do not store credit card numbers or banking details</li>
              <li><strong>Contact form messages</strong> — any information you voluntarily send us via the contact form</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. How We Use Your Information</h2>
            <p>Your information is used solely for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Providing and maintaining your IPTV subscription</li>
              <li>Sending service-related communications (welcome emails, expiry reminders)</li>
              <li>Responding to your support inquiries</li>
              <li>Improving our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Data Storage and Retention</h2>
            <p>
              Your data is stored securely on Supabase (PostgreSQL) servers. We retain your data for as long as your account is active or as needed to provide you service. You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>PayPal</strong> — payment processing. See PayPal&apos;s privacy policy for how they handle your data</li>
              <li><strong>Supabase</strong> — database hosting</li>
              <li><strong>Vercel</strong> — hosting and CDN</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Your Rights (GDPR / CCPA)</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Lodge a complaint with your local data protection authority</li>
            </ul>
            <p className="mt-2">To exercise these rights, email us at support@iptvpremium01.vercel.app</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your data, including encryption in transit (HTTPS) and at rest, access controls, and regular security reviews.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Contact</h2>
            <p>
              For privacy-related inquiries, contact us at: support@iptvpremium01.vercel.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
