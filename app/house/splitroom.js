/**
 * 房源-拆分房间
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;

    // 前台验证房间号
    function checkRoomNo($target, roomNo) {
        var $trs = $('form tbody').find('tr'),
            roomNums = [],
            result = [];
        $trs.each(function(i, o) {
            var $td = $(o).find('td').eq(0),
                $roomNumInput = $td.find('.layui-input');
            roomNums.push($roomNumInput.val());
        });

        result = Common.Util.getDuplicateItem(roomNums);
        if(result.length) {
            Dialog.errorDialog('房间号【' + result.join(',') + '】重复，请重新输入');
            return false;
        }
        return true;
    }

    // 使用面积<租赁面积
    function checkSquare() {
        var flag = true,
            $rowItems = $('form tbody').find('tr');
        $rowItems.each(function(i, o) {
            var $curTds = $(o).find('td'),
                roomNo = $curTds.eq(0).find('input').val(),
                rentArea = $curTds.eq(2).find('input').val(),
                useArea = $curTds.eq(3).find('input').val();
            if(parseFloat(useArea) >= parseFloat(rentArea)) {
                Dialog.errorDialog('房间号【' + roomNo + '】使用面积应小于租赁面积');
                flag = false;
                return false;
            }
        });
        return flag;
    }

    $(function() {
        // 插入
        $(document).on('click', '.insertSplitRow', function(e){
            var $o = $(this),
                $curTr = $o.parent().parent(),
                $clone = $curTr.clone();
            $clone.find('input').val('');
            $clone.find('input[name="special[]"]').prop('checked', false);
            $curTr.after($clone);
            form.render();
        });

        // 删除
        $(document).on('click', '.delRow', function(e){
            var $o = $(this),
                $curTr = $o.parent().parent();
            if($('.delRow').length == 2) {
                Dialog.errorDialog('至少保留两行');
                return false;
            }
            $curTr.remove();
        });

        // 验证
        form.verify({
            // 面积
            square: function(value, item) {
                if(!Regex.square.reg.test(value)) {
                    return Regex.square.msg;
                }
            }
        });

        form.on('checkbox', function(data){
            var $parent = $(data.elem).parent(),
                $specialHouseInput = $parent.find('.special_house');
                $checkbox = $parent.find('input:checked').not($specialHouseInput);
            var res = [];
            $checkbox.each(function(i, o) {
                res.push($(o).val());
            });
            $specialHouseInput.val(res.join('、'));
        });

        form.on('submit', function(data){
            var $form = $('form'),
                param = $form.serializeArray(),
                url = $('#houseAdd').attr('data-url');

            if(checkRoomNo()) {
                if(checkSquare()) {
                    Req.postReqCommon(url, param);
                }
            }

            return false;
        });
    });
});