import subprocess
import os
import simplejson as json

class SettingOptions():
    """This is a simple class that writes setting options to files on disk.
    """

    def list(self):
        filepath = '/var/lib/picam/settings'
        settings = []
        try: 
            for filename in os.listdir(filepath):
                f = open(filepath + '/' + filename, 'r')
                settingstr = f.read()
                f.close()
                setting = json.loads(settingstr)
                settings.append(setting)
        except IOError:
            pass

        return settings

    def get(self, settingname):
        path = '/var/lib/picam/settings/' + settingname

        try:
            f = open(path, 'r')
            settingstr = f.read()
            f.close()
        except IOError:
            return False
        setting = json.loads(settingstr)
        return setting

    def set(self, setting):
        path = '/var/lib/picam/settings/' + setting['path']

        try:
            os.makedirs('/var/lib/picam/settings');
        except OSError:
            pass
        
        f = open(path, 'w')
        settingstr = f.write(json.dumps(setting))
        f.close()
    
        return True
