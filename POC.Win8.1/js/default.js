// For an introduction to the Hub template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=286574

(function (application, winJs, habraWin, windows, window) {
    'use strict';

    winJs.Binding.optimizeBindingReferences = true;

    var app = new application.Instance({
        activation: windows.ApplicationModel.Activation,
        app: winJs.Application,
        nav: winJs.Navigation,
        sched: winJs.Utilities.Scheduler,
        ui: winJs.UI
    });

    winJs.bus = new habraWin.MessageBus();
    window.app = app;

    var isFake = app.isFake = true;
    var defProxyOptions = HabraWin.ProxyBuilder.prototype.def;

    habraWin.Tile.baseUrl = app.baseUrl = !isFake ? this.baseUrl : 'ms-appx:///fake';
    defProxyOptions.isFake = isFake;
    defProxyOptions.baseAddress = app.baseUrl;
    defProxyOptions.types = {
        client: 'HabraWin.Services.Contracts.IClientService, HabraWin.Services.Contracts'
    };

    habraWin.Converters.baseAddress = app.baseUrl;

    app.addEventListener('after-start', function() {
        habraWin.Tile.updateTile();
    });

    app.start();

})(Application, WinJS, HabraWin, Windows, window);
