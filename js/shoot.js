(function( $ ) {
    var me;
    var methods = {
        init : function( ) {
            me = this;
            $('#app-content .content-region').loading();

            methods.loadQuickShootSettings();
            $('body').on('quickShootSettingsLoaded', methods.quickShootSettingsLoaded);
            return this;
        },

        loadQuickShootSettings: function() {
            var request = $.ajax( {
                type: 'GET',
                dataType: 'json',
                url: '/rest/setting-options'
            });
            request.done(function (response) {
                var data = $('body').data('core'),
                    quicksettings = [];


                for (key in response) {
                    settingoption = response[key];
                    if (settingoption.quickShoot == "true") {
                        quicksettings[settingoption.path] = settingoption;
                    }
                }
                $('body').trigger('quickShootSettingsLoaded'); 
            });
            return false;
        },
        
        quickShootSettingsLoaded: function() {
            var $appcontent = $('#app-content .content-region');
            var data = $('body').data('core');
            var source = '';

            $appcontent.loading('destroy');
            source += '<div id="shoot-bar">';
            source += '<button id="shoot">Take photo</button>';
            source += '</div>';
            source += '<div id="last-shot-preview">';
            source += '<img/>';
            source += '</div>';
            $('#app-content .content-region').html(source);
            $('#app-content .content-region').show('fade', 200);
            $('#last-shot-preview img').hide();
            $("#shoot").button({
                icons: { primary: "ui-icon-image" }
            });
            $('#shoot').click(methods.takePhoto);
        },

        takePhoto: function() {

            $('#last-shot-preview').loading();
            var request = $.ajax( {
                type: 'POST',
                dataType: 'json',
                url: '/rest/photos'
            });
            request.done(methods.loadLastJpeg);
        },

        loadLastJpeg: function() {
            var request = $.ajax( {
                type: 'GET',
                dataType: 'json',
                url: '/rest/files'
            });
            request.done(function (response) {
                var data = $('body').data('core');

                data.photos = response;
                methods.photosLoaded();
            });
            return false;
        },
        photosLoaded: function() {
            var $appcontent = $('#app-content .content-region');
            var data = $('body').data('core');
            var image = data.photos.pop();
            $('#last-shot-preview img').attr('src', '/rest/jpegs/' + image.Filename);
            $('#last-shot-preview img').show();
            $('#last-shot-preview img').load(function () {
                $('#last-shot-preview').loading('destroy');
            });
        },
        
        destroy : function( ) {
            console.log('destroy');
        }
    };

    $.fn.shoot = function( method ) {

        if ( methods[method] ) {
            return methods[method].apply(methods.init.apply(this), Array.prototype.slice.call( arguments, 1));
        } else if ( typeof method === 'object' || !method ) {
            return methods.init.apply(this);
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.shoot' );
        }
    };
})( jQuery );


