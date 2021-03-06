import reim, {toStream} from '../src'

test('store a store', () => {
  const tstore = reim({abc: 12})

  expect(tstore.state.abc).toBe(12)
})

test('set', () => {
  const store = reim({foo: 17})

  store.setState(state => {
    state.foo += 11
  })
  expect(store.state.foo).toBe(28)

  store.setState({
    bb: 100
  })
  expect(store.state.foo).toBe(28)
  expect(store.state.bb).toBe(100)
})

// test('primitives Map & Set support', async () => {
//   const store = reim({
//     deep: {
//       foo: {
//         bar: {
//           baz: true
//         }
//       },
//       set: new Set([{ one: "two" }, { two: "three" }]),
//       map: new Map([["one", { foo: "bar" }]]),
//       array: [{ i: 1 }, { i: 2 }, { i: 3 }, { i: 4 }, { i: 5 }]
//     }
//   })

//   const updated = jest.fn()

//   store.subscribe(updated)

//   expect(updated).toBeCalledTimes(1)

//   store.setState(draft => {
//     const one = draft.deep.map.get('one');
//     if (one) {
//       one.foo = 1;
//     }
//     draft.deep.set.clear();
//     draft.deep.set.add({ some: "obj" });
//   })()

//   expect(updated).toBeCalledTimes(2)
// })

describe('subscription', () => {
  test('subscribe to store', () => {
    const store = reim({mag: 75})

    const updated = jest.fn()
    // Should be called on subscribe also for initial fetch
    store.subscribe(updated)
    store.setState(state => {
      state.mag -= 10
    })
    expect(updated).toBeCalledTimes(1)
  })

  test('unsubscribe from store', () => {
    const store = reim({poi: 500})

    const updated = jest.fn()

    const handler = store.subscribe(updated)
    store.setState(state => {
      state.poi += 30
    })
    expect(updated).toBeCalledTimes(1)

    store.unsubscribe(handler)
    store.setState(state => {
      state.poi *= 10
    })
    expect(updated).toBeCalledTimes(1)
  })
})

describe('observable', () => {
  test('create a stream from store', () => {
    const store = reim({count: 123})

    const stream = toStream(store)
    expect(stream.subscribe().unsubscribe).toBeInstanceOf(Function)
  })
})
