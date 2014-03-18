(function (winJs) {
    'use strict';

    var converters = {
        jsonStringify: winJs.Binding.converter(function (o) {
            return JSON.stringify(o);
        }),
        clientPhoto: winJs.Binding.converter(function (client) {
            if (!client || !client.hasPhoto)
                return '/images/empty-photo.png';

            return converters.baseAddress + '/clients/photos/' + client.ID;
        }),
        displayInline: winJs.Binding.converter(function (val) {
            return !!val ? 'inline' : 'none';
        }),
        noDisplayInline: winJs.Binding.converter(function (val) {
            return !val ? 'inline' : 'none';
        }),
        displayIfExists: winJs.Binding.converter(function (val) {
            return val && val.ID ? 'block' : 'none';
        }),
        displayIfNotExists: winJs.Binding.converter(function (val) {
            return !(val && val.ID) ? 'block' : 'none';
        }),
        display: winJs.Binding.converter(function (val) {
            return !!val ? 'block' : 'none';
        }),
        noDisplay: winJs.Binding.converter(function (val) {
            return !val ? 'block' : 'none';
        })
    };

    winJs.Namespace.define('HabraWin', { Converters: converters });

})(WinJS);