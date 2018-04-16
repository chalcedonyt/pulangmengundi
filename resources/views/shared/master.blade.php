<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <meta property="og:site_name" content="#PULANGMENGUNDI #CarpoolGE14 - Carpool" />
        <meta property="og:title" content="Malaysians helping Malaysians to vote" />
        <meta property="og:description" content="Going back to vote? Split the cost, make new friends. Use our tool to match with voters going in the same direction to #pulangmengundi!" />
        <meta property="og:image" content="https://www.pulangmengundi.com/uploads/1/1/9/0/119033783/editor/pulang-logo-v3_1.png?1523502575" />
        <meta property="og:image" content="https://www.pulangmengundi.com/uploads/1/1/9/0/119033783/editor/noun-210781-cc.png?1523510835" />
        <meta property="og:image" content="https://www.pulangmengundi.com/uploads/1/1/9/0/119033783/editor/noun-1256129-cc.png?1523510667" />
        <meta property="og:image" content="https://www.pulangmengundi.com/uploads/1/1/9/0/119033783/editor/128-128-e7370a653b0fe30a6fe3fe6fd92c4ccd.png?1523550783" />
        <meta property="og:image" content="https://www.pulangmengundi.com/uploads/1/1/9/0/119033783/editor/twittericon.png?1523550538" />
        <meta property="og:image" content="https://www.pulangmengundi.com/uploads/1/1/9/0/119033783/editor/128-128-8849499f9a253a6add1768da935298e5-instagram.png?1523550819" />
        <meta property="og:url" content="https://carpool.pulangmengundi.com/" />
        <meta property="fb:app_id" content="432655180504681" />

        <meta name="description" content="Going back to vote? Split the cost, make new friends. Use our tool to match with voters going in the same direction to #pulangmengundi!" />
        <meta name="keywords" content="GE14, pulangmengundi" />
        <title>#PulangMengundi #CarpoolGE14 - @yield('title')</title>
        <!-- Optional theme -->
        <link rel="stylesheet" href="{{mix('css/app.css')}}">
        <link rel="shortcut icon" href="/img/favicon.ico" type="image/x-icon">
        <script src='https://www.google.com/recaptcha/api.js'></script>
    </head>
    <body>
        <div class="container">
            @yield('content')
            <div class="pull-right">
                <a href="//www.iubenda.com/privacy-policy/46243103" class="iubenda-black iubenda-embed" title="Privacy Policy">Privacy Policy</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src = "//cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>
            </div>
        </div>
        <script src="{{mix('js/manifest.js')}}"></script>
        <script src="{{mix('js/vendor.js')}}"></script>
        <script>
            window.locale = '{{$locale}}';
        </script>
        @if (strpos(url('/'), 'localhost') !== false)
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-117450354-1"></script>
        <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'UA-117450354-1');
        var trackOutboundLink = function(url) {
            gtag('event', 'outboundClick', {
                'event_category': 'sponsor_link',
                'event_label': url
            });
         }
        </script>
        @endif
        @yield('scripts')
    </body>
</html>