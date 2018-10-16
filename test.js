var test = require('tape')
var AutoCov = require('.')

test('Zero lag', _ => {
  var ac = AutoCov(0)
  ;[1, 2, 3, 4].forEach(v => {
    ac(v)
  })
  _.equal(ac.values[0], 1.25)
  _.end()
})

test('Simple test', _ => {
  var ac = AutoCov(2)
  ;[1, 2, 3, 4].forEach(v => {
    ac(v)
  })
  var expected1 = [1.25, 0.3125, -0.375]
  ac.values.forEach((v, i) => {
    _.true(Math.abs(v - expected1[i]) < 0.00001)
  })
  var expected2 = [4, 2.28571429, 0.71428571]
  ac([5, 6, 7])
  ac.values.forEach((v, i) => {
    _.true(Math.abs(v - expected2[i]) < 0.00001)
  })
  _.end()
})
