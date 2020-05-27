/**
 * 房源-管理工位
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;

    function addArea() {
        var _html = '<div class="ibs-collapse">\n' +
            '                            <h2 class="ibs-colla-title2">\n' +
            '                                <div class="layui-form-item">\n' +
            '                                    <div class="layui-inline text-w-250">\n' +
            '                                        <input type="text" class="layui-input areaName" name="areaName[]" placeholder="输入区域名称" maxlength="20" autocomplete="off" lay-verify="required">\n' +
            '                                    </div>\n' +
            '                                    <div class="layui-inline">\n' +
            '                                        <label class="layui-form-label text-w-100 c-gray-light">单个工位折合为</label>\n' +
            '                                        <div class="layui-input-inline text-w-100">\n' +
            '                                            <input type="text" class="layui-input stationArea" name="stationArea[]" autocomplete="off" lay-verify="required|onlyDecmal6Ex0">\n' +
            '                                        </div>\n' +
            '                                        <div class="layui-form-mid layui-word-aux">㎡</div>\n' +
            '                                    </div>\n' +
            '                                    <div class="group-right">\n' +
            '                                        <a href="javascript:;" class="layui-btn layui-btn-primary layui-btn-sm addMoreStation">批量添加工位</a>\n' +
            '                                        <a href="javascript:;" class="layui-btn layui-btn-primary layui-btn-sm delArea">删除区域</a>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                            </h2>\n' +
            '                            <div class="ibs-colla-content station-manage">\n' +
            '                                <dl class="clearfix">\n' +
                                                    addMoreStation(5) +
                                                '<dd class="add">\n' +
            '                                        <i class="iconfont ibs-ico-add addSignleStation"></i>\n' +
            '                                    </dd>\n' +
            '                                </dl>\n' +
            '                            </div>\n' +
            '                        </div>';
        return _html;
    }

    // 添加多个工位
    function addMoreStation(size) {
        var _html = '<dd>' +
                        '<input type="text" class="layui-input station" name="stationName[]" lay-verify="required" placeholder="输入工位号" maxlength="8" value="" autocomplete="off">' +
                        '<div class="btn-edit">' +
                            '<a href="javascript:;" class="PreStationRow">前移 </a>' +
                            '<span>|</span>' +
                            '<a href="javascript:;" class="BackStationRow"> 后移 </a>' +
                            '<span>|</span>' +
                            '<a href="javascript:;" class="addStationRow"> 插入 </a>' +
                            '<span>|</span>' +
                            '<a href="javascript:;" class="delStationRow"> 删除 </a>' +
                        '</div>' +
                    '</dd>';
        var _res = '';
        for(var i = 0; i < size; i++) {
            _res += _html;
        }
        return _res;
    }

    // 批量添加多个工位
    function renderBatchStation(list, $o) {
        var _html = '',
            $curStationManage = $o.parents('.station-manage');
        list.forEach(function(item, index) {
            _html += '<dd>' +
                        '<input type="text" class="layui-input station" value="'+ item +'" name="stationName[]" lay-verify="required" placeholder="输入工位号" maxlength="8" value="" autocomplete="off">' +
                        '<div class="btn-edit">' +
                            '<a href="javascript:;" class="PreStationRow">前移 </a>' +
                            '<span>|</span>' +
                            '<a href="javascript:;" class="BackStationRow"> 后移 </a>' +
                            '<span>|</span>' +
                            '<a href="javascript:;" class="addStationRow"> 插入 </a>' +
                            '<span>|</span>' +
                            '<a href="javascript:;" class="delStationRow"> 删除 </a>' +
                        '</div>' +
                    '</dd>';
        });
        $o.before(_html);
        updateTool($curStationManage);
    }

    function getStationOpts() {
        var _html = '<select name="stationNum" lay-filter="stationNum">';
        for(var i = 1; i <= 50; i++) {
            _html += '<option value="'+ i +'">'+ i +'</option>';
        }
        _html += '</select>';
        return _html;
    }

    function getStationDialogHtml() {
        var _html = '<div class="layui-card-body" style="max-height: 200px;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">前缀</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="prefix" maxlength="6" placeholder="输入工位前缀，如LA，可为空" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">起始序号</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="start" lay-verify="required|positiveInteger" maxlength="8" placeholder="输入工位起始序号，如001" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">数量</label>' +
                                '<div class="layui-input-block">' +
                                    getStationOpts() +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">预览</label>' +
                                '<div class="layui-input-inline" style="width: 350px;">' +
                                    '<div class="layui-form-mid preview" style="color:#FF6600;"></div>' +
                                    '<input name="name" type="hidden">' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function updateTool($curStation) {
        var $ddAdd = $curStation.find('dd.add'),
            $dds = $curStation.find('dd').not($ddAdd),
            len = $dds.length;

        if(len == 1) {
            $dds.find('.btn-edit a').removeClass('disabled');
            $dds.find('.PreStationRow').addClass('disabled');
            $dds.find('.BackStationRow').addClass('disabled');
        } else {
            $dds.each(function(i, o) {
                $(o).find('.btn-edit a').removeClass('disabled');
                if(i == 0) {
                    $(o).find('.PreStationRow').addClass('disabled');
                }
                if(i == len - 1) {
                    $(o).find('.BackStationRow').addClass('disabled');
                }
            });
        }
    }

    // function checkArea($target, _name) {
    //     var flag = true,
    //         $curStationManage = $target.parents('.station-manage'),
    //         $areaNameInputs = $curStationManage.find('input[name="areaName[]"]').not($target);
    //     $areaNameInputs.each(function(i, o) {
    //         if(_name == $(o).val()) {
    //             Dialog.errorDialog('区域名称【'+ _name +'】已存在，请重新输入');
    //             $target.val('');
    //             $target.focus();
    //             flag = false;
    //             return false;
    //         }
    //     });
    //     return flag;
    // }

    // function checkAreaAjax(_name) {
    //     var url = $('input[name=checkArea]').attr('id');
    //     Req.postReq(url, {name: _name}, function(res) {
    //         if(!res.status) {
    //             Dialog.errorDialog(res.msg);
    //         }
    //     })
    // }

    // function checkStationName($target, _name) {
    //     var flag = true,
    //         $curStationManage = $target.parents('.station-manage'),
    //         $stationNameInputs = $curStationManage.find('input[name="stationName[]"]').not($target);
    //     $stationNameInputs.each(function(i, o) {
    //         if(_name == $(o).val()) {
    //             Dialog.errorDialog('工位【'+ _name +'】在当前楼宇中已存在，请重新输入');
    //             $target.val('');
    //             $target.focus();
    //             flag = false;
    //             return false;
    //         }
    //     });
    //     return flag;
    // }

    // function checkStationNameAjax(_name) {
    //     var url = $('input[name=checkStationName]').attr('id');
    //     Req.postReq(url, {name: _name}, function(res) {
    //         if(!res.status) {
    //             Dialog.errorDialog(res.msg);
    //         }
    //     })
    // }

    function checkAreaName() {
        var $areas = $('.areaName'),
            areas = [],
            result = [];

        $areas.each(function (i, o) {
            if($(o).val()) {
                areas.push($(o).val());
            }
        });
        result = Common.Util.getDuplicateItem(areas);

        if(result.length) {
            Dialog.errorDialog('区域名称【' + result.join(',') + '】，请重新输入');
            return false;
        }
        return true;
    }

    function checkStationName() {
        var $stations = $('.station'),
            stations = [],
            result = [];

        $stations.each(function (i, o) {
            if($(o).val()) {
                stations.push($(o).val());
            }
        });
        result = Common.Util.getDuplicateItem(stations);

        if(result.length) {
            Dialog.errorDialog('工位【' + result.join(',') + '】在当前楼宇中已存在，请重新输入');
            return false;
        }
        return true;
    }


    function getSubmitData() {
        var $ibsCollapse = $('.ibs-collapse'),
            result = [];
        $ibsCollapse.each(function(i, o) {
            var obj = {};
            var $areaName = $(o).find('.areaName'),
                $areaId = $(o).find('.areaId'),
                $stationArea = $(o).find('.stationArea'),
                $stations = $(o).find('.station');

            obj.areaName = $areaName.val();
            obj.areaId = $areaId.val();
            obj.stationArea = $stationArea.val();
            obj.station = [];
            obj.stationIds = [];
            $stations.each(function(j, t) {
                obj.station.push($(t).val());
                if($(t).next()) {
                    obj.stationIds.push($(t).next().val());
                } else {
                    obj.stationIds.push('');
                }
            });
            result.push(obj);
        });
        return result;
    }

    $(function() {
        /**
         * 前移\后移\插入\删除
         */
        $(document).on('click', '.PreStationRow', function(e){
            if($(this).hasClass('disabled')) return false;
            var $o = $(this),
                $curStationManage = $o.parents('.station-manage'),
                $curDd = $o.parent().parent(),
                $prevTd = $curDd.prev();
            $curDd.insertBefore($prevTd);
            updateTool($curStationManage);
        });
        $(document).on('click', '.BackStationRow', function(e){
            if($(this).hasClass('disabled')) return false;
            var $o = $(this),
                $curStationManage = $o.parents('.station-manage'),
                $curDd = $o.parent().parent(),
                $nextTd = $curDd.next();
            $curDd.insertAfter($nextTd);
            updateTool($curStationManage);
        });
        $(document).on('click', '.addStationRow', function(e){
            var $o = $(this),
                $curStationManage = $o.parents('.station-manage'),
                $curDd = $o.parent().parent();
            $curDd.after(addMoreStation(1));
            updateTool($curStationManage);
        });
        $(document).on('click', '.delStationRow', function(e){
            var $o = $(this),
                _id = $o.attr('data-id'),
                $curIbsCollapse = $o.parents('.ibs-collapse'),
                $curStationManage = $o.parents('.station-manage'),
                $curDd = $o.parent().parent();

            var url = $('input[name=delRoom]').attr('id');
            url += '?id=' +_id;

            if(!!_id) {
                Req.getReq(url, function (res) {
                    if(res.status) {
                        $curDd.remove();

                        var $ddAdd = $curStationManage.find('dd.add'),
                            $dds = $curStationManage.find('dd').not($ddAdd);

                        if(!$dds.length) {
                            $curIbsCollapse.remove();
                        } else {
                            updateTool($curStationManage);
                        }
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                });
            } else {
                $curDd.remove();

                var $ddAdd = $curStationManage.find('dd.add'),
                    $dds = $curStationManage.find('dd').not($ddAdd);

                if(!$dds.length) {
                    $curIbsCollapse.remove();
                } else {
                    updateTool($curStationManage);
                }
            }
        });

        // 区域名称
        // $(document).on('blur', 'input[name="areaName[]"]', function() {
        //     var $o = $(this),
        //         _name = $o.val();
        //     if(_name && checkArea($o, _name)) {
        //         checkAreaAjax(_name);
        //     }
        // });
        // 工位
        // $(document).on('blur', 'input[name="stationName[]"]', function() {
        //     var $o = $(this),
        //         _name = $o.val();
        //     if(_name && checkStationName($o, _name)) {
        //         checkStationNameAjax(_name);
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

        // 添加区域
        $(document).on('click', '.addArea', function(e){
            $('.areaDiv').append(addArea());
            var $ibsCollapse = $('.areaDiv').find('.ibs-collapse'),
                $curIbsCollapse = $ibsCollapse.eq($ibsCollapse.length - 1),
                $curStationManage = $curIbsCollapse.find('.station-manage');
            updateTool($curStationManage);
        });
        // 删除区域
        $(document).on('click', '.delArea', function(e){
            var $o = $(this),
                _id = $o.attr('data-id'),
                url = $('input[name=delStationArea]').attr('id');

            url += '?id=' +_id;

            if(!!_id) {
                Req.getReq(url, function (res) {
                    if(res.status) {
                        $o.parents('.ibs-collapse').remove();
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                })
            } else {
                // 新添加区域
                $o.parents('.ibs-collapse').remove();
            }
        });
        // 添加单个工位
        $(document).on('click', '.add', function(e){
            var $o = $(this),
                $curStationManage = $o.parents('.station-manage');

            $o.before(addMoreStation(1));
            updateTool($curStationManage);
        });
        // 批量添加工位
        $(document).on('click', '.addMoreStation', function(e){
            var $o = $(this),
                $curIbsCollapse = $o.parents('.ibs-collapse'),
                $curAdd = $curIbsCollapse.find('dd.add');

            Dialog.formDialog({
                title: '批量添加工位',
                content: getStationDialogHtml(),
                btn: ['生成', '取消'],
                area: ['520px', 'auto'],
                success: function(layero, index) {
                    form.val('formDialog', {
                        stationNum: 5
                    });
                    form.render();

                    function renderPreview() {
                        var $prefix = layero.find('input[name=prefix]'),
                            $start = layero.find('input[name=start]'),
                            $name = layero.find('input[name=name]'),
                            $preview = layero.find('.preview');

                        if($start.val() && !Regex.positiveInteger.reg.test($start.val())) {
                            Dialog.errorDialog('起始序号' + Regex.positiveInteger.msg);
                        } else {
                            var num = layero.find('select[name=stationNum] option:selected').val();
                            var res = [];
                            if ($start.val()) {
                                var start = parseInt($start.val()),
                                    num = parseInt(num),
                                    max = start + num,
                                    len = $start.val().length > (max + '').length ? $start.val().length : (max + '').length;

                                for (var i = 0; i < num; i++) {
                                    var index = start + i;
                                    res.push($prefix.val() + Common.leftPad0(index + '', len));
                                }
                                $preview.html(res.join(','));
                            }
                            $preview.html(res.join(','));
                            $name.val(res.join(','));
                        }
                    }

                    form.on('select(stationNum)', function(data) {
                        renderPreview();
                    });
                    layero.find('input[name=prefix]').blur(function() {
                        renderPreview();
                    });
                    layero.find('input[name=start]').blur(function() {
                        renderPreview();
                    });

                    form.on('submit(bind)', function(data){
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        var $form = layero.find('form'),
                            data = $form.serializeArray();
                        var $name = layero.find('input[name=name]');
                        var url = $('input[name=checkBatchStationName]').attr('id');

                        Req.postReq(url, data, function(res) {
                            if(res.status) {
                                // Dialog.successDialog(res.msg);
                                layer.close(index);
                                renderBatchStation($name.val().split(','),$curAdd);
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    });
                }
            });
        });

        // 保存
        // $(document).on('click', '#doSubmit', function() {
        //
        // });

        // 验证
        form.verify({
            // 面积
            square: function(value, item) {
                if(!Regex.square.reg.test(value)) {
                    return Regex.square.msg;
                }
            }
        });

        form.on('submit(doSubmit)', function (data) {
            var $elem = $(data.elem);
            var url = $elem.attr('data-url');

            if(checkAreaName()) {
                if(checkStationName()) {
                    var param = {
                        data: JSON.stringify(getSubmitData()),
                        floorId: $('input[name=floorId]').val(),
                        buildId: $('input[name=buildId]').val()
                    };
                    Req.postReqCommon(url, param);
                }
            }
            return false;
        });
    });
});