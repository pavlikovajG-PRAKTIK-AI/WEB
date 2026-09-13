/* Staví zaškrtávací pole z otazky.js a skládá výstup.
   Nic se nikam neodesílá ani neukládá — všechno běží v prohlížeči. */
(function () {
  var lang = document.documentElement.lang === "en" ? "en" : "cs";
  var L = window.L;
  var MAIL = "jana.pavlikova@ujep.cz";

  function label(item) { return item[lang]; }

  function build(groupId, key, type) {
    var box = document.getElementById(groupId);
    if (!box) return;
    window.Q[key].forEach(function (item) {
      var l = document.createElement("label");
      l.className = "opt";
      var i = document.createElement("input");
      i.type = type;
      i.value = item.k;
      i.name = key;
      var s = document.createElement("span");
      s.textContent = label(item);
      l.appendChild(i);
      l.appendChild(s);
      box.appendChild(l);
    });
  }

  build("g-zdrzuje", "zdrzuje", "checkbox");
  build("g-zkusil", "zkusil", "checkbox");
  build("g-chce", "chce", "checkbox");
  build("g-placena", "placena", "radio");

  function picked(key) {
    return [].slice.call(document.querySelectorAll('input[name="' + key + '"]:checked'))
      .map(function (i) { return i.value; });
  }
  function labelsFor(key, keys) {
    return keys.map(function (k) {
      var f = window.Q[key].filter(function (x) { return x.k === k; })[0];
      return f ? label(f) : k;
    });
  }

  function compose() {
    var katedra = (document.getElementById("katedra").value || "").trim();
    var vzdal = (document.getElementById("vzdal").value || "").trim();
    var z = picked("zdrzuje"), s = picked("zkusil"), c = picked("chce"), p = picked("placena");

    var out = [L.title, ""];
    out.push(L.dept + ": " + (katedra || "—"));
    out.push("");
    function block(head, key, keys) {
      out.push(head + ":");
      if (!keys.length) { out.push("— " + L.none); }
      else { labelsFor(key, keys).forEach(function (t) { out.push("- " + t); }); }
      out.push("");
    }
    block(L.hZdrzuje, "zdrzuje", z);
    block(L.hZkusil, "zkusil", s);
    out.push(L.hPlacena + ": " + (p.length ? labelsFor("placena", p)[0] : "—"));
    out.push("");
    block(L.hChce, "chce", c);
    out.push(L.hVzdal + ":");
    out.push(vzdal || "—");
    out.push("");
    out.push("--");
    out.push("DATA v1|katedra=" + (katedra || "?") +
      "|zdrzuje=" + z.join(",") +
      "|zkusil=" + s.join(",") +
      "|placena=" + (p[0] || "") +
      "|chce=" + c.join(","));
    return { text: out.join("\n"), katedra: katedra };
  }

  function say(msg) {
    var el = document.getElementById("status");
    el.textContent = msg;
    clearTimeout(say._t);
    say._t = setTimeout(function () { el.textContent = ""; }, 6000);
  }

  document.getElementById("send").addEventListener("click", function () {
    var r = compose();
    var subj = L.subject + (r.katedra ? " (" + r.katedra + ")" : "");
    window.location.href = "mailto:" + MAIL +
      "?subject=" + encodeURIComponent(subj) +
      "&body=" + encodeURIComponent(r.text);
    say(L.sent);
  });

  document.getElementById("copy").addEventListener("click", function () {
    var r = compose();
    var fb = document.getElementById("fallback");
    var ta = document.getElementById("fbtext");
    ta.value = r.text;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(r.text).then(function () {
        say(L.copied);
      }, function () {
        fb.classList.remove("hidden"); ta.select(); say(L.manual);
      });
    } else {
      fb.classList.remove("hidden"); ta.select(); say(L.manual);
    }
  });
})();
