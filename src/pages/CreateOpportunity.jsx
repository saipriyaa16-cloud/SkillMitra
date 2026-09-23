import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Plus,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import "./CreateOpportunity.css";

function CreateOpportunity() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    company: "",
    type: "Internship",
    description: "",
    location: "",
    remote: false,
    stipend: "",
    openings: 1,
    deadline: "",
  });

  const [skills, setSkills] = useState([
    { skill: "", minimum: 60 },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSkillChange = (index, field, value) => {
    setSkills((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]:
                field === "minimum"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const addSkill = () => {
    setSkills((previous) => [
      ...previous,
      { skill: "", minimum: 60 },
    ]);
  };

  const removeSkill = (index) => {
    if (skills.length === 1) return;

    setSkills((previous) =>
      previous.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!form.title.trim()) {
      setError("Please enter an opportunity title.");
      return;
    }

    if (!form.company.trim()) {
      setError("Please enter the company name.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter an opportunity description.");
      return;
    }

    const validSkills = skills.filter(
      (item) => item.skill.trim()
    );

    if (validSkills.length === 0) {
      setError("Please add at least one required skill.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in again.");
      setSaving(false);
      return;
    }

    const opportunityData = {
      industry_id: user.id,
      title: form.title.trim(),
      company: form.company.trim(),
      type: form.type,
      description: form.description.trim(),
      location: form.location.trim(),
      remote: form.remote,
      stipend: form.stipend.trim(),
      openings: Number(form.openings) || 1,
      deadline: form.deadline || null,
      required_skills: validSkills,
      status: "Open",
    };

    const { error: insertError } = await supabase
      .from("industry_opportunities")
      .insert(opportunityData);

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);

    setTimeout(() => {
      navigate("/dashboard/industry");
    }, 1200);
  };

  return (
    <div className="create-opportunity-page">
      <div className="create-opportunity-container">

        {/* Back */}
        <button
          className="create-back-button"
          onClick={() =>
            navigate("/dashboard/industry")
          }
        >
          <ArrowLeft size={18} />
          Back to Industry Dashboard
        </button>

        {/* Header */}
        <div className="create-header">
          <div>
            <span className="create-eyebrow">
              Industry Portal
            </span>

            <h1>Create Opportunity</h1>

            <p>
              Publish an internship or opportunity and
              define the skills you need.
            </p>
          </div>

          <div className="create-header-icon">
            <Briefcase size={26} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Basic Details */}
          <section className="create-card">
            <div className="create-section-title">
              <h2>Opportunity Details</h2>
              <p>
                Tell students what this opportunity is
                about.
              </p>
            </div>

            <div className="create-grid">

              <div className="create-field create-full">
                <label>Opportunity Title</label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Development Intern"
                />
              </div>

              <div className="create-field">
                <label>Company Name</label>

                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. TechNova Solutions"
                />
              </div>

              <div className="create-field">
                <label>Opportunity Type</label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option>Internship</option>
                  <option>Full-Time</option>
                  <option>Part-Time</option>
                  <option>Project</option>
                  <option>Challenge</option>
                </select>
              </div>

              <div className="create-field">
                <label>Location</label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad"
                />
              </div>

              <div className="create-field">
                <label>Stipend / Salary</label>

                <input
                  name="stipend"
                  value={form.stipend}
                  onChange={handleChange}
                  placeholder="e.g. ₹20,000/month"
                />
              </div>

              <div className="create-field">
                <label>Number of Openings</label>

                <input
                  name="openings"
                  type="number"
                  min="1"
                  value={form.openings}
                  onChange={handleChange}
                />
              </div>

              <div className="create-field">
                <label>Application Deadline</label>

                <input
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                />
              </div>

              <div className="create-field create-full">
                <label>Description</label>

                <textarea
                  name="description"
                  rows="6"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the role, responsibilities, project, and what students will learn..."
                />
              </div>

              <div className="create-checkbox">
                <input
                  id="remote"
                  name="remote"
                  type="checkbox"
                  checked={form.remote}
                  onChange={handleChange}
                />

                <label htmlFor="remote">
                  This opportunity is remote
                </label>
              </div>
            </div>
          </section>

          {/* Required Skills */}
          <section className="create-card">
            <div className="create-section-title">
              <h2>Required Skills</h2>

              <p>
                Define the skills students need and the
                minimum score expected.
              </p>
            </div>

            <div className="skill-list">
              {skills.map((item, index) => (
                <div
                  className="skill-row"
                  key={index}
                >
                  <div className="skill-number">
                    {index + 1}
                  </div>

                  <input
                    value={item.skill}
                    onChange={(event) =>
                      handleSkillChange(
                        index,
                        "skill",
                        event.target.value
                      )
                    }
                    placeholder="e.g. JavaScript"
                  />

                  <div className="minimum-score">
                    <span>Minimum</span>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.minimum}
                      onChange={(event) =>
                        handleSkillChange(
                          index,
                          "minimum",
                          event.target.value
                        )
                      }
                    />

                    <span>/100</span>
                  </div>

                  <button
                    type="button"
                    className="remove-skill"
                    onClick={() =>
                      removeSkill(index)
                    }
                    disabled={skills.length === 1}
                    title="Remove skill"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="add-skill-button"
              onClick={addSkill}
            >
              <Plus size={17} />
              Add Another Skill
            </button>
          </section>

          {/* Messages */}
          {error && (
            <div className="create-error">
              {error}
            </div>
          )}

          {success && (
            <div className="create-success">
              Opportunity created successfully! Redirecting
              to your Industry Dashboard...
            </div>
          )}

          {/* Submit */}
          <div className="create-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                navigate("/dashboard/industry")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="publish-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="create-spin"
                  />
                  Publishing...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Publish Opportunity
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOpportunity;