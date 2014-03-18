(function (winJs, applicationModel, storage, foundation, msApp, graphics) {
    'use strict';

    winJs.UI.Pages.define('/pages/client/client.html', {
        processed: function(element) {
            return winJs.Resources.processAll(element);
        },
        className: 'client-page',
        ready: function(element, options) {
            this.initEnv(element, options);

            this.initAppBar(element, options);
            this.subscribe(element, options);

            this.process(element, options);

        },
        initAppBar: function(element) {
            var me = this;
        },
        subscribe: function() {
            var me = this;
            var dataTransferManager = applicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            var printManager = graphics.Printing.PrintManager.getForCurrentView();

            me.addRemovableEventListener(dataTransferManager, 'datarequested', me.share.bind(me), true);
            me.addRemovableEventListener(printManager, 'printtaskrequested', me.print.bind(me), true);
        },
        process: function (element, options) {
            return winJs.Promise.join([
                winJs.Binding.processAll(element, options),
                winJs.UI.processAll
            ]);
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
            capture = capture !== true ? true: false;

            e.addEventListener(eventName, handler, capture);

            this._eventHandlerRemover.push(function () {
                e.removeEventListener(eventName, handler);
            });
        },
        updateLayout: function (element) {
            // TODO: Respond to changes in layout.
        },
        initEnv: function (element, options) {
            this.options = options || {};

            this.element.classList.add(this.className);
            this._eventHandlerRemover = [];
        },
        print: function (printEvent) {
            var printTask = printEvent.request.createPrintTask('Print', function (args) {
                var source = msApp.getHtmlPrintDocumentSource(document);

                args.setSource(source);

                printTask.oncompleted = function(e) {
                    if (printEvent.completion === graphics.Printing.PrintTaskCompletion.failed) {
                        winJs.log('error while print', printEvent, e);
                    } else {
                        winJs.log('printed', printEvent, e);
                    }
                };
            });
        },
        sharedInfo: function() {
            var element = window.document.createElement('DIV');
            var clientInfo = this.options;
            var me = this;
            var img = this.element.querySelector('img');
            var imgCopy = img && img.cloneNode(true);

            [
                clientInfo && me.header('clientInfo'),
                clientInfo && me.dumpObjectAsElement(clientInfo)
            ].forEach(function (item, i) {
                item && element.appendChild(item);
            });

            img && img.parentNode.replaceChild(imgCopy, img);
            img && element.appendChild(img);

            return element;
        },
        share: function (e) {
            var me = this;
            var request = e.request;
            var deferral = request.getDeferral();
            var element = me.sharedInfo();
            var clientInfo = this.options;

            request.data.properties.title = (clientInfo && clientInfo.name) || '';
            request.data.properties.description = request.data.properties.title;

            me.createPackage(element, request.data);

            deferral.complete();
        },
        createPackage: function (domElement, dataPackage) {
            dataPackage = dataPackage || new applicationModel.DataTransfer.DataPackage();
            var text = domElement.innerText;
            var htmlFragment = domElement.innerHTML;
            var htmlFormat = applicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(htmlFragment);
            var images = domElement.querySelectorAll && domElement.querySelectorAll('img');

            dataPackage.setText(text);

            if (htmlFormat) {
                dataPackage.setHtmlFormat(htmlFormat);
                images && Array.prototype.slice.call(images)
                    .forEach(function (img) {
                        var imagePath = img.src;
                        var imageUri = new foundation.Uri(imagePath);
                        var streamRef = storage.Streams.RandomAccessStreamReference.createFromUri(imageUri);
                        dataPackage.resourceMap.insert(imagePath, streamRef);
                    });
            }

            return dataPackage;
        },
        dumpObjectAsElement: function (obj, format) {
            var i = 0;
            var ul = window.document.createElement('UL');
            for (var lbl in obj) if (obj.hasOwnProperty(lbl) && obj[lbl] && typeof (obj[lbl]) === 'string') {
                var li = window.document.createElement('LI');
                var label = window.document.createElement('SPAN');
                var value = window.document.createElement('SPAN');
                var resource = winJs.Resources.getString(!format ? ('clientForm' + lbl.firstLetterToUpper() + 'Label') : format.format(lbl.firstLetterToUpper()));
                if (!resource || resource.empty || !resource.value)
                    continue;
                label.appendChild(window.document.createTextNode((resource && resource.value) + ': '));
                value.appendChild(window.document.createTextNode(obj[lbl]));
                li.appendChild(label);
                li.appendChild(value);
                ul.appendChild(li);
                ++i;
            }
            return ul.childNodes.length && ul;
        },
        header: function (lbl) {
            var h3 = window.document.createElement('H3');
            var resource = winJs.Resources.getString(lbl);
            if (!resource || resource.empty || !resource.value)
                return false;
            h3.appendChild(window.document.createTextNode(resource.value));
            return h3;
        }
    });
})(WinJS, Windows.ApplicationModel, Windows.Storage, Windows.Foundation, MSApp, Windows.Graphics);