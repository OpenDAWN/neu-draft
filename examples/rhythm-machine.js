var neu = neume();
var patterns = [
  [ 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1 ],
  [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0 ],
  [ 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ]
];

function HH() {
  return neu.BufferSource("hh")
    .pipe(neu.XLine({ start: 0.4, end: 1e-6, duration: 0.125 }).on("end", function(e) {
      e.synth.stop(e.playbackTime);
    })).pipe(neu.Out(2));
}

function SD() {
  return neu.BufferSource("sd")
    .pipe(neu.XLine({ start: 0.6, end: 1e-6, duration: 0.25 }).on("end", function(e) {
      e.synth.stop(e.playbackTime);
    })).pipe(neu.Out(2));
}

function BD() {
  return neu.Sine({ frequency: neu.Xline({ start: 60, end: 25, duration: 0.1 }) })
    .pipe(neu.XLine({ start: 0.15, duration: 0.25 }).on("end", function(e) {
      e.synth.stop(e.playbackTime);
    })).pipe(neu.Out(2));
}

function Master() {
  return neu.In(2)
    .pipe(neu.Compressor({ threshold: -18, knee: 10.5, ratio: 2.5 }));
}

function toggle() {
  var funcs = Array.prototype.slice.call(arguments);
  var count = 0;
  var context = {};
  return function(e) {
    funcs[count++ % funcs.length].call(context, e);
  };
}

neu.Stream.fromEventHandler("#start", "click").on("data", toggle(function(e) {
  var master = neu.Synth(Master).start(e.playbackTime);
  var metro = neu.Metro("8n").start(e.playbackTime);
  var counter = metro.pipe(neu.Counter(0, 16));

  _.zip([ HH, SD, BD ], patterns).forEach(function(items) {
    var synth = items[0];
    var pattern = items[1];

    counter.filter(function(i) {
      return pattern[i];
    }).on("data", function(e) {
      neu.Synth(synth).start(e.playbackTime);
    });
  });

  this.master = master;
  this.merto = metro;
}, function(e) {
  this.master.stop(e.playbackTime);
  this.metro.stop(e.playbackTime);
}));
