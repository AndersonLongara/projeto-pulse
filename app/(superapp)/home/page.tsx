/**
 * SuperApp Home Page
 *
 * Main entry point for the employee-facing SuperApp.
 * Quick access to chat, vacation balance, and recent payslips.
 */
export default function SuperAppHomePage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Olá! 👋
      </h1>
      <p className="mt-1 text-muted-foreground">
        Como posso ajudar você hoje?
      </p>
    </div>
  );
}
