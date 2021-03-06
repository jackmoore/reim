# Plugin

Reim can be extended using plugins. An example plugin would be like this:

```javascript
const sayHello(options) {
    const message = options.message
    return (store) => {
        store.subscribe(state => {
            console.log('Hello! ', options.message)
            store.emit('said-hello', options.message)
        })
    }
}

// or to make a named plugin...
const sayBye(options) {
    const message = options.message
    return {
        name: 'Bye', 
        call(store) {
            store.subscribe(state => {
                console.log('Bye! ', options.message)
                // Emit event to store
                store.emit('said-bye', options.message)
            })
        }
    }
}
```

Note that it is a function returning an function. This enables us to accept plugin-specific options. Now to use it:

```javascript
// Add plugins on store creation
const someStore = reim({}, {plugins: sayHello({message: 'World'})})

// Add plugins in runtime
someSore.plugin(sayBye('Once'), sayBye('Again!'))

someStore.setState({count: 1000})
// logs 'Hello! World'
// logs 'Bye! Once'
// logs 'Bye! Again!'
```



