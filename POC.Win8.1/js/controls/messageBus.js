// делаем замыкание, так же для того чтоб описать зависимости
// и иметь возможность подменить их, если когда-нибудь мы захотим использовать
// этот код в другом приложении
(function (winJs) {
    'use strict';
    // создаём класс
    var bus = winJs.Class.define(winJs.Utilities.defaultConstructor(), {
        init: function (element, options) {
            var me = this;
        }
    });

    // добавляем в него возможность отправлять и принимать сообщения
    winJs.Class.mix(bus, winJs.Utilities.eventMixin);

    // добавляем шину в общий доступ 
    winJs.Namespace.define('HabraWin', {
        MessageBus: bus
    });

})(WinJS);