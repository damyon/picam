(function( $ ) {

    var methods = {
        init : function( ) {

            this.append('<div style="text-align: center;"><img class="jquery-ui-loading" src="/image/ajax-loader.gif" alt="Loading"/></div>');
        },

        destroy : function( ) {
            $('.jquery-ui-loading').remove();
        }
    };

    $.fn.loading = function( method ) {

        if ( methods[method] ) {
            return methods[method].apply(methods.init.apply(this), Array.prototype.slice.call( arguments, 1));
        } else if ( typeof method === 'object' || !method ) {
            return methods.init.apply(this);
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.loading' );
        }
    };
})( jQuery );


