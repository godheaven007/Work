/**
 * 房源-管理会议室
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;

    // 验证会议室名称是否重复
    function checkMeetingRoomName() {
        var $roomNames = $('.meetingname'),
            roomNames = [],
            result = [];

        $roomNames.each(function (i, o) {
            if($(o).val()) {
                roomNames.push($(o).val());
            }
        });
        result = Common.Util.getDuplicateItem(roomNames);

        if(result.length) {
            Dialog.errorDialog('会议室名称：【' + result.join(',') + '】重复');
            return false;
        }
        return true;
    }

    // 园外租用价格不能低于园内租用价格
    function checkPrice() {
        var $trs = $('table tbody').find('tr'),
            flag = true;

        $trs.each(function (i, o) {
           var roomName = $(o).find('.meetingname').val(),
               inPrice = parseFloat($(o).find('.meetingNeiPrice').val()),
               outPrice = parseFloat($(o).find('.meetingWaiPrice').val());
           if(Common.Util.accSub(inPrice, outPrice) < 0) {
               Dialog.errorDialog('【'+ roomName +'】园外租用价格不能低于园内租用价格');
               flag = false;
               return false;
           }
        });

        return flag;
    }

    function insertRow() {
        var _html = '<tr>' +
                        '<td>' +
                            '<input type="text" class="layui-input meetingname" lay-verify="required" maxlength="20" value="" name="meetingname[]">' +
                            '<input type="hidden" name="roomId[]">' +
                        '</td>' +
                        '<td>' +
                            '<div class="layui-inline float-l mr-5">' +
                                '<input type="text" class="layui-input meetingNeiPrice" lay-verify="required|onlyDecmal9" name="meetingNeiPrice[]">' +
                            '</div>' +
                            '<div class="layui-form-mid">元/半小时</div>' +
                        '</td>' +
                        '<td>' +
                            '<div class="layui-inline float-l mr-5">' +
                                '<input type="text" class="layui-input meetingWaiPrice" lay-verify="required|onlyDecmal9" name="meetingWaiPrice[]">' +
                            '</div>' +
                            '<div class="layui-form-mid">元/半小时</div>' +
                        '</td>' +
                        '<td class="txt-c">' +
                            '<a href="javascript:;" class="c-link delMeeting">删除</a>' +
                        '</td>' +
                    '</tr>';
        $('tbody').append(_html);
    }


    $(function() {
        // 新增一行
        $(document).on('click', '#addMoreMeetingRows', function(e){
            insertRow();
        });

        // 删除
        $(document).on('click', '.delMeeting', function(e){
            var $o = $(this),
                id = $o.attr('data-id'),
                url = $o.attr('data-url');
            var $target = $o.parent().parent();

            if(!!id) {
                Dialog.confirmDialog({
                    title: '删除提醒',
                    content: '确定要删除此会议室吗？',
                    yesFn: function(index, layero) {
                        Req.getReqCommon(url);
                    }
                })
            } else {
                $target.remove();
            }
        });

        form.on('submit(meetinghouseadd)', function(data) {

            var $form = $('form'),
                param = $form.serializeArray(),
                url = $('#meetinghouseadd').attr('data-url');

            if(checkMeetingRoomName() && checkPrice()) {
                Req.postReqCommon(url, param);
            }

            return false;
        })
    });
});