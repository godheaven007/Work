/**
 * 设置-园区管理
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager', 'DPTree', 'PCA', 'laydate', 'Regex', 'upload', 'MUpload', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        $form = $('form'),
        DPTree = layui.DPTree,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Regex = layui.Regex;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var Request = layui.Req;
    var PCA = layui.PCA;
    var MUpload = layui.MUpload;
    var ListModule = layui.ListModule;

    PCA();
    var deptList = [];      // 部门

    var map, point, myGeo, lastPoi, local, circle;
    var initMap = function(mapId, longitude, latitude) {
        if ($('#settingMap').length > 0 && $('#mapResult').length == 0) {
            $('<div id="mapResult" class="map-result"></div>').insertAfter('#settingMap');
        }

        if ($('#viewMap').length > 0 && $('#mapNearby').length == 0) {
            $('<div id="mapNearby" class="map-nearby"><div class="bg"></div><div class="info"><span class="t">配套信息：</span><a href="javascript:;" class="l">写字楼</a><a href="javascript:;" class="l">餐饮</a><a href="javascript:;" class="l">交通</a><a href="javascript:;" class="l">高校</a></div></div>').insertAfter('#viewMap');
        }

        // 百度地图API功能
        // var longitude = parseFloat(($('#longitude').val() != '') ? $('#longitude').val() : 120.620194);
        // var latitude = parseFloat(($('#latitude').val() != '') ? $('#latitude').val() : 31.318049);

        longitude = !longitude ? 120.620194 : longitude;
        latitude = !latitude ? 31.318049 : latitude;

        if (mapId == 'viewMap') {
            var myIcon = new BMap.Icon("http://api.map.baidu.com/img/markers.png", new BMap.Size(23, 25), {
                offset: new BMap.Size(10, 25),
                imageOffset: new BMap.Size(0, 0 - 10 * 25)
            });
        }

        map = new BMap.Map(mapId);
        if (!longitude || !latitude) {
            point = new BMap.Point();
            lastPoi = point
            map.centerAndZoom(point, 16);
            // map.enableScrollWheelZoom();
            map.addControl(new BMap.NavigationControl());
            map.addControl(new BMap.ScaleControl());
            var marker = new BMap.Marker(point);
        } else {
            point = new BMap.Point(longitude, latitude);
            map.centerAndZoom(point, 16);
            lastPoi = point;
            var marker = new BMap.Marker(point, { icon: myIcon });
            map.addOverlay(marker);

            local = new BMap.LocalSearch(map, {
                renderOptions: { map: map, panel: "mapResult" },
                onInfoHtmlSet: function(poi) {
                    $('#longitude').val(poi.point.lng);
                    $('#latitude').val(poi.point.lat);
                    $('#pointInput').val(poi.point.lng + ',' + poi.point.lat);
                    $('#searchMapKeyword').val(poi.address);
                }
            });
            local.disableFirstResultSelection();

            if ($('.project_view').length == 0 || $('.project_view:hidden').length == 1) {
                if ($('#searchMapKeyword').val() != '') {
                    local.search($('#searchMapKeyword').val());
                }
            }
        };


        //拖动获取坐标中点
        map.addEventListener("dragend", function() {
            var cp = map.getCenter();
            $('#longitude').val(cp.lng);
            $('#latitude').val(cp.lat);
        });
        //监听点击获取经纬度
        map.addEventListener("click", function(e) {
            $('#longitude').val(e.point.lng);
            $('#latitude').val(e.point.lat);
        });
    };

    function init() {
        var deptListUrl = $('#deptListAjaxUrl').val();
        loadData(deptListUrl);
        // MUpload({choose:function(){}});

        var $upload = $('.upload');
        $upload.each(function (i, o) {
            MUpload({
                elem: $(o),
                // maxNum: 1
            });
        })

        form.render();
        if($('#settingMap').length) {
            setTimeout(function() {
                var longitude = $('#longitude').val(),
                latitude = $('#latitude').val();
                initMap('settingMap', longitude, latitude);
            }, 1000);
        }

        if($('#pageAjaxUrl').length) {
            ListModule.init();
        }
    }

    // 部门数据
    function loadData(url) {
        Request.getReq(url, function(res) {
            if(res.status) {
                deptList = res.data.data;
            }
        });
    }

    function layEventHandle() {
        lay('.datebox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                // showBottom: false,
                btns: ['clear', 'now']
            });
        });

        // 验证
        form.verify({
            // 收入占比
            incomeRatio: function(value, item) {
                if(!$('.chargeDiv').hasClass('hidden')) {
                    if(!Regex.incomeRatio.reg.test(value)) {
                        return Regex.incomeRatio.msg;
                    }
                }
            },
            // 业主交付面积
            // square: function(value, item) {
            //     if($(item).parent().parent().is(":visible")) {
            //         if(!$.trim(value) || Regex.square.reg.test(value)) {
            //
            //         } else {
            //             return Regex.square.msg;
            //         }
            //     }
            // },
            houseStatus: function(value, item) {
                var va = $(item).find("input[type='radio']:checked").val();
                if (typeof (va) == "undefined") {
                    return $(item).attr("lay-verify-msg");
                }
            },
            // 房源业态、租金单位
            mustOne: function(value, item) {
                if($(item).parent().parent().is(":visible")) {
                    var radio_name = $(item).attr('name'),
                        msg = $(item).attr('data-msg');

                    var len = $('input:radio[name="' + radio_name + '"]:checked').length;
                    if (!len) {
                        return msg + '必选其一';
                    }
                }
            },
            projectname: function(value, item) {
                if($(item).parent().parent().is(":visible")) {
                    if(!/[\S]+/.test(value)) {
                        return '必填项不能为空';
                    }
                }
            },
            projectarea: function(value, item) {
                if($(item).parent().parent().is(":visible")) {
                    if(!/[\S]+/.test(value)) {
                        return '必填项不能为空';
                    }
                    if(!Regex.square.reg.test(value)) {
                        return Regex.square.msg;
                    }
                }
            },
            // 招租签约期限
            maxSignDate: function(value, item) {
                if($(item).is(":visible")) {
                    if(value == '') {
                        return '招租签约期限必填';
                    }

                    if(!Regex.customDate.reg.test(value)) {
                        return '日期格式不正确';
                    }
                }
            },
            // 合同周期
            customDate: function(value, item) {
                if($(item).parent().parent().is(":visible")) {
                    var name = $(item).attr('name');
                    if(value == '') {
                        if(name == 'contarctStart') {
                            return '合同周期未选择开始日期';
                        } else {
                            return '合同周期未选择结束日期';
                        }
                    }

                    if(!Regex.customDate.reg.test(value) && name == 'contarctStart') {
                        return '合同周期开始日期格式不正确';
                    }

                    if(!Regex.customDate.reg.test(value) && name == 'contarctEnd') {
                        return '合同周期结束日期格式不正确';
                    }
                }
            },
            // 交房日期
            customDate2: function(value, item) {
                if(!$.trim(value) || Regex.customDate.reg.test(value)) {

                } else {
                    return Regex.customDate.msg;
                }
            }

        });

        // 收费管理模式
        form.on('select(chargemanagemode)', function(data){
            if(data.value == '0') {
                // 系统不管理房租收费
                $('.chargeDiv').addClass('hidden');
            } else {
                $('.chargeDiv').removeClass('hidden');
            }
        });

        // 园区类型
        form.on('radio(parktype)', function(data) {
            var type = data.value;
            if(type == '4') {
                $('.signDiv').addClass('hidden');
                // $('.ownerareaDiv').addClass('hidden');
            } else {
                $('.signDiv').removeClass('hidden');
                // $('.ownerareaDiv').removeClass('hidden');
            }
        });

        // 房源业态
        form.on('radio(houseStatus)', function(data) {
            var type = data.value;

            if(type == '2') {
                // 按工位租赁
                $('.rentunitDiv').addClass('hidden');
                // if(location.pathname == '/settingpark/edit') {
                //     // 编辑
                //     $('input[name=rentunit]').prop('checked', false);
                //     $('input[name=rentunit]').eq(1).prop('checked', true);
                // }
            } else {
                $('.rentunitDiv').removeClass('hidden');
            }
        });
    }

    function getUnitStr(unit) {
        var str = '元/㎡/天';
        if(unit == '2') {
            str = '元/㎡/月';
        }
        return str;
    }

    $(function() {
        init();

        $(document).on('click', '.ajaxHref', function() {
            var url = $(this).attr('data-page-url');
            window.location.href = url;
            // Common.renderAjaxBody(url, function() {
            //     init();
            // })
        });
        $(document).on('click', '.ajaxEditHref', function() {
            var url = $(this).attr('data-page-url');
            Common.renderAjaxBody(url, function() {
                init();
            })
        });

        // $(document).on('change', 'input[name=ownerarea]', function () {
        //     var $o = $(this);
        //     if(!Regex.square.reg.test($o.val())) {
        //         Dialog.errorDialog(Regex.square.msg, function () {
        //             $o.val('');
        //             $o.focus();
        //         });
        //     }
        // });

        // 是否可添加园区
        $(document).on('click', '.ajaxCanAdd', function () {
            var url = $(this).attr('data-url');
            Req.getReq(url, function (res) {
                if(res.status) {
                    window.location.href = res.data.url;
                } else {
                    Dialog.tipDialog({
                        title: '友情提醒',
                        area: ['480px', 'auto'],
                        content: '<p>当前可用园区数为0，你可以购买之后再添加园区。官方客服电话：</p>' +
                            '<p style="text-align: center;">400-886-0601</p>' ,
                        yesFn: function(index, layero) {
                            layer.close(index);
                        }
                    });
                }
            })
        });

        // 管理房源
        $(document).on('click', '.ajaxTohouse', function () {
            var url = $(this).attr('data-url');
            Req.getReq(url, function (res) {
                if(res.status) {
                    window.location.href = res.data.url;
                } else {
                    Dialog.tipDialog({
                        title: '友情提醒',
                        content: res.msg,
                        yesFn: function(index, layero) {
                            layer.close(index);
                        }
                    });
                }
            })
        });

        function doSubmit(cb) {
            // 创建地理编码实例
            var myGeo = new BMap.Geocoder();
            var point = $('#pointInput').val().split(',');
            // 根据坐标得到地址描述
            myGeo.getLocation(new BMap.Point(point[0], point[1]), function(result){
                if (result){
                    var city = result.addressComponents.city;
                    var compareCity = '';
                    var zxs = ['北京市', '重庆市', '天津市', '上海市'];     // 取省市区组件的province框的值

                    if($.inArray(city, zxs) != -1) {
                        compareCity = $('select[name=province] option:selected').text();
                    } else {
                        compareCity = $('select[name=city] option:selected').text();
                    }

                    if(city != compareCity) {
                        Dialog.errorDialog('当前园区所属的城市与坐标设置定位的城市不一致');
                        return false;
                    }
                    cb && cb();
                }
            });
        }

        // 提交(layui自带模式)
        form.on('submit(demo1)', function(data){
            var url = $('#parksubmit').attr('data-url'),
                $form = $('form');
            var param = data.field;

            var data = $form.serializeArray();

            // bug16464
            if($('input[name=departIds]').length && !$('input[name=departIds]').val()) {
                Dialog.errorDialog('请设置所属部门');
                return false;
            }

            // 合同扫描件
            if($('.upload-list').is(":visible")) {
                if(!$('.upload-list').find('.upload-file-item').length) {
                    layer.msg('未上传合同扫描件', {icon: 5, shift: 6});
                    return false;
                }
            }

            // 合同周期
            var $beginDate = $('input[name=contarctStart]'),
                $endDate = $('input[name=contarctEnd]');

            if($beginDate.is(":visible")) {
                if($beginDate.length && $endDate.length) {
                    if($beginDate.val() && $endDate.val()) {
                        var $beginDate = $('input[name=contarctStart]'),
                            $endDate = $('input[name=contarctEnd]');

                        if(!Common.Util.compareDate($beginDate.val(), $endDate.val())) {
                            Dialog.errorDialog("合同周期开始日期不得大于结束日期");
                            $beginDate.addClass('layui-form-danger').focus();
                            return false;
                        }
                    }
                }
            }

            // 租金单位将由元/㎡/月改为元/㎡/天，此更改将导致该园区已设置的房源底价全部清除并需要重新设置。确定要继续吗？
            var houseStatus = $('input[name=houseStatus]:checked').val(),
                oldParkUnit = $('input[name=oldParkUnit]').val(),
                curRentUnit = $('input[name=rentunit]:checked').val();

            if(houseStatus == '2') {
                // 按工位租赁
                curRentUnit = '2';
            }

            doSubmit(function () {
                if(location.pathname == '/settingpark/add') {
                    // 添加
                    Req.postReq(url, data, function(res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                if(res.data.pageUrl) {
                                    window.location.href = res.data.pageUrl;
                                }
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                } else {
                    // 编辑
                    if(oldParkUnit && (curRentUnit != oldParkUnit)) {
                        Dialog.confirmDialog({
                            title: '提示',
                            content: '租金单位将由'+ getUnitStr(oldParkUnit) +'改为'+ getUnitStr(curRentUnit) +'，此更改将导致该园区已设置的房源底价全部清除并需要重新设置。确定要继续吗？',
                            yesFn: function (index, layero) {
                                Req.postReq(url, data, function(res) {
                                    if(res.status) {
                                        Dialog.successDialog(res.msg, function () {
                                            if(res.data.pageUrl) {
                                                window.location.href = res.data.pageUrl;
                                            }
                                        });
                                    } else {
                                        Dialog.errorDialog(res.msg);
                                    }
                                });
                            }
                        })
                    } else {
                        Req.postReq(url, data, function(res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    if(res.data.pageUrl) {
                                        window.location.href = res.data.pageUrl;
                                    }
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                    }
                }
            });

            // Req.postReqCommon(url, data);

            return false;
        });

        /**
         * 地图
         */
        //回车搜索
        $(document).on('keydown', '#searchMapKeyword', function(e) {
            if (event.keyCode == 13) {
                if ($('#searchMapKeyword').is(':focus')) {
                    $('#localsearch').trigger('click');
                }
            }
        });

        $(document).on('click', '#localsearch', function() {
            // local.search($('#searchMapKeyword').val());
            local.search($('#searchMapKeyword').val());
        });

        $(document).on('click', '.ajaxOpenMap', function() {
            var longitude = $(this).attr('data-long'),
                latitude = $(this).attr('data-lat');

            layer.open({
                id: 1003,
                type: 5,   // 表单超出部分不被遮挡
                title: '查看地图',
                area: ['700px', '360px'],
                btn: ['我知道了'],
                content: '<div class="map" id="viewMap" style="width:700px;height:360px;"></div>',
                success: function(){
                    initMap('viewMap', longitude, latitude);
                },
                yes: function(){}
            });
        });

        // 部门
        $(document).on('click', '.selectDepat', function() {
            var $deptIds = $('input[name=departIds]'),
                $deptDiv = $('.departNames');

            if(deptList && deptList.length) {
                if(!$deptIds.val()) {
                    // 未添加过
                    DPTree({
                        type: false,
                        data: deptList,
                        callback: function(instance) {
                            $deptDiv.html(instance.didTextArr.join(','));
                            $deptIds.val(instance.didArr.join(','));
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                    });
                } else  {
                    // 已添加过且再次添加，需要回填值
                    DPTree({
                        type: false,
                        data: deptList,
                        callback: function(instance) {
                            $deptDiv.html(instance.didTextArr.join(','));
                            $deptIds.val(instance.didArr.join(','));
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                        edit: $deptIds.val().split(',')
                    });
                }
            }
        });

        // 导出
        $(document).on('click', '.exportData', function() {
           var url = $(this).attr('data-url');
           Req.getReq(url, function(res) {
                if(res.status) {
                    Dialog.successDialog(res.msg);
                } else {
                    Dialog.errorDialog(res.msg);
                }
           });
        });

        // 冻结
        $(document).on('click', '.ajaxFreeze', function() {
            var url = $(this).attr('data-url'),
                message = $(this).attr('data-message');
            Dialog.confirmDialog({
                title: '提示',
                content: message,
                yesFn: function(index, layero) {
                    Req.getReq(url, function(res) {
                       if(res.status) {
                           Dialog.successDialog(res.msg);
                           layer.close(index);
                           window.location.reload();
                       } else {
                           Dialog.errorDialog(res.msg);
                       }
                    });
                }
            });
        });

        // 导出
        $(document).on('click', '.parkExport', function () {
            var url = $(this).attr('data-url'),
                key = $(this).attr('data-key');

            var param = ListModule.getSplitParam();
            param.key = key;
            param.typeKey = $('select[name=type] option:selected').text() || '';
            param.statusKey = $('select[name=status] option:selected').text() || '';

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


        layEventHandle();

        // 表格首行首列固定
        $('#content').scroll(function() {
            $('#topTitle').scrollLeft($('#content').scrollLeft());
            $('#leftTitle').scrollTop($('#content').scrollTop());
        });
    });
});