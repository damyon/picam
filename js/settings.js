(function( $ ) {
    var me;
    var methods = {
        init : function( ) {
            me = this;
            this.loading();
            var request = $.ajax( {
                type: 'GET',
                dataType:  'json',
                url: '/rest/settings' 
            });

            request.done(function(response) {
                var $appcontent = $('#app-content .content-region');
                var data = $('body').data('core');
                var i = 0;
                var tree = [];

                $appcontent.loading('destroy');

                // reformat the settings into a tree
                for (i = 0; i < response.length; i++) {
                    setting = response[i];
                    methods.insertNodeInTree(setting, tree);
                }
                
                data.settings = tree;
                $('body').trigger('settingsLoaded'); 
            });
            $('body').on('settingsLoaded', methods.settingsLoaded);
            return this;
        },

        settingsLoaded: function() {
            var data = $('body').data('core');
            var menu;
            var settingsSource = '';

            settingsSource += '<div id="settings-tabs">';
            settingsSource += '<ul>';
            console.log(data);
            for (menu in data.settings.main.children) {
                settingsSource += '<li><a href="#' + menu + '">' + menu + '</a></li>';
            }
            settingsSource += '</ul>';
            for (menu in data.settings.main.children) {
                settingsSource += '<div id="' + menu + '">';
                child = data.settings.main.children[menu];
                for (settingkey in child.children) {
                    setting = child.children[settingkey];
                    settingsSource += '<p>' + setting.Label + '</p>';
                }
                settingsSource += '</div>';
            }
            settingsSource += '</div>';
                
            me.html(settingsSource);
            me.tabs();
            me.show('fade', 200);
        },

        insertNodeInTree: function( node, tree ) {
            var path = node.path.split('-');
            var i, currentpath;
            path.shift();
            currentnodes = tree;
            currentpathlong = [''];

            for (i = 0; i < path.length - 1; i++) {
                currentpath = path[i];
                currentpathlong.push(currentpath);
                
                if (! (currentpath in currentnodes)) {
                    currentnodes[currentpath] = { type: 'branch', path: currentpathlong.join('-'), children: {} };
                } 
                currentnodes = currentnodes[currentpath].children;
            }

            currentnodes[path[path.length - 1]] = node;

        },

        destroy : function( ) {
            $('#app-content .content-region').hide('fade', 200, function() {
                $node.html('');
            });
        }
    };

    $.fn.settings = function( method ) {

        if ( methods[method] ) {
            return methods[method].apply(methods.init.apply(this), Array.prototype.slice.call( arguments, 1));
        } else if ( typeof method === 'object' || !method ) {
            return methods.init.apply(this);
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.settings' );
        }
    };
})( jQuery );


