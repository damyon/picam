LIBDIR = $(DESTDIR)/usr/share/pyshared/picam
BINDIR = $(DESTDIR)/usr/bin
clean:
	rm -f *.py[co] */*.py[co]

install:
	mkdir -p $(LIBDIR)
	mkdir -p $(BINDIR)
	cp -r picam $(LIBDIR)/
	cp picam.py $(BINDIR)/picam

uninstall:
	rm -rf $(LIBDIR)
	rm -f $(BINDIR)/picam

