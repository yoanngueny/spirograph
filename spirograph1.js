// get canvas context
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var canvasWidthHalf = canvasWidth / 2;
var canvasHeightHalf = canvasHeight / 1.75;

// GUI
var gui = new dat.GUI();
var obj = {
  captureImage: function(){
    console.log("captureImage")
    var image = canvas.toDataURL("image/png");
    var w=window.open('about:blank','image from canvas');
    w.document.write("<img src='"+image+"' alt='from canvas'/>");
  },
};
gui.add(obj, 'captureImage');

// https://colorhunt.co/palette/225739
var foregroundGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
foregroundGrad.addColorStop(.2, '#008891');
foregroundGrad.addColorStop(.6, '#00587a');
foregroundGrad.addColorStop(1, '#0f3057');

//
var currentStep = 0;
var stepLength = 300;
var rotationStart = Math.PI * 1.5;
var rotationStep = Math.PI * 2 / stepLength;
var isBackward = false;

/**
 * Line to chain
 * @param  {number} size
 * @param  {number} speed
 * @param  {TODO} child
 */
var Line = function ({size, speed, child}) {
  this.size = size;
  this.speed = speed;
  this.childs = child ? [child] : [];
  this.positionStart = { x: 0, y: 0 };
  this.positionEnd = { x: 0, y: 0 };
  this.update = function(func, level, x, y, rotationStart, rotationCurrent) {
    this.level = level;
    this.positionStart.x = x;
    this.positionStart.y = y;
    this.positionEnd.x = this.positionStart.x + Math.cos(rotationStart + rotationCurrent * this.speed) * this.size;
    this.positionEnd.y = this.positionStart.y + Math.sin(rotationStart + rotationCurrent * this.speed) * this.size;
    this[func]();
    var child, level = this.level + 1;
    for (let i = 0, len = this.childs.length; i < len; i++) {
      child = this.childs[i];
      child.update(func, level, this.positionEnd.x, this.positionEnd.y, rotationStart, rotationCurrent);
    }
  }
  this.draw = function() {
    if (this.level > 1) {
      ctx.moveTo(this.positionStart.x, this.positionStart.y);
      // ctx.lineTo(this.positionStart.x, this.positionStart.y);
      ctx.lineTo(this.positionEnd.x, this.positionEnd.y);
    }
  };
  this.debug = function() {
    ctx.beginPath();
    ctx.arc(this.positionStart.x, this.positionStart.y, 5, 0, Math.PI * 2, 0);
    ctx.moveTo(this.positionStart.x, this.positionStart.y);
    ctx.lineTo(this.positionEnd.x, this.positionEnd.y);
    ctx.stroke();
  }
};

// Create chain
var chain = new Line({
  size: 150,
  speed: 1,
  child: new Line({
    size: 80,
    speed: -2,
    child: new Line({
      size: 80,
      speed: 4,
      child: null
    })
  })
});

/**
 * Manage drawing
 */
function update() {
  var step = isBackward ? stepLength - currentStep : currentStep;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = "#e7e7de";
  // ctx.fillStyle = foregroundGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.strokeStyle = foregroundGrad;
  ctx.beginPath();
  // ctx.lineWidth = 1;
  // ctx.moveTo(canvasWidthHalf, canvasHeightHalf);
  for (let i = 0; i < step; i++) {
  // for (let i = 0; i < stepLength; i++) {
    chain.update("draw", 0, canvasWidthHalf, canvasHeightHalf, rotationStart, i * rotationStep);
  }
  ctx.stroke();

  ctx.strokeStyle = "#000000";
  // ctx.lineWidth = 1;
  // chain.update("debug", 0, canvasWidthHalf, canvasHeightHalf, rotationStart, step * rotationStep);
}

/**
 * Call update at 60fps and loop current step
 */
var lastTime = Date.now();
var timeStep = 1000 / 60;
function loop() {
  window.requestAnimationFrame(loop);
  var currentTime = Date.now();
  var timeDiff = currentTime - lastTime;
  if (timeDiff >= timeStep) {
    lastTime = currentTime - (timeDiff - timeStep);
    update();
    currentStep++;
    if (currentStep >= stepLength) {
      currentStep = 0;
      isBackward = isBackward ? false : true;
    }
  }
}
loop();
