#!/usr/bin/env python3
"""
Job seeder script — loads demo job listings into PostgreSQL.

v2 roadmap: Replace static DEMO_JOBS array with real scraper
(Selenium + BeautifulSoup) targeting Infostud, LinkedIn Jobs, 
and HelloWorld.rs for live data ingestion.
"""

import os
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DIRECT_URL")

if not DATABASE_URL:
    raise ValueError("DIRECT_URL not found in .env file")


DEMO_JOBS = [
    {
        "title": "Frontend Developer",
        "company": "TechCorp Belgrade",
        "location": "Belgrade, Serbia",
        "type": "full-time",
        "level": "mid",
        "description": "We are looking for a skilled Frontend Developer to join our team. You will work on building modern web applications using React and Next.js. Experience with TypeScript and Tailwind CSS is required.",
        "skills": ["React", "TypeScript", "Next.js", "Tailwind CSS"],
        "salary": "2000-3000 EUR",
        "remote": True,
    },
    {
        "title": "Full Stack Developer",
        "company": "StartupHub",
        "location": "Novi Sad, Serbia",
        "type": "full-time",
        "level": "mid",
        "description": "Join our growing startup as a Full Stack Developer. Work with modern technologies including Node.js, React, and PostgreSQL. We value clean code and continuous learning.",
        "skills": ["Node.js", "React", "PostgreSQL", "Docker"],
        "salary": "2500-3500 EUR",
        "remote": True,
    },
    {
        "title": "React Developer (Contract)",
        "company": "Digital Agency Pro",
        "location": "Remote",
        "type": "contract",
        "level": "junior",
        "description": "Looking for a React developer for project-based work. You will build client-facing web applications using modern React patterns and integrate REST APIs.",
        "skills": ["React", "JavaScript", "CSS", "REST APIs"],
        "salary": "1500-2000 EUR",
        "remote": True,
    },
    {
        "title": "Backend Developer",
        "company": "FinTech Solutions",
        "location": "Belgrade, Serbia",
        "type": "full-time",
        "level": "mid",
        "description": "Backend developer needed for financial technology platform. Experience with Node.js, PostgreSQL, and Redis required. AWS deployment experience is a plus.",
        "skills": ["Node.js", "PostgreSQL", "Redis", "Docker", "AWS"],
        "salary": "3000-4000 EUR",
        "remote": False,
    },
    {
        "title": "Next.js Developer",
        "company": "SaaS Platform Inc",
        "location": "Remote",
        "type": "full-time",
        "level": "mid",
        "description": "Build and maintain our SaaS platform using Next.js 14 App Router. Work closely with design and product teams to ship features fast. Prisma ORM experience required.",
        "skills": ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
        "salary": "2800-3800 EUR",
        "remote": True,
    },
    {
        "title": "Junior Frontend Developer",
        "company": "Web Agency Belgrade",
        "location": "Belgrade, Serbia",
        "type": "full-time",
        "level": "junior",
        "description": "Great opportunity for a junior developer to grow their skills. Mentorship provided. You will work on small to medium client projects.",
        "skills": ["HTML", "CSS", "JavaScript", "React"],
        "salary": "800-1200 EUR",
        "remote": False,
    },
    {
        "title": "Senior TypeScript Developer",
        "company": "Enterprise Corp",
        "location": "Remote",
        "type": "full-time",
        "level": "senior",
        "description": "Senior TypeScript developer for enterprise-scale applications. Strong architecture skills required. You will lead technical decisions and mentor junior developers.",
        "skills": ["TypeScript", "Node.js", "React", "Microservices", "AWS"],
        "salary": "4000-6000 EUR",
        "remote": True,
    },
    {
        "title": "AI/ML Engineer",
        "company": "AI Startup",
        "location": "Belgrade, Serbia",
        "type": "full-time",
        "level": "mid",
        "description": "Work on cutting-edge AI products. Experience with LLMs (Claude, GPT) and Python required. Help build the next generation of AI tools.",
        "skills": ["Python", "Machine Learning", "Claude API", "FastAPI", "PostgreSQL"],
        "salary": "3000-5000 EUR",
        "remote": True,
    },
    {
        "title": "DevOps Engineer",
        "company": "Cloud Solutions",
        "location": "Remote",
        "type": "full-time",
        "level": "mid",
        "description": "Manage and improve our cloud infrastructure. Experience with AWS, Docker, and Kubernetes required. Set up CI/CD pipelines.",
        "skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux"],
        "salary": "3500-5000 EUR",
        "remote": True,
    },
    {
        "title": "WordPress Developer",
        "company": "Marketing Agency",
        "location": "Belgrade, Serbia",
        "type": "full-time",
        "level": "junior",
        "description": "Build and maintain WordPress sites for clients. Custom theme development with PHP and JavaScript. Good opportunity for someone wanting to grow into full-stack.",
        "skills": ["WordPress", "PHP", "JavaScript", "CSS"],
        "salary": "1000-1500 EUR",
        "remote": False,
    },
]


def seed_jobs():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        print(f"🔌 Connected to database. Seeding {len(DEMO_JOBS)} jobs...")

        # Clear existing jobs first (optional — for clean re-seeding)
        cur.execute('DELETE FROM "Match";')
        cur.execute('DELETE FROM "Job";')
        print("🧹 Cleared existing jobs and matches.")

        for job in DEMO_JOBS:
            cur.execute(
                """
                INSERT INTO "Job" 
                (id, title, company, location, type, level, description, skills, salary, remote, "createdAt")
                VALUES 
                (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    job["title"],
                    job["company"],
                    job["location"],
                    job["type"],
                    job["level"],
                    job["description"],
                    job["skills"],
                    job.get("salary"),
                    job["remote"],
                    datetime.now(),
                ),
            )

        conn.commit()
        print(f"✅ Successfully seeded {len(DEMO_JOBS)} jobs!")

        # Verify
        cur.execute('SELECT COUNT(*) FROM "Job";')
        count = cur.fetchone()[0]
        print(f"📊 Total jobs in DB: {count}")

        cur.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error: {e}")
        raise


if __name__ == "__main__":
    seed_jobs()