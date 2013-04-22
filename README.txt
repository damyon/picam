App to control a camera via USB over the web.

Debian install packages are available from the package folder, to install
type:

dpkg -i picam_*.deb
apt-get -f install

This will install the package, then fix any missing dependencies and when
all the dependencies are installed it will configure the package.

Once installed, picam should run at startup - reboot and you should be able
to connect to the webserver running on port 80.

e.g. http://<mypiaddress>/

This install uses some room on the sdcard for cache, you can clear it with

rm -rf /var/lib/picam/*
