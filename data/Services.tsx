import { Smartphone, Globe, Code } from "lucide-react";

const services = [
  {
    title: "Mobile App Development",
    description:
      "Build cross-platform mobile applications with React Native that deliver native performance and feel.",
    icon: <Smartphone className="h-12 w-12 text-primary" />,
    features: [
      "Cross-platform compatibility",
      "Native performance",
      "Reusable components",
      "Fast development cycles",
    ],
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop",
  },
  {
    title: "Web Development",
    description:
      "Create modern, responsive web applications with Next.js that provide exceptional user experiences.",
    icon: <Globe className="h-12 w-12 text-primary" />,
    features: [
      "Server-side rendering",
      "Static site generation",
      "API routes",
      "Optimized performance",
    ],
    image:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2064&auto=format&fit=crop",
  },
  {
    title: "Custom Software Solutions",
    description:
      "Tailored software solutions designed to address your specific business challenges and requirements.",
    icon: <Code className="h-12 w-12 text-primary" />,
    features: [
      "Bespoke development",
      "Scalable architecture",
      "Integration capabilities",
      "Ongoing support",
    ],
    image:
      "https://images.unsplash.com/photo-1623282033815-40b05d96c903?q=80&w=2070&auto=format&fit=crop",
  },
];

export default services;