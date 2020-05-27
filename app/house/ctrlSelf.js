/**
 * 房源-设置销控\自用
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;

    function checkAll() {
        var $houseList = $('.house-list'),
            allRoomNum = $houseList.find('input[name="roomId[]"]').length,
            selectedRoomNum =  $houseList.find('input[name="roomId[]"]:checked').length;

        if(allRoomNum == selectedRoomNum) {
            $houseList.find('input[type=checkbox]').prop('checked', true);
            $('#selectallroom').prop('checked', true);
        } else {
            $('#selectallroom').prop('checked', false);
        }
        if(selectedRoomNum) {
            $('.setAllRoomPrice').removeClass('layui-btn-disabled');
        } else {
            $('.setAllRoomPrice').addClass('layui-btn-disabled');
        }
        form.render();
    }

    $(function() {
        // 全选（所有）
        form.on('checkbox(all)', function(data) {
            if(data.elem.checked) {
                $('.house-list').find('input[type=checkbox]').prop('checked', true);
            } else {
                $('.house-list').find('input[type=checkbox]').prop('checked', false);
            }
            form.render();
            checkAll();
        });

        // 全选（楼层）
        form.on('checkbox(floor)', function(data) {
            var $o = $(data.elem);
            if(data.elem.checked) {
                $o.parents('.floor').find('input[name="roomId[]"]').prop('checked', true);
            } else {
                $o.parents('.floor').find('input[name="roomId[]"]').prop('checked', false);
            }
            form.render();
            checkAll();
        });

        // 单个房间
        form.on('checkbox(room)', function(data) {
            var $o = $(data.elem),
                $curRoom = $o.parent('.room'),
                $curFloor = $o.parents('.floor'),
                allRoomNum = $curFloor.find('input[name="roomId[]"]').length,
                selectedRoomNum =  $curFloor.find('input[name="roomId[]"]:checked').length;

            if(allRoomNum == selectedRoomNum) {
                $curFloor.find('.selectallroom').prop('checked', true);
            } else {
                $curFloor.find('.selectallroom').prop('checked', false);
            }

            // 是否选中
            if(data.elem.checked) {
                $curRoom.find('.icoBtn').addClass('active');
            } else {
                $curRoom.find('.icoBtn').removeClass('active');
            }

            form.render();
            checkAll();
        });

        // 保存
        $(document).on('click', '#houseAdd', function() {
            var $form = $('form'),
                url = $(this).attr('data-url');
            var data = $form.serializeArray();
            var $houseList = $('.house-list'),
                selectedRoomNum =  $houseList.find('input[name="roomId[]"]:checked').length;

            // if(!selectedRoomNum) {
            //     Dialog.errorDialog('未选择房间');
            //     return false;
            // }
            Req.postReqCommon(url, data);
        });

        // 取消
        $(document).on('click', '.ajaxHouseCancel', function() {
           var url = $(this).attr('data-url');
           window.location.href = url;
        });

        form.on('submit', function(data){
            return false;
        });
    });
});