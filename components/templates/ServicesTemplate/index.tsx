import Card from "@/components/organisms/CardServices";
import services from "@/data/ServicesData";

export default function ServicesTemplate() {
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
            Our Services
          </div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Expert Software Development Solutions
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            We offer comprehensive development services to bring your digital
            vision to life.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
        {services.map((service, i) => (
          <Card
            key={i}
            title={service.title}
            description={service.description}
            icon={service.icon}
            features={service.features}
            image={service.image}
            className={i === 2 ? "md:col-span-2" : ""}
          />
        ))}
      </div>
    </div>
  </section>
  )
}

