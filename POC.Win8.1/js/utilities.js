(function (winJs) {

    winJs.Namespace.define('WinJS.Utilities',
    {
        defaultConstructor: function () {

            return function (options) {

                this.options = this.options || {};
                var def = this.def;

                if (def) for (var name in def) {
                    if (def.hasOwnProperty(name))
                        this.options[name] = def[name];
                }

                for (var name in options) {
                    if (options.hasOwnProperty(name))
                        this.options[name] = options[name];
                }

                return this.init(options);
            };
        }, defaultControlConstructor: function () {

            return function (element, options) {

                this.element = element;
                this.options = this.options || {};
                var def = this.def;

                if (def) for (var name in def) {
                    if (def.hasOwnProperty(name))
                        this.options[name] = def[name];
                }

                for (var name in options) {
                    if (options.hasOwnProperty(name))
                        this.options[name] = options[name];
                }

                return this.init(element, options);
            };
        }
    });

    var log = winJs.log;

    winJs.log = function (message, tag, type) {

        var args = Array.prototype.slice.call(arguments, 0);

        log && log.apply(this, args);
        window.console && window.console.log && window.console.log.apply(window.console, args);

        var isError = (type === 'error');
        var isStatus = (type === 'status');
        var statusDiv = document.getElementById('status-message');

        if (!statusDiv) return;

        var item = document.createElement('div');

        item.innerText = message;
        if (isError) {
            item.classList.add('error');
        } else if (isStatus) {
            item.classList.add('status');
        } else {
            item.classList.add('log');
        }

        statusDiv.appendChild(item);
    };

    Array.prototype.select = Array.prototype.select || function (select) {
        var result = [];

        for (var i = 0, len = this.length; i < len; ++i) {
            var item = this[i];

            result.push(select.call(item, item, i));
        }
        return result;
    };
    Array.prototype.condition = Array.prototype.condition || function (condition) {
        var result = [];

        for (var i = 0, len = this.length; i < len; ++i) {
            var item = this[i];

            if (condition.call(item, item, i))
                result.push(item);
        }
        return result;
    };

    Function.prototype.defer = Function.prototype.defer || function (interval, scope, args) {
        var me = this;
        var timer;
        interval = interval || 333;

        return function () {
            clearTimeout(timer);

            args = args || Array.prototype.slice.call(arguments, 0);
            args.unshift(this);

            return timer = setTimeout(function () {
                me.call(scope, this, args);
            }, interval);
        };
    };

    Array.prototype.remove = Array.prototype.remove || function (item) {
        var index = this.indexOf(item);

        if (index === -1)
            return;

        this.splice(index, 1);
    };

    String.prototype.format = String.prototype.format || function () {
        var args = Array.prototype.slice.call(arguments, 0);
        var result = '' + this;

        args.forEach(function (a, i) {
            result = result.replace(new RegExp("\\{" + i + "\\}", 'mg'), a);
        });

        return result;
    };
    String.prototype.firstLetterToUpper = String.prototype.firstLetterToUpper || function () {
        var result = '' + this;

        if (!result || !result.length) {
            return result;
        }

        result = result.substr(0, 1).toUpperCase() + result.substr(1);

        return result;
    };

})(WinJS);