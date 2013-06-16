requirejs([
    'js2ch-chrome'
], function(js2ch) {
    js2ch.init(function() {
        js2ch.getThreadList('hayabusa.2ch.net', 'news4vip', function(response) {
            console.log('response: ', response);
        });
    });
})
