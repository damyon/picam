import subprocess

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

    def getCameraSetting(self, path):
        setting = { 'path' : path }
        path = path.replace('_', '/')
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

        return setting

    def setCameraSetting(self, path, value):
        setting = { 'path' : path }
        path = path.replace('_', '/')
        output = subprocess.check_output(["gphoto2", "--set-config", path + '=' + value])
    
        return True
