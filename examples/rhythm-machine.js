var neu = neume();
var patterns = [
  [ 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1 ],
  [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0 ],
  [ 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ],
];

function HH($) {
  return $("bufferSource", "hh")
    .pipe($("xline", { start: 0.4, end: 1e-6, duration: 0.125 }).on("end", function(e) {
      e.synth.stop(e.playbackTime);
    })).pipe($("out", 2));
}

function SD($) {
  return $("bufferSource", "sd")
    .pipe($("xline", { start: 0.6, end: 1e-6, duration: 0.25 }).on("end", function(e) {
      e.synth.stop(e.playbackTime);
    })).pipe($("out", 2));
}

function BD($) {
  return $("sine", { frequency: $("xline", { start: 60, end: 25, duration: 0.1 }) })
    .pipe($("xline", { start: 0.15, duration: 0.25 }).on("end", function(e) {
      e.synth.stop(e.playbackTime);
    })).pipe($("out", 2));
}

function Master($) {
  return $("in", 2)
    .pipe($("compressor", { threshold: -18, knee: 10.5, ratio: 2.5 }));
}

function toggle() {
  var funcs = Array.prototype.slice.call(arguments);
  var count = 0;
  var context = {};
  return function(e) {
    funcs[count++ % funcs.length].call(context, e);
  };
}

neu.stream.fromEventHandler(document.getElementById("start"), "click").on("data", toggle(function(e) {
  var master = neu.synth(Master).start(e.playbackTime);
  var metro = neu.sched.metro("8n").start(e.playbackTime);
  var counter = metro.map(function(data) {
    return data % 16;
  });

  _.zip([ HH, SD, BD ], patterns).forEach(function(items) {
    var synth = items[0];
    var pattern = items[1];

    counter.filter(function(i) {
      return pattern[i];
    }).on("data", function(e) {
      neu.synth(synth).start(e.playbackTime);
    });
  });

  this.master = master;
  this.merto = metro;
}, function(e) {
  this.master.stop(e.playbackTime);
  this.metro.stop(e.playbackTime);
}));
