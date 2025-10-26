import React from 'react'
import Header from '@/components/organisms/Header'
import Footer from '@/components/organisms/Footer'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl text-center md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-sm text-center text-muted-foreground mb-8">
            Last Updated: October 26, 2025
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none text-justify">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                1. Agreement to Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                These Terms of Service constitute a legally binding agreement between you and SatuDev Solution regarding your use of our website and services. By accessing or using our services, you agree to be bound by these terms.
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                If you do not agree with these terms, you must not access or use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                2. Our Services
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                SatuDev Solution provides software development services, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Web application development</li>
                <li>Mobile application development (iOS and Android)</li>
                <li>Custom software solutions</li>
                <li>API development and integration</li>
                <li>Technical consulting services</li>
                <li>Software maintenance and support</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                3. User Responsibilities
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                When using our services, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the confidentiality of any account credentials</li>
                <li>Use our services only for lawful purposes</li>
                <li>Not interfere with or disrupt our services</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
                <li>Respect intellectual property rights</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                4. Project Engagement
              </h2>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                4.1 Project Scope
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Each project will be defined by a separate Statement of Work (SOW) or contract that outlines the specific deliverables, timeline, and payment terms.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                4.2 Client Obligations
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Clients are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Providing timely feedback and approvals</li>
                <li>Supplying necessary content, materials, and resources</li>
                <li>Making timely payments according to agreed terms</li>
                <li>Maintaining clear communication throughout the project</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                4.3 Changes and Revisions
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                Changes to project scope may result in additional charges and timeline adjustments. All change requests must be submitted in writing and approved by both parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                5. Payment Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Unless otherwise specified in a project contract:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Payment terms will be outlined in the project agreement</li>
                <li>Invoices are typically due within 30 days of receipt</li>
                <li>Late payments may incur interest charges</li>
                <li>We reserve the right to suspend services for non-payment</li>
                <li>All prices are in USD unless otherwise specified</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                6. Intellectual Property Rights
              </h2>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                6.1 Client-Owned IP
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Upon full payment, clients will own the intellectual property rights to custom-developed deliverables as specified in the project agreement.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                6.2 SatuDev-Owned IP
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We retain ownership of:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Pre-existing tools, frameworks, and code libraries</li>
                <li>General methodologies and processes</li>
                <li>Knowledge and techniques developed during the project</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                6.3 Third-Party Components
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                Projects may include third-party libraries and components subject to their own licenses. Clients are responsible for complying with these licenses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                7. Confidentiality
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Both parties agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Maintain confidentiality of proprietary information</li>
                <li>Use confidential information only for project purposes</li>
                <li>Not disclose confidential information to third parties without consent</li>
                <li>Return or destroy confidential materials upon project completion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                8. Warranties and Disclaimers
              </h2>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                8.1 Our Warranties
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We warrant that:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Services will be performed in a professional manner</li>
                <li>Deliverables will substantially conform to agreed specifications</li>
                <li>We have the right to provide the services offered</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                8.2 Warranty Period
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Unless otherwise specified, we provide a 90-day warranty period from project delivery for bug fixes and corrections related to our work.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                8.3 Disclaimer
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                EXCEPT AS EXPRESSLY PROVIDED, OUR SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                9. Limitation of Liability
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Our total liability shall not exceed the amount paid by the client for the specific service</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>We are not liable for loss of profits, data, or business opportunities</li>
                <li>Clients must notify us of any claims within 30 days of discovery</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                10. Indemnification
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Clients agree to indemnify and hold SatuDev Solution harmless from any claims, damages, or expenses arising from client-provided content, violation of these terms, or misuse of our deliverables.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                11. Termination
              </h2>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                11.1 Termination by Either Party
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Either party may terminate a project agreement with written notice if the other party breaches these terms and fails to cure within 15 days.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                11.2 Effect of Termination
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Upon termination:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Client must pay for all work completed to date</li>
                <li>We will deliver completed work upon full payment</li>
                <li>Confidentiality obligations continue</li>
                <li>Each party returns or destroys the other party&apos;s confidential materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                12. Dispute Resolution
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                In the event of a dispute:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li>Parties will first attempt to resolve through good-faith negotiation</li>
                <li>If unresolved within 30 days, parties may pursue mediation</li>
                <li>Any legal action must be brought in the courts of Jakarta, Indonesia</li>
                <li>These terms are governed by Indonesian law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                13. Force Majeure
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Neither party shall be liable for delays or failures in performance resulting from circumstances beyond their reasonable control, including natural disasters, war, pandemic, or government actions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                14. Modifications to Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective upon posting to our website. Continued use of our services after changes constitutes acceptance of the modified terms.
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Material changes will be communicated to active clients via email.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                15. General Provisions
              </h2>
              <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
                <li><strong>Entire Agreement:</strong> These terms, together with project-specific agreements, constitute the entire agreement</li>
                <li><strong>Severability:</strong> If any provision is found invalid, the remaining provisions continue in effect</li>
                <li><strong>Waiver:</strong> Failure to enforce any provision does not waive our right to do so later</li>
                <li><strong>Assignment:</strong> Clients may not assign their rights without our written consent</li>
                <li><strong>Notices:</strong> All notices must be in writing and sent to the addresses specified in the project agreement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
                16. Contact Information
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                For questions about these Terms of Service, please contact us:
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

            <section className="mb-8">
              <div className="bg-primary/10 dark:bg-primary/20 border-l-4 border-primary p-6 rounded">
                <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  Acknowledgment
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  BY USING OUR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
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