'use client'

import React, { useRef, FormEvent, useState } from "react";
import emailjs from "@emailjs/browser";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

export default function FormContact() {
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false); 

  const sendEmail = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.current) return;

    emailjs
      .sendForm(
        "service_8d38kbt",
        "template_0vl5vsu",
        form.current,
        "iB4wmnFu3oFcP2rUz"
      )
      .then(
        () => {
          setOpen(true);
          form.current?.reset();
        },
        (error) => {
          console.log("FAILED...", error.text);
        }
      );
  };

  return (
    <>
      <form ref={form} onSubmit={sendEmail} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              type="text"
              name="user_name"
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              name="user_email"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium">
            Subject
          </label>
          <Input
            id="subject"
            name="subject"
            placeholder="Enter the subject"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <Textarea
            id="message"
            name="message"
            placeholder="Enter your message"
            className="min-h-[120px]"
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-800/90 hover:to-purple-500/90 font-bold"
        >
          Send Message
        </Button>
      </form>

      {/* Dialog Success */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Sent</DialogTitle>
            <DialogDescription>
              Terima kasih! Pesan kamu berhasil dikirim. Kami akan segera menghubungimu.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
