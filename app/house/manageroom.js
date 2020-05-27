/**
 * 房源-管理房间
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;

    function updateFloorTool() {
        var $rowItems = $('.rowItem'),
            len = $rowItems.length;

        if(len == 1) {
            $rowItems.find('.rowTool').removeClass('disabled');
            $rowItems.find('.upRow').addClass('disabled');
            $rowItems.find('.downRow').addClass('disabled');
        } else {
            $rowItems.each(function(i, o) {
                $(o).find('.rowTool').removeClass('disabled');
                if(i == 0) {
                    $(o).find('.upRow').addClass('disabled');
                }
                if(i == len - 1) {
                    $(o).find('.downRow').addClass('disabled');
                }
            });
        }
    }

    // 前台验证房间号
    // function checkRoomNo($target, roomNo) {
    //     var flag = true,
    //         $roomNumInputs = $('.roomTbody').find('input[name="roomNum[]"]').not($target);
    //     $roomNumInputs.each(function(i, o) {
    //         if(roomNo == $(o).val()) {
    //             Dialog.errorDialog('房间号【'+ roomNo +'】在当前楼宇中已存在，请重新输入');
    //             $target.val('');
    //             $target.focus();
    //             flag = false;
    //             return false;
    //         }
    //     });
    //     return flag;
    // }

    // 后台验证房间号
    // function ajaxCheckRoomNo(roomNo) {
    //     var url = $('input[name=checkRoomName]').attr('id');
    //     // url = url + '&roomNum=' + roomNo;
    //
    //     Req.postReq(url, {name: roomNo}, function(res) {
    //         if(!res.status) {
    //             Dialog.errorDialog(res.msg);
    //         }
    //     })
    // }

    function checkRoomNo() {
        var $roomNums = $('.roomnum'),
            roomNums = [],
            result = [];
        $roomNums.each(function (i, o) {
            roomNums.push($(o).val());
        });
        result = Common.Util.getDuplicateItem(roomNums);

        if(result.length) {
            Dialog.errorDialog('房间号：【' + result.join(',') + '】重复');
            return false;
        }
        return true;
    }


    function checkRoomNo() {
        var $rowItems = $('.rowItem'),
            roomNums = [],
            result = [];
        $rowItems.each(function (i, o) {
            var $td = $(o).find('td').eq(0),
                $roomNumInput = $td.find('.layui-input');
            roomNums.push($roomNumInput.val());
        });

        result = Common.Util.getDuplicateItem(roomNums);
        if(result.length) {
            Dialog.errorDialog('房间号【' + result.join(',') + '】在当前楼宇中已存在，请重新输入');
            return false;
        }
        return true;
    }

    // 使用面积<租赁面积
    function checkSquare() {
        var flag = true,
            $rowItems = $('.rowItem');
        $rowItems.each(function(i, o) {
            var $curTds = $(o).find('td'),
                roomNo = $curTds.eq(0).find('input').val(),
                rentArea = $curTds.eq(1).find('input').val(),
                useArea = $curTds.eq(2).find('input').val();
            if(parseFloat(useArea) > parseFloat(rentArea)) {
                Dialog.errorDialog('房间号【' + roomNo + '】使用面积应小于租赁面积');
                flag = false;
                return false;
            }
        });
        return flag;
    }

    // 添加多行
    function addMoreRow(size) {
        var _html = '<tr class="rowItem">' +
                        '<td>' +
                            '<input type="text" name="roomNum[]" lay-verify="required" placeholder="输入房间号" autocomplete="off" class="layui-input" maxlength="8">' +
                            '<input type="hidden" name="roomId[]">' +
                        '</td>' +
                        '<td><input type="text" name="roomRentalArea[]" placeholder="输入租赁面积" autocomplete="off" class="layui-input" lay-verify="required|square"></td>' +
                        '<td><input type="text" name="roomUserArea[]" placeholder="输入使用面积" autocomplete="off" class="layui-input" lay-verify="required|square"></td>' +
                        '<td>' +
                            '<input type="checkbox" name="special[]" lay-skin="primary" title="夹层" value="夹层">' +
                            '<input type="checkbox" name="special[]" lay-skin="primary" title="挑高" value="挑高">' +
                            '<input type="checkbox" name="special[]" lay-skin="primary" title="暗房" value="暗房">' +
                            '<input type="hidden" name="special_house_string[]" class="special_house" value="">' +
                        '</td>' +
                        '<td class="txt-c">' +
                            '<a href="javascript:;" class="c-link rowTool upRow">上移</a>｜' +
                            '<a href="javascript:;" class="c-link rowTool downRow">下移</a>｜' +
                            '<a href="javascript:;" class="c-link rowTool addDownRow">插入</a>｜' +
                            '<a href="javascript:;" class="c-link rowTool delRow">删除</a>' +
                        '</td>' +
                    '</tr>';
        var _res = '';
        for(var i = 0; i < size; i++) {
            _res += _html;
        }
        return _res;
    }

    $(function() {
        /**
         * 上移\下移\插入\删除
         */
        $(document).on('click', '.upRow', function(e){
            if($(this).hasClass('disabled')) return false;
            var $o = $(this),
                $curTr = $o.parent().parent(),
                $prevTr = $curTr.prev();
            $curTr.insertBefore($prevTr);
            updateFloorTool();
        });
        $(document).on('click', '.downRow', function(e){
            if($(this).hasClass('disabled')) return false;
            var $o = $(this),
                $curTr = $o.parent().parent(),
                $nextTr = $curTr.next();
            $curTr.insertAfter($nextTr);
            updateFloorTool();
        });
        $(document).on('click', '.addDownRow', function(e){
            var $o = $(this),
                $curTr = $o.parent().parent();

            $curTr.after(addMoreRow(1));
            form.render();
            updateFloorTool();
        });
        $(document).on('click', '.delRow', function(e){
            var $o = $(this),
                $curTr = $o.parent().parent();
            var url = $('input[name=delRoom]').attr('id'),
                _id = $o.attr('data-id'),
                url = url + '?id=' + _id;

            if(_id) {
                Req.getReq(url, function(res) {
                    if(res.status) {
                        $curTr.remove();
                        updateFloorTool();
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                });
            } else {
                $curTr.remove();
                updateFloorTool();
            }
        });

        $(document).on('click', '.addMoreRow', function() {
            var len = $(this).attr('data-len');
            $('.roomTbody').append(addMoreRow(len));
            form.render();
            updateFloorTool();
        });

        // $(document).on('blur', 'input[name="roomNum[]"]', function() {
        //     var $o = $(this),
        //         roomNo = $o.val();
        //     if(roomNo && checkRoomNo($o, roomNo)) {
        //         ajaxCheckRoomNo(roomNo);
        //     }
        // });

        $(document).on('click', '.normalDialog', function() {
            var message = $(this).attr('data-message');
            Dialog.tipDialog({
                content: message,
                yesFn: function(index, layero) {
                    layer.close(index);
                }
            })
        });

        // 取消
        $(document).on('click', '.ajaxHouseCancel', function() {
            var url = $(this).attr('data-url');
            // TODO...返回、取消时，需要验证页面是否改变过数据，如果没有可以直接返回取消，反之需要进行提醒
            window.location.href = url;
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
                url = $('#houseAdd').attr('data-url');

            Common.Util.replaceSerializeName2($form);
            var param = $form.serializeArray();

            if(checkRoomNo()) {
                if(checkSquare()) {
                    Req.postReq(url, param, function(res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                if(res.data.url) {
                                    window.location.href = res.data.url;
                                }
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                }
            }

            return false;
        });
    });
});