# Need zsh for |& and for "for dpi mode in ...". Then need -G to not complain about "no match"
SHELL=/bin/zsh -G

# # Throughout this Makefile, any error should cause the target to be deleted.
# .DELETE_ON_ERROR:

hello.dvi: hello.tex
	tex hello.tex
	rm hello.log

dvi2bitmap = ~/Downloads/dvi2bitmap-1.1rc1/dvi2bitmap
mode = ibmvga
xdpi = 110
ydpi = 110
# Need to round these dpi values to closest integer. E.g. aps 722.909 -> 723
override xdpi := $(shell echo $(xdpi) | awk '{printf("%d\n",$$1 + 0.499)}')
override ydpi := $(shell echo $(ydpi) | awk '{printf("%d\n",$$1 + 0.499)}')
# $(info 'Rounded dpi to $(dpi)')

font-$(mode).pk:
	rm -f ~/Library/texlive/2015/texmf-var/fonts/pk/*/public/cm/*.*pk
# Command invoked by dvi2bitmap
#	mktexpk --dpi $(dpi) --bdpi $(dpi) --mag 1 --mfmode $(mode) cmr10
# Command invoked by dvips
#	mktexpk --mfmode $(mode) --bdpi $(dpi) --mag 1+0/$(dpi) --dpi $(dpi) cmr10
	mktexpk --mfmode $(mode) --bdpi $(xdpi) --mag 1 --dpi $(xdpi) cmr10

# [dvi] -> dvips -> [ps] -> gs -> [pbm]
hello-$(mode).ps: hello.dvi font-$(mode).pk
	dvips -M -V -D$(xdpi) -mode $(mode) hello.dvi -o hello-$(mode).ps > out-$(mode)-dvips.txt 2>&1
# Any output from dvips is a bad sign
	! grep 'dvips:' out-$(mode)-dvips.txt

hello-$(mode).pbm: hello-$(mode).ps
	cat hello-$(mode).ps | gs -sDEVICE=pbm -sOutputFile=hello-$(mode).pbm -r$(xdpi) -
	rm hello-$(mode).ps



# [dvi] -> dvi2bitmap -> [xbm]
hello-$(mode).xbm: width = $(shell echo "$(xdpi) * 8.5" | bc -q)
hello-$(mode).xbm: height = $(shell echo "$(xdpi) * 11" | bc -q) # Yes, xdpi here
hello-$(mode).xbm: hello.dvi font-$(mode).pk
	$(dvi2bitmap) \
		--debug=p \
		--font-gen=off \
		--resolution=$(xdpi) \
		--font-mode=$(mode) \
		--width=$(width) \
		--height=$(height) \
		--process=nocrop hello.dvi \
		-T xbm \
		-o hello-$(mode).xbm \
		> out-$(mode)-d2b.txt 2>&1
	[ `cat out-$(mode)-d2b.txt | \grep --text 'Opened font' | sed -e 's,.*texmf-var/fonts/pk/\(.*\)/public/cm/cmr10.*,\1,'` = $(mode) ]

hello-crop-full: hello.dvi font-$(mode).pk
#		--crop=right=0,bottom=0,absolute,left=0,top=0
	$(dvi2bitmap) \
		--debug=p \
		--font-gen=off \
		--resolution=$(xdpi) \
		--font-mode=$(mode) \
		--crop=left=2,right=2,top=2,bottom=2 \
		-T png \
		hello.dvi \
		-o hello-$(mode)-crop-full.png \
		> out-$(mode)-d2b-crop-full.txt 2>&1
	[ `cat out-$(mode)-d2b-crop-full.txt | \grep --text 'Opened font' | sed -e 's,.*texmf-var/fonts/pk/\(.*\)/public/cm/cmr10.*,\1,'` = $(mode) ]
	file hello-$(mode)-crop-full.png > data-$(mode)-crop-full
	rm hello-$(mode)-crop-full.png

hello-crop-part: hello.dvi font-$(mode).pk
#		--crop=right=0,bottom=0,absolute,left=0,top=0
	$(dvi2bitmap) \
		--debug=p \
		--font-gen=off \
		--resolution=$(xdpi) \
		--font-mode=$(mode) \
		--crop=right=2,bottom=2,absolute,left=0,top=0 \
		-T png \
		hello.dvi \
		-o hello-$(mode)-crop-part.png \
		> out-$(mode)-d2b-crop-part.txt 2>&1
	[ `cat out-$(mode)-d2b-crop-part.txt | \grep --text 'Opened font' | sed -e 's,.*texmf-var/fonts/pk/\(.*\)/public/cm/cmr10.*,\1,'` = $(mode) ]
	file hello-$(mode)-crop-part.png > data-$(mode)-crop-part
	rm hello-$(mode)-crop-part.png


extract_x = $(shell echo "scale = 0; 40 * $(xdpi) / 110" | bc -q)
extract_y = $(shell echo "scale = 0; 20 * $(ydpi) / 110" | bc -q)
offset_x = $(shell echo "scale = 0; 135 * $(xdpi) / 110" | bc -q)
offset_y = $(shell echo "scale = 0; $(xdpi)" | bc -q)
offset_y_d2b = $(shell echo "1 + $(offset_y)" | bc -q)

extract-$(mode)-psgs.png: hello-$(mode).pbm
	convert -verbose 'hello-$(mode).pbm[$(extract_x)x$(extract_y)+$(offset_x)+$(offset_y)]' extract-$(mode)-psgs.png
	# rm hello-$(mode).pbm

extract-$(mode)-d2b.png: hello-$(mode).xbm
	convert -verbose 'hello-$(mode).xbm[$(extract_x)x$(extract_y)+$(offset_x)+$(offset_y)]' extract-$(mode)-d2b.png

extract-$(mode)-d2b-1.png: hello-$(mode).xbm
	convert -verbose 'hello-$(mode).xbm[$(extract_x)x$(extract_y)+$(offset_x)+$(offset_y_d2b)]' extract-$(mode)-d2b-1.png
	# rm hello-$(mode).xbm

compare: extract-$(mode)-d2b-1.png extract-$(mode)-psgs.png # extract-$(mode)-d2b.png
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
	for xdpi ydpi mode in `cat modes/modes.nonsquare`; do echo $$xdpi $$ydpi $$mode; rm -f ~/Library/texlive/2015/texmf-var/fonts/pk/*/public/cm/*.*pk; make mode=$$mode xdpi=$$xdpi ydpi=$$ydpi compare > out-$$mode-make.txt 2>&1; tail -n1 out-$$mode-make.txt; echo; done

all-crop:
	for xdpi ydpi mode in `cat modes/modes.2d.clean`; do echo $$xdpi $$ydpi $$mode; rm -f ~/Library/texlive/2015/texmf-var/fonts/pk/*/public/cm/*.*pk; make mode=$$mode xdpi=$$xdpi ydpi=$$ypdi hello-crop-full hello-crop-part > out-$$mode-make.txt 2>&1; done

# def xy(line):
#     fix = 'PNG image data, '
#     where = line.find(fix)
#     end = ', 1-bit colormap'
#     cross = line[line.find(fix) + len(fix):line.find(end)]
#     cross = cross.split()
#     return cross[0], cross[2]

# for line in modes:
#     xdpi, ydpi, mode = line.split()
#     try:
#         sizeline = open('data-%s-crop-full' % mode).read().strip()
#         offline = open('data-%s-crop-part' % mode).read().strip()
#         xysize = xy(sizeline)
#         xyoff = xy(offline)
#         print mode, xdpi, ydpi, xysize[0], xysize[1], int(xyoff[0]) - int(xysize[0]), int(xyoff[1]) - int(xysize[1])
#     except Exception as e:
#         print e
#         pass

sizex = 18
sizey = 9
offx = 76
offy = 61

just-hello: hello-$(mode).xbm
	convert -verbose 'hello-$(mode).xbm[$(sizex)x$(sizey)+$(offx)+$(offy)]' just-hello-$(mode).png
	rm hello-$(mode).xbm

all-hello:
	for mode xdpi ypdi sizex sizey offx offy in `cat modes/modes.bbox`; do echo $$mode; make mode=$$mode xdpi=$$xdpi ydpi=$$ypdi sizex=$$sizex sizey=$$sizey offx=$$offx offy=$$offy just-hello > out-$$mode-make.txt 2>&1; done
