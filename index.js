var Lag = require('online-lag')
var Mean = require('online-mean')

function smooth (x1, x2, e) {
  return x1 + e * (x2 - x1)
}

function weight (n) {
  if (n > 0) {
    return 1 / n
  } else {
    return undefined
  }
}

function zeros (size) {
  return Array.apply(null, Array(size)).map(Number.prototype.valueOf, 0)
}

function Autocovariance (l) {
  l = l || 10
  var d = l + 1
  var xlag = Lag(d)
  var wlag = Lag(d)
  var m = Mean()
  var m1 = zeros(d)
  var m2 = zeros(d)
  var cross = zeros(d)
  var values = []

  var autocovariance = function autocovariance (x) {
    if (!isNaN(x)) {
      if (typeof x !== 'number') {
        x = parseFloat(x)
      }
      var w = weight(m.n + 1)
      m.fit(x)
      xlag.fit(x)
      wlag.fit(w)

      // Update m1
      for (var i = d - 1; i > 0; i--) {
        m1[i] = m1[i - 1]
      }

      // m1[0] = smooth(m1[0], x, w)
      m1[0] = m.value

      for (var j = 0; j < d; j++) {
        // Update cross and m2
        var xj = xlag.values[j] || 0
        var wj = wlag.values[j] || 0
        cross[j] = smooth(cross[j], x * xj, wj)
        m2[j] = smooth(m2[j], x, wj)
        // Update values
        values[j] = (m.n - j) / m.n * (cross[j] + m.value * (m.value - m1[j] - m2[j]))
      }
    } else if (Array.isArray(x)) {
      x.forEach(el => autocovariance(el))
    }
    return values
  }

  autocovariance.fit = function (x) {
    autocovariance(x)
  }

  Object.defineProperty(autocovariance, 'values', {
    get: function () {
      return values
    }
  })

  Object.defineProperty(autocovariance, 'n', {
    get: function () {
      return m.n
    }
  })

  return autocovariance
}

module.exports = Autocovariance
