(function (winJs) {
    'use strict';

    var baseForm = winJs.Class.define(winJs.Utilities.defaultControlConstructor(), {
        init: function (element, options) {
            var me = this;

            //me.clearForm();

            me.defineElements(element);
            me.defineEvents();
            me.subscribe();

            me.setValues(options);

            me.ready();
        },
        ready: function () {
        },
        defineElements: function (element) {
        },
        getValue: function (lbl) {
            var field = this.fields[lbl];

            return field && field[('type' in field) && field.type === 'checkbox' ? 'checked' : ('value' in field ? 'value' : 'current')];
        },
        getValues: function () {
            var values = {};

            for (var lbl in this.fields) {
                if (this.fields.hasOwnProperty(lbl) && this.fields[lbl]) {
                    values[lbl] = this.getValue(lbl);
                }
            }

            return values;
        },
        setValues: function (values) {
            if (!values) {
                return;
            }

            for (var lbl in values)
                if (values.hasOwnProperty(lbl) && this.fields.hasOwnProperty(lbl)) {
                    var field = this.fields[lbl];
                    var value = values[lbl];
                    var valPropName = field && ('type' in field) && field.type === 'checkbox' ? 'checked' : (field && 'value' in field ? 'value' : 'current');

                    if (field)
                        field[valPropName] = value;
                }
        },
        defineEvents: function () {
        },
        clearForm: function () {
            var me = this;

            var fields = Array.prototype.slice.call(me.element.querySelectorAll('input[type=text],select'), 0);

            fields.forEach(function (e) {
                e.value = '';
            });
        },
        subscribe: function () {
        }
    });

    winJs.Namespace.define('HabraWin', {
        BaseForm: baseForm
    });


})(WinJS);