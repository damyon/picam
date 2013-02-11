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
            var postCreateJS = '';

            $appcontent.loading('destroy');
            source += '<div id="last-shot-preview">';
            source += '</div>';
            source += '<div id="shoot-bar">';
            source += '<button id="shoot"/>';
            postCreateJS += '$("#shoot").button({' +
                                    '   icons: {' +
                                    '       primary: "ui-icon-image"' +
                                    '   },' +
                                    '   text: false' +
                                    '});';
            source += '</div>';
            $('#app-content .content-region').html(source);
            eval(postCreateJS);
            $('#app-content .content-region').show('fade', 200);
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


