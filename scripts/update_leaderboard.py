#!/usr/bin/env python3
"""
Generate corrected MUnitQuest Codabench leaderboards.
Author: OpenAI ChatGPT
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from html import escape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import json
import os
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "_includes" / "leaderboard.html"

LEADERBOARD_URL = os.environ.get("CODABENCH_LEADERBOARD_URL", "").strip()

PHASES = {
    "familiarization": "Familiarization",
    "showdown": "Showdown",
}

TASKS = {
    "isometric": "Isometric",
    "dynamic": "Dynamic",
}


def fetch_json(url: str) -> dict:
    """Fetch the public leaderboard JSON."""
    if not url:
        raise RuntimeError(
            "Set CODABENCH_LEADERBOARD_URL to the public "
            "Codabench leaderboard JSON endpoint."
        )

    token: str = os.environ.get("CODABENCH_API_TOKEN", None)
    if token is None:
        raise RuntimeError("No API token available!")

    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "MUnitQuest-Leaderboard/1.0",
            "Authorization": f"Token {token}"
        },
    )

    try:
        with urlopen(request, timeout=30) as response:
            if response.status != 200:
                raise RuntimeError(
                    f"Codabench returned HTTP {response.status}."
                )
            payload = json.load(response)
    except (HTTPError, URLError, TimeoutError) as exc:
        raise RuntimeError(
            f"Could not retrieve the Codabench leaderboard: {exc}"
        ) from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "The Codabench endpoint did not return valid JSON."
        ) from exc

    if not isinstance(payload, dict) or not payload:
        raise RuntimeError("The leaderboard JSON is empty or invalid.")

    return payload


def parse_score(value: object) -> Decimal | None:
    """Return a finite numeric score, or None for missing/invalid values."""
    if value is None:
        return None

    text = str(value).strip()
    if not text:
        return None

    try:
        score = Decimal(text)
    except InvalidOperation:
        return None

    if not score.is_finite():
        return None

    return score


def participant_name(submission_id: str) -> str:
    """Convert a Codabench submission key to its participant key.

    Assumption: Codabench appends a hyphen and numeric submission ID,
    e.g. 'ghazi2026-930824'.

    Adjust this function if the endpoint uses a different naming scheme.
    """
    return re.sub(r"-\d+$", "", submission_id)


def find_metric(metrics, task_key, metric_name):
    task_key = task_key.casefold()
    metric_name = metric_name.casefold()

    suffixes = {
        "score": "-score",
        "average f1-score": "-average f1-score",
    }

    if metric_name not in suffixes:
        raise ValueError(f"Unknown metric: {metric_name!r}")

    suffix = suffixes[metric_name]
    matches = []

    for key, value in metrics.items():
        normalized = str(key).casefold()

        if task_key not in normalized:
            continue

        if not normalized.endswith(suffix):
            continue

        # "-average f1-score" also ends with "-score".
        if (
            metric_name == "score"
            and normalized.endswith("-average f1-score")
        ):
            continue

        score = parse_score(value)
        if score is not None:
            matches.append(score)

    if len(matches) > 1:
        raise RuntimeError(
            f"Ambiguous metric {metric_name!r} "
            f"for task {task_key!r}: {matches}"
        )

    return matches[0] if matches else None


def extract_phase_name(leaderboard_name: str) -> str | None:
    name = leaderboard_name.casefold()

    for key, label in PHASES.items():
        if key in name:
            return label

    return None


def extract_task_results(
    phase_data: dict,
) -> dict[str, dict[str, dict]]:
    """Select the best submission independently for each participant/task.

    Output:
        task -> participant -> {"score": Decimal, "f1": Decimal | None}
    """
    best: dict[str, dict[str, dict]] = {
        task_key: {} for task_key in TASKS
    }

    for submission_id, metrics in phase_data.items():
        if not isinstance(metrics, dict):
            continue

        participant = participant_name(str(submission_id))

        for task_key in TASKS:
            score = find_metric(metrics, task_key, "Score")
            f1 = find_metric(metrics, task_key, "Average F1-Score")

            # An empty score means this submission has no result
            # for this task. It must not overwrite a valid result.
            if score is None:
                continue

            current = best[task_key].get(participant)

            # Highest Score wins. For equal Scores, use higher F1
            # as a deterministic secondary criterion.
            candidate_key = (
                score,
                f1 if f1 is not None else Decimal("-Infinity"),
            )

            if current is None:
                best[task_key][participant] = {
                    "score": score,
                    "f1": f1,
                }
                continue

            current_key = (
                current["score"],
                (
                    current["f1"]
                    if current["f1"] is not None
                    else Decimal("-Infinity")
                ),
            )

            if candidate_key > current_key:
                best[task_key][participant] = {
                    "score": score,
                    "f1": f1,
                }

    return best


def format_decimal(value: Decimal | None) -> str:
    if value is None:
        return "—"
    return format(value, "f")


def rank_results(results: dict[str, dict]) -> list[dict]:
    """Sort by score descending, then F1 descending, then participant."""
    entries = [
        {
            "participant": participant,
            "score": metrics["score"],
            "f1": metrics["f1"],
        }
        for participant, metrics in results.items()
    ]

    entries.sort(
        key=lambda item: (
            -item["score"],
            -(
                item["f1"]
                if item["f1"] is not None
                else Decimal("-Infinity")
            ),
            item["participant"].casefold(),
        )
    )

    # Competition ranking: 1, 1, 3 for tied primary scores.
    previous_score = None
    rank = 0

    for index, item in enumerate(entries, start=1):
        if item["score"] != previous_score:
            rank = index
            previous_score = item["score"]

        item["rank"] = rank

    return entries


def render_table(entries: list[dict]) -> str:
    if not entries:
        return '<p class="leaderboard-empty">No scored submissions yet.</p>'

    rows = []

    for item in entries:
        rows.append(
            "<tr>"
            f"<td>{item['rank']}</td>"
            f"<td>{escape(item['participant'])}</td>"
            f"<td>{escape(format_decimal(item['score']))}</td>"
            f"<td>{escape(format_decimal(item['f1']))}</td>"
            "</tr>"
        )

    return (
        '<div class="leaderboard-table-wrapper">'
        '<table class="corrected-leaderboard-table">'
        "<thead><tr>"
        "<th>Rank</th>"
        "<th>Participant</th>"
        "<th>Score</th>"
        "<th>Average F1-Score</th>"
        "</tr></thead>"
        f"<tbody>{''.join(rows)}</tbody>"
        "</table></div>"
    )


def render_leaderboard(payload: dict) -> str:
    """Render phase tabs, each containing separate task leaderboards."""
    phase_results: dict[str, dict] = {
        phase: {
            task: {}
            for task in TASKS
        }
        for phase in PHASES.values()
    }

    recognized_phases = set()

    for leaderboard_name, phase_data in payload.items():
        phase = extract_phase_name(str(leaderboard_name))

        if phase is None:
            continue

        recognized_phases.add(phase)

        if not isinstance(phase_data, dict):
            raise RuntimeError(
                f"Invalid leaderboard data for {leaderboard_name!r}."
            )

        task_results = extract_task_results(phase_data)

        for task in TASKS:
            phase_results[phase][task] = task_results[task]

    if not recognized_phases:
        raise RuntimeError(
            "No recognized Familiarization or Showdown leaderboard "
            "was found. Check the JSON structure and phase names."
        )

    # Render tabs in a fixed order, even when a phase is empty.
    sections = []
    tab_buttons = []

    for index, phase in enumerate(PHASES.values()):
        active = " active" if index == 0 else ""
        hidden = "" if index == 0 else " hidden"
        panel_id = f"leaderboard-phase-{index}"

        tab_buttons.append(
            f'<button type="button" class="leaderboard-tab{active}" '
            f'role="tab" id="leaderboard-tab-{index}" '
            f'aria-controls="{panel_id}" '
            f'aria-selected="{str(index == 0).lower()}" '
            f'tabindex="{0 if index == 0 else -1}" '
            f'data-tab-index="{index}">{escape(phase)}</button>'
        )

        task_sections = []

        for task_key, task_label in TASKS.items():
            entries = rank_results(
                phase_results[phase][task_key]
            )

            task_sections.append(
                f"<section class='leaderboard-task'>"
                f"<h4>{escape(task_label)}</h4>"
                f"{render_table(entries)}"
                f"</section>"
            )

        sections.append(
            f'<div class="leaderboard-panel{hidden}" '
            f'role="tabpanel" id="{panel_id}" '
            f'aria-labelledby="leaderboard-tab-{index}" '
            f'{"hidden" if index != 0 else ""}>'
            f"<h3>{escape(phase)}</h3>"
            f"{''.join(task_sections)}"
            f"</div>"
        )

    updated = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    return f"""<!-- Generated automatically. Do not edit manually. -->
