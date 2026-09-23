import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  MapPin,
  Clock,
  Users,
  Database,
} from "lucide-react";

import { opportunities } from "./data/opportunities";
import { supabase } from "../lib/supabase";

function OpportunityDetails() {
  const { opportunityId } = useParams();
  const navigate = useNavigate();

  const [studentSkills, setStudentSkills] = useState([]);
  const [opportunity, setOpportunity] = useState(null);

  const [loading, setLoading] = useState(true);

  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationError, setApplicationError] = useState("");

  // --------------------------------------------------
  // LOAD EVERYTHING
  // --------------------------------------------------

  useEffect(() => {
    loadOpportunityData();
  }, [opportunityId]);

  const loadOpportunityData = async () => {
    setLoading(true);
    setApplicationError("");

    // --------------------------------------------------
    // GET CURRENT USER
    // --------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      navigate("/");
      return;
    }

    // --------------------------------------------------
    // LOAD STUDENT SKILLS
    // --------------------------------------------------

    const { data: skillsData, error: skillsError } = await supabase
      .from("student_skills")
      .select(`
        score,
        verification,
        skills (
          name
        )
      `)
      .eq("student_id", user.id);

    if (skillsError) {
      setApplicationError(skillsError.message);
      setLoading(false);
      return;
    }

    setStudentSkills(skillsData || []);

    // --------------------------------------------------
    // FIRST: CHECK DEMO OPPORTUNITIES
    // --------------------------------------------------

    const demoOpportunity = opportunities.find(
      (item) => item.id === opportunityId
    );

    if (demoOpportunity) {
      setOpportunity({
        ...demoOpportunity,
        source: "demo",
      });

      // Check existing application
      const { data: existingApplication } = await supabase
        .from("applications")
        .select("id, status")
        .eq("student_id", user.id)
        .eq("opportunity_id", demoOpportunity.id)
        .maybeSingle();

      if (existingApplication) {
        setApplied(true);
      }

      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // SECOND: CHECK INDUSTRY OPPORTUNITIES
    // --------------------------------------------------

    const {
      data: industryOpportunity,
      error: industryError,
    } = await supabase
      .from("industry_opportunities")
      .select("*")
      .eq("id", opportunityId)
      .eq("status", "Open")
      .maybeSingle();

    if (industryError) {
      setApplicationError(industryError.message);
      setLoading(false);
      return;
    }

    if (!industryOpportunity) {
      setOpportunity(null);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // CONVERT INDUSTRY OPPORTUNITY
    // TO SAME FORMAT AS DEMO OPPORTUNITY
    // --------------------------------------------------

    const formattedIndustryOpportunity = {
      id: industryOpportunity.id,
      company: industryOpportunity.company,
      title: industryOpportunity.title,
      type: industryOpportunity.type,
      location: industryOpportunity.remote
        ? "Remote"
        : industryOpportunity.location || "Not specified",
      remote: industryOpportunity.remote,
      openings: industryOpportunity.openings,
      stipend: industryOpportunity.stipend || "Not specified",
      deadline: industryOpportunity.deadline || "Not specified",
      description: industryOpportunity.description || "",
      requiredSkills: Array.isArray(
        industryOpportunity.required_skills
      )
        ? industryOpportunity.required_skills.map((skill) => ({
            skill: skill.skill,
            minimum: Number(skill.minimum || 0),
          }))
        : [],
      source: "industry",
    };

    setOpportunity(formattedIndustryOpportunity);

    // --------------------------------------------------
    // CHECK EXISTING APPLICATION
    // --------------------------------------------------

    const { data: existingApplication } = await supabase
      .from("applications")
      .select("id, status")
      .eq("student_id", user.id)
      .eq("opportunity_id", industryOpportunity.id)
      .maybeSingle();

    if (existingApplication) {
      setApplied(true);
    }

    setLoading(false);
  };

  // --------------------------------------------------
  // GET STUDENT SCORE
  // --------------------------------------------------

  const getStudentScore = (skillName) => {
    const skill = studentSkills.find(
      (item) => item.skills?.name === skillName
    );

    return Number(skill?.score || 0);
  };

  // --------------------------------------------------
  // CALCULATE MATCH SCORE
  // --------------------------------------------------

  const matchScore = useMemo(() => {
    if (!opportunity) {
      return 0;
    }

    if (!opportunity.requiredSkills?.length) {
      return 0;
    }

    let totalCoverage = 0;

    opportunity.requiredSkills.forEach((required) => {
      const currentScore = getStudentScore(required.skill);
      const minimum = Number(required.minimum || 0);

      if (minimum <= 0) {
        totalCoverage += 1;
        return;
      }

      totalCoverage += Math.min(
        currentScore / minimum,
        1
      );
    });

    return Math.round(
      (totalCoverage / opportunity.requiredSkills.length) *
        100
    );
  }, [opportunity, studentSkills]);

  // --------------------------------------------------
  // APPLY
  // --------------------------------------------------

  const handleApply = async () => {
    if (!opportunity) {
      return;
    }

    setApplying(true);
    setApplicationError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setApplicationError(
        "Your session has expired. Please sign in again."
      );
      setApplying(false);
      return;
    }

    // Prevent duplicate applications
    const { data: existingApplication } = await supabase
      .from("applications")
      .select("id, status")
      .eq("student_id", user.id)
      .eq("opportunity_id", opportunity.id)
      .maybeSingle();

    if (existingApplication) {
      setApplied(true);
      setApplying(false);
      return;
    }

    // --------------------------------------------------
    // INSERT APPLICATION
    // --------------------------------------------------

    const { error } = await supabase
      .from("applications")
      .insert({
        student_id: user.id,
        opportunity_id: opportunity.id,
        status: "Applied",
      });

    if (error) {
      if (error.code === "23505") {
        setApplied(true);
        setApplicationError("");
      } else {
        setApplicationError(error.message);
      }

      setApplying(false);
      return;
    }

    setApplied(true);
    setApplying(false);
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="font-semibold text-slate-700">
            Loading opportunity...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // NOT FOUND
  // --------------------------------------------------

  if (!opportunity) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Opportunity not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This opportunity may have been closed or removed.
          </p>

          <button
            onClick={() => navigate("/opportunities")}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Opportunities
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Opportunity Details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review the role and your verified skill match.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Live data
          </span>

        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* BACK */}

        <button
          onClick={() => navigate("/opportunities")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={17} />
          Back to Opportunities
        </button>

        {/* ROLE HEADER */}

        <section className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>

              {opportunity.source === "industry" && (
                <div className="mb-3">

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <Database size={13} />
                    Industry Posted
                  </span>

                </div>
              )}

              <p className="text-sm font-semibold text-blue-600">
                {opportunity.company}
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                {opportunity.title}
              </h2>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">

                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                  {opportunity.type}
                </span>

                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
                  <MapPin size={14} />
                  {opportunity.location}
                </span>

                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
                  <Users size={14} />
                  {opportunity.openings} openings
                </span>

                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
                  <Clock size={14} />
                  Deadline {opportunity.deadline}
                </span>

              </div>

            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Briefcase size={30} />
            </div>

          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-slate-400">
                Stipend
              </p>

              <p className="mt-1 text-xl font-bold text-slate-950">
                {opportunity.stipend}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-slate-400">
                Work Mode
              </p>

              <p className="mt-1 text-xl font-bold text-slate-950">
                {opportunity.remote
                  ? "Remote"
                  : opportunity.location}
              </p>

            </div>

          </div>

          {/* DESCRIPTION */}

          {opportunity.description && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">

              <p className="text-sm font-semibold text-slate-700">
                About this opportunity
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {opportunity.description}
              </p>

            </div>
          )}

        </section>

        {/* MATCH */}

        <section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold text-slate-950">
                Your Skill Match
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Based on your verified Skill Passport.
              </p>

            </div>

            <div className="text-4xl font-bold text-blue-600">
              {matchScore}%
            </div>

          </div>

          <div className="mt-5 h-3 rounded-full bg-slate-100">

            <div
              className="h-3 rounded-full bg-blue-600 transition-all"
              style={{
                width: `${matchScore}%`,
              }}
            />

          </div>

        </section>

        {/* SKILL REQUIREMENTS */}

        <section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-950">
            Skill Requirements
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your current verified score compared with the opportunity requirement.
          </p>

          <div className="mt-6 space-y-4">

            {opportunity.requiredSkills.map((required) => {

              const currentScore =
                getStudentScore(required.skill);

              const met =
                currentScore >= required.minimum;

              return (
                <div
                  key={required.skill}
                  className="rounded-2xl border border-slate-200 p-5"
                >

                  <div className="flex items-center justify-between gap-4">

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

                      <p className="mt-1 text-sm text-slate-500">
                        Required: {required.minimum}/100
                      </p>

                    </div>

                    <div
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        met
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {currentScore}/100
                    </div>

                  </div>

                  <div className="mt-4 h-2 rounded-full bg-slate-100">

                    <div
                      className={`h-2 rounded-full ${
                        met
                          ? "bg-emerald-500"
                          : "bg-red-400"
                      }`}
                      style={{
                        width: `${Math.min(
                          currentScore,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                  <p className="mt-3 text-xs text-slate-500">

                    {met
                      ? "Requirement met"
                      : `Needs ${Math.max(
                          required.minimum -
                            currentScore,
                          0
                        )} more points`}

                  </p>

                </div>
              );
            })}

          </div>

        </section>

        {/* APPLY */}

        <section className="mt-6 rounded-3xl bg-slate-900 p-8 text-center">

          <h2 className="text-2xl font-bold text-white">

            {applied
              ? "Application submitted"
              : "Ready to apply?"}

          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">

            {applied
              ? "Your application has been saved to Skill Mitra."
              : "Your verified skills will be associated with this application when you apply."}

          </p>

          {applicationError && (
            <div className="mx-auto mt-5 max-w-xl rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {applicationError}
            </div>
          )}

          {applied ? (

            <button
              onClick={() => navigate("/my-applications")}
              className="mt-6 rounded-xl bg-emerald-500 px-7 py-3 font-semibold text-white transition hover:bg-emerald-600"
            >
              ✓ Applied — View My Applications
            </button>

          ) : (

            <button
              onClick={handleApply}
              disabled={applying}
              className="mt-6 rounded-xl bg-white px-7 py-3 font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {applying
                ? "Submitting..."
                : "Apply Now"}
            </button>

          )}

        </section>

      </main>
    </div>
  );
}

export default OpportunityDetails;