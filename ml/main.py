from fastapi import FastAPI
from pydantic import BaseModel
import subprocess
import json

app = FastAPI()

class ResumeInput(BaseModel):
    resume_text: str
    job_text: str = ""

@app.get("/")
def home():
    return {"status":"ML service running"}

@app.post("/analyze")
def analyze(data: ResumeInput):

    result = subprocess.run(
        [
            "python",
            "analyzer.py",
            data.resume_text,
            data.job_text
        ],
        capture_output=True,
        text=True
    )

    return json.loads(result.stdout)