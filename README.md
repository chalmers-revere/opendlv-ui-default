# opendlv-ui-default

The opendlv-ui-default is a basic HTTP/Websocket implementation that hands out web content from static files in a folder, and connects to a running OpenDLV session for bi-directional data transmission. 

## Dependencies

The microservice depends on [opendlv-ui-server](https://github.com/chalmers-revere/opendlv-ui-server).

## Usage

This microservice is created automatically on changes to this repository via
Docker's public registry for:
* [x86_64, armhf, aarch](https://hub.docker.com/r/chalmersrevere/opendlv-ui-default-multi/tags/)

To use this microservice for hosting web content from a folder and for bi-directional
messaging using the OpenDLV standard message set that are exchanged in a running OpenDLV session
(running at 111 in the example), simply run it as follows:

```
docker run --rm --init --net=host --name=opendlv-ui-default -v ${PWD}/http:/srv/http -p 8000:8000 chalmersrevere/opendlv-ui-default-multi:v0.0.6 opendlv-ui-default --http-root=/srv/http --port=8000 --cid=111
```

Now, point your webbrowser to the IP address and port 8000 where you
started this microservice to access the hosted files.

## HTML and JavaScript examples

To run any of the examples below, save it as [i]index.html[/i] in a folder called [i]http[/i] and run the docker command above. In the folder, the following files needs also to be present (or any later versions):
* [libcluon.js](https://bintray.com/chrberger/libcluon/javascript#files)
* [opendlv.odvd](https://github.com/chalmers-revere/opendlv.standard-message-set/releases)


### Minimum example

This example shows how to connect to a running OpenDLV conference and how to read and write messages to that conference. To run the example, start <strong>one instance</strong> of the opendlv-ui-default with the below web content. Make sure to include the opendlv.odvd and libcluon.js files in the http folder. Then, open two browser tabs or pages pointing at http://localhost:8000. The two pages will be to clients connected to the UI default server, and messages that are being sent from one browser is received by all other connected browsers.

```
<!DOCTYPE html>
<html>
  <head>
    <title>Simple chat using the default OpenDLV UI server</title>
    <meta charset="UTF-8">
    <meta name="author" content="Ola Benderius">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>

  <body>
    <h3>Simple chat using the default OpenDLV UI server</h3>
    <textarea id="messages" rows="10" cols="30" readonly></textarea> 

    <div style="margin-top: 20px;">
      <input id="message" type="text"> 
      <button id="send">Send</button>
    </div>

    <script type="text/javascript" src="libcluon.js"></script>
    <script>
      window.onload = function () {
        var lc = libcluon();

        if ("WebSocket" in window) {
          // Connect to the Websockets link. NOTE: the protocol name needs to be 'od4'
          var ws = new WebSocket("ws://" + window.location.host + "/", "od4");
          ws.binaryType = 'arraybuffer';

          ws.onopen = function() {
            onStreamOpen(ws, lc);
          }

          ws.onmessage = function(evt) {
            onMessageReceived(lc, evt.data);
          };

          ws.onclose = function() {
            onStreamClosed();
          };

          document.getElementById("send").addEventListener("click", function () {
            const msg = document.getElementById("message").value;
            if (msg) {
              const dataType = 1101;
              const code = 0;
              const description = msg;
              const messageJson = "{\"code\":" + code + ",\"description\":\"" + description + "\"}";
        
              const senderStamp = 0;
              const message = lc.encodeEnvelopeFromJSONWithoutTimeStamps(messageJson, dataType, senderStamp);
              strToAb = str =>
                new Uint8Array(str.split('')
                  .map(c => c.charCodeAt(0))).buffer;
              ws.send(strToAb(message), { binary: true });
              
              document.getElementById("messages").value += "You: " + msg + "\n";
            }
          });

        } else {
          console.log("Error: websockets not supported by your browser.");
        }
      }

      function onStreamOpen(ws, lc) {
        function getResourceFrom(url) {
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.open("GET", url, false);
          xmlHttp.send(null);
          return xmlHttp.responseText;
        }

        // Request the odvd file from the server, and load it in the browser
        var odvd = getResourceFrom("opendlv.odvd");

        console.log("Connected to stream.");
        console.log("Loaded " + lc.setMessageSpecification(odvd) + " messages from specification.");
      }

      function onStreamClosed() {
        console.log("Disconnected from stream.");
      }

      function onMessageReceived(lc, msg) {
        var data_str = lc.decodeEnvelopeToJSON(msg);
        if (data_str.length == 2) {
          return;
        }

        d = JSON.parse(data_str);

        if (d.dataType == 1101) {
          const code = d['opendlv_system_SystemOperationState']['code'];
          const description = d['opendlv_system_SystemOperationState']['description'];
          document.getElementById("messages").value += "They: " + description + "\n";
        }
      }
    </script>
  </body>
</html>
```

## License
This project is released under the terms of the GNU GPLv3 License - [![License: GPLv3](https://img.shields.io/badge/license-GPL--3-blue.svg
)](https://www.gnu.org/licenses/gpl-3.0.txt)
