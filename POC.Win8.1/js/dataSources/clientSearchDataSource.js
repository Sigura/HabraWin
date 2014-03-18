(function (winJs, console) {
    'use strict';

    var clientSearchDataAdapter = winJs.Class.define(winJs.Utilities.defaultConstructor(), {
        def: {
            maxCount: 300,
            maxPageSize: 50,
            minPageSize: 50
        },
        init: function (options) {
            this.cache = {};
            this._filter = null;

            this.dataSource = options.dataSource;
        },
        condition: {
            get: function () {
                return this._filter;
            },
            set: function (value) {

                this._filter = value;

                this.dataSource && this.dataSource.invalidateAll && this.dataSource.invalidateAll();

                return value;
            }
        },
        getQuery: function () {
            var me = this;

            return new HabraWin.ProxyBuilder('client').then(function (proxy) {
                return proxy.search(me.condition);
            });
        },
        getCount: function () {

            var me = this;
            var cacheKey = JSON.stringify(me.condition);

            if (cacheKey in this.cache)
                return WinJS.Promise.wrap(me.cache[cacheKey].length);

            var query = me.getQuery();
            var i = 0;

            return query
                .then(function (clients) {
                    me.cache[cacheKey] = clients.map(function (item) {
                        return {
                            key: '' + (i++),
                            data: item,
                            groupKey: item.secondName.length > 0 ? item.secondName.substring(0, 1).toUpperCase() : '-'
                        };
                    });

                    var filtered = me.applyFilters({ items: clients, offset: 0, totalCount: clients.length });

                    return filtered.items.length;
                });
        },
        addFilter: function (filter) {
            this.filters = this.filters || [];

            this.filters.push(filter);
        },
        applyFilters: function (result) {

            if (!this.filters || !this.filters.length)
                return result;

            var me = this;

            this.filters.forEach(function (filter) {
                result = filter(result, me.condition);
            });

            return result;
        },
        itemsFromIndex: function (requestIndex, countBefore, countAfter) {
            var me = this;

            if (requestIndex >= me.options.maxCount) {
                return winJs.Promise.wrapError(new winJs.ErrorFromName(winJs.UI.FetchError.doesNotExist));
            }

            var fetchSize, fetchIndex;
            if (countBefore > countAfter) {
                countAfter = Math.min(countAfter, 10);
                var fetchBefore = Math.max(Math.min(countBefore, me.options.maxPageSize - (countAfter + 1)), me.options.minPageSize - (countAfter + 1));
                fetchSize = fetchBefore + countAfter + 1;
                fetchIndex = requestIndex - fetchBefore;
            } else {
                countBefore = Math.min(countBefore, 10);
                var fetchAfter = Math.max(Math.min(countAfter, me.options.maxPageSize - (countBefore + 1)), me.options.minPageSize - (countBefore + 1));
                fetchSize = countBefore + fetchAfter + 1;
                fetchIndex = requestIndex - countBefore;
            }
            var cacheKey = JSON.stringify(me.condition);
            var result = function () {
                var cache = me.cache[cacheKey];
                var items = cache.slice(fetchIndex, fetchIndex + fetchSize);
                var offset = requestIndex - fetchIndex;
                var totalCount = Math.min(cache.length, me.options.maxCount);
                var r = {
                    items: items,
                    offset: offset,
                    totalCount: totalCount,
                };
                var filtered = me.applyFilters(r);

                return filtered;
            };

            if (cacheKey in me.cache) {
                return WinJS.Promise.wrap(result());
            }

            var query = me.getQuery();

            return query
                .then(function (items) {

                    var i = 0;

                    me.cache[cacheKey] = items.map(function (item) {
                        return {
                            key: '' + (fetchIndex + i++),
                            data: item,
                            groupKey: item.secondName.length > 0 ? item.secondName.substring(0, 1).toUpperCase() : '-'
                        };
                    });

                    return result();
                });
        }
    });

    var clientsDataSource = winJs.Class.derive(winJs.UI.VirtualizedDataSource, function (condition) {
        var dataAdapter = new clientSearchDataAdapter({
            dataSource: this
        });

        this.setCondition = function (cond) {
            dataAdapter.condition = cond;
        };

        this.addFilter = function (filter) {
            dataAdapter.addFilter(filter);
        };

        this._baseDataSourceConstructor(dataAdapter);

        this.setCondition(condition);
    });


    winJs.Namespace.define('HabraWin.DataSources', {
        ClientSearch: clientsDataSource
    });

})(WinJS, console);
