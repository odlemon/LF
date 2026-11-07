"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { HiArrowLeft, HiCheckCircle, HiUpload } from "react-icons/hi";
import { apiClient } from "@/lib/api/client";
import type { CareerRole } from "@/components/landing/company/careerRoles";
import { MARKETING_SHELL, PageHeroHeader } from "@/components/landing/editorial";

const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const MIN_RESPONSE_LENGTH = 100;
const MAX_RESPONSE_LENGTH = 4000;

export function CareerApplicationForm({ role }: { role: CareerRole }) {
  const [resumeName, setResumeName] = useState("");
  const [responseText, setResponseText] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleResumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError("");
    setSubmitted(false);
    if (!file) {
      setResumeName("");
      return;
    }

    if (!/\.(pdf|doc|docx)$/i.test(file.name) || file.size > MAX_RESUME_BYTES) {
      setResumeName("");
      event.target.value = "";
      setError("Choose a PDF, DOC, or DOCX resume under 10 MB.");
      return;
    }

    setResumeName(file.name);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const answer = String(new FormData(form).get("response") ?? "").trim();
    if (answer.length < MIN_RESPONSE_LENGTH) {
      setError(`Please provide at least ${MIN_RESPONSE_LENGTH} characters about your experience.`);
      return;
    }
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData(form);
      formData.set("role", role.slug);
      formData.set("response", answer);
      await apiClient.post("/api/v1/careers/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          setUploadProgress(
            event.total ? Math.min(100, Math.round((event.loaded * 100) / event.total)) : null
          );
        },
      });
      setSubmitted(true);
      form.reset();
      setResumeName("");
      setResponseText("");
    } catch (submitError) {
      const apiMessage = (submitError as {
        response?: { data?: { message?: string } };
      }).response?.data?.message;
      setError(apiMessage || "We could not submit your application. Please try again.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      <section className="relative overflow-hidden bg-[#0a0f0d] text-[#fefefc]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,rgba(254,254,252,0.1),transparent_42%)]"
        />
        <div className={`relative ${MARKETING_SHELL} pb-12 pt-28 sm:pb-16 sm:pt-36`}>
          <Link
            href={`/careers/${role.slug}`}
            className="mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-white/65 transition-colors hover:text-white"
          >
            <HiArrowLeft className="h-4 w-4" />
            Back to role
          </Link>
          <PageHeroHeader
            tone="dark"
            eyebrow="Application"
            title={`Apply for ${role.title}.`}
            description="Share your experience and attach your resume."
          />
        </div>
      </section>

      <section>
        <div className={`${MARKETING_SHELL} grid grid-cols-1 gap-10 py-14 sm:py-18 lg:grid-cols-12 lg:gap-16`}>
          <aside className="lg:col-span-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a]/45">
              Applying for
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">{role.title}</h2>
            <p className="mt-2 text-[14px] text-[#0a0a0a]/60">{role.team}</p>
          </aside>

          <div className="lg:col-span-8">
            {submitted ? (
              <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8" role="status">
                <HiCheckCircle className="h-7 w-7 text-[#0a0a0a]/65" />
                <h2 className="mt-4 text-xl font-semibold tracking-tight">Application submitted</h2>
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#0a0a0a]/60">
                  Thank you for applying. Lysp has received your answer and resume.
                </p>
                <Link
                  href="/careers#opportunities"
                  className="mt-6 inline-flex text-[14px] font-semibold underline decoration-black/25 underline-offset-4 hover:decoration-black"
                >
                  View other roles
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="space-y-7 rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8">
                <label className="block">
                  <span className="text-[13px] font-semibold tracking-wide text-[#0a0a0a]/75">
                    {role.applicationQuestion} <span aria-hidden className="text-red-700">*</span>
                  </span>
                  <textarea
                    required
                    minLength={MIN_RESPONSE_LENGTH}
                    maxLength={MAX_RESPONSE_LENGTH}
                    name="response"
                    rows={6}
                    value={responseText}
                    aria-describedby="application-response-help"
                    aria-invalid={responseText.trim().length > 0 && responseText.trim().length < MIN_RESPONSE_LENGTH}
                    onChange={(event) => {
                      setResponseText(event.target.value);
                      setError("");
                    }}
                    className="mt-3 w-full resize-y rounded-xl border border-black/15 bg-transparent px-4 py-3 text-[15px] leading-relaxed outline-none transition-colors focus-visible:border-[#0a0a0a] focus-visible:ring-4 focus-visible:ring-[#0a0a0a]/10"
                    placeholder={role.applicationPlaceholder}
                  />
                  <span id="application-response-help" className="mt-2 block text-[12px] text-[#0a0a0a]/55" aria-live="polite">
                    At least {MIN_RESPONSE_LENGTH} characters required. {responseText.length}/{MAX_RESPONSE_LENGTH} characters.
                  </span>
                </label>

                <div>
                  <span className="text-[13px] font-semibold tracking-wide text-[#0a0a0a]/75">
                    Resume <span aria-hidden className="text-red-700">*</span>
                  </span>
                  <label className="mt-3 flex cursor-pointer flex-col items-start gap-3 rounded-xl border border-dashed border-black/20 bg-[#fafaf8] p-5 transition-colors hover:border-black/35 sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0a0a0a]/65">
                        <HiUpload className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-[14px] font-semibold">{resumeName || "Choose a resume to attach"}</span>
                        <span className="mt-1 block text-[12px] text-[#0a0a0a]/50">PDF, DOC, or DOCX. Up to 10 MB.</span>
                      </span>
                    </span>
                    <span className="rounded-full border border-black/15 px-4 py-2 text-[12px] font-semibold">Browse files</span>
                    <input
                      required
                      name="resume"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeChange}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="border-t border-black/[0.08] pt-5">
                  {error ? <p className="mb-4 text-[13px] text-red-700" role="alert">{error}</p> : null}
                  <p className="text-[12px] leading-relaxed text-[#0a0a0a]/50">
                    By submitting, you send your answer and resume to Lysp for this role.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3.5 text-[14px] font-semibold text-[#fefefc] transition-colors hover:bg-[#252525] disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        />
                        {uploadProgress !== null && uploadProgress < 100
                          ? `Uploading ${uploadProgress}%`
                          : "Submitting application"}
                      </>
                    ) : (
                      <>
                        Submit application
                        <HiCheckCircle className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  {isSubmitting && uploadProgress !== null ? (
                    <div className="mt-4" role="status" aria-live="polite">
                      <div className="mb-1 flex justify-between text-[12px] text-[#0a0a0a]/55">
                        <span>Uploading your application</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label="Application upload progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={uploadProgress}
                        className="h-1.5 overflow-hidden rounded-full bg-black/10"
                      >
                        <div
                          className="h-full rounded-full bg-[#0a0a0a] transition-[width] duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
