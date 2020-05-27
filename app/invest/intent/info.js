/**
 * 招商-意向客户-客户详情
 */

layui.use(['element', 'form', 'rate', 'Dialog', 'Req', 'Common', 'laydate'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var rate = layui.rate;

    function getDelayDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<div style="padding: 10px 0;"><span class="c-orange">* </span>搁置原因说明</div>' +
                                '<div class="layui-input-blockxxx">' +
                                    '<textarea placeholder="请填写500字以内的原因说明" maxlength="500" lay-verify="required" lay-reqText="请填写500字以内的原因说明" class="layui-textarea" name="reason">' +

                                    '</textarea>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                     '</div>';
        return _html;
    }

    function getCommWayOpts() {
        var opts = '<option value="">请选择</option>';

        if(commlist && commlist.length) {
            commlist.forEach(function (v, k) {
                opts += '<option value="'+ v.codeValue +'">'+ v.codeKey +'</option>';
            });
        }

        return opts;
    }

    function getIntentparkIdOpts() {
        var opts = '<option value="">请选择园区</option>';

        if(allparkList && allparkList.length) {
            allparkList.forEach(function (v, k) {
                opts += '<option value="'+ v.parkId +'">'+ v.parkName +'</option>';
            });
        }

        return opts;
    }

    function getFollowLogDialogHtml() {
        var _html =
            '<div class="layui-card-body" style="height: 350px; overflow-y: scroll;">' +
                '<form class="layui-form" action="" lay-filter="formDialog">' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>沟通方式</label>' +
                        '<div class="layui-input-inline text-w-250">' +
                            '<select name="commway" lay-verify="required" lay-filter="commway">' +
                                getCommWayOpts() +
                            '</select>' +
                        '</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>意向程度</label>' +
                        '<div class="layui-input-inline text-w-250">' +
                            '<div id="intentionDialog" class="stars layui-inline mt-5"></div>' +
                        '</div>' +
                        '<input type="hidden" name="intent_degree" value="3">' +
                    '</div>' +
                    '<div class="layui-form-item label-l lookHouseDiv hidden">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>带看房源</label>' +
                        '<div class="layui-input-block" style="margin-left: 100px">' +
                            '<a class="layui-btn layui-btn-primary layui-btn-sm mt-5 selectHouse" href="javascript:;">+选择房源</a> ' +
                        '</div>' +
                        '<div class="layui-input-block" style="margin-left: 100px;">' +
                            '<div class="layui-form-mid houseRoomDiv"></div>' +
                        '</div>' +
                        '<input type="hidden" name="roomIds" value="">' +
                        '<input type="hidden" name="parkId" value="">' +
                    '</div>' +
                    '<div class="layui-form-item label-l intentParkDiv">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>意向园区</label>' +
                        '<div class="layui-input-inline text-w-250">' +
                            '<select name="intentparkId" lay-filter="intentparkId" lay-search>' +
                                getIntentparkIdOpts() +
                            '</select>' +
                        '</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>跟进时间</label>' +
                        '<div class="layui-input-inline text-w-250">' +
                            '<input type="text" name="followUpTime" value="" lay-verify="required" placeholder="请填写跟进时间" lay-reqText="请填写跟进时间" autocomplete="off" class="layui-input timebox">'+
                        '</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>跟进内容</label>' +
                        '<div class="layui-input-inline text-w-250">' +
                            '<textarea placeholder="请填写跟进内容" maxlength="500" class="layui-textarea" lay-verify="required"  name="followUpContent" id="followUpContent"></textarea>' +
                        '</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100">下次跟进时间</label>' +
                        '<div class="layui-input-inline text-w-250">' +
                            '<input type="text" name="nextFollowUpTime" value="" placeholder="请填写下次跟进时间" lay-reqText="请填写下次跟进时间" autocomplete="off" class="layui-input timebox">'+
                        '</div>' +
                    '</div>' +
                    '<!--写一个隐藏的btn -->' +
                    '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                    '</button>' +
                '</form>' +
            '</div>';
        return _html;
    }

    $(function() {

        // 添加跟进记录
        $(document).on('click', '.ajaxFollowLog', function() {
            var url = $(this).attr('data-url'),
                houseUrl = $(this).attr('data-select-house-url');
            Dialog.formDialog({
                title: '添加跟进记录',
                area: ['560px', '480px'],
                content: getFollowLogDialogHtml(),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    var $degree = layero.find('input[name=intent_degree]'),
                        degree = $degree.val();

                    var $roomIds = layero.find('input[name=roomIds]'),
                        $parkId = layero.find('input[name=parkId]');

                    lay('.timebox').each(function(){
                        laydate.render({
                            elem: this,
                            type: 'datetime',
                            trigger: 'click',
                            format: 'yyyy-MM-dd HH:mm',
                        });
                    });

                    rate.render({
                        elem: '#intentionDialog',
                        value: degree,
                        text: true,
                        setText: function(value){ //自定义文本的回调
                            this.span.text(starArr[value] || ( value + "星"));
                        },
                        choose: function(value){
                            $degree.val(value);
                        }
                    });

                    form.render(null, 'formDialog');

                    layero.find('.selectHouse').click(function () {
                        Common.selectHouse(houseUrl, $roomIds, $parkId, function (data) {
                            $('.houseRoomDiv').html('[' + data.parkName + ']' + '<span class="allHouseDiv">' + data.allHouse + '</span>');
                            $('input[name=roomIds]').val(data.roomIds.join(','));
                            $('input[name=parkId]').val(data.parkId);
                        });
                    });

                    // 沟通方式
                    form.on('select(commway)', function (data) {
                        if(data.value == 10) {
                            // 带看
                            $('.lookHouseDiv').removeClass('hidden');
                            $('.intentParkDiv').addClass('hidden');
                        } else {
                            // 电话等
                            $('.lookHouseDiv').addClass('hidden');
                            $('.intentParkDiv').removeClass('hidden');
                            $roomIds.val('');
                            $parkId.val('');
                        }
                    });

                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();

                        // 带看房源
                        if (layero.find('.lookHouseDiv').is(":visible")) {
                            if ($roomIds.length && !$roomIds.val()) {
                                Dialog.errorDialog('未选择带看房源');
                                return false;
                            }
                        }

                        // 意向园区
                        if (layero.find('.intentParkDiv').is(":visible")) {
                            var formSubmitData = form.val('formDialog');
                            if(!formSubmitData.intentparkId) {
                                Dialog.errorDialog('未选择意向园区');
                                return false;
                            }

                        }

                        Req.postReqCommon(url, param);
                        // Req.postReq(url, param, function (res) {
                        //     if(res.status) {
                        //         Dialog.successDialog(res.msg, function () {
                        //
                        //             layer.close(index);
                        //         });
                        //     } else {
                        //         Dialog.errorDialog(res.msg);
                        //     }
                        // });

                        return false;
                    });
                }
            })
        });

        // 搁置
        $(document).on('click', '.ajaxDelayCustomer', function() {
            var $o = $(this),
                url = $o.attr('data-url');

            Dialog.formDialog({
                title: '搁置客户',
                content: getDelayDialogHtml(),
                success: function (layero, index) {
                    var $form = layero.find('form');

                    form.on('submit(bind)', function(data) {
                        var param = $form.serializeArray();
                        Req.postReqCommon(url, param);
                        return false;
                    })
                }
            });

        });

        // 转为我的意向客户
        $(document).on('click', '.ajaxChangeintent', function() {
            var $o = $(this),
                url = $o.attr('data-url');

            Dialog.confirmDialog({
                title: '温馨提示',
                content: '你确认要将此客户转为自己的意向客户吗？',
                yesFn: function (index, layero) {
                    Req.getReqCommon(url);
                }
            })

        });


        form.on('submit', function(data){
            return false;
        });
    });
});