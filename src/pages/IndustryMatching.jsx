import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function IndustryMatching() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMatchingData();
  }, []);

  const loadMatchingData = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/");
        return;
      }

      // --------------------------------------------------
      // LOAD LATEST ROLE REQUIREMENTS
      // --------------------------------------------------

      const { data: roleData, error: roleError } = await supabase
        .from("role_requirements")
        .select("*")
        .eq("industry_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (roleError) {
        throw roleError;
      }

      if (!roleData) {
        setError(
          "No role requirements found. Please create a role first."
        );
        setLoading(false);
        return;
      }

      setRole(roleData);

      // --------------------------------------------------
      // LOAD STUDENT SKILLS
      // --------------------------------------------------

      const { data: skillsData, error: skillsError } = await supabase
        .from("student_skills")
        .select(`
          student_id,
          score,
          verification,
          skills (
            name
          )
        `);

      if (skillsError) {
        throw skillsError;
      }

      // --------------------------------------------------
      // LOAD STUDENT PROFILES
      // --------------------------------------------------

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("role", "student");

      if (profilesError) {
        throw profilesError;
      }

      // --------------------------------------------------
      // GROUP SKILLS BY STUDENT
      // --------------------------------------------------

      const groupedStudents = {};

      (skillsData || []).forEach((item) => {
        if (!groupedStudents[item.student_id]) {
          groupedStudents[item.student_id] = [];
        }

        groupedStudents[item.student_id].push(item);
      });

      // --------------------------------------------------
      // BUILD CANDIDATE LIST
      // --------------------------------------------------

      const candidateResults = (profilesData || []).map((profile) => {
        const studentSkills =
          groupedStudents[profile.id] || [];

        const matchResult = calculateMatch(
          roleData.requirements || [],
          studentSkills
        );

        return {
          ...profile,
          skills: studentSkills,
          ...matchResult,
        };
      });

      // Highest match first
      candidateResults.sort(
        (a, b) => b.matchScore - a.matchScore
      );

      setCandidates(candidateResults);
    } catch (err) {
      console.error("Candidate matching error:", err);
      setError(
        err.message ||
          "Unable to load candidate matching data."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // MATCHING FORMULA
  // --------------------------------------------------

  const calculateMatch = (requirements, studentSkills) => {
    if (!requirements.length) {
      return {
        matchScore: 0,
        missingMustHave: false,
        details: [],
      };
    }

    let weightedCoverage = 0;
    let totalWeight = 0;
    let missingMustHave = false;

    const details = requirements.map((requirement) => {
      const weight =
        requirement.importance === "Must-have"
          ? 2
          : 1;

      totalWeight += weight;

      const matchingSkill = studentSkills.find(
        (item) =>
          item.skills?.name?.toLowerCase() ===
          requirement.skill?.toLowerCase()
      );

      const rawScore = Number(
        matchingSkill?.score || 0
      );

      const verification =
        matchingSkill?.verification || "Self-declared";

      // Verified evidence gets full weight.
      // Self-declared evidence gets half weight.
      const effectiveScore =
        verification.toLowerCase().includes("self")
          ? rawScore * 0.5
          : rawScore;

      const minimum = Number(
        requirement.level || 0
      );

      const coverage =
        minimum > 0
          ? Math.min(effectiveScore / minimum, 1)
          : 1;

      weightedCoverage +=
        weight * coverage;

      let status = "Missing";

      if (rawScore >= minimum && minimum > 0) {
        status = "Met";
      } else if (rawScore > 0) {
        status = "Partly met";
      }

      if (
        requirement.importance === "Must-have" &&
        rawScore < minimum
      ) {
        missingMustHave = true;
      }

      return {
        skill: requirement.skill,
        required: minimum,
        current: rawScore,
        verification,
        importance: requirement.importance,
        status,
      };
    });

    let score =
      totalWeight > 0
        ? (weightedCoverage / totalWeight) * 100
        : 0;

    // PRD rule:
    // Missing must-have caps match at 60%.
    if (missingMustHave) {
      score = Math.min(score, 60);
    }

    return {
      matchScore: Math.round(score),
      missingMustHave,
      details,
    };
  };

  const roleRequirements = useMemo(() => {
    return role?.requirements || [];
  }, [role]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <div className="flex items-center gap-3">
            <RefreshCw
              size={20}
              className="animate-spin text-blue-600"
            />

            <p className="font-semibold text-slate-700">
              Calculating candidate matches...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-5">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-950">
                Candidate Matching
              </h1>

              <p className="text-sm text-slate-500">
                Match students against your role requirements.
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-bold text-red-700">
              Unable to load matching data
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={loadMatchingData}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-950">
                Candidate Matching
              </h1>

              <p className="text-sm text-slate-500">
                Find candidates based on your role requirements.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 sm:flex">
            <Briefcase size={16} />
            Industry
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* ROLE CARD */}
        <section className="rounded-3xl bg-white p-7 shadow-sm">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Matching candidates for
              </p>

              <h2 className="mt-1 text-3xl font-bold text-slate-950">
                {role.role_title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {roleRequirements.length} required skills
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/industry/requirements")
              }
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Edit Requirements
            </button>

          </div>

          {/* REQUIREMENT PILLS */}
          <div className="mt-6 flex flex-wrap gap-3">
            {roleRequirements.map((requirement, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-800">
                  {requirement.skill}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Minimum {requirement.level} •{" "}
                  {requirement.importance}
                </p>
              </div>
            ))}
          </div>

        </section>

        {/* RESULTS */}
        <section className="mt-8">

          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Matched Candidates
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Candidates are calculated from their stored skill scores.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {candidates.length} candidates
            </span>
          </div>

          {candidates.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="font-semibold text-slate-700">
                No student candidates found.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {candidates.map((candidate) => (

                <div
                  key={candidate.id}
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                >

                  {/* Candidate Header */}
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

                    <div>
                      <h3 className="text-xl font-bold text-slate-950">
                        {candidate.full_name ||
                          candidate.email ||
                          "Student"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {candidate.email}
                      </p>
                    </div>

                    {/* Match Score */}
                    <div className="rounded-2xl bg-blue-50 px-6 py-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Skill Match
                      </p>

                      <p className="mt-1 text-3xl font-bold text-blue-700">
                        {candidate.matchScore}%
                      </p>
                    </div>

                  </div>

                  {/* Requirement Breakdown */}
                  <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">

                    {candidate.details.map(
                      (detail, index) => {

                        const isMet =
                          detail.status === "Met";

                        const isPartial =
                          detail.status === "Partly met";

                        return (
                          <div
                            key={index}
                            className="rounded-2xl border border-slate-200 p-4"
                          >

                            <div className="flex items-start justify-between gap-3">

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {detail.skill}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {detail.current}/100 • Required{" "}
                                  {detail.required}
                                </p>
                              </div>

                              {isMet ? (
                                <CheckCircle2
                                  size={20}
                                  className="text-emerald-500"
                                />
                              ) : isPartial ? (
                                <AlertCircle
                                  size={20}
                                  className="text-orange-500"
                                />
                              ) : (
                                <XCircle
                                  size={20}
                                  className="text-red-500"
                                />
                              )}

                            </div>

                            <div className="mt-3 flex items-center justify-between">

                              <span
                                className={`text-xs font-bold ${
                                  isMet
                                    ? "text-emerald-600"
                                    : isPartial
                                    ? "text-orange-600"
                                    : "text-red-600"
                                }`}
                              >
                                {detail.status}
                              </span>

                              <span className="text-xs text-slate-400">
                                {detail.importance}
                              </span>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                  {/* Missing Must Have */}
                  {candidate.missingMustHave && (
                    <div className="mt-5 flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
                      <AlertCircle size={18} />
                      Missing must-have skill — match capped at 60%
                    </div>
                  )}

                </div>

              ))}

            </div>
          )}

        </section>

        {/* DEMO DATA */}
        <div className="mt-10 flex justify-center">
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
            Live Supabase data • Skill Mitra prototype
          </div>
        </div>

      </main>
    </div>
  );
}

export default IndustryMatching;