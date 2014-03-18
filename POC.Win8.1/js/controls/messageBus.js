(function (winJs) {
    'use strict';

    var bus = winJs.Class.define(winJs.Utilities.defaultConstructor(), {
        init: function (element, options) {
            var me = this;
        }
    });

    winJs.Class.mix(bus, winJs.Utilities.eventMixin);

    winJs.Namespace.define('HabraWin', { MessageBus: bus });


})(WinJS);