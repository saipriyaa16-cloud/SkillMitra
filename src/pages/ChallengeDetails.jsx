import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Code2,
  Target,
  Trophy,
} from "lucide-react";

import { challenges } from "./data/challenges";
import { supabase } from "../lib/supabase";

function ChallengeDetails() {
  const { challengeId } = useParams();
  const navigate = useNavigate();

  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const challenge = useMemo(
    () =>
      challenges.find(
        (item) => item.id === challengeId
      ),
    [challengeId]
  );

  useEffect(() => {
    loadStudentSkills();
  }, []);

  const loadStudentSkills = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      navigate("/");
      return;
    }

    const { data, error } = await supabase
      .from("student_skills")
      .select(`
        score,
        verification,
        skills (
          name
        )
      `)
      .eq("student_id", user.id);

    if (!error) {
      setStudentSkills(data || []);
    }

    setLoading(false);
  };

  const getStudentScore = (skillName) => {
    const found = studentSkills.find(
      (item) => item.skills?.name === skillName
    );

    return Number(found?.score || 0);
  };

  const getSkillReadiness = (required) => {
    const current = getStudentScore(required.skill);

    return Math.min(
      Math.round(
        (current / required.minimum) * 100
      ),
      100
    );
  };

  const overallReadiness = useMemo(() => {
    if (!challenge?.skills?.length) {
      return 0;
    }

    const total = challenge.skills.reduce(
      (sum, required) =>
        sum + getSkillReadiness(required),
      0
    );

    return Math.round(
      total / challenge.skills.length
    );
  }, [challenge, studentSkills]);

  if (!challenge) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

          <h2 className="text-xl font-bold text-slate-950">
            Challenge not found
          </h2>

          <button
            onClick={() => navigate("/challenges")}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Challenges
          </button>

        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">

          <p className="font-semibold text-slate-700">
            Loading challenge...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Challenge Details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Understand the challenge and the skills it demonstrates.
            </p>
          </div>

          <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
            Demo data
          </span>

        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* BACK */}
        <button
          onClick={() => navigate("/challenges")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={17} />
          Back to Challenges
        </button>

        {/* CHALLENGE HEADER */}
        <section className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>

              <p className="text-sm font-semibold text-purple-600">
                {challenge.company}
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                {challenge.title}
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
                {challenge.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">

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

            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Trophy size={30} />
            </div>

          </div>

        </section>

        {/* READINESS */}
        <section className="mt-6 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:col-span-1">

            <p className="text-sm text-slate-500">
              Skill Readiness
            </p>

            <div className="mt-3 text-5xl font-bold text-purple-600">
              {overallReadiness}%
            </div>

            <div className="mt-5 h-3 rounded-full bg-slate-100">

              <div
                className="h-3 rounded-full bg-purple-600"
                style={{
                  width: `${overallReadiness}%`,
                }}
              />

            </div>

            <p className="mt-4 text-sm text-slate-500">
              Based on your current verified skills.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:col-span-2">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Target size={24} />
              </div>

              <div>

                <h3 className="text-xl font-bold text-slate-950">
                  Challenge Objective
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Complete the practical task and submit evidence of your
                  work. Successful completion can strengthen your skill
                  profile.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* REQUIRED SKILLS */}
        <section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-950">
            Required Skills
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your current scores compared with the recommended minimum level.
          </p>

          <div className="mt-6 space-y-4">

            {challenge.skills.map((required) => {

              const current = getStudentScore(
                required.skill
              );

              const met =
                current >= required.minimum;

              return (
                <div
                  key={required.skill}
                  className="rounded-2xl border border-slate-200 p-5"
                >

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    <div>

                      <div className="flex items-center gap-2">

                        {met && (
                          <CheckCircle2
                            size={18}
                            className="text-emerald-600"
                          />
                        )}

                        <h3 className="font-bold text-slate-950">
                          {required.skill}
                        </h3>

                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        Recommended minimum: {required.minimum}/100
                      </p>

                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        met
                          ? "bg-emerald-50 text-emerald-700"
                          : current > 0
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {current}/100
                    </span>

                  </div>

                  <div className="mt-4 h-2 rounded-full bg-slate-100">

                    <div
                      className={`h-2 rounded-full ${
                        met
                          ? "bg-emerald-500"
                          : current > 0
                          ? "bg-amber-500"
                          : "bg-red-400"
                      }`}
                      style={{
                        width: `${Math.min(
                          current,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    {met
                      ? "Skill requirement met"
                      : `Needs ${Math.max(
                          required.minimum - current,
                          0
                        )} more points`}
                  </p>

                </div>
              );
            })}

          </div>

        </section>

        {/* DELIVERABLES */}
        <section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Code2 size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Expected Deliverables
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your submission should demonstrate these outcomes.
              </p>
            </div>

          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">

            {challenge.deliverables.map(
              (deliverable, index) => (
                <div
                  key={deliverable}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"
                >

                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                    {index + 1}
                  </div>

                  <p className="text-sm font-medium text-slate-700">
                    {deliverable}
                  </p>

                </div>
              )
            )}

          </div>

        </section>

        {/* START */}
        <section className="mt-6 rounded-3xl bg-slate-900 p-8 text-center">

          <h2 className="text-2xl font-bold text-white">
            Ready to take the challenge?
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">
            Start working on the challenge and submit your project evidence
            when you are ready.
          </p>

          <button
            onClick={() =>
              navigate(
                `/challenges/${challenge.id}/submit`
              )
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Start Challenge
            <ArrowRight size={17} />
          </button>

        </section>

      </main>
    </div>
  );
}

export default ChallengeDetails;