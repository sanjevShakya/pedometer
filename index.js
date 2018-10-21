;(function() {
  var app = document.getElementById('app');

  var moInternal = createElementAndAppend('moInternal'); 
  var moAccel = createElementAndAppend('moAccel');
  var moAccelGrav = createElementAndAppend('moAccelGrav');
  var moRotation = createElementAndAppend('moRotation');
  var moInterval = createElementAndAppend('moInterval');
  var moApi = createElementAndAppend('moApi');

  app.appendChild(moInternal);

  function createElementAndAppend(id) {
      var elm = document.createElement('div');
      elm.setAttribute('id', id);
      app.appendChild(elm);
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
      xyz = '[X, Y, Z]';

    info = xyz.replace('X', rotation.alpha && rotation.alpha.toFixed(3));
    info = info.replace('Y', rotation.beta && rotation.beta.toFixed(3));
    info = info.replace('Z', rotation.gamma && rotation.gamma.toFixed(3));
    moRotation.innerHTML = info;
  }

  function intervalHandler(interval) {
    moInternal.innerHTML = interval;
  }
})();
