# opendlv-ui-default

The opendlv-ui-default is a basic HTTP/Websocket implementation that hands out web content from static files in a folder, and connects to a running OpenDLV session for bi-directional data transmission. 

## Dependencies

The microservice depends on [opendlv-ui-server](https://github.com/chalmers-revere/opendlv-ui-server).

## Usage

This microservice is created automatically on changes to this repository via
Docker's public registry for:
* [x86_64](https://hub.docker.com/r/chalmersrevere/opendlv-ui-default-amd64/tags/)
* [armhf](https://hub.docker.com/r/chalmersrevere/opendlv-ui-default-armhf/tags/)
* [aarch](https://hub.docker.com/r/chalmersrevere/opendlv-ui-default-aarch/tags/)

To use this microservice for hosting web content from a folder and for bi-directional
messaging using the OpenDLV standard message set that are exchanged in a running OpenDLV.io session
(running at 111 in the example), simply run it as follows:

```
docker run --rm --init --net=host --name=opendlv-ui-default -v ${PWD}/http:/srv/http -p 8000:8000 chalmersrevere/opendlv-ui-default-amd64:v0.0.5 opendlv-ui-default --http-root=/srv/http --port=8000 --cid=111
```

Now, point your webbrowser to the IP address and port 8000 where you
started this microservice to see any currently exchanged messages.

## License
This project is released under the terms of the GNU GPLv3 License - [![License: GPLv3](https://img.shields.io/badge/license-GPL--3-blue.svg
)](https://www.gnu.org/licenses/gpl-3.0.txt)
