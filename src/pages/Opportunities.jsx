import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  MapPin,
  Clock,
  Database,
} from "lucide-react";

import { opportunities } from "./data/opportunities";
import { supabase } from "../lib/supabase";

function Opportunities() {
  const navigate = useNavigate();

  const [studentSkills, setStudentSkills] = useState([]);
  const [industryOpportunities, setIndustryOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOpportunityData();
  }, []);

  const loadOpportunityData = async () => {
    setLoading(true);
    setError("");

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

    const { data: skillData, error: skillError } = await supabase
      .from("student_skills")
      .select(`
        score,
        verification,
        skills (
          name
        )
      `)
      .eq("student_id", user.id);

    if (skillError) {
      setError(skillError.message);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // LOAD INDUSTRY OPPORTUNITIES
    // --------------------------------------------------

    const {
      data: industryData,
      error: industryError,
    } = await supabase
      .from("industry_opportunities")
      .select("*")
      .eq("status", "Open")
      .order("created_at", { ascending: false });

    if (industryError) {
      setError(industryError.message);
      setLoading(false);
      return;
    }

    setStudentSkills(skillData || []);
    setIndustryOpportunities(industryData || []);

    setLoading(false);
  };

  // --------------------------------------------------
  // GET STUDENT SCORE FOR A SKILL
  // --------------------------------------------------

  const getStudentScore = (skillName) => {
    const skill = studentSkills.find(
      (item) => item.skills?.name === skillName
    );

    return Number(skill?.score || 0);
  };

  // --------------------------------------------------
  // CALCULATE MATCH
  // --------------------------------------------------

  const calculateMatch = (opportunity) => {
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

      const coverage = Math.min(
        currentScore / minimum,
        1
      );

      totalCoverage += coverage;
    });

    return Math.round(
      (totalCoverage / opportunity.requiredSkills.length) * 100
    );
  };

  // --------------------------------------------------
  // FORMAT INDUSTRY OPPORTUNITIES
  // --------------------------------------------------

  const formattedIndustryOpportunities = useMemo(() => {
    return industryOpportunities.map((item) => ({
      id: item.id,
      company: item.company,
      title: item.title,
      type: item.type,

      location: item.remote
        ? "Remote"
        : item.location || "Not specified",

      remote: item.remote,
      openings: item.openings,

      stipend: item.stipend || "Not specified",

      deadline: item.deadline || "Not specified",

      description: item.description || "",

      requiredSkills: Array.isArray(item.required_skills)
        ? item.required_skills.map((skill) => ({
            skill: skill.skill,
            minimum: Number(skill.minimum || 0),
          }))
        : [],

      source: "industry",
    }));
  }, [industryOpportunities]);

  // --------------------------------------------------
  // COMBINE DEMO + INDUSTRY OPPORTUNITIES
  // --------------------------------------------------

  const allOpportunities = useMemo(() => {
    return [
      ...formattedIndustryOpportunities,

      ...opportunities.map((opportunity) => ({
        ...opportunity,
        source: "demo",
      })),
    ];
  }, [formattedIndustryOpportunities]);

  // --------------------------------------------------
  // CALCULATE MATCH FOR ALL
  // --------------------------------------------------

  const opportunityResults = useMemo(() => {
    return allOpportunities.map((opportunity) => ({
      ...opportunity,
      matchScore: calculateMatch(opportunity),
    }));
  }, [allOpportunities, studentSkills]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="font-semibold text-slate-700">
            Finding opportunities for you...
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
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6">

          <h2 className="font-bold text-red-700">
            Unable to load opportunities
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() => navigate("/dashboard/student")}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Dashboard
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
              Opportunities
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Discover internships matched to your verified skills.
            </p>

          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Live data
          </span>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* BACK BUTTON */}

        <button
          onClick={() => navigate("/dashboard/student")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        {/* INTRO */}

        <section className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-medium text-blue-600">
                Skill-based opportunity discovery
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                Opportunities matched to you
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Skill Mitra compares your verified skill scores with the
                requirements of each opportunity.
              </p>

            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Briefcase size={30} />
            </div>

          </div>

        </section>

        {/* OPPORTUNITY CARDS */}

        <section className="mt-6">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold text-slate-950">
                Available Internships
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {opportunityResults.length} opportunities available
              </p>

            </div>

          </div>

          <div className="grid gap-5 lg:grid-cols-2">

            {opportunityResults.map((opportunity) => {

              const metSkills =
                opportunity.requiredSkills.filter(
                  (required) =>
                    getStudentScore(required.skill) >=
                    required.minimum
                ).length;

              const totalSkills =
                opportunity.requiredSkills.length;

              return (
                <article
                  key={`${opportunity.source}-${opportunity.id}`}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  {/* TITLE */}

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      {opportunity.source === "industry" && (
                        <div className="mb-2 flex items-center gap-2">

                          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <Database size={12} />
                            Industry Posted
                          </span>

                        </div>
                      )}

                      <p className="text-sm font-semibold text-blue-600">
                        {opportunity.company}
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-slate-950">
                        {opportunity.title}
                      </h3>

                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Briefcase size={21} />
                    </div>

                  </div>

                  {/* META */}

                  <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">

                    <span className="rounded-full bg-slate-100 px-3 py-1.5">
                      {opportunity.type}
                    </span>

                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
                      <MapPin size={13} />
                      {opportunity.location}
                    </span>

                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
                      <Clock size={13} />
                      Deadline {opportunity.deadline}
                    </span>

                  </div>

                  {/* DETAILS */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs text-slate-400">
                        Stipend
                      </p>

                      <p className="mt-1 font-bold text-slate-950">
                        {opportunity.stipend}
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs text-slate-400">
                        Openings
                      </p>

                      <p className="mt-1 font-bold text-slate-950">
                        {opportunity.openings}
                      </p>

                    </div>

                  </div>

                  {/* MATCH */}

                  <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm font-semibold text-slate-700">
                          Your Skill Match
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {metSkills}/{totalSkills} required skills currently met
                        </p>

                      </div>

                      <div className="text-3xl font-bold text-blue-600">
                        {opportunity.matchScore}%
                      </div>

                    </div>

                    <div className="mt-4 h-2 rounded-full bg-white">

                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all"
                        style={{
                          width: `${opportunity.matchScore}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* REQUIRED SKILLS */}

                  <div className="mt-5">

                    <p className="text-sm font-semibold text-slate-700">
                      Required Skills
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">

                      {opportunity.requiredSkills.map(
                        (required) => {

                          const currentScore =
                            getStudentScore(required.skill);

                          const met =
                            currentScore >= required.minimum;

                          return (
                            <span
                              key={required.skill}
                              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                                met
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >

                              {met && (
                                <CheckCircle2 size={13} />
                              )}

                              {required.skill}

                            </span>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* DESCRIPTION FOR INDUSTRY POSTS */}

                  {opportunity.source === "industry" &&
                    opportunity.description && (
                      <div className="mt-5 rounded-xl bg-slate-50 p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          About this opportunity
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {opportunity.description}
                        </p>

                      </div>
                    )}

                  {/* VIEW & APPLY */}

                  <button
                    onClick={() =>
                      navigate(
                        `/opportunities/${opportunity.id}`
                      )
                    }
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View & Apply

                    <ArrowRight size={17} />
                  </button>

                </article>
              );
            })}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Opportunities;