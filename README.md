# hexo-related-popular-posts

A hexo plugin that generates a list of links to related posts and popular posts.

## Overview

A hexo plugin that generates a list of links to related posts based on tags , and plugin that generates a list of links to popular posts base on page view of Google Analytics. Popular posts is need Google Analytics API.

- Documents : [read me](https://tea3.github.io/p/hexo-related-popular-posts/)

- DEMO : [My Posts](https://tea3.github.io/p/tea-plantation-mtfuji/) has generated [related posts](https://tea3.github.io/p/tea-plantation-mtfuji/#relatedPosts) like this.


## Installation

``` bash
$ npm install hexo-related-popular-posts --save
```

## Usage

Add the following helper tag in template file for article.

``` ejs
  <%-
    popular_posts()
  %>
```

## Options of hepler

| option | description | default |
| :--- | :--- | :--- |
| maxCount| Maximum count of a list | `5` |
| ulClass| Class name of element | `'popular-posts'` |
| PPMixingRate| Mixing ratio of popular posts and related posts | `0.0`(=Related posts only) |
| isDate| visible the date | `false` |
| isImage| visible the image | `false` |
| isExcerpt| visible the excerpt | `false` |

## Example

1. Related Articles will generate 5 posts. Also, Image of Articles generate .

``` ejs
  <%-
    popular_posts_json({ maxCount: 5 , ulClass: 'popular-posts' , PPMixingRate: 0.0 , isImage: true})
  %>
```

2. Popular Articles will generate 10 posts . Popular posts is need Google Analytics API.

``` ejs
  <%-
    popular_posts_json({ maxCount: 10 , ulClass: 'popular-posts' , PPMixingRate: 1.0 })
  %>
```

3. If you want custom html, please use `popular_posts_json` helper.

``` ejs
<%-
    htmlGenerator( 
        popular_posts_json({ maxCount: 5 , ulClass: 'popular-posts' , PPMixingRate: 0.0 , isDate: true , isImage: true , isExcerpt: true})
    )
%>
```

If you use `popular_posts_json` helper , please add the following helper in template.

``` javascript
// Examples of helper
hexo.extend.helper.register('htmlGenerator', function(args){
  if(!args || !args.json || args.json.length == 0)return "";
  
  var returnHTML = "";
  
  function generateHTML(list){
    var ret = "";
    ret += "<li class=\"" + args.class + "-item\">";
    
    if(list.date && list.date != ""){
        ret += '<div class="'+args.class+'-date">' + list.date + "</div>";
    }
    
    if(list.img && list.img != ""){
        ret += '<div class="'+args.class+'-img">' + '<img src="'+list.img+'" />' + "</div>";
    }
    ret += '<div class="'+args.class+'-title"><h3><a href="' + list.path + '" title="'+ list.title +'" rel="bookmark">'+ list.title + "</a></h3></div>";
    if(list.excerpt &&  list.excerpt != ""){
        ret += '<div class="'+args.class+'-excerpt"><p>' + list.excerpt + "</p></div>";
    }
    
    ret +=  "</li>";
    return ret;
  }
  
  for(var i=0; i<args.json.length; i++){
      returnHTML += generateHTML(args.json[i]);
  }
  
  if(returnHTML != "")returnHTML = "<ul class=\"" + args.class + "\">" + returnHTML + "</ul>";
  
  return returnHTML;
});
```



## Popular posts

Popular posts base on page view of Google Analytics. Popular posts is need Google Analytics API. Please edit your config file `_config.yml` and set the following options. 

Please see [https://www.npmjs.com/package/ga-analytics](https://www.npmjs.com/package/ga-analytics)

``` yaml
popularPosts:
  googleAnalyticsAPI:
    clientId: ******.apps.googleusercontent.com
    serviceEmail: *****@developer.gserviceaccount.com
    key: /hexo-project-root/path/to/google-services.pem
    viewId: 12345678
    dateRange: 60
    cache:
      path: hexo-related-popular-posts-ga-cached.json
      expiresDate: 10
```

### Environment variable

If you want to use the environment variable. Please set the following.

``` bash
$ export GOOGLEAPI_CLIENTID="******.apps.googleusercontent.com"
$ export GOOGLEAPI_EMAIL="*****@developer.gserviceaccount.com"
$ export GOOGLEAPI_KEY="/path/to/google-services.pem"
$ export GOOGLEAPI_ANALYTICS_TABLE="ga:12345678"
```

``` yaml
popularPosts:
  googleAnalyticsAPI:
    # clientId: ******.apps.googleusercontent.com
    # serviceEmail: *****@developer.gserviceaccount.com
    # key: /hexo-project-root/path/to/google-services.pem
    # viewId: 12345678
    dateRange: 60
    cache:
      path: hexo-related-popular-posts-ga-cached.json
      expiresDate: 10
```


## License

MIT

[Hexo]: http://hexo.io/