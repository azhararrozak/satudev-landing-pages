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
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function FormContact() {
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

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
              {t("contact.form.name")}
            </label>
            <Input
              id="name"
              type="text"
              name="user_name"
              placeholder={t("contact.form.namePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t("contact.form.email")}
            </label>
            <Input
              id="email"
              type="email"
              name="user_email"
              placeholder={t("contact.form.emailPlaceholder")}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium">
            {t("contact.form.subject")}
          </label>
          <Input
            id="subject"
            name="subject"
            placeholder={t("contact.form.subjectPlaceholder")}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">
            {t("contact.form.message")}
          </label>
          <Textarea
            id="message"
            name="message"
            placeholder={t("contact.form.messagePlaceholder")}
            className="min-h-[120px]"
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-800/90 hover:to-purple-500/90 font-bold"
        >
          {t("contact.form.submit")}
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
