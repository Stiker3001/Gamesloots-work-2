function price_rub() {
    $('.dlrprice').each(function() {
        var price = $(this);
        price.hide();
    });
    $('.rubprice').each(function() {
        var price = $(this);
        price.show();
    });
};

function price_dlr() {
    $('.rubprice').each(function() {
        var price = $(this);
        price.hide();
    });
    $('.dlrprice').each(function() {
        var price = $(this);
        price.show();
    });
};

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function showerr(data) {
    if (typeof Telegram == 'object') {
        Telegram.WebApp.showAlert(data);
    } else {
        $().toastmessage('showToast', {
            text: data,
            sticky: false,
            position: 'top-right',
            type: 'warning'
        });
    }
}

function showmsg(data) {
    $().toastmessage('showToast', {
        text: data,
        sticky: false,
        position: 'top-right',
        type: 'notice'
    });
}

function sendData() {
    var email = $('input[name=email]').val().toLowerCase();
    var countAccs = $('input[name=count]').val() || 0;
    var selectType = $('select[name=item]').val();
    var rules = $('input[name=rules_accept]:checked').val();
    var preOrder = $('input[name=preOrder]:checked').val();
    var minCount = $('option[value="' + selectType + '"]').attr('data-min_order');
    // var countType = $('td[data-id=' + selectType + ']').html();
    // var forms 
    if ($('[logged_by_tg]').length == 0) {
        // console.log($('[logged_by_tg]').length);
        if (!validateEmail(email)) {
            if ($("meta[lang_cart]").length == 1) {
                var err = 'Please enter valid email';
            } else {
                var err = 'Указан неверный email адрес';
            }
            showerr(err);
            return false;
        }
    }
    var stateOrder = $('body').data('orderWait');
    if (parseInt(stateOrder) == 1) {
        showerr('Подождите....');
        return false;
    }
    if (parseInt(selectType) != 4) {
        var function_order = '';
        check_form_compos();
        if (parseInt(countAccs) < parseInt(minCount)) {
            var err = 'Мин. кол-во для заказа: ' + minCount;
            showerr(err);
            return false;
        }
        //      if (parseInt(countType) < parseInt(countAccs)) {
        //        var err = 'Такого количества товара нет';
        //        showerr(err);
        //        return false;
        // } 
    } else {
        var function_order = 'createcart';
    }
    if ($("meta[lang_cart]").length == 1 && $("meta[direct_order]").length == 0) {
        var path = '/en/order/';
    } else {
        var path = '/order/';
    }
    $('body').data('orderWait', 1);
    $.ajax({
        url: path + function_order,
        method: 'post',
        // dataType: 'json',
        data: {
            email: email,
            count: countAccs,
            rules: rules,
            en_sub: $('input[name=email_sub]:checked').val(),
            type: selectType,
            forms: collect_value(),
            fund: $('select[name=funds]').val(),
            'copupon': $('#copupon').val(),
            'cartItems': $('input[name=cartItems]').val(),
            'g-recaptcha-response': $('[name=g-recaptcha-response]').val(),
            preOrder: preOrder
        },
        success: function(data) {
            try {
                if (typeof(grecaptcha) !== "undefined") {
                    grecaptcha.reset();
                }
                var res = JSON.parse(data);
                if (res.ok == 'TRUE') {
                    if (res.redirect == 'yes') {
                        $('body').data('orderWait', 0);
                        // location=res.url;
                        document.location.href = res.url;
                        // location.replace(res.url);
                        // window.location.reload(res.url);
                        // document.location.replace(res.url);
                    } else {
                        $('body').data('orderWait', 0);
                        $('.paytable .payitem').text(res.name);
                        $('.paytable .paycount').text(res.count);
                        $('.paytable .payprice').text(res.price);
                        $('.paytable .payfund').html(res.fund);
                        $('.paytable .paybill').html(res.bill);
                        $('.paytable .discount').html(res.discount);
                        $('.paytable .bonuspr').html(res.bonus);
                        $('.paytable .link').html(res.linkwm);

                        $('.paytable .payfund').val($(res.fund).text());
                        $('.paytable .paybill').val($(res.bill).text());

                        $('.checkpaybtn').attr('onclick', "checkpay('" + res.check_url + "')");
                        var newpay = $('.modalpay').attr('newpay');
                        if (newpay == '1') {
                            var inst = $('[data-remodal-id=paymodal]').remodal({
                                hidebg: 1
                            });
                            inst.open();
                        } else {
                            $('#paymodal').modal('toggle');
                        }
                        if (res.btc == 'yes') {
                            $('.hide_btc_pay').hide();
                            $('.btc_text').show();
                            $('.txt_info').hide();
                        } else {
                            $('.hide_btc_pay').show();
                            $('.btc_text').hide();
                            $('.txt_info').show();
                        }
                    }
                }
                if (typeof(res.error) !== "undefined" && res.error !== null) {
                    $('body').data('orderWait', 0);
                    showerr(res.error);
                }
            } catch (err) {
                $('body').data('orderWait', 0);
                alert('Что-то пошло не так, попробуйте еще раз');
            }
        },
        error: function(jqXHR, exception) {
            $('body').data('orderWait', 0);
            if (jqXHR.status === 0) {
                alert('Not connect. Verify Network.');
            } else if (jqXHR.status == 404) {
                alert('Requested page not found (404).');
            } else if (jqXHR.status == 500) {
                alert('Internal Server Error (500).');
            } else if (exception === 'parsererror') {
                alert('Requested JSON parse failed.');
            } else if (exception === 'timeout') {
                alert('Time out error.');
            } else if (exception === 'abort') {
                alert('Ajax request aborted.');
            } else {
                alert('Uncaught Error. ' + jqXHR.responseText);
            }
        }
    });
}

