#!/bin/bash
# Waits for the in-flight real/web job, then runs the no-LLM finishing steps. One log: build/validate/run_rest.log
cd "$(dirname "$0")/.."
while ! grep -q "^done" /private/tmp/claude-501/-Users-jason-Documents/057c5b3e-5b44-4564-b40f-cec871860c7f/tasks/b5yt1byo2.output 2>/dev/null; do sleep 30; done
echo "== real run2 summary"; grep -c "^OK" build/validate/real_run2.log; grep -v "^OK" build/validate/real_run2.log | cut -c1-200
echo "== web sup2"; cut -c1-200 build/validate/web_run_sup2.log
echo "== facts"; python3 build/transform/facts_fix.py
echo "== structured"; python3 build/generate/structured.py
echo "== validate"; python3 build/validate/validate.py
echo "ALL_DONE $?"
