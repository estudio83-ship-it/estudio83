set -e
cd /tmp/claude-0/-home-user-estudio83/76984eb5-6892-50fe-8e69-894fe593cd33/scratchpad/build
F=Cartocor_2026_Elementos_de_diseno.pptx
ELEMENTOS=1 NODE_PATH=$PWD/node_modules node deck.js $PWD/$F | tail -1
node fixsvg.js $F
python3 -I agrupar.py $F
python3 -I redondear.py $F
zip -dq $F '*/' 2>/dev/null || true
S=/root/.claude/skills/synced/e9b35989-4a9f-4c50-9016-fd9d1d55533d_95a2d566-ceb3-4477-933e-e0130402a89b/pptx/scripts
python3 $S/office/validate.py $F | tail -2
timeout 300 python3 $S/office/soffice.py --headless --convert-to pdf $F >/dev/null 2>&1
rm -f el-*.jpg; pdftoppm -jpeg -r 50 Cartocor_2026_Elementos_de_diseno.pdf el 2>/dev/null
