import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/PasswordResetForms";

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordForm backHref="/client-login" />
    </Suspense>
  );
}
