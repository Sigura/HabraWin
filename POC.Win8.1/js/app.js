; (function (winJs, habraWin) {

    var app = winJs.Class.define(winJs.Utilities.defaultConstructor(), {
        init: function (options) {
            var me = this;
            var activatedEventType = 'activated';
            var ui = options.ui;
            var application = options.app;
            var nav = options.nav;

            application.addEventListener(activatedEventType, function (args) {

                me.dispatchEvent(activatedEventType, {
                    kind: args.detail.kind,
                    isReactivated: args.detail.previousExecutionState === options.activation.ApplicationExecutionState.terminated,
                    parevEventDetails: args.detail
                });

                if (args.detail.kind !== options.activation.ActivationKind.launch)
                    return;

                nav.history = application.sessionState.history || {};
                nav.history.current.initialPlaceholder = true;

                ui.disableAnimations();
                var p = ui.processAll().then(function () {
                    return nav.navigate(nav.location || habraWin.navigator.home, nav.state);
                }).then(function () {
                    return options.sched.requestDrain(options.sched.Priority.aboveNormal + 1);
                }).then(function () {
                    ui.enableAnimations();
                });

                args.setPromise(p);
            });

            application.oncheckpoint = function (args) {
                me.dispatchEvent('oncheckpoint', { prevEvent: args });
                application.sessionState.history = options.nav.history;
            };
        },
        start: function () {
            var me = this;

            me.dispatchEvent('before-start', me);

            me.options.app.start();

            me.dispatchEvent('after-start', me);

        }
    });

    winJs.Class.mix(app, winJs.Utilities.eventMixin);

    winJs.Namespace.define('Application', {
        Instance: app
    });

})(WinJS, HabraWin);