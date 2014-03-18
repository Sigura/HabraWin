(function (winJs, habraWin) {
    'use strict';

    winJs.Namespace.define('HabraWin', {
        PageNavigatorControl: winJs.Class.define(
            function (element, options) {
                var nav = winJs.Navigation;

                this._element = element || document.createElement('div');
                this._element.appendChild(this._createPageElement());

                this.home = options.home;

                this._eventHandlerRemover = [];

                this.addRemovableEventListener(nav, 'navigating', this._navigating.bind(this), false);
                this.addRemovableEventListener(nav, 'navigated', this._navigated.bind(this), false);

                window.onresize = this._resized.bind(this);

                habraWin.navigator = this;
            }, {
                addRemovableEventListener: function (e, eventName, handler, capture) {
                    var that = this;

                    e.addEventListener(eventName, handler, capture);

                    that._eventHandlerRemover.push(function () {
                        e.removeEventListener(eventName, handler);
                    });
                },
                home: '',
                _element: null,
                _lastNavigationPromise: winJs.Promise.as(),
                _lastViewstate: 0,

                pageControl: {
                    get: function () { return this.pageElement && this.pageElement.winControl; }
                },

                pageElement: {
                    get: function () { return this._element.firstElementChild; }
                },

                dispose: function () {
                    if (this._disposed) {
                        return;
                    }

                    this._disposed = true;
                    winJs.Utilities.disposeSubTree(this._element);
                    for (var i = 0; i < this._eventHandlerRemover.length; i++) {
                        this._eventHandlerRemover[i]();
                    }
                    this._eventHandlerRemover = null;
                },

                _createPageElement: function () {
                    var element = document.createElement('div');
                    element.setAttribute('dir', window.getComputedStyle(this._element, null).direction);
                    element.style.position = 'absolute';
                    element.style.visibility = 'hidden';
                    element.style.width = '100%';
                    element.style.height = '100%';
                    return element;
                },

                _getAnimationElements: function () {
                    if (this.pageControl && this.pageControl.getAnimationElements) {
                        return this.pageControl.getAnimationElements();
                    }
                    return this.pageElement;
                },

                _navigated: function () {
                    this.pageElement.style.visibility = '';
                    winJs.UI.Animation.enterPage(this._getAnimationElements()).done();
                },

                _navigating: function (args) {
                    var newElement = this._createPageElement();
                    this._element.appendChild(newElement);

                    this._lastNavigationPromise.cancel();

                    var me = this;
                    this._lastNavigationPromise = winJs.Promise.as().then(function () {
                        return winJs.UI.Pages.render(args.detail.location, newElement, args.detail.state);
                    }).then(function parentElement(control) {
                        var oldElement = me.pageElement;
                        if (oldElement.winControl) {
                            if (oldElement.winControl.unload) {
                                oldElement.winControl.unload();
                            }
                            oldElement.winControl.dispose();
                        }
                        oldElement.parentNode.removeChild(oldElement);
                        oldElement.innerText = '';
                    });

                    args.detail.setPromise(this._lastNavigationPromise);
                },

                _resized: function (args) {
                    if (this.pageControl && this.pageControl.updateLayout) {
                        this.pageControl.updateLayout.call(this.pageControl, this.pageElement);
                    }
                }
            }
        )
    });
})(WinJS, HabraWin);
