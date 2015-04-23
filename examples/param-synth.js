var neu = neume();
var synth = null;

function ParamSynth(defaultFrequency) {
  return neu.Sum([
    neu.Sine({ frequency: neu.Param("frequency", defaultFrequency) }),
    neu.Sine({ frequency: neu.Param("frequency", defaultFrequency).mul(1.05) })
  ]).mul(0.25);
}

function randomFrequency() {
  return sc.midicps(sc.linexp(Math.random(), 0, 1, 60, 72)|0);
}

document.getElementById("start", function() {
  if (synth) {
    synth.fadeOut(neu.currentTime, 2.5);
  }
  synth = neu.Synth(ParamSynth, randomFrequency()).start(neu.currentTime).on("stop", function(e) {
    console.log("stop!", e.playbackTime);
  });
});

document.getElementById("stop", function() {
  if (synth) {
    synth.stop(neu.currentTime);
    synth = null;
  }
});

document.getElementById("changeFreq", function() {
  if (synth) {
    synth.frequency.setValueAtTime(neu.currentTime, randomFrequency());
  }
});
