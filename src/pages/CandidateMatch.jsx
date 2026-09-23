import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

import { roles } from "./data/roles";
import { supabase } from "../lib/supabase";

function CandidateMatch() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    setError("");

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("role", "student");

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    const { data: skillData, error: skillError } = await supabase
      .from("student_skills")
      .select(`
        student_id,
        score,
        verification,
        skills (
          name
        )
      `);

    if (skillError) {
      setError(skillError.message);
      setLoading(false);
      return;
    }

    const grouped = (profileData || []).map((profile) => ({
      id: profile.id,
      name:
        profile.full_name ||
        profile.email?.split("@")[0] ||
        "Student",
      email: profile.email || "",
      skills: (skillData || [])
        .filter((item) => item.student_id === profile.id)
        .map((item) => ({
          name: item.skills?.name || "Unknown Skill",
          score: Number(item.score || 0),
          verification:
            item.verification || "Not verified",
        })),
    }));

    setCandidates(grouped);

    if (grouped.length > 0) {
      setSelectedCandidateId(grouped[0].id);
    }

    setLoading(false);
  };

  const selectedCandidate = useMemo(
    () =>
      candidates.find(
        (candidate) => candidate.id === selectedCandidateId
      ),
    [candidates, selectedCandidateId]
  );

  const selectedRole = useMemo(
    () =>
      roles.find((role) => role.id === selectedRoleId) ||
      roles[0],
    [selectedRoleId]
  );

  const getCandidateSkill = (skillName) => {
    return (
      selectedCandidate?.skills.find(
        (skill) => skill.name === skillName
      ) || null
    );
  };

  const getCoverage = (requiredSkill) => {
    const candidateSkill = getCandidateSkill(
      requiredSkill.skill
    );

    if (!candidateSkill) {
      return 0;
    }

    const rawCoverage = Math.min(
      candidateSkill.score / requiredSkill.minimum,
      1
    );

    /*
      Verified evidence receives full weight.
      Self-declared evidence receives half weight.
    */
    const verification =
      candidateSkill.verification?.toLowerCase() || "";

    if (verification.includes("self")) {
      return rawCoverage * 0.5;
    }

    return rawCoverage;
  };

  const matchResult = useMemo(() => {
    if (!selectedCandidate || !selectedRole) {
      return {
        score: 0,
        missingMustHave: false,
        details: [],
      };
    }

    let weightedCoverage = 0;
    let totalWeight = 0;
    let missingMustHave = false;

    const details = selectedRole.requiredSkills.map(
      (requiredSkill) => {
        const candidateSkill = getCandidateSkill(
          requiredSkill.skill
        );

        const currentScore = candidateSkill?.score || 0;

        const coverage = getCoverage(requiredSkill);

        const weight =
          requiredSkill.importance === "must-have"
            ? 2
            : 1;

        weightedCoverage += coverage * weight;
        totalWeight += weight;

        const status =
          currentScore >= requiredSkill.minimum
            ? "Met"
            : currentScore > 0
            ? "Partly"
            : "Missing";

        if (
          requiredSkill.importance === "must-have" &&
          status === "Missing"
        ) {
          missingMustHave = true;
        }

        return {
          ...requiredSkill,
          currentScore,
          status,
          verification:
            candidateSkill?.verification ||
            "No evidence",
        };
      }
    );

    let score =
      totalWeight === 0
        ? 0
        : Math.round(
            (weightedCoverage / totalWeight) * 100
          );

    /*
      PRD rule:
      Missing must-have skill caps the match at 60%.
    */
    if (missingMustHave) {
      score = Math.min(score, 60);
    }

    return {
      score,
      missingMustHave,
      details,
    };
  }, [selectedCandidate, selectedRole]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="font-semibold text-slate-700">
            Loading candidate matching...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-bold text-red-700">
            Unable to load candidate data
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() => navigate("/dashboard/industry")}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Industry Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Candidate Matching
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Compare verified candidate skills with role requirements.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Live data
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <button
          onClick={() => navigate("/industry/candidates")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={17} />
          Back to Candidate Search
        </button>

        {candidates.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-xl font-bold text-slate-950">
              No student candidates available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Candidates will appear after students create profiles and
              complete assessments.
            </p>
          </section>
        ) : (
          <>
            {/* SELECTORS */}
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Select Candidate
                  </label>

                  <select
                    value={selectedCandidateId}
                    onChange={(event) =>
                      setSelectedCandidateId(event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400"
                  >
                    {candidates.map((candidate) => (
                      <option
                        key={candidate.id}
                        value={candidate.id}
                      >
                        {candidate.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Target Role
                  </label>

                  <select
                    value={selectedRoleId}
                    onChange={(event) =>
                      setSelectedRoleId(event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400"
                  >
                    {roles.map((role) => (
                      <option
                        key={role.id}
                        value={role.id}
                      >
                        {role.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* MATCH SUMMARY */}
            <section className="mt-6 grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Candidate
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {selectedCandidate?.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedCandidate?.email}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Target Role
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {selectedRole.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedRole.requiredSkills.length} required skills
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Match Score
                </p>

                <div className="mt-1 flex items-end gap-2">
                  <span className="text-5xl font-bold text-blue-600">
                    {matchResult.score}
                  </span>

                  <span className="mb-2 text-lg font-semibold text-slate-400">
                    /100
                  </span>
                </div>

                <div className="mt-4 h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${matchResult.score}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            {/* MATCH EXPLANATION */}
            <section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Match Explanation
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Skill Mitra compares the candidate's verified skill
                  evidence with the minimum requirements for the selected
                  role.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {matchResult.details.map((skill) => (
                  <div
                    key={skill.skill}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {skill.status === "Met" && (
                            <CheckCircle2
                              size={19}
                              className="text-emerald-600"
                            />
                          )}

                          {skill.status === "Partly" && (
                            <CheckCircle2
                              size={19}
                              className="text-amber-500"
                            />
                          )}

                          {skill.status === "Missing" && (
                            <XCircle
                              size={19}
                              className="text-red-500"
                            />
                          )}

                          <h3 className="font-bold text-slate-950">
                            {skill.skill}
                          </h3>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Required:{" "}
                          <strong>
                            {skill.minimum}/100
                          </strong>{" "}
                          • Candidate:{" "}
                          <strong>
                            {skill.currentScore}/100
                          </strong>{" "}
                          • {skill.importance}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          skill.status === "Met"
                            ? "bg-emerald-50 text-emerald-700"
                            : skill.status === "Partly"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {skill.status}
                      </span>
                    </div>

                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${
                          skill.status === "Met"
                            ? "bg-emerald-500"
                            : skill.status === "Partly"
                            ? "bg-amber-500"
                            : "bg-red-400"
                        }`}
                        style={{
                          width: `${Math.min(
                            skill.currentScore,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck size={14} />

                      <span>
                        Evidence: {skill.verification}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* GAPS */}
            <section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-950">
                Skill Gaps
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Skills that are below the requirement for this role.
              </p>

              <div className="mt-5 space-y-3">
                {matchResult.details
                  .filter((skill) => skill.status !== "Met")
                  .map((skill) => (
                    <div
                      key={skill.skill}
                      className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">
                          {skill.skill}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Needs {Math.max(
                            skill.minimum -
                              skill.currentScore,
                            0
                          )}{" "}
                          more points to reach the target.
                        </p>
                      </div>

                      <span className="font-bold text-red-600">
                        {skill.currentScore}/{skill.minimum}
                      </span>
                    </div>
                  ))}

                {matchResult.details.every(
                  (skill) => skill.status === "Met"
                ) && (
                  <div className="rounded-2xl bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
                    All required skills are currently met for this role.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default CandidateMatch;