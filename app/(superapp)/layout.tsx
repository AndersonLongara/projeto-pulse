/**
 * SuperApp Layout - Warmth & Approachability UI
 *
 * This layout wraps all user-facing routes with the warm, friendly design:
 * - Layered shadows
 * - Generous spacing
 * - Touch-optimized targets (≥44px)
 *
 * @see .github/agents/Master.agent.md - Section 2.3
 */
export default function SuperAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile navigation will be added here */}
      <main className="flex-1 pb-20">{children}</main>
    </div>
  );
}
