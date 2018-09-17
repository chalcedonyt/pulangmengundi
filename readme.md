# Pulangmengundi.com

## Overview

This is the code that was used for [carpool.pulangmengundi.com](https://www.thestar.com.my/news/nation/2018/04/16/rm110000-raised-for-buses-and-travel-subsidies-for-out-of-town-voters/) and is being made public (warts and all) in case anyone wants to see how it worked.

## Requirements and installation

* Standard Laravel 5.6 (PHP7.1) and React
```
composer install
php artisan migrate --seed
npm install && npm run watch
php artisan serve
```

## Env values
See `.env.example` - the app used FB and Google logins, and used Mailgun for email.

## Notes
* I didn't have time to set up an asset pipeline, so compiled JS was committed into the repo. What a bad thing to do!
* This was initially copied from code I used for an interview, so there may be unused libraries here and there.