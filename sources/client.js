(function() {
    'use strict';

    var root = this;

    define([
        'jquery',
        'underscore',
        'http-lib',
        'storage',
        'parser',
        'encoding'
    ], function( $, _, http, storage, parser, encoding ) {

        // 2chクライアントライブラリ
        var Client = function() {
            this.HTTP_REQ_HEADERS_DEFAULT = {
                'User-Agent': 'Monazilla/1.00'
            };
        };

        Client.prototype = {};
        var proto = _(Client.prototype);

        proto.extend({
            // スレッド一覧を取得する
            getThreadList: function getThreadList(hostname, board_id, callback) {
                var url = GetUrl(hostname, '/' + board_id + '/subject.txt');
                http.get(
                    url,
                    _(this.HTTP_REQ_HEADERS_DEFAULT).extend({
                        'Host': hostname,
                    })
                ).done(callback);
            }
        });

        proto.extend({
            // SETTING.TXTを取得する
            getSettingText: function getSettingText(hostname, board_id, callback) {
                var url = GetUrl(hostname, '/' + board_id + '/SETTING.TXT');
                http.get(
                    url,
                    _(this.HTTP_REQ_HEADERS_DEFAULT).extend({
                        'Host': hostname
                    })
                );
            }
        });

        proto.extend({
            // スレッドの書き込みを取得する
            getResponsesFromThread: function getResponsesFromThread(hostname, board_id, thread_id, callback) {
                var url = GetUrl(hostname, '/' + board_id + GetDatPath(hostname, thread_id));
                http.get(
                    url,
                    _(this.HTTP_REQ_HEADERS_DEFAULT).extend({
                        'Host': hostname
                    })
                );
            }
        });

        proto.extend({
            // スレッドに書き込む
            putResponseToThread: function putResponseToThread(hostname, board_id, thread_id, response, callback) {
                var url = GetUrl(hostname, '/test/bbs.cgi?guid=ON');

                var http_req_headers = _(this.HTTP_REQ_HEADERS_DEFAULT).extend({
                    'Host': hostname,
                    'Referer': GetUrl(hostname, '/' + board_id + '/')
                });

                // 書き込みを行う
                function Write(callback) {

                    // 書き込み送信後にHTTPレスポンスヘッダを受け取る
                    function RecieveResponse(http_response) {
                        var deferreds = [];

                        // HTTPレスポンスヘッダにSet-Cookieがある場合の処理
                        if ( typeof http_response.headers['Set-Cookie'] !== 'undefined' )
                            deferreds.push(RecieveCookies(http_response.headers['Set-Cookie']));

                        // 各処理が終わったらputResponseToThreadとしての結果を返す
                        $.when.apply(null, deferreds).done(function() {
                            callback(http_response);
                        });
                    }

                    // HTTPレスポンスヘッダからCookieを取り出す
                    function RecieveCookies(set_cookies, callback) {

                        // Set-Cookieヘッダを解析する
                        function ParseSetCookie() {
                            // 分割する
                            _(set_cookies.split(';')).each(function() {
                                var list = SplitString(set_cookie, '=');
                                var key = $.trim(list[0]);
                                var value = $.trim(list[1]);

                                if ( key === 'expires' || key === 'path' )
                                    return;

                                var obj = {};
                                obj[key] = value;
                                _(cookies).extend(obj);
                            });

                            // 忍法帖用のCookieを持っていなかったら作成する
                            if ( typeof cookies['HAP'] === 'undefined' )
                                cookies['HAP'] = '';

                            // Cookieを保存する
                            return storage.set({
                                'cookies': cookies
                            });
                        }

                        var cookies = {};

                        if ( Array.isArray(set_cookies) )
                            return $.when.apply(null, _(set_cookies).map(RecieveCookies));

                        return $.when.apply(null, [
                            storage.get('cookies').done(function(items) {
                                // 保存済みのCookieを取得する
                                _(cookies).extend(items.cookies);
                            })
                        ]).done(ParseSetCookie);
                    }

                    // 書き込み内容などをSJISに変換する
                    var converted_response = _(response).clone();
                    converted_response = _(converted_response).map(function(value) {
                        return ConvertToSJIS(value);
                    });

                    // 書き込み内容などをパーセントエンコーディングでエスケープする
                    var escaped_response = _(converted_response).clone();
                    var deferreds = _(_.keys(escaped_response)).map(function(key) {
                        return EscapeSJIS(escaped_response[key]).done(function(escaped_text) {
                            escaped_response[key] = escaped_text;
                        });
                    });

                    // 準備ができたら書き込む
                    $.when.apply(null, deferreds).done(function() {
                        // TODO: 利用規約などを確認させるための処理が組めるような流れもつくる
                        http.put(
                            url,
                            http_req_headers,
                            {
                                'bbs': board_id,
                                'key': thread_id,
                                'time': 1,
                                'submit': ConvertToSJIS('上記全てを承諾して書き込む'),
                                'FROM': escaped_response.name,
                                'mail': escaped_response.mail,
                                'MESSAGE': escaped_response.body,
                                'yuki': 'akari'
                            }
                        ).done(RecieveResponse);
                    });
                }

                // CookieのHTTPリクエストヘッダを取得する
                function GetCookieHeader(cookies) {
                    var keys = _.keys(cookies);
                    var cookies_header_terms = _(keys).map(function(key) {
                        return key + '=' + cookies[key];
                    });
                    return cookies_header_terms.join('; ');
                }


                $.when.apply(null, [
                    storage.get('cookies').done(function(items) {
                        if ( typeof items.cookies !== 'undefined' ) {
                            _(http_req_headers).extend({
                                'Cookie': GetCookieHeader(items.cookies)
                            });
                        }
                    })
                ]).done(function() {
                    Write(callback);
                });
            }
        });


        // ホスト名とパスを繋げたURLを返す
        function GetUrl(hostname, path) {
            return 'http://' + hostname + path;
        }

        // DATファイルのパスを返す
        function GetDatPath( hostname, thread_id ) {
            return '/dat/' + thread_id + '.dat';
        }


        return new Client();
    });

}).call(this);
