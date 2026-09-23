import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  GraduationCap,
  Building2,
  BookOpenCheck,
  Landmark,
  LogOut,
  ArrowRight,
  LayoutDashboard,
  ClipboardCheck,
  ShieldCheck,
  Search,
  Briefcase,
  Users,
  FileText,
  Trophy,
} from "lucide-react";

import { signOutUser } from "../lib/auth";

const roleData = {
  student: {
    title: "Student Dashboard",
    subtitle:
      "Build verified skills, discover opportunities and grow toward your career goal.",
    icon: GraduationCap,
    accent: "blue",
  },

  industry: {
    title: "Industry Dashboard",
    subtitle:
      "Find skilled candidates, define role requirements and build your talent pipeline.",
    icon: Building2,
    accent: "orange",
  },

  academician: {
    title: "Academician Dashboard",
    subtitle:
      "Support student development, verify skills and monitor mentee progress.",
    icon: BookOpenCheck,
    accent: "purple",
  },

  institution: {
    title: "Institution Dashboard",
    subtitle:
      "Monitor skills, participation, internships and placement readiness.",
    icon: Landmark,
    accent: "emerald",
  },
};

function Dashboard() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("skillMitraRole");

    if (!savedRole) {
      navigate("/");
      return;
    }

    setRole(savedRole);
  }, [navigate]);

  const handleLogout = async () => {
    await signOutUser();

    localStorage.removeItem("skillMitraRole");

    navigate("/");
  };

  if (!role || !roleData[role]) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="font-semibold text-slate-700">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const currentRole = roleData[role];

  const RoleIcon = currentRole.icon;

  // --------------------------------------------------
  // STUDENT DASHBOARD
  // --------------------------------------------------

  const studentCards = [
    {
      title: "Skill Assessment",
      description:
        "Test your technical skills and get assessment-verified scores.",
      icon: ClipboardCheck,
      color: "blue",
      route: "/assessment",
      action: "Take assessment",
    },

    {
      title: "Skill Passport",
      description:
        "View your verified skills, scores and project evidence.",
      icon: ShieldCheck,
      color: "emerald",
      route: "/skill-passport",
      action: "View passport",
    },

    {
      title: "Career Path",
      description:
        "Choose a target career and identify your current skill gaps.",
      icon: Trophy,
      color: "purple",
      route: "/career-path",
      action: "Explore career path",
    },

    {
      title: "Opportunities",
      description:
        "Discover internships and roles matched to your skills.",
      icon: Briefcase,
      color: "orange",
      route: "/opportunities",
      action: "Find opportunities",
    },

    {
      title: "My Applications",
      description:
        "Track your applications and hiring status.",
      icon: FileText,
      color: "indigo",
      route: "/my-applications",
      action: "Track applications",
    },

    {
      title: "Challenges",
      description:
        "Complete practical challenges and build stronger evidence.",
      icon: Trophy,
      color: "pink",
      route: "/challenges",
      action: "Explore challenges",
    },
  ];

  // --------------------------------------------------
  // INDUSTRY DASHBOARD
  // --------------------------------------------------

  const industryCards = [
    {
      title: "Search Candidates",
      description:
        "Find students using skills, scores and verification status.",
      icon: Search,
      color: "blue",
      route: "/industry/candidates",
      action: "Find candidates",
    },

    {
      title: "Candidate Matching",
      description:
        "Compare candidates with role requirements and identify skill gaps.",
      icon: Users,
      color: "orange",
      route: "/industry/matching",
      action: "Match candidates",
    },

    {
      title: "Role Requirements",
      description:
        "Define the skills, minimum levels and importance required for your roles.",
      icon: Briefcase,
      color: "purple",
      route: "/industry/requirements",
      action: "Define requirements",
    },

    {
      title: "Verified Talent Pool",
      description:
        "Browse students with assessment-verified skills.",
      icon: ShieldCheck,
      color: "emerald",
      route: "/industry/candidates",
      action: "Browse talent",
    },

    {
      title: "Create Opportunity",
      description:
        "Post internships and roles with skills, openings and deadlines.",
      icon: FileText,
      color: "indigo",
      route: "/create-opportunity",
      action: "Create opportunity",
    },
  ];

  // --------------------------------------------------
  // ACADEMICIAN DASHBOARD
  // --------------------------------------------------

  const academicianCards = [
    {
      title: "Student Progress",
      description:
        "Monitor student skill development and assessment progress.",
      icon: Users,
      color: "purple",
      route: "#",
      action: "Coming next",
    },

    {
      title: "Verification Requests",
      description:
        "Review student evidence and support college-level verification.",
      icon: ShieldCheck,
      color: "emerald",
      route: "#",
      action: "Coming next",
    },

    {
      title: "Industry Exposure",
      description:
        "Explore internships, challenges and industry opportunities.",
      icon: Briefcase,
      color: "orange",
      route: "#",
      action: "Coming next",
    },
  ];

  // --------------------------------------------------
  // INSTITUTION DASHBOARD
  // --------------------------------------------------

  const institutionCards = [
    {
      title: "Skill Analytics",
      description:
        "View institution-level skill and readiness insights.",
      icon: LayoutDashboard,
      color: "emerald",
      route: "#",
      action: "Coming next",
    },

    {
      title: "Student Outcomes",
      description:
        "Track assessment, internship and placement participation.",
      icon: Users,
      color: "blue",
      route: "#",
      action: "Coming next",
    },

    {
      title: "Industry Engagement",
      description:
        "Monitor industry opportunities, challenges and collaboration.",
      icon: Building2,
      color: "orange",
      route: "#",
      action: "Coming next",
    },
  ];

  const cards =
    role === "student"
      ? studentCards
      : role === "industry"
      ? industryCards
      : role === "academician"
      ? academicianCards
      : institutionCards;

  const colorClasses = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      hover: "hover:border-blue-300",
      action: "text-blue-600",
    },

    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      hover: "hover:border-emerald-300",
      action: "text-emerald-600",
    },

    purple: {
      icon: "bg-purple-50 text-purple-600",
      hover: "hover:border-purple-300",
      action: "text-purple-600",
    },

    orange: {
      icon: "bg-orange-50 text-orange-600",
      hover: "hover:border-orange-300",
      action: "text-orange-600",
    },

    indigo: {
      icon: "bg-indigo-50 text-indigo-600",
      hover: "hover:border-indigo-300",
      action: "text-indigo-600",
    },

    pink: {
      icon: "bg-pink-50 text-pink-600",
      hover: "hover:border-pink-300",
      action: "text-pink-600",
    },
  };

  const handleCardClick = (card) => {
    if (card.route === "#") {
      return;
    }

    navigate(card.route);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <LayoutDashboard size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-950">
                Skill Mitra
              </h1>

              <p className="text-xs text-slate-500">
                Skills proven, careers built.
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4">

            <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
              Live data
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <LogOut size={17} />
              Logout
            </button>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* INTRO */}

        <section className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-5">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <RoleIcon size={32} />
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-3xl font-bold text-slate-950">
                    {currentRole.title}
                  </h2>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                    {role}
                  </span>

                </div>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  {currentRole.subtitle}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* CARDS */}

        <section className="mt-8">

          <div className="mb-5">

            <h3 className="text-xl font-bold text-slate-950">
              {role === "student"
                ? "Your Skill Journey"
                : role === "industry"
                ? "Industry Workspace"
                : role === "academician"
                ? "Academic Workspace"
                : "Institution Overview"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Choose a module to continue.
            </p>

          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {cards.map((card) => {

              const CardIcon = card.icon;
              const colors =
                colorClasses[card.color];

              return (
                <button
                  key={card.title}
                  onClick={() =>
                    handleCardClick(card)
                  }
                  disabled={card.route === "#"}
                  className={`group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition ${
                    card.route === "#"
                      ? "cursor-default opacity-80"
                      : `hover:-translate-y-1 hover:shadow-md ${colors.hover}`
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.icon}`}
                    >
                      <CardIcon size={24} />
                    </div>

                    <ArrowRight
                      size={20}
                      className={`text-slate-300 transition ${
                        card.route !== "#"
                          ? "group-hover:translate-x-1"
                          : ""
                      }`}
                    />

                  </div>

                  <h4 className="mt-5 text-xl font-bold text-slate-950">
                    {card.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {card.description}
                  </p>

                  <p
                    className={`mt-4 text-sm font-semibold ${
                      colors.action
                    }`}
                  >
                    {card.action}{" "}
                    {card.route !== "#" && "→"}
                  </p>

                </button>
              );
            })}

          </div>

        </section>

        {/* DEMO DATA INDICATOR */}

        <div className="mt-10 flex items-center justify-center">

          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
            Demo data • Skill Mitra prototype
          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;