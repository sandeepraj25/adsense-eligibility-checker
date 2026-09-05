import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const teamMembers = [
  {
    name: "Sandeep Raj",
    designation: "Full-Stack Engineer",
    image: "/team/member-1.png",
  },
  {
    name: "Neetu Raj",
    designation: "Ai Engineer",
    image: "/team/member-2.png",
  },
];

export function Team() {
  return (
    <section
      id="team"
      className="relative overflow-hidden py-20 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 dot-field opacity-30"
      />

      <Container size="wide" className="relative">
        {/* Section Header */}
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-cloud-50 sm:text-5xl lg:text-6xl">              Meet Our{" "}
              <span className="bg-gradient-to-r from-azure-300 to-violet-400 bg-clip-text text-transparent">
                Team Members
              </span>
            </h1>

            
          </div>
        </Reveal>

        {/* Team Cards */}
        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
          {teamMembers.map((member, index) => (
            <Reveal key={member.name} delay={index * 0.08}>
              <article className="glass group relative overflow-hidden rounded-3xl border border-white/[0.08] p-4 transition-all duration-300 hover:-translate-y-2 hover:border-azure-400/30 hover:shadow-[0_20px_60px_rgba(59,130,246,0.12)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />

                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent" />

                  {/* Member Details */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-azure-300">
                      Team Member
                    </p>

                    <h2 className="text-2xl font-bold text-cloud-50">
                      {member.name}
                    </h2>

                    <p className="mt-2 text-[0.9375rem] text-cloud-300">
                      {member.designation}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}   