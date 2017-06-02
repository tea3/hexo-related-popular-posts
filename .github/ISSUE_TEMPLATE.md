> Before you submit your issue, please tell me your environment info. Also , if you occur `ERROR Plugin load failed:` , please reinstall hexo and npm as follows, for example.

```
$ nvm install v6.10.1
$ nvm use v6.10.1
$ npm install -g npm
$ npm install -g hexo-cli
$ hexo init hexo6101
$ cd hexo6101
$ npm install
$ npm install hexo-related-popular-posts --save
```

Also , if you occur `DTraceProviderBindings.node` error , please see issue#1.
[https://github.com/tea3/hexo-related-popular-posts/issues/1](https://github.com/tea3/hexo-related-popular-posts/issues/1)

## For BUG

- BUG description
- the way to reproduce
- log with hexo

## For question

just push question

## For feature request

just push feature request

## Environment Info

OS version

- OSX (please tell me version)
- Windows (please tell me version)
- Linux (please tell me version)

Node version(`node -v`)
```
v6.10.1
```

Your site `_config.yml`
```
# Hexo Configuration
...
```

Your theme `_config.yml`
```
# Hexo Configuration
...
```

Plugin version(`npm ls --depth 0`)
```
hexo-vanilla-site@0.0.0 ~/hexo-vanilla-site
├── hexo@3.1.1
├── hexo-generator-archive@0.1.4
├── hexo-generator-category@0.1.3
├── hexo-generator-index@0.2.0
├── hexo-generator-tag@0.2.0
├── hexo-renderer-ejs@0.1.1
├── hexo-renderer-marked@0.2.10
├── hexo-renderer-stylus@0.3.1
└── hexo-server@0.1.3
```


