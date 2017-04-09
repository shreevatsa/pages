# Need zsh for |& and for "for dpi mode in ...". Then need -G to not complain about "no match"
SHELL=/bin/zsh -G

# # Throughout this Makefile, any error should cause the target to be deleted.
# .DELETE_ON_ERROR:

hello.dvi: hello.tex
	tex hello.tex
	rm hello.log

mode = ibmvga
dpi = 110
override dpi := $(shell echo $(dpi) | awk '{printf("%d\n",$$1 + 0.499)}')
$(info 'Rounded dpi to $(dpi)')

font-$(mode).pk:
# Command invoked by dvi2bitmap
#	mktexpk --dpi $(dpi) --bdpi $(dpi) --mag 1 --mfmode $(mode) cmr10
# Command invoked by dvips
#	mktexpk --mfmode $(mode) --bdpi $(dpi) --mag 1+0/$(dpi) --dpi $(dpi) cmr10
	mktexpk --mfmode $(mode) --bdpi $(dpi) --mag 1 --dpi $(dpi) cmr10

# [dvi] -> dvips -> [ps] -> gs -> [pbm]
hello-$(mode).ps: hello.dvi font-$(mode).pk
	dvips -M -V -D$(dpi) -mode $(mode) hello.dvi -o hello-$(mode).ps > out-$(mode)-dvips.txt 2>&1
# Any output from dvips is a bad sign
	! grep 'dvips:' out-$(mode)-dvips.txt

hello-$(mode).pbm: hello-$(mode).ps
	cat hello-$(mode).ps | gs -sDEVICE=pbm -sOutputFile=hello-$(mode).pbm -r$(dpi) -
	rm hello-$(mode).ps

# [dvi] -> dvi2bitmap -> [xbm]
hello-$(mode).xbm: width = $(shell echo "$(dpi) * 8.5" | bc -q)
hello-$(mode).xbm: height = $(shell echo "$(dpi) * 11" | bc -q)
hello-$(mode).xbm: hello.dvi font-$(mode).pk
	~/Downloads/dvi2bitmap-1.0/dvi2bitmap \
		--debug=p \
		--font-gen=off \
		--resolution=$(dpi) \
		--font-mode=$(mode) \
		--width=$(width) \
		--height=$(height) \
		--process=nocrop hello.dvi \
		-T xbm \
		-o hello-$(mode).xbm \
		> out-$(mode)-d2b.txt 2>&1
	[ `cat out-$(mode)-d2b.txt | \grep --text 'Opened font' | sed -e 's,.*texmf-var/fonts/pk/\(.*\)/public/cm/cmr10.*,\1,'` = $(mode) ]

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

compare: extract-$(mode)-d2b-1.png extract-$(mode)-psgs.png # extract-$(mode)-d2b.png
	rm hello-$(mode).xbm
#	compare -metric ae extract-$(mode)-psgs.png extract-$(mode)-d2b.png compare-$(mode)-orig.png; echo
	compare -metric ae extract-$(mode)-psgs.png extract-$(mode)-d2b-1.png compare-$(mode)-shifted.png; echo

clean:
	- rm -f *.log
	- rm -f *.png *.xbm *.pbm *.gif
	- rm -f *.ps
#	- rm -f *.dvi
	- rm -f out-*.txt
	- rm -f -v ~/Library/texlive/2015/texmf-var/fonts/pk/*/public/cm/*.*pk


# sed -e :a -e '$!N;s/mode_def \([^ ]*\) =.*\n.*pixels_per_inch, \(.*\));/\2 \1 xyzzy/;ta' -e 'P;D' /usr/local/texlive/2015/texmf-dist/metafont/misc/modes.mf | \grep xyzzy | sort -n | sed -e s/xyzzy//

all:
	for dpi mode in `tail -n3 modes/modes.clean`; do echo $$dpi $$mode; rm -f ~/Library/texlive/2015/texmf-var/fonts/pk/*/public/cm/*.*pk; make mode=$$mode dpi=$$dpi compare > out-$$mode-$$dpi.txt 2>&1; tail -n1 out-$$mode-$$dpi.txt; echo; done
