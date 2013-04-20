import subprocess
import os
import re
import simplejson as json
import glob

class GPhoto2():
    """This is a wrapper class for gphoto2 functions that call gphoto2 in a shell.
    """

    def listCameras(self):
        output = subprocess.check_output(["gphoto2", "--auto-detect"])

        result = [] 
        for line in output.split('\n')[2:-1]:
            result.append({'Camera' : (' '.join(line.strip().split(' ')[:-1])), 
                           'Port' : (' '.join(line.strip().split(' ')[-1:]))})

        return result

    def listCameraSettings(self):
        output = subprocess.check_output(["gphoto2", "--list-all-config"])

        result = [] 
        setting = None
        for line in output.split('\n')[:-1]:
            keyvalue = line.split(':')
            if line[0] == '/':
                if setting:
                    result.append(setting)
                setting = { 'path' : line.strip().replace('/', '_') }
            elif len(keyvalue) > 1:
                key = keyvalue[0].strip()
                value = keyvalue[1].strip()
                if key in setting:
                    if isinstance(setting[key], list):
                        setting[key].append(value)
                    else:
                        setting[key] = [ setting[key], value]
                else:
                    setting[key] = value

        if setting:
            result.append(setting)
        return result

    def getSettingFromCache(self, path):
        filepath = '/var/lib/picam/cache/settings/' + path.replace('/', '_')

        try:
            f = open(filepath, 'r')
            jsonstr = f.read()
            f.close()
        except IOError:
            return False
        setting = json.loads(jsonstr)
        return setting

    def cacheSetting(self, setting):
        path = setting['path']
        filepath = '/var/lib/picam/cache/settings/' + path.replace('/', '_')

        try:
            os.makedirs('/var/lib/picam/cache/settings')
        except OSError as e:
            pass

        try:
            f = open(filepath, 'w')
            jsonstr = json.dumps(setting)
            f.write(jsonstr)
            f.close()
        except IOError:
            return False

        return True

    def getCameraSetting(self, path):
        setting = self.getSettingFromCache(path)
        if setting:
            return setting
        setting = { 'path' : path }
        path = path.replace('_', '/')
        print("gphoto2 --get-config " + path)
        output = subprocess.check_output(["gphoto2", "--get-config", path])

        for line in output.split('\n')[:-1]:
            keyvalue = line.split(':')
            if len(keyvalue) > 1:
                key = keyvalue[0].strip()
                value = keyvalue[1].strip()
                if key in setting:
                    if isinstance(setting[key], list):
                        setting[key].append(value)
                    else:
                        setting[key] = [ setting[key], value]
                else:
                    setting[key] = value

        if not 'Type' in setting:
            self.cacheSetting(setting)

        return setting

    def setCameraSetting(self, path, value):
        setting = { 'path' : path }
        path = path.replace('_', '/')
        try:
            print(["gphoto2", "--set-config", path + '=' + value])
            result = subprocess.check_output(["gphoto2", "--set-config", path + '=' + value], stderr=subprocess.STDOUT)
            print(result)
        except subprocess.CalledProcessError as e:
            print(e)
            result = ['Error']

        return not 'Error' in result

    def listFiles(self):
        output = subprocess.check_output(["gphoto2", "--list-files"])
        files = []

        lastfolder = '' 
        for line in output.split('\n')[:-1]:
            if (line[0] == '#'):
                infolist = line.split()
                filename = infolist[1]
                filesize = infolist[3]
                
                files.append({ 'Filename' : filename, 'Filesize' : filesize })
            else:
                # It's a folder
                lastfolder = line.split('\'')[1]
                

        return files
    
    def getThumbnail(self, path):
        imagename = path.split('/')[-1].split('.')[0] + '.jpg'

        cachepath = '/var/lib/picam/cache/thumbs/' + imagename

        if os.path.isfile(cachepath):
            return imagename

        try:
            os.makedirs('/var/lib/picam/cache/thumbs')
        except OSError as e:
            pass

        output = subprocess.check_output(["gphoto2", "--get-all-thumbnails", "--filename=/var/lib/picam/cache/thumbs/%f.jpg"])

        if os.path.isfile(cachepath):
            return imagename

        return False
    
    def getJpeg(self, path):
        imagename = path.split('/')[-1].split('.')[0] + '.jpg'
        cameraimagename = path.split('/')[-1].split('.')[0]
        rawimagename = ''

        files = self.listFiles()

        fileindex = 0
        for i in range(0, len(files)):
            print(cameraimagename)
            print(files[i]['Filename'])
            if (cameraimagename in files[i]['Filename']):
                fileindex = i+1
                rawimagename = files[i]['Filename']

        cachepath = '/var/lib/picam/cache/jpegs/' + rawimagename

        if os.path.isfile(cachepath):
            if '.jpg' in rawimagename.lower():
                return rawimagename
            else:
                jpgimagename = rawimagename + '.jpg'
                if os.path.isfile('/var/lib/picam/cache/jpegs/' + jpgimagename):
                    return jpgimagename

        try:
            os.makedirs('/var/lib/picam/cache/jpegs')
        except OSError as e:
            pass

        output = subprocess.check_output(["gphoto2", "--get-file", str(fileindex), "--filename=/var/lib/picam/cache/jpegs/" + rawimagename])

        if not os.path.isfile(cachepath):
            print('File not downloaded')
            return False

        if '.jpg' in rawimagename.lower():
            print('File was jpg already')
            return rawimagename

        # Need a conversion to jpeg
        jpgimagename = rawimagename + '.jpg'

        output = subprocess.check_output(["ufraw-batch", "--out-type=jpg", '--overwrite', '--size=1000x750', '--output=/var/lib/picam/cache/jpegs/' + jpgimagename, '/var/lib/picam/cache/jpegs/' + rawimagename])

        if os.path.isfile('/var/lib/picam/cache/jpegs/' + jpgimagename):
            return jpgimagename

        print('jpg not created')
        return False
        
    def takePhoto(self):
        # Save a copy to cameras sd card so we can download it
        output = subprocess.check_output(["gphoto2", "--set-config", "capturetarget=1"])

        output = subprocess.check_output(["gphoto2", "--capture-image"])
        # Output will contain: New file is in location /store_00010001/capt0000.nef on the camera
        print(output)

        if not 'on the camera' in output:
            return False

        # Get the file name from the output

        output = re.sub('.*in location', '', output)
        output = re.sub('on the camera.*', '', output)
        output = re.sub('.*/', '', output)

        newimagefile = output.strip().lower()

        # now call list files to get the number of the file to pass to get-file
        output = subprocess.check_output("gphoto2 --list-files|grep -i " + newimagefile, shell=True)
        print(output)

        output = re.sub('#', '', output)
        output = re.sub(' .*', '', output)

        imagenumber = output

        output = subprocess.check_output(["gphoto2", "--get-file", imagenumber, "--filename", "/var/lib/picam/cache/" + newimagefile])
        print(output)

        if not '.jpg' in newimagefile:
            output = subprocess.check_output(["ufraw-batch", "--out-type=jpg", '--overwrite', '--size=1000x750', '--output=/var/lib/picam/cache/' + newimagefile + '.jpg', '/var/lib/picam/cache/' + newimagefile])

            try:
                os.remove('/var/lib/picam/cache/' + newimagefile)
            except OSError:
                pass

            newimagefile = newimagefile + '.jpg'

        try:
            os.remove('/var/lib/picam/cache/preview.jpg')
            os.rename('/var/lib/picam/cache/' + newimagefile, '/var/lib/picam/cache/preview.jpg')
        except OSError:
            pass

        return True

    def takePreview(self):
        previewfile = "/var/lib/picam/cache/preview.jpg"
        try:
            os.remove(previewfile)
        except OSError:
            pass
        
        output = subprocess.check_output(["gphoto2", "--capture-preview", "--stdout", ])

        return True

    def startPreviews(self):

        files = glob.glob('/var/lib/picam/preview/*.jpg')

        for previewfile in files:
            try:
                os.remove(previewfile)
            except OSError:
                pass

        # Now start the gphoto -> avconv pipe
        shellcommand = 'gphoto2 --capture-movie --stdout | avconv -f mjpeg -timelimit 60 -i pipe:0 -vsync 1 -r 1 /var/lib/picam/preview/preview%02d.jpg'
        print(shellcommand)
        output = subprocess.Popen(shellcommand, shell=True)

        return True

    def getLastPreview(self):
        files = glob.glob('/var/lib/picam/preview/*.jpg')

        files.sort()

        last = False

        if (files):
            last = files.pop()

            return os.path.basename(last)
        return last


    
