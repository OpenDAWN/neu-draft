var neu = neume();

function SimpleSynth($, frequency) {
  return $("sine", { frequency: frequency })
    .pipe($("xline", { start: 0.5, end: 1e-6, duration: 1 }).on("end", function(e) {
      e.synth.stop(e.playbackTime);
    }));
}

neu.stream.fromEventHandler(document.getElementById("button"), "click").on("data", function(e) {
  neu.synth(SimpleSynth, 880).start(e.playbackTime).on("stop", function(e) {
    console.log("stop!", e.playbackTime);
  });
});
