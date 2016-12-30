all:
	tex xii.tex
	dvitype xii.dvi > xii.dvitype
	sed -i.bak "9d" xii.dvitype
	rm xii.dvitype.bak
	sed -i .bak "1d" xii.log
	rm xii.log.bak

	tex twelve.tex
	dvitype twelve.dvi > twelve.dvitype
	sed -i.bak "9d" twelve.dvitype
	rm twelve.dvitype.bak
	sed -i .bak "1d" twelve.log
	rm twelve.log.bak

	git status
