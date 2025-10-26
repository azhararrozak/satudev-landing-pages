"use client"

import Card from "@/components/organisms/CardServices";
import { useServices } from "@/data/ServicesData";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion } from "framer-motion";

export default function ServicesTemplate() {
  const { t } = useLanguage()
  const services = useServices();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  return (
    <section
    id="services"
    className="w-full bg-white py-12 md:py-24 lg-py-32 bg-muted//50 dark:bg-slate-900 dark:text-white"
  >
    <div className="w-full px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <div className="inline-block rounded-lg bg-purple-600 text-white font-bold dark:bg-blue-300 px-3 py-1 text-sm  light:text-black">
            {" "}
            {t("services.badge")}
          </div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            {t("services.title")}
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            {t("services.subtitle")}
          </p>
        </div>
      </div>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {services.map((service, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className={i === 2 ? "md:col-span-2" : ""}
          >
            <Card
              title={service.title}
              description={service.description}
              icon={service.icon}
              features={service.features}
              image={service.image}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
  )
}

