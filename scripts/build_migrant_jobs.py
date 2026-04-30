"""Convert migrant_jobs_dataset.xlsx into src/data/migrantJobsData.js.

Run with:  python scripts/build_migrant_jobs.py

Mapping is documented in docs/DATA_MAPPING.md.
"""
import json, hashlib, re, os, sys, io
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "migrant_jobs_dataset.xlsx")
OUT = os.path.join(ROOT, "src", "data", "migrantJobsData.js")

CITY_COUNTRY = {
    "Dubai":       ("UAE",          "AE", "\U0001F1E6\U0001F1EA", "AED",  12.05),
    "Abu Dhabi":   ("UAE",          "AE", "\U0001F1E6\U0001F1EA", "AED",  12.05),
    "Sharjah":     ("UAE",          "AE", "\U0001F1E6\U0001F1EA", "AED",  12.05),
    "Riyadh":      ("Saudi Arabia", "SA", "\U0001F1F8\U0001F1E6", "SAR",  11.80),
    "Jeddah":      ("Saudi Arabia", "SA", "\U0001F1F8\U0001F1E6", "SAR",  11.80),
    "Doha":        ("Qatar",        "QA", "\U0001F1F6\U0001F1E6", "QAR",  12.18),
    "Muscat":      ("Oman",         "OM", "\U0001F1F4\U0001F1F2", "OMR", 115.20),
    "Kuwait City": ("Kuwait",       "KW", "\U0001F1F0\U0001F1FC", "KWD", 144.30),
}

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def hash_int(s, mod=1000):
    return int(hashlib.md5(s.encode()).hexdigest(), 16) % mod

