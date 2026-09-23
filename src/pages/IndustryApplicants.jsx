import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Database,
  Mail,
  User,
  Users,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const STATUS_OPTIONS = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Offer",
  "Rejected",
];

function IndustryApplicants() {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);

  const [selectedOpportunityId, setSelectedOpportunityId] =
    useState("all");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD INDUSTRY APPLICANTS
  // --------------------------------------------------

  useEffect(() => {
    loadApplicants();
  }, []);

  const loadApplicants = async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      navigate("/");
      return;
    }

    // --------------------------------------------------
    // LOAD INDUSTRY OPPORTUNITIES
    // --------------------------------------------------

    const {
      data: opportunityData,
      error: opportunityError,
    } = await supabase
      .from("industry_opportunities")
      .select("*")
      .eq("industry_id", user.id)
      .order("created_at", { ascending: false });

    if (opportunityError) {
      setError(opportunityError.message);
      setLoading(false);
      return;
    }

    const ownOpportunities = opportunityData || [];

    setOpportunities(ownOpportunities);

    // No opportunities yet
    if (!ownOpportunities.length) {
      setApplications([]);
      setProfiles([]);
      setStudentSkills([]);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // GET OPPORTUNITY IDS
    // --------------------------------------------------

    const opportunityIds = ownOpportunities.map(
      (opportunity) => opportunity.id.toString()
    );

    // --------------------------------------------------
    // LOAD APPLICATIONS
    // --------------------------------------------------

    const {
      data: applicationData,
      error: applicationError,
    } = await supabase
      .from("applications")
      .select("id, student_id, opportunity_id, status")
      .in("opportunity_id", opportunityIds);

    if (applicationError) {
      setError(applicationError.message);
      setLoading(false);
      return;
    }

    const ownApplications = applicationData || [];

    setApplications(ownApplications);

    // --------------------------------------------------
    // GET STUDENT IDS
    // --------------------------------------------------

    const studentIds = [
      ...new Set(
        ownApplications.map(
          (application) => application.student_id
        )
      ),
    ];

    if (!studentIds.length) {
      setProfiles([]);
      setStudentSkills([]);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // LOAD STUDENT PROFILES
    // --------------------------------------------------

    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", studentIds);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // LOAD STUDENT SKILLS
    // --------------------------------------------------

    const {
      data: skillData,
      error: skillError,
    } = await supabase
      .from("student_skills")
      .select(`
        student_id,
        score,
        verification,
        skills (
          name
        )
      `)
      .in("student_id", studentIds);

    if (skillError) {
      setError(skillError.message);
      setLoading(false);
      return;
    }

    setProfiles(profileData || []);
    setStudentSkills(skillData || []);

    setLoading(false);
  };

  // --------------------------------------------------
  // FIND PROFILE
  // --------------------------------------------------

  const getProfile = (studentId) => {
    return profiles.find(
      (profile) => profile.id === studentId
    );
  };

  // --------------------------------------------------
  // GET STUDENT SKILL SCORE
  // --------------------------------------------------

  const getStudentScore = (
    studentId,
    skillName
  ) => {
    const skill = studentSkills.find(
      (item) =>
        item.student_id === studentId &&
        item.skills?.name === skillName
    );

    return Number(skill?.score || 0);
  };

  // --------------------------------------------------
  // CALCULATE MATCH
  // --------------------------------------------------

  const calculateMatch = (
    application,
    opportunity
  ) => {
    if (!opportunity?.required_skills?.length) {
      return 0;
    }

    let totalCoverage = 0;

    opportunity.required_skills.forEach(
      (required) => {
        const currentScore = getStudentScore(
          application.student_id,
          required.skill
        );

        const minimum = Number(
          required.minimum || 0
        );

        if (minimum <= 0) {
          totalCoverage += 1;
          return;
        }

        totalCoverage += Math.min(
          currentScore / minimum,
          1
        );
      }
    );

    return Math.round(
      (totalCoverage /
        opportunity.required_skills.length) *
        100
    );
  };

  // --------------------------------------------------
  // COMBINE APPLICATIONS WITH OPPORTUNITIES
  // --------------------------------------------------

  const applicantRows = useMemo(() => {
    return applications
      .map((application) => {
        const opportunity =
          opportunities.find(
            (item) =>
              item.id.toString() ===
              application.opportunity_id.toString()
          );

        if (!opportunity) {
          return null;
        }

        const profile = getProfile(
          application.student_id
        );

        return {
          ...application,
          opportunity,
          profile,
          matchScore: calculateMatch(
            application,
            opportunity
          ),
        };
      })
      .filter(Boolean)
      .filter((application) => {
        if (selectedOpportunityId === "all") {
          return true;
        }

        return (
          application.opportunity.id.toString() ===
          selectedOpportunityId
        );
      })
      .sort(
        (a, b) =>
          b.matchScore - a.matchScore
      );
  }, [
    applications,
    opportunities,
    profiles,
    studentSkills,
    selectedOpportunityId,
  ]);

  // --------------------------------------------------
  // UPDATE APPLICATION STATUS
  // --------------------------------------------------

  const updateStatus = async (
    applicationId,
    newStatus
  ) => {
    setUpdatingId(applicationId);
    setError("");

    const { error } = await supabase
      .from("applications")
      .update({
        status: newStatus,
      })
      .eq("id", applicationId);

    if (error) {
      setError(error.message);
      setUpdatingId(null);
      return;
    }

    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              status: newStatus,
            }
          : application
      )
    );

    setUpdatingId(null);
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="font-semibold text-slate-700">
            Loading applicants...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6">

          <h2 className="font-bold text-red-700">
            Unable to load applicants
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              navigate("/dashboard/industry")
            }
            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Industry Dashboard
          </button>

        </div>
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

          <div>

            <h1 className="text-2xl font-bold text-slate-950">
              Applicant Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review applicants, compare skill matches,
              and manage application status.
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Users size={24} />
          </div>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* BACK */}

        <button
          onClick={() =>
            navigate("/dashboard/industry")
          }
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        {/* SUMMARY CARDS */}

        <div className="grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-400">
              Total Opportunities
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {opportunities.length}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-400">
              Total Applicants
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {applications.length}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-400">
              Shortlisted
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {
                applications.filter(
                  (application) =>
                    application.status ===
                    "Shortlisted"
                ).length
              }
            </p>

          </div>

        </div>

        {/* FILTER */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-950">
                Applications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Applicants are ranked by skill match.
              </p>

            </div>

            <div className="relative">

              <select
                value={selectedOpportunityId}
                onChange={(event) =>
                  setSelectedOpportunityId(
                    event.target.value
                  )
                }
                className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
              >

                <option value="all">
                  All Opportunities
                </option>

                {opportunities.map(
                  (opportunity) => (
                    <option
                      key={opportunity.id}
                      value={opportunity.id}
                    >
                      {opportunity.title}
                    </option>
                  )
                )}

              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

            </div>

          </div>

        </section>

        {/* APPLICANTS */}

        <section className="mt-6 space-y-5">

          {applicantRows.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users size={30} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-950">
                No applicants yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Students who apply to your opportunities
                will appear here with their skill match.
              </p>

            </div>

          ) : (

            applicantRows.map(
              (application, index) => {

                const profile =
                  application.profile;

                const opportunity =
                  application.opportunity;

                const requiredSkills =
                  Array.isArray(
                    opportunity.required_skills
                  )
                    ? opportunity.required_skills
                    : [];

                return (
                  <article
                    key={application.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    {/* TOP */}

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div className="flex items-start gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <User size={26} />
                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                              #{index + 1}
                            </span>

                            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <Database size={12} />
                              Applicant
                            </span>

                          </div>

                          <h3 className="mt-2 text-xl font-bold text-slate-950">
                            {profile?.full_name ||
                              "Student Applicant"}
                          </h3>

                          {profile?.email && (
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                              <Mail size={14} />
                              {profile.email}
                            </p>
                          )}

                          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-blue-600">
                            <Briefcase size={14} />
                            {opportunity.title}
                          </p>

                        </div>

                      </div>

                      {/* MATCH */}

                      <div className="rounded-2xl bg-blue-50 px-6 py-4 text-center">

                        <p className="text-xs font-semibold text-slate-500">
                          Skill Match
                        </p>

                        <p className="mt-1 text-3xl font-bold text-blue-600">
                          {application.matchScore}%
                        </p>

                      </div>

                    </div>

                    {/* SKILL BREAKDOWN */}

                    <div className="mt-6 rounded-2xl border border-slate-200 p-5">

                      <div className="flex items-center justify-between">

                        <div>

                          <h4 className="font-bold text-slate-950">
                            Requirement Match
                          </h4>

                          <p className="mt-1 text-xs text-slate-500">
                            Based on the applicant's
                            current Skill Passport.
                          </p>

                        </div>

                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-3">

                        {requiredSkills.map(
                          (required) => {

                            const score =
                              getStudentScore(
                                application.student_id,
                                required.skill
                              );

                            const minimum =
                              Number(
                                required.minimum || 0
                              );

                            const met =
                              score >= minimum;

                            return (
                              <div
                                key={required.skill}
                                className={`rounded-xl p-4 ${
                                  met
                                    ? "bg-emerald-50"
                                    : "bg-red-50"
                                }`}
                              >

                                <div className="flex items-center justify-between gap-2">

                                  <p className="text-sm font-semibold text-slate-800">
                                    {required.skill}
                                  </p>

                                  {met && (
                                    <CheckCircle2
                                      size={16}
                                      className="text-emerald-600"
                                    />
                                  )}

                                </div>

                                <p
                                  className={`mt-2 text-xs font-medium ${
                                    met
                                      ? "text-emerald-700"
                                      : "text-red-600"
                                  }`}
                                >
                                  {score}/100
                                  {" · "}
                                  Required {minimum}
                                </p>

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>

                    {/* STATUS */}

                    <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">

                      <div>

                        <p className="text-sm font-semibold text-slate-700">
                          Application Status
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Update the applicant's hiring stage.
                        </p>

                      </div>

                      <div className="relative">

                        <select
                          value={
                            application.status ||
                            "Applied"
                          }
                          disabled={
                            updatingId ===
                            application.id
                          }
                          onChange={(event) =>
                            updateStatus(
                              application.id,
                              event.target.value
                            )
                          }
                          className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-60"
                        >

                          {STATUS_OPTIONS.map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            )
                          )}

                        </select>

                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                      </div>

                    </div>

                  </article>
                );
              }
            )

          )}

        </section>

      </main>

    </div>
  );
}

export default IndustryApplicants;