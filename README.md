# redux-lift

Store composition for [redux].

![build status](http://img.shields.io/travis/izaakschroeder/redux-lift/master.svg?style=flat)
![coverage](http://img.shields.io/coveralls/izaakschroeder/redux-lift/master.svg?style=flat)
![license](http://img.shields.io/npm/l/redux-lift.svg?style=flat)
![version](http://img.shields.io/npm/v/redux-lift.svg?style=flat)
![downloads](http://img.shields.io/npm/dm/redux-lift.svg?style=flat)

The current primary composition mechanism in [redux] is [middleware]. While useful in altering the behavior of the `dispatch` function, it offers little control for composing multiple parts of an application that have different action or store needs. This is where [lifting] is useful.

Lifting allows you to "lift" your state, reducers and actions into another context. Lifting is a kind of [store enhancer] that is a superset of [middleware].

[redux]: https://github.com/gaearon/redux
[middleware]: http://rackt.org/redux/docs/advanced/Middleware
[lifting]: http://stackoverflow.com/questions/2395697
[store enhancer]: https://github.com/rackt/redux/blob/master/docs/Glossary.md#store-enhancer