function checkpay(url) {
    $('.checkpaybtn').button('loading');
    $.get(url, function(data) {
        $('.checkpaybtn').button('reset');
        var res = JSON.parse(data);
        if (res.status == "wait_30_sec") {
            showerr(res.message);
            throw "stop";
        }
        if (res.status == "reset_pass") {
            alert('Владельцу магазина необходимо обновить пароль своего QIWI кошелька! ')
            throw "stop";
        }
        if (res.status == "Bad_log_pass" || res.status == "error_log_pass") {
            alert('Владельцу магазина необходимо проверить правильность ввода данных QIWI кошелька! ')
            throw "stop";
        }
        if (res.status == "ok_telegram") {
            // $('.checkpaybtn').attr('onclick', 'window.location ="' + res.chkurl + '"');
            $('.checkpaybtn').text('Товар был отправлен вам от бота!');
        }
        if (res.status == "ok") {
            $('.checkpaybtn').attr('onclick', 'window.location ="' + res.chkurl + '"');
            $('.checkpaybtn').text('Скачать');
        } else {
            alert('Платеж не найден :(  Попробуйте еще раз через мгновение :) ')
        }
    });
}

function chkp(url) {
    $('.checkpaybtnr').button('loading');
    $.get(url, function(data) {
        $('.checkpaybtnr').button('reset');
        var res = JSON.parse(data);
        if (res.status == "wait_30_sec") {
            showerr(res.message);
            throw "stop";
        }
        if (res.status == "ok") {
            $('.checkpaybtnr').attr('onclick', 'window.location ="' + res.chkurl + '"');
            $('.checkpaybtnr').text('Скачать');
        } else {
            alert('Увы , но платеж не найден.')
        }
    });
}

function qq() {
    var search = $('#search').val();
    $.ajax({
        type: 'GET',
        url: '/',
        data: "search=" + search,
        success: function(data) {
            $('div.layer').html(data);
        }
    });
}
$(document).ready(function() {
    if ($('.pay_btns').attr('data-status') == '1') {
        $('input[name=rules_accept]').click(function() {
            state = $(this).is(':checked');
            if (state == false) {
                $('.pay_btns').css('opacity', '0.3');
                $('.pay_btns').css('pointer-events', 'none');
            } else if (state == true) {
                $('.pay_btns').css('opacity', '1');
                $('.pay_btns').css('pointer-events', 'auto');
            }
        });
    }
});

function getinputforms(id) {
    // console.log(testqip);
    if (parseInt(id) == 4) {
        return false;
    }
    $('.composInput').remove();
    var className = 'formcomposer';
    var newpay = $('.modalpay').attr('newpay');
    $.post("/goods/formjson", {
        id: id,
    }, function(data) {
        var jsondata = JSON.parse(data);
        for (var F in jsondata) {

            // if()

            if (typeof(modal_plf) !== "undefined") {
                $('.' + className).append('<div class="fieldset__item"><div class="fieldset__label">' + jsondata[F].name + '</div><div class="fieldset__content"><input req="' + jsondata[F].required + '" type="text" name="forms[' + jsondata[F].id + ']" class="input__text  composInput input_bld  input--center" placeholder="' + jsondata[F].name + '"></div></div>');
                continue;
            }

             if (typeof(prime_accs) !== "undefined") {
                // $('.' + className).append('<div class="fieldset__item"><div class="fieldset__label">' + jsondata[F].name + '</div><div class="fieldset__content"><input req="' + jsondata[F].required + '" type="text" name="forms[' + jsondata[F].id + ']" class="input__text coupon_input composInput input_bld  input--center" placeholder="' + jsondata[F].name + '"></div></div>');
                
                $('.' + className).append('<label class="composInput form-popup__label form-popup__label_email"><span>' + jsondata[F].name + '</span><input class="form-popup__input email_input input_bld" type="text" name="forms[' + jsondata[F].id + ']" placeholder="' + jsondata[F].name + '" required=""></label>');

                continue;
            }
            

            if ($(".nope_tpl").hasClass("nope_yes")) {
                $('.' + className).append('<input name="forms[' + jsondata[F].id + ']" placeholder="' + jsondata[F].name + '" nameinput="' + jsondata[F].name + '" req="' + jsondata[F].required + '" class="composInput form-control input-small input_bld"   style="text-align: center;margin-top: 5px;">');
            } else {
                if ($('.tab_modal').length != 0) {
                    $('.' + className).append('<div class="form-group composInput"><label>' + jsondata[F].name + '</label> <input class="form-leque-control input-leque-sm composInput input_bld" name="' + jsondata[F].name + '" placeholder="' + jsondata[F].name + '" type="text"></input></div>');
                    continue;
                }
                if ($('body').attr('paypage') == '1') {
                    $('.' + className).append('<label for="input_' + jsondata[F].id + '">' + jsondata[F].name + '</label> <input name="forms[' + jsondata[F].id + ']" placeholder="' + jsondata[F].name + '" nameinput="' + jsondata[F].name + '" req="' + jsondata[F].required + '" class="composInput input_bld form-control">');
                    continue;
                }
                if (newpay == '1') {
                    $('.' + className).append('<tr class="composInput"><td>' + jsondata[F].name + ':</td><td><input type="text" nameinput="' + jsondata[F].name + '" req="' + jsondata[F].required + '" class="form-leque-control input-leque-sm input_bld"  name="forms[' + jsondata[F].id + ']"></td></tr>');
                } else {
                    $('.' + className).append('<tr class="composInput"><td>' + jsondata[F].name + ':</td><td><input type="text" nameinput="' + jsondata[F].name + '"  req="' + jsondata[F].required + '" class="form-control input-small input_bld"  name="forms[' + jsondata[F].id + ']"></td></tr>');
                }
            }
        }
    });
}

function check_form_compos() {
    var items_search = $('.formcomposer');
    var items_input = items_search.find(".input_bld");
    items_input.each(function() {
        if ($(this).attr('req') == 'yes' && !$(this).val()) {
            $('input[name="' + $(this).attr('name') + '"]').attr('placeholder', 'Заполните это поле');
            showmsg('Поле "<b>' + $(this).attr('nameinput') + '</b>" необходимо заполнить');
            throw 'Required input! ';
            // console.log($(this).attr('id'));
        }
    });
    console.log('well done :)');
    // XUTPULA coder 
}

