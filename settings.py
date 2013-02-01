import subprocess
import os
import simplejson as json

class SettingOptions():
    """This is a simple class that writes setting options to files on disk.
    """

    def list(self):
        filepath = 'settings'
        settings = []
        for filename in os.listdir(filepath):
            f = open(filepath + '/' + filename, 'r')
            settingstr = f.read()
            f.close()
            setting = json.loads(settingstr)
            settings.push(setting)

        return settings

    def get(self, settingname):
        path = 'settings/' + settingname

        if not os.access(filepath, os.F_OK):
            return false 

        f = open(filepath + '/' + filename, 'r')
        settingstr = f.read()
        f.close()
        setting = json.loads(settingstr)
        return setting

    def set(self, setting):
        path = 'settings/' + setting['path']

        if not os.access('settings', os.F_OK):
            os.makedirs('settings');
        
        f = open(filepath + '/' + filename, 'r')
        settingstr = f.write(json.dumps(setting))
        f.close()
    
        return True
