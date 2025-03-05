import React from "react";
import Image from "next/image";
import { Smartphone } from "lucide-react";

export default function index() {
  return (
    <section
    id="services"
    className="w-full bg-white py-12 md:py-24 lg-py-32 bg-muted//50 dark:bg-slate-900 dark:text-white"
  >
    <div className="w-full px-4 md:px-6 border">
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
        <div className="group relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop"
              alt="Mobile App Development"
              layout="fill"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/30" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-6 h-full flex flex-col">
            <div className="mb-auto">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg w-fit">
                <Smartphone className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mt-4 mb-2 text-white">
                Mobile App Development
              </h3>
              <p className="text-slate-200 mb-4">
                Build cross-platform mobile applications with React Native
                that deliver native performance and feel.
              </p>
            </div>

            <ul className="space-y-2 text-white">
              <li className="flex items-center space-x-2">
                Cross-platform compatibility
              </li>
              <li className="flex items-center space-x-2">
                Native performance
              </li>
              <li className="flex items-center space-x-2">
                Custom animations
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
}

