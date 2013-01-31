(function( $ ) {

    var methods = {
        init : function( ) {

            // No options
            var data = $('body').data('core');

            if (!data) {
                $('body').data('core', { });
                $('#camera-info .content-region').core('loadCameraInfo');
                $('#app-chooser .content-region').core('setupAppButtons');
            }

            return this;
        },
        
        setupAppButtons : function() {
            this.html('<a id="settings-button" href="#settings" title="Settings">Settings</a>&nbsp;<a id="browse-button" href="#browse" title="Browse">Browse</a>&nbsp;<a id="shoot-button" href="#shoot" title="Shoot">Shoot</a>');

            $('#settings-button').button({ disabled: true, icons: { primary: "ui-icon-wrench" } });
            $('#browse-button').button({ disabled: true, icons: { primary: "ui-icon-folder-open" } });
            $('#shoot-button').button({ disabled: true, icons: { primary: "ui-icon-gear" } });

            $('body').on('cameraInfoLoaded', function() {
                var data = $('body').data('core');

                if (data.cameras.length > 0) {
                    $('#app-chooser .content-region a').button('option', 'disabled', false);
                } else {
                    $('#app-chooser .content-region a').button('option', 'disabled', true);
                }
            });

            $('#settings-button').on('click', function() {
                $('#app-content .content-region').remove();
                $('#app-content').html('<div class="content-region"></div>');
                $('#app-content .content-region').settings();
            });
            return this;
        },

        loadCameraInfo : function() {
            // Start a spinner
            this.loading();
            var request = $.ajax( {
                type: 'GET',
                dataType:  'json',
                url: '/rest/cameras' 
            });

            request.done(function(response) {
                var $camerainfo = $('#camera-info .content-region')
                var data = $('body').data('core');

                $camerainfo.loading('destroy');

                data.cameras = response;
                if (data.cameras.length > 0) {
                    $camerainfo.html(data.cameras[0].Camera);
                } else {
                    console.log("no cameras");
                    $camerainfo.html('No camera connected');
                }
                
                $('body').trigger('cameraInfoLoaded'); 
            });

            return this;
        }
    };

    $.fn.core = function( method ) {

        if ( methods[method] ) {
            return methods[method].apply(methods.init.apply(this), Array.prototype.slice.call( arguments, 1));
        } else if ( typeof method === 'object' || !method ) {
            return methods.init.apply(this);
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.core' );
        }
    };
})( jQuery );


