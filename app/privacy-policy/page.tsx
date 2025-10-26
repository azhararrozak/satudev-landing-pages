import React from 'react'
import Header from '@/components/organisms/Header'
import Footer from '@/components/organisms/Footer'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl text-center md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-sm text-center text-muted-foreground mb-8">
            Last Updated: October 26, 2025
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none text-justify">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                1. Introduction
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Welcome to SatuDev Solution (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                2. Information We Collect
              </h2>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                2.1 Personal Information
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Contact us through our website contact form</li>
                <li>Request information about our services</li>
                <li>Subscribe to our newsletter</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                This information may include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Name and contact details (email address, phone number)</li>
                <li>Company name and job title</li>
                <li>Project requirements and preferences</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                2.2 Automatically Collected Information
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                When you visit our website, we may automatically collect certain information about your device, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>IP address and browser type</li>
                <li>Operating system and device information</li>
                <li>Referring URLs and pages visited</li>
                <li>Date and time of visits</li>
                <li>Clickstream data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                3. How We Use Your Information
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Providing and maintaining our services</li>
                <li>Responding to your inquiries and requests</li>
                <li>Sending you information about our services and updates</li>
                <li>Improving our website and services</li>
                <li>Analyzing usage patterns and trends</li>
                <li>Protecting against fraudulent or illegal activity</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                4. Information Sharing and Disclosure
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We may share your information in the following situations:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>With Your Consent:</strong> We may disclose your information for any other purpose with your consent</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                5. Data Security
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the internet or electronic storage is 100% secure.
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                We use industry-standard encryption and secure protocols to protect your data during transmission and storage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                6. Data Retention
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                7. Your Privacy Rights
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                8. Cookies and Tracking Technologies
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                9. Third-Party Links
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                10. Children&apos;s Privacy
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                11. Updates to This Policy
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                12. Contact Us
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                If you have any questions or concerns about this Privacy Policy, please contact us:
              </p>
              <div className="bg-slate-100 dark:bg-slate-700 p-6 rounded-lg">
                <p className="text-slate-700 dark:text-slate-300 mb-2">
                  <strong>SatuDev Solution</strong>
                </p>
                <p className="text-slate-700 dark:text-slate-300 mb-2">
                  Email: satudev.solution@gmail.com
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  Address: Jalan Pagenjahan, Adiwerna, Tegal
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}