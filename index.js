;(function() {
  var app = document.getElementById('app');

  var moInternal = createElementAndAppendTo('moInternal', app); 
  var moAccel = createElementAndAppendTo('moAccel', app);
  var moAccelGrav = createElementAndAppendTo('moAccelGrav', app);
  var moRotation = createElementAndAppendTo('moRotation', app);
  var moInterval = createElementAndAppendTo('moInterval', app);
  var moApi = createElementAndAppendTo('moApi', app);

  var garden = createElementAndAppendTo('garden', app);
  var ball = createElementAndAppendTo('ball', garden);

  var styles = {
    gardenStyles: {
      position: 'relative',
      width : '200px',
      height: '200px',
      border: '5px solid #CCC',
      borderRadius: '10px',
    },
    ball: {
      position: 'absolute',
      top: '90px',
      left: '90px',
      width: '20px',
      height: '20px',
      background: 'aqua',
      borderRadius: '100%',
    }
  }
  
  applyStylesToElem(garden, styles.gardenStyles);
  applyStylesToElem(ball, styles.ball);

  function applyStylesToElem(elem, style = {}) {
    Object.keys(style).forEach(function(st) {
      elem.style[st] = style[st]
    });
  }

  app.appendChild(moInternal);

  function createElementAndAppendTo(id, parent) {
      var elm = document.createElement('div');
      elm.setAttribute('id', id);
      parent.appendChild(elm);
      return elm;
  }

  if ('LinearAccelerationSensor' in window && 'Gyroscope' in window) {
    let lastReadingTimestamp;
    let accelerometer = new LinearAccelerationSensor();
    
    accelerometer.addEventListener('reading', e => {
      if (lastReadingTimestamp) {
        intervalHandler(
          Math.round(accelerometer.timestamp - lastReadingTimestamp)
        );
      }
      lastReadingTimestamp = accelerometer.timestamp;
      accelerationHandler(accelerometer, moAccel);
    });

    accelerometer.start();

    if ('GravitySensor' in window) {
      let gravity = new GravitySensor();
      gravity.addEventListener('reading', e =>
        accelerationHandler(gravity, moAccelGrav)
      );
      gravity.start();
    }

    let gyroscope = new Gyroscope();
    gyroscope.addEventListener('reading', e =>
      rotationHandler({
        alpha: gyroscope.x,
        beta: gyroscope.y,
        gamma: gyroscope.z,
      })
    );
    gyroscope.start();
  } else if ('DeviceMotionEvent' in window) {
    moApi.innerHTML = 'Device Motion API';

    var onDeviceMotion = function(eventData) {
      accelerationHandler(eventData.acceleration, moAccel);
      accelerationHandler(eventData.accelerationIncludingGravity, moAccelGrav);
      rotationHandler(eventData.rotationRate);
      intervalHandler(eventData.interval);
    };

    window.addEventListener('devicemotion', onDeviceMotion, false);
  } else {
    moApi.innerHTML =
      'No Accelerometer & Gyroscope API available';
  }

  function accelerationHandler(acceleration, targetElem) {
    var info,
      xyz = '[X, Y, Z]';

    info = xyz.replace('X', acceleration.x && acceleration.x.toFixed(3));
    info = info.replace('Y', acceleration.y && acceleration.y.toFixed(3));
    info = info.replace('Z', acceleration.z && acceleration.z.toFixed(3));
    targetElem.innerHTML = info;
  }

  function rotationHandler(rotation) {
    var info,
      xyz = '[X, Y, Z]', rotation;

    info = xyz.replace('Z', rotation.alpha && rotation.alpha.toFixed(3));
    info = info.replace('X', rotation.beta && rotation.beta.toFixed(3));
    info = info.replace('Y', rotation.gamma && rotation.gamma.toFixed(3));

    rotation = {
      X: rotation.beta && rotation.beta.toFixed(3) || 0,
      Y: rotation.gamma && rotation.gamma.toFixed(3) || 0
    }
    moveBall(rotation);
    moRotation.innerHTML = info;
  }

  var maxX = garden.clientWidth - ball.clientWidth;
  var maxY = garden.clientHeight - ball.clientHeight;

  function moveBall(rotation) {
    var x = rotation['X'];
    var y = rotation['Y'];

    if(typeof x === 'Number' && typeof y === 'Number') {
      if(x > 90) {
        x = 90;
      };
  
      if(y < -90) {
        y = -90
      }
  
      x += 90;
      y += 90;
  
      ball.style.top = (maxX * x /180 - 10) + 'px';
      ball.style.left = (maxY * y /180 - 10) + 'px';
    }

    
  }

  function intervalHandler(interval) {
    moInternal.innerHTML = interval;
  }
})();
