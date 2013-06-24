requirejs([
  'js2ch-chrome'
], function(js2ch, _) {
  js2ch.init({
    debug: true
  }, function() {
    var host = 'hayabusa.2ch.net';
    var board_id = 'news4vip';
    var thread_id = '1372053483';

    requirejs([
              'underscore',
              'jquery',
              'parser'
    ], function(_, $, Parser) {

      $('html').css({
        overflow: 'auto'
      });

      $('body').css({
        overflow: 'auto',
        cursor: 'auto',
        userSelect: 'text'
      });

      $('body').on('click', '#submit_button', function() {
        var res = {
          name: $('#res_name').val(),
          mail: $('#res_mail').val(),
          body: $('#res_body').val()
        };

        js2ch.putResponseToThread(host, board_id, thread_id, res)
          .done(function(response) {
            console.log('書き込みdone: ', response);
          })
          .fail(function(response) {
            console.log('書き込みdone: ', response);
          });

        console.log('投稿');
      });

      $('body').on('click', '#database_clear', function() {
        js2ch.cookie_manager.storage.clear();
      });

      $('body').append(function() {
        var elem = $('<div></div>');
        elem.append('<div><button id="database_clear">データベースを初期化</button></div>');
        return elem;
      });

      $('body').append('<hr>');

      $('body').append(function() {
        var elem = $('<div></div>');
        elem.append('<div><input type="text" id="res_name"></div>');
        elem.append('<div><input type="text" value="sage" id="res_mail"></div>');
        elem.append('<div><textarea id="res_body"></textarea></div>');
        elem.append('<div><button id="submit_button">投稿</button></div>');
        return elem;
      });

      var parser = new Parser();
      js2ch.getResponsesFromThread(host, board_id, thread_id)
        .done(function(http_response) {
          var responses = parser.parseResponsesFromThread(http_response.body);
          responses.reverse();
          _(responses).each(function(response) {
            $('body').append(function() {
              var res = '';
              res += '<ul>';
              res += '<li>'+response.number+'</li>';
              res += '<li>'+response.name.data+'</li>';
              res += '<li>'+response.mail+'</li>';
              res += '<li>'+response.info+'</li>';
              res += '<li>'+response.body+'</li>';
              res += '</ul>';
              return res;
            });
          })
        });
    });


  });
})
