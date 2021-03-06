requirejs([
  'js2ch-chrome'
], function(js2ch, _) {
  js2ch.init({
    debug: true
  }, function() {
    var host = 'hayabusa.2ch.net';
    var board_id = 'news4vip';
    var thread_id = '1380812402';

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
          .done(function() {
            console.log('書き込み: done');
          })
          .fail(function(info) {
            if ( info.type === 'confirm' ) {
              console.log('書き込み確認');
              info.confirm()
                .done(function() {
                  console.log('再書き込み: OK');
                })
                .fail(function(info) {
                  console.log('再書き込み: failed', info.httpResponse.body);
                });
            } else {
              console.log('書き込みfail: ', info.httpResponse.body);
            }
          });

        console.log('投稿ed');
      });

      $('body').on('click', '#database_clear', function() {
        js2ch.storage.clear()
          .done(function() {
            console.log('db clear');
          });
      });

      $('body').on('click', '#show_storage', function() {
        js2ch.storage.get('form_append_params')
          .done(function(items) {
            console.log('form_append_params = ', items);
          });
        js2ch.storage.get('cookies')
          .done(function(items) {
            console.log('cookies = ', items);
          });
      });

      $('body').append(function() {
        var elem = $('<div></div>');
        elem.append('<div><button id="database_clear">データベースを初期化</button></div>');
        elem.append('<div><button id="show_storage">ストレージのデータを表示</button></div>');
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
        .done(function(responses) {
          responses.reverse();
          _(responses).each(function(response) {
            $('body').append(function() {
              var res = '';
              res += '<ul>';
              res += '<li>'+response.number+'</li>';
              res += '<li>'+response.name.data+'</li>';
              res += '<li>'+response.mail.data+'</li>';
              res += '<li>'+response.info.data+'</li>';
              res += '<li>'+response.body.data+'</li>';
              res += '</ul>';
              return res;
            });
          })
        });
    });


  });
})
