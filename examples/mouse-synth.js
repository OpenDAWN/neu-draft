var neu = neume();

function MouseSynth(x, y) {
  var frequency = x.map(function(data) {
    return sc.linexp(data, 0, 1, 22, 3520);
  });
  var q = y.map(function(data) {
    return sc.linexp(data, 0, 1, 0.5, 25);
  });
  return neu.sawtooth({ frequency: frequency })
    .pipe(neu.lowpassFilter({ frequency: frequency, Q: q }));
}

var mousemove = neu.stream.fromEventHandler(window, "mousemove");
var mouseX = mousemove.map(function(data) {
  return data.pageX / window.innerWidth;
});
var mouseY = mousemove.map(function(data) {
  return data.pageY / window.innerHeight;
});
var synth = neu.synth(MouseSynth, mouseX, mouseY).start(neu.currentTime);

neu.stream.fromEventHandler(window, "mousedown").on("data", function(e) {
  synth.fadeOut(e.playbackTime, 1).on("stop", function(e) {
    console.log("stop!", e.playbackTime);
  });
});
