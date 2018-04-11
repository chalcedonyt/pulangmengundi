<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>#PulangMengundi - @yield('title')</title>
        <!-- Optional theme -->
        <link rel="stylesheet" href="{{mix('css/app.css')}}">
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
        @yield('scripts')
    </body>
</html>