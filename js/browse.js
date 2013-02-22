(function( $ ) {
    var me;
    var methods = {
        init : function( ) {
            me = this;
            $('#app-content .content-region').loading();

            methods.loadAllPhotos();
            $('body').on('photosLoaded', methods.photosLoaded);
            return this;
        },

        loadAllPhotos: function() {
            var request = $.ajax( {
                type: 'GET',
                dataType: 'json',
                url: '/rest/files'
            });
            request.done(function (response) {
                var data = $('body').data('core');

                data.photos = response;
                $('body').trigger('photosLoaded'); 
            });
            return false;
        },
        
        photosLoaded: function() {
            var $appcontent = $('#app-content .content-region');
            var data = $('body').data('core');
            var source = '';
            var postCreateJS = '';
            var image = '';

            $appcontent.loading('destroy');
            source += '<div id="images">';
            for (index in data.photos) {
                image = data.photos[index];
                source += '<img src="/rest/thumbnails/' + image.Filename + '" style="margin-bottom: 30px; "/>';
            }
            source += '</div>';
            source += '<div id="image-detail-dialog">';
            source += '<div id="image-detail-container">';
            source += '<img id="image-detail" src="#"/>';
            source += '</div>';
            source += '</div>';

            $('#app-content .content-region').html(source);

            $('#image-detail-dialog').dialog( { autoOpen: false, modal: true, height: 800, width: 1050 } );
            
            $('#app-content .content-region').show('fade', 200);

            // attach hovers to thumbs
            $('#images img').hover(methods.zoomThumbIn, methods.zoomThumbOut);
            $('#images img').click(methods.showImage);
        },

        showImage : function () {
            var imagesrc = $(this).attr('src').replace('thumbnails', 'jpegs');
            $('#image-detail').attr('src', imagesrc);
            $('#image-detail-dialog').dialog('open');
            $('#image-detail-dialog').loading();
            $('#image-detail').load( function () {
                $('#image-detail-dialog').loading('destroy');
            });
        },

        zoomThumbIn : function () {
            $(this).animate({height: '150px', 'margin-bottom': '0px'}, 100);
        },
        
        zoomThumbOut : function () {
            $(this).animate({height: '120px', 'margin-bottom': '30px'}, 100);
        },
        
        destroy : function( ) {
            console.log('destroy');
        }
    };

    $.fn.browse = function( method ) {

        if ( methods[method] ) {
            return methods[method].apply(methods.init.apply(this), Array.prototype.slice.call( arguments, 1));
        } else if ( typeof method === 'object' || !method ) {
            return methods.init.apply(this);
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.browse' );
        }
    };
})( jQuery );


