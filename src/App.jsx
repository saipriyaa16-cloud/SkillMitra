import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AssessmentPage from "./pages/AssessmentPage.jsx";
import SkillPassport from "./pages/SkillPassport";
import CareerPath from "./pages/CareerPath";
import IndustryCandidates from "./pages/IndustryCandidates";
import CandidateMatch from "./pages/CandidateMatch";
import Opportunities from "./pages/Opportunities";
import OpportunityDetails from "./pages/OpportunityDetails";
import MyApplications from "./pages/MyApplications";
import Challenges from "./pages/Challenges";
import ChallengeDetails from "./pages/ChallengeDetails";
import CreateOpportunity from "./pages/CreateOpportunity";

import ChallengeSubmission from "./pages/ChallengeSubmission";
import IndustryApplicants from "./pages/IndustryApplicants";
import IndustryRequirements from "./pages/IndustryRequirements";
import IndustryMatching from "./pages/IndustryMatching";
const roles = [
  {
    name: "Student",
    path: "student",
  },
  {
    name: "Industry",
    path: "industry",
  },
  {
    name: "Academician",
    path: "academician",
  },
  {
    name: "Institution",
    path: "institution",
  },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Skill Mitra
            </h1>

            <p className="text-xs text-slate-500">
              Skills proven, careers built.
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Demo data
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-5xl font-bold tracking-tight text-slate-950">
            One platform.
            <span className="block text-blue-600">
              Proven skills.
            </span>
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Skill Mitra connects students, industry, academicians, and
            institutions through an evidence-based skill ecosystem.
          </p>
        </div>

        <div className="mt-14">
          <h3 className="text-center text-2xl font-bold text-slate-950">
            Choose your role
          </h3>

          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {roles.map((role) => (
              <button
                key={role.path}
                onClick={() => navigate(`/login/${role.path}`)}
                className="rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-950">
                    {role.name}
                  </span>

                  <span className="text-blue-600">→</span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Continue as {role.name.toLowerCase()}.
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-400">
        Skill Mitra · Skills proven, careers built.
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LANDING */}
        <Route path="/" element={<LandingPage />} />

        {/* LOGIN */}
        <Route path="/login/:role" element={<LoginPage />} />

        {/* DASHBOARD */}
        <Route path="/dashboard/:role" element={<Dashboard />} />

        {/* STUDENT */}
        <Route path="/assessment" element={<AssessmentPage />} />

        <Route
          path="/skill-passport"
          element={<SkillPassport />}
        />

        <Route
          path="/career-path"
          element={<CareerPath />}
        />

        {/* INDUSTRY */}
        <Route
          path="/industry/candidates"
          element={<IndustryCandidates />}
        />

        <Route
          path="/industry/matching"
          element={<CandidateMatch />}
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
        <Route
  path="/opportunities"
  element={<Opportunities />}
/>
<Route
  path="/opportunities/:opportunityId"
  element={<OpportunityDetails />}
/>
<Route
  path="/my-applications"
  element={<MyApplications />}
/>
<Route
  path="/challenges"
  element={<Challenges />}
/>
<Route
  path="/challenges/:challengeId"
  element={<ChallengeDetails />}
/>
<Route
  path="/challenges/:challengeId/submit"
  element={<ChallengeSubmission />}
/>
<Route
  path="/create-opportunity"
  element={<CreateOpportunity />}
/>
<Route
  path="/industry/applicants"
  element={<IndustryApplicants />}
/>
<Route
  path="/industry/requirements"
  element={<IndustryRequirements />}
/>
<Route
  path="/industry/matching"
  element={<IndustryMatching />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;