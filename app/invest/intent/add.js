/**
 * 招商-意向客户-新建客户
 */

layui.use(['element', 'form', 'rate', 'Dialog', 'Req', 'Common', 'Regex', 'PCA', 'laydate'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element,
        laydate = layui.laydate;
    var Common = layui.Common;
    var Req = layui.Req;
    var PCA = layui.PCA;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var rate = layui.rate;

    PCA();

    function renderDatebox() {
        lay('.datebox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                // showBottom: false
                btns: ['clear', 'now']
            });
        });

        lay('.timebox').each(function(){
            laydate.render({
                elem: this,
                type: 'datetime',
                trigger: 'click',
                format: 'yyyy-MM-dd HH:mm',
            });
        });
    }


    function init() {
        renderDatebox();

        var degree = $('input[name=intent_degree]').val();

        rate.render({
            elem: '#intention',
            value: degree,
            text: true,
            setText: function(value){ //自定义文本的回调
                this.span.text(starArr[value] || ( value + "星"));
            },
            choose: function(value){
                $('input[name=intent_degree]').val(value);
            }
        })
    }

    // 客户需求
    function checkRoomReq() {
        // 房间
        var $roomreqmin = $('input[name=roomreqmin]'),
            $roomreqmax = $('input[name=roomreqmax]');
        var reqMin = $roomreqmin.val(),
            reqMax = $roomreqmax.val();

        // 工位
        var $roomreqstatmin = $('input[name=roomreqstatmin]'),
            $roomreqstatmax = $('input[name=roomreqstatmax]');
        var reqStatMin = $roomreqstatmin.val(),
            reqStatMax = $roomreqstatmax.val();

        if(!reqMin && !reqMax && !reqStatMin && !reqStatMax) {
            Dialog.errorDialog("面积或工位至少需要填写一组");
            return false;
        }

        if((reqMin && !reqMax) || (!reqMin && reqMax)) {
            Dialog.errorDialog("房间面积需要同时填写最小值和最大值");
            return false;
        }

        if((reqStatMin && !reqStatMax) || (!reqStatMin && reqStatMax)) {
            Dialog.errorDialog("工位数需要同时填写最小值和最大值");
            return false;
        }

        if(reqMin && reqMax) {
            if(parseInt(reqMin) > parseInt(reqMax)) {
                Dialog.errorDialog("客户需求的房间面积最大值≥最小值");
                return false;
            }
        }

        if(reqStatMin && reqStatMax) {
            if(parseInt(reqStatMin) > parseInt(reqStatMax)) {
                Dialog.errorDialog("客户需求的工位数最大值≥最小值");
                return false;
            }
        }

        return true;
    }


    // 客户预算
    function checkRoomBudge() {
        var $budgetmin = $('input[name=budgetmin]'),
            $budgetmax = $('input[name=budgetmax]');
        var budgetMin = $budgetmin.val(),
            budgetMax = $budgetmax.val();


        if((budgetMin && !budgetMax) || (!budgetMin && budgetMax)) {
            Dialog.errorDialog("客户预算需要同时填写最小值和最大值");
            return false;
        }

        if(budgetMin && budgetMax) {
            if(parseInt(budgetMin) > parseInt(budgetMax)) {
                Dialog.errorDialog("客户预算的最大值≥最小值");
                return false;
            }
        }

        return true;
    }

    $(function() {

        init();

        // 初始化房源选择
        $(document).on('click', '.selectHouse', function() {
            var $o = $(this),
                url = $('#selectHouse').val();
            var $selectRoomInput = $('input[name=roomIds]'),
                $selectParkInput = $('input[name=parkId]');

            Common.selectHouse(url, $selectRoomInput, $selectParkInput, function(data) {
                $('.houseRoomDiv').html('[' + data.parkName + ']' + '<span class="allHouseDiv">' + data.allHouse + '</span>');
                $('input[name=roomIds]').val(data.roomIds.join(','));
                $('input[name=parkId]').val(data.parkId);
            });
        });

        // 验证
        form.verify({
            // 渠道经纪人
            // agenter: function(value, item) {
            //     if($(item).parent().parent().is(":visible")) {
            //         if(!/[\S]+/.test(value)) {
            //             return '必填项不能为空';
            //         }
            //     }
            // },
            intentparkId: function(value, item) {
                if($(item).parents('.intentParkDiv').is(":visible")) {
                    if(!/[\S]+/.test(value)) {
                        return '必填项不能为空';
                    }
                }
            }

        });
        form.on('submit', function(data){
            var $form = $('form'),
                url = $(this).attr('data-url');

            var data = $form.serializeArray();

            if(checkRoomReq() && checkRoomBudge()) {

                if ($('.lookHouseDiv').is(":visible")) {
                    if ($('input[name=roomIds]').length && !$('input[name=roomIds]').val()) {
                        Dialog.errorDialog('未选择带看房源');
                        return false;
                    }
                }

                Req.postReq(url, data, function (res) {
                    if (res.status) {
                        if (res.data.url) {
                            Dialog.skipDialog();
                            window.location.href = res.data.url;
                        }
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                });
            }
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

        // 沟通方式
        form.on('select(commway-search)', function (data) {
            if(data.value == 10) {
                // 带看
                $('.lookHouseDiv').removeClass('hidden');
                $('.intentParkDiv').addClass('hidden');
            } else {
                // 电话等
                $('.lookHouseDiv').addClass('hidden');
                $('.intentParkDiv').removeClass('hidden');
                $('input[name=roomIds]').val('');
                $('input[name=parkId]').val('');
                $('.houseRoomDiv').html('');
            }
        })
    });
});