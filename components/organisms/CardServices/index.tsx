import React from "react";
import Image from "next/image";

interface CardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  features?: string[];
  image?: string;
  className?: string;
}

export default function CardServices({
  title,
  description,
  icon,
  features,
  image,
  className = "",
}: CardProps) {
  return (
    <div className={`${className} group relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="absolute inset-0 z-0">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          layout="fill"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        <div className="mb-auto">
          <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg w-fit">
            {icon}
          </div>
          <h3 className="text-2xl font-bold mt-4 mb-2 text-white">{title}</h3>
          <p className="text-slate-200 mb-4">{description}</p>
        </div>

        <ul className="space-y-2 text-white">
          {features?.map((feature, i) => (
            <li key={i} className="flex items-center text-sm text-slate-200">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
