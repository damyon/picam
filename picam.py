#!/usr/bin/python

from bottle import get, post, put, route, run, static_file, request
import simplejson as json
import gphoto2
import settings

@get('/rest/cameras')
def list_cameras():
    g = gphoto2.GPhoto2()   

    result = g.listCameras()

    return json.dumps(result, indent=4)

@post('/rest/photos')
@put('/rest/photos')
def take_photo():
    g = gphoto2.GPhoto2() 

    result = g.takePhoto()

    return json.dumps(result, indent=4)

@get('/rest/jpegs/<path>')
def get_jpeg(path):
    g = gphoto2.GPhoto2()   

    result = g.getJpeg(path)

    if result:
        return static_file(result, root='cache/jpegs')
    else:
        return json.dumps(result, indent=4)

@get('/rest/thumbnails/<path>')
def get_thumbnail(path):
    g = gphoto2.GPhoto2()   

    result = g.getThumbnail(path)

    if result:
        return static_file(result, root='cache/thumbs')
    else:
        return json.dumps(result, indent=4)

@get('/rest/files')
def list_files():
    g = gphoto2.GPhoto2()   

    result = g.listFiles()

    return json.dumps(result, indent=4)

@get('/rest/settings')
def list_camera_settings():
    g = gphoto2.GPhoto2()   

    result = g.listCameraSettings()

    return json.dumps(result, indent=4)

@get('/rest/setting-options')
def list_setting_options():
    s = settings.SettingOptions() 

    result = s.list()

    return json.dumps(result, indent=4)

@post('/rest/setting-option/<path>')
@put('/rest/setting-option/<path>')
def set_setting_option(path):
    s = settings.SettingOptions() 

    setting = {}
    for k in request.POST:
        setting[k] = request.POST.get(k)

    setting['path'] = path;

    result = s.set(setting)

    return json.dumps(setting, indent=4)

@get('/rest/setting-option/<path>')
def get_setting_option(path):
    s = settings.SettingOptions() 

    result = s.get(path)

    return json.dumps(result, indent=4)

@post('/rest/setting/<path>')
@put('/rest/setting/<path>')
def set_setting_option(path):
    g = gphoto2.GPhoto2() 
    value = request.POST['value']

    result = g.setCameraSetting(path, value)

    return json.dumps(result, indent=4)

@get('/rest/setting/<path>')
def get_camera_setting(path):
    g = gphoto2.GPhoto2()   

    result = g.getCameraSetting(path)

    return json.dumps(result, indent=4)

@route('/')
def default():
    return static_file('index.html', root='html')

@route('/css/<path:path>')
def css(path):
    return static_file(path, root='css')

@route('/js/<path:path>')
def js(path):
    return static_file(path, root='js')

@route('/image/<path:path>')
def image(path):
    return static_file(path, root='image')

run(host='0.0.0.0', port=8080)
