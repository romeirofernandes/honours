# AGENTS.md - Engineering & Architecture Rules

## Core Philosophy: Karpathy Guidelines + Ponytail Mode (`full`)

1. **Think Before Coding**:
   - State assumptions explicitly in code/docs.
   - Surface trade-offs between model complexity, latency, and interpretability.
2. **Simplicity First & Ponytail Ladder**:
   - Use standard library and native platform controls (`<input type="range">`, semantic buttons, native table structures) before reaching for heavy third-party abstractions.
   - Keep backend in a clean, minimal file hierarchy (`backend/train_and_eda.py`, `backend/main.py`, `backend/test_backend.py`) with zero unnecessary wrapper classes or factory boilerplate.
   - Annotate deliberate pragmatic shortcuts with `# ponytail: ...` or `// ponytail: ...` comments explaining the ceiling and upgrade path.
3. **Surgical Precision**:
   - Every line of code must trace directly to the CDC Diabetes Risk Prediction Dashboard & Mini Project rubric requirements.
4. **Goal-Driven Verification**:
   - Leave a runnable `assert`-based self-check (`backend/test_backend.py`) that verifies dataset artifacts, API endpoints, prediction bounds, explainability contributions, and what-if simulation accuracy.
   - Verify frontend responsiveness, typography scale, border-radius limits (`rounded-md` max), and interactive flows via Chrome DevTools MCP.
