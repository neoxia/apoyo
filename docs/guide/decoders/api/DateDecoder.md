# DateDecoder overview

This namespace contains date decoders and additional utilities for date validations.

## Summary

[[toc]]

## Functions

### DateDecoder.min

#### Description

Check if the date is above a specific date

```ts
(minDate: Date | (() => Date)) => <A>(decoder: Decoder<A, Date>) => Decoder<A, Date>
```

#### Example
```ts
// The date needs to be above the current date
const futureDate = pipe(
  Decoder.date,
  Decoder.min(() => {
    const today = new Date().toISOString().split('T')[0]
    return new Date(today)
  })
)
```

### DateDecoder.max

#### Description

Check if the date is above a specific date

```ts
(maxDate: Date | (() => Date)) => <A>(decoder: Decoder<A, Date>) => Decoder<A, Date>
```

#### Example
```ts
// The date cannot be above "now"
const futureDate = pipe(
  Decoder.datetime,
  Decoder.max(() => {
    const now = new Date()
    return now
  })
)
```

