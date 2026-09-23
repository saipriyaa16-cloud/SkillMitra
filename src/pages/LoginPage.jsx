import { useState } from "react";
import { signInUser, ensureUserProfile } from "../lib/auth";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  GraduationCap,
  BookOpenCheck,
  Landmark,
  ShieldCheck,
} from "lucide-react";

const roleData = {
  student: {
    name: "Student",
    description:
      "Build your skills, discover your gaps, and move toward your target career.",
    icon: GraduationCap,
    color: "blue",
    bg: "bg-blue-600",
    light: "bg-blue-50",
    text: "text-blue-600",
  },
  industry: {
    name: "Industry",
    description:
      "Find candidates based on verified skills and real work.",
    icon: Building2,
    color: "violet",
    bg: "bg-violet-600",
    light: "bg-violet-50",
    text: "text-violet-600",
  },
  academician: {
    name: "Academician",
    description:
      "Verify skills, mentor students, and connect learning with industry.",
    icon: BookOpenCheck,
    color: "emerald",
    bg: "bg-emerald-600",
    light: "bg-emerald-50",
    text: "text-emerald-600",
  },
  institution: {
    name: "Institution",
    description:
      "Monitor skills, participation, placement readiness, and outcomes.",
    icon: Landmark,
    color: "amber",
    bg: "bg-amber-500",
    light: "bg-amber-50",
    text: "text-amber-600",
  },
};

function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();

  const currentRole = roleData[role];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

  if (!currentRole) {
    navigate("/");
    return null;
  }

  const Icon = currentRole.icon;

  const handleLogin = async (event) => {
    event.preventDefault();
  
    setError("");
    setLoading(true);
  
    const { data, error } = await signInUser(email, password);
  
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
  
    if (data.user) {
        const { error: profileError } = await ensureUserProfile(
          data.user,
          role
        );
      
        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }
      
        localStorage.setItem("skillMitraRole", role);
        navigate(`/dashboard/${role}`);
      }
  
    setLoading(false);
  };

  const handleDemoLogin = () => {
    localStorage.setItem("skillMitraRole", role);

    navigate(`/dashboard/${role}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Demo indicator */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-slate-600">
              Demo data
            </span>
          </div>

          <span className="text-xs text-slate-400">
            Skill Mitra Prototype
          </span>
        </div>
      </div>

      {/* Back */}
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to roles
        </button>
      </div>

      <main className="flex min-h-[calc(100vh-100px)] items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">

          {/* Left side */}
          <div className={`${currentRole.bg} p-10 text-white md:p-12`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Icon size={28} />
            </div>

            <p className="mt-10 text-sm font-semibold uppercase tracking-wider text-white/70">
              Skill Mitra
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              {currentRole.name} Login
            </h1>

            <p className="mt-5 leading-7 text-white/80">
              {currentRole.description}
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 shrink-0" size={19} />
                <p className="text-sm text-white/80">
                  Role-specific access
                </p>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 shrink-0" size={19} />
                <p className="text-sm text-white/80">
                  Prototype demo environment
                </p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-950">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue as {currentRole.name.toLowerCase()}.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
              {error && (
  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
    {error}
  </p>
)}
              <button
                type="submit"
                className={`flex w-full items-center justify-center gap-2 rounded-xl ${currentRole.bg} px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-90`}
              >
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight size={17} />
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              onClick={handleDemoLogin}
              className={`w-full rounded-xl border-2 border-dashed border-slate-200 px-4 py-3 text-sm font-semibold ${currentRole.text} transition hover:bg-slate-50`}
            >
              Use demo account
            </button>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Prototype login accepts any input.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
