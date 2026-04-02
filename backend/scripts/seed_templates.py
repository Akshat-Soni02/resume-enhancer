#!/usr/bin/env python3
"""
Seed Firestore `templates` collection with a default LaTeX sample.
Run from repository root:
  cd backend && python scripts/seed_templates.py

Requires FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS and FIREBASE_PROJECT_ID.
"""
import os
import sys

from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import firebase_admin  # noqa: E402

from firebase_init import init_firebase  # noqa: E402

from firebase_admin import firestore  # noqa: E402
from google.cloud.firestore import SERVER_TIMESTAMP  # noqa: E402

MINIMAL_LATEX = r"""% ResumeAI default template (seed)
\documentclass[letterpaper,11pt]{article}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\begin{document}
\begin{center}
{\Huge \scshape [FULL NAME]}
\end{center}
\section*{Experience}
Your content here.
\end{document}
"""


def main() -> None:
    init_firebase()
    if not firebase_admin._apps:
        print("Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.")
        sys.exit(1)

    db = firestore.client()
    doc_id = "default-jake-style"
    ref = db.collection("templates").document(doc_id)
    ref.set(
        {
            "name": "Classic ATS (LaTeX)",
            "description": "Default seeded template; replace with your canonical LaTeX samples.",
            "latex_body": MINIMAL_LATEX,
            "is_active": True,
            "version": 1,
            "created_at": SERVER_TIMESTAMP,
            "updated_at": SERVER_TIMESTAMP,
        },
        merge=True,
    )
    print(f"Seeded templates/{doc_id}")


if __name__ == "__main__":
    main()
