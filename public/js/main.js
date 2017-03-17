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

    //add the event listener for the learn more button.
    var setLearnMoreEventHandler = function() {
        var learnMoreButton = document.querySelector('#learn-more');

        learnMoreButton.addEventListener('click', function() {
            fin.desktop.System.openUrlWithBrowser('https://openfin.co/developers/javascript-api/');
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
            setLearnMoreEventHandler();
            subscribeToInterAppBus();

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

            var application = fin.desktop.Application.getCurrent();
            /* jshint -W087 */
            //debugger;

            setTrayIcon(application, "img/1.png");

            var childApp = new fin.desktop.Application({
                url: "http://localhost:5000/sub/test.html",
                uuid: "74BED629-2D8E-4141-8582-73E364BDFA74",
                name: "Application Name",
                mainWindowOptions: {
                    defaultHeight: 600,
                    defaultWidth: 800,
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
                console.log(`Error creating application: ${error}`);
            });
        });
    });

    function log(data) {
        console.log('>>>>>>>>>>>>>>>>>>>>> ', data);
    }

    function setTrayIcon(application, path) {
        var filename = path.match(/^(.*\/)?(.*)\./)[2]; // extract just the filename (chars between last slash and last period)
        application.window.getAbsolutePath(path, log);
        application.setTrayIcon(path, function(clickInfo) {
            console.log(`The mouse has clicked ${filename} at (${clickInfo.x},${clickInfo.y})`);
        }, function(error) {
            console.log(`Tray icon ${filename} set`);
        }, function(error) {
            console.log(`Error setting tray icon ${filename}: ${error}`);
        });
    }
}());
