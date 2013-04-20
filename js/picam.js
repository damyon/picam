(function( $ ) {
    var methods = {
        init : function( ) {
            // No options
            var data = $('body').data('picam');

            if (!data) {
                // Attach an empty data node to the body tag.
                $('body').data('picam', { });
                $('body').picam('setupListeners');
                $('body').picam('loadCameraInfo');
                $('body').picam('layoutPreview');
                $(window).resize(methods.layoutPreview);
            }

            return this;
        },
        
        layoutPreview : function() {
            if ($('body').width() >= 700) {
                var width = $('body').width() - 200;
                var height = (width / 4) * 3;
                $('#preview-region .content-region').width(width);
                $('#preview-region .content-region').height(height);
            } else {
                var width = $('body').width() - 4;
                var height = (width / 4) * 3;
                $('#preview-region .content-region').width(width);
                $('#preview-region .content-region').height(height);
            }
        },

        setupListeners : function() {
            $('body').on('cameraInfoLoaded', methods.displayCameraInfo);
            $('body').on('cameraInfoLoaded', methods.loadSettings);
            $('body').on('settingLoaded', methods.settingLoaded);
            $('body').on('previewUpdated', methods.updatePreview);
            $('body').on('photoTaken', methods.setPreviewToLastPhoto);
            $('#capture-preview').button().on('click', methods.togglePreview);
            $('#capture').button().on('click', methods.takePhoto);
        },

        takePhoto : function(event) {
            event.preventDefault();
            var request = $.ajax( {
                type: 'POST',
                dataType:  'json',
                url: '/rest/photos',
            });
            request.done(function(response) {
                $('body').trigger('photoTaken'); 
            });
        },

        setPreviewToLastPhoto : function() {
            $('#preview-region .content-region img').attr('src', '/rest/photos?' + Date.now());
        },


        togglePreview : function() {
            if (event !== undefined) {
                event.preventDefault();
            }
            var data = $('body').data('picam');

            if (data.previewSecondsLeft > 0) {
                data.previewSecondsLeft = 0;
            } else {
                methods.startPreview();
            }
        },

        startPreview : function() {
            var data = $('body').data('picam');
            var request = $.ajax( {
                type: 'POST',
                dataType:  'json',
                url: '/rest/preview',
            });

            data.previewSecondsLeft = 60;
            
            $('#setting-iso-speed').attr('disabled', true).trigger('liszt:updated');
            $('#setting-shutter-speed').attr('disabled', true).trigger('liszt:updated');
            $('#setting-f-number').attr('disabled', true).trigger('liszt:updated');
            $('#capture').attr('disabled', true);
            $('#capture-preview span').text('Stop Preview');
            $('body').trigger('previewUpdated');
        },
        
        stopPreview : function() {
            var data = $('body').data('picam');

            data.previewSecondsLeft = 0;
            $('#setting-iso-speed').attr('disabled', false).trigger('liszt:updated');
            $('#setting-shutter-speed').attr('disabled', false).trigger('liszt:updated');
            $('#setting-f-number').attr('disabled', false).trigger('liszt:updated');
            $('#capture').attr('disabled', false);
            $('#capture-preview span').text('Preview');

            // Dummy request to interrupt the camera
            var request = $.ajax( {
                type: 'GET',
                dataType:  'json',
                url: '/rest/cameras' 
            });
        },

        updatePreview : function() {
            var data = $('body').data('picam');
            console.log('update preview: ' + data.previewSecondsLeft);
            data.previewSecondsLeft -= 1;
            if (data.previewSecondsLeft > 0) {
                $('#preview-region .content-region img').attr('src', '/rest/preview?' + Date.now());
                setTimeout("$('body').trigger('previewUpdated');", 1000);
            } else {
                methods.stopPreview();
            }
        },

        
        loadCameraInfo : function() {
            var request = $.ajax( {
                type: 'GET',
                dataType:  'json',
                url: '/rest/cameras' 
            });

            request.done(function(response) {
                var data = $('body').data('picam');

                data.cameras = response;
                $('body').trigger('cameraInfoLoaded'); 
            });

            return this;
        },

        loadSelectSetting : function(settingpath) {
            var request = $.ajax( {
                type: 'GET',
                dataType:  'json',
                url: '/rest/setting/' + settingpath 
            });

            request.done(function(response) {
                var data = $('body').data('picam');
                data[settingpath] = response;
                $('body').trigger('settingLoaded', [settingpath]); 
            });
        },

        loadSettings : function() {
            var data = $('body').data('picam');
            if (data.cameras.length > 0) {
                methods.loadSelectSetting($('#setting-shutter-speed').attr('data-setting-path'));
                methods.loadSelectSetting($('#setting-iso-speed').attr('data-setting-path'));
                methods.loadSelectSetting($('#setting-f-number').attr('data-setting-path'));
            } else {
                $('#setting-shutter-speed').chosen();
                $('#setting-iso-speed').chosen();
                $('#setting-f-number').chosen();
            }

            return this;
        },

        setSelectOptionsFromSetting : function(select, setting, chosen) {
            var data = $('body').data('picam');

            console.log(select, setting);
            if (setting.Choice) {
                $.each(setting.Choice, function(key, choice) {
                    var keyval = choice.split(' ');
                    var selected = '';
                    if (setting.Current == keyval[1]) {
                        selected = 'selected="true"';
                    }
                    select.append($('<option value="' + keyval[0] + '" ' + selected + '>' + keyval[1] + '</option>'));
                });
            }
            if (chosen) {
                // just tell chosen to update the list of options
                select.trigger("liszt:updated");
            } else {
                // not been chosen() yet.
                select.chosen().on('change', methods.changeSetting);
            }
        },

        changeSetting : function(val) {
            var value = $(this).val();
            var path = $(this).attr('data-setting-path');

            // Save the value
            var request = $.ajax( {
                type: 'POST',
                dataType:  'json',
                url: '/rest/setting/' + path,
                data: { value: value }
            });
            request.done(function(response) {
                if (!response) {
                    // Reload the select because the status is unknown
                    methods.loadSelectSetting(path);
                    // And show alert
                    alert('Could not save setting');
                }
            });
        },

        settingLoaded : function(e, datasettingpath) {
            console.log(datasettingpath);
            console.log(this);
            if (datasettingpath == $('#setting-shutter-speed').attr('data-setting-path')) {
                methods.setupShutterSpeedSelect();
            }
            if (datasettingpath == $('#setting-iso-speed').attr('data-setting-path')) {
                methods.setupISOSpeedSelect();
            }
            if (datasettingpath == $('#setting-f-number').attr('data-setting-path')) {
                methods.setupFNumberSelect();
            }
        },

        setupShutterSpeedSelect : function() {
            var data = $('body').data('picam');
            var chosen = (data.settingShutterSpeedChosen !== undefined);
            var select = $('#setting-shutter-speed');
            var path = select.attr('data-setting-path');
            methods.setSelectOptionsFromSetting(select,
                                                data[path],
                                                chosen);
            data.settingShutterSpeedChosen = true;
        },
        
        setupFNumberSelect : function() {
            var data = $('body').data('picam');
            var chosen = (data.settingFNumberChosen !== undefined);
            var select = $('#setting-f-number');
            var path = select.attr('data-setting-path');
            methods.setSelectOptionsFromSetting(select,
                                                data[path],
                                                chosen);
            data.settingFNumberChosen = true;
        },
        
        setupISOSpeedSelect : function() {
            var data = $('body').data('picam');
            var chosen = (data.settingISOSpeedChosen !== undefined);
            var select = $('#setting-iso-speed');
            var path = select.attr('data-setting-path');
            methods.setSelectOptionsFromSetting(select,
                                                data[path],
                                                chosen);
            data.settingISOSpeedChosen = true;
        },

        displayCameraInfo : function() {
            var data = $('body').data('picam');

            if (data.cameras.length > 0) {
                $('#camera-info .content-region').html(data.cameras[0].Camera);
            } else {
                $('#camera-info .content-region').html('No camera connected');
            }
        }
    };

    $.fn.picam = function( method ) {

        if ( methods[method] ) {
            return methods[method].apply(methods.init.apply(this), Array.prototype.slice.call( arguments, 1));
        } else if ( typeof method === 'object' || !method ) {
            return methods.init.apply(this);
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.picam' );
        }
    };
})( jQuery );

