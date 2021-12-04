# Scopes / Containers

A scope contains all injectable variables that have been loaded until now. As such, a scope is very similar to the "Container" implementation you may know from other libraries.

There are however a few big differences:

- You may only re-bind / mock injectables when creating the scope.

- Once the scope has been created, it is not possible to change it anymore.

- A scope may have sub-scopes.

- ... and a few more that we will cover later.

In fact, this dependency injector has heavily inspired itself from how Javascript scopes work:

![javascript scopes](./images/scopes-javascript.png)

## Creating a scope

TODO

## Creating a sub-scope

TODO

## In which scope is a variable mounted?

The library will **automatically deduce** into which scope your injectable variable needs to be **declared** / **mounted**, depending on it's dependencies:

- A variable will always try to mount in the highest scope possible:
  - *Example: If the variable does not have any dependencies, it will always be mounted in the root scope.*

- A variable will always be mounted at the scope of the dependency with the lowest scope:
  - *Example: If the variable has 2 dependencies A and B, with A being in the root scope and B in a sub-scope of root ("request"), the variable will be mounted in the request scope.*

## Closing a scope

TODO
