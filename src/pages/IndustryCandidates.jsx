import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function IndustryCandidates() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  const [selectedOpportunityId, setSelectedOpportunityId] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [minimumMatch, setMinimumMatch] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [shortlistingId, setShortlistingId] = useState(null);
  const [shortlistMessage, setShortlistMessage] = useState("");

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

    setOpportunities(opportunityData || []);

    if (opportunityData?.length > 0) {
      setSelectedOpportunityId(opportunityData[0].id);
    }

    // --------------------------------------------------
    // LOAD STUDENT PROFILES
    // --------------------------------------------------

    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("role", "student");

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
          id,
          name
        )
      `);

    if (skillError) {
      setError(skillError.message);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // COMBINE PROFILE + SKILLS
    // --------------------------------------------------

    const combinedCandidates = (profileData || []).map((profile) => {
      const skills = (skillData || []).filter(
        (item) => item.student_id === profile.id
      );

      return {
        ...profile,
        skills,
      };
    });

    setCandidates(combinedCandidates);

    setLoading(false);
  };

  // --------------------------------------------------
  // SELECTED OPPORTUNITY
  // --------------------------------------------------

  const selectedOpportunity = useMemo(() => {
    return opportunities.find(
      (item) => item.id === selectedOpportunityId
    );
  }, [opportunities, selectedOpportunityId]);

  // --------------------------------------------------
  // REQUIREMENTS
  // --------------------------------------------------

  const requirements = useMemo(() => {
    if (!selectedOpportunity) {
      return [
        {
          skill: "JavaScript",
          minimum: 70,
          importance: "Must-have",
        },
        {
          skill: "React",
          minimum: 60,
          importance: "Nice-to-have",
        },
        {
          skill: "Web Development",
          minimum: 65,
          importance: "Nice-to-have",
        },
      ];
    }

    const rawSkills = selectedOpportunity.required_skills || [];

    return rawSkills.map((item) => ({
      skill: item.skill || item.name,
      minimum: Number(item.minimum || 0),
      importance:
        item.importance ||
        item.type ||
        "Must-have",
    }));
  }, [selectedOpportunity]);

  // --------------------------------------------------
  // GET CANDIDATE SKILL SCORE
  // --------------------------------------------------

  const getCandidateSkill = (candidate, skillName) => {
    return candidate.skills.find(
      (item) =>
        item.skills?.name?.toLowerCase() ===
        skillName?.toLowerCase()
    );
  };

  const getCandidateScore = (candidate, skillName) => {
    const skill = getCandidateSkill(candidate, skillName);

    return Number(skill?.score || 0);
  };

  // --------------------------------------------------
  // MATCH CALCULATION
  // --------------------------------------------------

  const calculateMatch = (candidate) => {
    if (!requirements.length) {
      return 0;
    }

    let weightedCoverage = 0;
    let totalWeight = 0;

    let missingMustHave = false;

    requirements.forEach((required) => {
      const score = getCandidateScore(
        candidate,
        required.skill
      );

      const minimum = Number(required.minimum || 0);

      const isMustHave =
        required.importance?.toLowerCase() ===
        "must-have";

      const weight = isMustHave ? 2 : 1;

      totalWeight += weight;

      const coverage =
        minimum > 0
          ? Math.min(score / minimum, 1)
          : 1;

      weightedCoverage +=
        weight * coverage;

      if (isMustHave && score < minimum) {
        missingMustHave = true;
      }
    });

    if (!totalWeight) {
      return 0;
    }

    let match = Math.round(
      (weightedCoverage / totalWeight) * 100
    );

    // PRD rule:
    // Missing a must-have caps match at 60%.
    if (missingMustHave) {
      match = Math.min(match, 60);
    }

    return match;
  };

  // --------------------------------------------------
  // REQUIREMENT STATUS
  // --------------------------------------------------

  const getRequirementStatus = (
    candidate,
    required
  ) => {
    const score = getCandidateScore(
      candidate,
      required.skill
    );

    const minimum = Number(
      required.minimum || 0
    );

    if (score >= minimum) {
      return "Met";
    }

    if (score > 0) {
      return "Partly met";
    }

    return "Missing";
  };

  // --------------------------------------------------
  // VERIFIED SKILLS
  // --------------------------------------------------

  const getVerifiedSkills = (candidate) => {
    return candidate.skills.filter(
      (item) =>
        item.verification ===
          "Assessment-verified" ||
        item.verification ===
          "College-verified" ||
        item.verification ===
          "Industry-verified"
    );
  };

  // --------------------------------------------------
  // FILTER + RANK
  // --------------------------------------------------

  const filteredCandidates = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    return candidates
      .map((candidate) => ({
        ...candidate,
        matchScore: calculateMatch(candidate),
      }))
      .filter((candidate) => {
        const matchesSearch =
          !search ||
          candidate.full_name
            ?.toLowerCase()
            .includes(search) ||
          candidate.email
            ?.toLowerCase()
            .includes(search) ||
          candidate.skills.some((item) =>
            item.skills?.name
              ?.toLowerCase()
              .includes(search)
          );

        const matchesScore =
          candidate.matchScore >= minimumMatch;

        const verifiedSkills =
          getVerifiedSkills(candidate);

        const matchesVerified =
          !verifiedOnly ||
          verifiedSkills.length > 0;

        return (
          matchesSearch &&
          matchesScore &&
          matchesVerified
        );
      })
      .sort(
        (a, b) =>
          b.matchScore - a.matchScore
      );
  }, [
    candidates,
    searchText,
    minimumMatch,
    verifiedOnly,
    requirements,
  ]);

  // --------------------------------------------------
  // SHORTLIST CANDIDATE
  // --------------------------------------------------

  const handleShortlist = async (candidate) => {
    if (!selectedOpportunity) {
      setShortlistMessage(
        "Please create or select an opportunity first."
      );
      return;
    }

    setShortlistingId(candidate.id);
    setShortlistMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setShortlistMessage(
        "Your session has expired. Please sign in again."
      );
      setShortlistingId(null);
      return;
    }

    // --------------------------------------------------
    // CHECK WHETHER APPLICATION ALREADY EXISTS
    // --------------------------------------------------

    const {
      data: existingApplication,
      error: existingError,
    } = await supabase
      .from("applications")
      .select("id, status")
      .eq("student_id", candidate.id)
      .eq(
        "opportunity_id",
        selectedOpportunity.id
      )
      .maybeSingle();

    if (existingError) {
      setShortlistMessage(
        existingError.message
      );
      setShortlistingId(null);
      return;
    }

    // --------------------------------------------------
    // UPDATE EXISTING APPLICATION
    // --------------------------------------------------

    if (existingApplication) {
      const { error: updateError } =
        await supabase
          .from("applications")
          .update({
            status: "Shortlisted",
          })
          .eq(
            "id",
            existingApplication.id
          );

      if (updateError) {
        setShortlistMessage(
          updateError.message
        );
        setShortlistingId(null);
        return;
      }

      setShortlistMessage(
        `${candidate.full_name} has been shortlisted for ${selectedOpportunity.title}.`
      );

      setShortlistingId(null);
      return;
    }

    // --------------------------------------------------
    // CREATE NEW SHORTLIST APPLICATION
    // --------------------------------------------------

    const { error: insertError } =
      await supabase
        .from("applications")
        .insert({
          student_id: candidate.id,
          opportunity_id:
            selectedOpportunity.id,
          status: "Shortlisted",
        });

    if (insertError) {
      setShortlistMessage(
        insertError.message
      );
      setShortlistingId(null);
      return;
    }

    setShortlistMessage(
      `${candidate.full_name} has been shortlisted for ${selectedOpportunity.title}.`
    );

    setShortlistingId(null);
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="font-semibold text-slate-700">
            Loading candidates...
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-red-600">
            Could not load candidates
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            {error}
          </p>

          <button
            onClick={() => navigate("/dashboard/industry")}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                navigate("/dashboard/industry")
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-950">
                Search Candidates
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Find students using verified skills and explainable matching.
              </p>
            </div>

          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Explainable matching
          </span>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* OPPORTUNITY SELECTOR */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Briefcase size={24} />
            </div>

            <div className="flex-1">

              <h2 className="text-lg font-bold text-slate-950">
                Select Hiring Opportunity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Candidate matching will use the requirements of the selected opportunity.
              </p>

              {opportunities.length > 0 ? (
                <select
                  value={selectedOpportunityId}
                  onChange={(event) =>
                    setSelectedOpportunityId(
                      event.target.value
                    )
                  }
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {opportunities.map(
                    (opportunity) => (
                      <option
                        key={opportunity.id}
                        value={opportunity.id}
                      >
                        {opportunity.title} —{" "}
                        {opportunity.company}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                  You haven't created an opportunity yet.
                  Create one before shortlisting candidates.
                </div>
              )}

            </div>

          </div>

          {/* REQUIREMENTS */}

          {selectedOpportunity && (
            <div className="mt-6 border-t border-slate-100 pt-6">

              <p className="text-sm font-semibold text-slate-700">
                Matching Requirements
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                {requirements.map(
                  (required) => (
                    <span
                      key={required.skill}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        required.importance
                          ?.toLowerCase() ===
                        "must-have"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {required.skill} ≥{" "}
                      {required.minimum} ·{" "}
                      {required.importance}
                    </span>
                  )
                )}

              </div>

            </div>
          )}

        </section>

        {/* FILTERS */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-[1fr_180px_auto]">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchText}
                onChange={(event) =>
                  setSearchText(
                    event.target.value
                  )
                }
                placeholder="Search by name, email, or skill..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <select
              value={minimumMatch}
              onChange={(event) =>
                setMinimumMatch(
                  Number(event.target.value)
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value={0}>
                Any match
              </option>

              <option value={40}>
                40%+ match
              </option>

              <option value={60}>
                60%+ match
              </option>

              <option value={70}>
                70%+ match
              </option>

              <option value={80}>
                80%+ match
              </option>
            </select>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">

              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(event) =>
                  setVerifiedOnly(
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              Verified skills only

            </label>

          </div>

        </section>

        {/* SUCCESS MESSAGE */}

        {shortlistMessage && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            ✓ {shortlistMessage}
          </div>
        )}

        {/* RESULT COUNT */}

        <div className="mt-8 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Matching Candidates
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredCandidates.length} candidate
              {filteredCandidates.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

        </div>

        {/* CANDIDATES */}

        <div className="mt-5 space-y-5">

          {filteredCandidates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <GraduationCap
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                No matching candidates
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or match filters.
              </p>

            </div>
          ) : (
            filteredCandidates.map(
              (candidate, index) => {

                const verifiedSkills =
                  getVerifiedSkills(
                    candidate
                  );

                return (
                  <article
                    key={candidate.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    {/* CANDIDATE HEADER */}

                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                      <div className="flex items-start gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <GraduationCap
                            size={27}
                          />
                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              #{index + 1}
                            </span>

                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Student
                            </span>

                          </div>

                          <h3 className="mt-2 text-xl font-bold text-slate-950">
                            {candidate.full_name ||
                              "Student"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {candidate.email}
                          </p>

                          <p className="mt-2 text-sm font-medium text-blue-600">
                            Skill-based candidate
                          </p>

                        </div>

                      </div>

                      {/* MATCH */}

                      <div className="rounded-2xl bg-blue-50 px-6 py-4 text-center">

                        <p className="text-xs font-medium text-slate-500">
                          Skill Match
                        </p>

                        <p className="mt-1 text-3xl font-bold text-blue-600">
                          {candidate.matchScore}%
                        </p>

                      </div>

                    </div>

                    {/* REQUIREMENT MATCH */}

                    <div className="mt-6 rounded-2xl border border-slate-200 p-5">

                      <h4 className="font-bold text-slate-950">
                        Requirement Match
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Based on the candidate's current Skill Passport.
                      </p>

                      <div className="mt-4 grid gap-3 md:grid-cols-3">

                        {requirements.map(
                          (required) => {

                            const score =
                              getCandidateScore(
                                candidate,
                                required.skill
                              );

                            const status =
                              getRequirementStatus(
                                candidate,
                                required
                              );

                            const met =
                              status === "Met";

                            return (
                              <div
                                key={
                                  required.skill
                                }
                                className={`rounded-xl p-4 ${
                                  met
                                    ? "bg-emerald-50"
                                    : status ===
                                      "Partly met"
                                    ? "bg-amber-50"
                                    : "bg-red-50"
                                }`}
                              >

                                <div className="flex items-center justify-between">

                                  <p className="font-bold text-slate-950">
                                    {
                                      required.skill
                                    }
                                  </p>

                                  {met && (
                                    <CheckCircle2
                                      size={17}
                                      className="text-emerald-600"
                                    />
                                  )}

                                </div>

                                <p className="mt-2 text-sm text-slate-600">
                                  {score}/100 · Required{" "}
                                  {required.minimum}
                                </p>

                                <p
                                  className={`mt-2 text-sm font-semibold ${
                                    met
                                      ? "text-emerald-700"
                                      : status ===
                                        "Partly met"
                                      ? "text-amber-700"
                                      : "text-red-600"
                                  }`}
                                >
                                  {status}
                                </p>

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>

                    {/* VERIFIED SKILLS */}

                    <div className="mt-5">

                      <div className="flex items-center gap-2">

                        <ShieldCheck
                          size={17}
                          className="text-emerald-600"
                        />

                        <p className="text-sm font-semibold text-slate-700">
                          Verified Skills
                        </p>

                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {verifiedSkills.length === 0 ? (
                          <span className="text-sm text-slate-400">
                            No verified skills yet.
                          </span>
                        ) : (
                          verifiedSkills.map(
                            (item) => (
                              <span
                                key={
                                  item.skills?.id ||
                                  item.skills?.name
                                }
                                className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                              >
                                ✓{" "}
                                {item.skills?.name} ·{" "}
                                {item.score}
                              </span>
                            )
                          )
                        )}

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">

                      <button
                        onClick={() =>
                          setSelectedCandidate(
                            candidate
                          )
                        }
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        View Skill Passport
                      </button>

                      <button
                        onClick={() =>
                          handleShortlist(
                            candidate
                          )
                        }
                        disabled={
                          shortlistingId ===
                          candidate.id
                        }
                        className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {shortlistingId ===
                        candidate.id
                          ? "Shortlisting..."
                          : "Shortlist Candidate"}
                      </button>

                    </div>

                  </article>
                );
              }
            )
          )}

        </div>

      </main>

      {/* SKILL PASSPORT MODAL */}

      {selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4">

          <div className="mx-auto my-8 max-w-4xl rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <GraduationCap
                    size={24}
                  />
                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-950">
                    {selectedCandidate.full_name ||
                      "Student"}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {selectedCandidate.email}
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  setSelectedCandidate(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={22} />
              </button>

            </div>

            <div className="p-6">

              {/* MATCH */}

              <div className="rounded-2xl bg-blue-50 p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-semibold text-slate-700">
                      Current role match
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Based on the requirements above
                    </p>

                  </div>

                  <p className="text-4xl font-bold text-blue-600">
                    {calculateMatch(
                      selectedCandidate
                    )}%
                  </p>

                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">

                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${calculateMatch(
                        selectedCandidate
                      )}%`,
                    }}
                  />

                </div>

              </div>

              {/* PASSPORT */}

              <div className="mt-6 rounded-2xl bg-blue-50 p-6">

                <div className="flex items-center gap-3">

                  <ShieldCheck
                    size={22}
                    className="text-blue-600"
                  />

                  <div>

                    <h3 className="font-bold text-slate-950">
                      Skill Passport
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Verified skill evidence available for this candidate.
                    </p>

                  </div>

                </div>

              </div>

              {/* SKILLS */}

              <div className="mt-8">

                <h3 className="text-xl font-bold text-slate-950">
                  Skills & Evidence
                </h3>

                <div className="mt-5 space-y-4">

                  {verifiedSkillsForModal(
                    selectedCandidate
                  )}

                </div>

              </div>

            </div>

            <div className="border-t border-slate-200 p-5">

              <button
                onClick={() =>
                  setSelectedCandidate(null)
                }
                className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close Passport
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );

  // --------------------------------------------------
  // PASSPORT SKILLS HELPER
  // --------------------------------------------------

  function verifiedSkillsForModal(candidate) {
    const skills = getVerifiedSkills(candidate);

    if (!skills.length) {
      return (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No verified skill evidence available.
        </div>
      );
    }

    return skills.map((item) => (
      <div
        key={
          item.skills?.id ||
          item.skills?.name
        }
        className="rounded-2xl border border-slate-200 p-5"
      >

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-2">

              <p className="font-bold text-slate-950">
                {item.skills?.name}
              </p>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                ✓ Verified
              </span>

            </div>

            <p className="mt-2 text-xs text-slate-500">
              Evidence: {item.verification}
            </p>

          </div>

          <p className="text-2xl font-bold text-blue-600">
            {item.score}/100
          </p>

        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-blue-600"
            style={{
              width: `${Math.min(
                Number(item.score || 0),
                100
              )}%`,
            }}
          />

        </div>

      </div>
    ));
  }
}

export default IndustryCandidates;