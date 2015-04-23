var neu = neume();

function MouseSynth(x, y) {
  var frequency = x.map(function(data) {
    return sc.linexp(data, 0, 1, 22, 3520);
  });
  var q = y.map(function(data) {
    return sc.linexp(data, 0, 1, 0.5, 25);
  });
  return neu.Sawtooth({ frequency: frequency })
    .pipe(neu.LowpassFilter({ frequency: frequency, Q: q }));
}

var mousemove = neu.Stream.fromEventHandler(window, "mousemove");
var mouseX = mousemove.map(function(data) {
  return data.pageX / window.innerWidth;
});
var mouseY = mousemove.map(function(data) {
  return data.pageY / window.innerHeight;
});
var synth = neu.Synth(MouseSynth, mouseX, mouseY).start(neu.currentTime);

neu.Stream.fromEventHandler(window, "mousedown").on("data", function(e) {
  synth.fadeOut(e.playbackTime, 1).on("stop", function(e) {
    console.log("stop!")
  });
});