<div class="corrected-leaderboard">
  <p class="leaderboard-updated">
    Last successful update: {escape(updated)}
  </p>

  <div class="leaderboard-tabs" role="tablist"
       aria-label="Competition phase">
    {''.join(tab_buttons)}
  </div>

  {''.join(sections)}

  <p class="leaderboard-source">
    Results are aggregated by participant. The best score per task
    is shown; F1-Score breaks ties when available.
    <a href="https://www.codabench.org/">Codabench</a>
  </p>
</div>

<style>
.corrected-leaderboard {{
  margin: 1.5rem 0;
}}
.leaderboard-tabs {{
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1.25rem;
}}
.leaderboard-tab {{
  padding: 0.7rem 1rem;
  border: 1px solid #ddd;
  border-bottom: 0;
  border-radius: 6px 6px 0 0;
  background: #f3f5f7;
  color: #000;
  cursor: pointer;
  font: inherit;
}}
.leaderboard-tab.active,
.leaderboard-tab[aria-selected="true"] {{
  background: #fff;
  color: #000 !important;
  font-weight: 700;
  box-shadow: inset 0 -3px #365f91;
}}
.leaderboard-panel[hidden] {{
  display: none;
}}
.leaderboard-task {{
  margin: 1.5rem 0;
}}
.leaderboard-table-wrapper {{
  max-width: 100%;
  overflow-x: auto;
}}
.corrected-leaderboard-table {{
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}}
.corrected-leaderboard-table th,
.corrected-leaderboard-table td {{
  padding: 0.65rem 0.8rem;
  border-bottom: 1px solid #ddd;
  text-align: left;
}}
.corrected-leaderboard-table th {{
  background: #f3f5f7;
}}
.corrected-leaderboard-table tbody tr:hover {{
  background: #f8f9fa;
}}
.leaderboard-empty,
.leaderboard-updated,
.leaderboard-source {{
  color: #666;
  font-size: 0.875rem;
}}
@media (max-width: 600px) {{
  .corrected-leaderboard-table {{
    font-size: 0.85rem;
  }}
  .corrected-leaderboard-table th,
  .corrected-leaderboard-table td {{
    padding: 0.5rem;
    white-space: nowrap;
  }}
}}
</style>

<script>
(function () {{
  const root = document.currentScript
    ? document.currentScript.previousElementSibling
    : null;
  // The generated script is below the leaderboard markup.
  const container = document.querySelector(
    '.corrected-leaderboard:not([data-tabs-ready])'
  );
  if (!container) return;
  container.dataset.tabsReady = 'true';

  const tabs = Array.from(container.querySelectorAll('.leaderboard-tab'));
  const panels = Array.from(container.querySelectorAll('.leaderboard-panel'));

  function activate(index) {{
    tabs.forEach((tab, i) => {{
      const selected = i === index;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      panels[i].hidden = !selected;
    }});
  }}

  tabs.forEach((tab, index) => {{
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', event => {{
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {{
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const next = (index + direction + tabs.length) % tabs.length;
        activate(next);
        tabs[next].focus();
      }}
    }});
  }});
}})();
</script>
"""


def main() -> None:
    payload = fetch_json(LEADERBOARD_URL)
    document = render_leaderboard(payload)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(document, encoding="utf-8")

    print(f"Updated {OUTPUT}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
