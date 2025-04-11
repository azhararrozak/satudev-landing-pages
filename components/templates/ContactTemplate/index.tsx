import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Github, Twitter, Linkedin, Instagram } from 'lucide-react'
import Link from 'next/link'

export default function ContactTemplate() {
  return (
    <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-purple-600 font-bold dark:bg-blue-300 px-3 py-1 text-sm text-primary-foreground">
                  Get in Touch
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">{`Let's Discuss Your Project`}</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Have a question or ready to start your next project? Reach out to us.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Email</h3>
                    <p className="text-muted-foreground">info@techsolutions.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Phone</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Office</h3>
                    <p className="text-muted-foreground">123 Tech Street, San Francisco, CA 94107</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-bold mb-2">Follow Us</h3>
                  <div className="flex gap-4">
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      <Github className="h-5 w-5" />
                      <span className="sr-only">GitHub</span>
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      <Twitter className="h-5 w-5" />
                      <span className="sr-only">Twitter</span>
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      <Linkedin className="h-5 w-5" />
                      <span className="sr-only">LinkedIn</span>
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      <Instagram className="h-5 w-5" />
                      <span className="sr-only">Instagram</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-lg">
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Name
                      </label>
                      <Input id="name" placeholder="Enter your name" />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="Enter your email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Subject
                    </label>
                    <Input id="subject" placeholder="Enter the subject" />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Message
                    </label>
                    <Textarea id="message" placeholder="Enter your message" className="min-h-[120px]" />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-800/90 hover:to-purple-500/90 font-bold" 
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
  )
}
