#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
mkdir -p quality-reports
: "${SONAR_HOST_URL:?SONAR_HOST_URL is required}"
: "${SONAR_TOKEN:?SONAR_TOKEN is required}"
sonar-scanner-npm \
  -Dsonar.host.url="$SONAR_HOST_URL" \
  -Dsonar.projectVersion="$(node -p 'require("./package.json").version')" \
  -Dsonar.qualitygate.wait=false
cp .scannerwork/report-task.txt quality-reports/report-task.txt
