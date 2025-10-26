import Footer from "@/components/organisms/Footer";
import Header from "@/components/organisms/Header";
import AboutTemplate from "@/components/templates/AboutTemplate";
import ContactTemplate from "@/components/templates/ContactTemplate";
import HeroTemplate from "@/components/templates/HeroTemplate";
import PortofolioTemplate from "@/components/templates/PortofolioTemplate";
import ServiceTemplate from "@/components/templates/ServicesTemplate";
import ScrollReveal from "@/components/animations/ScrollReveal";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <HeroTemplate />
      <ScrollReveal>
        <ServiceTemplate />
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <PortofolioTemplate />
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <AboutTemplate />
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <ContactTemplate />
      </ScrollReveal>
      <Footer />
    </main>
  );
}
