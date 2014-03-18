(function (winJs, console) {
    'use strict';

    var proxyBuilder = winJs.Class.define(winJs.Utilities.defaultConstructor(), {
        def: {
            baseAddress: 'http://localhost:8010',
            types: {
                client: 'HabraWin.Services.Contracts.IClientService, HabraWin.Services.Contracts',
            }
        },
        cache: {},
        init: function (options) {

            var me = this;
            var startAt = new Date();
            var type = this.options.type || options;
            var def = this.def;

            if (def && type in def.types)
                this.options.type = def.types[type];

            var url = me.options.baseAddress + '/proxy/get/' + me.options.type;

            if (url in me.cache)
                return new winJs.Promise(function (complete) {
                    var cached = me.cache[url];

                    for (var name in cached) {
                        if (cached.hasOwnProperty(name) && name != 'options') {
                            me[name] = cached[name];
                        }
                    }

                    var duration = new Date() - startAt;
                    me.log('proxy for ' + me.options.type + ' build duration: ' + duration / 1000 + 'sec');

                    complete(me);
                });
            return winJs.xhr({
                type: 'GET',
                url: url,
                dataType: 'json'
            }).then(function (xmlHttpRequest) {

                var data = JSON.parse(xmlHttpRequest.responseText);

                me.build(data);

                me.cache[url] = me;

                var duration = new Date() - startAt;
                me.log('proxy for ' + me.options.type + ' build duration: ' + duration / 1000 + 'sec');

                return me;
            }, function (xmlHttpRequest) {
                me.log('Request proxy description failed: ' + xmlHttpRequest.status, xmlHttpRequest);
                return me;
            });
        },
        fixRef: function (data, name, parent, context) {
            if (data === null)
                return;

            var me = this;
            context = context || {};
            if (data instanceof Array) {
                var len = data.length;
                for (var i = 0; i < len; ++i) {
                    me.fixRef(data[i], i, data, context);
                }
            } else if (data.$id) {
                context[data.$id] = data;
                delete data.$id;
                me.fixRef(data, name, parent, context);
            } else if (data.$ref) {
                parent[name] = context[data.$ref];
            } else if (typeof (data) == 'object') {
                var lbl;
                for (lbl in data)
                    if (data.hasOwnProperty(lbl)) {
                        me.fixRef(data[lbl], lbl, data, context);
                    }
            }
        },
        log: function () {
            console.log && console.log.apply(console, arguments);
            winJs.log && winJs.log.apply(winJs, arguments);
        },
        build: function (data) {
            var me = this;

            for (var methodName in data) {

                if (!data.hasOwnProperty(methodName))
                    continue;

                var method = data[methodName];

                if (!method.method)
                    continue;

                me[methodName] = (function (method) {
                    var m = function (inputData) {
                        var url = me.options.baseAddress + '/' + method.url;
                        var startAt = new Date();
                        var json = 'json';
                        var ajax = (!me.options.isFake ? winJs.xhr({
                            type: method.method.toLowerCase(),
                            url: url,
                            dataType: (method.outputFormat || json).toLowerCase(),
                            data: method.requestFormat == json && typeof (inputData) != 'string' ? JSON.stringify(inputData) : inputData
                        }) : winJs.xhr({
                            type: 'GET',
                            url: url,
                            dataType: (method.outputFormat || json).toLowerCase(),
                        })).then(
                            function (xmlHttpRequest) {
                                var duration = new Date() - startAt;
                                me.log('Request to ' + url + ' is ' + xmlHttpRequest.status + ', duration = ' + duration / 1000 + 'sec, data: ', JSON.stringify(inputData), ', xhr: ', xmlHttpRequest);

                                var json = JSON.parse(xmlHttpRequest.responseText);
                                me.fixRef(json);

                                duration = new Date() - startAt;
                                me.log('parsing data from ' + url + ' , duration = ' + duration / 1000 + 'sec', xmlHttpRequest);

                                return json;

                            },
                            function (xmlHttpRequest) {
                                me.log('Request to ' + url + ' failed: ' + xmlHttpRequest.status, xmlHttpRequest, inputData);
                            }
                        );

                        ajax.description = method;

                        return ajax;
                    };

                    m.description = method;

                    return m;
                })(method);
            }
        },
    });

    winJs.Namespace.define('HabraWin', {
        ProxyBuilder: proxyBuilder
    });


})(WinJS, console)
