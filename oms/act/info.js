/**
 * 园企互动-园区活动详情
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager'], function() {
    var $ = layui.jquery,
        form = layui.form,
        $form = $('form'),
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;

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

        longitude = longitude == undefined ? 120.620194 : longitude;
        latitude = latitude == undefined ? 31.318049 : latitude;

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


    // 获取分页参数
    function getSplitParam() {
        var param = {
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };

        return param;
    }

    function init() {
        if($('#settingMap').length) {
            setTimeout(function() {
                var longitude = $('#longitude').val(),
                    latitude = $('#latitude').val();
                initMap('settingMap', longitude, latitude);
            }, 100);
        }

        if($('#pageAjaxUrl').length) {
            var pageAjaxUrl = $('#pageAjaxUrl').val();

            Pager.initPager({
                type: 1,
                url: pageAjaxUrl,
                callback: getSplitParam
            });
        }
    }

    $(function() {
        init();
        
        $(document).on('click', '.ajaxDel', function () {
            var url = $(this).attr('data-url');
            Dialog.delDialog({
                yesFn: function (index, layero) {
                    Req.getReqCommon(url);
                }
            })
        });

        // 退款
        $(document).on('click', '.refund', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                name = $o.attr('data-name');

            Dialog.confirmDialog({
                title: '提醒',
                content: '退款金额将会原路返回到原支付账号，确定要对【'+ name +'】的报名费用进行退款操作？',
                yesFn: function (index, layero) {
                    Req.getReq(url, function(res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                var param  = getSplitParam();
                                Pager.renderPager(param);
                                layer.close(index);
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                }
            });
        });
    });
});