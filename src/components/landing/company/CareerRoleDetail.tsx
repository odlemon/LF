import Link from "next/link";
import type { CareerRole } from "@/components/landing/company/careerRoles";

const APPLY_BUTTON_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3.5 text-[14px] font-semibold text-[#fefefc] transition-colors hover:bg-black";

function RoleFacts({ facts }: { facts: NonNullable<CareerRole["facts"]> }) {
  return (
    <dl className="mt-5 divide-y divide-black/10 border-y border-black/10">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[190px_1fr] sm:gap-8"
        >
          <dt className="text-sm text-black/55">{fact.label}</dt>
          <dd className="text-sm leading-6 text-black/85">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-3 pl-5 marker:text-black/45">
      {items.map((item) => (
        <li key={item} className="pl-1 text-[15px] leading-7 text-black/75">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function CareerRoleDetail({ role }: { role: CareerRole }) {
  return (
    <article className="w-full bg-[#fefefc] text-[#0a0a0a]">
      <div className="mx-auto w-full max-w-3xl px-5 pb-20 pt-24 sm:px-8 sm:pt-28">
        <Link
          href="/careers#opportunities"
          className="text-sm text-black/60 underline decoration-black/25 underline-offset-4 hover:text-black"
        >
          All opportunities
        </Link>

        <header className="mt-8 border-b border-black/10 pb-8">
          <p className="text-sm text-black/55">
            {role.team} <span aria-hidden="true">·</span> {role.employmentType}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {role.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-black/70">
            {role.summary}
          </p>
          <Link
            href={`/careers/${role.slug}/apply`}
            className={`mt-6 ${APPLY_BUTTON_CLASSES}`}
          >
            Apply for this role <span className="ml-2" aria-hidden="true">→</span>
          </Link>
        </header>

        {role.facts?.length ? (
          <section aria-labelledby="role-details-heading" className="py-8">
            <h2 id="role-details-heading" className="text-lg font-semibold">
              Role details
            </h2>
            <RoleFacts facts={role.facts} />
          </section>
        ) : null}

        <div className="space-y-9">
          {role.companyOverview ? (
            <section className="space-y-3 border-t border-black/10 pt-8">
              <h2 className="text-xl font-semibold">About Lysp</h2>
              <p className="text-[15px] leading-7 text-black/75">
                {role.companyOverview}
                {role.customers?.length ? ` ${role.customers.join(", ")}.` : null}
              </p>
            </section>
          ) : null}

          <section className="space-y-3 border-t border-black/10 pt-8">
            <h2 className="text-xl font-semibold">The role</h2>
            <p className="text-[15px] leading-7 text-black/75">{role.overview}</p>
          </section>

          <section className="space-y-4 border-t border-black/10 pt-8">
            <h2 className="text-xl font-semibold">What you’ll be doing</h2>
            <BulletList items={role.responsibilities} />
          </section>

          <section className="space-y-4 border-t border-black/10 pt-8">
            <h2 className="text-xl font-semibold">What you have</h2>
            <BulletList items={role.qualifications} />
          </section>

          {role.niceToHave?.length ? (
            <section className="space-y-4 border-t border-black/10 pt-8">
              <h2 className="text-xl font-semibold">Nice to have</h2>
              <BulletList items={role.niceToHave} />
            </section>
          ) : null}

          {role.interviewProcess?.length ? (
            <section className="space-y-4 border-t border-black/10 pt-8">
              <h2 className="text-xl font-semibold">Interview process</h2>
              <ol className="list-decimal space-y-5 pl-5 marker:text-black/50">
                {role.interviewProcess.map((stage) => (
                  <li key={stage.title} className="pl-1">
                    <h3 className="font-semibold">{stage.title}</h3>
                    <p className="mt-1 text-[15px] leading-7 text-black/75">
                      {stage.description}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {role.reasonsToJoin?.length ? (
            <section className="space-y-4 border-t border-black/10 pt-8">
              <h2 className="text-xl font-semibold">Why you should join</h2>
              <div className="space-y-5">
                {role.reasonsToJoin.map((reason) => (
                  <div key={reason.title}>
                    <h3 className="font-semibold">{reason.title}</h3>
                    <p className="mt-1 text-[15px] leading-7 text-black/75">
                      {reason.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className="mt-10 border-t border-black/10 pt-7">
          <Link
            href={`/careers/${role.slug}/apply`}
            className={APPLY_BUTTON_CLASSES}
          >
            Apply for this role <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
