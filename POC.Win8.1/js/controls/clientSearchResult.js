(function (winJs, window) {
    'use strict';

    var condition;

    var clientSearchResult = winJs.Class.define(winJs.Utilities.defaultControlConstructor(), {
        init: function (element, options) {
            var me = this;

            me.defineElements();

            me.subscribe();
        },
        defineElements: function () {
            var me = this;

            me.listViewElement = me.element.querySelector('.client-search-result-list-view');
            var template = document.querySelector('.client-search-item-template');

            me.listView = new winJs.UI.ListView(me.listViewElement, {
                itemDataSource: me.searchDataSource,
                itemTemplate: template,
                layout: new WinJS.UI.GridLayout(),
                selectionMode: 'single'
            });
        },
        subscribe: function () {
            var me = this;

            winJs.bus.addEventListener('search-client', function (e) {
                condition = e.detail;
                try {
                    me.listView && (me.listView.itemDataSource = me.searchDataSource);
                    winJs.bus.dispatchEvent('client-unselected');
                } catch (e) {
                    //debugger;
                }
            });
            winJs.bus.dispatchEvent('client-unselected');

            me.listView.addEventListener('iteminvoked', function (e) {
                e.detail.itemPromise.done(function (item) {
                    winJs.Navigation.navigate('/pages/client/client.html', item.data);
                });
            });

            me.listView.addEventListener('selectionchanged', function (element) {
                me.listView.selection
                    .getItems()
                    .done(function (items) {
                        if (!items.length) {
                            winJs.bus.dispatchEvent('client-unselected');
                            return;
                        }
                        winJs.bus.dispatchEvent('client-selected', items[0]);
                    });
            });
        },
        fakeFilter: function (result, condition) {
            if (!window.app.isFake || !condition) {
                return result;
            }

            var offset = 0;
            var items = result.items.filter(function (item) {
                var filtered = true;
                for (var lbl in condition) {
                    var condValue = condition[lbl];
                    if (condition.hasOwnProperty(lbl) && condValue) {
                        if (condValue instanceof Date) {
                            var date = new Date(item.data[lbl]);
                            filtered = filtered && (item.data[lbl] == condValue || (date.getFullYear() === condValue.getFullYear() && date.getMonth() === condValue.getMonth()));
                        } else
                            filtered = filtered && (item.data[lbl] == condValue || item.data[lbl].toLowerCase().indexOf(condValue.toLowerCase()) > -1);
                    }
                }
                return filtered;
            });
            var totalCount = items.length;

            return {
                items: items,
                offset: offset,
                totalCount: totalCount
            };
        },
        initSearchDataSource: function () {
            var dataSource = new HabraWin.DataSources.ClientSearch(condition);

            if (this.fakeFilter)
                dataSource.addFilter(this.fakeFilter);

            return dataSource;

        },
        searchDataSource: {
            get: function () {
                return this.initSearchDataSource();
            }
        }
    });

    winJs.Namespace.define('HabraWin', {
        ClientSearchResult: clientSearchResult
    });


})(WinJS, window);