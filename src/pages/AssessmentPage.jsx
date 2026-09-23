import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assessments } from "./data/assessments";
import { supabase } from "../lib/supabase";

function AssessmentPage() {
  const navigate = useNavigate();

  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [codeResults, setCodeResults] = useState({});

  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [saveError, setSaveError] = useState("");

  const assessment = selectedAssessment;
  const questions = assessment?.questions || [];
  const question = questions[currentQuestion];

  // --------------------------------------------------
  // TIMER
  // --------------------------------------------------

  useEffect(() => {
    if (!started || submitted) return;

    if (timeLeft <= 0) {
      setSubmitted(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, submitted, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // --------------------------------------------------
  // RUN JAVASCRIPT CODING QUESTION
  // --------------------------------------------------

  const runCode = () => {
    const code = answers[question.id] || "";

    if (!code.trim()) {
      setCodeResults((previous) => ({
        ...previous,
        [question.id]: {
          success: false,
          message: "Please write some code first.",
        },
      }));

      return;
    }

    try {
      const functionBody = code
        .replace(/function\s+\w+\s*\([^)]*\)\s*\{/, "")
        .replace(/\}\s*$/, "")
        .trim();

      const testFunction = new Function(
        "return function add(a, b) {" +
          functionBody +
          "}"
      )();

      const result = testFunction(5, 3);

      if (String(result) === String(question.expectedOutput)) {
        setCodeResults((previous) => ({
          ...previous,
          [question.id]: {
            success: true,
            message: `Correct! Output: ${result}`,
          },
        }));
      } else {
        setCodeResults((previous) => ({
          ...previous,
          [question.id]: {
            success: false,
            message: `Incorrect output. Expected ${question.expectedOutput}, but got ${result}.`,
          },
        }));
      }
    } catch (error) {
      setCodeResults((previous) => ({
        ...previous,
        [question.id]: {
          success: false,
          message: `Code error: ${error.message}`,
        },
      }));
    }
  };

  // --------------------------------------------------
  // SELECT ANSWER
  // --------------------------------------------------

  const selectAnswer = (answer) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: answer,
    }));
  };

  // --------------------------------------------------
  // START ASSESSMENT
  // --------------------------------------------------

  const startAssessment = () => {
    setStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setCodeResults({});
    setTimeLeft(15 * 60);
    setSubmitted(false);
    setSaveError("");
  };

  // --------------------------------------------------
  // CALCULATE RESULTS
  // --------------------------------------------------

  const calculateResults = () => {
    let theoryCorrect = 0;
    let theoryTotal = 0;
    let codeCorrect = 0;
    let codeTotal = 0;

    questions.forEach((item) => {
      if (item.type === "theory") {
        theoryTotal++;

        if (answers[item.id] === item.answer) {
          theoryCorrect++;
        }
      }

      if (item.type === "code-reading") {
        codeTotal++;

        if (answers[item.id] === item.answer) {
          codeCorrect++;
        }
      }

      if (item.type === "coding") {
        codeTotal++;

        const codeResult = codeResults[item.id];

        if (codeResult?.success) {
          codeCorrect++;
        }
      }
    });

    const theoryScore =
      theoryTotal > 0
        ? (theoryCorrect / theoryTotal) * 40
        : 0;

    const codeScore =
      codeTotal > 0
        ? (codeCorrect / codeTotal) * 60
        : 0;

    const totalScore = Math.round(
      theoryScore + codeScore
    );

    return {
      theoryCorrect,
      theoryTotal,
      codeCorrect,
      codeTotal,
      totalScore,
    };
  };

  // --------------------------------------------------
  // SAVE RESULT TO SUPABASE
  // --------------------------------------------------

  const submitAssessment = async () => {
    if (!assessment) {
      return;
    }

    setSavingResult(true);
    setSaveError("");

    const results = calculateResults();

    // Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaveError(
        "Please sign in before submitting the assessment."
      );
      setSavingResult(false);
      return;
    }

    // Find matching skill from the database.
    // Example:
    // assessment.skill = "JavaScript"
    // assessment.skill = "Python"
    // assessment.skill = "Java"
    // assessment.skill = "SQL"
    const { data: skill, error: skillError } =
      await supabase
        .from("skills")
        .select("id, name")
        .eq("name", assessment.skill)
        .maybeSingle();

    if (skillError) {
      setSaveError(
        `Could not find the ${assessment.skill} skill: ${skillError.message}`
      );
      setSavingResult(false);
      return;
    }

    if (!skill) {
      setSaveError(
        `The skill "${assessment.skill}" does not exist in the Supabase skills table.`
      );
      setSavingResult(false);
      return;
    }

    // Save/update the student's skill result.
    const { error: saveError } = await supabase
      .from("student_skills")
      .upsert(
        {
          student_id: user.id,
          skill_id: skill.id,
          score: results.totalScore,
          verification: "Assessment-verified",
        },
        {
          onConflict: "student_id,skill_id",
        }
      );

    if (saveError) {
      setSaveError(
        `Could not save ${assessment.skill} result: ${saveError.message}`
      );
      setSavingResult(false);
      return;
    }

    setSavingResult(false);
    setSubmitted(true);
  };

  // --------------------------------------------------
  // RESULTS
  // --------------------------------------------------

  if (submitted && assessment) {
    const results = calculateResults();

    const strength =
      results.totalScore >= 70
        ? "Strong performance"
        : results.totalScore >= 40
        ? "Developing skill"
        : "Needs improvement";

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-5">
            <h1 className="text-2xl font-bold text-slate-950">
              Assessment Results
            </h1>

            <p className="text-sm text-slate-500">
              {assessment.skill} skill assessment
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Your Skill Score
            </p>

            <div className="mt-4 text-6xl font-bold text-blue-600">
              {results.totalScore}
              <span className="text-2xl text-slate-400">
                /100
              </span>
            </div>

            <p className="mt-4 text-lg font-semibold text-slate-900">
              {strength}
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">
                Theory Performance
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                {results.theoryCorrect}/{results.theoryTotal}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Weighted contribution: 40%
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">
                Code Performance
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                {results.codeCorrect}/{results.codeTotal}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Weighted contribution: 60%
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Assessment Summary
            </h2>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                ✓ Skill assessed:{" "}
                <strong>{assessment.skill}</strong>
              </p>

              <p>
                ✓ Questions attempted:{" "}
                <strong>
                  {Object.keys(answers).length}/{questions.length}
                </strong>
              </p>

              <p>
                ✓ Difficulty:{" "}
                <strong>{assessment.difficulty}</strong>
              </p>

              <p>
                ✓ Result saved to your Skill Passport
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setStarted(false);
              setSubmitted(false);
              setSelectedAssessment(null);
              setAnswers({});
              setCodeResults({});
            }}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Assessments
          </button>
        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // ASSESSMENT QUESTIONS
  // --------------------------------------------------

  if (started && assessment && question) {
    const progress =
      ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-950">
                  {assessment.skill} Assessment
                </h1>

                <p className="text-sm text-slate-500">
                  Question {currentQuestion + 1} of{" "}
                  {questions.length}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {question.type}
              </span>

              <span className="text-sm text-slate-400">
                {assessment.difficulty}
              </span>
            </div>

            <h2 className="mt-6 whitespace-pre-line text-xl font-bold leading-8 text-slate-950">
              {question.question}
            </h2>

            {question.type === "coding" ? (
              <div className="mt-8">
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Write your code:
                </p>

                <textarea
                  value={
                    answers[question.id] ||
                    question.starterCode ||
                    ""
                  }
                  onChange={(event) =>
                    selectAnswer(event.target.value)
                  }
                  className="min-h-64 w-full rounded-xl bg-slate-950 p-5 font-mono text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
                  spellCheck="false"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Sample input: {question.sampleInput}
                </p>

                {codeResults[question.id] && (
                  <div
                    className={`mt-4 rounded-xl p-4 text-sm font-medium ${
                      codeResults[question.id].success
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {codeResults[question.id].message}
                  </div>
                )}

                <button
                  onClick={runCode}
                  className="mt-4 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  ▶ Run Code
                </button>
              </div>
            ) : (
              <div className="mt-8 space-y-3">
                {question.options.map((option) => {
                  const selected =
                    answers[question.id] === option;

                  return (
                    <button
                      key={option}
                      onClick={() => selectAnswer(option)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                disabled={currentQuestion === 0}
                onClick={() =>
                  setCurrentQuestion(
                    (previous) => previous - 1
                  )
                }
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              {currentQuestion < questions.length - 1 ? (
                <button
                  onClick={() =>
                    setCurrentQuestion(
                      (previous) => previous + 1
                    )
                  }
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Next →
                </button>
              ) : (
                <div className="flex flex-col items-end gap-3">
                  {saveError && (
                    <p className="text-sm font-medium text-red-600">
                      {saveError}
                    </p>
                  )}

                  <button
                    onClick={submitAssessment}
                    disabled={savingResult}
                    className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingResult
                      ? "Saving result..."
                      : "Submit Assessment"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // ASSESSMENT DETAILS
  // --------------------------------------------------

  if (selectedAssessment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-5">
            <h1 className="text-2xl font-bold text-slate-950">
              Skill Assessment
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">
          <button
            onClick={() => setSelectedAssessment(null)}
            className="text-sm font-semibold text-blue-600"
          >
            ← Back to assessments
          </button>

          <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-950">
              {selectedAssessment.skill} Assessment
            </h2>

            <p className="mt-2 text-slate-500">
              Difficulty: {selectedAssessment.difficulty}
            </p>

            <div className="mt-8 rounded-2xl bg-slate-50 p-6">
              <p className="font-semibold text-slate-950">
                Assessment details
              </p>

              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>
                  • Questions:{" "}
                  {selectedAssessment.questions.length}
                </li>

                <li>• Theory weight: 40%</li>
                <li>• Code weight: 60%</li>
                <li>• Time limit: 15 minutes</li>
              </ul>
            </div>

            <button
              onClick={startAssessment}
              className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Begin Assessment
            </button>
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // ASSESSMENT LIST
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Skill Assessment
            </h1>

            <p className="text-sm text-slate-500">
              Measure your skills and identify your gaps.
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Live data
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-3xl font-bold text-slate-950">
          Choose a skill
        </h2>

        <p className="mt-2 text-slate-500">
          Select an assessment to measure your current skill level.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {assessments.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedAssessment(item)}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-950">
                  {item.skill}
                </h3>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  {item.difficulty}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {item.questions.length} questions
              </p>

              <div className="mt-5 text-sm font-semibold text-blue-600">
                Start Assessment →
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AssessmentPage;