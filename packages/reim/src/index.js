import {produce, setAutoFreeze} from 'immer'
import bind from 'auto-bind'
import emitter from 'event-emitter'
import isEqual from 'lodash/isEqual'
import isFunction from 'lodash/isFunction'

setAutoFreeze(true)

class Store {
  _state = {}

  _subscribers = []

  get __isStore() {
    return true
  }

  get state() {
    return this._state
  }

  constructor(state) {
    this._state = produce(state, () => {})
    emitter(this)
    bind(this)
  }

  snapshot(getter = state => state) {
    return produce(this.state, getter)
  }

  getState = this.snapshot

  // Mutatable way to update state
  commit(mutation, ...args) {
    const newState = mutation(this._state, ...args)
    Object.assign(this._state, newState)

    this.emit('set', mutation, ...args)
    this._notify()

    return this.state
  }

  // Immutable way to update state
  set(mutation, ...args) {
    this._state = produce(
      this.state, (
        isFunction(mutation) ?
          state => (mutation(state, ...args) || undefined) :
          () => ({...this.state, ...mutation})
      )
    )

    this.emit('set', mutation, ...args)
    this._notify()
    return this.state
  }

  setState = this.set

  /**
   * subscribe - Add subscriber
   *
   * @param {Function} handler subscriber callback
   * @param {Object} option Options for subscription
   * @param {boolean} option.immediate Whether to run sub
   * @param {Function} option.getter getters for data subscription
   *
   * @returns {Function} unsubscriber
   */
  subscribe(handler, {immediate = false, getter = state => state} = {}) {
    // TODO: check if the getter is not cachable here
    this._subscribers.push({handler, getter})
    if (immediate) {
      this._notify()
    }
    return () => this.unsubscribe(handler)
  }

  /**
   * unsubscribe - Remove subscriber
   *
   * @param {Function} handler subscriber to remvoe
   *
   */
  unsubscribe(handler) {
    this._subscribers.splice(this._subscribers.findIndex(sub => sub.handler === handler), 1)
  }

  plugin(...plugins) {
    plugins.forEach(
      plugin => {
        plugin.call(this, this)
      }
    )
    return this
  }

  _notify() {
    this._subscribers.forEach(sub => {
      // Notify if getterCache is updated
      const getterCache = sub.getter(this.state)
      if (!isEqual(getterCache, sub.getterCache)) {
        sub.getterCache = getterCache
        sub.handler(getterCache)
      }
    })
  }
}

export const store = (state, {name, plugins = []} = {}) => {
  const store = new Store(state)
  store.name = name

  store.plugin(...plugins)
  return store
}

export const register = store

export default store

const observableSymbol = () => ((typeof Symbol === 'function' && Symbol.observable) || '@@observable')

// Returns an observable stream
export const toStream = (store, options = {}) => {
  return {
    subscribe: (observer = () => {}) => ({
      unsubscribe: store.subscribe((
        typeof observer === 'function' ?
          selected => observer(selected) :
          selected => observer.next(selected)
      ), {...options, immediate: true})
    }),
    [observableSymbol()]() {
      return this
    }
  }
}
