define(
  [
    'jquery',
    'underscore',
    'util-lib'
  ],
  function($, _, UtilLib) {
    var PutUtils = function(context) {
      this.context = context;
    };

    // 書き込みを行う
    PutUtils.prototype.write = function write() {
      // 送信直前に必要な処理を行う（パラメータの追加など）
      var promise = $.when.apply(null, [
        this.add_http_req_params()
      ]);
      // 各処理が済んだらリクエストを送信
      promise.done(this.send_http_request.bind(this));
    };

    // 書き込み送信後にHTTPレスポンスヘッダを受け取る
    PutUtils.prototype.receive_response = function receive_response() {
      // リクエスト受信後のCookieなどの処理 
      var promise = $.when.apply(null, [
        this.check_cookie()
      ]);
      promise.done(this.after_receive_response.bind(this));
    };

    // HTTPレスポンスヘッダにSet-Cookieがある場合の処理
    PutUtils.prototype.check_cookie = function check_cookie_func() {
      var deferred = new $.Deferred();
      if (typeof this.http_response.headers['Set-Cookie'] !== 'undefined') {
        this.context.cookie_manager.setCookieHeader(this.url, this.http_response.headers_source)
          .done(function() {
            deferred.resolve();
          });
      }
      else {
        deferred.resolve();
      }
      return deferred;
    };

    // HTTPレスポンス受信後の処理（callbackの実行）
    PutUtils.prototype.after_receive_response = function after_receive_response() {
      var title_text = this.context.parser.parseTitleFromHTML(UtilLib.ConvertToUTF8(this.http_response.body));
      if ('書きこみました。' === title_text) {
        this.ok_callback(UtilLib.ConvertToUTF8(this.http_response.body));
      }
      else if ('■ 書き込み確認 ■' === title_text) {
        console.log("確認: ", this.ok_callback, this.fail_callback);
        this.fail_callback({
          type: 'confirm',
          httpResponse: this.http_response,
          confirm: this.confirm_callback.bind(this)
        });
      }
      else {
        this.fail_callback({
          type: 'error',
          httpResponse: this.http_response
        });
      }
    };

    // 書き込み確認後の処理
    PutUtils.prototype.confirm_callback = function confirm_callback_func() {
      var promise = new $.Deferred();

      var after_storage_get = function(items) {
        // ストレージに設定できたら再書き込みを行う
        var after_storage_set = function after_storage_set_func() {
          this.self_func.call(this.context, this.hostname, this.board_id, this.thread_id, this.response)
            .done(promise.resolve)
            .fail(promise.reject);
        };
        var http_req_iterator = function(key) {
          if (typeof new_form_params[key] === 'undefined')
            delete new_form_params[key];
          else if (key === 'FROM' || key === 'MESSAGE' || key === 'mail' || key === 'time')
            delete new_form_params[key];
          else if (this.http_req_params[key] === new_form_params[key])
            delete new_form_params[key];
          else
            new_form_params[key] = UtilLib.ConvertToSJIS(new_form_params[key].toString());
        };
        // 不足しているパラメータを取得する
        var new_form_params = this.context.parser.parseFormFromHTML(UtilLib.ConvertToUTF8(this.http_response.body))['../test/bbs.cgi?guid=ON'].params;
        _(_.keys(this.http_req_params))
          .each(http_req_iterator.bind(this));
        // オブジェクトじゃなかったらオブジェクトにしておく
        if (typeof items[this.context.STORAGE_FORM_APPEND_PARAMS] !== 'object')
          items[this.context.STORAGE_FORM_APPEND_PARAMS] = {};
        // ストレージに保存しておく
        _(items[this.context.STORAGE_FORM_APPEND_PARAMS])
          .extend(new_form_params);
        this.context.storage.set(items)
          .done(after_storage_set.bind(this));
      };

      // 不足しているパラメータを追加して保存し、再書き込みを行う
      this.context.storage.get(this.context.STORAGE_FORM_APPEND_PARAMS)
        .done(after_storage_get.bind(this));

      return promise;
    };

    // 準備ができたらPOSTリクエストを送信する
    PutUtils.prototype.send_http_request = function send_http_request_func() {
      var after_http_post = function(http_response) {
        this.http_response = http_response;
        this.receive_response();
      };
      this.context.http.post(this.url, this.http_req_headers, this.http_req_params)
        .done(after_http_post.bind(this));
    };

    // 追加のパラメータがあれば追加する（yuki=akariなどの対応）
    PutUtils.prototype.add_http_req_params = function add_http_req_params_func() {
      var promise = this.context.storage.get(this.context.STORAGE_FORM_APPEND_PARAMS);
      var after_storage_get = function(items) {
        _(this.http_req_params)
          .extend(items[this.context.STORAGE_FORM_APPEND_PARAMS]);
      };
      promise.done(after_storage_get.bind(this));
      return promise;
    };

    // リクエスト前に送信するクエリを準備する
    PutUtils.prototype.prepare_http_req_params = function prepare_http_req_params() {
      var deferred = new $.Deferred();
      setTimeout(this.generate_http_params.bind(this, deferred.resolve), 0);
      return deferred;
    };

    // 取得したCookieをHTTPリクエストヘッダに追加する
    PutUtils.prototype.after_get_cookie_header = function after_get_cookie_header_func(cookie_header) {
      if (cookie_header === 'Cookie: ')
        return;
      _(this.http_req_headers)
        .extend({
          'Cookie': cookie_header.substr(8)
        });
    };

    // リクエスト前に送信するCookieを準備する
    PutUtils.prototype.prepare_cookie = function prepare_cookie_func() {
      var promise = this.context.cookie_manager.getCookieHeader(this.url);
      promise.done(this.after_get_cookie_header.bind(this));
      return promise;
    };

    return PutUtils;
  });
