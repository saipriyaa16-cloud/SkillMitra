import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Clock,
  Trophy,
  CheckCircle2,
} from "lucide-react";

import { challenges } from "./data/challenges";

function Challenges() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Challenges
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Build real projects and prove your skills through evidence.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Demo data
          </span>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* BACK */}
        <button
          onClick={() => navigate("/dashboard/student")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        {/* INTRO */}
        <section className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-semibold text-purple-600">
                Project-based learning
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                Prove your skills through challenges
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Complete practical challenges, submit evidence, and strengthen
                your Skill Passport with project-based achievements.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Trophy size={30} />
            </div>

          </div>

        </section>

        {/* CHALLENGES */}
        <section className="mt-8">

          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-950">
              Available Challenges
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose a challenge that matches your current skill level.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">

            {challenges.map((challenge) => (
              <article
                key={challenge.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* TITLE */}
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-sm font-semibold text-purple-600">
                      {challenge.company}
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-slate-950">
                      {challenge.title}
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Code2 size={21} />
                  </div>

                </div>

                {/* META */}
                <div className="mt-5 flex flex-wrap gap-2">

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    {challenge.type}
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                    {challenge.difficulty}
                  </span>

                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    <Clock size={13} />
                    {challenge.duration}
                  </span>

                </div>

                {/* DESCRIPTION */}
                <p className="mt-5 text-sm leading-6 text-slate-500">
                  {challenge.description}
                </p>

                {/* SKILLS */}
                <div className="mt-5">

                  <p className="text-sm font-semibold text-slate-700">
                    Skills demonstrated
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {challenge.skills.map((skill) => (
                      <span
                        key={skill.skill}
                        className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                      >
                        <CheckCircle2 size={13} />
                        {skill.skill}
                      </span>
                    ))}

                  </div>

                </div>

                {/* BUTTON */}
                <button
                  onClick={() =>
                    navigate(`/challenges/${challenge.id}`)
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  View Challenge
                  <ArrowRight size={17} />
                </button>

              </article>
            ))}

          </div>

        </section>

      </main>
    </div>
  );
}

export default Challenges;