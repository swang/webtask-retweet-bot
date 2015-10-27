'use latest';
'use strict';

const async = require('async')
const request = require('request')

const Twitter = require('twitter')

// const container = 'wt-shuanwang-gmail_com-0';

function tweetFilter(tweet) {
  const dur = (new Date() - +new Date(tweet.created_at)) / 1000 / (60 * 60)
  return /t\.co/i.test(tweet.text) && dur < 1
}

const T = new Twitter({
    consumer_key: 'DQkGOhjDwtr33nqdAcUvVshZJ'
  , consumer_secret: 'lf4LxpuOJvc1ufyS7qr5FeZoQTrI3ylAlj4AlNjxha6qT3Ze4E'
  , access_token_key: '4022696420-jClAJyzp3fZFX4T54yDTWjHferyvmE7mLYqeTSw'
  , access_token_secret: 'uqanxpdRW1QnzAAI4vSVTYDsd18qMLd5RH2XBwaFQX4Fi'
})

const tlParams = {
  screen_name: 'angryasianman',
  trim_user: 1,
  exclude_replies: true,
  include_rts: false
}

T.get('statuses/user_timeline/', tlParams, function(_e, tweets) {
  tweets.filter(tweetFilter).forEach(function(t) {
    let urls = t.text.match(/https:\/\/t\.co.*?(\w+|$)/g)
    if (urls) {
      async.detect(urls, function(uri, cb) {
        request.head({ uri: uri, followRedirect: false }, function(__e, r) {
          if (__e) {
            console.log('Error fetching uri ' + uri + ':', __e)
          }
          cb((r.headers.location && r.headers.location.match(/angryasianman\.com/)))
        })
      }, function callback(result) {
        if (t.text && result) {
          T.post('statuses/retweet/' + t.id_str, { trim_user: 1 }, function(___e, rt) {
            console.log('Retweeted ' + t.id_str + ': ' + rt)
            if (___e) {
              console.log('Error retweeting id ' + t.id_str + ':', ___e)
            }
          })
        }
      })
    }
  })
})
