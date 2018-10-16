var Autocov = require('.')

var ac1 = Autocov(3)
var ac2 = Autocov(3)

;[1, 2, 3, 4, 5, 6, 7].forEach(v => { ac1(v) })

;[5, 1, 4, 7, 8, 1, -4, 0, 3, 7].forEach(v => { ac2(v) })
console.log(ac1.values, ac1.n)
console.log(ac1([8, 9, 10]))
console.log(ac2.values, ac2.n)
