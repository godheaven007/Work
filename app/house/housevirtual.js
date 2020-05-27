/**
 * 房源-管理虚拟孵化房源
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var delId = [];

    // 验证房间号是否重复
    function checkRoomNo() {
        var $roomNums = $('.roomnum'),
            roomNums = [],
            result = [];
        $roomNums.each(function (i, o) {
            if($(o).val()) {
                roomNums.push($(o).val());
            }
        });
        result = Common.Util.getDuplicateItem(roomNums);

        if(result.length) {
            Dialog.errorDialog('房间号：【' + result.join(',') + '】重复');
            return false;
        }
        return true;
    }

    function insertRow(size, $target) {
        var _html = '';
        for(var i = 0; i < size; i++) {
            _html += '<tr>' +
                        '<td>' +
                            '<input type="text" class="layui-input roomnum" name="roomnum[]" lay-verify="required" maxlength="20" autocomplete="off">' +
                            '<input type="hidden" name="roomId[]" value=""></td>' +
                        '<td class="txt-c">空置</td>' +
                        '<td class="txt-c">--</td>' +
                        '<td class="txt-c">' +
                            '<a href="javascript:;" class="iconfont ibs-ico-deletenorml font-16 c-blue delVirtualRow" title="删除一行" data-id="">&nbsp;</a>' +
                            '<a href="javascript:;" class="iconfont ibs-ico-charuhang font-16 c-blue insertVirtualRow" title="向下插入一行">&nbsp;</a>' +
                        '</td>' +
                    '</tr>';
        }
        $target.after(_html);
    }

    function getMoreRowHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">新增行数</label>' +
                                '<div class="layui-input-block">' +
                                    '<select name="addNum" lay-filter="addNum" lay-verify="required"  lay-reqText="请选择新增行数">' +
                                        '<option value="">请选择新增行数</option>';
                                        for(var i = 1; i <= 20; i++) {
                                            _html += '<option value="'+ i +'">'+ i +'</option>';
                                        }
                                        _html +=
                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    /**
     * 设置费用标准
     */
    function getFeeStandHtml(hatchStandard, hatchStatus) {
        var _html = '<div class="layui-card-body" style="padding-top: 20px; padding-bottom: 0;">' +
            '<form class="layui-form" action="" lay-filter="formDialog">';

        if(hatchStatus === '0') {
            // 未设置
            _html += '<div class="layui-form-item">' +
                '<label class="layui-form-label" style="width: 100px;">孵化服务费标准</label>' +
                '<div class="layui-input-inline">' +
                '<input type="text" name="servicefee" autocomplete="off" lay-verify="onlyDecmal9" class="layui-input disabled" disabled>'+
                '</div>' +
                '<div class="layui-form-mid" style="margin-right: 28px;">元/年</div>';
        } else {
            // 初次进来或已设置
            _html += '<div class="layui-form-item">' +
                '<label class="layui-form-label" style="width: 100px;">孵化服务费标准</label>' +
                '<div class="layui-input-inline">' +
                '<input type="text" name="servicefee" value="'+ hatchStandard +'" lay-verify="onlyDecmal9" autocomplete="off" class="layui-input">'+
                '</div>'+
                '<div class="layui-form-mid" style="margin-right: 28px;">元/年</div>';
        }
        _html += '</div>'+
            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }


    $(function() {
        // 插入
        $(document).on('click', '.insertVirtualRow', function(e){
            var $o = $(this),
                $curTr = $o.parent().parent();
            insertRow(1, $curTr);
        });

        // 新增多行
        $(document).on('click', '#addMoreVirtualRows', function(e){
            Dialog.formDialog({
                title: '新增多行',
                content: getMoreRowHtml(),
                success: function(layero, index) {
                    form.render();

                    form.on('submit(bind)', function(data){
                        var param = data.field,
                            addNum = parseInt(param.addNum),
                            $trs =  $('.layui-table tbody').find('tr');
                        insertRow(addNum, $trs.eq($trs.length - 1));
                        layer.close(index);
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                }
            })
        });

        // 删除
        $(document).on('click', '.delVirtualRow', function(e){
            var $o = $(this),
                _id = $o.attr('data-id'),
                $curTr = $o.parent().parent();
            var $trs = $('tbody').find('tr');
            if($trs.length == 1 && $('.delVirtualRow').length == 1) {
                Dialog.errorDialog('至少保留一行');
                return false;
            }
            $curTr.remove();
            if(!!_id) {
                delId.push(_id);
            }
            $('input[name=delRoomIds]').val(delId.join(','));
        });

        form.on('submit(virstualhouseadd)', function(data) {

            var $form = $('form'),
                param = $form.serializeArray(),
                url = $('#virstualhouseadd').attr('data-url');

            if(checkRoomNo()) {
                Req.postReqCommon(url, param);
                // Req.postReq(url, param, function(res) {
                //     if(res.status) {
                //         Dialog.successDialog(res.msg);
                //         if(res.data.url) {
                //             window.location.href = res.data.url;
                //         }
                //     } else {
                //         Dialog.errorDialog(res.msg);
                //     }
                // });
            }

            return false;
        })

        // 孵化服务费标准
        $(document).on('click', '.ajaxFeeStand', function() {
            var url = $(this).attr('data-url'),
                hatchStandard = $(this).attr('data-hatch-standard'),            // 孵化服务费标准
                hatchStandard = typeof hatchStandard == 'undefined' ? '' : hatchStandard;
            var hatchStatus = $(this).attr('data-hatch-status');                // 1:设置,0:未设置

            Dialog.formDialog({
                title: '设置费用标准',
                content: getFeeStandHtml(hatchStandard, hatchStatus),
                area: ['auto', 'auto'],
                success: function(layero, index) {
                    form.on('submit(bind)', function(data){
                        var $form = layero.find('form'),
                            param = $form.serializeArray();

                        Req.postReqCommon(url, param);
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                }
            })
        });
    });
});