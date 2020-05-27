/**
 * 运营-电表-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex', 'Pager', 'laydate','upload', 'MUpload'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var Regex = layui.Regex;
    var MUpload = layui.MUpload;

    function init() {
        MUpload({
            elem: $('.upload1'),
            exts: 'jpg|jpeg|png',
            maxNum: 10
        });
    }

    function getSplitParam() {
        var param = {
            keyword: $('input[name=keyword]').val(),
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };

        return param;
    }

    function initPager() {
        var pageAjaxUrl = $('#searchUrl').val();
        Pager.initPager({
            type: 2,
            url: pageAjaxUrl,
            callback: getSplitParam,
            target: $('.tableAjax'),
            renderForm: function() {
                setTimeout(function() {
                    matchAddedInfo($('input[type=radio][name=customerId]'));
                },10);
            }
        });
    }

    function getMeterItemHtml() {
        var _html = '<tr class="meterItem">' +
                        '<td><input type="text" name="pmMeterNum[]" value="" class="layui-input" lay-verify="required" maxlength="50" autocomplete="off"></td>' +
                        '<td><input type="text" name="pmChargeAmount[]" value="" class="layui-input" lay-verify="required|onlyDecmal9" autocomplete="off"></td>' +
                        '<td><input type="text" name="pmChargeElec[]" value="" class="layui-input" lay-verify="required|onlyDecmal5" autocomplete="off"></td>' +
                        '<td class="txt-c"><a href="javascript:;" class="c-link delRow">删除</a></td>' +
                    '</tr>';
        return _html;
    }

    function getRelatedMeterItems(list) {
        var _html = '';
        list.forEach(function (item, index) {
            _html += '<tr class="meterItem">' +
                        '<td><input type="text" name="pmMeterNum[]" value="'+ item.pmMeterNum +'" class="layui-input" lay-verify="required" maxlength="50" autocomplete="off"></td>' +
                        '<td><input type="text" name="pmChargeAmount[]" value="" class="layui-input" lay-verify="required|onlyDecmal9" autocomplete="off"></td>' +
                        '<td><input type="text" name="pmChargeElec[]" value="" class="layui-input" lay-verify="required|onlyDecmal5" autocomplete="off"></td>' +
                        '<td class="txt-c"><a href="javascript:;" class="c-link delRow">删除</a></td>' +
                     '</tr>';
        })
        return _html;
    }

    function matchAddedInfo($radios) {
        var customerId = $('input[type=hidden][name=customerId]').val();

        $radios.each(function(i, o) {
            var $curRadio = $(o);
            if(customerId == $curRadio.val()) {
                $curRadio.prop('checked', 'checked');
                return false;
            }
        });
        form.render(null, 'formDialog');
    }

    function renderLinkCustomer(html, meterlistUrl) {
        Dialog.confirmDialog({
            title: '关联客户',
            content: html,
            area: ['650px', '580px'],
            success: function(layero, index) {
                form.render(null, 'formDialog');
                initPager();

                // 匹配已添加的关联客户
                matchAddedInfo(layero.find('input[name=customerId]'));

                layero.find('#search2').click(function () {
                    var param  = getSplitParam();
                    Pager.renderPager(param, function () {
                        matchAddedInfo(layero.find('input[name=customerId]'));
                        form.render(null, 'formDialog');
                    });
                });
                layero.find('input[name=keyword]').keydown(function (e) {
                    if (e.keyCode == 13) {
                        $('#search2').trigger('click');
                    }
                });
            },
            yesFn: function (index, layero) {
                var $activeRadio = layero.find('input[name=customerId]:checked');

                if($activeRadio.length) {
                    $('input[name=customerId]').val($activeRadio.val());
                    $('.contractRooms').text($activeRadio.attr('data-contract-room'));
                    $('.contractElectricity').text($activeRadio.attr('data-electricity'));
                    $('.linkCustomerName').text($activeRadio.attr('data-customername'));
                    $('input[name=customerName]').val($activeRadio.attr('data-customername'));

                    // bug17495
                    Req.postReq(meterlistUrl, {customerId: $activeRadio.val()}, function (res) {
                        if(res.status) {
                            if(res.data && res.data.length) {
                                $('.meterList').html(getRelatedMeterItems(res.data));
                            } else {
                                $('.meterList').html(getMeterItemHtml());
                            }
                        }
                    })
                    // Dialog.errorDialog('未选择关联客户');
                    // return false;
                }
                layer.close(index);
            }
        })
    }

    $(function() {

        init();

        // 关联客户
        $(document).on('click', '.linkCustomer', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                meterlistUrl = $o.attr('meterlist-url');

            Req.getReq(url, function (res) {
                renderLinkCustomer(res, meterlistUrl);
            }, 'html')
        });

        // 添加充值信息
        $(document).on('click', '.addMeterList', function() {
            $('.meterList').append(getMeterItemHtml());
        });

        $(document).on('click', '.delRow', function() {
            var $curRow = $(this).parents('.meterItem');
            if($('.meterItem').length == 1) {
                Dialog.errorDialog("至少保留一行");
                return false;
            }

            $curRow.remove();
        });

        // 充值金额
        $(document).on('blur', 'input[name^=pmChargeAmount]', function () {
            var $o = $(this),
                amount = $(this).val(),
                $curTr = $o.parents('.meterItem'),
                $pmChargeElec = $curTr.find('input[name^=pmChargeElec]');

            if(!Regex.onlyDecmal9.reg.test(amount)) {
                Dialog.errorDialog(Regex.onlyDecmal9.msg);
                return false;
            }

            var contractElectricity = $('.contractElectricity').text();

            if(isNaN(parseFloat(contractElectricity))) {
                Dialog.errorDialog('未关联客户');
                return false;
            }

            if(parseFloat(contractElectricity) == 0) {
                $pmChargeElec.val('');
            } else {
                $pmChargeElec.val((amount / parseFloat(contractElectricity)).toFixed(0));
            }
        });

        // 充值电量
        // $(document).on('blur', 'input[name^=pmChargeElec]', function () {
        //     var $o = $(this),
        //         amount = $(this).val();
        //
        //     if(!Regex.onlyDecmal5.reg.test(amount)) {
        //         Dialog.errorDialog(Regex.onlyDecmal5.msg);
        //         return false;
        //     }
        // });

        // 电表的充值金额之和必须等于总的充值金额
        function checkChargeAmount() {
            var peChargeAmount = $('input[name=peChargeAmount]').val();
            var $pmChargeAmounts = $('input[name^=pmChargeAmount]'),
                sum = 0;
            $pmChargeAmounts.each(function (i, o) {
                var $o = $(o);
                sum = Common.Util.accAdd(sum,parseFloat($o.val()))
            });

            if(Common.Util.accSub(sum, peChargeAmount) == 0) {
                return true;
            } else {
                return false;
            }

        }

        form.on('submit(doSubmit)', function(data) {
            var elem = data.elem,
                url = $(elem).attr('data-url');
            var $form = $('form');

            if($('input[name=customerId]').length && !$('input[name=customerId]').val()) {
                Dialog.errorDialog('未关联客户');
                return false;
            }

            if(!checkChargeAmount()) {
                Dialog.errorDialog("电表充值金额之和需等于总的充值金额");
                return false;
            }

            Common.Util.replaceSerializeName2($form);
            var param = $form.serializeArray();

            Req.postReqCommon(url, param);

            return false;
        });
    });
});