/**
 * 招商-拟签约客户-新建客户
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex', 'OTree', 'Flow'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var Flow = layui.Flow;

    function checkMeterIsShow(parkId, roomIds) {
        var url = $('#vaildateMeter').val();
        Req.postReq(url, {parkId: parkId, roomIds: roomIds.join(',')},function(res) {
           if(res.status) {
               $('.electricDiv').removeClass('hidden');
           } else {
               $('.electricDiv').addClass('hidden');
           }
        });
    }

    // 是否突破底价（租金单价以及物业服务费单价）
    function lessThanBasePrice() {
        var flag = true;
        var $rentPrices = $('.rentPrice'),
            $propertyPrices = $('.propertyPrice');

        $rentPrices.each(function(i, o) {
            var base = parseFloat($(o).attr('data-base')),
                curVal = parseFloat($(o).val());
            if(curVal < base) {
                return false;
                flag = false;
            }
        });

        if(!flag) {
            Dialog.confirmDialog({
                content: '当前已突破招商底价限制需要走招商优惠审批流程，你确认要继续提交审批吗？'
            });
            return false;
        }

        $propertyPrices.each(function(i, o) {
            var base = parseFloat($(o).attr('data-base')),
                curVal = parseFloat($(o).val());
            if(curVal < base) {
                return false;
                flag = false;
            }
        });

        if(!flag) {
            Dialog.confirmDialog({
                content: '当前已突破招商底价限制需要走招商优惠审批流程，你确认要继续提交审批吗？'
            });
            return false;
        }

        return flag;
    }

    $(function() {
        // 初始化房源选择
        $(document).on('click', '.selectHouse', function() {
            var $o = $(this),
                url = $('#selectHouse').val();
            var $selectRoomInput = $('input[name=selectRoomIds]'),
                $selectParkInput = $('input[name=selectParkId]');

            Common.selectHouse(url, $selectRoomInput, $selectParkInput, function (data) {
                $('.houseDetail').html(Common.getHouseDetailHtml(data));
                if(data.squarePrice.length || data.fixedPrice.length) {
                    $('.houseRoomDiv').html('[' + data.parkName + ']' + '<span class="allHouseDiv">' + data.allHouse + '</span>');
                } else {
                    $('.houseRoomDiv').html('');
                }

                $('input[name=selectRoomIds]').val(data.roomIds.join(','));
                $('input[name=selectParkId]').val(data.parkId);

                $('input[name=selectRoomNames]').val(data.allHouse);
                $('input[name=selectTotalArea]').val(data.totalArea);
            });
        });

        // 租金单价
        $(document).on('blur', '.rentPrice', function() {
            var $o = $(this),
                $target = $o.parent().next().find('.convert'),
                $parent = $o.parent(),
                rentUnit = $o.attr('data-rent-unit'),
                convert = '';
            if(!Regex.onlyDecmal9.reg.test($o.val())) {
                Dialog.errorDialog(Regex.onlyDecmal9.msg);
                return false;
            }
            if(rentUnit == '1') {
                // 日租金->月租金（元/㎡/天 -> 元/㎡/月）
                convert = Common.Util.accDiv(Common.Util.accMul($o.val(), 365), 12).toFixed(2) + '元/㎡/月';
            } else if(rentUnit == '2') {
                // 月租金->日租金（元/㎡/月 -> 元/㎡/天）
                convert = Common.Util.accDiv(Common.Util.accMul($o.val(), 12), 365).toFixed(2) + '元/㎡/天';
            } else {
                // 一口价
                convert = Common.Util.accDiv(Common.Util.accMul($o.val(), 12), 365).toFixed(2) + '元/天';
            }
            $target.text(convert);

            if($parent.find('.convertPrice').length) {
                $parent.find('.convertPrice').val(convert);
            } else {
                $parent.append('<input type="hidden" class="convertPrice" name="convertPrice[]" value="'+ convert +'">');
            }
        });

        // 物业服务费单价
        $(document).on('blur', '.propertyPrice', function() {
            var $o = $(this);
            if(!Regex.onlyDecmal9.reg.test($o.val())) {
                Dialog.errorDialog(Regex.onlyDecmal9.msg);
                return false;
            }
        });

        // 验证
        form.verify({
            // 电费单价
            // elecamount: function(value, item) {
            //     if($(item).parent().parent().is(":visible")) {
            //         if(!Regex.onlyDecmal8Ex0.reg.test(value)) {
            //             return Regex.onlyDecmal8Ex0.msg;
            //         }
            //     }
            // },
        });
        form.on('submit(doSubmit)', function(data){
            var $elem = $(data.elem);
            var $form = $('form'),
                // checkUrl = $('#submit').attr('data-check-url'),
                flowUrl = $elem.attr('data-flow-url'),
                checkUrlFirst = $elem.attr('data-check-url-first'),
                submitUrl = $elem.attr('data-url');

            var param = $form.serializeArray();

            if($('input[name=selectRoomIds]').length && !$('input[name=selectRoomIds]').val()) {
                Dialog.errorDialog('未选择意向房源');
                return false;
            }


            // Req.postReq(checkUrlFirst, param, function (res) {
            //     if(res.status) {
            //         // 招商优惠审批提示语优化(v1.6.4)
            //         Req.postReq(checkUrl, param, function (res) {
            //             param.push({name: 'flow', value: res.data.flow});
            //             if (res.status) {
            //                 Req.postReqCommon(url, param);
            //             } else {
            //                 // 弹框提示
            //                 Dialog.confirmDialog({
            //                     title: '友情提醒',
            //                     id: 99999,
            //                     content: res.msg,
            //                     yesFn: function (index, layero) {
            //                         Req.postReqCommon(url, param);
            //                     }
            //                 });
            //             }
            //         })
            //     } else {
            //         Dialog.confirmDialog({
            //             id: 99999,
            //             title: '友情提醒',
            //             content: res.msg,
            //             btn: ['继续', '取消'],
            //             yesFn: function () {
            //                 // 招商优惠审批提示语优化(v1.6.4)
            //                 Req.postReq(checkUrl, param, function (res) {
            //                     param.push({name: 'flow', value: res.data.flow});
            //                     if (res.status) {
            //                         Req.postReqCommon(url, param);
            //                     } else {
            //                         // 弹框提示
            //                         Dialog.confirmDialog({
            //                             title: '友情提醒',
            //                             id: 88888,
            //                             content: res.msg,
            //                             yesFn: function (index, layero) {
            //                                 Req.postReqCommon(url, param);
            //                             }
            //                         });
            //                     }
            //                 })
            //             }
            //         })
            //     }
            // });

            Req.postReq(checkUrlFirst, param, function (res) {
                if(res.status) {
                    Flow.handleFlowByForm(flowUrl, submitUrl, param);
                } else {
                    Dialog.confirmDialog({
                        id: 99999,
                        title: '友情提醒',
                        content: res.msg,
                        btn: ['继续', '取消'],
                        yesFn: function (index, layero) {
                            Flow.handleFlowByForm(flowUrl, submitUrl, param, function () {
                                layer.close(index);
                            });
                        }
                    })
                }
            });
            return false;
        });


        // 客户来源
        form.on('select(customsource)', function (data) {
            if(data.value == 10) {
                $('.agentDiv').removeClass('hidden');
            } else {
                $('.agentDiv').addClass('hidden');
                $('select[name=agenter]').val('');
                form.render();
            }
        });
    });
});