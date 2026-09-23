import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Plus,
  Trash2,
  Save,
  CheckCircle,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function IndustryRequirements() {
  const navigate = useNavigate();

  const [roleTitle, setRoleTitle] = useState(
    "Frontend Developer Intern"
  );

  const [requirements, setRequirements] = useState([
    {
      skill: "JavaScript",
      level: 70,
      importance: "Must-have",
    },
    {
      skill: "React",
      level: 60,
      importance: "Must-have",
    },
    {
      skill: "Web Development",
      level: 65,
      importance: "Nice-to-have",
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addRequirement = () => {
    setRequirements([
      ...requirements,
      {
        skill: "",
        level: 50,
        importance: "Must-have",
      },
    ]);

    setSaved(false);
  };

  const updateRequirement = (index, field, value) => {
    const updated = [...requirements];

    updated[index][field] = value;

    setRequirements(updated);
    setSaved(false);
  };

  const removeRequirement = (index) => {
    setRequirements(
      requirements.filter(
        (_, requirementIndex) => requirementIndex !== index
      )
    );

    setSaved(false);
  };

  const handleSave = async () => {
    if (!roleTitle.trim()) {
      alert("Please enter a role title.");
      return;
    }

    const validRequirements = requirements.filter(
      (item) => item.skill.trim() !== ""
    );

    if (validRequirements.length === 0) {
      alert("Please add at least one skill.");
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        alert("Please login again.");
        navigate("/");
        return;
      }

      const { error } = await supabase
        .from("role_requirements")
        .insert({
          industry_id: user.id,
          role_title: roleTitle.trim(),
          requirements: validRequirements,
        });

      if (error) {
        throw error;
      }

      setSaved(true);

      alert("Role requirements saved successfully!");
    } catch (error) {
      console.error("Save role requirements error:", error);

      alert(
        error.message ||
          "Unable to save role requirements. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-950">
                Role Requirements
              </h1>

              <p className="text-sm text-slate-500">
                Define the skills required for a role
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 sm:flex">
            <Briefcase size={16} />
            Industry
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* Role Information */}
        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-950">
              Create Role Requirements
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Define the skills and minimum proficiency levels
              candidates need for this role.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Role Title
            </label>

            <input
              value={roleTitle}
              onChange={(e) => {
                setRoleTitle(e.target.value);
                setSaved(false);
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Example: Frontend Developer Intern"
            />
          </div>
        </section>

        {/* Required Skills */}
        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Required Skills
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Set the minimum skill level and importance for each
                skill.
              </p>
            </div>

            <button
              onClick={addRequirement}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={17} />
              Add Skill
            </button>
          </div>

          <div className="mt-7 space-y-4">
            {requirements.map((requirement, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="grid gap-4 md:grid-cols-12 md:items-end">

                  {/* Skill */}
                  <div className="md:col-span-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Skill
                    </label>

                    <input
                      value={requirement.skill}
                      onChange={(e) =>
                        updateRequirement(
                          index,
                          "skill",
                          e.target.value
                        )
                      }
                      placeholder="Example: Python"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Level */}
                  <div className="md:col-span-3">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Minimum Level
                    </label>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={requirement.level}
                        onChange={(e) =>
                          updateRequirement(
                            index,
                            "level",
                            Number(e.target.value)
                          )
                        }
                        className="w-full"
                      />

                      <span className="w-12 rounded-lg bg-white px-2 py-2 text-center text-sm font-bold text-slate-700">
                        {requirement.level}
                      </span>
                    </div>
                  </div>

                  {/* Importance */}
                  <div className="md:col-span-3">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Importance
                    </label>

                    <select
                      value={requirement.importance}
                      onChange={(e) =>
                        updateRequirement(
                          index,
                          "importance",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option>Must-have</option>
                      <option>Nice-to-have</option>
                    </select>
                  </div>

                  {/* Remove */}
                  <div className="md:col-span-2">
                    <button
                      onClick={() => removeRequirement(index)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="mt-7 rounded-3xl bg-blue-600 p-7 text-white shadow-sm">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <p className="text-sm font-medium text-blue-100">
                Role Summary
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                {roleTitle}
              </h3>

              <p className="mt-2 text-sm text-blue-100">
                {requirements.length} skills defined •{" "}
                {
                  requirements.filter(
                    (item) =>
                      item.importance === "Must-have"
                  ).length
                }{" "}
                must-have
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saved ? (
                <>
                  <CheckCircle size={17} />
                  Saved
                </>
              ) : saving ? (
                <>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Requirements
                </>
              )}
            </button>

          </div>
        </section>

      </main>
    </div>
  );
}

export default IndustryRequirements;