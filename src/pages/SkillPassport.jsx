import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ExternalLink,
  Trophy,
  FileCheck,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { challenges } from "./data/challenges";

function SkillPassport() {
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState("Student");
  const [studentId, setStudentId] = useState("");
  const [skills, setSkills] = useState([]);
  const [challengeSubmissions, setChallengeSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPassport();
  }, []);

  const loadPassport = async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Please sign in to view your Skill Passport.");
      setLoading(false);
      return;
    }

    setStudentId(user.id);

    // Get student profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setStudentName(
      profile?.full_name ||
        profile?.email?.split("@")[0] ||
        "Student"
    );

    // Get all skills
    const { data: allSkills, error: skillsError } = await supabase
      .from("skills")
      .select("id, name")
      .order("id");

    if (skillsError) {
      setError(skillsError.message);
      setLoading(false);
      return;
    }

    // Get student's assessment-based skills
    const { data: studentSkills, error: studentSkillsError } =
      await supabase
        .from("student_skills")
        .select("skill_id, score, verification")
        .eq("student_id", user.id);

    if (studentSkillsError) {
      setError(studentSkillsError.message);
      setLoading(false);
      return;
    }

    // Get challenge submissions
    const {
      data: submissions,
      error: submissionsError,
    } = await supabase
      .from("challenge_submissions")
      .select(
        "id, challenge_id, submission_text, project_url, status, submitted_at"
      )
      .eq("student_id", user.id)
      .order("submitted_at", { ascending: false });

    if (submissionsError) {
      setError(submissionsError.message);
      setLoading(false);
      return;
    }

    setChallengeSubmissions(submissions || []);

    // Combine skills + assessment evidence + challenge evidence
    const passportSkills = (allSkills || []).map((skill) => {
      const studentSkill = (studentSkills || []).find(
        (item) => item.skill_id === skill.id
      );

      const skillEvidence = [];

      // Assessment evidence
      if (studentSkill) {
        skillEvidence.push({
          type: "Assessment",
          label: "Assessment-verified",
        });
      }

      // Challenge evidence
      (submissions || []).forEach((submission) => {
        const challenge = challenges.find(
          (item) => item.id === submission.challenge_id
        );

        if (!challenge) return;

        const matchedSkill = challenge.skills?.find(
          (requiredSkill) => requiredSkill.skill === skill.name
        );

        if (matchedSkill) {
          skillEvidence.push({
            type: "Challenge",
            label: challenge.title,
            projectUrl: submission.project_url,
            status: submission.status,
          });
        }
      });

      return {
        id: skill.id,
        skill: skill.name,
        score: studentSkill?.score ?? 0,
        verification:
          studentSkill?.verification || "Not assessed",
        evidence: skillEvidence,
      };
    });

    setSkills(passportSkills);
    setLoading(false);
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const assessmentCount = skills.reduce(
    (total, skill) =>
      total +
      skill.evidence.filter(
        (item) => item.type === "Assessment"
      ).length,
    0
  );

  const challengeEvidenceCount = skills.reduce(
    (total, skill) =>
      total +
      skill.evidence.filter(
        (item) => item.type === "Challenge"
      ).length,
    0
  );

  const totalEvidence = assessmentCount + challengeEvidenceCount;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="font-semibold text-slate-700">
            Loading your Skill Passport...
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
              Skill Passport
            </h1>

            <p className="text-sm text-slate-500">
              A verified record of your skills and evidence.
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Live data
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-5 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Student Profile */}
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-400">
            Student
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-950">
            {studentName}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Passport ID: {studentId}
          </p>
        </section>

        {/* Skills */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Verified Skills
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Skills backed by assessments and project evidence.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
              <FileCheck size={16} />
              {totalEvidence} Evidence
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                {/* Skill Header */}
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-950">
                    {skill.skill}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      skill.verification ===
                      "Assessment-verified"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {skill.verification}
                  </span>
                </div>

                {/* Score */}
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-4xl font-bold text-blue-600">
                    {skill.score}
                  </span>

                  <span className="mb-1 text-sm text-slate-400">
                    /100
                  </span>
                </div>

                {/* Progress */}
                <div className="mt-4 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{
                      width: `${skill.score}%`,
                    }}
                  />
                </div>

                {/* Evidence Count */}
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Evidence: {skill.evidence.length} item(s)
                </p>

                {/* Evidence List */}
                {skill.evidence.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {skill.evidence.map(
                      (evidence, index) => (
                        <div
                          key={`${skill.id}-${index}`}
                          className="rounded-xl bg-slate-50 p-3"
                        >
                          <div className="flex items-center gap-2">
                            {evidence.type === "Assessment" ? (
                              <CheckCircle
                                size={16}
                                className="text-emerald-600"
                              />
                            ) : (
                              <Trophy
                                size={16}
                                className="text-blue-600"
                              />
                            )}

                            <span className="text-xs font-semibold text-slate-700">
                              {evidence.type ===
                              "Assessment"
                                ? evidence.label
                                : "Challenge Evidence"}
                            </span>
                          </div>

                          {evidence.type ===
                            "Challenge" && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-slate-800">
                                {evidence.label}
                              </p>

                              <div className="mt-1 flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                  {evidence.status}
                                </span>

                                {evidence.projectUrl && (
                                  <a
                                    href={
                                      evidence.projectUrl
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                                  >
                                    View Project
                                    <ExternalLink
                                      size={12}
                                    />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Evidence Summary */}
        <section className="mt-6">
          <h2 className="text-2xl font-bold text-slate-950">
            Evidence Summary
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-4">
            {/* Projects */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-400">
                Projects
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                {challengeSubmissions.length}
              </p>
            </div>

            {/* Internships */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-400">
                Internships
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                0
              </p>
            </div>

            {/* Certifications */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-400">
                Certifications
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                0
              </p>
            </div>

            {/* Challenges */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm text-blue-600">
                Challenges
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-700">
                {challengeSubmissions.length}
              </p>
            </div>
          </div>
        </section>

        {/* Challenge Evidence */}
        {challengeSubmissions.length > 0 && (
          <section className="mt-6">
            <h2 className="text-2xl font-bold text-slate-950">
              Challenge Evidence
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Projects submitted through Skill Mitra.
            </p>

            <div className="mt-5 space-y-4">
              {challengeSubmissions.map(
                (submission) => {
                  const challenge = challenges.find(
                    (item) =>
                      item.id ===
                      submission.challenge_id
                  );

                  return (
                    <div
                      key={submission.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <Trophy
                              size={20}
                              className="text-blue-600"
                            />

                            <h3 className="text-lg font-bold text-slate-950">
                              {challenge?.title ||
                                "Challenge"}
                            </h3>
                          </div>

                          <p className="mt-2 text-sm text-slate-500">
                            Submitted on{" "}
                            {formatDate(
                              submission.submitted_at
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                            {submission.status}
                          </span>

                          {submission.project_url && (
                            <a
                              href={
                                submission.project_url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                              View Project
                              <ExternalLink
                                size={15}
                              />
                            </a>
                          )}
                        </div>
                      </div>

                      {submission.submission_text && (
                        <div className="mt-5 rounded-xl bg-slate-50 p-4">
                          <p className="text-sm leading-6 text-slate-600">
                            {submission.submission_text}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}

        {/* Back */}
        <button
          onClick={() =>
            navigate("/dashboard/student")
          }
          className="mt-8 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          ← Back to Dashboard
        </button>
      </main>
    </div>
  );
}

export default SkillPassport;