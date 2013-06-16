/* ===================================================
 * JavaScript 2ch-client Library
 * https://github.com/sh19910711/js2ch
 * ===================================================
 * Copyright (c) 2013 Hiroyuki Sano
 * 
 * Licensed under MIT License.
 * http://opensource.org/licenses/MIT
 * =================================================== */
(function() {
    'use strict';

    var root = this;

    define([
        'jquery',
        'underscore',
        'socket',
        'purl',
        'async',
        'util',
        'buffer-lib'
    ], function($, _, socket, purl, async, util, buffer_lib) {
        var BR = "\r\n";

        var HttpLib = function() {
        };

        HttpLib.prototype = {};
        var proto = _(HttpLib.prototype);

        proto.extend({
            // GETリクエストを送信する
            get: function get(url, http_headers_obj, callback) {
                // CreateSocket -> SendHttpRequest -> RecieveHttpResponse

                var http_response = {};
                var url_obj = $.url(url);
                var connect_info = {
                    host: url_obj.attr('host'),
                    path: url_obj.attr('path')
                };
                var socket_id;

                // ソケットを作成する
                function create_socket(callback) {
                    socket.create('tcp', {}, function(info) {
                        socket_id = info.socketId;
                        callback(null);
                    });
                }

                // HTTPリクエストを送る
                function send_http_request(callback) {
                    socket.connect(socket_id, connect_info.host, 80, function() {
                        var http_headers = [];
                        http_headers.push('GET ' + connect_info.path + ' HTTP/1.0' + BR);
                        _(_.keys(http_headers_obj)).each(function(key) {
                            http_headers.push(key + ': ' + http_headers_obj[key] + BR);
                        });
                        http_headers.push('Connection: close' + BR);
                        http_headers.push(BR);

                        var http_headers_text = http_headers.join('');
                        GetBuffer(http_headers_text).done(function(send_buf) {
                            socket.write(socket_id, send_buf, function() {
                                callback(null);
                            });
                        });
                    });
                }

                // HTTPレスポンスを受け取る
                function recieve_http_response(callback) {
                    var http_response_array_data = [];
                    var http_response_text = '';
                    var timeout = setTimeout(read, 0);

                    // 読み取り
                    function read() {
                        socket.read(socket_id, 256, function(result) {
                            if ( result.resultCode < 0 ) {
                                clearTimeout(timeout);
                                http_response_array_data = _(http_response_array_data).map(function(v) {return v;});
                                socket.destroy(socket_id);
                                buffer_lib.convertToString(http_response_array_data, function(converted_text) {
                                    http_response = GetResponse(converted_text);
                                    callback(null);
                                });
                            } else {
                                var arr = [];
                                var u8 = new Uint8Array(result.data);
                                _(u8).each(function(value) {
                                    arr.push(value);
                                });
                                http_response_array_data = http_response_array_data.concat(arr);
                                timeout = setTimeout(read, 0);
                            }
                        });
                    }
                }

                async.series([
                    create_socket,
                    send_http_request,
                    recieve_http_response
                ], function() {
                    callback(http_response);
                });
            }
        });

        proto.extend({
            post: function post(url, http_headers_obj, data, callback) {
                var http_response = {};
                var url_obj = $.url(url);
                var connect_info = {
                    host: url_obj.attr('host'),
                    path: url_obj.attr('path'),
                    query: url_obj.attr('query')
                };
                var socket_id;

                // ソケットを作成する
                function create_socket(callback) {
                    socket.create('tcp', {}, function(info) {
                        socket_id = info.socketId;
                        callback(null);
                    })
                }

                // HTTPリクエストを送る
                function send_http_request(callback) {
                    socket.connect(socket_id, connect_info.host, 80, function() {
                        var http_headers = [];
                        var path = connect_info.path;
                        var query = ConvertToQueryString(data);

                        if ( connect_info.query != '' )
                            path += '?' + connect_info.query;

                        http_headers.push('POST ' + path + ' HTTP/1.1' + BR);
                        _(_.keys(http_headers_obj)).each(function(key) {
                            http_headers.push(key + ': ' + http_headers_obj[key] + BR);
                        });
                        http_headers.push('Connect-Length: ' + (new Blob([query])).size + BR);
                        http_headers.push('Connection: close' + BR);
                        http_headers.push(BR);
                        http_headers.push(query);

                        var http_headers_text = http_headers.join('');
                        GetBuffer(http_headers_text).done(function(send_buf) {
                            socket.write(socket_id, send_buf, function() {
                                callback(null);
                            });
                        });
                    });
                }

                // HTTPレスポンスを受け取る
                function recieve_http_response(callback) {
                    var http_response_text = '';
                    var timeout = setTimeout(read, 0);

                    function read() {
                        socket.read(socket_id, 256, function(result) {
                            if ( result.resultCode < 0 ) {
                                clearTimeout(timeout);
                                socket.destroy(socket_id);
                                http_response = GetResponse(http_response_text);
                                callback(null);
                            } else {
                                var fileReader = new FileReader();
                                fileReader.onloadend = function() {
                                    http_response_text += fileReader.result;
                                    timeout = setTimeout(read, 0);
                                };
                            }
                        });
                    }
                }

                async.series([
                    create_socket,
                    send_http_request,
                    recieve_http_response
                ], function() {
                    callback(http_response);
                });
            }
        });


        // 文字列をArrayBufferに変換する
        function GetBuffer(str, callback) {
            var deferred = new $.Deferred();
            if ( ! ( callback instanceof Function ) )
                callback = deferred.resolve;

            buffer_lib.convertToBuffer(str, callback);

            return deferred;
        }

        // 文字列strをtokenで分割する
        function SplitString(str, token) {
            var x = str.indexOf(token);
            return [str.substring(0, x), str.substring(x + token.length)];
        }

        // HTTPレスポンスのヘッダ部をオブジェクトにする
        function ParseHeaderText(header_text) {
            var http_headers = header_text.split(BR);

            // HTTPレスポンスのステータスを取得する（200とか404とか）
            var status_line = http_headers[0].split(' ');

            var lines = http_headers.slice(1);
            var terms = lines.map(function(line) {
                return SplitString(line, ':').map($.trim);
            });
            var response_headers = {
                'HTTP-Version': status_line[0],
                'Status-Code': status_line[1]
            };

            terms.forEach(function(term) {
                response_headers[term[0]] = term[1];
            });

            return response_headers;
        }

        // HTTPレスポンスからヘッダ部を取り出す
        function GetHeaderText(http_response) {
            return SplitString(http_response, BR + BR)[0];
        }

        // HTTPレスポンスからボディ部分を取り出す
        function GetBodyText(http_response) {
            return SplitString(http_response, BR + BR)[1];
        }

        // オブジェクトをクエリ用の文字列に変換する
        function ConvertToQueryString(data) {
            return _(_.keys(data)).map(function(key) {
                return key + '=' + data[key];
            }).join('&');
        }

        // HTTPレスポンステキストをオブジェクトに変換する
        function GetResponse(http_response) {
            var response_headers = ParseHeaderText(GetHeaderText(http_response));
            var http_response = {
                headers: response_headers,
                body: GetBodyText(http_response)
            };
            return http_response;
        }

        // Deferredの設定
        var keys = ['get', 'post'];
        _(keys).each(function(key) {
            HttpLib.prototype[key] = util.getDeferredFunc(HttpLib.prototype[key]);
        });

        return new HttpLib();
    });

}).call(this);
