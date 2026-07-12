#!/usr/bin/env python3
"""
ml/analyzer.py

Contract with the Node.js backend (controllers/resumeController.js):
  argv[1] = raw resume text
  argv[2] = job description text (may be an empty string)

  stdout: EXACTLY one line of pure JSON, of the shape:
    {
      "skills": [str, ...],
      "experienceYears": int,
      "matchPercentage": int (0-100),
      "score": int (0-100),
      "suggestions": [str, ...]
    }

  stderr: any warnings, model-download notices, or diagnostic logging.
          Nothing that isn't the final JSON line may ever reach stdout.
  exit code: 0 on success, 1 on failure (with a JSON error payload on stderr).
"""

import sys
import os
import json
import re
import warnings

# ---------------------------------------------------------------------------
# Redirect noisy import-time output before importing spaCy / scikit-learn.
# Some environments print deprecation warnings or download notices on import;
# none of that is allowed to touch stdout, since stdout must be pure JSON.
# ---------------------------------------------------------------------------
warnings.filterwarnings("ignore")
os.environ.setdefault("PYTHONWARNINGS", "ignore")

_real_stdout = sys.stdout
sys.stdout = sys.stderr  # temporarily mute stdout during imports

try:
    import spacy
    from spacy.matcher import PhraseMatcher
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
except Exception as import_err:  # pragma: no cover
    sys.stdout = _real_stdout
    print(
        json.dumps(
            {"error": f"Failed to import ML dependencies: {import_err}"}
        )
    )
    sys.exit(1)
finally:
    sys.stdout = _real_stdout  # restore stdout for the final JSON payload


# ---------------------------------------------------------------------------
# Skill keyword bank for the PhraseMatcher. Extend as needed.
# ---------------------------------------------------------------------------
SKILL_KEYWORDS = [
    "React", "React.js", "Node.js", "Node", "Express", "Express.js",
    "MongoDB", "Mongoose", "Python", "C++", "JavaScript", "TypeScript",
    "Java", "SQL", "PostgreSQL", "MySQL", "Redis", "Docker", "Kubernetes",
    "AWS", "Azure", "GCP", "Git", "GraphQL", "REST", "Django", "Flask",
    "Spring Boot", "TailwindCSS", "Redux", "Next.js", "HTML", "CSS",
    "scikit-learn", "spaCy", "TensorFlow", "PyTorch", "Pandas", "NumPy",
]


def load_nlp():
    """
    Loads the spaCy English pipeline. If the model isn't installed,
    prints a notice to stderr and falls back to a blank English pipeline
    so the script can still run (skill matching will still work via
    PhraseMatcher, which doesn't require the full statistical model).
    """
    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        print(
            "[analyzer.py] 'en_core_web_sm' not found, falling back to blank('en'). "
            "Run: python -m spacy download en_core_web_sm",
            file=sys.stderr,
        )
        return spacy.blank("en")


def extract_skills(nlp, text):
    """Uses PhraseMatcher to find skill keyword hits and dedupe them."""
    if not text:
        return []

    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = [nlp.make_doc(term) for term in SKILL_KEYWORDS]
    matcher.add("SKILLS", patterns)

    doc = nlp.make_doc(text)
    matches = matcher(doc)

    found = set()
    for match_id, start, end in matches:
        span_text = doc[start:end].text
        # Normalize to the canonical keyword casing where possible.
        canonical = next(
            (kw for kw in SKILL_KEYWORDS if kw.lower() == span_text.lower()),
            span_text,
        )
        found.add(canonical)

    return sorted(found)


def estimate_experience_years(text):
    """
    Rough structural heuristic: looks for patterns like "5 years",
    "3+ years of experience", etc., and returns the max found (capped at 40).
    """
    if not text:
        return 0

    matches = re.findall(r"(\d{1,2})\+?\s*(?:years|yrs)", text, flags=re.IGNORECASE)
    years = [int(m) for m in matches if int(m) <= 40]
    return max(years) if years else 0


def compute_match_percentage(resume_text, job_text):
    """
    TF-IDF vectorizes resume vs job description and returns cosine
    similarity as an integer percentage (0-100). Returns 0 if the job
    description is empty (nothing to match against).
    """
    if not job_text or not job_text.strip():
        return 0

    corpus = [resume_text or "", job_text]
    vectorizer = TfidfVectorizer(stop_words="english")

    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
    except ValueError:
        # Happens if both docs are empty / only stopwords after filtering.
        return 0

    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    return int(round(similarity * 100))


def build_feedback(resume_text, skills, experience_years):
    """Structural rule-based feedback generation."""
    suggestions = []
    word_count = len(resume_text.split()) if resume_text else 0

    if word_count < 150:
        suggestions.append(
            "Your resume looks quite short — consider expanding on your project details and achievements."
        )
    elif word_count > 1200:
        suggestions.append(
            "Your resume is on the longer side — consider trimming it to the most relevant, recent experience."
        )

    if len(skills) < 3:
        suggestions.append(
            "Few recognizable technical skills were detected — make sure your tech stack is listed explicitly."
        )

    if experience_years == 0:
        suggestions.append(
            "No clear years of experience were detected — consider stating experience duration explicitly (e.g., '3 years')."
        )

    if not re.search(r"\b\d+%|\b\d+x\b|\$\d+", resume_text or ""):
        suggestions.append(
            "Add quantifiable achievements (e.g., percentages, metrics, or dollar impact) to strengthen your resume."
        )

    # Base score starts at 60 and is adjusted by structural signals.
    score = 60
    score += min(len(skills) * 4, 24)  # up to +24 for skill breadth
    score += min(experience_years * 2, 10)  # up to +10 for experience
    score -= len(suggestions) * 3
    score = max(0, min(100, score))

    if not suggestions:
        suggestions.append("Strong resume overall — no major structural issues detected.")

    return score, suggestions


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing required argv[1]: raw resume text"}), file=sys.stderr)
        sys.exit(1)

    resume_text = sys.argv[1] if len(sys.argv) > 1 else ""
    job_text = sys.argv[2] if len(sys.argv) > 2 else ""

    nlp = load_nlp()

    skills = extract_skills(nlp, resume_text)
    experience_years = estimate_experience_years(resume_text)
    match_percentage = compute_match_percentage(resume_text, job_text)
    score, suggestions = build_feedback(resume_text, skills, experience_years)

    result = {
        "skills": skills,
        "experienceYears": experience_years,
        "matchPercentage": match_percentage,
        "score": score,
        "suggestions": suggestions,
    }

    # This must be the ONLY thing written to stdout, as a single line.
    _real_stdout.write(json.dumps(result))
    _real_stdout.write("\n")
    _real_stdout.flush()
    sys.exit(0)


if __name__ == "__main__":
    main()
