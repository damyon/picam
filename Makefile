LIBDIR = $(DESTDIR)/usr/share/pyshared/picam
BINDIR = $(DESTDIR)/usr/sbin
LOCALBINDIR = $(DESTDIR)/usr/local/bin
INITDIR = $(DESTDIR)/etc/init.d
SHAREDIR = $(DESTDIR)/usr/share/picam
WORKDIR = $(DESTDIR)/var/lib/picam
clean:
	rm -f *.py[co] */*.py[co]

install:
	mkdir -p $(LIBDIR)
	mkdir -p $(BINDIR)
	mkdir -p $(INITDIR)
	mkdir -p $(LOCALBINDIR)
	mkdir -p $(SHAREDIR)
	mkdir -p $(WORKDIR)
	cp -r picam/* $(LIBDIR)/
	cp picam.py $(BINDIR)/picam
	cp init.d/picam $(INITDIR)/picam
	chmod 755 $(INITDIR)/picam
	$(CC) -o usbreset/usbreset usbreset/usbreset.c
	cp usbreset/usbreset $(LOCALBINDIR)/usbreset
	cp usbreset/gphoto2 $(LOCALBINDIR)/gphoto2
	chmod 755 $(LOCALBINDIR)/usbreset
	chmod 755 $(LOCALBINDIR)/gphoto2
	cp -r css $(SHAREDIR)/
	cp -r html $(SHAREDIR)/
	cp -r js $(SHAREDIR)/
	cp -r image $(SHAREDIR)/

uninstall:
	rm -rf $(LIBDIR)
	rm -rf $(SHAREDIR)
	rm -f $(BINDIR)/picam
	rm -f $(INITDIR)/picam
	rm -f $(LOCALBINDIR)/usbreset
	rm -f $(LOCALBINDIR)/gphoto2

