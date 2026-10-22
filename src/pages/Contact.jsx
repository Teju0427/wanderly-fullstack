import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AtSign, Camera, Mail, MapPin, Phone, PlayCircle } from 'lucide-react';
import { SectionHeading, Reveal } from '../components/ui';
import { faqs } from '../data/content';
import { api } from '../lib/api';

const initialForm = { name: '', email: '', message: '' };

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Enter your name.';
  if (!form.email.trim()) errors.email = 'Enter your email.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'That email doesn\u2019t look right.';
  if (!form.message.trim()) errors.message = 'Tell us a little about your trip.';
  else if (form.message.trim().length < 10) errors.message = 'A few more details would help (10+ characters).';
  return errors;
}

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setServerError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSending(true);
    try {
      await api('/contact', { method: 'POST', body: form });
      setSubmitted(true);
    } catch (err) {
      if (err.body?.fields) setErrors(err.body.fields);
      setServerError(err.status === 400 ? 'Please check the highlighted fields.' : err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
      <SectionHeading
        eyebrow="Get in touch"
        title="We'd love to hear about your trip"
        description="Questions about a destination, a booking, or a partnership — the team reads every message."
      />

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-stone-light/60 bg-paper-soft p-6 dark:border-teal-light/20 dark:bg-ink-soft sm:p-8">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
                  >
                    <CheckCircle2 className="h-14 w-14 text-teal dark:text-brass" />
                  </motion.div>
                  <h3 className="mt-5 font-display text-2xl font-medium text-ink dark:text-paper">
                    Message sent
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-ink/70 dark:text-paper/70">
                    Thanks, {form.name.split(' ')[0]} — we typically reply within one business day.
                  </p>
                  <button
                    onClick={() => {
                      setForm(initialForm);
                      setSubmitted(false);
                    }}
                    className="mt-6 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink hover:border-teal dark:border-paper/20 dark:text-paper dark:hover:border-brass"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-ink dark:text-paper">
                      Name
                    </label>
                    <input
                      id="name"
                      value={form.name}
                      onChange={handleChange('name')}
                      className="mt-2 w-full rounded-lg border border-stone-light bg-paper px-4 py-3 text-sm text-ink focus:border-teal focus:outline-none dark:border-teal-light/30 dark:bg-ink dark:text-paper"
                      placeholder="Your full name"
                      aria-invalid={Boolean(errors.name)}
                    />
                    {errors.name && <p className="mt-1 text-xs text-clay">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-ink dark:text-paper">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange('email')}
                      className="mt-2 w-full rounded-lg border border-stone-light bg-paper px-4 py-3 text-sm text-ink focus:border-teal focus:outline-none dark:border-teal-light/30 dark:bg-ink dark:text-paper"
                      placeholder="you@email.com"
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <p className="mt-1 text-xs text-clay">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="text-sm font-medium text-ink dark:text-paper">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange('message')}
                      className="mt-2 w-full resize-none rounded-lg border border-stone-light bg-paper px-4 py-3 text-sm text-ink focus:border-teal focus:outline-none dark:border-teal-light/30 dark:bg-ink dark:text-paper"
                      placeholder="Tell us about the trip you're planning…"
                      aria-invalid={Boolean(errors.message)}
                    />
                    {errors.message && <p className="mt-1 text-xs text-clay">{errors.message}</p>}
                  </div>

                  {serverError && (
                    <p role="alert" className="rounded-lg border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
                      {serverError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-full disabled:cursor-wait disabled:opacity-60  bg-ink px-6 py-3.5 font-medium text-paper transition-colors hover:bg-teal dark:bg-brass dark:text-ink dark:hover:bg-brass-light sm:w-auto"
                  >
                    {sending ? 'Sending…' : 'Send message'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* FAQ */}
          <div className="mt-12">
            <h2 className="font-display text-2xl font-medium text-ink dark:text-paper">Frequently asked</h2>
            <div className="mt-5 divide-y divide-stone-light/60 rounded-2xl border border-stone-light/60 dark:divide-teal-light/20 dark:border-teal-light/20">
              {faqs.map((f, i) => (
                <div key={f.q}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-ink dark:text-paper"
                  >
                    {f.q}
                    <span className="ml-4 text-lg text-stone">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-sm leading-relaxed text-ink/70 dark:text-paper/70">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact info */}
        <Reveal className="space-y-6">
          <div className="rounded-2xl border border-stone-light/60 bg-paper-soft p-6 dark:border-teal-light/20 dark:bg-ink-soft">
            <h3 className="font-mono text-xs uppercase tracking-widest text-stone dark:text-stone-light">
              Contact information
            </h3>
            <ul className="mt-4 space-y-4 text-sm text-ink/80 dark:text-paper/80">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal dark:text-brass" /> hello@wanderly.travel
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal dark:text-brass" /> +91 80 4567 1230
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal dark:text-brass" />
                Koramangala, Bengaluru, India
              </li>
            </ul>
            <div className="mt-6 flex gap-3">
              {[Camera, AtSign, PlayCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Wanderly on social media"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-light text-ink/60 transition-colors hover:border-teal hover:text-teal dark:border-teal-light/40 dark:text-paper/60 dark:hover:border-brass dark:hover:text-brass"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
