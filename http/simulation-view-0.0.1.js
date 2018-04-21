/*
Copyright 2018 Ola Benderius

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var g_centerNext = true;
var g_scale = 100;
var g_scrollX = 0;
var g_scrollY = 0;
var g_walls = [];
var g_path = [];

function setupSimulationView() {
  function getResourceFrom(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
  }

  var map = getResourceFrom("simulation-map.txt");
  map.trim().split(";").forEach(function(wall) {
    const wallArray = wall.trim().split(",");
    if (wallArray.length == 4) {
      g_walls.push(wallArray);
    }
  });

  var clicked = false;
  var clickX;
  var clickY;
  $('#simulation-canvas').on({
    'mousemove': function(e) {
      if (clicked) {
        const deltaX = clickX - e.pageX;
        const deltaY = clickY - e.pageY;

        if (e.ctrlKey) {
          g_scale += deltaY;
          if (g_scale < 10) {
            g_scale = 10;
          }
          if (g_scale > 500) {
            g_scale = 500;
          }
        } else {
          g_scrollX += deltaX;
          g_scrollY += deltaY;
        }
     
        clickX = e.pageX;
        clickY = e.pageY;
      }
    },
    'mousedown': function(e) {
      $('html').css('cursor', 'all-scroll');
      clicked = true;
      clickX = e.pageX;
      clickY = e.pageY;
    },
    'mouseup': function() {
      clicked = false;
      $('html').css('cursor', 'auto');
    },
    'dblclick': function(e) {
      g_centerNext = true;
    }
  });
}

function addSimulationViewData(data) {
  if (data.dataType == 1001) {

    const minPathStep = 0.2;

    const frame = data["opendlv_sim_Frame"];
    const x = frame["x"];
    const y = frame["y"];
    const yaw = frame["yaw"];

    if (g_path.length > 0) {
      const prevX = g_path[g_path.length - 1]["x"];
      const prevY = g_path[g_path.length - 1]["y"];
      const dX = x - prevX;
      const dY = y - prevY;
      if (Math.sqrt(dX * dX + dY * dY) > minPathStep) {
        g_path.push(frame);
      }
    } else {
      g_path.push(frame);
    }

    const width = 0.16;
    const length = 0.36;
    
    var canvas = document.getElementById("simulation-canvas");
    var context = canvas.getContext("2d");

    if (g_centerNext) {
      g_scrollX = -canvas.width / 2;
      g_scrollY = -canvas.height / 2;
      g_centerNext = false;
    }

    const sx = g_scale * x - g_scrollX;
    const sy = -g_scale * y - g_scrollY;
    const swidth = g_scale * width;
    const slength = g_scale * length;
    const syaw = -yaw;

    const hslength = slength / 2;
    const hswidth = swidth / 2;
    const fslength = slength / 4;

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (g_path.length > 0) {
      context.save();
      context.beginPath();
      context.strokeStyle = "#f22";
      context.moveTo(sx, sy);
      for(var i = g_path.length - 1; i >= 0; i--) {
        const prevFrame = g_path[i];
        const prevSx = g_scale * prevFrame["x"] - g_scrollX;
        const prevSy = -g_scale * prevFrame["y"] - g_scrollY;
        context.lineTo(prevSx, prevSy);
        context.stroke();
      }
      context.restore();
    }

    context.save();
    context.beginPath();
    context.lineWidth = 2;
    context.translate(sx, sy);
    context.rotate(syaw);
    context.rect(-hslength, -hswidth, slength, swidth);
    context.moveTo(fslength, hswidth);
    context.lineTo(hslength, 0);
    context.moveTo(fslength, -hswidth);
    context.lineTo(hslength, 0);
    context.stroke();
    context.restore();

    for (const wallKey in g_walls) {
      const sx1 = g_scale * g_walls[wallKey][0] - g_scrollX;
      const sy1 = -g_scale * g_walls[wallKey][1] - g_scrollY;
      const sx2 = g_scale * g_walls[wallKey][2] - g_scrollX;
      const sy2 = -g_scale * g_walls[wallKey][3] - g_scrollY;
    
      context.save();
      context.beginPath();
      context.lineWidth = 5;
      context.moveTo(sx1, sy1);
      context.lineTo(sx2, sy2);
      context.stroke();
      context.restore();
    }
  }
}
