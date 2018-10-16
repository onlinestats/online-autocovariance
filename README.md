# online-autocovariance

## Usage
```javascript
const Autocov = require('.')

const ac1 = Autocov(3)
const ac2 = Autocov(3)

;[1, 2, 3, 4, 5, 6, 7].forEach(v => { ac1(v) })

;[5, 1, 4, 7, 8, 1, -4, 0, 3, 7].forEach(v => { ac2(v) })
console.log(ac1.values, ac1.n) // ~> [ 4, 2.286, 0.714, -0.571 ]
console.log(ac2.values, ac2.n)

// Also works when calling with array argument:
// Keep in mind, it updates already defined ac1 values
console.log(ac1([8, 9, 10])) // ~> [8.25, 5.775, 3.4, 1.225]
```

## How it works
Autocovariance online algorithm

Start with a formula for auto-covariance approximation:

> cov<sub>k</sub> = (1 / n) <strong>Σ</strong><sub>i=1..n-k</sub>(x<sub>i+k</sub> - μ)(x<sub>i</sub> - μ)<br>

Then multiply values in brackets:
> cov<sub>k</sub> = (1 / n) <strong>Σ</strong><sub>i=1..n-k</sub>(x<sub>i+k</sub>x<sub>i</sub> + μ<sup>2</sup> - μx<sub>i</sub> - μx<sub>i+k</sub>)<br>

Multiply the result with (n-k)/(n-k) to get rid of Σ:
> cov<sub>k</sub> =  <b>α</b>(β + μ<sup>2</sup> - μμ<sub>i</sub> - μμ<sub>i+k</sub>)) = <b>α</b>(β + μ(μ - μ<sub>i</sub> - μ<sub>i+k</sub>))<br>

Where:
> α = (n - k) / n<br>
> β = (<strong>Σ</strong><sub>i=1..n-k</sub>(x<sub>i+k</sub>x<sub>i</sub>)) / (n - k) = avg(x<sub>i+k</sub>x<sub>i</sub>)<br>
> μ<sub>i</sub> = (<strong>Σ</strong><sub>i=1..n-k</sub> x<sub>i</sub>) / (n - k)<br>
> μ<sub>i+k</sub> = (<strong>Σ</strong><sub>i=1..n-k</sub> x<sub>i+k</sub>) / (n - k)<br>

> μ is constant here so (<strong>Σ</strong><sub>i=1..n-k</sub>  μ) / (n - k) =  μ

Using the resulting formula, for each lag k from 0 to K we only need to accumulate: 
* μ - average of full (0, N) data interval; don't depend on k
* μ<sub>i</sub> - average of (0, N-k)
* μ<sub>i+k</sub> - average of (k, N) interval
* β - average of the product of x<sub>i+k</sub> and x<sub>i</sub>

To update μ iteratively we can just use a simple algorithm: [online-mean](https://github.com/onlinestats/online-mean)

<b>μ<sub>i</sub></b> is just a lagged (t-k) value of μ:<br>
◆◆◆◆◆ μ<sub>i</sub>(0, N-k), k=0<br> 
◆◆◆◆◇ μ<sub>i</sub>(0, N-k), k=1<br>
◆◆◆◇◇ μ<sub>i</sub>(0, N-k), k=2<br>
To update μ<sub>i</sub> we just calculate μ and push it to μ<sub>i</sub> and shift all its values to the right.

<b>μ<sub>i+k</sub></b> and <b>β</b> are "delayed":<br>
◆◆◆◆◆ μ<sub>i+k</sub>(k, N), k=0<br> 
◇◆◆◆◆ μ<sub>i+k</sub>(k, N), k=1<br>
◇◇◆◆◆ μ<sub>i+k</sub>(k, N), k=2<br>

To update their values we need to track last <b>k</b> observations of x (<b>xlag</b>) and their weights (<b>wlag</b>) using [online-lag](https://github.com/onlinestats/online-lag) module<br>
xlag: [x[t], x[t-1], x[t-2], ...]<br>
wlag: [w[t], w[t-1], w[t-2], ...]

Until we get non-zero weight wlag[k], μ<sub>i+k</sub> and β are zero. Each observation adds its weight to the wlag object shifting its values. So after, let's say 3 observation, 3rd weight in wlag will be 1, that gives us non-zero value for corresponding lag. I definitely should rewrite this to make everything more clear :)
