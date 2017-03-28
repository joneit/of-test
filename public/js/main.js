(function() {
    'use strict';

    //set the adapter ready UI indicator
    var updateAdapterIndicator = function() {
        var statusIndicator = document.querySelector('#status-indicator');
        statusIndicator.classList.toggle("online");
    };

    //set the OpenFin version number on the page
    var setVersionNumber = function() {
        var versionNumberContainer = document.querySelector('#version-number-container'),
            ofVersion = document.querySelector('#of-version');

        fin.desktop.System.getVersion(function(version) {
            ofVersion.innerText = version;
            versionNumberContainer.classList.toggle('invisible');
        });
    };

    var setVisibilityDisplayOnce = function() {
        document.querySelector('#inter-app-messages').style.display = 'block';
        setVisibilityDisplayOnce = function() {};
    };

    var subscribeToInterAppBus = function() {
        var messageCtrl = document.querySelector('#message'),
            timeStampCtrl = document.querySelector('#time');

        fin.desktop.InterApplicationBus.subscribe('*', 'inter:app:sub', function(msg) {
            setVisibilityDisplayOnce();
            messageCtrl.innerText = msg.message;
            timeStampCtrl.innerText = new Date(msg.timeStamp).toLocaleTimeString();
        });
    };

    var createIframe = () => {
        var testframe = document.createElement('iframe');
        testframe.setAttribute('width', 200);
        testframe.setAttribute('height', 200);
        testframe.setAttribute('src', 'about:blank');
        testframe.setAttribute('name', 'testframe');
        testframe.setAttribute('id', 'testframe');
        testframe.setAttribute('style', 'position: absolute; top: 75px; left: 575px; background-color: orange; border: 2px solid black; box-shadow: 3px 6px 12px #863; border-radius: 999px');

        document.body.appendChild(testframe);

        return testframe.contentWindow;
    };

    //event listeners.
    document.addEventListener('DOMContentLoaded', function() {
        //OpenFin is ready
        fin.desktop.main(function() {
            //update UI and set event handlers.
            updateAdapterIndicator();
            setVersionNumber();
            subscribeToInterAppBus();
            setChildWinEventHandler();
            setChildAppEventHandler();

            /*
            fin.desktop.Window.getCurrent().getOptions(o => console.log('main: ', o));

            var iframe = createIframe();

            iframe.fin.desktop.Window.getCurrent().getOptions(o => console.log('child: ', o));

            var yes = () => console.log('yes');
            var no = () => console.log('no');

            fin.desktop.Window.getCurrent().moveTo(50, 50, function() {}, no);

            setTimeout(function() {
                iframe.fin.desktop.Window.getCurrent().moveTo(100, 100, function() {

                    // as per 5.0 we expect this to fail
                    fin.desktop.Window.getCurrent().moveTo(150, 150, no, yes);
                }, no);
            }, 2000);
            */

            setTrayIcon(fin.desktop.Application.getCurrent(), "img/1.png");
        });
    });

    var setChildWinEventHandler = function() {
        var learnMoreButton = document.querySelector('#child-win');

        learnMoreButton.addEventListener('click', function() {
            var path = fin.desktop.Window.getCurrent().contentWindow.location.href,
                childWin = new fin.desktop.Window({
                    name: getRandomGUID(),
                    url: path, //path.replace(/[^/]*$/, 'sub/test.html'), // replace all chars following last '/'
                    autoShow: true,
                    // defaultWidth: 800,
                    // defaultHeight: 500,
                    defaultTop: 300,
                    defaultLeft: 300,
                    frame: true,
                    resizable: false,
                    state: "normal"
                }, function() {}, function(error) {
                    console.log(`Error creating child window: ${error}`);
                });
        });
    };

    var setChildAppEventHandler = function() {
        var childAppButton = document.querySelector('#child-app');

        childAppButton.addEventListener('click', function() {
            var application = fin.desktop.Application.getCurrent(),
                path = application.window.contentWindow.location.href,
                childApp = new fin.desktop.Application({
                    url: path, //path.replace(/[^/]*$/, 'sub/test.html'), // replace all chars following last '/'
                    uuid: getRandomGUID(),
                    name: "Application Name",
                    mainWindowOptions: {
                        // defaultWidth: 800,
                        // defaultHeight: 500,
                        defaultTop: 300,
                        defaultLeft: 300,
                        autoShow: true
                    }
                }, function() {
                    console.log("Child application successfully created");
                    childApp.run(function() {
                        setTrayIcon(childApp, "img/2.png");
                        //childApp.window.nativeWindow
                    });
                }, function(error) {
                    console.log(`Error creating child application: ${error}`);
                });
        });
    };

    function log(data) {
        console.log('>>>>>>>>>>>>>>>>>>>>> ', data);
    }

    function setTrayIcon(application, path) {
        var filename = path.match(/^(.*\/)?(.*)\./)[2]; // extract just the filename (chars between last slash and last period)
        application.window.getAbsolutePath(path, log);
        application.setTrayIcon('', function(clickInfo) {
            console.log(`The mouse has clicked ${filename} at (${clickInfo.x},${clickInfo.y})`);
        }, function(error) {
            console.log(`Tray icon ${filename} set`);
        }, function(error) {
            console.log(`Error setting tray icon ${filename}: ${error}`);
        });
    }

    function getRandomGUID() {
        return [8, 4, 4, 4, 12].map(n => Math.floor((1 + Math.random()) * Math.pow(16, n)).toString(16).toUpperCase().substr(1)).join('-');
    }
}());
