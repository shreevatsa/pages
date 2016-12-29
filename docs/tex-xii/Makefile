all:
	tex xii.tex
	dvitype xii.dvi > xii.dvitype
	sed -i.bak "9d" xii.dvitype
	rm xii.dvitype.bak
	sed -i .bak "1d" xii.log
	rm xii.log.bak
	git status
