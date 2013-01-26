#!/usr/bin/python

from bottle import get, route, run, static_file
import simplejson as json
import gphoto2

@get('/rest/cameras')
def list_cameras():
     g = gphoto2.GPhoto2()   

     result = g.listCameras()

     return json.dumps(result, indent=4)

@get('/rest/settings')
def list_camera_settings():
     g = gphoto2.GPhoto2()   

     result = g.listCameraSettings()

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
