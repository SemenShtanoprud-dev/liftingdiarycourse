import os, sys
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta

# Read DATABASE_URL from .env if not in environment
def load_env_var(key):
    for filename in [".env.local", ".env"]:
        if os.path.exists(filename):
            with open(filename) as f:
                for line in f:
                    line = line.strip()
                    if line.startswith(key + "=") and not line.startswith("#"):
                        return line[len(key)+1:].strip().strip('"').strip("'")
    return os.environ.get(key)

db_url = load_env_var("DATABASE_URL")
if not db_url:
    sys.exit("ERROR: DATABASE_URL not found in .env or .env.local")

# Ensure SSL for Neon
if "sslmode" not in db_url:
    db_url += "?sslmode=require"

print(f"Connecting to database...")

# Query workouts grouped by month for the past 12 months
import psycopg2
from collections import defaultdict

conn = psycopg2.connect(db_url)
cur = conn.cursor()

now = datetime.now(timezone.utc)
one_year_ago = now - relativedelta(years=1)

cur.execute("""
    SELECT DATE_TRUNC('month', started_at) AS month, COUNT(*) AS count
    FROM workouts
    WHERE started_at >= %s
    GROUP BY month
    ORDER BY month
""", (one_year_ago,))

rows = cur.fetchall()
conn.close()

print(f"Found {sum(int(r[1]) for r in rows)} total workouts in the past 12 months.")

# Build a full 12-month series (fill in months with 0 workouts)
months = {}
for i in range(12):
    month = (one_year_ago + relativedelta(months=i+1)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    key = month.strftime("%b %Y")
    months[key] = 0

for row in rows:
    key = row[0].strftime("%b %Y")
    if key in months:
        months[key] = int(row[1])

# Plot
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker

labels = list(months.keys())
values = list(months.values())

fig, ax = plt.subplots(figsize=(12, 6))
bars = ax.bar(labels, values, color="#4f46e5", edgecolor="white", linewidth=0.5)

ax.set_title("Workouts per Month (Past 12 Months)", fontsize=16, fontweight="bold", pad=16)
ax.set_xlabel("Month", fontsize=12, labelpad=10)
ax.set_ylabel("Number of Workouts", fontsize=12, labelpad=10)
ax.yaxis.set_major_locator(ticker.MaxNLocator(integer=True))
ax.set_ylim(0, max(values) * 1.2 + 1)
plt.xticks(rotation=30, ha="right")

for bar, val in zip(bars, values):
    if val > 0:
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.1,
                str(val), ha="center", va="bottom", fontsize=10, color="#1e1b4b")

plt.tight_layout()
plt.savefig("workout_chart.png", dpi=150, bbox_inches="tight")
print("Chart saved to workout_chart.png")
