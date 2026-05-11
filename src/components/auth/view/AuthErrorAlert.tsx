type AuthErrorAlertProps = {
  errorMessage: string;
};

export default function AuthErrorAlert({ errorMessage }: AuthErrorAlertProps) {
  if (!errorMessage) {
    return null;
  }

  return (
    <div className="border-[var(--err)]/30 bg-[var(--err)]/10 dark:border-[var(--err)]/80 dark:bg-[var(--err)]/10 rounded-md border p-3">
      <p className="text-sm text-[var(--err)] dark:text-[var(--err)]">{errorMessage}</p>
    </div>
  );
}
