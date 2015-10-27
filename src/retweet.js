'use latest';
'use strict';

const async = require('async')
const request = require('request')

const Twitter = require('twitter')

// const container = 'wt-shuanwang-gmail_com-0';

let tweetFilter = (tweet) => {
  const dur = (new Date() - +new Date(tweet.created_at)) / 1000 / (60 * 60)
  const urls = tweet.text.match(/https:\/\/t\.co.*?(\w+|$)/g)
  return /t\.co/i.test(tweet.text) && dur < 1 && urls
}

const T = new Twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
})

const tlParams = {
  screen_name: 'angryasianman',
  trim_user: 1,
  exclude_replies: true,
  include_rts: false
}

module.exports = (callback) => {
  T.get('statuses/user_timeline/', tlParams, (_e, tweets) => {
    async.each(tweets.filter(tweetFilter), (t) => {
      let urls = t.text.match(/https:\/\/t\.co.*?(\w+|$)/g)
      async.detect(urls, (uri, cb) => {
        request.head({ uri: uri, followRedirect: false }, (__e, r) => {
          if (__e) {
            callback('Error fetching uri ' + uri + ':', __e)
          }
          cb((r.headers.location && r.headers.location.match(/angryasianman\.com/)))
        })
      }, (result) => {
        if (t.text && result) {
          T.post('statuses/retweet/' + t.id_str, { trim_user: 1 }, (___e, rt) => {
            console.log('Retweeted ' + t.id_str + ': ' + rt)
            if (___e) {
              return callback('Error retweeting id ' + t.id_str + ':', ___e)
            }
          })
        }
      })
    }, (err) => {
      if (err) {
        return callback(err);
      }
      callback(null, 'OK')
    })
  })
}
