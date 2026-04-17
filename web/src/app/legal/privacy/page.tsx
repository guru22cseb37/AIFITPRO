export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Privacy policy</h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
        This demo stores profile and progress data locally in your browser for prototyping. A production deployment must
        implement HTTPS, encrypted storage, GDPR/CCPA rights (access, export, deletion), data processing agreements,
        subprocessors list, and clear retention policies. AI features should disclose model providers, training on user
        data (opt-in), and on-device processing options where applicable.
      </p>
    </div>
  );
}
