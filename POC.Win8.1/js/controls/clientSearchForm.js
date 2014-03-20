(function (winJs) {
    'use strict';

    var searchForm = winJs.Class.derive(HabraWin.BaseForm, winJs.Utilities.defaultControlConstructor(), {
        init: function (element, options) {
            var me = this;

            me.initProperies();

            me.clearForm();

            me.defineElements(element);
            me.defineEvents();
            me.subscribe();

            me.setValues(options);
            me.search();
        },
        defineElements: function (element) {
            var me = this;

            me.fields = {
                secondName: element.querySelector('input[name=secondName]')
            };

            me.buttons = {
                clear: element.querySelector('button[name=clear]')
            };


            var values = this.getValues();

            this.oldValues = JSON.stringify(values);
        },
        defineEvents: function () {
            var me = this;

            me.buttons.clear.addEventListener('click', me.clearAndSearch.bind(me));
        },
        setValues: function (values) {
            if (!values) {
                return;
            }
            this.changedFields = [];

            for (var lbl in values)
                if (values.hasOwnProperty(lbl) && this.fields.hasOwnProperty(lbl)) {
                    var field = this.fields[lbl];
                    var value = values[lbl];
                    var valPropName = field && ('type' in field) && field.type === 'checkbox' ? 'checked' : (field && 'value' in field ? 'value' : 'current');

                    if (!field) {
                        continue;
                    }
                    field[valPropName] = value;
                    value && this.changedFields.push(lbl);
                }
        },
        subscribe: function () {
            var me = this;

            for (var lbl in this.fields)
                if (this.fields.hasOwnProperty(lbl)) {
                    var field = this.fields[lbl];
                    var isTextField = 'value' in field;

                    field.addEventListener(isTextField ? 'keydown' : 'change', me.fieldChanged.bind(me));
                    field.addEventListener(isTextField ? 'keydown' : 'change', isTextField ? me.search.bind(me).defer(1000) : me.search.bind(me));

                    if (isTextField) {
                        ['cut', 'paste', 'change'].forEach(function (e) {
                            field.addEventListener(e, me.fieldChanged.bind(me));
                        });
                    }
                }

            winJs.bus.addEventListener('clear-command', me.clearAndSearch.bind(me));
        },
        clearAndSearch: function () {
            this.clearForm();
            this.search();
        },
        addNewClient: function () {
            var values = this.getValues();

            winJs.Navigation.navigate("/pages/section/section.html", values);
        },
        getValues: function () {
            var me = this;
            var values = {};

            this.changedFields.forEach(function (lbl) {
                values[lbl] = me.getValue(lbl);
            });

            return values;
        },
        search: function () {
            var values = this.getValues();

            winJs.bus.dispatchEvent('search-client', values);

            this.oldValues = JSON.stringify(values);
        },
        clearForm: function () {
            var me = this;

            var fields = Array.prototype.slice.call(me.element.querySelectorAll('input[type=text],select'), 0);

            fields.forEach(function (e) {
                e.value = '';
            });

            var current = new Date();

            me.fields && me.fields.birthday && (me.fields.birthday.current = new Date(current.setYear(current.getFullYear() - 24)));

            this.changedFields = [];
        },
        fieldLabel: function (field) {
            return field && (field.getAttribute('name') || field.id);
        },
        fieldChanged: function (e) {
            var field = e && e.currentTarget;
            var lbl = this.fieldLabel(field);

            if (!(lbl in this.fields))
                return;

            var value = this.getValue(lbl);

            if (!value) {
                this.changedFields.remove(lbl);
                return;
            }

            if (this.changedFields.indexOf(lbl) === -1) {
                this.changedFields.push(lbl);
            }
        },
        initProperies: function () {
        }
    });


    winJs.Namespace.define('HabraWin', {
        ClientSearchForm: searchForm
    });


})(WinJS);