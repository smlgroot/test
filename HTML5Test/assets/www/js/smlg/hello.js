// initialize jo
jo.load();

// create our view card, notice we're nesting widgets inline
var card = new joCard([
    new joTitle("Hello"),
    new joCaption("Hello World!"),
    new joDivider(),
    new joButton("OK").selectEvent.subscribe(function() {
        stack.hide();
    })
]);

// setup our stack and screen
var stack = new joStack();
var screen = new joScreen(stack);

// put the card on our view stack
stack.push(card);