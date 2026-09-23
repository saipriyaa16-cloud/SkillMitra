import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

import "./ChallengeSubmission.css";

import { challenges } from "./data/challenges";
import { supabase } from "../lib/supabase";

function ChallengeSubmission() {
  const { challengeId } = useParams();
  const navigate = useNavigate();

  const challenge = challenges.find(
    (item) => item.id === challengeId
  );

  const [submissionText, setSubmissionText] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [existingSubmission, setExistingSubmission] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSubmission();
  }, [challengeId]);

  const loadSubmission = async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login/student");
      return;
    }

    const { data, error } = await supabase
      .from("challenge_submissions")
      .select("*")
      .eq("student_id", user.id)
      .eq("challenge_id", challengeId)
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else if (data) {
      setExistingSubmission(data);
      setSubmissionText(data.submission_text || "");
      setProjectUrl(data.project_url || "");
    }

    setLoading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!submissionText.trim()) {
      setError("Please describe your completed project.");
      return;
    }

    if (!projectUrl.trim()) {
      setError("Please provide your project URL.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in again.");
      setSubmitting(false);
      return;
    }

    const submissionData = {
      student_id: user.id,
      challenge_id: challengeId,
      submission_text: submissionText.trim(),
      project_url: projectUrl.trim(),
      status: "Submitted",
      submitted_at: new Date().toISOString(),
    };

    let result;

    if (existingSubmission) {
      result = await supabase
        .from("challenge_submissions")
        .update({
          submission_text: submissionData.submission_text,
          project_url: submissionData.project_url,
          status: "Submitted",
          submitted_at: submissionData.submitted_at,
        })
        .eq("id", existingSubmission.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("challenge_submissions")
        .insert(submissionData)
        .select()
        .single();
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      setExistingSubmission(result.data);
      setSuccess(true);
    }

    setSubmitting(false);
  };

  if (!challenge) {
    return (
      <div className="challenge-page">
        <div className="challenge-container">
          <div className="challenge-card">
            <h2>Challenge not found</h2>

            <button
              className="challenge-submit"
              onClick={() => navigate("/challenges")}
            >
              Back to Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="challenge-page">
        <div className="challenge-container">
          <div className="challenge-loading">
            <Loader2 className="challenge-spin" size={28} />
            <span>Loading submission...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="challenge-page">
      <div className="challenge-container">

        {/* Back Button */}
        <button
          className="challenge-back"
          onClick={() => navigate(`/challenges/${challengeId}`)}
        >
          <ArrowLeft size={18} />
          Back to Challenge
        </button>

        {/* Header */}
        <div className="challenge-header">
          <div>
            <span className="challenge-eyebrow">
              Challenge Submission
            </span>

            <h1>{challenge.title}</h1>

            <p>
              Submit your completed project and provide evidence of your work.
            </p>
          </div>

          <div className="challenge-live">
            <span className="challenge-live-dot"></span>
            Live data
          </div>
        </div>

        {/* Challenge Summary */}
        <div className="challenge-card challenge-summary">
          <div>
            <span className="challenge-label">
              Challenge
            </span>

            <h2>{challenge.title}</h2>
          </div>

          <div className="challenge-meta">
            <span>{challenge.type}</span>
            <span>{challenge.difficulty}</span>
            <span>{challenge.duration}</span>
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit}>
          <div className="challenge-card">

            <div className="challenge-section-heading">
              <Upload size={22} />

              <div>
                <h2>Submit Your Project</h2>

                <p>
                  Provide details about what you built and a link to your
                  project.
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="challenge-form-group">
              <label htmlFor="submissionText">
                Project Description
              </label>

              <textarea
                id="submissionText"
                rows="7"
                value={submissionText}
                onChange={(event) =>
                  setSubmissionText(event.target.value)
                }
                placeholder="Explain what you built, how it works, and which challenge requirements you completed..."
              />

              <small>
                Mention the major features, technologies used, and completed
                deliverables.
              </small>
            </div>

            {/* Project URL */}
            <div className="challenge-form-group">
              <label htmlFor="projectUrl">
                Project URL
              </label>

              <input
                id="projectUrl"
                type="url"
                value={projectUrl}
                onChange={(event) =>
                  setProjectUrl(event.target.value)
                }
                placeholder="https://github.com/your-project"
              />

              <small>
                GitHub, deployed website, portfolio, or another accessible
                project link.
              </small>
            </div>

            {/* Error */}
            {error && (
              <div className="challenge-error">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="challenge-success">
                <CheckCircle size={20} />

                <div>
                  <strong>
                    Project submitted successfully!
                  </strong>

                  <p>
                    Your challenge submission has been saved to Skill Mitra.
                  </p>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="challenge-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2
                    className="challenge-spin"
                    size={18}
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload size={18} />

                  {existingSubmission
                    ? "Update Submission"
                    : "Submit Project"}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Deliverables */}
        <div className="challenge-card">

          <div className="challenge-section-heading">
            <CheckCircle size={22} />

            <div>
              <h2>Expected Deliverables</h2>

              <p>
                Make sure your project covers these requirements.
              </p>
            </div>
          </div>

          <div className="challenge-deliverables">
            {challenge.deliverables.map(
              (deliverable, index) => (
                <div
                  className="challenge-deliverable"
                  key={index}
                >
                  <CheckCircle size={18} />
                  <span>{deliverable}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Existing Submission */}
        {existingSubmission && (
          <div className="challenge-card">

            <div className="challenge-section-heading">
              <ExternalLink size={22} />

              <div>
                <h2>Current Submission</h2>

                <p>
                  Your latest submitted project.
                </p>
              </div>
            </div>

            <a
              href={existingSubmission.project_url}
              target="_blank"
              rel="noreferrer"
              className="challenge-project-link"
            >
              Open Project
              <ExternalLink size={16} />
            </a>

            <div className="challenge-status">
              <span className="challenge-status-dot"></span>
              {existingSubmission.status}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ChallengeSubmission;