def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    ws = wb["Jobs"]
    rows = list(ws.iter_rows(values_only=True))
    headers = rows[0]
    raw = [dict(zip(headers, r)) for r in rows[1:]]

    employers_seen = {}
    records = []
    for i, r in enumerate(raw, start=1):
        company = r["Company Name"]
        title   = r["Job Title"]
        domain  = r["Domain"]
        skills  = [s.strip() for s in (r["Key Skills Required"] or "").split(",") if s.strip()]
        salary  = int(r["Salary (INR/month)"])
        benefits_str = r["Other Benefits"] or ""
        benefits = [b.strip() for b in benefits_str.split(",") if b.strip()]
        duration_yrs = int((r["Contract Duration"] or "0").split()[0])
        city = r["Job Location"]
        country, code, flag, currency, rate = CITY_COUNTRY[city]

        eid = employers_seen.setdefault(company, f"emp-{slug(company)}")
        h = hash_int(company + title + str(i), 1000)
        salary_min = int(salary * 0.95)
        salary_max = int(salary * 1.10)
        salary_local_min = round(salary_min / rate)
        salary_local_max = round(salary_max / rate)
        trust = round(3.4 + (h % 16) / 10, 1)
        verified = (h % 5) != 0
        flagged = (h % 13) == 0
        seats = 5 + (h % 35)
        posted_days = (h % 14) + 1
        deadline_days = 14 + (h % 22)
        fee = 5000 * (1 + (h % 8))
        exp = 1 + (h % 5)
        edu = ["No formal requirement","10th Pass","12th Pass","ITI","Diploma"][h % 5]
        lang = ["Basic English","English","Hindi + English","Arabic basics","English + Hindi"][h % 5]
        rec = ["Pravasi Setu Verified Recruiter","Skyline Manpower","GulfBridge Consultancy","Indo-Gulf Hire","Aravali Overseas"][h % 5]

        records.append({
            "id": f"j{i:03d}",
            "title": title,
            "jobRole": title,
            "sector": domain,
            "destinationCountry": country,
            "destinationCity": city,
            "countryCode": code,
            "countryFlag": flag,
            "employerId": eid,
            "employerName": company,
            "recruiterName": rec,
            "agencyName": rec,
            "salaryMin": salary_min,
            "salaryMax": salary_max,
            "salaryAvg": salary,
            "salaryCurrency": "INR",
            "salaryLocalCurrency": currency,
            "salaryLocalMin": salary_local_min,
            "salaryLocalMax": salary_local_max,
            "salaryLabel": f"₹{salary_min:,}–₹{salary_max:,} / mo ({currency} {salary_local_min:,}–{salary_local_max:,})",
            "contractDuration": r["Contract Duration"],
            "contractMonths": duration_yrs * 12,
            "requiredSkills": skills,
            "requiredExperience": f"{exp}+ yrs",
            "requiredExperienceYears": exp,
            "educationRequirement": edu,
            "languageRequirement": lang,
            "benefits": benefits,
            "benefitsLabel": benefits_str,
            "accommodationProvided": any("accommodation" in b for b in benefits),
            "travelProvided": any(t in benefits_str for t in ("flight", "transport")),
            "visaSupport": True,
            "insuranceProvided": any("insurance" in b for b in benefits),
            "mealsProvided": any("meals" in b for b in benefits),
            "serviceFee": fee,
            "agentFee": fee,
            "applicationDeadlineDays": deadline_days,
            "verificationStatus": "Verified" if verified else "Pending review",
            "verified": verified,
            "flagged": flagged,
            "employerTrustScore": trust,
            "trustScore": trust,
            "reviews": 18 + (h * 3 % 220),
            "seats": seats,
            "posted": f"{posted_days}d ago" if posted_days > 1 else "1d ago",
            "source": "migrant_jobs_dataset.xlsx",
            "rawSource": r,
        })

    employers = []
    seen = {}
    desc_pool = {
        "Construction":"Large-scale infrastructure & building contractor across the Gulf.",
        "Healthcare":"Hospital & wellness operator serving expat & local communities.",
        "Hospitality":"Hotel, F&B and guest-services group with multiple GCC properties.",
        "Beauty":"Salon & personal-care chain across GCC cities.",
        "Plumbing":"Specialised MEP & plumbing contractor.",
        "Electrical":"Electrical contracting & maintenance services.",
        "Maintenance":"Facility management & technical maintenance vendor.",
        "Security":"Security & guarding services for malls and residences.",
    }
    for rec in records:
        if rec["employerName"] in seen: continue
        seen[rec["employerName"]] = True
        h = hash_int(rec["employerName"], 100)
        same = [r for r in records if r["employerName"] == rec["employerName"]]
        sectors = sorted({r["sector"] for r in same})
        employers.append({
            "id": rec["employerId"],
            "name": rec["employerName"],
            "sector": sectors[0],
            "country": rec["destinationCountry"],
            "trustScore": round(sum(r["trustScore"] for r in same)/len(same), 1),
            "reviews": 40 + (h * 5 % 240),
            "verified": (h % 5) != 0,
            "flagged": (h % 17) == 0,
            "yearsActive": 4 + (h % 18),
            "openJobs": len(same),
            "description": desc_pool.get(sectors[0], "Verified employer registered with Pravasi Setu."),
            "compliance": {
                "salaryOnTime": (h % 100) > 12,
                "contractTransparent": (h % 100) > 8,
                "accommodationStandard": (h % 100) > 25,
                "safetyCertified": (h % 100) > 18,
            },
        })

    body = []
    body.append("// AUTO-GENERATED from migrant_jobs_dataset.xlsx via scripts/build_migrant_jobs.py.")
    body.append("// Mock/enriched fields are documented in docs/DATA_MAPPING.md.")
    body.append("// Do not edit by hand — re-run the conversion script after dataset updates.")
    body.append("")
    body.append("export const MIGRANT_JOBS = " + json.dumps(records, ensure_ascii=False, indent=2) + ";")
    body.append("")
    body.append("export const MIGRANT_EMPLOYERS = " + json.dumps(employers, ensure_ascii=False, indent=2) + ";")
    body.append("")
    body.append("export const SECTORS = " + json.dumps(sorted({j['sector'] for j in records}), ensure_ascii=False) + ";")
    body.append("")
    body.append("export const DEST_COUNTRIES = " + json.dumps(
        sorted({(j['countryCode'], j['destinationCountry'], j['countryFlag']) for j in records}, key=lambda t:t[1]),
        ensure_ascii=False
    ) + ".map(([code, name, flag]) => ({ code, name, flag }));")
    body.append("")

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(body))
    print(f"wrote {OUT}: {len(records)} jobs, {len(employers)} employers")

if __name__ == "__main__":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    main()
