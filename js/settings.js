(function( $ ) {
    var me;
    var methods = {
        init : function( ) {
            me = this;
            $('#app-content .content-region').loading();
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


                // reformat the settings into a tree
                for (i = 0; i < response.length; i++) {
                    setting = response[i];
                    methods.insertNodeInTree(setting, tree);
                }

                data.settings = tree;
                methods.loadNextMenu();
            });
            $('body').on('settingsLoaded', methods.settingsLoaded);
            return this;
        },

        loadNextMenu: function() {
            var data = $('body').data('core');
            var menu;
            for (menu in data.settings.main.children) {
                menu = data.settings.main.children[menu];
                if (! ('Label' in menu) ) {
                    var request = $.ajax( {
                        type: 'GET',
                        dataType: 'json',
                        url: '/rest/setting/' + menu.path
                    });
                    request.done(function (response) {
                        var data = $('body').data('core');
                        var menu;
                        for (menu in data.settings.main.children) {
                            menu = data.settings.main.children[menu];
                            if (! ('Label' in menu) ) {
                                menu.Label = response.Label;
                                break;
                            }
                        }

                        methods.loadNextMenu();
                    });
                    return false;
                }
            }
            // All menus loaded
            methods.loadSettingOptions();
        },

        loadSettingOptions: function() {
            var request = $.ajax( {
                type: 'GET',
                dataType: 'json',
                url: '/rest/setting-options'
            });
            request.done(function (response) {

                for (key in response) {
                    settingoption = response[key];
                    methods.updateSettingOptions(settingoption.path, settingoption.locked == "true", settingoption.hidden == "true");
                }
                $('body').trigger('settingsLoaded'); 
            });
            return false;
        },

        lockSetting: function(path) {

            setting = methods.findSettingInTree(path);
            if (setting) {
                if (setting.Type == 'MENU' || 
                        setting.Type == 'TOGGLE' ||
                        setting.Type == 'TEXT') {
                    $('#' + path).attr('disabled', true);
                } else if (setting.Type == 'RANGE') {
                    $('#' + path).slider('disable');
                } else if (setting.Type == 'RADIO') {
                    $('.radio' + path).attr('disabled', true);
                }
            }


            $('#lock' + path).hide();
            $('#unlock' + path).show();
        },
        
        unLockSetting: function(path) {
            setting = methods.findSettingInTree(path);
            if (setting) {
                if (setting.Type == 'MENU' || 
                        setting.Type == 'TOGGLE' ||
                        setting.Type == 'TEXT') {
                    $('#' + path).attr('disabled', false);
                } else if (setting.Type == 'RANGE') {
                    $('#' + path).slider('enable');
                } else if (setting.Type == 'RADIO') {
                    $('.radio' + path).attr('disabled', false);
                }
            }
            $('#' + path).attr('disabled', false);
            $('#lock' + path).show();
            $('#unlock' + path).hide();
        },
        
        hideSetting: function(path) {
            $('.' + path).addClass('setting-hidden');
            $('.' + path).hide('fade', 200);
            $('#hide' + path).hide();
            $('#show' + path).show();
        },
        
        showSetting: function(path) {
            $('.' + path).removeClass('setting-hidden');
            $('.' + path).show('fade', 200);
            $('#hide' + path).show();
            $('#show' + path).hide();
        },
        
        saveSettingOptions: function(path) {
            var data = $('body').data('core');

            for (menu in data.settings.main.children) {
                child = data.settings.main.children[menu];
                for (settingkey in child.children) {
                    setting = child.children[settingkey];
                    if (setting.path == path) {
                        var request = $.ajax( {
                            type: 'POST',
                            dataType:  'json',
                            url: '/rest/setting-option/' + setting.path,
                            data: { locked: setting.locked, hidden: setting.hidden }
                        });
                    }
                }
            }

        },

        findSettingInTree: function(path) {
            var data = $('body').data('core');

            for (menu in data.settings.main.children) {
                child = data.settings.main.children[menu];
                for (settingkey in child.children) {
                    setting = child.children[settingkey];
                    if (setting.path == path) {
                        return setting;
                    }
                }
            }
            return false;
        },

        updateSettingOptions: function(path, locked, hidden) {
            var setting = methods.findSettingInTree(path);

            if (setting) {
                if (locked != null) {
                    setting.locked = locked;
                } 
                if (hidden != null) {
                    setting.hidden = hidden;
                }
                return true;
            }
            return false;
        },

        settingsLoaded: function() {
            var $appcontent = $('#app-content .content-region');
            var data = $('body').data('core');
            var menu;
            var settingsSource = '';
            var postCreateJS = '';
            var input;
            var selected;
            var choice;
            var i;

            $appcontent.loading('destroy');
            settingsSource += '<div id="settings-tabs">';
            settingsSource += '<ul>';
            for (menu in data.settings.main.children) {
                menu = data.settings.main.children[menu];
                settingsSource += '<li><a href="#' + menu.path + '">' + menu.Label + '</a></li>';
            }
            settingsSource += '</ul>';
            for (menu in data.settings.main.children) {
                child = data.settings.main.children[menu];
                settingsSource += '<div id="' + child.path+ '">';
                settingsSource += '<fieldset style="clear: left;">';
                settingsSource += '<legend>' + child.Label + '</legend>';
                for (settingkey in child.children) {
                    input = '';
                    setting = child.children[settingkey];
                    if (setting.Type == 'MENU') {
                        input += '<select id="' + setting.path + '" class="jquery-ui-widget">';
                        if (!('Choice' in setting)) {
                            continue;
                        }
                        for (i = 0; i < setting.Choice.length; i++) {
                            choice = setting.Choice[i];

                            namevalue = choice.split(' ');
                            namevalue.shift();
                            namevalue = namevalue.join(' ');
                            selected = '';
                            if (setting.Current == namevalue) {
                                selected = ' selected="selected"';
                            }
                            input += '<option value="' + namevalue + '"' + selected + '>' + namevalue + '</option>';
                        }
                        
                        input += '</select>';
                    } else if (setting.Type == 'TOGGLE') {
                        selected = '';
                        if (setting.Current) {
                            selected = 'checked="checked"';
                        }
                        input += '<input type="checkbox" value="1" id="' + setting.path + '" ' + selected + ' class="jquery-ui-widget"/>';

                    } else if (setting.Type == 'RANGE') {
                        input += '<div id="' + setting.path + '" style="width: 16em;"></div>';
                        postCreateJS += '$("#' + setting.path + '").slider({ min: ' + setting.Bottom + ', max: ' + setting.Top + ', step: ' + setting.Step + ', value: ' + setting.Current + '});\n';
                    } else if (setting.Type == 'RADIO') {
                        if (!('Choice' in setting)) {
                            continue;
                        }
                        for (i = 0; i < setting.Choice.length; i++) {
                            choice = setting.Choice[i];

                            namevalue = choice.split(' ');
                            namevalue.shift();
                            namevalue = namevalue.join(' ');
                            selected = '';
                            if (setting.Current == namevalue) {
                                selected = ' checked="checked"';
                            }
                            input += '<input type="radio" class="radio' + setting.path + '" name="' + setting.path + '" value="' + namevalue + '" ' + selected + ' class="jquery-ui-widget"/>' + namevalue + '<br/>';
                        }
                    } else if (setting.Type == 'TEXT') {
                        input += '<input type="text" id="' + setting.path + '" value="' + setting.Current + '" class="jquery-ui-widget"/>';
                    } else if (setting.Type == 'DATE') {
                        input += '<span id="' + setting.path + '">' + setting.Printable + '</span>';
                    } else {
                        console.log(setting);
                    }

                    settingsSource += '<label for="' + setting.path + '" class="' + setting.path + '">' + setting.Label + '</label><span class="input ' + setting.path + '">' + input + '</span>';
                    settingsSource += '<span class="input-flags ' + setting.path + '"><button id="lock' + setting.path + '"/><button id="unlock' + setting.path + '"/><button id="hide' + setting.path + '"/><button id="show' + setting.path + '"/></span>';
                    postCreateJS += '$("#hide' + setting.path + '").button({' +
                                    '   icons: {' +
                                    '       primary: "ui-icon-circle-minus"' +
                                    '   },' +
                                    '   text: false' +
                                    '});';
                    postCreateJS += '$("#show' + setting.path + '").button({' +
                                    '   icons: {' +
                                    '       primary: "ui-icon-circle-plus"' +
                                    '   },' +
                                    '   text: false' +
                                    '});';
                    postCreateJS += '$("#lock' + setting.path + '").button({' +
                                    '   icons: {' +
                                    '       primary: "ui-icon-unlocked"' +
                                    '   },' +
                                    '   text: false' +
                                    '});';
                    postCreateJS += '$("#unlock' + setting.path + '").button({' +
                                    '   icons: {' +
                                    '       primary: "ui-icon-locked"' +
                                    '   },' +
                                    '   text: false' +
                                    '});';
                    postCreateJS += '$("#hide' + setting.path + '").on("click", methods.onClickHide);';
                    postCreateJS += '$("#show' + setting.path + '").on("click", methods.onClickShow);';
                    postCreateJS += '$("#lock' + setting.path + '").on("click", methods.onClickLock);';
                    postCreateJS += '$("#unlock' + setting.path + '").on("click", methods.onClickUnLock);';
                    if (setting.hidden) {
                        postCreateJS += 'methods.hideSetting("' + setting.path + '");';
                    } else {
                        postCreateJS += 'methods.showSetting("' + setting.path + '");';
                    }
                    if (setting.locked) {
                        postCreateJS += 'methods.lockSetting("' + setting.path + '");';
                    } else {
                        postCreateJS += 'methods.unLockSetting("' + setting.path + '");';
                    }
                }
                settingsSource += '</div>';
                settingsSource += '</fieldset>';
            }
            settingsSource += '<button id="show-hidden">Show hidden settings</button>';
            settingsSource += '<button id="hide-hidden">Hide hidden settings</button>';
            settingsSource += '</div>';
                
            $('#app-content .content-region').html(settingsSource);
            $('#hide-hidden').hide();
            eval(postCreateJS);
            $('#show-hidden').button().on('click', function () {
                $('.setting-hidden').show('fade', 200);
                $('#show-hidden').hide();
                $('#hide-hidden').show();
            });
            $('#hide-hidden').button().on('click', function () {
                $('.setting-hidden').hide('fade', 200);
                $('#hide-hidden').hide();
                $('#show-hidden').show();
            });
            $('#app-content .content-region').tabs();
            $('#app-content .content-region').show('fade', 200);
        },

        onClickHide: function(e) {
            target = e.currentTarget;
            id = $(target).attr('id').replace('hide', '');
            methods.updateSettingOptions(id, null, true);
            methods.hideSetting(id);
            methods.saveSettingOptions(id);
        },
        
        onClickLock: function(e) {
            target = e.currentTarget;
            id = $(target).attr('id').replace('lock', '');
            methods.updateSettingOptions(id, true, null);
            methods.lockSetting(id);
            methods.saveSettingOptions(id);
        },
        
        onClickUnLock: function(e) {
            target = e.currentTarget;
            id = $(target).attr('id').replace('unlock', '');
            methods.updateSettingOptions(id, false, null);
            methods.unLockSetting(id);
            methods.saveSettingOptions(id);
        },
        
        onClickShow: function(e) {
            target = e.currentTarget;
            id = $(target).attr('id').replace('show', '');
            methods.updateSettingOptions(id, null, false);
            methods.showSetting(id);
            methods.saveSettingOptions(id);
        },

        insertNodeInTree: function( node, tree ) {
            var path = node.path.split('_');
            var i, currentpath;
            path.shift();
            currentnodes = tree;
            currentpathlong = [''];

            for (i = 0; i < path.length - 1; i++) {
                currentpath = path[i];
                currentpathlong.push(currentpath);
                
                if (! (currentpath in currentnodes)) {
                    currentnodes[currentpath] = { type: 'branch', path: currentpathlong.join('_'), children: {} };
                } 
                currentnodes = currentnodes[currentpath].children;
            }

            currentnodes[path[path.length - 1]] = node;

        },

        destroy : function( ) {
            console.log('destroy');
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


