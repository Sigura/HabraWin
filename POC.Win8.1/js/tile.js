;(function(winJs, ui, dom) {
    
    winJs.Namespace.define('HabraWin', {
        Tile: {
            wideSmallImageAndText03: function(img, text) {
                var tileXmlString = '<tile><visual version="1" lang="ru-RU" branding="logo">'
                    + '<binding template="TileWideSmallImageAndText03">'
                    + '<image id="1" src="' + img + '" alt="logo" />'
                    + '<text id="1">' + text + '</text>'
                    + '</binding>'
                    + '</visual></tile>';

                var tileDom = new dom.XmlDocument();
                tileDom.loadXml(tileXmlString);

                return new ui.Notifications.TileNotification(tileDom);
            },
            baseUrl: '',
            updateTile: function() {
                var tileUpdateManager = ui.Notifications.TileUpdateManager.createTileUpdaterForApplication();
                var me = this;
                var mesageAccepted = WinJS.Resources.getString('tileMessageAccepted').value;
                var mesageDenied = WinJS.Resources.getString('tileMessageDenied').value;

                tileUpdateManager.clear();
                tileUpdateManager.enableNotificationQueue(true);

                [
                    { Creator: { ID: '30BD3259-EF01-4ebb-ACEE-5065EB2885E1', Photo: true }, Description: mesageAccepted },
                    { Creator: { ID: 'A2021DFE-1271-41d1-9A90-A64039A8A5E6', Photo: true }, Description: mesageDenied }
                ].forEach(function(comment) {
                    var img = (comment.Creator && comment.Creator.Photo && (me.baseUrl + '/clients/photos/' + comment.Creator.ID)) || 'appx:///images/empty.png';
                    var text = (comment.Description) || '...';
                    var tile = me.wideSmallImageAndText03(img, text);
                    tileUpdateManager.update(tile);
                });
            }
        }
    });

})(WinJS, Windows.UI, Windows.Data.Xml.Dom)