import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { roles } from "./data/roles";
import { supabase } from "../lib/supabase";

function CareerPath() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentSkills();
  }, []);

  const loadStudentSkills = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/");
      return;
    }

    const { data, error } = await supabase
      .from("student_skills")
      .select(`
        score,
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

  const getCurrentScore = (skillName) => {
    const found = studentSkills.find(
      (item) => item.skills?.name === skillName
    );

    return found?.score ?? 0;
  };

  const calculateReadiness = () => {
    let weightedScore = 0;
    let totalWeight = 0;

    selectedRole.requiredSkills.forEach((required) => {
      const current = getCurrentScore(required.skill);

      const coverage = Math.min(
        current / required.minimum,
        1
      );

      const weight =
        required.importance === "must-have" ? 2 : 1;

      weightedScore += coverage * weight;
      totalWeight += weight;
    });

    if (totalWeight === 0) return 0;

    return Math.round(
      (weightedScore / totalWeight) * 100
    );
  };

  const getSkillStatus = (required) => {
    const current = getCurrentScore(required.skill);

    if (current >= required.minimum) {
      return "Met";
    }

    if (current > 0) {
      return "Partly";
    }

    return "Missing";
  };

  const readiness = calculateReadiness();

  const gaps = selectedRole.requiredSkills.filter(
    (skill) => getSkillStatus(skill) !== "Met"
  );

  const nextAction =
    gaps.length > 0
      ? `Improve ${gaps[0].skill} to at least ${gaps[0].minimum}`
      : "You have met all required skills for this role.";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="font-semibold text-slate-700">
            Loading your career path...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Career Path
            </h1>

            <p className="text-sm text-slate-500">
              Understand your readiness and close your skill gaps.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Live data
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* Target Role */}
        <section className="rounded-3xl bg-white p-8 shadow-sm">

          <p className="text-sm font-medium text-slate-400">
            Target Career
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-950">
            Choose your target role
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`rounded-2xl border p-5 text-left transition ${
                  selectedRole.id === role.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <h3 className="font-bold text-slate-950">
                  {role.title}
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  {role.requiredSkills.length} required skills
                </p>
              </button>
            ))}
          </div>

        </section>

        {/* Readiness */}
        <section className="mt-6 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:col-span-1">

            <p className="text-sm text-slate-500">
              Readiness Score
            </p>

            <div className="mt-3 text-5xl font-bold text-blue-600">
              {readiness}%
            </div>

            <div className="mt-5 h-3 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-blue-600"
                style={{
                  width: `${readiness}%`,
                }}
              />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Target role:{" "}
              <strong>{selectedRole.title}</strong>
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:col-span-2">

            <p className="text-sm text-slate-500">
              Recommended Next Action
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-950">
              {nextAction}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Focus on the highest-priority skill gap first,
              then reassess your readiness.
            </p>

            <button
              onClick={() => navigate("/assessment")}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Take Skill Assessment
            </button>

          </div>

        </section>

        {/* Skill Gap Analysis */}
        <section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">

          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Skill Gap Analysis
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Compare your current verified scores with the
              requirements for {selectedRole.title}.
            </p>
          </div>

          <div className="mt-6 space-y-4">

            {selectedRole.requiredSkills.map((required) => {
              const current = getCurrentScore(required.skill);
              const status = getSkillStatus(required);

              return (
                <div
                  key={required.skill}
                  className="rounded-2xl border border-slate-200 p-5"
                >

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    <div>
                      <h3 className="font-bold text-slate-950">
                        {required.skill}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Required: {required.minimum} •{" "}
                        {required.importance}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">

                      <span className="text-lg font-bold text-slate-950">
                        {current}/100
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          status === "Met"
                            ? "bg-emerald-50 text-emerald-700"
                            : status === "Partly"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {status}
                      </span>

                    </div>

                  </div>

                  <div className="mt-4 h-2 rounded-full bg-slate-100">

                    <div
                      className={`h-2 rounded-full ${
                        status === "Met"
                          ? "bg-emerald-500"
                          : status === "Partly"
                          ? "bg-amber-500"
                          : "bg-red-400"
                      }`}
                      style={{
                        width: `${Math.min(current, 100)}%`,
                      }}
                    />

                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* Roadmap */}
        <section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-950">
            Your Roadmap
          </h2>

          <div className="mt-6 space-y-4">

            {gaps.slice(0, 4).map((gap, index) => (
              <div
                key={gap.skill}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5"
              >

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {index + 1}
                </div>

                <div>
                  <h3 className="font-bold text-slate-950">
                    Improve {gap.skill}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Target score: {gap.minimum}
                  </p>
                </div>

              </div>
            ))}

            {gaps.length === 0 && (
              <div className="rounded-2xl bg-emerald-50 p-5 text-sm font-medium text-emerald-700">
                All required skills are currently met for this role.
              </div>
            )}

          </div>

        </section>

        <button
          onClick={() => navigate("/dashboard/student")}
          className="mt-8 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          ← Back to Dashboard
        </button>

      </main>
    </div>
  );
}

export default CareerPath;