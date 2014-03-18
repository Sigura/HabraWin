(function (winJs) {
    'use strict';

    winJs.UI.Pages.define('/pages/hub/hub.html', {
        processed: function (element) {
            return winJs.Resources.processAll(element);
        },
        className: 'client-search-hub',
        ready: function (element, options) {
            this.initEnv();

            this.initAppBar(element);
            this.subscribe(element);

            this.setFormValues(options);

            this.search();
        },
        initAppBar: function (element) {
            var me = this;
            me.appBar = element.querySelector('#appbar').winControl;

            this.addRemovableEventListener(me.appBar.getCommandById('clear'), 'click', function () {
                winJs.bus.dispatchEvent('clear-command');
            }, false);
        },
        subscribe: function () {
            var me = this;

            var search = me.element.querySelector('#search');

            search && me.addRemovableEventListener(search, 'click', me.search.bind(me), false);

            me.addRemovableEventListener(winJs.bus, 'client-selected', function (item) {
                me.currentClient = item.detail.data;
                //me.editButton.disabled = false;
                me.appBar.sticky = true;
                me.appBar.show();
            });
            me.addRemovableEventListener(winJs.bus, 'client-unselected', function (item) {
                me.currentClient = null;
                //me.editButton.disabled = true;
                me.appBar.hide();
                me.appBar.sticky = false;
            });
        },
        unload: function () {
            this.element.classList.remove(this.className);

            if (this._disposed) {
                return;
            }

            this._disposed = true;
            winJs.Utilities.disposeSubTree(this._element);
            for (var i = 0; i < this._eventHandlerRemover.length; ++i) {
                this._eventHandlerRemover[i]();
            }
            this._eventHandlerRemover = null;
        },
        addRemovableEventListener: function (e, eventName, handler, capture) {
            capture = capture !== true ? true : false;

            e.addEventListener(eventName, handler, capture);

            this._eventHandlerRemover.push(function () {
                e.removeEventListener(eventName, handler);
            });
        },
        updateLayout: function (element) {
            // TODO: Respond to changes in layout.
        },
        setFormValues: function (clinetInfo) {
            this.searchForm = this.element.querySelector('#main-search-form');

            this.searchForm && this.searchForm.setAttribute('data-win-options', JSON.stringify(clinetInfo));
            this.searchForm && this.searchForm.winControl && this.searchForm.winControl.setValues(clinetInfo);
        },
        search: function () {
            winJs.bus.dispatchEvent('search-command');
        },
        initEnv: function() {
            this.element.classList.add(this.className);
            this._eventHandlerRemover = [];
        }
    });
})(WinJS);