import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { opportunities } from "./data/opportunities";
import { supabase } from "../lib/supabase";

function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [industryOpportunities, setIndustryOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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
    // LOAD APPLICATIONS
    // --------------------------------------------------

    const {
      data: applicationData,
      error: applicationError,
    } = await supabase
      .from("applications")
      .select("id, opportunity_id, status, applied_at")
      .eq("student_id", user.id)
      .order("applied_at", { ascending: false });

    if (applicationError) {
      setError(applicationError.message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // --------------------------------------------------
    // LOAD INDUSTRY CREATED OPPORTUNITIES
    // --------------------------------------------------

    const {
      data: industryData,
      error: industryError,
    } = await supabase
      .from("industry_opportunities")
      .select("*");

    if (industryError) {
      setError(industryError.message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setApplications(applicationData || []);
    setIndustryOpportunities(industryData || []);

    setLoading(false);
    setRefreshing(false);
  };

  // --------------------------------------------------
  // FIND OPPORTUNITY
  // Works for both:
  // 1. Demo/static opportunities
  // 2. Industry-created opportunities
  // --------------------------------------------------

  const getOpportunity = (opportunityId) => {
    // First check static demo opportunities
    const staticOpportunity = opportunities.find(
      (opportunity) => opportunity.id === opportunityId
    );

    if (staticOpportunity) {
      return staticOpportunity;
    }

    // Then check industry-created opportunities
    const industryOpportunity = industryOpportunities.find(
      (opportunity) => opportunity.id === opportunityId
    );

    if (industryOpportunity) {
      return {
        id: industryOpportunity.id,
        company: industryOpportunity.company,
        title: industryOpportunity.title,
        type: industryOpportunity.type,
        location: industryOpportunity.location || "Not specified",
        remote: industryOpportunity.remote,
        stipend: industryOpportunity.stipend,
        deadline: industryOpportunity.deadline,
        requiredSkills: industryOpportunity.required_skills || [],
      };
    }

    return null;
  };

  // --------------------------------------------------
  // STATUS STYLE
  // --------------------------------------------------

  const getStatusStyle = (status) => {
    const normalizedStatus = String(status || "Applied").toLowerCase();

    if (normalizedStatus === "shortlisted") {
      return {
        container: "bg-emerald-50 text-emerald-700",
        icon: <CheckCircle2 size={14} />,
      };
    }

    if (normalizedStatus === "interview") {
      return {
        container: "bg-purple-50 text-purple-700",
        icon: <Clock size={14} />,
      };
    }

    if (normalizedStatus === "offer") {
      return {
        container: "bg-blue-50 text-blue-700",
        icon: <CheckCircle2 size={14} />,
      };
    }

    if (normalizedStatus === "rejected") {
      return {
        container: "bg-red-50 text-red-700",
        icon: <XCircle size={14} />,
      };
    }

    if (normalizedStatus === "under review") {
      return {
        container: "bg-amber-50 text-amber-700",
        icon: <Clock size={14} />,
      };
    }

    // Default = Applied
    return {
      container: "bg-blue-50 text-blue-700",
      icon: <CheckCircle2 size={14} />,
    };
  };

  // --------------------------------------------------
  // CURRENT STATUS
  // Show the latest application status
  // --------------------------------------------------

  const currentStatus =
    applications.length > 0
      ? applications[0].status || "Applied"
      : "None";

  const appliedCount = applications.filter(
    (application) =>
      String(application.status || "").toLowerCase() === "applied"
  ).length;

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="font-semibold text-slate-700">
            Loading your applications...
          </p>
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
              My Applications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track the opportunities you have applied for.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => loadApplications(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Live data
            </span>

          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* BACK */}

        <button
          onClick={() => navigate("/dashboard/student")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        {/* SUMMARY */}

        <section className="grid gap-5 md:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-400">
              Total Applications
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {applications.length}
            </p>
          </div>

          {/* APPLIED */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-400">
              Applied
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {appliedCount}
            </p>
          </div>

          {/* CURRENT STATUS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">

            <p className="text-sm text-slate-400">
              Current Status
            </p>

            <p
              className={`mt-2 text-lg font-bold ${
                String(currentStatus).toLowerCase() === "shortlisted"
                  ? "text-emerald-600"
                  : String(currentStatus).toLowerCase() === "rejected"
                  ? "text-red-600"
                  : String(currentStatus).toLowerCase() === "interview"
                  ? "text-purple-600"
                  : String(currentStatus).toLowerCase() === "offer"
                  ? "text-blue-600"
                  : "text-slate-700"
              }`}
            >
              {currentStatus}
            </p>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* APPLICATIONS */}

        <section className="mt-6 rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Your Applications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Applications saved in your Skill Mitra account.
              </p>
            </div>

            <Briefcase
              size={28}
              className="text-slate-300"
            />

          </div>

          {/* NO APPLICATIONS */}

          {applications.length === 0 ? (

            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

              <Briefcase
                size={36}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                No applications yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Explore opportunities and apply to roles that match your skills.
              </p>

              <button
                onClick={() => navigate("/opportunities")}
                className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Explore Opportunities
              </button>

            </div>

          ) : (

            <div className="mt-6 space-y-4">

              {applications.map((application) => {

                const opportunity = getOpportunity(
                  application.opportunity_id
                );

                // If an old/deleted opportunity cannot be found,
                // still show the application instead of crashing.

                if (!opportunity) {
                  return (
                    <div
                      key={application.id}
                      className="rounded-2xl border border-slate-200 p-6"
                    >
                      <p className="font-semibold text-slate-950">
                        Opportunity unavailable
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Application status: {application.status}
                      </p>
                    </div>
                  );
                }

                const statusStyle = getStatusStyle(
                  application.status
                );

                return (

                  <div
                    key={application.id}
                    className="rounded-2xl border border-slate-200 p-6 transition hover:border-blue-200 hover:shadow-sm"
                  >

                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                      {/* OPPORTUNITY */}

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Briefcase size={22} />
                        </div>

                        <div>

                          <p className="text-sm font-semibold text-blue-600">
                            {opportunity.company}
                          </p>

                          <h3 className="mt-1 text-lg font-bold text-slate-950">
                            {opportunity.title}
                          </h3>

                          <p className="mt-2 text-sm text-slate-500">
                            {opportunity.location || "Location not specified"}
                            {" · "}
                            {opportunity.type}
                          </p>

                        </div>

                      </div>

                      {/* STATUS */}

                      <div className="flex flex-col items-start gap-3 md:items-end">

                        <span
                          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle.container}`}
                        >
                          {statusStyle.icon}
                          {application.status || "Applied"}
                        </span>

                        <p className="flex items-center gap-1 text-xs text-slate-400">

                          <Clock size={13} />

                          Applied{" "}
                          {application.applied_at
                            ? new Date(
                                application.applied_at
                              ).toLocaleDateString()
                            : "Recently"}

                        </p>

                      </div>

                    </div>

                    {/* SKILLS */}

                    <div className="mt-5 flex flex-wrap gap-2">

                      {(opportunity.requiredSkills || []).map(
                        (skill, index) => (

                          <span
                            key={`${skill.skill}-${index}`}
                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                          >
                            {skill.skill}
                          </span>

                        )
                      )}

                    </div>

                    {/* VIEW */}

                    <button
                      onClick={() =>
                        navigate(
                          `/opportunities/${opportunity.id}`
                        )
                      }
                      className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View Opportunity
                    </button>

                  </div>

                );
              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default MyApplications;