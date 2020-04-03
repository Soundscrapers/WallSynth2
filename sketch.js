let fatOsc, tom, feedbackDelay, struck, limiter; //tone objects
let fbD, fatFreq, fDel; //tone variables

let wave, level, levelAvg; //sound analysis

let bdrop; //visuals

let playButton, stopButton, chooseNote, slider, toggleOnOff; //dom elements

let lX, rX, tY, bY; //bounds of black wall
let pingX, pingY, isPinged, isPinging, radius; //drawing variables
let sc; //scale the entire scene
let mouseIn; //mouse boolean

function preload() {
  bdrop = loadImage("wallbackground1.png");
}

function setup() {

  //initialize variables/modes
  sc = 1.5;
  radius = 2;
  angleMode(DEGREES);
  isPinged = false;
  frameRate(20);


  //initialize canvas
  createCanvas(1200 / sc, 800 / sc);
  background(220);
  image(bdrop, 0, 0, 1200 / sc, 800 / sc);
  lX = 96 / sc;
  rX = (width - (84 / sc));
  tY = 84 / sc;
  bY = (height - (158 / sc));

  //initialize sounds

  // fatOsc = new Tone.FatOscillator("Ab3", "sine", 40).toMaster().start();
  fbD = 0.3;
  fDel = 0.2
  fatFreq = 100;

  tom = new Tone.MembraneSynth({
    // "type" : square,
    "octaves": 2,
    "pitchDecay": 0.7,
    "attack": 0.4
  })
  var ampEnv = new Tone.AmplitudeEnvelope({
    "attack": 0.1,
    "decay": 2.5,
    "sustain": 1.0,
    "release": 0.8
  }).toDestination();
  tom.connect(ampEnv);

  // var freeverb = new Tone.Freeverb().toDestination();
  // freeverb.dampening.value = 500;
  // freeverb.roomSize = 0.8;
  // tom.connect(freeverb);

  struck = new Tone.PluckSynth({
    "attackNoise": 0.9,
    "dampening": 2000,
    "resonance": 0.4
  })
  // struck.connect(feedbackDelay);
  struck.toDestination();


  // struck.connect(freeverb);

  // slider = createSlider(1, 12, 3, 1).position(60, 30);

  wave = new Tone.Analyser('waveform', 64);
  // feedbackDelay.connect(wave);
  tom.connect(wave);
  struck.connect(wave);

}

function draw() {

  level = wave.getValue();
  let levelAdd = 0;
  // console.log(level);
  for (let i = 0; i < level.length; i++) {
    levelAdd = levelAdd + level[i];
  }
  levelAvg = abs(levelAdd / level.length);
  // console.log(levelAvg);
  stroke(230);
  noFill();
  // rect(lX, tY, rX - lX, bY - tY);//test rectangle
  checkMouse();
  checkPing();
  drawPing(radius);
  // fatOsc.count = slider.value();
  // console.log(slider.value());
  // ghost out previous lines (black, alpha)
  stroke(5, 10);
  fill(20, 10);
  rect(lX, tY, rX - lX, bY - tY);

}

function checkMouse() {
  // console.log("X: " + mouseX + "+ Y: " + mouseY);
  if (mouseX > lX && mouseX < rX && mouseY > tY && mouseY < bY) {
    // ellipse(mouseX, mouseY, 20);
    mouseIn = true;
  } else {
    mouseIn = false;
  }
}

function mousePressed() {
  // console.log("click");
  if (mouseIn && !isPinging) {
    pingX = mouseX;
    pingY = mouseY;
    isPinged = true;
    fatFreq = map(pingX, lX, rX, 40, 150);
    fbD = map(pingY, tY, bY, 0.1, 0.5);
    fDel = fbD * 2;
    feedbackDelay = new Tone.FeedbackDelay(fDel, fbD);
    feedbackDelay.connect(wave);
    // tom.decay = 2 * fbD;
    limiter = new Tone.Limiter(-6).toDestination();
    feedbackDelay.connect(limiter);
    tom.connect(feedbackDelay);
    struck.connect(feedbackDelay);
    tom.triggerAttackRelease(fatFreq, 1);
    struck.triggerAttackRelease(fatFreq, 1);

  }
}

function checkPing() {
  if (isPinged) {
    if (radius < fbD * 600) {
      let adder = 2 + radius / 100;
      radius += adder;
      isPinging = true;
    } else {
      radius = 2;
      isPinging = false;
      isPinged = false;
      //clean out the feedback delay
      feedbackDelay.dispose();

    }
  }
}

function drawPing(r) {
  let x = pingX;
  let y = pingY;
  let r_ = r;
  if (isPinged) {
    let strokeAmp = map(levelAvg, 0, 0.5, 30, 255);
    stroke(strokeAmp);
    noFill();
    push();
    beginShape();
    for (var i_ = 0; i_ <= 90; i_++) {
      let rm = map(levelAvg, 0, 0.5, 4, 0);
      var x_ = x + random(-1, 1) + (r_ + rm) * cos(i_ * 4);
      var y_ = y + random(-1, 1) + (r_ + rm) * sin(i_ * 4);
      let xc = constrain(x_, lX, rX);
      let yc = constrain(y_, tY, bY);
      vertex(xc, yc);
    }
    endShape();
    pop();
  }
}