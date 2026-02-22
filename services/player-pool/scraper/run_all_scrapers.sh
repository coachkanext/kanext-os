#!/bin/bash
# Run all scrapers in detached screen sessions — survives terminal closure.
# Usage: cd services/player-pool/scraper && bash run_all_scrapers.sh
#
# Monitor:  screen -ls                    (list sessions)
#           screen -r scrape-espn         (attach to ESPN session)
#           tail -f logs/*.log            (tail all logs)
# Kill all: screen -ls | grep scrape | awk '{print $1}' | xargs -I{} screen -X -S {} quit

DIR="$(cd "$(dirname "$0")" && pwd)"
LOGS="$DIR/logs"
mkdir -p "$LOGS"

echo "=== Starting all scrapers via screen ($(date)) ==="

# ── Parallel-safe scrapers (different hosts) ──

screen -dmS scrape-espn bash -c "cd '$DIR' && python3 espn_scraper.py all 2>&1 | tee '$LOGS/espn.log'"
echo "  ESPN NCAA D1     → screen: scrape-espn"

screen -dmS scrape-naia bash -c "cd '$DIR' && python3 scraper.py naia 2>&1 | tee '$LOGS/naia.log'"
echo "  NAIA             → screen: scrape-naia"

screen -dmS scrape-cccaa bash -c "cd '$DIR' && python3 scraper.py cccaa 2>&1 | tee '$LOGS/cccaa.log'"
echo "  CCCAA            → screen: scrape-cccaa"

screen -dmS scrape-uscaa bash -c "cd '$DIR' && python3 scraper.py uscaa 2>&1 | tee '$LOGS/uscaa.log'"
echo "  USCAA            → screen: scrape-uscaa"

# ── NJCAA: same host, chained D1 → D2 → D3 ──
screen -dmS scrape-njcaa bash -c "
  cd '$DIR'
  echo '=== NJCAA D1 starting ===' | tee -a '$LOGS/njcaa.log'
  python3 scraper.py division div1 2>&1 | tee -a '$LOGS/njcaa.log'
  echo '=== NJCAA D1 done, starting D2 ===' | tee -a '$LOGS/njcaa.log'
  python3 scraper.py division div2 2>&1 | tee -a '$LOGS/njcaa.log'
  echo '=== NJCAA D2 done, starting D3 ===' | tee -a '$LOGS/njcaa.log'
  python3 scraper.py division div3 2>&1 | tee -a '$LOGS/njcaa.log'
  echo '=== ALL NJCAA DONE ===' | tee -a '$LOGS/njcaa.log'
"
echo "  NJCAA D1→D2→D3   → screen: scrape-njcaa"

echo ""
echo "All scrapers launched in screen sessions."
echo "SAFE TO CLOSE TERMINAL — scrapers will keep running."
echo ""
echo "Commands:"
echo "  screen -ls                     # list all sessions"
echo "  screen -r scrape-espn          # attach to ESPN"
echo "  tail -f $LOGS/*.log            # watch all logs"
