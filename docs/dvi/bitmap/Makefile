SHELL=/bin/zsh

.DELETE_ON_ERROR:

hello.dvi: hello.tex
	tex hello.tex
	rm hello.log

mode = ibmvga
dpi = 110

hello-$(mode).pbm: hello.dvi
	! dvips -V -D$(dpi) -mode $(mode) hello.dvi -o hello-$(mode).ps |& tee out-dvips-$(mode).txt | grep 'dvips:'
	cat hello-$(mode).ps | gs -sDEVICE=pbm -sOutputFile=hello-$(mode).pbm -r$(dpi) -
	rm hello-$(mode).ps

hello-$(mode).xbm: width = $(shell echo "$(dpi) * 8.5" | bc -q)
hello-$(mode).xbm: height = $(shell echo "$(dpi) * 11" | bc -q)
hello-$(mode).xbm: hello.dvi
	[ `~/Downloads/dvi2bitmap-1.0/dvi2bitmap \
	--debug=p \
	--resolution=$(dpi) \
	--font-mode=$(mode) \
	--width=$(width) \
	--height=$(height) \
	--process=nocrop hello.dvi \
	-T xbm \
	-o hello-$(mode).xbm \
	|& tee out-d2b-$(mode).txt | \grep 'Opened font' \
	| sed -e 's,.*texmf-var/fonts/pk/\(.*\)/public/cm/cmr10.*,\1,'` = $(mode) ]

extract_x = $(shell echo "scale = 0; 40 * $(dpi) / 110" | bc -q)
extract_y = $(shell echo "scale = 0; 20 * $(dpi) / 110" | bc -q)
offset_x = $(shell echo "scale = 0; 135 * $(dpi) / 110" | bc -q)
offset_y = $(dpi)
offset_y_d2b = $(shell echo "1 + $(dpi)" | bc -q)

extract-$(mode)-psgs.png: hello-$(mode).pbm
	convert -verbose 'hello-$(mode).pbm[$(extract_x)x$(extract_y)+$(offset_x)+$(offset_y)]' extract-$(mode)-psgs.png
	rm hello-$(mode).pbm

extract-$(mode)-d2b.png: hello-$(mode).xbm
	convert -verbose 'hello-$(mode).xbm[$(extract_x)x$(extract_y)+$(offset_x)+$(offset_y)]' extract-$(mode)-d2b.png

extract-$(mode)-d2b-1.png: hello-$(mode).xbm
	convert -verbose 'hello-$(mode).xbm[$(extract_x)x$(extract_y)+$(offset_x)+$(offset_y_d2b)]' extract-$(mode)-d2b-1.png

compare: extract-$(mode)-psgs.png extract-$(mode)-d2b.png extract-$(mode)-d2b-1.png
	rm hello-$(mode).xbm
	compare -metric ae extract-$(mode)-psgs.png extract-$(mode)-d2b.png compare-$(mode)-orig.png; echo
	compare -metric ae extract-$(mode)-psgs.png extract-$(mode)-d2b-1.png compare-$(mode)-shifted.png; echo

clean:
	rm -f *.log
	rm -f *.png *.xbm *.pbm *.gif
	rm -f *.ps
	rm -f *.dvi
	rm -f out-*.txt
	rm -f ~/Library/texlive/2015/texmf-var/fonts/pk/*/public/cm/*.*pk


# sed -e :a -e '$!N;s/mode_def \([^ ]*\) =.*\n.*pixels_per_inch, \(.*\));/\2 \1 xyzzy/;ta' -e 'P;D' /usr/local/texlive/2015/texmf-dist/metafont/misc/modes.mf | \grep xyzzy | sort -n | sed -e s/xyzzy//

# for dpi mode in $(cat modes.ok); do echo $dpi $mode; make mode=$mode dpi=$dpi compare > out-$mode-$dpi.txt 2>&1 || break; tail -n3 out-$mode-$dpi.txt | head -n1; tail -n1 out-$mode-$dpi.txt; echo; done
