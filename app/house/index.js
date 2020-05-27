/**
 * 房源-首页
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common',  'upload', 'MUpload', 'Regex'], function() {
    var $ = layui.jquery,
        form = layui.form,
        $form = $('form'),
        upload = layui.upload,
        device = layui.device(),
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var MUpload = layui.MUpload;
    var Dialog = layui.Dialog;

    /**
     * 管理楼宇\管理楼层\初始化添加楼宇
     */
    function updateFloorTool() {
        var $floorItems = $('.floorItem'),
            len = $floorItems.length;
        if(len == 1) {
            $floorItems.find('.floorTool').removeClass('disabled');
            $floorItems.find('.upFloor').addClass('disabled');
            $floorItems.find('.downFloor').addClass('disabled');
        } else {
            $floorItems.each(function(i, o) {
                $(o).find('.floorTool').removeClass('disabled');
                if(i == 0) {
                    $(o).find('.upFloor').addClass('disabled');
                } else if(i == len - 1) {
                    $(o).find('.downFloor').addClass('disabled');
                }
            });
        }
    }

    function getFloorListHtml(param) {
        var _html = '',
            list = param.data;

        list.forEach(function(item, index) {
            _html += '<tr class="floorItem">' +
                        '<td>';
            if(param.type == '2') {
                // 楼层
                _html += '<input style="display: inline-block; width: 300px; margin-right: 10px;" type="text" name="name[]" data-bid="'+ item.bid +'" value="'+ item.name +'" maxlength="'+ param.max +'" data-type="'+ param.type +'" lay-verify="required"  lay-reqText="'+ param.placeholder +'" required placeholder="'+ param.placeholder +'" autocomplete="off" class="layui-input" >'+
                        '<span>层</span>';
            } else {
                // 楼宇
                _html += '<input type="text" name="name[]" data-bid="'+ item.bid +'" value="'+ item.name +'" maxlength="'+ param.max +'" data-type="'+ param.type +'" lay-verify="required"  lay-reqText="'+ param.placeholder +'" required placeholder="'+ param.placeholder +'" autocomplete="off" class="layui-input" >';
            }
            _html += '<input type="hidden" name="id[]" value="'+ item.id +'">' +
                        '</td>' +
                        '<td class="txt-c">' +
                            '<a href="javascript:;" class="c-link floorTool upFloor" data-type="'+ param.type +'">上移</a>｜' +
                            '<a href="javascript:;" class="c-link floorTool downFloor" data-type="'+ param.type +'">下移</a>｜' +
                            '<a href="javascript:;" class="c-link floorTool insertFloor" data-type="'+ param.type +'">插入</a>｜' +
                            '<a href="javascript:;" class="c-link floorTool delFloor" data-id="'+ item.id +'" data-type="'+ param.type +'">删除</a>' +
                        '</td>' +
                     '</tr>';
        });
        return _html;
    }

    function getFloorDialogHtml(param) {
        var _html = '';
        _html += '<div class="layui-card-body" style="height: 240px; overflow-y: scroll;">' +
                    '<form class="layui-form" action="" lay-filter="formDialog">' +
                        '<table class="layui-table">' +
                            '<colgroup>' +
                                '<col width="60%">' +
                                '<col width="40%">' +
                            '</colgroup>'+
                            '<thead>' +
                                '<tr>' +
                                    '<th>'+ param.thTitle +' <span class="c-orange">*</span></th>' +
                                    '<th></th>' +
                                '</tr> ' +
                            '</thead>' +
                            '<tbody class="tbody">' +
                                getFloorListHtml(param) +
                            '</tbody>'+
                        '</table>'+
                    '<!--写一个隐藏的btn -->' +
                    '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                    '</button>' +
                    '</form>' +
                '</div>';
        return _html;
    }

    function handleFloor(param) {
        Dialog.formDialog({
            title: param.dialogTitle,
            content: getFloorDialogHtml(param),
            btn: ['保存', '取消'],
            area: ['650px', 'auto'],
            success: function(layero, index) {
                updateFloorTool();
                form.render();
                form.on('submit(bind)', function(data){
                    // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                    var $form = layero.find('form'),
                        data = $form.serializeArray();

                    if(checkBuildFloor(layero, param.type)) {
                        Req.postReq(param.url, data, function(res) {
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
                    return false;
                });
            }
        });
    }

    function checkBuildFloor(layero, type) {
        var $flowItems = layero.find('.floorItem'),
            buildFloor = [];
        $flowItems.each(function(i, o) {
            var $td = $(o).find('td').eq(0),
                $buildFloorInput = $td.find('.layui-input');
            buildFloor.push($buildFloorInput.val());
        });
        var result = Common.Util.getDuplicateItem(buildFloor);
        if(result.length) {
            if(type == '1') {
                Dialog.errorDialog('楼宇名称【' +  result.join(',') + '】重复');
            } else {
                Dialog.errorDialog('楼层名称【' +  result.join(',') + '】重复');
            }
            return false;
        }
        return true;
    }


    // 楼宇名称\楼层名称重复性验证(前台)
    // function checkBuildFloor($target, _name) {
    //     var flag = true,
    //         $nameInputs = $('.tbody').find('input[name="name[]"]').not($target);
    //     $nameInputs.each(function(i, o) {
    //         if(_name == $(o).val()) {
    //             Dialog.errorDialog('房间号【'+ _name +'】在当前楼宇中已存在，请重新输入');
    //             $target.val('');
    //             $target.focus();
    //             flag = false;
    //             return false;
    //         }
    //     });
    //     return flag;
    // }

    // 楼宇名称\楼层名称重复性验证（后台）
    // function checkBuildFloorAjax(type, _name, _bid) {
    //     var url = '', param = {};
    //     if(type == '1') {
    //         // 楼宇
    //         url = $('#checkBuildNameAjaxUrl').val();
    //     } else {
    //         // 楼层
    //         url = $('#checkFloorNameAjaxUrl').val();
    //     }
    //     param.name = _name;
    //     param.bid = _bid;
    //     // if(type == '2') {
    //     //     // 楼宇
    //     //     param.bid = _bid;
    //     // }
    //
    //     Req.postReq(url, param, function(res) {
    //         if(res.status) {
    //
    //         } else {
    //             Dialog.errorDialog(res.msg);
    //         }
    //     })
    // }

    // 删除楼层楼宇验证
    function delBuildFloor(type, _id, callback) {
        var url = '';
        if(type == '1') {
            // 楼宇
            url = $('#delBuildAjaxUrl').val();
        } else {
            // 楼层
            url = $('#delFloorAjaxUrl').val();
        }

        url += '?id=' + _id;
        Req.getReq(url, function(res) {
            if(res.status) {
                callback && callback();
            } else {
                Dialog.errorDialog(res.msg);
            }
        })
    }

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

    function getBatchPriceHtml(room, station, $o) {
        var roomUnitName = $o.attr('data-room-unit-name'),
            roomUnit = $o.attr('data-room-unit'),
            stationUnitName = $o.attr('data-station-unit-name'),
            stationUnit = $o.attr('data-station-unit');

        var _html = '<div class="layui-card-body" style="padding: 20px 25px;">' +
                        '<form class="layui-form" action="">';
        if(room.length) {
            _html += '<div class="">已选中'+ room.length +'个房间，批量设置底价为：</div>' +
                    '<div class="layui-form-item">' +
                        '<div class="layui-input-inline text-w-350">' +
                           '<input type="text" name="price[]" lay-verify="required|number"  lay-reqText="请设置底价" required placeholder="请设置底价" autocomplete="off" class="layui-input" >'+
                            '<input type="hidden" name="roomIds[]" value="'+ room.join(',') +'">' +
                            '<input type="hidden" name="unit[]" value="'+ roomUnit +'">' +
                        '</div>' +
                        '<div class="layui-form-mid"><span>'+ roomUnitName +'</span></div>'+
                     '</div>';
        }

        if(station.length) {
            _html += '<div class="">已选中'+ station.length +'个工位，批量设置底价为：</div>' +
                     '<div class="layui-form-item">' +
                        '<div class="layui-input-inline text-w-350">' +
                            '<input type="text" name="price[]" lay-verify="required|number"  lay-reqText="请设置底价" required placeholder="请设置底价" autocomplete="off" class="layui-input" >'+
                            '<input type="hidden" name="roomIds[]" value="'+ station.join(',') +'">' +
                            '<input type="hidden" name="unit[]" value="'+ stationUnit +'">' +
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

    function setBatchPrice(room, station, $o) {

        Dialog.formDialog({
            title: '批量设置底价',
            content: getBatchPriceHtml(room, station, $o),
            area: ['480px', 'auto'],
            success: function(layero, index) {
                var $form = layero.find('form');
                form.on('submit(bind)', function(data){
                    var param = $form.serializeArray(),
                        url = $('#setpriceUrl').val();
                    Req.postReqCommon(url, param);
                    // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                    return false;
                });
            }
        })
    }

    /**
     * 获取楼宇\楼层数据
     * @param list
     * @param type 1：楼宇  2：楼层
     * @returns {{id: string, name: string}[]}
     */
    function getData(list, type) {
        var res = [{id:'', name:''},{id:'', name:''},{id:'', name:''}];
        if(list.length) {
            res.length = 0;
            list.forEach(function(item, index) {
                var obj = {};
                if(type == '1') {
                    obj.id = item.buildId;
                    obj.name = item.buildName;
                    obj.bid = item.buildId;     // 楼宇 id和bid为同一个
                } else {
                    obj.id = item.floorId;
                    obj.name = item.floorName;
                    obj.bid = item.floorBuildId;
                }
                res.push(obj);
            })
        }
        return res;
    }

    /**
     * 上传平面图
     */

    function uploadPic() {

        // 更换展开平面图
        MUpload({
            // elem: '.changeFloorPic',
            elem: $('.changeFloorPic'),
            exts: 'jpg|jpeg|png',
            before: function() {return true},
            done: function(res, index, upload) {
                var $curUpload = $(this.item),
                    floorId = $curUpload.attr('data-floor-id'),
                    url = $('input[name=update_floor_ajax_url]').val();

                Req.postReq(url, {id: floorId, fileId: res.data.fileId}, function(res) {
                    if(res.status) {
                        window.location.reload();
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                })
            }
        });

        // 更换园区平面图
        MUpload({
            // elem: '.parkupload',
            elem: $('.parkupload'),
            exts: 'jpg|jpeg|png',
            before: function() {return true},
            done: function(res, index, upload) {
                var url = $('input[name=update_park_ajax_url]').val();

                Req.postReq(url, {fileId: res.data.fileId}, function(res) {
                    if(res.status) {
                        window.location.reload();
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                })
            }
        });

        // 更换楼层平面图
        var $uploads = $('.upload2');
        $uploads.each(function (i, o) {
            MUpload({
                // elem: '.upload2',
                iframeIndex: i,
                elem: $(o),
                exts: 'jpg|jpeg|png',
                before: function() {
                    layer.load(2, {shade: [0.1, '#000']});
                    return true
                },
                done: function(res, index, upload) {
                    var $curUpload = this.elem,
                        // floorId = $curUpload.attr('data-floor-id'),
                        floorId = $(o).attr('data-floor-id'),
                        url = $('input[name=update_floor_ajax_url]').val();

                    Req.postReq(url, {id: floorId, fileId: res.data.fileId}, function(res) {
                        if(res.status) {
                            window.location.reload();
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    })
                }
            });
        });
    }

    // 园区平面图
    function getParkUploadHtml(imgPath, auth) {
        var _html = '<div class="uploadParkView" style="width: 100%; height: 360px;">' +
                        '<a href="'+ imgPath +'" target="_blank">' +
                            '<img width="760" height="360" src="'+ imgPath +'" alt="园区平面图">' +
                        '</a>'+
                    '</div>'+
                    '<div class="uploadParkOperate" style="text-align: right; margin-top: 10px;">';
        if (device.ie && device.ie < 10) {
            _html += '<a class="layui-btn layui-btn-sm" style="width: 80px; margin-right: 10px;" href="'+ imgPath +'" target="_blank">查看原图</a>';
        } else {
            _html += '<a class="layui-btn layui-btn-sm" style="width: 80px;" href="'+ imgPath +'" target="_blank">查看原图</a>';
        }

        if(auth == '1') {
            // bug 16260
            _html += '<button type="button" class="layui-btn layui-btn-sm replaceParkUpload" style="margin-right: 10px;">更换平面图</button>';
        }
        _html +=       '<button type="button" class="layui-btn layui-btn-sm replaceHide">隐&nbsp;&nbsp;&nbsp;&nbsp;藏</button>' +
                    '</div>';
        return _html;
    }


    $(function() {
        uploadPic();

        // 更多楼宇展示
        var $unfoldNodes = $('.floorCondition .h-unfold a');
        var _width = $('.floorCondition .h-unfold').outerWidth() - 100;
        var totalWidth = 0;
        $unfoldNodes.each(function (i, o) {
            var $o = $(o),
                _w = $o.outerWidth();

            totalWidth = Common.Util.accAdd(totalWidth, _w);
        });
        if(totalWidth > _width) {
            $('.floorCondition .ibs-ico-folddown').removeClass('hidden');
        }


        /**
         * 验证
         */
        // $(document).on('blur', 'input[name="name[]"]', function() {
        //     var $o = $(this),
        //         bid = $o.attr("data-bid"),
        //         type = $o.attr('data-type');    // 1: 楼宇  2：楼层
        //     var name = $o.val();
        //
        //     if(name && checkBuildFloor($o, name)) {
        //         checkBuildFloorAjax(type, name, bid);
        //     }
        // });

        /**
         * 管理楼宇\楼层
         */
        // 管理楼宇
        $(document).on('click', '.ajaxAddBuild', function() {
            var url = $(this).attr('data-url'),
                submitUrl = $(this).attr('data-submit-url');

            Req.getReq(url, function (res) {
                if(res.status) {
                    handleFloor({
                        url: submitUrl,
                        type: 1,
                        max: 20,
                        dialogTitle: '管理楼宇',
                        thTitle: '楼宇名称',
                        placeholder: '输入楼宇名称,如&quot;1号楼&quot;',
                        data: getData(res.data.data, 1)
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 管理楼层
        $(document).on('click', '.ajaxManageFloor', function() {
            var url = $(this).attr('data-url'),
                submitUrl = $(this).attr('data-submit-url'),
                floorName = $(this).attr('data-floor-name');

            Req.getReq(url, function(res) {
                if(res.status) {
                    handleFloor({
                        url: submitUrl,
                        type: 2,
                        max: 10,
                        dialogTitle: floorName,
                        thTitle: '楼层名称',
                        placeholder: '输入楼层名称,如&quot;1&quot;',
                        data: getData(res.data.data, 2)
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        /**
         * 上移\下移\插入\删除
         */
        $(document).on('click', '.upFloor', function(e){
            if($(this).hasClass('disabled')) return false;
            var $o = $(this),
                $curTr = $o.parent().parent(),
                $prevTr = $curTr.prev();
            $curTr.insertBefore($prevTr);
            updateFloorTool();
        });
        $(document).on('click', '.downFloor', function(e){
            if($(this).hasClass('disabled')) return false;
            var $o = $(this),
                $curTr = $o.parent().parent(),
                $nextTr = $curTr.next();
            $curTr.insertAfter($nextTr);
            updateFloorTool();
        });
        $(document).on('click', '.insertFloor', function(e){
            var $o = $(this),
                $curTr = $o.parent().parent(),
                $clone = $curTr.clone();
            $clone.find('input').val('');
            $clone.find('.delFloor').attr('data-id', '');
            $clone.find('.delFloor').attr('data-type', '');
            $clone.insertAfter($curTr);
            updateFloorTool();
        });
        $(document).on('click', '.delFloor', function(e){
            var $o = $(this),
                type = $o.attr('data-type'),
                _id = $o.attr('data-id'),
                $curTr = $o.parent().parent();

            if($('.floorItem').length == 1) {
                if(type == '1') {
                    Dialog.errorDialog('至少需保留1个楼宇');
                } else {
                    Dialog.errorDialog('至少需保留1个楼层');
                }
                return false;
            }

            if(_id) {
                delBuildFloor(type, _id, function() {
                    $curTr.remove();
                    updateFloorTool();
                });
            } else {
                $curTr.remove();
                updateFloorTool();
            }
        });

        // 关闭\展开
        $(document).on('click', '.foldUp', function (e) {
            e.stopPropagation();
            var $o = $(this),
                $ibsCollapse = $o.parents('.ibs-collapse'),
                $ibsCollaContent = $ibsCollapse.find('.ibs-colla-content');

            if($o.hasClass('ibs-ico-foldup')) {
                // 收缩
                $ibsCollaContent.slideUp();
                $o.removeClass('ibs-ico-foldup');
                $o.addClass('ibs-ico-folddown');
                $o.attr('title', '展开');
            } else if($o.hasClass('ibs-ico-folddown')) {
                // 展开
                $ibsCollaContent.slideDown();
                $o.addClass('ibs-ico-foldup');
                $o.removeClass('ibs-ico-folddown');
                $o.attr('title', '收起');
            }
        });

        $(document).on('click', '.foldDiv', function(e) {
            e.stopPropagation();
            var $o = $(this),
                $content = $o.prev();

            if($o.hasClass('ibs-ico-foldup')) {
                // 收缩
                $content.addClass('h-unfold');
                $o.removeClass('ibs-ico-foldup');
                $o.addClass('ibs-ico-folddown');
                $o.attr('title', '展开');
            } else if($o.hasClass('ibs-ico-folddown')) {
                // 展开
                $o.addClass('ibs-ico-foldup');
                $o.removeClass('ibs-ico-folddown');
                $content.removeClass('h-unfold');
                $o.attr('title', '收起');
            }
        });

        // 显示平面图
        $(document).on('click', '.showFloorPic', function () {
            var $o = $(this),
                floorId = $o.attr('data-floor-id');

            if($o.text() == '显示平面图') {
                $('#floorPic_' + floorId).removeClass('hidden');
                $o.text('隐藏平面图');
            } else {
                $('#floorPic_' + floorId).addClass('hidden');
                $o.text('显示平面图');
            }
        });

        // 隐藏平面图
        $(document).on('click', '.hiddenFloorPic', function () {
            var $o = $(this),
                floorId = $o.attr('data-floor-id'),
                $curShowFloorPic = $('.showFloorPic[data-floor-id='+ floorId +']');

            $('#floorPic_' + floorId).addClass('hidden');
            $curShowFloorPic.text('显示平面图');
        });

        // 上传园区平面图
        $(document).on('click', '#showImges', function() {
            var $o = $(this),
                imgPath = $o.attr('data-imgpath'),
                auth = $o.attr('data-auth'),
                compressImgPath = $o.attr('data-compress-url');
            var url = $('input[name=update_park_ajax_url]').val();
            Dialog.confirmDialog({
                title: '园区平面图',
                area: ['800px', 'auto'],
                content: getParkUploadHtml(imgPath, auth),
                success: function(layero, dialogIndex) {
                    layero.find('.layui-layer-btn').hide();
                    layero.find('.replaceHide').click(function () {
                        layer.close(dialogIndex);
                    });
                    MUpload({
                        // elem: '.replaceParkUpload',
                        elem: $('.replaceParkUpload'),
                        exts: 'jpg|jpeg|png',
                        before: function() {
                            layer.load(2, {shade: [0.1, '#000']});
                            return true
                        },
                        done: function(uploadRes, index, upload) {
                            Req.postReq(url, {fileId: uploadRes.data.fileId}, function(res) {
                                if(res.status) {
                                    Dialog.successDialog(res.msg, function () {
                                        window.location.reload();
                                    })
                                    // Dialog.successDialog(res.msg, function() {
                                    //     $o.attr('data-imgpath', uploadRes.data.webPath);
                                    //     $o.attr('data-imgurl', uploadRes.data.webPath);
                                    //     $o.find('img').attr('src', uploadRes.data.webPath);
                                    //     layer.close(dialogIndex);
                                    // });
                                } else {
                                    Dialog.errorDialog(res.msg);
                                }
                            })
                        }
                    });
                }
            })
        });

        /**
         * 搜索
         */
        function getAjaxUrl(url, param) {
            var result = [];
            for(var key in param) {
                result.push(key + '=' + param[key]);
            }
            return url + '?' + result.join('&');
        }

        function getSearchParam(url) {
            var keyword = $('input[name=keyword]').val(),
                $conditions = $('.condition').not('.hidden');
            var param = {};
            $conditions.each(function(i, o) {
                var $activeANode = $(o).find('a.active');
               var value = $activeANode.attr('data-value'),
                   key = $activeANode.attr('data-name');
                param[key] = value;
            });

            param.keyword = keyword;

            return getAjaxUrl(url, param);
        }

        $(document).on('click', '.condition .content a', function(e) {
            var $o = $(this),
                aName = $o.attr('data-name'),
                aValue = $o.attr('data-value'),
                $condition = $o.parents('.condition'),
                $aNodes = $condition.find('a');
            $aNodes.removeClass('active');
            $o.addClass('active');

            var activeStatus = $('.content').find('a.active[data-name="status"]').attr('data-value');

            if(activeStatus == '2') {
                // 待租
                $('.emptyDiv').removeClass('hidden');
            } else {
                $('.emptyDiv').addClass('hidden');
            }

            $('#ajaxSearch').trigger('click');
        });

        $(document).on('click', '#ajaxSearch', function() {
            var url = $('#searchHouseAjaxUrl').val();

            Req.getReq(getSearchParam(url), function(res) {
                if(res.status) {
                    $('.searchResult').html(res.data.content);
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });
        $(document).on('keydown', 'input[name=keyword]', function(e) {
            if (e.keyCode == 13) {
                $('#ajaxSearch').trigger('click');
            }
        });

        /**
         * 设置底价
         */
        $(document).on('mouseover', '.base-price', function() {
            $(this).addClass('active')
        });
        $(document).on('mouseout', '.base-price', function() {
            $(this).removeClass('active')
        });
        $(document).on('mouseover', '.base-price input', function(e) {
            // e.stopPropagation();
        });
        $(document).on('mouseout', '.base-price input', function(e) {
            // e.stopPropagation();
        });

        $(document).on('click', '.setAllRoomPrice', function(e) {
            e.preventDefault();
            if($(this).hasClass('layui-btn-disabled')) return;

            var $selectRooms = $('.house-list').find('input[name="roomId[]"]:checked'),
                room = [],
                station = [];

            $selectRooms.each(function(i,o) {
                var $o = $(o),
                    roomType = $o.attr('data-room-type');
                if(roomType == 'room') {
                    room.push($o.val());
                } else {
                    station.push($o.val());
                }
            });
            setBatchPrice(room, station, $(this));
        });

        $(document).on('blur','input[name=basePrice]', function() {
            var $o = $(this);
            var $checkbox = $o.parent().prev().find('input[name="roomId[]"]');
            var type = $checkbox.attr('data-room-type');
            if(type == 'room') {
                $(this).attr('readonly', true);
            }
        });
        $(document).on('focus', 'input[name=basePrice]', function() {
            var $o = $(this),
                $curLi = $o.parent().parent(),
                $curCheck = $curLi.find('input[name="roomId[]"]'),
                roomType = $curCheck.attr('data-room-type');

            if(roomType == 'station') {
                // 工位
                if(!$o.next('.unitDiv').length) {
                    $o.after('<div class="unit unitDiv">元/月</div>');
                }
            }
        });
        $(document).on('blur', 'input[name=basePrice]', function() {
            var $o = $(this),
                $curLi = $o.parent().parent(),
                $curCheck = $curLi.find('input[name="roomId[]"]'),
                roomType = $curCheck.attr('data-room-type'),
                val = $o.val();

            if($.trim(val) == '') {
                Dialog.errorDialog('请填写底价');
                if(roomType == 'station' && $o.attr('placeholder')) {
                    // 工位
                    if($o.next('.unitDiv').length) {
                        $o.next('.unitDiv').remove();
                    }
                }
                return false;
            } else if(!val || isNaN(val)) {
                Dialog.errorDialog('只能填写数字', function () {
                    // $o.val('');
                    // $o.focus();
                    if(roomType == 'station' && $o.attr('placeholder')) {
                        // 工位
                        if($o.next('.unitDiv').length) {
                            $o.val('');
                            $o.next('.unitDiv').remove();
                        }
                    }
                });
                // $o.focus();
                return false;
            }

            var url = $('#setpriceUrl').val(),
                param = [{name: "price[]", value: val},
                         {name: "roomIds[]", value: $curCheck.val()},
                         {name: "unit[]", value: !$o.attr('data-unit-type') ? 3 : $o.attr('data-unit-type')}];

            Req.postReq(url, param, function(res) {
                if(res.status) {
                    Dialog.successDialog(res.msg, function () {
                        window.location.reload();
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 按面积设置底价\设置一口价
        $(document).on('click', '.ajaxAreaSetting,.ajaxPriceSetting', function() {
            var $o = $(this),
                $selectUnit = $o.parent('.select-unit'),
                $basePrice = $o.parents('.base-price'),
                $basePriceInput = $basePrice.find('input[name=basePrice]'),
                $unitDiv = $basePrice.find('.unitDiv'),
                name = $o.attr('data-name');

            if($unitDiv.length) {
                $unitDiv.text(name);
            } else {
                $selectUnit.before('<div class="unit unitDiv">'+ name +'</div>');
            }

            $basePriceInput.focus();
            $basePriceInput.attr('readonly', false);
            $basePrice.removeClass('active');
            $basePriceInput.attr('data-unit-type', $o.attr('data-value'));

            Common.moveEnd($basePriceInput[0]);
        });

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
                $curFloor = $o.parents('.floor'),
                allRoomNum = $curFloor.find('input[name="roomId[]"]').length,
                selectedRoomNum =  $curFloor.find('input[name="roomId[]"]:checked').length;

            if(allRoomNum == selectedRoomNum) {
                $curFloor.find('.selectallroom').prop('checked', true);
            } else {
                $curFloor.find('.selectallroom').prop('checked', false);
            }
            form.render();
            checkAll();
        });

        /**
         * 设置费用标准
         */
        function getFeeStandHtml(propertyStandard, propertyStatus, hatchStandard, hatchStatus) {
            var _html = '<div class="layui-card-body" style="padding-top: 20px; padding-bottom: 0;">' +
                            '<form class="layui-form" action="" lay-filter="formDialog">';
            if(propertyStatus === '0') {
                // 未设置
                _html += '<div class="layui-form-item">' +
                            '<label class="layui-form-label">物业费标准</label>' +
                            '<div class="layui-input-inline">' +
                                '<input type="text" name="managefee" autocomplete="off" lay-verify="onlyDecmal8" class="layui-input disabled" disabled>'+
                            '</div>' +
                            '<div class="layui-form-mid">元/㎡/月</div>';
            } else {
                // 初次进来或已设置
                _html += '<div class="layui-form-item">' +
                            '<label class="layui-form-label">物业费标准</label>' +
                            '<div class="layui-input-inline">' +
                                '<input type="text" name="managefee" value="'+ propertyStandard +'" lay-verify="onlyDecmal8" autocomplete="off" class="layui-input">'+
                            '</div>' +
                            '<div class="layui-form-mid">元/㎡/月</div>';
            }

            if(typeof propertyStatus === 'undefined' || propertyStatus === '') {
                // 初次进来
                _html += '<input type="checkbox" name="settingManage" lay-filter="settingManage" lay-skin="primary" title="暂不设置" value="0">';
            } else if(propertyStatus == 0) {
                // 未设置
                _html += '<input type="checkbox" name="settingManage" lay-filter="settingManage" lay-skin="primary" title="暂不设置" value="0" checked>';
            } else {
                // 已设置
            }
            _html += '</div>';

            if(hatchStatus === '0') {
                // 未设置
                _html += '<div class="layui-form-item">' +
                            '<label class="layui-form-label">孵化服务费标准</label>' +
                            '<div class="layui-input-inline">' +
                                '<input type="text" name="servicefee" autocomplete="off" lay-verify="onlyDecmal8" class="layui-input disabled" disabled>'+
                            '</div>' +
                            '<div class="layui-form-mid" style="margin-right: 28px;">元/年</div>';
            } else {
                // 初次进来或已设置
                _html += '<div class="layui-form-item">' +
                                '<label class="layui-form-label">孵化服务费标准</label>' +
                                '<div class="layui-input-inline">' +
                                    '<input type="text" name="servicefee" value="'+ hatchStandard +'" lay-verify="onlyDecmal8" autocomplete="off" class="layui-input">'+
                                '</div>'+
                                '<div class="layui-form-mid" style="margin-right: 28px;">元/年</div>';
            }

            if(typeof hatchStatus === 'undefined' || hatchStatus === '') {
                // 初次进来
                _html += '<input type="checkbox" name="setting" lay-filter="setting" lay-skin="primary" title="暂不设置" value="0">';
            } else if(hatchStatus == 0) {
                _html += '<input type="checkbox" name="setting" lay-filter="setting" lay-skin="primary" title="暂不设置" value="0" checked>';
                // 未设置
            } else if(hatchStatus == 1) {
                // 已设置
            }
            _html += '</div>'+
                                '<!--写一个隐藏的btn -->' +
                                '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                                '</button>' +
                            '</form>' +
                        '</div>';
            return _html;
        }
        $(document).on('click', '.ajaxFeeStand', function() {
            var url = $(this).attr('data-url'),
                propertyStandard = $(this).attr('data-property-standard'),      // 物业费标准
                propertyStandard = typeof propertyStandard == 'undefined' ? '' : propertyStandard,
                hatchStandard = $(this).attr('data-hatch-standard'),            // 孵化服务费标准
                hatchStandard = typeof hatchStandard == 'undefined' ? '' : hatchStandard;
            var hatchStatus = $(this).attr('data-hatch-status'),                // 1:设置,0:未设置
                propertyStatus = $(this).attr('data-property-status');          // 1:设置,0:未设置

            Dialog.formDialog({
                title: '设置费用标准',
                content: getFeeStandHtml(propertyStandard, propertyStatus, hatchStandard, hatchStatus),
                area: ['auto', 'auto'],
                success: function(layero, index) {
                    form.render('checkbox', 'formDialog');

                    // 物业费标准【暂不设置】
                    form.on('checkbox(settingManage)', function(data){
                        var $manageFeeInput = layero.find('input[name=managefee]');
                        if(this.checked) {
                            // 选中
                            $manageFeeInput.addClass('disabled');
                            $manageFeeInput.attr('disabled', true);
                            $manageFeeInput.val('');
                        } else {
                            $manageFeeInput.removeClass('disabled');
                            $manageFeeInput.attr('disabled', false);
                        }
                    });

                    // 孵化服务费标准【暂不设置】
                    form.on('checkbox(setting)', function(data){
                        var $serviceFeeInput = layero.find('input[name=servicefee]');
                        if(this.checked) {
                            // 选中
                            $serviceFeeInput.addClass('disabled');
                            $serviceFeeInput.attr('disabled', true);
                            $serviceFeeInput.val('');
                        } else {
                            $serviceFeeInput.removeClass('disabled');
                            $serviceFeeInput.attr('disabled', false);
                        }
                    });

                    form.on('submit(bind)', function(data){
                        var $form = layero.find('form'),
                            param = $form.serializeArray();

                        // TODO...验证

                        Req.postReqCommon(url, param);
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                }
            })
        });

        form.on('submit', function(data){
            return false;
        });

        // 导出
        $(document).on('click', '.houseExport', function () {
            var url = $(this).attr('data-url'),
                key = $(this).attr('data-key');

            var param = {};
            param.key = key;

            Req.postReq(url, param, function (res) {
                if(res.status) {
                    Dialog.downloadDialog({
                        downloadUrl: res.data.url
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        function getHouseImportDialogHtml(format, roomUrl, stationUrl) {
            var _html = '<div class="layui-card-body">' +
                '<form class="layui-form" action="" lay-filter="formDialog">';

            if(format == '3') {
                _html += '<div class="layui-form-item">' +
                            '<label class="layui-form-label">房源类型</label>' +
                            '<div class="layui-input-block">' +
                                '<input type="radio" name="type" lay-filter="type" value="1" title="房间" checked>' +
                                '<input type="radio" name="type" lay-filter="type" value="2" title="工位">' +
                            '</div>'+
                          '</div>';
            }
            _html +=
                '<div class="layui-form-item">' +
                    '<label class="layui-form-label">文件</label>' +
                    '<div class="layui-input-block">' +
                        '<div class="upload-wrapper">' +
                            '<div class="upload-box">' +
                                '<button type="button" class="layui-btn upload" data-show-url="1"><i class="layui-icon"></i>上传</button>' +
                            '</div>' +
                            '<div class="upload-list"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="layui-form-item">' +
                    '<label class="layui-form-label"></label>' +
                    '<div class="layui-input-block">';
                if(format == '1') {
                    _html += '<input type="hidden" name="type" value="1">';
                }
                if(format == '2') {
                    _html += '<input type="hidden" name="type" value="2">';
                }
                if(format == '1' || format == '3') {
                    // 房间 + 混合
                    _html += '<a class="c-link mr-5" href="'+ roomUrl +'" target="_blank">房间模板下载</a>';
                }
                if(format == '2' || format == '3') {
                    // 工位 + 混合
                    _html += '<a class="c-link" href="'+ stationUrl +'" target="_blank">工位模板下载</a>';
                }
                 _html +=
                            '</div>'+
                         '</div>' +
                <!--写一个隐藏的btn -->
                '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                '</button>' +
                '</form>' +
                '</div>';
            return _html;
        }

        // (房源导入)v1.6.4
        $(document).on('click', '.houseImport', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                format = $o.attr('data-park-format'),       // 3: 混合   1：房间  2：工位
                stationUrl = $o.attr('data-station-url'),
                roomUrl = $o.attr('data-room-url');

            Dialog.formDialog({
                title: '房源导入',
                content: getHouseImportDialogHtml(format, roomUrl, stationUrl),
                area: ['450px', '300px'],
                success: function (layero, index) {
                    form.render(null, 'formDialog');
                    var $form = layero.find('form');
                    var $elem = layero.find('.upload');
                    MUpload({
                        elem: $elem,
                        exts: 'xls|xlsx',
                        maxNum: 1
                    });
                    form.on('submit(bind)', function(data) {
                        var param = $form.serializeArray();

                        if(!layero.find('.upload-file-item').length) {
                            Dialog.errorDialog("请选择上传文件");
                            return false;
                        }
                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                if (res.data.url) {
                                    // Dialog.skipDialog();
                                    window.location.href = res.data.url;
                                } else {
                                    window.location.reload();
                                }
                            } else {
                                Dialog.errorDialog(res.msg);
                            }

                        });
                        // Req.postReqCommon(url, param);
                        return false;
                    })
                },
                endFn: function () {
                    // IE浏览器上传
                    if (device.ie && device.ie < 10) {
                        $('iframe').remove();
                    }
                }
            })
        });
    });
});