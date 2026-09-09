import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/PasswordResetForms";

export default function Page() {
  return (
    <Suspense>
      <ForgotPasswordForm portal={true} backHref="/client-login" />
    </Suspense>
  );
}
