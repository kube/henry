;(function(w, d, s) {
  try {
    d = w.top.document || d
    w = w.top.document ? w.top : w
  } catch (e) {}

  var ttag = function() {
    w.teads
      .page(15743)
      .placement(27829, {
        format: 'inread',
        slot: {
          btf: false,
          selector: 'p',
          minimum: 1
        }
      })
      .serve()
  }

  if (w.teads && w.teads.page) {
    ttag()
  } else if (!w.teadsscript) {
    s.src =
      '//cdn.teads.tv/media/format/v3/teads-format.min.js'
    s.async = true
    s.onload = ttag
    w.teadsscript = d
      .getElementsByTagName('head')[0]
      .appendChild(s)
  }
})(window, document, document.createElement('script'))