function collect_value() {
    var form_start = $('.formcomposer').find('.input_bld');
    if (form_start.length == 0) {
        var form_start = $('.formCustomPoser').find('.input_bld');
    }
    var unindexed_array = form_start.serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function(n, i) {
        indexed_array[n['name']] = n['value'];
    });
    return JSON.stringify(indexed_array);
}

function GetPay(email, count, selectType, minCount, allcount, fund, coupon) {
    if ($('[logged_by_tg]').length == 0) {
        // console.log($('[logged_by_tg]').length);
        if (!validateEmail(email)) {
            if ($("meta[lang_cart]").length == 1) {
                var err = 'Please enter valid email';
            } else {
                var err = 'Указан неверный email адрес';
            }
            showerr(err);
            return false;
        }
    }
    // if (parseInt(count) < parseInt(minCount)) {
    //     var err = 'Мин. кол-во для заказа: ' + minCount;
    //     showerr(err);
    //     return false;
    // }
    // if (parseInt(allcount) < parseInt(count)) {
    // var err = 'Такого количества товара нет';
    // showerr(err);
    // return false;
    // }
    // check_form_compos();
    if (parseInt(selectType) != 4) {
        var function_order = '';
        check_form_compos();
        if (parseInt(allcount) < parseInt(minCount)) {
            var err = 'Мин. кол-во для заказа: ' + minCount;
            showerr(err);
            return false;
        }
        if (parseInt(count) > parseInt(allcount)) {
            var err = 'Такого количества товара нет';
            showerr(err);
            return false;
        }
    } else {
        var function_order = 'createcart';
    }
    if ($("meta[lang_cart]").length == 1  && $("meta[direct_order]").length == 0) {
        var path = '/en/order/';
    } else {
        var path = '/order/';
    }
    var stateOrder = $('body').data('orderWait');
    if (parseInt(stateOrder) == 1) {
        showerr('Подождите....');
        return false;
    }
    $('body').data('orderWait', 1);
    var auth_telegam = 0;
    if ($('input[name="auth_telegam"]').length == 1 && $('input[name="auth_telegam"]').val() != '') {
        auth_telegam = 1;
    }

        if ($('input[name="custom_url"]').length == 1 && $('input[name="custom_url"]').val() != '') {
            var path = $('input[name="custom_url"]').val();
        }

    $.ajax({
        url: path + function_order,
        method: 'post',
        // dataType: 'json',
        data: {
            email: email,
            count: count || 1,
            type: selectType,
            rules: $('input[name=rules_accept]:checked').val(),
            en_sub: $('input[name=email_sub]:checked').val(),
            cartItems: $('input[name=cartItems]').val(),
            forms: collect_value(),
            fund: fund,
            'g-recaptcha-response': $('[name=g-recaptcha-response]').val(),
            'copupon': coupon,
            auth_telegam: auth_telegam
        },
        success: function(data) {
            try {
                if (typeof(grecaptcha) !== "undefined") {
                    grecaptcha.reset();
                }
                var res = JSON.parse(data);
                if (res.ok == 'TRUE') {
                    // if(callback != 0){
                    //     callback();
                    // }
                    if (res.redirect == 'yes') {
                        $('body').data('orderWait', 0);
                        // location=res.url;
                        if (typeof Telegram == 'object') {
                            // console.log('gg');
                            // alert('4441');
                            Telegram.WebApp.openLink(res.url);
                        } else {
                            document.location.href = res.url;
                        }
                        // location.replace(res.url);
                        // window.location.reload(res.url);
                        // document.location.replace(res.url);
                    } else {
                        $('body').data('orderWait', 0);
                        $('.paytable .payitem').text(res.name);
                        $('.paytable .paycount').text(res.count);
                        $('.paytable .payprice').text(res.price);
                        $('.paytable .payfund').html(res.fund);
                        $('.paytable .paybill').html(res.bill);
                        console.log('v_454');
                        
                        $('.paytable .payfund').val($(res.fund).text());
                        $('.paytable .paybill').val($(res.bill).text());
                        $('.paytable .paycount').val(res.count);
                        $('.paytable .payprice').val(res.price);
                        $('.paytable .discount').val(res.discount);

                        $('.paytable .discount').html(res.discount);
                        $('.paytable .bonuspr').html(res.bonus);
                        $('.paytable .link').html(res.linkwm);
                        $('.checkpaybtn').attr('onclick', "checkpay('" + res.check_url + "')");
                        var newpay = $('.modalpay').attr('newpay');
                        if (newpay == '1') {
                            var inst = $('[data-remodal-id=paymodal]').remodal({
                                hidebg: 1
                            });
                            inst.open();
                        } else {
                            if ($('#ContainerPageLayout').length == 1) {
                                $('#ContainerPageLayout').html($('#payment_form').html());
                            } else {
                                $('#paymodal').modal('toggle');
                            }
                        }
                        if (res.btc == 'yes') {
                            $('.hide_btc_pay').hide();
                            $('.btc_text').show();
                            $('.txt_info').hide();
                        } else {
                            $('.hide_btc_pay').show();
                            $('.btc_text').hide();
                            $('.txt_info').show();
                        }
                    }
                }
                if (typeof(res.error) !== "undefined" && res.error !== null) {
                    $('body').data('orderWait', 0);
                    showerr(res.error);
                }
            } catch (err) {
                $('body').data('orderWait', 0);
                alert('Что-то пошло не так, попробуйте еще раз');
            }
        },
        error: function(jqXHR, exception) {
            $('body').data('orderWait', 0);
            if (jqXHR.status === 0) {
                alert('Not connect. Verify Network.');
            } else if (jqXHR.status == 404) {
                alert('Requested page not found (404).');
            } else if (jqXHR.status == 500) {
                alert('Internal Server Error (500).');
            } else if (exception === 'parsererror') {
                alert('Requested JSON parse failed.');
            } else if (exception === 'timeout') {
                alert('Time out error.');
            } else if (exception === 'abort') {
                alert('Ajax request aborted.');
            } else {
                alert('Uncaught Error. ' + jqXHR.responseText);
            }
        }
    });
    // $.post(path + function_order, {
    //     email: email,
    //     count: count,
    //     type: selectType,
    //     rules: $('input[name=rules_accept]:checked').val(),
    //     en_sub: $('input[name=email_sub]:checked').val(),
    //     cartItems: $('input[name=cartItems]').val(),
    //     forms: collect_value(),
    //     fund: fund,
    //     'copupon': coupon
    // }, function(data) {
    //     var res = JSON.parse(data);
    //     if (res.ok == 'TRUE') {
    //         if (res.redirect == 'yes') {
    //             window.location.replace(res.url);
    //         } else if (res.redirect == 'no') {
    //             $('body').data('orderWait', 0);
    //             $('.paytable .payitem').text(res.name);
    //             $('.paytable .paycount').text(res.count);
    //             $('.paytable .payprice').text(res.price);
    //             $('.paytable .payfund').html(res.fund);
    //             $('.paytable .paybill').html(res.bill);
    //             $('.paytable .discount').html(res.discount);
    //             $('.paytable .bonuspr').html(res.bonus);
    //             $('.paytable .link').html(res.linkwm);
    //             $('.checkpaybtn').attr('onclick', "checkpay('" + res.check_url + "')");
    //             var newpay = $('.modalpay').attr('newpay');
    //             if (newpay == '1') {
    //                 var inst = $('[data-remodal-id=paymodal]').remodal({
    //                     hidebg: 1
    //                 });
    //                 inst.open();
    //             } else {
    //                 $('#paymodal').modal('toggle');
    //             }
    //         }
    //     }
    //     if (typeof(res.error) !== "undefined" && res.error !== null) {
    //         $('body').data('orderWait', 0);
    //         showerr(res.error);
    //     }
    // });
}