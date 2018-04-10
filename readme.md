# Checkout Pricing Simulator

[![Build Status](https://travis-ci.org/chalcedonyt/seek-intv.svg?branch=master)](https://travis-ci.org/chalcedonyt/seek-intv)

## Requirements and installation

* Standard Laravel 5.6 (PHP7.1)
* MySQL5.7 for JSON column type
```
composer install
php artisan migrate --seed #seeds the customers and pricing rules
npm install && npm run dev
php artisan serve
```

## Language/framework considerations

* NodeJS doesn't have built-in type-safety or proper class mechanics for an extensible rule system (without a whole bunch of extensions), hence PHP7
* I expect that with the patterns used, adding new rules or configuring values for existing ones will be easy, as required methods can be enforced with interfaces and abstract classes.

## Patterns and structure

* Used standard Abstract/Interface/inheritance patterns to construct stackable rules (`App\Services\PricingRule`)
* A TransferObject is used to contain the final price as well as any rules applied
* Use of Factories to hydrate rules from a database
* A simple service provider to contain references to existing rules and their factories through their aliases (`App\Providers\PricingRuleProvider`)
* Every rule exposes their own display name, alias and validation instances.
* A favourite of mine, the Fractal Transformer library to standardize API output
* Unit tests focused on testing the accuracy of the pricing rules.

## Other notes

* Take advantage of MySQL 5.7 JSON data types, allows combining the benefits of relational with NoSQL to store the pricing rules
* Quick frontend in React to display pricing simulations ("quick" meaning no tests or prop-types)
* As we are just testing prices, there is no actual checkout saved at the end, though the prices are simulated.
* It would have been possible to assign new rules from scratch, but this was not done because of time (refer to the tests to see how they can easily be created on the backend using Factories). However existing rules can be edited on the frontend as PoC.
* It would also have been possible to make the React components more reusable, but this was not the focus.

## Some of the things validated
* Trying to key in a fixed price higher than the normal price
* For "X for the price of Y", keying in a value of Y > X is invalid

![simulator](https://github.com/chalcedonyt/seek-intv/blob/master/simulator.png?raw=true)
![rule browser](https://github.com/chalcedonyt/seek-intv/blob/master/rules.png?raw=true)