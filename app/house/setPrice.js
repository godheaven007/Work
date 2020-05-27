/**
 * 房源-设置底价
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex', 'OTree', 'Print', 'Approval', 'Flow'], function() {
    var $ = layui.jquery,
        form = layui.form,
        $form = $('form'),
        upload = layui.upload,
        device = layui.device(),
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var Approval = layui.Approval;
    var Flow = layui.Flow;

    function isCheckAll() {
        var $roomIds = $('input[name^=roomId]'),
            $activeRoomIds = $('input[name^=roomId]:checked');

        if($roomIds.length == $activeRoomIds.length) {
            $('.allparkroom').prop('checked', true);
        } else {
            $('.allparkroom').prop('checked', false);
        }

        if($activeRoomIds.length) {
            $('.setAllRoomBasePrice').removeClass('layui-btn-disabled');
            $('.setAllRoomTablePrice').removeClass('layui-btn-disabled');
            $('.setAllRoomPropertyPrice').removeClass('layui-btn-disabled');
        } else {
            $('.setAllRoomBasePrice').addClass('layui-btn-disabled');
            $('.setAllRoomTablePrice').addClass('layui-btn-disabled');
            $('.setAllRoomPropertyPrice').addClass('layui-btn-disabled');
        }

    }

    // 当前楼宇是否全部选中
    function curBuildIsAll($build) {
        var $roomIds = $build.find('input[name^=roomId]'),
            $activeRoomIds = $build.find('input[name^=roomId]:checked');

        if($roomIds.length == $activeRoomIds.length) {
            $build.find('.allbuild').prop('checked', true);
        } else {
            $build.find('.allbuild').prop('checked', false);
        }
    }

    /**
     * 批量设置底价
     * @param room
     * @param station
     * @param $o
     * @returns {string}
     */

    function getUnitOpts(opts, roomList) {
        var _html = '';
        var batchRoomUnit = roomList[0].roomUnit;

        if(batchRoomUnit == opts.roomUnit) {
            _html += '<option value="'+ opts.roomUnit +'" selected>'+ opts.roomUnitName +'</option>' +
                '<option value="'+ opts.stationUnit +'">'+ opts.stationUnitName +'</option>';
        }

        if(batchRoomUnit == opts.stationUnit) {
            _html += '<option value="'+ opts.roomUnit +'">'+ opts.roomUnitName +'</option>' +
                '<option value="'+ opts.stationUnit +'" selected>'+ opts.stationUnitName +'</option>';
        }


        return _html;
    }

    /**
     * 批量设置租金底价
     */
    function getBatchPriceHtml(param) {
        var $o = param.node;
        var roomUnitName = $o.attr('data-room-unit-name'),
            roomUnit = $o.attr('data-room-unit'),
            stationUnitName = $o.attr('data-station-unit-name'),
            stationUnit = $o.attr('data-station-unit');

        var opts = {
            roomUnit: roomUnit,
            roomUnitName: roomUnitName,
            stationUnit: stationUnit,
            stationUnitName: stationUnitName
        };

        var _html = '<div class="layui-card-body" style="padding: 20px 25px;">' +
            '<form class="layui-form" action="" lay-filter="formDialog">';
        if(param.room.length) {
            _html += '<div class="">已选中'+ param.room.length +'个房间，批量设置'+ param.title +'为：</div>' +
                '<div class="layui-form-item">' +
                    '<div class="layui-input-inline text-w-250">' +
                        '<input type="text" name="roomPrice" lay-verify="required|onlyDecmal9" lay-reqText="请设置'+ param.title +'" required placeholder="请设置'+ param.title +'" autocomplete="off" class="layui-input" >'+
                    '</div>' +
                    '<div class="layui-input-inline text-w-100">' +
                        '<select name="roomUnit">' +
                            getUnitOpts(opts, param.room) +
                        '</select>' +
                    '</div>'+
                '</div>';
        }

        if(param.station.length) {
            _html += '<div class="">已选中'+ param.station.length +'个工位，批量设置'+ param.title +'为：</div>' +
                '<div class="layui-form-item">' +
                    '<div class="layui-input-inline text-w-250">' +
                        '<input type="text" name="stationPrice" lay-verify="required|onlyDecmal9" lay-reqText="请设置'+ param.title +'" required placeholder="请设置'+ param.title +'" autocomplete="off" class="layui-input" >'+
                    '</div>' +
                    '<div class="layui-form-mid"><span>'+ stationUnitName +'</span></div>'+
                '</div>';
        }
        _html +=            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    function setBatchPrice(param) {
        Dialog.formDialog({
            title: param.dialogTitle,
            content: getBatchPriceHtml(param),
            area: ['480px', 'auto'],
            success: function(layero, index) {
                form.render();
                form.on('submit(bind)', function(data){
                    var formData = form.val('formDialog');
                    var roomPrice = formData.roomPrice,
                        roomUnit = formData.roomUnit;
                    var roomUnitText = layero.find('select[name=roomUnit] option:selected').text();
                    var stationPrice = formData.stationPrice;

                    var roomList = param.room,
                        stationList = param.station;

                    roomList.forEach(function (item, ind) {
                        var roomId = item.roomId;
                        var oldRentUnitText = item.roomUnitText;
                        // 租金底价
                        $('.roombaseprice_' + roomId).val(roomPrice);

                        $('.baseparkunit_' + roomId + ' option:selected').removeAttr("selected");
                        $('.baseparkunit_' + roomId + ' option[value='+ roomUnit +']').prop("selected", "selected");

                        $('.table_' + roomId).text(roomUnitText);
                        if(roomUnitText == oldRentUnitText) {

                        } else {
                            // $('.roombaseprice_' + roomId).val('');
                            $('.roomtableprice_' + roomId).val('');
                        }
                    });

                    stationList.forEach(function (item, ind) {
                        var roomId = item.roomId;
                        $('.roombaseprice_' + roomId).val(stationPrice);
                    });
                    form.render();
                    layer.close(index);

                    // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                    return false;
                });
            }
        })
    }


    /**
     * 批量设置租金表价
     */
    function getBatchTablePriceHtml(param) {
        var $o = param.node;
        var roomUnitName = $o.attr('data-room-unit-name'),
            roomUnit = $o.attr('data-room-unit'),
            stationUnitName = $o.attr('data-station-unit-name'),
            stationUnit = $o.attr('data-station-unit');

        var _html = '<div class="layui-card-body" style="padding: 20px 25px;">' +
            '<form class="layui-form" action="" lay-filter="formDialog">';
        if(param.room.length) {
            _html += '<div class="">已选中'+ param.room.length +'个房间，批量设置'+ param.title +'为：</div>' +
                '<div class="layui-form-item">' +
                '<div class="layui-input-inline text-w-350">' +
                '<input type="text" name="roomPrice" lay-verify="required|onlyDecmal9" lay-reqText="请设置'+ param.title +'" required placeholder="请设置'+ param.title +'" autocomplete="off" class="layui-input" >'+
                '</div>' +
                '<div class="layui-form-mid"><span>'+ param.room[0].roomUnitText +'</span></div>'+
                '</div>';
        }

        if(param.station.length) {
            _html += '<div class="">已选中'+ param.station.length +'个工位，批量设置'+ param.title +'为：</div>' +
                '<div class="layui-form-item">' +
                '<div class="layui-input-inline text-w-250">' +
                '<input type="text" name="stationPrice" lay-verify="required|onlyDecmal9" lay-reqText="请设置'+ param.title +'" required placeholder="请设置'+ param.title +'" autocomplete="off" class="layui-input" >'+
                '</div>' +
                '<div class="layui-form-mid"><span>'+ stationUnitName +'</span></div>'+
                '</div>';
        }
        _html +=            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    function setBatchTablePrice(param) {
        Dialog.formDialog({
            title: param.dialogTitle,
            content: getBatchTablePriceHtml(param),
            area: ['480px', 'auto'],
            success: function(layero, index) {
                form.render();
                form.on('submit(bind)', function(data){
                    var formData = form.val('formDialog');
                    var roomPrice = formData.roomPrice,
                        stationPrice = formData.stationPrice;

                    var roomList = param.room,
                        stationList = param.station;

                    roomList.forEach(function (item, ind) {
                        // 租金表价
                        var roomId = item.roomId;
                        $('.roomtableprice_' + roomId).val(roomPrice);
                    });

                    stationList.forEach(function (item, ind) {
                        // 租金表价
                        var roomId = item.roomId;
                        $('.roomtableprice_' + roomId).val(stationPrice);
                    });
                    form.render();
                    layer.close(index);

                    // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                    return false;
                });
            }
        })
    }



    /**
     * 批量设置物业服务费底价
     */
    function getBatchPropertyPriceHtml(param) {
        var $o = param.node;
        var roomUnitName = $o.attr('data-room-unit-name'),
            roomUnit = $o.attr('data-room-unit');

        var _html = '<div class="layui-card-body" style="padding: 20px 25px;">' +
            '<form class="layui-form" action="" lay-filter="formDialog">';
        if(param.room.length) {
            _html += '<div class="">已选中'+ param.room.length +'个房间，批量设置'+ param.title +'为：</div>' +
                '<div class="layui-form-item">' +
                '<div class="layui-input-inline text-w-350">' +
                '<input type="text" name="roomPrice" lay-verify="required|onlyDecmal9" lay-reqText="请设置'+ param.title +'" required placeholder="请设置'+ param.title +'" autocomplete="off" class="layui-input" >'+
                '</div>' +
                '<div class="layui-form-mid"><span>'+ roomUnitName +'</span></div>'+
                '</div>';
        }

        if(param.station.length) {
            _html += '<div class="">已选中'+ param.station.length +'个工位，批量设置'+ param.title +'为：</div>' +
                '<div class="layui-form-item">' +
                '<div class="layui-input-inline text-w-250">' +
                '<input type="text" name="stationPrice" lay-verify="required|onlyDecmal9" lay-reqText="请设置'+ param.title +'" required placeholder="请设置'+ param.title +'" autocomplete="off" class="layui-input" >'+
                '</div>' +
                '<div class="layui-form-mid"><span>'+ roomUnitName +'</span></div>'+
                '</div>';
        }
        _html +=            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    function setBatchPropertyPrice(param) {
        Dialog.formDialog({
            title: param.dialogTitle,
            content: getBatchPropertyPriceHtml(param),
            area: ['480px', 'auto'],
            success: function(layero, index) {
                form.render();
                form.on('submit(bind)', function(data){
                    var formData = form.val('formDialog');
                    var roomPrice = formData.roomPrice,
                        stationPrice = formData.stationPrice;

                    var roomList = param.room,
                        stationList = param.station;

                    roomList.forEach(function (item, ind) {
                        // 物业服务费底价
                        var roomId = item.roomId;
                        $('.roompropertyprice_' + roomId).val(roomPrice);
                    });

                    stationList.forEach(function (item, ind) {
                        // 物业服务费底价
                        var roomId = item.roomId;
                        $('.roompropertyprice_' + roomId).val(stationPrice);
                    });
                    form.render();
                    layer.close(index);

                    // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                    return false;
                });
            }
        })
    }

    /**
     * $unitArr = array('1'=>'元/㎡/天','2'=>'元/㎡/月','3'=>'元/月');
     */
    function handleBatchData() {
        var $selectActiveBox = $('input[name^="roomId"]:checked'),
            room = [],
            station = [];

        $selectActiveBox.each(function(i, node) {
            var $node = $(node),
                // roomUnit = $node.attr('data-room-unit'),
                roomType = $node.attr('data-room-type');

            var $curTr = $node.parents('tr'),
                roomUnit = $curTr.find('select[name^=baseparkunit] option:selected').val(),
                roomUnitText = $curTr.find('select[name^=baseparkunit] option:selected').text();

            var tempObj = {};
            tempObj.roomUnit = roomUnit;
            tempObj.roomUnitText = roomUnitText;
            tempObj.roomType = roomType;
            tempObj.roomId = $node.val();

            if(roomType == 'room') {
                room.push(tempObj);
            } else {
                station.push(tempObj);
            }
        });

        return {
            roomList: room,
            stationList: station
        }
    }

    // 房间类型中是否含有不同价格单位
    function roomTypeIsSame(roomList) {
        var type1 = 0,           // 元/㎡/天
            type2 = 0,           // 元/㎡/月
            type3 = 0;           // 元/月

        roomList.forEach(function (item, index) {
            if(item.roomUnit == '1') {
                type1 += 1;
            } else if(item.roomUnit == '2') {
                type2 += 1;
            } else if(item.roomUnit == '3') {
                type3 += 1;
            }
        });

        if ((type1 && type2) || (type1 && type3) || (type2 && type3)) {
            Dialog.errorDialog("您所勾选的房间中含有不同的价格单位，不支持批量设置");
            return false;
        }
        return true;
    }


    $(function() {
        Approval();

        // 撤销
        $(document).on('click', '.ajaxApplyCancel', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                message = $o.attr('data-message');

            Dialog.confirmDialog({
                title: '提示',
                content: message,
                yesFn: function (index, layero) {
                    Req.getReqCommon(url);
                }
            })
        });

        // 批量设置租金底价
        $(document).on('click', '.setAllRoomBasePrice', function () {
            var $o = $(this);
            if($o.hasClass('layui-btn-disabled')) return;

            var batchData = handleBatchData();
            if(!roomTypeIsSame(batchData.roomList)) {
                return false;
            }

            var param = {
                dialogTitle: '批量设置租金底价',
                title: '租金底价',
                room: batchData.roomList,
                station: batchData.stationList,
                node: $o
            };
            setBatchPrice(param);
        });

        // 批量设置租金表价
        $(document).on('click', '.setAllRoomTablePrice', function () {
            var $o = $(this);
            if($o.hasClass('layui-btn-disabled')) return;

            var batchData = handleBatchData();
            if(!roomTypeIsSame(batchData.roomList)) {
                return false;
            }

            var param = {
                dialogTitle: '批量设置租金表价',
                title: '租金表价',
                room: batchData.roomList,
                station: batchData.stationList,
                node: $o
            };
            setBatchTablePrice(param);
        });

        // 批量设置物业服务费底价
        $(document).on('click', '.setAllRoomPropertyPrice', function () {
            var $o = $(this);
            if($o.hasClass('layui-btn-disabled')) return;

            var batchData = handleBatchData();
            // if(!roomTypeIsSame(batchData.roomList)) {
            //     return false;
            // }

            var param = {
                dialogTitle: '批量设置物业服务费底价',
                title: '物业服务费底价',
                room: batchData.roomList,
                station: batchData.stationList,
                node: $o
            };
            setBatchPropertyPrice(param);
        });

        // 全选（所有）
        form.on('checkbox(allparkroom)', function(data) {
            if(data.elem.checked) {
                $('.building').find('input[type=checkbox]').prop('checked', true);
            } else {
                $('.building').find('input[type=checkbox]').prop('checked', false);
            }
            isCheckAll();
            form.render();
        });

        // 全选（楼宇）
        form.on('checkbox(build)', function (data) {
            var $o = $(data.elem),
                buildId = $o.attr('data-build-id');
            if(data.elem.checked) {
                $('.build_' + buildId).prop('checked', true);
                $('.floor_' + buildId).prop('checked', true);
            } else {
                $('.build_' + buildId).prop('checked', false);
                $('.floor_' + buildId).prop('checked', false);
            }
            isCheckAll();
            form.render();
        });

        // 全选（楼层）
        form.on('checkbox(floor)', function(data) {
            var $o = $(data.elem),
                areaId = $o.attr('data-area-id');
            var $curBuilding = $o.parents('.building');

            if(data.elem.checked) {
                $('.room_' + areaId).prop('checked', true);
            } else {
                $('.room_' + areaId).prop('checked', false);
            }

            curBuildIsAll($curBuilding);
            isCheckAll();
            form.render();
        });

        // 单个房间
        form.on('checkbox(room)', function(data) {
            var $o = $(data.elem),
                areaId = $o.attr('data-area-id');
            var $curBuilding = $o.parents('.building');

            var $curFloorRooms = $('input[name^=roomId][data-area-id='+ areaId +']'),
                $curFloorActiveRooms = $('input[name^=roomId][data-area-id='+ areaId +']:checked');

            if($curFloorRooms.length == $curFloorActiveRooms.length) {
                $('input[name=allfloor][data-area-id='+ areaId +']').prop('checked', true);
            } else {
                $('input[name=allfloor][data-area-id='+ areaId +']').prop('checked', false);
            }

            curBuildIsAll($curBuilding);
            isCheckAll();
            form.render();
        });

        form.on('select(baseparkunit)', function (data) {
            var $o = $(data.elem),
                $curTr = $o.parents('tr');
            var $roomId = $curTr.find('input[name^=roomId]'),
                roomId = $roomId.val();
            var $roombaseprice = $curTr.find('input[name^=roombaseprice]');
            var $roomtableprice = $curTr.find('input[name^=roomtableprice]');

            var rentUnitText = $o.find('option:selected').text();       // 租金底价单位
            var oldTableUnitText = $('.table_' + roomId).text();        // 原租金表价单位

            if(rentUnitText == oldTableUnitText) {

            } else {
                $roombaseprice.val('');
                $roomtableprice.val('');
            }

            if(data.value == '1') {
                // 元/㎡/天
                $('.table_' + roomId).text('元/㎡/天');
            } else if(data.value == '2') {
                // 元/㎡/月
                $('.table_' + roomId).text('元/㎡/月');
            } else if(data.value == '3') {
                // 元/月
                $('.table_' + roomId).text('元/月');
            }
        });

        function replaceSelectName($form) {
            var $selects = $form.find('select[name^=baseparkunit]');
            $selects.each(function (i, o) {
                var $curSelect = $(o),
                    curName = $curSelect.attr('name');

                if(curName.indexOf('[') != -1) {
                    var curNewName = curName.split('[');
                    $curSelect.attr('name', curNewName[0] + '[]');
                }
            });
        }

        function validate() {
            var flag = true,
                $roomIds = $('input[name^=roomId]'),
                roomTrArr = [];

            $roomIds.each(function (i, o) {
                roomTrArr.push($(o).parents('tr'));
            });

            for(var i = 0, len = roomTrArr.length; i < len; i++) {
                var $curTr = roomTrArr[i],
                    $curRoomBasePrice = $curTr.find('input[name^=roombaseprice]'),
                    $curRoomTablePrice = $curTr.find('input[name^=roomtableprice]'),
                    $curRoomPropertyPrice = $curTr.find('input[name^=roompropertyprice]');

                var roomBasePrice = $curRoomBasePrice.val(),
                    roomTablePrice = $curRoomTablePrice.val(),
                    roomPropertyPrice = $curRoomPropertyPrice.val();

                if(roomBasePrice == '' && roomTablePrice != '') {
                    Dialog.errorDialog("租金底价必填!");
                    $curRoomBasePrice.addClass('layui-form-danger').focus();
                    flag = false;
                    break;
                }

                if(roomBasePrice != '' && roomTablePrice == '') {
                    Dialog.errorDialog("租金表价必填!");
                    $curRoomTablePrice.addClass('layui-form-danger').focus();
                    flag = false;
                    break;
                }

                if(roomBasePrice && roomTablePrice) {
                    if(!Regex.onlyDecmal9.reg.test(roomBasePrice)) {
                        Dialog.errorDialog(Regex.onlyDecmal9.msg);
                        $curRoomBasePrice.addClass('layui-form-danger').focus();
                        flag = false;
                        break;
                    }
                    if(!Regex.onlyDecmal9.reg.test(roomTablePrice)) {
                        Dialog.errorDialog(Regex.onlyDecmal9.msg);
                        $curRoomTablePrice.addClass('layui-form-danger').focus();
                        flag = false;
                        break;
                    }
                    // 租金表价>=租金底价
                    if(Common.Util.accSub(parseFloat(roomBasePrice), roomTablePrice) < 0) {
                        Dialog.errorDialog("租金表价大于等于租金底价");
                        $curRoomTablePrice.addClass('layui-form-danger').focus();
                        flag = false;
                        break;
                    }
                }

                // 物业服务费
                if(roomPropertyPrice) {
                    if(!Regex.onlyDecmal9.reg.test(roomPropertyPrice)) {
                        Dialog.errorDialog(Regex.onlyDecmal9.msg);
                        $curRoomPropertyPrice.addClass('layui-form-danger').focus();
                        flag = false;
                        break;
                    }
                }
            }
            return flag;
        }

        function getBasePriceDialogHtml(remark) {
            var _html = '<div class="layui-card-body">' +
                            '<form class="layui-form" action="" lay-filter="formDialog">' +
                                '<div class="layui-form-item">' +
                                    '<div class="layui-input-blockxxx">' +
                                        '<textarea placeholder="底价调整说明(500字以内)" maxlength="500" lay-verify="required" lay-reqText="底价调整说明(500字以内)" class="layui-textarea remark">' +
                                            remark +
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

        function getSubmitData() {
            var $listTrs = $('.building tbody tr:not(.bg-gray)');
            var param = {
                parkId: $('input[name=parkId]').val(),
                list: []
            };
            $listTrs.each(function (index, o) {
                var $o = $(o),
                    roomId = $o.find('input[name^=roomId]').val(),
                    roomType = $o.find('input[name^=roomId]').attr('data-room-type'),
                    basePrice = $o.find('input[name^=roombaseprice]').val(),
                    facePrice = $o.find('input[name^=roomtableprice]').val(),
                    propertyBasePrice = $o.find('input[name^=roompropertyprice]').val();

                var basePriceUnit;

                if(roomType == 'station') {
                    // 工位
                    basePriceUnit = $o.find('.baseparkunit').val();
                } else {
                    // 房间
                    basePriceUnit = $o.find('select[name^=baseparkunit] option:selected').val();
                }

                var obj = {
                    roomId: roomId,
                    basePrice: basePrice,
                    basePriceUnit: basePriceUnit,
                    facePrice: facePrice,
                    propertyBasePrice: propertyBasePrice
                };

                param.list.push(obj);
            });

            return param;
        }

        form.on('submit(setpriceAdd)', function(data){
            var $form = $('form');
            var url = $('#setpriceAdd').attr('data-url'),
                flowUrl = $('#setpriceAdd').attr('data-flow-url'),
                checkUrl = $('#setpriceAdd').attr('data-check-url');
            var remark = $('#setpriceAdd').attr('data-remark');
            var param;

            remark = remark ? remark : '';

            if(validate()) {
                param = getSubmitData();
                // Common.Util.replaceSerializeName2($form);
                // replaceSelectName($form);
                // var param = $form.serializeArray();

                Req.postReq(checkUrl, {data: JSON.stringify(param)}, function (res) {
                    if(res.status) {
                        Req.postReqCommon(url, {data: JSON.stringify(param)});
                    } else {
                        Dialog.formDialog({
                            title: '底价调整说明',
                            content: getBasePriceDialogHtml(remark),
                            btn: ['提交审批', '取消'],
                            success: function (layero, index) {
                                form.on('submit(bind)', function () {
                                    var remark = layero.find('.remark').val();
                                    param.remark = remark;

                                    Flow.handleFlowByJSON(flowUrl, url, param, function () {
                                        layer.close(index);
                                    });

                                    // Req.postReqCommon(url, {data: JSON.stringify(param)});
                                    return false;
                                });
                            }
                        });
                    }
                })

            }

            return false;
        });
    });
});