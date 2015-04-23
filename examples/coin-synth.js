var neu = neume();

function CoinSynth() {
  var frequency = neu.Iterator.fromArray([ 987.8, 1318.5 ]);

  neu.setTimeout(function(e) {
    frequency.next(e.playbackTime);
  }, 0.5);

  return neu.Sine({ frequency: frequency })
    .pipe(neu.XLine({ start: 0.5, end: 1e-6, duration: 1 }).on("end", function(e) {
      e.synth.stop(e.playbackTime);
    }));
}

neu.Stream("#button", "click").on("data", function(e) {
  neu.Synth(CoinSynth).start(e.playbackTime).on("stop", function(e) {
    console.log("stop!", e.playbackTime);
  });
});
