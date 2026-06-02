#!/usr/bin/env bash
# Generiert alle PDFs neu aus ihren HTML-Quellen.
# Aufruf: ./build_pdf.sh                    (baut beide)
#         ./build_pdf.sh offene_punkte      (baut nur offene_punkte.pdf)
#         ./build_pdf.sh was_wir_noch_brauchen
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

render() {
  local name="$1"
  local html="$DIR/${name}.html"
  local pdf="$DIR/${name}.pdf"
  if [ ! -f "$html" ]; then
    echo "Warnung: $html nicht gefunden, überspringe."
    return
  fi
  rm -f "$pdf"
  "$CHROME" --headless --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$pdf" \
    "file://$html" 2>&1 | tail -1
  echo "PDF aktualisiert: $pdf"
}

if [ $# -eq 0 ]; then
  render "offene_punkte"
  render "was_wir_noch_brauchen"
  render "fragebogen_kunde"
else
  for name in "$@"; do
    render "$name"
  done
fi
